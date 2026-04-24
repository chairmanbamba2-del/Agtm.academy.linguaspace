// audit_final.js - Audit complet des 7 Recommandations
const fs = require('fs');
const path = require('path');

const DASHBOARD = path.join(__dirname, 'dashboard.html');
const SQL_V46 = path.join(__dirname, 'Migration SQL Supabase/supabase_MIGRATION_v46_recommandations_finales.sql');
const SQL_MIG = path.join(__dirname, 'Migration SQL Supabase/supabase_COMPLET.sql');

const h = fs.readFileSync(DASHBOARD, 'utf8');
const sql = fs.existsSync(SQL_V46) ? fs.readFileSync(SQL_V46, 'utf8') : '';
const sqlt = fs.existsSync(SQL_MIG) ? fs.readFileSync(SQL_MIG, 'utf8') : '';

const results = [];

function check(name, test, note) {
  const ok = test();
  results.push({ name, ok, note });
}

// ── RECO 1 : Sélecteur formateur dédié ──
check('RECO 1 - v_formateurs_select (SQL view)', () => sql.includes('v_formateurs_select'), 'Migration SQL v46');
check('RECO 1 - personnel table link in DB', () => sql.includes('formateur_id') && sql.includes('personnel'), 'Champs dans devoirs/notifications');

// ── RECO 2 : Liaison modules ↔ questions ──
check('RECO 2 - module_id dans quiz_questions', () => sql.includes('module_id'), 'Colonne SQL');
check('RECO 2 - lecon_id dans quiz_questions', () => sql.includes('lecon_id'), 'Colonne SQL');

// ── RECO 3 : Notifications soumission devoir ──
check('RECO 3 - fn_notifier_soumission_devoir', () => sql.includes('fn_notifier_soumission_devoir'), 'Fonction trigger SQL');
check('RECO 3 - Table notifications', () => sql.includes('CREATE TABLE IF NOT EXISTS notifications'), 'Table SQL');

// ── RECO 4 : Durée configurable des tests ──
check('RECO 4 - config_tests table', () => sql.includes('CREATE TABLE IF NOT EXISTS config_tests'), 'Table SQL');
check('RECO 4 - config default values', () => sql.includes("'duree_test_placement', '30'"), 'Valeurs par défaut');

// ── RECO 5 : Génération IA de questions ──
check('RECO 5 - Fonction genererQuizIA', () => h.includes('window.genererQuizIA = async function()'), 'Frontend dashboard');
check('RECO 5 - Edge function URL', () => h.includes('EDGE_FN_GENERATE_MODULE') || h.includes('generate-module-content'), 'Constante API');
check('RECO 5 - UI Modal generation', () => h.includes('iaQuizModal'), 'Modal interactif');

// ── RECO 6 : Mapping certifications ──
check('RECO 6 - certification dans quiz_questions', () => sql.includes("'certification'") || sql.includes('TOEIC'), 'Colonne SQL');

// ── RECO 7 : Timer quiz dashboard ──
check('RECO 7 - _apTimerStart function', () => h.includes('function _apTimerStart'), 'Timer module eval');
check('RECO 7 - _qTimerInit (libre)', () => h.includes('window._qTimerInit = function()'), 'Timer quiz libre');
check('RECO 7 - apTimer span', () => h.includes('id="apTimer"'), 'Element timer');
check('RECO 7 - config_tests timer', () => h.includes('timer_dashboard_secondes'), 'Config DB timer');
check('RECO 7 - Timer init appel', () => h.includes('_apTimerStart()'), 'Init appelé');

// ── Synthèse finale ──
console.log('═══════════════════════════════════════════════');
console.log('  AUDIT FINAL - 11. RECOMMANDATIONS FINALES');
console.log('═══════════════════════════════════════════════\n');

let passed = 0;
let total = results.length;

results.forEach(r => {
  const icon = r.ok ? '✅' : '❌';
  console.log(`  ${icon}  ${r.name}`);
  console.log(`      ${r.note}: ${r.ok ? 'OK' : 'MISS'}`);
  if (r.ok) passed++;
});

console.log(`\n═══════════════════════════════════════════════`);
console.log(`  RÉSULTAT : ${passed}/${total} recommandations OK`);
console.log(`  ${passed === total ? '🎉 TOUT EST OPÉRATIONNEL !' : '⚠️  Des ajustements restent nécessaires'}`);
console.log(`═══════════════════════════════════════════════\n`);

// Vérifs supplémentaires
console.log('VÉRIFICATIONS SUPPLÉMENTAIRES :');
const extra = [
  ['Devoir form select formateur', fs.readFileSync(path.join(__dirname,'devoir_form.html'),'utf8').includes('eFmtSelect')],
  ['Eval form formateur field', fs.readFileSync(path.join(__dirname,'evaluation_form.html'),'utf8').includes('formateur')],
];
extra.forEach(([name, ok]) => {
  console.log(`  ${ok?'✅':'❌'} ${name}`);
});
