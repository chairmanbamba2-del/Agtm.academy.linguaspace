#!/usr/bin/env node

/**
 * Data Engineer / Automation Specialist
 * Script de peuplement massif pour lingua_modules
 * 
 * Usage: node populate_modules.js [--file modules.json] [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialise le client Supabase (ou un mock en dry-run)
 * @param {boolean} dryRun - Si true, retourne un client mock
 * @returns {object} Client Supabase ou mock
 */
function initSupabaseClient(dryRun = false) {
  if (dryRun) {
    console.log('🔧 Mode dry-run : utilisation d\'un client mock');
    // Retourne un objet mock avec les méthodes nécessaires
    return {
      from: () => ({
        upsert: () => Promise.resolve({ data: null, error: null }),
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) })
      })
    };
  }

  // Charger les variables d'environnement
  dotenv.config();

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Variables Supabase manquantes.');
    console.error('   Définissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY ou SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY');
    console.error('   dans un fichier .env à la racine du projet.');
    console.error('');
    console.error('   Pour un dry-run sans connexion, utilisez --dry-run');
    process.exit(1);
  }

  console.log(`🔗 Connexion à Supabase : ${SUPABASE_URL.replace(/(https?:\/\/[^/]+).*/, '$1')}`);
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ──────────────────────────────────────────────────────────────
// Fonctions utilitaires
// ──────────────────────────────────────────────────────────────

/**
 * Génère un slug URL-friendly à partir du titre et du niveau
 * @param {string} title - Titre du module
 * @param {string} level - Niveau CEFR (A1, B2, etc.)
 * @returns {string} slug formaté
 */
function generateSlug(title, level) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')        // Supprime les caractères spéciaux
    .replace(/\s+/g, '-')                 // Remplace les espaces par des tirets
    .replace(/-+/g, '-')                  // Évite les tirets multiples
    .replace(/^-|-$/g, '')                // Supprime les tirets en début/fin
    .concat('-', level.toLowerCase());    // Ajoute le niveau
}

/**
 * Calcule la récompense XP basée sur la durée
 * @param {number} durationMin - Durée en minutes
 * @returns {number} XP reward
 */
function calculateXpReward(durationMin) {
  const baseXp = 100;
  const xpPerMinute = 5;
  return baseXp + (durationMin || 15) * xpPerMinute;
}

/**
 * Transforme un Blueprint JSON de Claude en ligne lingua_modules
 * @param {object} blueprint - Objet blueprint au format Claude
 * @param {object} overrides - Valeurs supplémentaires (language, order_num, etc.)
 * @returns {object} Données prêtes pour l'insertion
 */
function transformBlueprintToModule(blueprint, overrides = {}) {
  const {
    title,
    level,
    description,
    contentText,     // Markdown complet
    transcript,      // Lexique
    quiz,            // Questions JSON (optionnel)
    durationMin = 25,
    contentType = 'lesson'
  } = blueprint;

  const {
    language = 'en',
    order_num = 1,
    is_published = true
  } = overrides;

  const slug = generateSlug(title, level);
  const xp_reward = calculateXpReward(durationMin);

  return {
    language,
    level,
    order_num,
    title,
    description,
    content_type: contentType,
    content_text: contentText,
    transcript,
    duration_min: durationMin,
    is_published,
    slug,
    xp_reward,
    quiz_json: quiz || null,  // Store quiz JSON for direct use in Module.jsx
    // Note: content_url peut être ajouté si disponible
    // content_url: blueprint.contentUrl
  };
}

/**
 * Insère ou met à jour un module en base de données
 * @param {object} supabase - Client Supabase
 * @param {object} moduleData - Données du module
 * @param {boolean} dryRun - Si true, n'exécute pas l'insertion
 * @returns {Promise<object>} Résultat de l'opération
 */
