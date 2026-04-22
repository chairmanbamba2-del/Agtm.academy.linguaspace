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

async function checkQuizColumn() {
  try {
    console.log('🔍 Vérification de la colonne quiz_json...');
    
    // Essayer de sélectionner la colonne quiz_json
    const { data, error } = await supabase
      .from('lingua_modules')
      .select('id, title, quiz_json')
      .limit(2);
    
    if (error) {
      if (error.message.includes('Could not find the \'quiz_json\' column')) {
        console.error('❌ Colonne quiz_json non trouvée');
      } else {
        console.error('❌ Erreur:', error.message);
      }
      return;
    }
    
    console.log(`✅ Colonne quiz_json accessible, ${data?.length || 0} ligne(s)`);
    
    if (data && data.length > 0) {
      data.forEach((row, idx) => {
        console.log(`\n📋 Ligne ${idx + 1}:`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Titre: ${row.title}`);
        console.log(`   Quiz JSON: ${row.quiz_json ? 'présent' : 'null/absent'}`);
        if (row.quiz_json) {
          console.log(`   Type: ${typeof row.quiz_json}`);
          if (typeof row.quiz_json === 'object') {
            console.log(`   Keys: ${Object.keys(row.quiz_json).join(', ')}`);
          }
        }
      });
    }
    
    // Vérifier aussi le schéma
    const { data: schemaData, error: schemaError } = await supabase.rpc('get_schema_info', { table_name: 'lingua_modules' });
    if (schemaError) {
      // Fallback: utiliser une requête SQL directe via query
      console.log('ℹ️  RPC non disponible, vérification via select * limit 1');
      const { data: sample, error: sampleError } = await supabase
        .from('lingua_modules')
        .select('*')
        .limit(1);
      if (!sampleError && sample && sample.length > 0) {
        console.log('📋 Toutes les colonnes disponibles:');
        Object.keys(sample[0]).forEach(col => console.log(`   - ${col}`));
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur non gérée:', error.message);
  }
}

checkQuizColumn();