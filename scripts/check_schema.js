#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  try {
    console.log('🔍 Vérification du schéma de lingua_modules...');
    
    // Vérifier si la table existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('lingua_modules')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erreur lors de l\'accès à la table:', tableError.message);
      return;
    }
    
    console.log(`✅ Table accessible, ${tableInfo?.length || 0} ligne(s)`);
    
    // Vérifier les colonnes spécifiques
    const { data: sample, error: sampleError } = await supabase
      .from('lingua_modules')
      .select('id, title, language, level, slug, xp_reward')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Erreur lors de la sélection des colonnes:', sampleError.message);
      
      // Si erreur de colonne manquante, vérifier quelles colonnes existent
      if (sampleError.message.includes('Could not find the \'slug\' column') ||
          sampleError.message.includes('Could not find the \'xp_reward\' column')) {
        console.log('⚠️  Colonnes slug ou xp_reward manquantes dans le cache du client');
        
        // Essayer de sélectionner toutes les colonnes (pour voir le schéma)
        const { data: allColumns, error: allError } = await supabase
          .from('lingua_modules')
          .select('*')
          .limit(1);
        
        if (allError) {
          console.error('❌ Erreur avec select *:', allError.message);
        } else if (allColumns && allColumns.length > 0) {
          const firstRow = allColumns[0];
          console.log('📋 Colonnes disponibles dans la première ligne:');
          Object.keys(firstRow).forEach(col => console.log(`   - ${col}`));
        }
      }
    } else {
      console.log('✅ Colonnes slug et xp_reward accessibles');
      if (sample && sample.length > 0) {
        const row = sample[0];
        console.log('📋 Exemple de ligne:');
        console.log(`   ID: ${row.id}`);
        console.log(`   Titre: ${row.title}`);
        console.log(`   Slug: ${row.slug || '(null)'}`);
        console.log(`   XP Reward: ${row.xp_reward || '(null)'}`);
      }
    }
    
    // Compter les lignes
    const { count, error: countError } = await supabase
      .from('lingua_modules')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur de comptage:', countError.message);
    } else {
      console.log(`📊 Total des modules dans la table: ${count}`);
    }
    
  } catch (error) {
    console.error('💥 Erreur non gérée:', error.message);
  }
}

checkSchema();