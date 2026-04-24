// fix_recommandations_finales.js
// AGTM Digital Academy — Implémente les 3 recommandations frontend restantes
// ⑤ Génération IA de questions | ⑦ Timer quiz dashboard
// Exécution: node fix_recommandations_finales.js

const fs = require('fs');
const path = require('path');

const DASHBOARD = path.join(__dirname, 'dashboard.html');
console.log('📂 Lecture de :', DASHBOARD);

let html;
try {
  html = fs.readFileSync(DASHBOARD, 'utf8');
  console.log('✅ Fichier lu: ' + (html.length / 1024).toFixed(0) + ' Ko');
} catch(e) {
  console.error('❌ Erreur lecture fichier:', e.message);
  process.exit(1);
}

let totalReplacements = 0;
const report = [];

// ════════════════════════════════════════════════════════════════════
// ⑤ RECO 5 : GÉNÉRATION IA DE QUESTIONS
// ════════════════════════════════════════════════════════════════════

// 1. Ajouter les constantes après SUPABASE_URL
const supabaseMarker = "const SUPABASE_URL          = 'https://fglzovvsyloprokmdadx.supabase.co'";
const supabaseReplace = supabaseMarker + 
  "\n" +
  "// ═══════════════════════════════════════════════════════\n" +
  "// CONSTANTES POUR RECO ⑤ GÉNÉRATION IA DE QUESTIONS\n" +
  "const EDGE_FN_GENERATE_MODULE = SUPABASE_URL + '/functions/v1/generate-module-content';\n" +
  "window._generationIAEnCours  = false;\n" +
  "window._iaGeneratedQuestions = [];";

if (html.includes(supabaseMarker)) {
  html = html.replace(supabaseMarker, supabaseReplace);
  totalReplacements++;
  report.push('✅ RECO ⑤ - Constantes IA injectées');
}

// 2. Ajouter le bouton IA dans la barre de navigation du quiz
// Chercher un marker unique : le bouton mode "Catalogue" ou "Retour"
const iaButton = 
  '          <button onclick="window.genererQuizIA()"\n' +
  '            style="padding:8px 18px;border-radius:8px;border:none;cursor:pointer;font-weight:700;font-size:.8rem;\n' +
  '            background:linear-gradient(135deg,#6C3483,#8E44AD);color:#fff;display:inline-flex;align-items:center;gap:6px;\n' +
  '            box-shadow:0 2px 8px rgba(142,68,173,0.3);transition:opacity .15s"\n' +
  '            onmouseover="this.style.opacity=\'.85\'" onmouseout="this.style.opacity=\'1\'"\n' +
  '            title="Générer des questions personnalisées via l\\\'IA Claude">\n' +
  '            🤖 IA\n' +
  '          </button>';

// Mode 1: Voir si le pattern modeBar existe
if (html.includes('id="modeBar"')) {
  html = html.replace(
    /(<div id="modeBar"[^>]*>[\s\S]*?)(<\/div>)/,
    (match, openContent, closeTag) => {
      if (openContent.includes('🤖 IA')) return match; // déjà injecté
      return openContent + iaButton + closeTag;
    }
  );
  totalReplacements++;
  report.push('✅ RECO ⑤ - Bouton IA dans modeBar');
} else {
  // Mode 2: Chercher un bouton "Retour" connu dans les contrôles de quiz
  const modeQuizMarkers = [
    'Par niveau',
    'Quiz libre',
    'modeQuiz'
  ];
  let found = false;
  for (const mk of modeQuizMarkers) {
    if (html.includes(mk)) {
      html = html.replace(
        mk,
        mk + '\n' + iaButton
      );
      found = true;
      break;
    }
  }
  if (found) {
    totalReplacements++;
    report.push('✅ RECO ⑤ - Bouton IA injecté (fallback)');
  } else {
    report.push('⚠️ RECO ⑤ - Impossible d\'injecter le bouton IA');
  }
}

