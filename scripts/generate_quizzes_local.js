#!/usr/bin/env node

/**
 * Data Automation Engineer — Génération locale de quiz JSON
 * 
 * Remplit la colonne quiz_json pour tous les modules UNI où elle est NULL.
 * Génère des quiz intelligents basés sur le contenu localement (sans API Claude).
 * 
 * Usage: node generate_quizzes_local.js [--dry-run] [--limit N] [--delay MS]
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { setTimeout as sleep } from 'timers/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables Supabase manquantes');
  console.error('   VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies dans .env');
  process.exit(1);
}

// ============================================================================
// Client Supabase
// ============================================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// Génération intelligente de quiz
// ============================================================================

/**
 * Extrait les mots-clés du transcript (format LEXIQUE)
 * @param {string} transcript - Transcript au format "LEXIQUE — Titre\n\n1. MOT (n.) — Définition"
 * @returns {Array<{word: string, pos: string, definition: string}>} Liste des mots
 */
function extractKeywordsFromTranscript(transcript) {
  const keywords = [];
  
  if (!transcript || !transcript.includes('LEXIQUE')) {
    return keywords;
  }
  
  const lines = transcript.split('\n');
  for (const line of lines) {
    // Format: "1. TO TABLE (v.) — Ambiguous false friend: in British English = to put on the agenda; in American English = to postpone."
    const match = line.match(/^\d+\.\s+([A-Z\s]+)\s+\(([a-z.]+)\)\s+—\s+(.+)$/);
    if (match) {
      const [, word, pos, definition] = match;
      keywords.push({
        word: word.trim(),
        pos: pos.trim(),
        definition: definition.trim()
      });
    }
  }
  
  return keywords;
}

/**
 * Extrait des phrases clés du content_text (markdown)
 * @param {string} contentText - Contenu markdown du module
 * @returns {string[]} Phrases importantes
 */
