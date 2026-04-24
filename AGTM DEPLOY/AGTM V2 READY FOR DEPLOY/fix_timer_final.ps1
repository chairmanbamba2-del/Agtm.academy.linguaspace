# fix_timer_final.ps1
$path = "c:\Users\ibrah\Desktop\AGTM ACADEMY DESIGN\AGTM_DIGITAL_ACADEMY_Premium\dashboard.html"
$content = [System.IO.File]::ReadAllText($path)
$count = 0

# 1. Injecter les fonctions timer avant "ÉVALUATION DE MODULE"
$evalMarker = "%VALUATION DE MODULE"
$timerCode = @"

    // ════════════════════════════════════════════════════════════════
    // RECO ⑦ : TIMER CONFIGURABLE POUR QUIZ DASHBOARD
    // ════════════════════════════════════════════════════════════════
    function _apTimerStart() {
      const qs = window._apQS
      if (!qs || qs.timer <= 0 || qs.timerInterval) return
      _apChargerConfigTimer().then(seconds => {
        if (seconds) qs.timer = seconds
      }).catch(()=>{})
      qs.timerStart = Date.now()
      qs.timerInterval = setInterval(() => {
        if (!qs || qs.current >= qs.questions.length) {
          clearInterval(qs.timerInterval)
          qs.timerInterval = null
          return
        }
        const elapsed = Math.floor((Date.now() - qs.timerStart) / 1000)
        const remaining = Math.max(0, qs.timer - elapsed)
        const el = document.getElementById('apTimer')
        if (el) {
          el.style.display = 'inline'
          const mins = Math.floor(remaining / 60)
          const secs = remaining % 60
          el.textContent = '\u23F1 ' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0')
          el.style.color = remaining <= 60 ? '#E04A4A' : remaining <= 180 ? '#F59E0B' : '#4AE090'
        }
        if (remaining <= 0) {
          clearInterval(qs.timerInterval)
          qs.timerInterval = null
          if (typeof showToast === 'function') showToast('\u23F1 Temps \u00E9coul\u00E9 !', 'danger')
          qs.current = qs.questions.length
          _apModView()
        }
      }, 1000)
    }

    async function _apChargerConfigTimer() {
      try {
        const { data, error } = await sb
          .from('config_tests')
          .select('valeur')
          .eq('cle', 'timer_dashboard_secondes')
          .maybeSingle()
        if (!error && data) {
          const v = parseInt(data.valeur)
          return v > 0 ? v : null
        }
      } catch(e) {}
      const saved = localStorage.getItem('agtm_quiz_timer_seconds')
      if (saved) return parseInt(saved)
      return null
    }

    window._apTimerReset = function() {
      const qs = window._apQS
      if (qs) {
        if (qs.timerInterval) clearInterval(qs.timerInterval)
        qs.timerInterval = null
        qs.timerStart = null
        qs.timer = 600
      }
    }

    window._qTimerInit = function() {
      if (window._qTimerInterval) clearInterval(window._qTimerInterval)
      const QS = window.QS
      if (!QS || !QS.questions || QS.current >= QS.questions.length) return
      if (!QS._timerStart) {
        QS._timerStart = Date.now()
        QS._timerDuration = 600
      }
      window._qTimerInterval = setInterval(() => {
        const QS2 = window.QS
        if (!QS2 || QS2.current >= QS2.questions.length) {
          clearInterval(window._qTimerInterval)
          window._qTimerInterval = null
          return
        }
        const elapsed = Math.floor((Date.now() - QS2._timerStart) / 1000)
        const remaining = Math.max(0, QS2._timerDuration - elapsed)
        let tEl = document.getElementById('libreTimer')
        if (!tEl) {
          const tBar = document.querySelector('#content > div > div[style*="display:flex"][style*="align-items:center"][style*="justify-content"]')
          if (tBar) {
            tEl = document.createElement('span')
            tEl.id = 'libreTimer'
            tEl.style.cssText = 'font-size:.78rem;font-family:Space Mono,monospace;font-weight:700;color:#4AE090;margin-left:auto'
            tBar.appendChild(tEl)
          }
        }
        if (tEl) {
          const mins = Math.floor(remaining / 60)
          const secs = remaining % 60
          tEl.textContent = '\u23F1 ' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0')
          tEl.style.color = remaining <= 60 ? '#E04A4A' : remaining <= 180 ? '#F59E0B' : '#4AE090'
        }
        if (remaining <= 0) {
          clearInterval(window._qTimerInterval)
          window._qTimerInterval = null
          if (typeof showToast === 'function') showToast('\u23F1 Temps \u00E9coul\u00E9 !', 'danger')
          QS2.current = QS2.questions.length
          window._qRender()
        }
      }, 1000)
    }

"@

if ($content -match [regex]::Escape($evalMarker)) {
    $content = $content -replace [regex]::Escape($evalMarker), ($timerCode + $evalMarker)
    $count++
    Write-Host "1/4 ✅ Timer functions injected"
} else {
    Write-Host "1/4 ⚠️ Marker not found"
}

# 2. Timer init in _apQRender
$qsPattern = "const qs = window._apQS`r`n      if (!qs.questions.length) return"
$qsReplace = "const qs = window._apQS`r`n      // RECO 7 : Initialiser le timer`r`n      if (qs.timer === undefined) {`r`n        qs.timer = 600`r`n        qs.timerInterval = null`r`n        qs.timerStart = null`r`n        _apTimerStart()`r`n      }`r`n      if (!qs.questions.length) return"

if ($content.Contains($qsPattern)) {
    $content = $content.Replace($qsPattern, $qsReplace)
    $count++
    Write-Host "2/4 ✅ Timer init in _apQRender"
} else {
    Write-Host "2/4 ⚠️ Pattern not found"
}

# 3. Timer init in QS assign
$qsAssignPattern = "QS={questions:qs.sort(()=>Math.random()-.5).slice(0,8),current:0,score:0,answered:false,modeBar}"
$qsAssignReplace = "QS={questions:qs.sort(()=>Math.random()-.5).slice(0,8),current:0,score:0,answered:false,modeBar}`r`n      // RECO 7 : Start timer`r`n      setTimeout(() => window._qTimerInit && window._qTimerInit(), 100)"

if ($content.Contains($qsAssignPattern)) {
    $content = $content.Replace($qsAssignPattern, $qsAssignReplace)
    $count++
    Write-Host "3/4 ✅ Timer init in QS assign"
} else {
    Write-Host "3/4 ⚠️ QS assign pattern not found"
}

# 4. Timer span in _apQRender
$scorePattern = '<span style="font-size:.78rem;font-weight:700;color:#C8960C">Score : '
$timerSpan = '<span id="apTimer" style="font-size:.78rem;font-family:Space Mono,monospace;font-weight:700;color:#4AE090;margin-left:auto;display:none"></span>'

if ($content.Contains($scorePattern)) {
    $content = $content.Replace($scorePattern, $timerSpan + $scorePattern)
    $count++
    Write-Host "4/4 ✅ Timer span in _apQRender"
} else {
    Write-Host "4/4 ⚠️ Score span pattern not found"
}

# Write
[System.IO.File]::WriteAllText($path, $content)
Write-Host "`n✅ Done: $count/4 changes"

# Verify
Write-Host "`nVerification:"
$v = @("_apTimerStart","_apChargerConfigTimer","_qTimerInit","RECO 7","window._qTimerInit")
foreach ($p in $v) {
    if ($content.Contains($p)) { Write-Host "  ✅ $p" }
    else { Write-Host "  ❌ $p" }
}