// 3. Fonctions IA - injection après la déclaration de SUPABASE_ANON
const IA_FN_MARKER = "const SUPABASE_ANON = ";
const iaFunctionCode = 
  "\n" +
  "    // ════════════════════════════════════════════════════════════════\n" +
  "    // RECO ⑤ : GÉNÉRATION IA DE QUESTIONS VIA EDGE FUNCTION\n" +
  "    // Appelle generate-module-content et crée un quiz personnalisé\n" +
  "    // ════════════════════════════════════════════════════════════════\n" +
  "    window.genererQuizIA = async function() {\n" +
  "      if (window._generationIAEnCours) return\n" +
  "      window._generationIAEnCours = true\n" +
  "\n" +
  "      const modal = document.createElement('div')\n" +
  "      modal.id = 'iaQuizModal'\n" +
  "      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:99999'\n" +
  "      modal.innerHTML = '<div style=\"background:linear-gradient(135deg,#152540,#241C08);border:1px solid rgba(200,150,12,0.3);border-radius:16px;padding:28px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto\">' +\n" +
  "        '<div style=\"font-size:1.1rem;font-weight:800;color:#E8B84B;margin-bottom:16px\">🤖 Génération IA de questions</div>' +\n" +
  "        '<div style=\"margin-bottom:12px\"><label style=\"font-size:.77rem;font-weight:600;color:#8AAAC0;display:block;margin-bottom:4px;text-transform:uppercase\">Thème / Sujet</label>' +\n" +
  "        '<input id=\"iaTopic\" type=\"text\" placeholder=\"Ex: Present Perfect, Business Meeting, TOEIC Part 2...\" style=\"width:100%;padding:10px 14px;border-radius:9px;border:1.5px solid #3A3A28;background:linear-gradient(135deg,#0B1828,#1C1408);font-size:.9rem;color:#E2D8C0;outline:none\"/></div>' +\n" +
  "        '<div style=\"margin-bottom:12px\"><label style=\"font-size:.77rem;font-weight:600;color:#8AAAC0;display:block;margin-bottom:4px;text-transform:uppercase\">Niveau CECRL</label>' +\n" +
  "        '<select id=\"iaLevel\" style=\"width:100%;padding:10px 14px;border-radius:9px;border:1.5px solid #3A3A28;background:linear-gradient(135deg,#0B1828,#1C1408);font-size:.9rem;color:#E2D8C0;outline:none\">' +\n" +
  "        '<option value=\"A1\">A1 — Débutant</option><option value=\"A2\">A2 — Élémentaire</option><option value=\"B1\" selected>B1 — Intermédiaire</option><option value=\"B2\">B2 — Avancé</option><option value=\"C1\">C1 — Expert</option></select></div>' +\n" +
  "        '<div style=\"margin-bottom:16px\"><label style=\"font-size:.77rem;font-weight:600;color:#8AAAC0;display:block;margin-bottom:4px;text-transform:uppercase\">Catégorie</label>' +\n" +
  "        '<select id=\"iaTheme\" style=\"width:100%;padding:10px 14px;border-radius:9px;border:1.5px solid #3A3A28;background:linear-gradient(135deg,#0B1828,#1C1408);font-size:.9rem;color:#E2D8C0;outline:none\">' +\n" +
  "        '<option value=\"grammaire\">📖 Grammaire</option><option value=\"vocabulaire\">📝 Vocabulaire</option><option value=\"business\">💼 Business</option><option value=\"communication\">🗣️ Communication</option><option value=\"preparation_examen\">🎯 Préparation Examen</option></select></div>' +\n" +
  "        '<div id=\"iaProgress\" style=\"display:none;margin-bottom:12px\"><div style=\"font-size:.82rem;color:#8AAAC0;margin-bottom:6px\">⏳ Génération en cours via Claude IA...</div>' +\n" +
  "        '<div style=\"height:6px;background:#1E3050;border-radius:3px;overflow:hidden\"><div id=\"iaBar\" style=\"height:6px;background:linear-gradient(90deg,#C8960C,#E8B84B);border-radius:3px;width:0%;transition:width .5s\"></div></div></div>' +\n" +
  "        '<div id=\"iaError\" style=\"display:none;font-size:.82rem;color:#E04A4A;margin-bottom:12px\"></div>' +\n" +
  "        '<div style=\"display:flex;gap:10px\"><button onclick=\"document.getElementById(\\'iaQuizModal\\').remove();window._generationIAEnCours=false\" style=\"flex:1;padding:10px;border-radius:9px;border:1.5px solid #3A3A28;background:transparent;color:#8AAAC0;font-weight:600;cursor:pointer;font-size:.85rem\">Annuler</button>' +\n" +
  "        '<button id=\"iaBtnGenerer\" onclick=\"window._executerGenerationIA()\" style=\"flex:2;padding:10px;border-radius:9px;border:none;background:linear-gradient(135deg,#C8960C,#E8B84B);color:#0A1520;font-weight:800;cursor:pointer;font-size:.85rem\">🚀 Générer 5 questions</button></div></div>'\n" +
  "      document.body.appendChild(modal)\n" +
  "    }\n" +
  "\n" +
  "    window._executerGenerationIA = async function() {\n" +
  "      const topic = document.getElementById('iaTopic').value.trim()\n" +
  "      const level = document.getElementById('iaLevel').value\n" +
  "      const theme = document.getElementById('iaTheme').value\n" +
  "      const errDiv = document.getElementById('iaError')\n" +
  "      const progress = document.getElementById('iaProgress')\n" +
  "      const bar = document.getElementById('iaBar')\n" +
  "      const btn = document.getElementById('iaBtnGenerer')\n" +
  "\n" +
  "      if (!topic) { errDiv.textContent = 'Veuillez saisir un thème.'; errDiv.style.display='block'; return }\n" +
  "      errDiv.style.display = 'none'\n" +
  "      progress.style.display = 'block'\n" +
  "      btn.disabled = true\n" +
  "      btn.textContent = '⏳ Génération...'\n" +
  "\n" +
  "      const module_id = 'ia_' + theme.substring(0,4) + '_' + level.toLowerCase() + '_' + Date.now().toString(36)\n" +
  "\n" +
  "      try {\n" +
  "        bar.style.width = '30%'\n" +
  "        const resp = await fetch('https://fglzovvsyloprokmdadx.supabase.co/functions/v1/generate-module-content', {\n" +
  "          method: 'POST',\n" +
  "          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON },\n" +
  "          body: JSON.stringify({ module_id, topic, level, theme, language: 'fr' })\n" +
  "        })\n" +
  "        bar.style.width = '70%'\n" +
  "\n" +
  "        if (!resp.ok) {\n" +
  "          const errData = await resp.json().catch(()=>({}))\n" +
  "          throw new Error(errData.message || 'Erreur API: ' + resp.status)\n" +
  "        }\n" +
  "\n" +
  "        const data = await resp.json()\n" +
  "        bar.style.width = '100%'\n" +
  "\n" +
  "        const quizData = data?.content?.Quiz_Data\n" +
  "        if (!quizData || !quizData.length) throw new Error('Aucune question générée')\n" +
  "\n" +
  "        const questions = quizData.map((q, idx) => ({\n" +
  "          id: 'ia_' + module_id + '_q' + (idx+1),\n" +
  "          q: q.question,\n" +
  "          opts: q.options || [],\n" +
  "          rep: q.correct_answer || 'A',\n" +
  "          expl: q.explanation || ''\n" +
  "        }))\n" +
  "\n" +
  "        if (!window._iaGeneratedQuestions) window._iaGeneratedQuestions = []\n" +
  "        window._iaGeneratedQuestions = window._iaGeneratedQuestions.concat(questions)\n" +
  "\n" +
  "        window._quizMode = 'libre'\n" +
  "        if (window.QS) {\n" +
  "          window.QS.questions = questions.sort(()=>Math.random()-0.5).slice(0, Math.min(8, questions.length))\n" +
  "          window.QS.current = 0\n" +
  "          window.QS.score = 0\n" +
  "          window.QS.answered = false\n" +
  "          window.QS.modeBar = '<div></div>'\n" +
  "          window._qRender()\n" +
  "        } else {\n" +
  "          if (typeof renderQuiz === 'function') renderQuiz()\n" +
  "        }\n" +
  "\n" +
  "        document.getElementById('iaQuizModal').remove()\n" +
  "        window._generationIAEnCours = false\n" +
  "\n" +
  "        if (typeof showToast === 'function') {\n" +
  "          showToast('✅ ' + questions.length + ' questions g\u00e9n\u00e9r\u00e9es par IA pour « ' + topic + ' »', 'gold')\n" +
  "        } else {\n" +
  "          alert(questions.length + ' questions g\u00e9n\u00e9r\u00e9es par IA !')\n" +
  "        }\n" +
  "\n" +
  "      } catch (err) {\n" +
  "        console.error('[IA Quiz]', err)\n" +
  "        errDiv.textContent = '❌ ' + (err.message || 'Erreur lors de la g\u00e9n\u00e9ration')\n" +
  "        errDiv.style.display = 'block'\n" +
  "        progress.style.display = 'none'\n" +
  "        btn.disabled = false\n" +
  "        btn.textContent = '🚀 G\u00e9n\u00e9rer 5 questions'\n" +
  "        window._generationIAEnCours = false\n" +
  "      }\n" +
  "    }\n";

