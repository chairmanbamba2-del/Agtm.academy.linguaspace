const fs = require('fs');

// ─── FICHIERS À COMPARER ───
const files = [
  'dashboard.html',
  'dashboard-premium-lot1.html',
  'dashboard-premium-lot2-final.html'
];

console.log('══════════════════════════════════════════════════');
console.log('ANALYSE COMPARATIVE DES VERSIONS DASHBOARD');
console.log('══════════════════════════════════════════════════\n');

const data = {};
files.forEach(f => {
  try {
    data[f] = fs.readFileSync(f, 'utf8');
    console.log(`✅ ${f.padEnd(45)} ${(data[f].length/1024).toFixed(1)} KB`);
  } catch(e) {
    console.log(`❌ ${f} — FICHIER INTROUVABLE`);
  }
});

console.log('\n─── INDICATEURS CLÉS ───\n');

// 1. Premium cards
['premium-card', 'premium-gold', 'agtm-card'].forEach(k => {
  const counts = files.map(f => (data[f]?.match(new RegExp(k, 'g')) || []).length);
  console.log(`${k.padEnd(20)} → dash: ${counts[0]} | lot1: ${counts[1]} | lot2: ${counts[2]}`);
});

// 2. Palette
['#E8941A', '#D4A017', '#C8960C', '#0D1B2A'].forEach(c => {
  const counts = files.map(f => (data[f]?.match(new RegExp(c.replace('#','\\#'), 'g')) || []).length);
  console.log(`${c.padEnd(20)} → dash: ${counts[0]} | lot1: ${counts[1]} | lot2: ${counts[2]}`);
});

// 3. IDs critiques (vérification d'existence)
console.log('\n─── IDs CRITIQUES (présents dans les 3 versions ?) ───\n');
const ids = [
  'etudBody', 'planSujet', 'rapsTableBody', 'fcCalendar',
  'aiChatBox', 'notifBtn', 'presSeance', 'feuilleContent',
  'cmdPalette', 'chartOvw', 'riskContainer', 'cohortContainer',
  'rC', 'rsObj', 'rsObs', 'pfEtud', 'pfLignes', 'pfTotal',
  'plnE', '_echDate', 'agendaTodayDate', 'agendaTodayContainer', 'agendaCount'
];

ids.forEach(id => {
  const present = files.map(f => !!(data[f]?.includes('id="' + id + '"') || data[f]?.includes("id='" + id + "'")));
  const allOk = present.every(v => v === true);
  const status = allOk ? '✅ TOUS' : present.map((v,i) => v ? '✅' : '❌').join(' | ');
  if (!allOk) {
    console.log(`${id.padEnd(25)} ${status}`);
  }
});
console.log('(IDs non listés = OK dans les 3 versions)\n');

// 4. Fonctions globales
console.log('─── FONCTIONS GLOBALES window._* ───\n');
const counts = files.map(f => (data[f]?.match(/window\._/g) || []).length);
console.log(`window._*         → dash: ${counts[0]} | lot1: ${counts[1]} | lot2: ${counts[2]}`);

// 5. Modules transformés
['modules', 'tr_module_', 'module-container'].forEach(k => {
  const counts = files.map(f => (data[f]?.match(new RegExp(k, 'g')) || []).length);
  console.log(`${k.padEnd(20)} → dash: ${counts[0]} | lot1: ${counts[1]} | lot2: ${counts[2]}`);
});

// 6. Features spécifiques
console.log('\n─── FONCTIONNALITÉS SPÉCIFIQUES ───\n');
const features = [
  ['Timer quiz', 'apTimerStart', 'qTimerInit'],
  ['Génération IA', 'genererQuizIA', 'generate-module-content'],
  ['Certifications', 'TOEIC', 'TOEFL', 'IELTS'],
  ['Notifications', 'notification_email', 'notification_whatsapp'],
  ['Config tests', 'config_tests', 'duree_minutes'],
  ['Sélecteur formateur', 'v_formateurs_select', 'formateur_id'],
  ['Service Worker', 'serviceWorker', 'sw.js'],
  ['PWA', 'manifest.json'],
  ['Service Role', 'SERVICE_ROLE'],
  ['Supabase anon', 'SUPABASE_URL', 'supabase-key'],
];

features.forEach(([label, ...terms]) => {
  const counts = terms.map(term => 
    files.map(f => (data[f]?.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length)
  );
  const summary = counts.map((c, i) => `${terms[i]}: ${c.join('|')}`).join(' • ');
  console.log(`${label.padEnd(20)} ${summary}`);
});

// 7. Conclusion
console.log('\n══════════════════════════════════════════════════');
console.log('CONCLUSION');
console.log('══════════════════════════════════════════════════\n');

const dashSize = (data['dashboard.html']?.length || 0) / 1024;
const lot2Size = (data['dashboard-premium-lot2-final.html']?.length || 0) / 1024;

console.log(`dashboard.html (${dashSize.toFixed(1)} KB) vs dashboard-premium-lot2-final.html (${lot2Size.toFixed(1)} KB)`);
console.log(`Différence: ${(lot2Size - dashSize).toFixed(1)} KB\n`);

// Vérifier si dashboard.html a reçu les améliorations lot2
const dashHasPremium = (data['dashboard.html']?.match(/premium-card/g) || []).length > 0;
const dashHasD4A017 = (data['dashboard.html']?.match(/#D4A017/g) || []).length > 0;
const dashHasLot2Module = (data['dashboard.html']?.match(/Vos Séances|planSujet|Planning Séance/g) || []).length > 0;

console.log('Dashboard.html contient-il:');
console.log(`  premium-card       : ${dashHasPremium ? '✅ OUI' : '❌ NON'}`);
console.log(`  #D4A017 palette    : ${dashHasD4A017 ? '✅ OUI' : '❌ NON'}`);
console.log(`  Lot 2 modules      : ${dashHasLot2Module ? '✅ OUI' : '❌ NON'}`);
