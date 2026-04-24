// fix_timer_node.js
const fs = require('fs');
const path = require('path');

const DASHBOARD = path.join(__dirname, 'dashboard.html');
let html = fs.readFileSync(DASHBOARD, 'utf8');
let count = 0;

// ── 1. Timer functions before "ÉVALUATION DE MODULE" ──
const evalMarker = '%VALUATION DE MODULE (onglet \u00C9valuation)';
const timerCode = [
  '',
  '    // ════════════════════════════════════════════════════════════════',
  '    // RECO 7 : TIMER CONFIGURABLE POUR QUIZ DASHBOARD',
  '    // ════════════════════════════════════════════════════════════════',
  '    function _apTimerStart() {',
  '      const qs = window._apQS',
  '      if (!qs || qs.timer <= 0 || qs.timerInterval) return',
  '      _apChargerConfigTimer().then(seconds => {',
  '        if (seconds) qs.timer = seconds',
  '      }).catch(()=>{})',
  '      qs.timerStart = Date.now()',
  '      qs.timerInterval = setInterval(() => {',
  '        if (!qs || qs.current >= qs.questions.length) {',
  '          clearInterval(qs.timerInterval)',
  '          qs.timerInterval = null',
  '          return',
  '        }',
  '        const elapsed = Math.floor((Date.now() - qs.timerStart) / 1000)',
  '        const remaining = Math.max(0, qs.timer - elapsed)',
  '        const el = document.getElementById(\'apTimer\')',
  '        if (el) {',
  '          el.style.display = \'inline\'',
  '          const mins = Math.floor(remaining / 60)',
  '          const secs = remaining % 60',
  '          el.textContent = \'\u23F1 \' + String(mins).padStart(2,\'0\') + \':\' + String(secs).padStart(2,\'0\')',
  '          el.style.color = remaining <= 60 ? \'#E04A4A\' : remaining <= 180 ? \'#F59E0B\' : \'#4AE090\'',
  '        }',
  '        if (remaining <= 0) {',
  '          clearInterval(qs.timerInterval)',
  '          qs.timerInterval = null',
  '          if (typeof showToast === \'function\') showToast(\'\u23F1 Temps \u00E9coul\u00E9 !\', \'danger\')',
  '          qs.current = qs.questions.length',
  '          _apModView()',
  '        }',
  '      }, 1000)',
  '    }',
  '',
  '    async function _apChargerConfigTimer() {',
  '      try {',
  '        const { data, error } = await sb',
  '          .from(\'config_tests\')',
  '          .select(\'valeur\')',
  '          .eq(\'cle\', \'timer_dashboard_secondes\')',
  '          .maybeSingle()',
  '        if (!error && data) {',
  '          const v = parseInt(data.valeur)',
  '          return v > 0 ? v : null',
  '        }',
  '      } catch(e) {}',
  '      const saved = localStorage.getItem(\'agtm_quiz_timer_seconds\')',
  '      if (saved) return parseInt(saved)',
  '      return null',
  '    }',
  '',
  '    window._apTimerReset = function() {',
  '      const qs = window._apQS',
  '      if (qs) {',
  '        if (qs.timerInterval) clearInterval(qs.timerInterval)',
  '        qs.timerInterval = null',
  '        qs.timerStart = null',
  '        qs.timer = 600',
  '      }',
  '    }',
  '',
  '    window._qTimerInit = function() {',
  '      if (window._qTimerInterval) clearInterval(window._qTimerInterval)',
  '      const QS = window.QS',
  '      if (!QS || !QS.questions || QS.current >= QS.questions.length) return',
  '      if (!QS._timerStart) {',
  '        QS._timerStart = Date.now()',
  '        QS._timerDuration = 600',
  '      }',
  '      window._qTimerInterval = setInterval(() => {',
  '        const QS2 = window.QS',
  '        if (!QS2 || QS2.current >= QS2.questions.length) {',
  '          clearInterval(window._qTimerInterval)',
  '          window._qTimerInterval = null',
  '          return',
  '        }',
  '        const elapsed = Math.floor((Date.now() - QS2._timerStart) / 1000)',
  '        const remaining = Math.max(0, QS2._timerDuration - elapsed)',
  '        let tEl = document.getElementById(\'libreTimer\')',
  '        if (!tEl) {',
  '          const tBar = document.querySelector(\'#content > div > div[style*="display:flex"][style*="align-items:center"][style*="justify-content"]\')',
  '          if (tBar) {',
  '            tEl = document.createElement(\'span\')',
  '            tEl.id = \'libreTimer\'',
  '            tEl.style.cssText = \'font-size:.78rem;font-family:Space Mono,monospace;font-weight:700;color:#4AE090;margin-left:auto\'',
  '            tBar.appendChild(tEl)',
  '          }',
  '        }',
  '        if (tEl) {',
  '          const mins = Math.floor(remaining / 60)',
  '          const secs = remaining % 60',
  '          tEl.textContent = \'\u23F1 \' + String(mins).padStart(2,\'0\') + \':\' + String(secs).padStart(2,\'0\')',
  '          tEl.style.color = remaining <= 60 ? \'#E04A4A\' : remaining <= 180 ? \'#F59E0B\' : \'#4AE090\'',
  '        }',
  '        if (remaining <= 0) {',
  '          clearInterval(window._qTimerInterval)',
  '          window._qTimerInterval = null',
  '          if (typeof showToast === \'function\') showToast(\'\u23F1 Temps \u00E9coul\u00E9 !\', \'danger\')',
  '          QS2.current = QS2.questions.length',
  '          window._qRender()',
  '        }',
  '      }, 1000)',
  '    }',
  ''
].join('\n');