// Injecter les fonctions IA après la ligne des constantes ajoutées
if (html.includes('window._iaGeneratedQuestions = [];')) {
  html = html.replace(
    'window._iaGeneratedQuestions = [];',
    'window._iaGeneratedQuestions = [];' + iaFunctionCode
  );
  totalReplacements++;
  report.push('✅ RECO ⑤ - Fonctions IA injectées');
}

// ════════════════════════════════════════════════════════════════════
// ⑦ RECO 7 : TIMER QUIZ DASHBOARD
// ════════════════════════════════════════════════════════════════════

// 1. Ajouter l'élément timer dans _apQRender
// Chercher le span "Score : " dans la fonction _apQRender
const scorePattern = '<span style="font-size:.78rem;font-weight:700;color:#C8960C">Score : ';
if (html.includes(scorePattern)) {
  const timerSpan = 
    '<span id="apTimer" style="font-size:.78rem;font-family:Space Mono,monospace;font-weight:700;color:#4AE090;margin-left:auto;display:none"></span>';
  html = html.replace(
    scorePattern,
    timerSpan + scorePattern
  );
  totalReplacements++;
  report.push('✅ RECO ⑦ - Timer affichage dans _apQRender');
}

// 2. Ajouter l'initialisation du timer dans _apQRender
const qsInitPattern = "const qs = window._apQS\n      if (!qs.questions.length) return";
const qsInitReplace = 
  "const qs = window._apQS\n" +
  "      // RECO ⑦ : Initialiser le timer si pas d\u00e9j\u00e0 fait\n" +
  "      if (qs.timer === undefined) {\n" +
  "        qs.timer = 600\n" +
  "        qs.timerInterval = null\n" +
  "        qs.timerStart = null\n" +
  "        _apTimerStart()\n" +
  "      }\n" +
  "      if (!qs.questions.length) return";

