// fix_recommandations_finales_v2.js
// Injecte les 7 recommandations finales dans dashboard.html
// Exécution: node fix_recommandations_finales_v2.js

const fs = require('fs');

console.log('═══════════════════════════════════════════════════');
console.log('📋 INJECTION DES 7 RECOMMANDATIONS FINALES');
console.log('═══════════════════════════════════════════════════\n');

let d = fs.readFileSync('dashboard.html', 'utf8');
let modifs = 0;

// ═══════════════════════════════════════════════════════════════
// 1. SÉLECTEUR FORMATEUR DÉDIÉ
// ═══════════════════════════════════════════════════════════════
// Remplacer le champ texte libre du formateur par un sélecteur depuis la table personnel
// Vérifier si _getPersonnel existe déjà (oui) et améliorer le sélecteur

if (!d.includes('_renderFormateurSelect')) {
  const injectPoint = d.indexOf('function _getPersonnel');
  if (injectPoint > 0) {
    const code = `
    // ── SÉLECTEUR FORMATEUR DÉDIÉ (Recommandation 1) ──────────
    async function _renderFormateurSelect(selectId, selectedId = null) {
      const pers = await _getPersonnel();
      let opts = '<option value="">— Sélectionner un formateur —</option>';
      pers.forEach(p => {
        const full = (p.prenom||'') + ' ' + (p.nom||'');
        const sel = p.id === selectedId ? ' selected' : '';
        opts += '<option value="' + p.id + '"' + sel + '>' + full + ' (' + (p.poste||'Formateur') + ')</option>';
      });
      const el = document.getElementById(selectId);
      if (el) el.innerHTML = opts;
      return pers;
    }

    // Remplacer les champs texte formateur par le sélecteur
    window._upgradeFormateurFields = function() {
      document.querySelectorAll('input[name="formateur"], input[id*="formateur"], input[placeholder*="formateur"], input[placeholder*="Formateur"]').forEach(inp => {
        if (inp.tagName === 'INPUT' && inp.type === 'text') {
          const sel = document.createElement('select');
          sel.id = inp.id || ('formateur_sel_' + Math.random().toString(36).slice(2,7));
          sel.className = inp.className || 'form-select';
          sel.name = inp.name || 'formateur_id';
          sel.style.cssText = inp.style.cssText;
          inp.parentNode.replaceChild(sel, inp);
          _renderFormateurSelect(sel.id);
        }
      });
    };
`;
    d = d.slice(0, injectPoint) + code + d.slice(injectPoint);
    modifs++;
    console.log('✅ 1. Sélecteur formateur dédié injecté');
  } else {
    console.log('⚠️ 1. _getPersonnel non trouvé, injection impossible');
  }
} else {
  console.log('✅ 1. Sélecteur formateur déjà présent');
}

// ═══════════════════════════════════════════════════════════════
// 2. LIAISON MODULES ↔ QUESTIONS
// ═══════════════════════════════════════════════════════════════
// Ajouter module_id et lecon_id dans quiz_questions

if (!d.includes('lecon_id')) {
  // Trouver la fonction renderQuiz ou genererQuizIA
  let idx = d.indexOf('function genererQuizIA');
  if (idx < 0) idx = d.indexOf('genererQuizIA');
  
  if (idx > 0) {
    // Ajouter les champs module_id et lecon_id dans la structure quiz_questions
    const searchStr = 'quiz_questions';
    let qIdx = d.indexOf(searchStr, idx);
    if (qIdx > 0) {
      // Chercher un endroit sûr pour ajouter les champs
      const insertCode = `
      // ── Liaison modules ↔ questions (Recommandation 2) ──────
      // Ajout des champs module_id et lecon_id dans quiz_questions
      if (q.module_id === undefined) q.module_id = null;
      if (q.lecon_id === undefined) q.lecon_id = null;
`;
      // Injecter après la déclaration de quiz_questions
      const afterQ = d.indexOf('];', qIdx);
      if (afterQ > 0) {
        d = d.slice(0, afterQ + 2) + insertCode + d.slice(afterQ + 2);
        modifs++;
        console.log('✅ 2. Liaison modules ↔ questions injectée');
      }
    }
  }
} else {
  console.log('✅ 2. Liaison modules ↔ questions déjà présente');
}

// ═══════════════════════════════════════════════════════════════
// 3. NOTIFICATIONS SOUMISSION DEVOIR
// ═══════════════════════════════════════════════════════════════

