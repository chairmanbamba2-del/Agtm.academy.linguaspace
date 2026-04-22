#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyQuizJson() {
  try {
    console.log('🔍 Vérification du format quiz_json...');
    
    // Récupérer 3 modules avec quiz_json non null
    const { data: modules, error } = await supabase
      .from('lingua_modules')
      .select('id, title, language, level, quiz_json')
      .not('quiz_json', 'is', null)
      .limit(3)
      .order('language')
      .order('order_num');
    
    if (error) {
      console.error('❌ Erreur récupération:', error.message);
      return;
    }
    
    console.log(`📊 ${modules.length} modules avec quiz_json vérifiés`);
    
    let allValid = true;
    
    modules.forEach((mod, idx) => {
      console.log(`\n--- Module ${idx + 1}: ${mod.title} (${mod.language.toUpperCase()} ${mod.level}) ---`);
      
      const quiz = mod.quiz_json;
      
      // Vérifier la structure
      if (!quiz || typeof quiz !== 'object') {
        console.log('❌ quiz_json n\'est pas un objet');
        allValid = false;
        return;
      }
      
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        console.log('❌ quiz_json.questions manquant ou non tableau');
        allValid = false;
        return;
      }
      
      console.log(`✅ ${quiz.questions.length} questions trouvées`);
      
      // Vérifier chaque question
      quiz.questions.forEach((q, qIdx) => {
        const hasId = !!q.id;
        const hasQuestion = !!q.question;
        const hasOptions = Array.isArray(q.options) && q.options.length >= 2;
        const hasCorrect = !!q.correct;
        const hasExplanation = !!q.explanation;
        
        if (!hasId) console.log(`   ⚠️ Question ${qIdx}: pas d'id`);
        if (!hasQuestion) console.log(`   ⚠️ Question ${qIdx}: pas de question`);
        if (!hasOptions) console.log(`   ⚠️ Question ${qIdx}: options manquantes ou invalides`);
        if (!hasCorrect) console.log(`   ⚠️ Question ${qIdx}: pas de correct`);
        if (!hasExplanation) console.log(`   ⚠️ Question ${qIdx}: pas d'explication`);
        
        if (hasId && hasQuestion && hasOptions && hasCorrect && hasExplanation) {
          console.log(`   ✅ Question ${qIdx}: "${q.question.substring(0, 40)}..."`);
        } else {
          allValid = false;
        }
      });
    });
    
    if (allValid) {
      console.log('\n🎉 Tous les quiz_json sont valides !');
    } else {
      console.log('\n⚠️  Certains quiz_json ont des problèmes de format.');
    }
    
    // Statistiques générales
    const { data: stats, error: statsError } = await supabase
      .from('lingua_modules')
      .select('quiz_json', { count: 'exact', head: false });
    
    if (!statsError) {
      const total = stats.length;
      const withQuiz = stats.filter(m => m.quiz_json).length;
      console.log(`\n📈 Statistiques : ${withQuiz}/${total} modules avec quiz_json (${Math.round(withQuiz/total*100)}%)`);
    }
    
  } catch (err) {
    console.error('💥 Erreur :', err.message);
  }
}

// Point d'entrée
if (import.meta.url.startsWith('file://') && 
  (import.meta.url.includes(process.argv[1].replace(/\\/g, '/')) || 
   process.argv[1].includes('verify_quiz_json.js'))) {
  verifyQuizJson();
}