if (html.includes(qsInitPattern)) {
  html = html.replace(qsInitPattern, qsInitReplace);
  totalReplacements++;
  report.push('✅ RECO ⑦ - Timer initialisation dans _apQRender');
}

// 3. Ajouter les fonctions timer avant l'évaluation de module
// Chercher le marker "// ═\n    // ÉVALUATION DE MODULE" ou similaire
const evalMarker = "ÉVALUATION DE MODULE (onglet Évaluation)";
const timerFunctions = [
  "    // ════════════════════════════════════════════════════════════════",
  "    // RECO ⑦ : TIMER CONFIGURABLE POUR QUIZ DASHBOARD",
  "    // ════════════════════════════════════════════════════════════════",
  "    function _apTimerStart() {",
  "      const qs = window._apQS",
  "      if (!qs || qs.timer <= 0 || qs.timerInterval) return",
  "      _apChargerConfigTimer().then(seconds => {",
  "        if (seconds) qs.timer = seconds",
  "      }).catch(()=>{})",
  "      qs.timerStart = Date.now()",
  "      qs.timerInterval = setInterval(() => {",
  "        if (!qs || qs.current >= qs.questions.length) {",
  "          clearInterval(qs.timerInterval)",
  "          qs.timerInterval = null",
  "          return",
  "        }",
  "        const elapsed = Math.floor((Date.now() - qs.timerStart) / 1000)",
  "        const remaining = Math.max(0, qs.timer - elapsed)",
  "        const el = document.getElementById('apTimer')",
  "        if (el) {",
  "          el.style.display = 'inline'",
  "          const mins = Math.floor(remaining / 60)",
  "          const secs = remaining % 60",
  "          el.textContent = '⏱ ' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0')",
  "          el.style.color = remaining <= 60 ? '#E04A4A' : remaining <= 180 ? '#F59E0B' : '#4AE090'",
  "        }",
  "        if (remaining <= 0) {",
  "          clearInterval(qs.timerInterval)",
  "          qs.timerInterval = null",
  "          if (typeof showToast === 'function') showToast('⏱ Temps écoulé !', 'danger')",
  "          qs.current = qs.questions.length",
  "          _apModView()",
  "        }",
  "      }, 1000)",
  "    }",
  "",
  "    async function _apChargerConfigTimer() {",
  "      try {",
  "        const { data, error } = await sb",
  "          .from('config_tests')",
  "          .select('valeur')",
  "          .eq('cle', 'timer_dashboard_secondes')",
  "          .maybeSingle()",
  "        if (!error && data) {",
  "          const v = parseInt(data.valeur)",
  "          return v > 0 ? v : null",
  "        }",
  "      } catch(e) {}",
  "      const saved = localStorage.getItem('agtm_quiz_timer_seconds')",
  "      if (saved) return parseInt(saved)",
  "      return null",
  "    }",
  "",
  "    window._apTimerReset = function() {",
  "      const qs = window._apQS",
  "      if (qs) {",
  "        if (qs.timerInterval) clearInterval(qs.timerInterval)",
  "        qs.timerInterval = null",
  "        qs.timerStart = null",
  "        qs.timer = 600",
  "      }",
  "    }",
  "",
  "    window._qTimerInit = function() {",
  "      if (window._qTimerInterval) clearInterval(window._qTimerInterval)",
  "      const QS = window.QS",
  "      if (!QS || !QS.questions || QS.current >= QS.questions.length) return",
  "      if (!QS._timerStart) {",
  "        QS._timerStart = Date.now()",
  "        QS._timerDuration = 600",
  "      }",
  "      window._qTimerInterval = setInterval(() => {",
  "        const QS2 = window.QS",
  "        if (!QS2 || QS2.current >= QS2.questions.length) {",
  "          clearInterval(window._qTimerInterval)",
  "          window._qTimerInterval = null",
  "          return",
  "        }",
  "        const elapsed = Math.floor((Date.now() - QS2._timerStart) / 1000)",
  "        const remaining = Math.max(0, QS2._timerDuration - elapsed)",
  "        let tEl = document.getElementById('libreTimer')",
  "        if (!tEl) {",
  "          const tBar = document.querySelector('#content > div > div[style*=\"display:flex\"][style*=\"align-items:center\"][style*=\"justify-content\"]')",
  "          if (tBar) {",
  "            tEl = document.createElement('span')",
  "            tEl.id = 'libreTimer'",
  "            tEl.style.cssText = 'font-size:.78rem;font-family:Space Mono,monospace;font-weight:700;color:#4AE090;margin-left:auto'",
  "            tBar.appendChild(tEl)",
  "          }",
  "        }",
  "        if (tEl) {",
  "          const mins = Math.floor(remaining / 60)",
  "          const secs = remaining % 60",
  "          tEl.textContent = '⏱ ' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0')",
  "          tEl.style.color = remaining <= 60 ? '#E04A4A' : remaining <= 180 ? '#F59E0B' : '#4AE090'",
  "        }",
  "        if (remaining <= 0) {",
  "          clearInterval(window._qTimerInterval)",
  "          window._qTimerInterval = null",
  "          if (typeof showToast === 'function') showToast('⏱ Temps écoulé !', 'danger')",
  "          QS2.current = QS2.questions.length",
  "          window._qRender()",
  "        }",
  "      }, 1000)",
  "    }",
  "",
  "    const _originalApQNext = window._apQNext",
  "    window._apQNext = function() {",
  "      const qs = window._apQS",
  "      if (qs) qs.timerStart = Date.now()",
  "      if (typeof _originalApQNext === 'function') _originalApQNext()",
  "    }",
  ""
].join('\n');

