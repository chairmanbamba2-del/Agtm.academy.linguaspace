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

async function checkModule() {
  try {
    console.log('🔍 Recherche du module Business English...');
    
    const { data, error } = await supabase
      .from('lingua_modules')
      .select('*')
      .eq('language', 'en')
      .eq('title', 'Business English: Negotiating a Contract')
      .maybeSingle();
    
    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }
    
    if (!data) {
      console.error('❌ Module non trouvé');
      return;
    }
    
    console.log('✅ Module trouvé');
    console.log(`   ID: ${data.id}`);
    console.log(`   Slug: ${data.slug}`);
    console.log(`   XP Reward: ${data.xp_reward}`);
    console.log(`   Quiz JSON: ${data.quiz_json ? 'présent' : 'null/absent'}`);
    
    if (data.quiz_json) {
      console.log('\n📋 Contenu du quiz JSON:');
      console.log(JSON.stringify(data.quiz_json, null, 2));
      
      // Vérifier la structure
      if (data.quiz_json.questions && Array.isArray(data.quiz_json.questions)) {
        console.log(`\n✅ ${data.quiz_json.questions.length} question(s) dans le quiz`);
        data.quiz_json.questions.forEach((q, i) => {
          console.log(`   Q${i+1}: ${q.question.substring(0, 50)}...`);
        });
      }
    }
    
    // Vérifier aussi les autres colonnes
    console.log('\n📋 Autres colonnes importantes:');
    console.log(`   Content text length: ${data.content_text?.length || 0} chars`);
    console.log(`   Transcript length: ${data.transcript?.length || 0} chars`);
    console.log(`   Duration: ${data.duration_min} min`);
    console.log(`   Published: ${data.is_published}`);
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

checkModule();