if (!d.includes('_notifDevoir')) {
  // Trouver la fonction renderDevoirForm
  let idx = d.indexOf('function renderDevoirForm');
  if (idx < 0) idx = d.indexOf('renderDevoirForm');
  
  if (idx > 0) {
    const code = `
    // ── Notification soumission devoir (Recommandation 3) ────
    async function _notifDevoir(devoirData) {
      try {
        // Récupérer le formateur associé
        const { data: formateur } = await sb.from('personnel')
          .select('id, nom, prenom, email, telephone, whatsapp')
          .eq('id', devoirData.formateur_id || devoirData.personnel_id)
          .maybeSingle();
        
        if (!formateur) {
          console.warn('Formateur non trouvé pour notification devoir');
          return;
        }

        const etudiantNom = (devoirData.etudiant_nom || profile?.prenom || '') + ' ' + (devoirData.etudiant_prenom || profile?.nom || '');
        const moduleNom = devoirData.module_nom || devoirData.titre || 'Devoir';
        
        // Notification email via Supabase
        const { error: emailErr } = await sb.rpc('send_email_notification', {
          p_to: formateur.email,
          p_subject: '📤 Nouveau devoir soumis - AGTM Academy',
          p_html: '<div style="font-family:Arial;padding:20px;max-width:600px">' +
            '<h2 style="color:#D4A017">📤 Nouveau devoir soumis</h2>' +
            '<p><strong>Étudiant :</strong> ' + etudiantNom + '</p>' +
            '<p><strong>Module :</strong> ' + moduleNom + '</p>' +
            '<p><strong>Date :</strong> ' + new Date().toLocaleDateString('fr-FR') + '</p>' +
            '<hr/><p style="color:#666">Connectez-vous au dashboard pour consulter le devoir.</p></div>'
        });
        if (emailErr) console.warn('Email notification error:', emailErr);

        // Notification WhatsApp si numéro disponible
        if (formateur.whatsapp || formateur.telephone) {
          const phone = formateur.whatsapp || formateur.telephone;
          const msg = encodeURIComponent(
            '📤 *Nouveau devoir soumis* - AGTM Academy\n\n' +
            '👤 Étudiant : ' + etudiantNom + '\n' +
            '📚 Module : ' + moduleNom + '\n' +
            '📅 Date : ' + new Date().toLocaleDateString('fr-FR') + '\n\n' +
            'Connectez-vous au dashboard pour consulter.'
          );
          // Tentative d'envoi WhatsApp (nécessite une API WhatsApp configurée)
          console.log('WhatsApp notification would be sent to:', phone);
        }

        toast('✅ Notification envoyée au formateur', 'ok');
      } catch (err) {
        console.warn('Erreur notification devoir:', err);
      }
    }

    // Hook dans la soumission de devoir existante
    window._hookDevoirNotification = function() {
      const submitBtn = document.querySelector('button[onclick*="devoir"], button[id*="submitDevoir"], button[onclick*="submitDevoir"]');
      if (submitBtn) {
        const originalClick = submitBtn.onclick;
        submitBtn.onclick = async function(e) {
          if (originalClick) await originalClick.call(this, e);
          // Récupérer les données du devoir soumis
          const devoirData = {
            formateur_id: document.getElementById('devoir_formateur_id')?.value || 
                          document.querySelector('[name="formateur_id"]')?.value,
            module_nom: document.getElementById('devoir_module')?.value || 
                       document.querySelector('[name="module"]')?.value,
            etudiant_nom: profile?.nom,
            etudiant_prenom: profile?.prenom
          };
          if (devoirData.formateur_id || devoirData.module_nom) {
            await _notifDevoir(devoirData);
          }
        };
      }
    };
`;
    // Injecter après renderDevoirForm
    const afterRender = d.indexOf('}', idx) + 1;
    if (afterRender > 0) {
      d = d.slice(0, afterRender) + code + d.slice(afterRender);
      modifs++;
      console.log('✅ 3. Notifications soumission devoir injectées');
    }
  } else {
    console.log('⚠️ 3. renderDevoirForm non trouvé');
  }
} else {
  console.log('✅ 3. Notifications soumission devoir déjà présentes');
}

// ═══════════════════════════════════════════════════════════════
// 4. DURÉE CONFIGURABLE DES TESTS
// ═══════════════════════════════════════════════════════════════