function extractKeyPhrases(contentText) {
  if (!contentText) return [];
  
  // Supprimer les titres (lignes commençant par #)
  let text = contentText.replace(/^#+\s+.+$/gm, '');
  // Supprimer le markdown bold/italic
  text = text.replace(/[*_`]/g, '');
  // Séparer en phrases
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Prendre les 5 premières phrases significatives
  return sentences.slice(0, 5).map(s => s.trim());
}

/**
 * Génère un quiz intelligent basé sur le contenu du module
 * @param {object} module - Module de lingua_modules
 * @returns {object} Quiz JSON au format attendu
 */
function generateSmartQuiz(module) {
  const { title, level, language, transcript, content_text } = module;
  
  const keywords = extractKeywordsFromTranscript(transcript);
  const phrases = extractKeyPhrases(content_text);
  
  // Questions par défaut selon le niveau
  const questions = [];
  
  // Question 1: Vocabulaire (basé sur le premier mot-clé)
  if (keywords.length > 0) {
    const kw = keywords[0];
    questions.push({
      id: 'q1',
      question: `What does "${kw.word}" mean in the context of ${title}?`,
      options: [
        `A. ${kw.definition}`,
        'B. A grammatical error',
        'C. A type of punctuation',
        'D. An informal greeting'
      ],
      correct: 'A',
      explanation: kw.definition
    });
  } else {
    // Fallback si pas de mots-clés
    questions.push({
      id: 'q1',
      question: `What is the main focus of "${title}"?`,
      options: [
        'A. Grammar rules',
        'B. Vocabulary building',
        'C. Listening comprehension',
        'D. All language skills'
      ],
      correct: 'D',
      explanation: `This ${level}-level module covers multiple language skills.`
    });
  }
  
  // Question 2: Niveau CEFR
  const levelMap = { A1: 'A', A2: 'B', B1: 'C', B2: 'D', C1: 'E', C2: 'F' };
  const correctLetter = levelMap[level] || 'A';
  questions.push({
    id: 'q2',
    question: `What CEFR level is this module designed for?`,
    options: ['A. A1', 'B. A2', 'C. B1', 'D. B2', 'E. C1', 'F. C2'],
    correct: correctLetter,
    explanation: `This module targets ${level} level learners according to the Common European Framework of Reference for Languages.`
  });
  
  // Question 3: Application pratique
  if (phrases.length > 0) {
    const phrase = phrases[0];
    questions.push({
      id: 'q3',
      question: `Which of these is a key concept in "${title}"?`,
      options: [
        `A. ${phrase.substring(0, 60)}...`,
        'B. Memorizing irregular verbs',
        'C. Understanding complex literary texts',
        'D. Writing academic essays'
      ],
      correct: 'A',
      explanation: `This concept is fundamental to understanding ${title.toLowerCase()}.`
    });
  } else {
    questions.push({
      id: 'q3',
      question: `How would you apply what you learn in "${title}"?`,
      options: [
        'A. In everyday conversations',
        'B. In professional settings',
        'C. In academic contexts',
        'D. All of the above'
      ],
      correct: 'D',
      explanation: 'Language skills are transferable across different contexts.'
    });
  }
  
  // Question 4: Compétence linguistique
  const skill = level.startsWith('A') ? 'basic communication' :
                level.startsWith('B') ? 'intermediate fluency' :
                'advanced proficiency';
  
  questions.push({
    id: 'q4',
    question: `Which language skill is most emphasized at ${level} level?`,
    options: [
      'A. Understanding simple phrases and expressions',
      'B. Describing experiences and events',
      'C. Producing clear, detailed text on complex subjects',
      'D. Understanding implicit meaning'
    ],
    correct: level === 'A1' || level === 'A2' ? 'A' :
             level === 'B1' || level === 'B2' ? 'B' :
             level === 'C1' ? 'C' : 'D',
    explanation: `At ${level} level, learners focus on ${skill}.`
  });
  
  // Question 5: Évaluation
  if (keywords.length > 1) {
    const kw1 = keywords[0];
    const kw2 = keywords[1] || keywords[0];
    questions.push({
      id: 'q5',
      question: `What distinguishes "${kw1.word}" from similar terms?`,
      options: [
        `A. ${kw1.definition.substring(0, 70)}...`,
        `B. ${kw2.definition.substring(0, 70)}...`,
        'C. It is only used in formal writing',
        'D. It has no special distinction'
      ],
      correct: 'A',
      explanation: kw1.definition
    });
  } else {
    questions.push({
      id: 'q5',
      question: `What is the best way to practice after completing "${title}"?`,
      options: [
        'A. Review the vocabulary regularly',
        'B. Practice with the AI assistant',
        'C. Complete additional exercises',
        'D. All of the above'
      ],
      correct: 'D',
      explanation: 'Consistent practice and review are essential for language acquisition.'
    });
  }
  
  return { questions };
}

/**
 * Met à jour la colonne quiz_json d'un module
 * @param {string} moduleId - ID du module
 * @param {object} quizJson - Données du quiz
 * @param {boolean} dryRun - Si true, ne pas exécuter
 * @returns {Promise<object>} Résultat
 */
async function updateModuleQuiz(moduleId, quizJson, dryRun = false) {
  if (dryRun) {
    console.log(`   🟡 DRY RUN - Quiz JSON prêt pour mise à jour`);
    return { status: 'dry_run' };
  }
  
  try {
    const { data, error } = await supabase
      .from('lingua_modules')
      .update({ quiz_json: quizJson })
      .eq('id', moduleId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`   ✅ Quiz JSON mis à jour en base`);
    return { status: 'updated', data };
  } catch (error) {
    console.error(`   ❌ Erreur mise à jour : ${error.message}`);
    throw error;
  }
}

/**
 * Affiche une barre de progression simple
 * @param {number} current - Index actuel
 * @param {number} total - Total d'éléments
 * @param {string} label - Libellé à afficher
 */
function showProgress(current, total, label) {
  const percent = Math.round((current / total) * 100);
  const barLength = 30;
  const filled = Math.round((current / total) * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  
  process.stdout.write(`\r[${bar}] ${percent}% - ${current}/${total} - ${label}`);
  if (current === total) {
    process.stdout.write('\n');
  }
}

// ============================================================================
// Logique principale
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help') || args.includes('-h');
  
  // Récupérer les paramètres optionnels
  let limit = null;
  const limitIndex = args.indexOf('--limit');
  if (limitIndex !== -1 && args[limitIndex + 1]) {
    limit = parseInt(args[limitIndex + 1], 10);
  }
  
  let delayMs = 500; // 0.5 seconde par défaut (local, pas d'API)
  const delayIndex = args.indexOf('--delay');
  if (delayIndex !== -1 && args[delayIndex + 1]) {
    delayMs = parseInt(args[delayIndex + 1], 10);
  }
  
  if (help) {
    console.log(`
Usage: node generate_quizzes_local.js [options]

Options:
  --dry-run           Exécute sans mettre à jour la base (validation uniquement)
  --limit N           Limite à N modules (pour les tests)
  --delay MS          Délai en ms entre chaque mise à jour (défaut: 500)
  --help, -h          Affiche cette aide

Description:
  Récupère tous les modules où quiz_json est NULL, génère un quiz intelligent
  basé sur le contenu (transcript, content_text, titre, niveau), et met à jour
  la colonne quiz_json avec le résultat.

  La génération est locale, sans appel API Claude. Les quiz sont adaptés au
  niveau CEFR et au sujet du module.
    `);
    process.exit(0);
  }
  
  console.log('🚀 Démarrage de la génération locale de quiz');
  console.log(`   Mode dry-run : ${dryRun ? 'OUI' : 'NON'}`);
  if (limit) console.log(`   Limite : ${limit} modules`);
  console.log('─'.repeat(50));
  
  try {
    // 1. Récupérer les modules sans quiz_json
    console.log('📥 Récupération des modules sans quiz_json...');
    
    const query = supabase
      .from('lingua_modules')
      .select('*')
      .is('quiz_json', null)
      .order('language')
      .order('order_num');
    
    if (limit) query.limit(limit);
    
    const { data: modules, error: fetchError } = await query;
    
    if (fetchError) {
      throw new Error(`Erreur récupération modules: ${fetchError.message}`);
    }
    
    if (!modules || modules.length === 0) {
      console.log('🎉 Tous les modules ont déjà un quiz_json !');
      process.exit(0);
    }
    
    console.log(`📊 ${modules.length} module(s) à traiter`);
    
    // Afficher un aperçu des premiers modules
    console.log('\n🔍 Premiers modules :');
    modules.slice(0, 5).forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.title} (${m.language.toUpperCase()} ${m.level})`);
    });
    if (modules.length > 5) {
      console.log(`   ... et ${modules.length - 5} autres`);
    }
    
    // 2. Traiter chaque module
    console.log('\n' + '='.repeat(50));
    console.log('🚀 GÉNÉRATION DES QUIZ');
    console.log('='.repeat(50));
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      const current = i + 1;
      const total = modules.length;
      
      console.log(`\n🔷 [${current}/${total}] Module: "${module.title}" (${module.language.toUpperCase()} ${module.level})`);
      showProgress(current, total, module.title);
      
      try {
        // Générer le quiz localement
        console.log(`   🧠 Génération du quiz intelligent...`);
        const quizJson = generateSmartQuiz(module);
        
        console.log(`   ✅ Quiz généré avec ${quizJson.questions.length} questions`);
        
        // Mettre à jour la base
        const result = await updateModuleQuiz(module.id, quizJson, dryRun);
        if (result.status === 'dry_run') {
          skippedCount++;
        } else {
          successCount++;
        }
        
        // Petite pause pour éviter de surcharger la base
        if (i < modules.length - 1 && delayMs > 0) {
          await sleep(delayMs);
        }
        
      } catch (moduleError) {
        errorCount++;
        console.error(`   ❌ Échec traitement module: ${moduleError.message}`);
        // Continuer avec le module suivant
      }
    }
    
    // 3. Résumé
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DE LA GÉNÉRATION');
    console.log('='.repeat(50));
    console.log(`✅ ${successCount} quiz généré(s) et mis à jour(s)`);
    console.log(`⚠️  ${skippedCount} module(s) ignoré(s) (dry-run)`);
    console.log(`❌ ${errorCount} erreur(s)`);
    
    if (successCount > 0 && !dryRun) {
      console.log('\n🎉 Génération terminée avec succès !');
      console.log(`   Les quiz sont maintenant disponibles directement dans quiz_json.`);
      console.log(`   Module.jsx utilisera ces données sans appeler l'Edge Function.`);
    }
    
  } catch (error) {
    console.error('\n💥 ERREUR CRITIQUE :');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

// ============================================================================
// Point d'entrée
// ============================================================================

if (import.meta.url.startsWith('file://') && 
  (import.meta.url.includes(process.argv[1].replace(/\\/g, '/')) || 
   process.argv[1].includes('generate_quizzes_local.js'))) {
  main().catch(error => {
    console.error('💥 Échec non géré :', error);
    process.exit(1);
  });
}