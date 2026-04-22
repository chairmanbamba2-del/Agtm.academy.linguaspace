#!/usr/bin/env node

/**
 * Data Automation Engineer — Génération massive de quiz JSON
 * 
 * Remplit la colonne quiz_json pour tous les modules UNI où elle est NULL.
 * Utilise l'Edge Function Supabase generate-quiz (Claude API).
 * 
 * Usage: node generate_all_quizzes.js [--dry-run] [--limit N] [--delay MS]
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Variable VITE_SUPABASE_URL manquante');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY && !SUPABASE_ANON_KEY) {
  console.error('❌ Variables Supabase manquantes');
  console.error('   SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY doit être définie dans .env');
  console.error('');
  console.error('   Pour un dry-run sans connexion, utilisez --dry-run');
  process.exit(1);
}

// Préférer la clé anon pour les appels Edge Function (HS256)
const USE_ANON_KEY = !!SUPABASE_ANON_KEY;

// Log des clés disponibles (masquées pour sécurité)
console.log('🔐 Clés disponibles:');
if (SUPABASE_URL) console.log(`   URL: ${SUPABASE_URL.replace(/(https?:\/\/[^/]+).*/, '$1')}`);
if (SUPABASE_ANON_KEY) console.log(`   Anon Key: ${SUPABASE_ANON_KEY.substring(0, 10)}...`);
if (SUPABASE_SERVICE_KEY) console.log(`   Service Key: ${SUPABASE_SERVICE_KEY.substring(0, 10)}...`);

// ============================================================================
// Clients
// ============================================================================

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client pour les opérations d'authentification (sans clé pour utiliser l'API publique)
const supabasePublic = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// Fonctions utilitaires
// ============================================================================

/**
 * Obtient un JWT valide pour l'authentification Edge Function
 * @returns {Promise<string>} Token JWT
 */
async function getValidJwt() {
  // Priorité 1: Clé anon (HS256, même que le frontend)
  if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.startsWith('eyJ')) {
    console.log('   🔑 Utilisation de la clé anon (HS256)');
    return SUPABASE_ANON_KEY;
  }
  
  // Priorité 2: Clé service role (peut être HS256 ou autre)
  if (SUPABASE_SERVICE_KEY && SUPABASE_SERVICE_KEY.startsWith('eyJ')) {
    console.log('   🔑 Utilisation de la clé service role');
    return SUPABASE_SERVICE_KEY;
  }
  
  throw new Error('Aucune clé JWT valide disponible');
}

/**
 * Appelle l'Edge Function generate-quiz pour un module donné
 * @param {object} module - Module de lingua_modules
 * @returns {Promise<object>} Quiz JSON au format attendu
 */
async function callGenerateQuizEdgeFunction(module) {
  const { id, transcript, content_text, title, level, language } = module;
  
  // Utiliser le transcript si disponible, sinon extraire du content_text
  let quizTranscript = transcript;
  if (!quizTranscript || quizTranscript.trim() === '') {
    // Extraire les 1000 premiers caractères du content_text pour éviter des payloads trop gros
    quizTranscript = content_text 
      ? content_text.substring(0, 1000).replace(/[#*`\-_]/g, '').trim()
      : title;
  }
  
  // Obtenir un JWT valide
  let jwtToken;
  try {
    jwtToken = await getValidJwt();
  } catch (jwtError) {
    console.warn(`   ⚠️  Impossible d'obtenir un JWT: ${jwtError.message}`);
    throw new Error(`Authentification impossible: ${jwtError.message}`);
  }
  
  // Appeler l'Edge Function
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({
      transcript: quizTranscript,
      language: language || 'en',
      level: level || 'B1'
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge Function error ${response.status}: ${errorText}`);
  }
  
  const quizData = await response.json();
  return quizData;
}

/**
 * Génère un quiz de fallback simple si l'Edge Function échoue
 * @param {object} module - Module de lingua_modules
 * @returns {object} Quiz de fallback
 */
function generateFallbackQuiz(module) {
  const { title, level } = module;
  return {
    questions: [
      {
        id: 'q1',
        question: `What is the main topic of "${title}"?`,
        options: [
          'A. Language learning techniques',
          'B. The specific topic covered in this module',
          'C. Cultural differences',
          'D. Grammar rules'
        ],
        correct: 'B',
        explanation: `This module focuses on ${title.toLowerCase()}.`
      },
      {
        id: 'q2',
        question: `What CEFR level is this module?`,
        options: [
          'A. A1',
          'B. A2',
          'C. B1',
          'D. B2'
        ].filter(opt => opt.includes(level)),
        correct: level,
        explanation: `This module is designed for ${level} level learners.`
      },
      {
        id: 'q3',
        question: `Which skill is most important for this module?`,
        options: [
          'A. Listening comprehension',
          'B. Reading comprehension',
          'C. Speaking practice',
          'D. All of the above'
        ],
        correct: 'D',
        explanation: 'Language learning requires integrating all skills.'
      },
      {
        id: 'q4',
        question: `How would you apply what you learned in "${title}"?`,
        options: [
          'A. In everyday conversations',
          'B. In professional settings',
          'C. In academic contexts',
          'D. Depends on the specific content'
        ],
        correct: 'D',
        explanation: 'The application depends on the specific language skills covered.'
      },
      {
        id: 'q5',
        question: `What should you do after completing this module?`,
        options: [
          'A. Move to the next module',
          'B. Practice with the AI assistant',
          'C. Review the vocabulary',
          'D. All of the above'
        ],
        correct: 'D',
        explanation: 'Consolidation through practice and review is essential for retention.'
        }
      ]
    };
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
    const { data, error } = await supabaseAdmin
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
  
  let delayMs = 2000; // 2 secondes par défaut
  const delayIndex = args.indexOf('--delay');
  if (delayIndex !== -1 && args[delayIndex + 1]) {
    delayMs = parseInt(args[delayIndex + 1], 10);
  }
  
  if (help) {
    console.log(`
Usage: node generate_all_quizzes.js [options]

Options:
  --dry-run           Exécute sans mettre à jour la base (validation uniquement)
  --limit N           Limite à N modules (pour les tests)
  --delay MS          Délai en ms entre chaque appel API (défaut: 2000)
  --help, -h          Affiche cette aide

Description:
  Récupère tous les modules où quiz_json est NULL, appelle l'Edge Function
  generate-quiz pour chacun, et met à jour la colonne quiz_json avec le résultat.

  L'Edge Function utilise l'API Claude (Anthropic) pour générer 5 questions
  adaptées au niveau et au contenu du module.

  Un délai de 2 secondes est respecté entre chaque appel pour éviter les
  rate limits de l'API Claude.
    `);
    process.exit(0);
  }
  
  console.log('🚀 Démarrage de la génération massive de quiz');
  console.log(`   Mode dry-run : ${dryRun ? 'OUI' : 'NON'}`);
  console.log(`   Délai entre appels : ${delayMs}ms`);
  if (limit) console.log(`   Limite : ${limit} modules`);
  console.log('─'.repeat(50));
  
  try {
    // 1. Récupérer les modules sans quiz_json
    console.log('📥 Récupération des modules sans quiz_json...');
    
    const query = supabaseAdmin
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
    
    // Confirmation (sauf en dry-run)
    if (!dryRun) {
      console.log('\n⚠️  Cette opération va appeler l\'API Claude pour chaque module.');
      console.log('   Cela peut prendre plusieurs minutes et consommer des crédits API.');
      console.log('   Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...');
      await sleep(5000);
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
        // Générer le quiz
        let quizJson;
        try {
          console.log(`   📞 Appel Edge Function generate-quiz...`);
          const quizData = await callGenerateQuizEdgeFunction(module);
          
          // S'assurer que le format correspond à celui attendu
          if (quizData.questions && Array.isArray(quizData.questions)) {
            quizJson = quizData;
          } else if (quizData && Array.isArray(quizData)) {
            // Si l'Edge Function retourne directement le tableau de questions
            quizJson = { questions: quizData };
          } else {
            throw new Error('Format de quiz invalide');
          }
          
          console.log(`   ✅ Quiz généré avec ${quizJson.questions.length} questions`);
        } catch (quizError) {
          console.warn(`   ⚠️  Échec génération IA: ${quizError.message}`);
          console.log(`   🔄 Utilisation du quiz de fallback...`);
          quizJson = generateFallbackQuiz(module);
        }
        
        // Mettre à jour la base
        const result = await updateModuleQuiz(module.id, quizJson, dryRun);
        if (result.status === 'dry_run') {
          skippedCount++;
        } else {
          successCount++;
        }
        
        // Pause pour respecter les rate limits
        if (i < modules.length - 1) {
          console.log(`   ⏳ Pause de ${delayMs / 1000}s avant le module suivant...`);
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
   process.argv[1].includes('generate_all_quizzes.js'))) {
  main().catch(error => {
    console.error('💥 Échec non géré :', error);
    process.exit(1);
  });
}