if (!d.includes('duree_test')) {
  // Trouver config_tests
  let idx = d.indexOf('config_tests');
  if (idx > 0) {
    const code = `
    // ── Durée configurable des tests (Recommandation 4) ──────
    // Permet à l'admin de paramétrer la durée (actuellement 30 min fixes)
    const DUREE_TEST_DEFAUT = 30; // minutes
    let _dureeTest = parseInt(localStorage.getItem('agtm_duree_test')) || DUREE_TEST_DEFAUT;

    window._setDureeTest = function(minutes) {
      _dureeTest = Math.max(5, Math.min(180, parseInt(minutes) || DUREE_TEST_DEFAUT));
      localStorage.setItem('agtm_duree_test', _dureeTest);
      toast('⏱ Durée des tests : ' + _dureeTest + ' min', 'ok');
    };

    window._getDureeTest = function() {
      return _dureeTest;
    };

    // Interface admin pour configurer la durée
    window._renderDureeTestConfig = function(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = 
        '<div class="card" style="padding:16px;margin-bottom:16px">' +
          '<h3 style="color:#E8B84B;margin:0 0 12px 0;font-size:.9rem">⏱ Configuration durée des tests</h3>' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<label style="color:#8AAAC0;font-size:.8rem">Durée (minutes) :</label>' +
            '<input type="number" id="dureeTestInput" value="' + _dureeTest + '" min="5" max="180" style="width:80px;padding:6px 10px;border-radius:6px;border:1px solid #1E3050;background:#0D1B2A;color:#E2D8C0;font-size:.85rem"/>' +
            '<button onclick="window._setDureeTest(document.getElementById(\'dureeTestInput\').value)" class="btn btn-primary" style="padding:6px 14px;font-size:.75rem">Appliquer</button>' +
          '</div>' +
          '<div style="margin-top:8px;font-size:.7rem;color:#5A7090">' +
            'Durée actuelle : <strong style="color:#E8B84B">' + _dureeTest + ' minutes</strong>' +
          '</div>' +
        '</div>';
    };
`;
    // Injecter après config_tests
    const afterConfig = d.indexOf(';', idx) + 1;
    if (afterConfig > 0) {
      d = d.slice(0, afterConfig) + code + d.slice(afterConfig);
      modifs++;
      console.log('✅ 4. Durée configurable des tests injectée');
    }
  } else {
    console.log('⚠️ 4. config_tests non trouvé');
  }
} else {
  console.log('✅ 4. Durée configurable déjà présente');
}

// ═══════════════════════════════════════════════════════════════
// 5. GÉNÉRATION IA DE QUESTIONS
// ═══════════════════════════════════════════════════════════════

if (!d.includes('_genererQuestionsIA')) {
  let idx = d.indexOf('generate-module-content');
  if (idx < 0) idx = d.indexOf('genererQuizIA');
  
  if (idx > 0) {
    const code = `
    // ── Génération IA de questions (Recommandation 5) ────────
    // Intègre l'edge function generate-module-content pour des questions personnalisées
    async function _genererQuestionsIA(moduleId, leconId, nbQuestions = 5) {
      try {
        const { data, error } = await sb.functions.invoke('generate-module-content', {
          body: { 
            action: 'generate_quiz',
            module_id: moduleId,
            lecon_id: leconId,
            nb_questions: nbQuestions,
            langue: localStorage.getItem('agtm_lang') || 'fr'
          }
        });
        
        if (error) throw error;
        
        if (data && data.questions) {
          // Formater les questions pour le quiz
          return data.questions.map((q, i) => ({
            id: 'ai_q_' + Date.now() + '_' + i,
            question: q.question,
            options: q.options || [],
            reponse: q.reponse || q.correct_answer || '',
            explication: q.explication || '',
            module_id: moduleId,
            lecon_id: leconId,
            certification: q.certification || null,
            difficulte: q.difficulte || 'moyen',
            type: q.type || 'qcm'
          }));
        }
        return [];
      } catch (err) {
        console.warn('Erreur génération IA questions:', err);
        toast('⚠️ Erreur génération IA', 'err');
        return [];
      }
    }

    // Améliorer genererQuizIA existant pour utiliser l'IA
    window._genererQuizAvecIA = async function(moduleId, leconId, nbQuestions) {
      const questions = await _genererQuestionsIA(moduleId, leconId, nbQuestions);
      if (questions.length > 0) {
        // Injecter les questions dans le quiz
        if (window._quizQuestions) {
          window._quizQuestions = window._quizQuestions.concat(questions);
        } else {
          window._quizQuestions = questions;
        }
        toast('🧠 ' + questions.length + ' questions générées par IA', 'ok');
        return questions;
      }
      return [];
    };
`;
    // Injecter après generate-module-content
    const afterGen = d.indexOf(';', idx) + 1;
    if (afterGen > 0) {
      d = d.slice(0, afterGen) + code + d.slice(afterGen);
      modifs++;
      console.log('✅ 5. Génération IA de questions injectée');
    }
  } else {
    console.log('⚠️ 5. generate-module-content non trouvé');
  }
} else {
  console.log('✅ 5. Génération IA déjà présente');
}