async function upsertModule(supabase, moduleData, dryRun = false) {
  const { slug, language, title, xp_reward, quiz_json } = moduleData;

  console.log(`📦 Traitement : "${title}" (${language.toUpperCase()} ${moduleData.level})`);

  if (dryRun) {
    console.log(`   🟡 DRY RUN - Slug: ${slug}, XP: ${xp_reward}, Quiz: ${quiz_json ? 'présent' : 'absent'}`);
    return { status: 'dry_run', slug };
  }

  try {
    // Utiliser upsert avec la contrainte unique language+order_num
    // La contrainte lingua_modules_language_order_num_key existe
    const conflictCondition = { 
      onConflict: 'language,order_num', 
      ignoreDuplicates: false 
    };
    
    const { data, error } = await supabase
      .from('lingua_modules')
      .upsert(moduleData, conflictCondition)
      .select()
      .single();

    if (error) {
      // Si erreur de colonne manquante dans le cache, retirer les colonnes problématiques
      if (error.message.includes('Could not find the') && 
          (error.message.includes('\'slug\' column') || 
           error.message.includes('\'xp_reward\' column') ||
           error.message.includes('\'quiz_json\' column'))) {
        console.log(`   🔄 Colonne manquante dans le cache, retrait des colonnes problématiques`);
        const { slug, xp_reward, quiz_json, ...restData } = moduleData;
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('lingua_modules')
          .upsert(restData, { onConflict: 'language,title', ignoreDuplicates: false })
          .select()
          .single();
        if (fallbackError) throw fallbackError;
        console.log(`   ✅ Module inséré/mis à jour sans colonnes problématiques`);
        return { status: 'inserted_without_columns', slug: null, data: fallbackData };
      }
      throw error;
    }

    // Déterminer si c'était une insertion ou une mise à jour
    // (Supabase ne fournit pas cette information directement)
    // Nous pouvons vérifier si le slug était déjà présent en cherchant le module
    const { data: existingData, error: fetchError } = await supabase
      .from('lingua_modules')
      .select('slug, quiz_json')
      .eq('language', language)
      .eq('title', title)
      .maybeSingle();
    
    let status = 'inserted';
    if (fetchError) {
      console.log(`   ℹ️  Impossible de déterminer si insertion ou mise à jour`);
    } else if (existingData) {
      status = 'updated';
      // Vérifier si le quiz_json a été ajouté
      if (quiz_json && !existingData.quiz_json) {
        console.log(`   ✅ Quiz JSON ajouté au module existant`);
      }
    }
    
    console.log(`   ✅ Module ${status === 'updated' ? 'mis à jour' : 'inséré'} (${xp_reward} XP)`);
    return { status, slug, data };

  } catch (error) {
    console.error(`   ❌ Erreur lors de l'upsert : ${error.message}`);
    throw error;
  }
}

/**
 * Valide la structure d'un blueprint
 * @param {object} blueprint - Objet à valider
 * @returns {boolean} true si valide
 */
function validateBlueprint(blueprint) {
  const required = ['title', 'level', 'contentText'];
  const missing = required.filter(field => !blueprint[field]);
  
  if (missing.length > 0) {
    console.error(`   ❌ Blueprint invalide : champs manquants ${missing.join(', ')}`);
    return false;
  }
  
  // Validation du niveau CEFR
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (!validLevels.includes(blueprint.level)) {
    console.error(`   ❌ Niveau invalide : ${blueprint.level}. Doit être parmi ${validLevels.join(', ')}`);
    return false;
  }
  
  return true;
}

// ──────────────────────────────────────────────────────────────
// Exécution principale
// ──────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const fileArgIndex = args.indexOf('--file');
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
Usage: node populate_modules.js [options]

Options:
  --file <path>    Chemin vers le fichier JSON contenant les blueprints (défaut: sample_modules.json)
  --dry-run        Exécute sans insérer en base (validation uniquement)
  --help, -h       Affiche cette aide

