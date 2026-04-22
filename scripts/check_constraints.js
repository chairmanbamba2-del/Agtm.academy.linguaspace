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

async function checkConstraints() {
  try {
    console.log('🔍 Vérification des contraintes uniques sur lingua_modules...');
    
    // Requête SQL via rpc ou query directe
    // On va utiliser une requête SQL simple via supabase.rpc si une fonction existe
    // Sinon, on peut faire un select pour voir les données
    
    // D'abord, vérifier si la contrainte language+title existe en tentant un upsert
    const testData = {
      language: 'test',
      title: 'Test Constraint',
      level: 'A1',
      order_num: 9999,
      description: 'Test'
    };
    
    console.log('Testing constraint language+title...');
    const { error: titleError } = await supabase
      .from('lingua_modules')
      .upsert(testData, { onConflict: 'language,title' });
    
    if (titleError) {
      console.log(`❌ Constraint language,title non valide: ${titleError.message}`);
    } else {
      console.log('✅ Constraint language,title valide');
      // Nettoyer
      await supabase.from('lingua_modules').delete().eq('language', 'test').eq('title', 'Test Constraint');
    }
    
    // Tester language+slug
    const testData2 = {
      language: 'test',
      slug: 'test-constraint-a1',
      title: 'Test Constraint 2',
      level: 'A1',
      order_num: 9998,
      description: 'Test'
    };
    
    console.log('Testing constraint language+slug...');
    const { error: slugError } = await supabase
      .from('lingua_modules')
      .upsert(testData2, { onConflict: 'language,slug' });
    
    if (slugError) {
      console.log(`❌ Constraint language,slug non valide: ${slugError.message}`);
    } else {
      console.log('✅ Constraint language,slug valide');
      await supabase.from('lingua_modules').delete().eq('language', 'test').eq('slug', 'test-constraint-a1');
    }
    
    // Vérifier les index uniques
    console.log('\n📋 Vérification des index uniques via requête SQL...');
    const { data: indexes, error: indexesError } = await supabase.rpc('get_indexes', { table_name: 'lingua_modules' });
    if (indexesError) {
      console.log('ℹ️  RPC get_indexes non disponible');
      // Fallback: vérifier manuellement
      const { data: sample, error: sampleError } = await supabase
        .from('lingua_modules')
        .select('*')
        .limit(1);
      if (!sampleError && sample && sample.length > 0) {
        console.log('Colonnes disponibles:', Object.keys(sample[0]).join(', '));
      }
    } else {
      console.log('Indexes:', JSON.stringify(indexes, null, 2));
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

checkConstraints();