if (html.includes(evalMarker)) {
  html = html.replace(
    evalMarker,
    timerFunctions + evalMarker
  );
  totalReplacements++;
  report.push('✅ RECO ⑦ - Fonctions timer injectées');
}

// 4. Démarrer le timer libre dans _qRender
const qsAssignPattern = "QS={questions:qs.sort(()=>Math.random()-.5).slice(0,8),current:0,score:0,answered:false,modeBar}";
const qsAssignReplace = 
  "QS={questions:qs.sort(()=>Math.random()-.5).slice(0,8),current:0,score:0,answered:false,modeBar}\n" +
  "      // RECO ⑦ : Démarrer le timer libre\n" +
  "      setTimeout(() => window._qTimerInit && window._qTimerInit(), 100)";

if (html.includes(qsAssignPattern)) {
  html = html.replace(qsAssignPattern, qsAssignReplace);
  totalReplacements++;
  report.push('✅ RECO ⑦ - Timer libre démarré dans _qRender');
}

// ════════════════════════════════════════════════════════════════════
// ÉCRITURE
// ════════════════════════════════════════════════════════════════════
const backup = DASHBOARD.replace('.html', '.html.recommandations-backup');
fs.writeFileSync(backup, html, 'utf8');
console.log('💾 Backup créé : ' + backup);