Format JSON attendu:
  [
    {
      "title": "Business English: Negotiating a Contract",
      "level": "B2",
      "description": "Master the language of professional negotiation...",
      "contentText": "## Business English... (markdown)",
      "transcript": "LEXIQUE...",
      "durationMin": 25,
      "contentType": "lesson",
      "metadata": {
        "language": "en",
        "order_num": 42,
        "is_published": true
      }
    }
  ]
    `);
    process.exit(0);
  }

  // Déterminer le fichier source
  let filePath;
  if (fileArgIndex !== -1 && args[fileArgIndex + 1]) {
    filePath = args[fileArgIndex + 1];
  } else {
    filePath = join(__dirname, 'sample_modules.json');
  }

  console.log(`🚀 Démarrage du peuplement des modules`);
  console.log(`   Fichier source : ${filePath}`);
  console.log(`   Mode dry-run : ${dryRun ? 'OUI' : 'NON'}`);
  console.log('─'.repeat(50));

  try {
    // Charger les données
    const fileContent = await readFile(filePath, 'utf8');
    const blueprints = JSON.parse(fileContent);

    if (!Array.isArray(blueprints)) {
      throw new Error('Le fichier JSON doit contenir un tableau de blueprints');
    }

    console.log(`📁 ${blueprints.length} blueprint(s) chargé(s)`);

    // Initialiser le client Supabase
    const supabase = initSupabaseClient(dryRun);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Traiter chaque blueprint
    for (const [index, blueprint] of blueprints.entries()) {
      console.log(`\n🔷 Blueprint ${index + 1}/${blueprints.length}`);

      // Validation
      if (!validateBlueprint(blueprint)) {
        errorCount++;
        continue;
      }

      // Transformation
      const moduleData = transformBlueprintToModule(
        blueprint,
        blueprint.metadata || {}
      );

      // Insertion
      try {
        const result = await upsertModule(supabase, moduleData, dryRun);
        if (result.status === 'dry_run') {
          skippedCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`   ⚠️  Échec de l'insertion, poursuite avec le suivant...`);
      }
    }

    // Résumé
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DU PEUPLEMENT');
    console.log('='.repeat(50));
    console.log(`✅ ${successCount} module(s) inséré(s)/mis à jour(s)`);
    console.log(`⚠️  ${skippedCount} module(s) ignoré(s) (dry-run)`);
    console.log(`❌ ${errorCount} erreur(s)`);

    if (!dryRun && successCount > 0) {
      console.log('\n🎉 Peuplement terminé avec succès !');
      console.log(`   Vérifiez les données dans la table lingua_modules.`);
    } else if (dryRun) {
      console.log('\n🔍 Dry-run terminé - Aucune donnée insérée.');
    }

  } catch (error) {
    console.error('\n💥 ERREUR CRITIQUE :');
    console.error(`   ${error.message}`);
    
    if (error.code === 'ENOENT') {
      console.error(`   Le fichier ${filePath} n'existe pas.`);
      console.error(`   Créez un fichier sample_modules.json ou utilisez --file <chemin>`);
    } else if (error instanceof SyntaxError) {
      console.error(`   Fichier JSON invalide. Vérifiez la syntaxe.`);
    }
    
    process.exit(1);
  }
}

// Point d'entrée
// Sous Windows, import.meta.url peut être file:///C:/... tandis que process.argv[1] est C:\...
// Vérifions si ce fichier est le point d'entrée principal
const isMainModule = import.meta.url.startsWith('file://') && 
  (import.meta.url.includes(process.argv[1].replace(/\\/g, '/')) || 
   process.argv[1].includes('populate_modules.js'));

if (isMainModule) {
  main().catch(error => {
    console.error('💥 Échec non géré :', error);
    process.exit(1);
  });
}

export {
  generateSlug,
  calculateXpReward,
  transformBlueprintToModule,
  upsertModule,
  validateBlueprint
};