if (html.includes(evalMarker)) {
  html = html.replace(evalMarker, timerCode + evalMarker);
  count++;
  console.log('1/5 ✅ Timer functions injected before EVALUATION');
} else {
  console.log('1/5 ⚠️ Marker not found:', evalMarker.substring(0, 30));
}

// ── 2. Timer init in _apQRender ──
const qsPattern = 'const qs = window._apQS\n      if (!qs.questions.length) return';
const qsReplace = 
  'const qs = window._apQS\n' +
  '      // RECO 7 : Initialiser le timer\n' +
  '      if (qs.timer === undefined) {\n' +
  '        qs.timer = 600\n' +
  '        qs.timerInterval = null\n' +
  '        qs.timerStart = null\n' +
  '        _apTimerStart()\n' +
  '      }\n' +
  '      if (!qs.questions.length) return';

if (html.includes(qsPattern)) {
  html = html.replace(qsPattern, qsReplace);
  count++;
  console.log('2/5 ✅ Timer init in _apQRender');
} else {
  console.log('2/5 ⚠️ qsPattern not found');
}

// ── 3. Timer span in _apQRender (score line) ──
const scorePattern = '<span style="font-size:.78rem;font-weight:700;color:#C8960C">Score : ';
const timerSpan = '<span id="apTimer" style="font-size:.78rem;font-family:Space Mono,monospace;font-weight:700;color:#4AE090;margin-left:auto;display:none"></span>';

if (html.includes(scorePattern)) {
  html = html.replace(scorePattern, timerSpan + scorePattern);
  count++;
  console.log('3/5 ✅ Timer span in _apQRender');
} else {
  console.log('3/5 ⚠️ scorePattern not found');
}

// ── 4. Timer init in QS assign ──
const qsAssignPattern = "QS={questions:qs.sort(()=>Math.random()-.5).slice(0,8),current:0,score:0,answered:false,modeBar}";
const qsAssignReplace = 
  "QS={questions:qs.sort(()=>Math.random()-.5).slice(0,8),current:0,score:0,answered:false,modeBar}\n" +
  "      // RECO 7 : Start timer\n" +
  "      setTimeout(() => window._qTimerInit && window._qTimerInit(), 100)";

if (html.includes(qsAssignPattern)) {
  html = html.replace(qsAssignPattern, qsAssignReplace);
  count++;
  console.log('4/5 ✅ Timer init in QS assign');
} else {
  console.log('4/5 ⚠️ qsAssignPattern not found');
}

// ── 5. Bouton IA dans modeBar ──
const modeBarEnd = 'color:#5A7090">${lbl}</button>`).join(\'\')}\n      </div>`\n\n      if(mode===\'module\')';

const iaButtonHtml = 
  ') }\n' +
  '          <button onclick="window.genererQuizIA()"\n' +
  '            style="padding:9px 18px;font-size:.82rem;font-weight:600;border:none;cursor:pointer;background:transparent;margin-bottom:-2px;transition:all .2s;border-bottom:2px solid transparent;color:#8E44AD"\n' +
  '            title="G\u00E9n\u00E9rer des questions personnalis\u00E9es via l\'IA Claude">\u{1F916} IA</button>\n' +
  '      </div>`\n' +
  '\n' +
  '      if(mode===\'module\')';

if (html.includes(modeBarEnd)) {
  html = html.replace(modeBarEnd, iaButtonHtml);
  count++;
  console.log('5/5 ✅ Boton IA in modeBar');
} else {
  console.log('5/5 ⚠️ modeBarEnd pattern not found');
}

// ── Write ──
fs.writeFileSync(DASHBOARD, html, 'utf8');
console.log('\n✅ File saved. Total changes: ' + count + '/5');

// ── Verify ──
const checks = [
  '_apTimerStart', '_apChargerConfigTimer', '_qTimerInit',
  'config_tests', 'timer_dashboard_secondes', 'window._qTimerInit',
  'apTimer style', 'RECO 7', 'genererQuizIA'
];
checks.forEach(c => {
  const found = html.includes(c);
  console.log((found ? '  ✅' : '  ❌') + ' ' + c);
});
