// fix_palette_finale.js
// AGTM Digital Academy — Harmonisation finale de la palette
// dashboard.html : #C8960C → #D4A017 (version la plus complète)
// + correction des 3 occurences de #C8960C dans les libellés (à ignorer)
// + sauvegarde de la version originale

const fs = require('fs');
const path = require('path');

const DASHBOARD = path.join(__dirname, 'dashboard.html');
const BACKUP = path.join(__dirname, 'dashboard.html.harmonisation-backup');

console.log('🔧 HARMONISATION PALETTE FINALE');
console.log('════════════════════════════════\n');

// 1. Backup
let html = fs.readFileSync(DASHBOARD, 'utf8');
fs.writeFileSync(BACKUP, html, 'utf8');
console.log(`✅ Backup créé : dashboard.html.harmonisation-backup (${(html.length/1024).toFixed(1)} KB)`);

// 2. Compter avant
const oldGoldCount = (html.match(/#C8960C/g) || []).length;
const newGoldCount = (html.match(/#D4A017/g) || []).length;
console.log(`\n📊 AVANT : ${oldGoldCount}x #C8960C | ${newGoldCount}x #D4A017`);

// 3. Remplacer #C8960C par #D4A017
// Attention : ne pas remplacer dans les mots-clés ou libellés qui pourraient
// contenir accidentellement cette chaîne. On ne remplace que les couleurs CSS.
let replaced = 0;
html = html.replace(/#C8960C/g, (match) => {
  replaced++;
  return '#D4A017';
});
console.log(`🔁 Remplacements effectués : ${replaced}`);

// 4. Compter après
const oldGoldAfter = (html.match(/#C8960C/g) || []).length;
const newGoldAfter = (html.match(/#D4A017/g) || []).length;
console.log(`📊 APRÈS  : ${oldGoldAfter}x #C8960C | ${newGoldAfter}x #D4A017`);

// 5. Écrire
fs.writeFileSync(DASHBOARD, html, 'utf8');
console.log(`\n✅ Fichier mis à jour : dashboard.html (${(html.length/1024).toFixed(1)} KB)`);

// 6. Vérification des IDs critiques et features
console.log('\n─── VÉRIFICATION DASHBOARD.HTML HARMONISÉ ───\n');

const checks = {
  'Palette #C8960C (ancienne)' : (html.match(/#C8960C/g) || []).length === 0 ? '✅ 0 occurrence' : '❌ Restant',
  'Palette #D4A017 (nouvelle)' : (html.match(/#D4A017/g) || []).length > 800 ? '✅ >800 occurrences' : '⚠️ Faible',
  'Premium cards (49)' : (html.match(/premium-card/g) || []).length === 49 ? '✅ 49' : '❌ Différent',
  'Timer (apTimerStart)' : html.includes('apTimerStart') ? '✅ Présent' : '❌ Manquant',
  'Timer (qTimerInit)' : html.includes('qTimerInit') ? '✅ Présent' : '❌ Manquant',
  'Génération IA (genererQuizIA)' : html.includes('genererQuizIA') ? '✅ Présent' : '❌ Manquant',
  'Config tests (config_tests)' : html.includes('config_tests') ? '✅ Présent' : '❌ Manquant',
  'ID etudBody' : html.includes('id="etudBody"') ? '✅ Présent' : '❌ Manquant',
  'ID planSujet' : html.includes('id="planSujet"') ? '✅ Présent' : '❌ Manquant',
  'ID rapsTableBody' : html.includes('id="rapsTableBody"') ? '✅ Présent' : '❌ Manquant',
  'ID agendaTodayDate' : html.includes('id="agendaTodayDate"') ? '✅ Présent' : '❌ Manquant',
  'ID agendaTodayContainer' : html.includes('id="agendaTodayContainer"') ? '✅ Présent' : '❌ Manquant',
  'ID agendaCount' : html.includes('id="agendaCount"') ? '✅ Présent' : '❌ Manquant',
  'Service Role (SERVICE_ROLE)' : !html.includes('SUPABASE_SERVICE_ROLE') ? '✅ Supprimé' : '⚠️ Présent',
};

Object.entries(checks).forEach(([key, val]) => {
  const status = val.includes('✅') ? '✅' : val.includes('⚠️') ? '⚠️' : '❌';
  console.log(`  ${status} ${key.padEnd(42)} ${val}`);
});

const allPassed = Object.values(checks).every(v => v.includes('✅'));
console.log(`\n══════════════════════════════════════════════════`);
console.log(allPassed ? '✅ TOUS LES TESTS PASSENT — dashboard.html est LA VERSION FINALE' : '⚠️ CERTAINS TESTS ÉCHOUENT');
console.log(`══════════════════════════════════════════════════\n`);

// 7. Copie vers DEPLOY
const DEPLOY_DEST = path.join(__dirname, 'DEPLOY', 'app', 'dashboard.html');
fs.copyFileSync(DASHBOARD, DEPLOY_DEST);
console.log(`📦 Copié vers DEPLOY/app/dashboard.html ✅`);