// ═══════════════════════════════════════════════════════════════
// 6. MAPPING CERTIFICATIONS EXPLICITE
// ═══════════════════════════════════════════════════════════════

if (!d.includes('_renderCertificationSelect')) {
  let idx = d.indexOf('certification');
  if (idx > 0) {
    const code = `
    // ── Mapping certifications explicite (Recommandation 6) ──
    // Ajoute champ certification (TOEIC/TOEFL/IELTS) dans quiz_questions
    const CERTIFICATIONS = [
      { id: 'TOEIC', label: 'TOEIC', color: '#4A90D9' },
      { id: 'TOEFL', label: 'TOEFL', color: '#E04A4A' },
      { id: 'IELTS', label: 'IELTS', color: '#4AE090' },
      { id: 'AGTM', label: 'AGTM Academy', color: '#D4A017' },
      { id: 'AUTRE', label: 'Autre', color: '#8AAAC0' }
    ];

    window._renderCertificationSelect = function(selectId, selected = null) {
      let opts = '<option value="">— Certification —</option>';
      CERTIFICATIONS.forEach(c => {
        const sel = c.id === selected ? ' selected' : '';
        opts += '<option value="' + c.id + '"' + sel + '>' + c.label + '</option>';
      });
      const el = document.getElementById(selectId);
      if (el) el.innerHTML = opts;
    };

    window._getCertificationColor = function(certId) {
      const c = CERTIFICATIONS.find(x => x.id === certId);
      return c ? c.color : '#8AAAC0';
    };

    window._getCertificationLabel = function(certId) {
      const c = CERTIFICATIONS.find(x => x.id === certId);
      return c ? c.label : certId || '—';
    };

    // Badge certification
    window._certBadge = function(certId) {
      if (!certId) return '';
      const c = CERTIFICATIONS.find(x => x.id === certId);
      return '<span class="badge" style="background:' + (c?.color||'#8AAAC0') + '20;color:' + (c?.color||'#8AAAC0') + ';border:1px solid ' + (c?.color||'#8AAAC0') + '40;padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:600">' + (c?.label||certId) + '</span>';
    };
`;
    // Injecter après certification
    const afterCert = d.indexOf(';', idx) + 1;
    if (afterCert > 0) {
      d = d.slice(0, afterCert) + code + d.slice(afterCert);
      modifs++;
      console.log('✅ 6. Mapping certifications explicite injecté');
    }
  } else {
    console.log('⚠️ 6. certification non trouvé');
  }
} else {
  console.log('✅ 6. Mapping certifications déjà présent');
}

// ═══════════════════════════════════════════════════════════════
// 7. TIMER QUIZ DASHBOARD
// ═══════════════════════════════════════════════════════════════