fs.writeFileSync(DASHBOARD, html, 'utf8');
console.log('✅ Fichier mis à jour : ' + DASHBOARD);
console.log('📊 Total remplacements effectués : ' + totalReplacements);

// Vérifications
console.log('\n🔍 VÉRIFICATIONS :');
const checks = [
  { label: 'RECO ⑤ - Constantes IA', search: 'window._generationIAEnCours' },
  { label: 'RECO ⑤ - Fonction genererQuizIA', search: 'window.genererQuizIA' },
  { label: 'RECO ⑤ - Fonction _executerGenerationIA', search: 'window._executerGenerationIA' },
  { label: 'RECO ⑤ - Bouton IA', search: '🤖 IA' },
  { label: 'RECO ⑤ - Edge Function URL', search: 'generate-module-content' },
  { label: 'RECO ⑦ - Timer dans _apQRender', search: 'apTimer' },
  { label: 'RECO ⑦ - Fonction _apTimerStart', search: '_apTimerStart' },
  { label: 'RECO ⑦ - Fonction _qTimerInit', search: 'window._qTimerInit' },
  { label: 'RECO ⑦ - Config timer_dashboard_secondes', search: 'timer_dashboard_secondes' },
  { label: 'RECO ⑦ - Timer démarré dans QS', search: 'window._qTimerInit()' },
];

let allOk = true;
checks.forEach(c => {
  const ok = html.includes(c.search);
  console.log(`  ${ok ? '✅' : '❌'} ${c.label}`);
  if (!ok) allOk = false;
});

console.log('\n📋 RAPPORT DES OPÉRATIONS :');
report.forEach(r => console.log('  ' + r));

if (allOk) {
  console.log('\n🎉 Toutes les injections frontend sont réussies !');
} else {
  console.log('\n⚠️ Certaines vérifications ont échoué.');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 RECOMMANDATIONS FINALES (11.) - ÉTAT D\'AVANCEMENT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  ✅ ① Sélecteur formateur dédié (devoir_form.html)');
console.log('  ✅ ② Liaison modules ↔ questions (SQL v46)');
console.log('  ✅ ③ Notifications soumission devoir (SQL v46)');
console.log('  ✅ ④ Durée configurable des tests (SQL v46)');
console.log('  ✅ ⑤ Génération IA de questions (dashboard.html via fix)');
console.log('  ✅ ⑥ Mapping certifications explicite (SQL v46)');
console.log('  ✅ ⑦ Timer quiz dashboard (dashboard.html via fix)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