if (!d.includes('_renderQuizTimer')) {
  let idx = d.indexOf('apTimerStart');
  if (idx < 0) idx = d.indexOf('qTimerInit');
  
  if (idx > 0) {
    const code = `
    // ── Timer quiz dashboard (Recommandation 7) ──────────────
    // Ajoute un timer aux quiz intégrés aux modules du dashboard
    let _quizTimerInterval = null;
    let _quizTimerSeconds = 0;
    let _quizTimerTotal = 0;

    window._renderQuizTimer = function(containerId, dureeMinutes) {
      const duree = dureeMinutes || window._getDureeTest ? window._getDureeTest() : 30;
      _quizTimerTotal = duree * 60;
      _quizTimerSeconds = _quizTimerTotal;
      
      const container = document.getElementById(containerId);
      if (!container) return;
      
      container.innerHTML = 
        '<div id="quizTimerDisplay" style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:#0D1B2A;border:1px solid #1E3050;border-radius:8px">' +
          '<span style="font-size:1rem">⏱</span>' +
          '<span id="quizTimerValue" style="font-size:1.1rem;font-weight:800;color:#E8B84B;font-variant-numeric:tabular-nums">' + _formatTimer(_quizTimerSeconds) + '</span>' +
          '<span style="font-size:.7rem;color:#5A7090">/ ' + duree + ' min</span>' +
          '<div id="quizTimerBar" style="flex:1;height:4px;background:#1E3050;border-radius:2px;overflow:hidden">' +
            '<div id="quizTimerProgress" style="height:100%;width:100%;background:linear-gradient(90deg,#4AE090,#D4A017);border-radius:2px;transition:width 1s linear"></div>' +
          '</div>' +
        '</div>';
      
      _startQuizTimer();
    };

    function _formatTimer(seconds) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function _startQuizTimer() {
      if (_quizTimerInterval) clearInterval(_quizTimerInterval);
      
      _quizTimerInterval = setInterval(() => {
        _quizTimerSeconds--;
        
        const display = document.getElementById('quizTimerValue');
        const progress = document.getElementById('quizTimerProgress');
        
        if (display) display.textContent = _formatTimer(Math.max(0, _quizTimerSeconds));
        if (progress) progress.style.width = Math.max(0, (_quizTimerSeconds / _quizTimerTotal) * 100) + '%';
        
        // Alerte quand il reste 5 minutes
        if (_quizTimerSeconds === 300) {
          toast('⏱ Il reste 5 minutes !', 'warn');
          if (display) display.style.color = '#E04A4A';
        }
        
        // Alerte quand il reste 1 minute
        if (_quizTimerSeconds === 60) {
          toast('⚠️ Il reste 1 minute !', 'err');
        }
        
        // Temps écoulé
        if (_quizTimerSeconds <= 0) {
          clearInterval(_quizTimerInterval);
          _quizTimerInterval = null;
          toast('⏱ Temps écoulé ! Soumission automatique...', 'err');
          // Déclencher la soumission automatique
          if (window._submitQuiz) window._submitQuiz();
          if (display) {
            display.textContent = '00:00';
            display.style.color = '#E04A4A';
          }
        }
      }, 1000);
    }

    window._stopQuizTimer = function() {
      if (_quizTimerInterval) {
        clearInterval(_quizTimerInterval);
        _quizTimerInterval = null;
      }
    };

    window._resetQuizTimer = function(dureeMinutes) {
      _stopQuizTimer();
      const duree = dureeMinutes || window._getDureeTest ? window._getDureeTest() : 30;
      _quizTimerTotal = duree * 60;
      _quizTimerSeconds = _quizTimerTotal;
      
      const display = document.getElementById('quizTimerValue');
      const progress = document.getElementById('quizTimerProgress');
      if (display) {
        display.textContent = _formatTimer(_quizTimerSeconds);
        display.style.color = '#E8B84B';
      }
      if (progress) progress.style.width = '100%';
      
      _startQuizTimer();
    };

    // Hook dans le rendu quiz existant
    window._hookQuizTimer = function() {
      const quizContainer = document.getElementById('quizContainer') || document.querySelector('.quiz-section');
      if (quizContainer && !document.getElementById('quizTimerDisplay')) {
        const timerContainer = document.createElement('div');
        timerContainer.id = 'quizTimerContainer';
        timerContainer.style.marginBottom = '16px';
        quizContainer.parentNode.insertBefore(timerContainer, quizContainer);
        window._renderQuizTimer('quizTimerContainer');
      }
    };
`;
    // Injecter après apTimerStart
    const afterTimer = d.indexOf(';', idx) + 1;
    if (afterTimer > 0) {
      d = d.slice(0, afterTimer) + code + d.slice(afterTimer);
      modifs++;
      console.log('✅ 7. Timer quiz dashboard injecté');
    }
  } else {
    console.log('⚠️ 7. apTimerStart non trouvé');
  }
} else {
  console.log('✅ 7. Timer quiz dashboard déjà présent');
}

// ═══════════════════════════════════════════════════════════════
// SAUVEGARDE
// ═══════════════════════════════════════════════════════════════
if (modifs > 0) {
  fs.writeFileSync('dashboard.html', d, 'utf8');
  console.log('\n✅ ' + modifs + ' recommandations injectées avec succès dans dashboard.html');
} else {
  console.log('\n⚠️ Aucune modification nécessaire');
}

console.log('\n═══════════════════════════════════════════════════');
