#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Injecte dans index.html :
1. Service Worker registration + bouton PWA install
2. Widget Assistante IA Marketing (chatbot flottant)
3. Section Avantages Concurrentiels (outils technologiques)
4. Sync Supabase marketing (stats dynamiques)
"""
import sys

# ─── BLOC PWA + SW ────────────────────────────────────────────────────────────
PWA_SCRIPT = '''
  <!-- ═══ PWA : Service Worker + Bouton Install ═══ -->
  <style>
    /* Bouton Install PWA */
    #pwaInstallBtn {
      display: none;
      position: fixed;
      bottom: 90px;
      right: 24px;
      z-index: 8888;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #2A6FD4 0%, #5A9FFF 100%);
      border: 1px solid rgba(90,159,255,0.4);
      border-radius: 99px;
      color: white;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(42,111,212,0.4);
      transition: all 0.3s;
      animation: pwaFloat 3s ease-in-out infinite;
    }
    #pwaInstallBtn.visible { display: flex; }
    #pwaInstallBtn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(42,111,212,0.5); }
    @keyframes pwaFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    /* Toast PWA */
    #pwaToast {
      display: none;
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15,26,46,0.95);
      border: 1px solid rgba(212,160,23,0.3);
      border-radius: 12px;
      padding: 14px 24px;
      color: #F0EAD6;
      font-size: 0.82rem;
      z-index: 9000;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      white-space: nowrap;
    }
    #pwaToast.visible { display: block; animation: toastIn 0.3s ease; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  </style>

  <!-- Bouton Install PWA -->
  <button id="pwaInstallBtn" onclick="window._installPWA()">
    &#128247; Installer l'App
  </button>
  <div id="pwaToast">&#10003; Application installée avec succès !</div>

  <script>
    // ── Service Worker Registration ──
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(reg) { console.log('AGTM SW: Enregistré', reg.scope); })
          .catch(function(err) { console.warn('AGTM SW: Erreur', err); });
      });
    }

    // ── PWA Install Prompt ──
    var _deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      _deferredPrompt = e;
      var btn = document.getElementById('pwaInstallBtn');
      if (btn) btn.classList.add('visible');
    });

    window._installPWA = function() {
      if (!_deferredPrompt) return;
      _deferredPrompt.prompt();
      _deferredPrompt.userChoice.then(function(choice) {
        if (choice.outcome === 'accepted') {
          var btn = document.getElementById('pwaInstallBtn');
          if (btn) btn.classList.remove('visible');
          var toast = document.getElementById('pwaToast');
          if (toast) {
            toast.classList.add('visible');
            setTimeout(function() { toast.classList.remove('visible'); }, 3000);
          }
        }
        _deferredPrompt = null;
      });
    };

    window.addEventListener('appinstalled', function() {
      var btn = document.getElementById('pwaInstallBtn');
      if (btn) btn.classList.remove('visible');
      console.log('AGTM PWA: Installée');
    });
  </script>

'''

# ─── WIDGET CHATBOT IA MARKETING ─────────────────────────────────────────────
CHATBOT_WIDGET = '''
  <!-- ═══ ASSISTANTE IA MARKETING — Widget Flottant ═══ -->
  <style>
    /* Bouton flottant */
    #aiChatToggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9990;
      width: 60px; height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D4A017 0%, #F0C040 100%);
      border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem;
      box-shadow: 0 8px 32px rgba(212,160,23,0.5), 0 0 0 0 rgba(212,160,23,0.4);
      animation: chatPulse 2.5s ease-in-out infinite;
      transition: all 0.3s;
    }
    #aiChatToggle:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(212,160,23,0.6); }
    @keyframes chatPulse {
      0%, 100% { box-shadow: 0 8px 32px rgba(212,160,23,0.5), 0 0 0 0 rgba(212,160,23,0.4); }
      50% { box-shadow: 0 8px 32px rgba(212,160,23,0.5), 0 0 0 12px rgba(212,160,23,0); }
    }
    /* Badge notification */
    #aiChatBadge {
      position: absolute;
      top: -4px; right: -4px;
      width: 20px; height: 20px;
      background: #EF4444;
      border-radius: 50%;
      border: 2px solid #060C14;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6rem;
      font-weight: 700;
      color: white;
    }
    /* Fenêtre chat */
    #aiChatWindow {
      position: fixed;
      bottom: 96px;
      right: 24px;
      z-index: 9989;
      width: 360px;
      max-height: 520px;
      background: linear-gradient(135deg, #0A1628 0%, #060C14 100%);
      border: 1px solid rgba(212,160,23,0.25);
      border-radius: 20px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(212,160,23,0.08);
      display: flex; flex-direction: column;
      overflow: hidden;
      transform: scale(0.8) translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      transform-origin: bottom right;
    }
    #aiChatWindow.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    /* Header chat */
    .ai-chat-header {
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(212,160,23,0.12) 0%, rgba(42,111,212,0.08) 100%);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex; align-items: center; gap: 12px;
    }
    .ai-chat-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D4A017, #F0C040);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .ai-chat-info { flex: 1; }
    .ai-chat-name { font-size: 0.88rem; font-weight: 700; color: #F0EAD6; }
    .ai-chat-status { font-size: 0.68rem; color: #22C55E; display: flex; align-items: center; gap: 4px; }
    .ai-chat-status::before { content: ''; width: 6px; height: 6px; background: #22C55E; border-radius: 50%; display: inline-block; animation: statusBlink 2s ease-in-out infinite; }
    @keyframes statusBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .ai-chat-close { background: none; border: none; color: #6A8098; cursor: pointer; font-size: 1rem; padding: 4px; transition: color 0.2s; }
    .ai-chat-close:hover { color: #EF4444; }
    /* Messages */
    .ai-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(212,160,23,0.2) transparent;
    }
    .ai-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.8rem;
      line-height: 1.5;
    }
    .ai-msg.bot {
      background: rgba(15,26,46,0.8);
      border: 1px solid rgba(255,255,255,0.06);
      color: #C0D0E0;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .ai-msg.user {
      background: linear-gradient(135deg, rgba(212,160,23,0.2), rgba(212,160,23,0.1));
      border: 1px solid rgba(212,160,23,0.25);
      color: #F0EAD6;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    /* Suggestions rapides */
    .ai-quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 16px 12px;
    }
    .ai-quick-btn {
      padding: 5px 12px;
      background: rgba(42,111,212,0.1);
      border: 1px solid rgba(42,111,212,0.25);
      border-radius: 99px;
      color: #5A9FFF;
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .ai-quick-btn:hover { background: rgba(42,111,212,0.2); border-color: rgba(42,111,212,0.4); }
    /* Input */
    .ai-chat-input-area {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    #aiChatInput {
      flex: 1;
      background: rgba(15,26,46,0.8);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 99px;
      padding: 8px 16px;
      color: #F0EAD6;
      font-size: 0.78rem;
      outline: none;
      transition: border-color 0.2s;
    }
    #aiChatInput:focus { border-color: rgba(212,160,23,0.4); }
    #aiChatInput::placeholder { color: #4A5568; }
    #aiChatSend {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D4A017, #F0C040);
      border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    #aiChatSend:hover { transform: scale(1.1); }
    /* Typing indicator */
    .ai-typing {
      display: flex; gap: 4px; align-items: center;
      padding: 10px 14px;
      background: rgba(15,26,46,0.8);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      width: fit-content;
    }
    .ai-typing span {
      width: 6px; height: 6px;
      background: #6A8098;
      border-radius: 50%;
      animation: typingDot 1.4s ease-in-out infinite;
    }
    .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }
    /* Mobile */
    @media (max-width: 480px) {
      #aiChatWindow { width: calc(100vw - 32px); right: 16px; bottom: 88px; }
      #aiChatToggle { right: 16px; bottom: 16px; }
      #pwaInstallBtn { right: 16px; bottom: 88px; }
    }
  </style>

  <!-- Bouton flottant IA -->
  <button id="aiChatToggle" onclick="window._toggleAIChat()" title="Assistante IA AGTM">
    <span id="aiChatIcon">🤖</span>
    <span id="aiChatBadge">1</span>
  </button>

  <!-- Fenêtre de chat -->
  <div id="aiChatWindow">
    <div class="ai-chat-header">
      <div class="ai-chat-avatar">🤖</div>
      <div class="ai-chat-info">
        <div class="ai-chat-name">Amara — Assistante AGTM</div>
        <div class="ai-chat-status">En ligne · Répond en quelques secondes</div>
      </div>
      <button class="ai-chat-close" onclick="window._toggleAIChat()">✕</button>
    </div>
    <div class="ai-chat-messages" id="aiChatMessages">
      <div class="ai-msg bot">
        👋 Bonjour ! Je suis <strong>Amara</strong>, votre assistante IA AGTM Digital Academy.<br><br>
        Comment puis-je vous aider aujourd'hui ? 😊
      </div>
    </div>
    <div class="ai-quick-replies" id="aiQuickReplies">
      <button class="ai-quick-btn" onclick="window._aiQuickReply('Quelles formations proposez-vous ?')">📚 Nos formations</button>
      <button class="ai-quick-btn" onclick="window._aiQuickReply('Quels sont vos tarifs ?')">💰 Tarifs</button>
      <button class="ai-quick-btn" onclick="window._aiQuickReply('Comment m\'inscrire ?')">📝 S\'inscrire</button>
      <button class="ai-quick-btn" onclick="window._aiQuickReply('Parlez-moi de l\'IA pédagogique')">🤖 IA pédagogique</button>
    </div>
    <div class="ai-chat-input-area">
      <input type="text" id="aiChatInput" placeholder="Posez votre question..." onkeydown="if(event.key==='Enter') window._aiSendMsg()">
      <button id="aiChatSend" onclick="window._aiSendMsg()">➤</button>
    </div>
  </div>

  <script>
    // ═══════════════════════════════════════════════════════════
    // ASSISTANTE IA MARKETING — Logique chatbot
    // ═══════════════════════════════════════════════════════════
    var _aiChatOpen = false;

    window._toggleAIChat = function() {
      _aiChatOpen = !_aiChatOpen;
      var win = document.getElementById('aiChatWindow');
      var icon = document.getElementById('aiChatIcon');
      var badge = document.getElementById('aiChatBadge');
      if (win) win.classList.toggle('open', _aiChatOpen);
      if (icon) icon.textContent = _aiChatOpen ? '✕' : '🤖';
      if (badge) badge.style.display = _aiChatOpen ? 'none' : 'flex';
      if (_aiChatOpen) {
        var input = document.getElementById('aiChatInput');
        if (input) setTimeout(function() { input.focus(); }, 300);
      }
    };

    window._aiQuickReply = function(text) {
      var input = document.getElementById('aiChatInput');
      if (input) { input.value = text; window._aiSendMsg(); }
    };

    window._aiSendMsg = function() {
      var input = document.getElementById('aiChatInput');
      if (!input || !input.value.trim()) return;
      var msg = input.value.trim();
      input.value = '';
      _aiAddMsg(msg, 'user');
      document.getElementById('aiQuickReplies').style.display = 'none';
      setTimeout(function() { _aiRespond(msg); }, 800);
    };

    function _aiAddMsg(text, type) {
      var container = document.getElementById('aiChatMessages');
      if (!container) return;
      var div = document.createElement('div');
      div.className = 'ai-msg ' + type;
      div.innerHTML = text;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

    function _aiShowTyping() {
      var container = document.getElementById('aiChatMessages');
      if (!container) return null;
      var div = document.createElement('div');
      div.className = 'ai-typing';
      div.id = 'aiTypingIndicator';
      div.innerHTML = '<span></span><span></span><span></span>';
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
      return div;
    }

    function _aiRespond(msg) {
      var typing = _aiShowTyping();
      var lower = msg.toLowerCase();
      var response = '';

      if (lower.includes('formation') || lower.includes('cours') || lower.includes('module')) {
        response = '📚 Nous proposons <strong>100+ modules IA</strong> couvrant tous les niveaux A1→C1 :<br><br>• 💼 Business English (réunions, négociations)<br>• 🎓 Préparation TOEFL/IELTS<br>• 📝 Professional Writing<br>• 💻 Technical English (IA, Dev)<br>• 🗣️ Conversation & Pronunciation<br><br>Chaque module est généré par IA et validé par nos experts. <a href="inscription.html" style="color:#D4A017;">S\'inscrire →</a>';
      } else if (lower.includes('tarif') || lower.includes('prix') || lower.includes('coût') || lower.includes('abonnement')) {
        response = '💰 Nos formules d\'abonnement :<br><br>• <strong style="color:#D4A017;">Starter</strong> — Accès 10 modules/mois<br>• <strong style="color:#5A9FFF;">Premium</strong> — Accès illimité + formateur dédié<br>• <strong style="color:#22C55E;">Elite</strong> — Premium + coaching 1-to-1 + certificat<br><br>📞 Contactez-nous pour un devis personnalisé : <strong>+225 07 123 45 67</strong>';
      } else if (lower.includes('inscri') || lower.includes('rejoindre') || lower.includes('commencer')) {
        response = '📝 Pour vous inscrire, c\'est simple :<br><br>1. Cliquez sur <a href="inscription.html" style="color:#D4A017;">S\'inscrire</a><br>2. Remplissez le formulaire (2 min)<br>3. Passez votre test de placement gratuit<br>4. Accédez immédiatement à vos modules !<br><br>✅ Aucun engagement · Accès immédiat';
      } else if (lower.includes('ia') || lower.includes('intelligence') || lower.includes('technolog')) {
        response = '🤖 Notre <strong>Moteur IA Pédagogique</strong> est unique :<br><br>• Génération de modules en <strong><10 secondes</strong> via Claude 3.5<br>• Validation pédagogique automatique<br>• Quiz adaptatifs personnalisés<br>• Suivi de progression en temps réel<br>• Assistante vocale intégrée<br>• Synchronisation Supabase en temps réel<br><br>🏆 100% validé par nos experts pédagogiques';
      } else if (lower.includes('contact') || lower.includes('téléphone') || lower.includes('email') || lower.includes('adresse')) {
        response = '📞 Nos coordonnées :<br><br>• 📧 contact.eipservices@gmail.com<br>• 📱 +225 07 123 45 67<br>• 🏢 Abidjan, Côte d\'Ivoire<br>• 🕐 Disponible 7j/7, 8h-20h<br><br>Ou utilisez notre <a href="assistante-ia-chatbot.html" style="color:#D4A017;">Assistante IA complète →</a>';
      } else if (lower.includes('certif') || lower.includes('diplôme')) {
        response = '🏆 Nos certifications :<br><br>• Certificat AGTM Digital Academy (reconnu)<br>• Préparation TOEFL, IELTS, Cambridge<br>• Attestation de formation professionnelle<br><br>Tous nos certificats sont <strong>vérifiables en ligne</strong> via notre système blockchain.';
      } else {
        response = '🤔 Merci pour votre question ! Pour une réponse plus complète, je vous invite à :<br><br>• 💬 Utiliser notre <a href="assistante-ia-chatbot.html" style="color:#D4A017;">Assistante IA complète</a><br>• 📞 Nous appeler : <strong>+225 07 123 45 67</strong><br>• 📧 Écrire à : contact.eipservices@gmail.com<br><br>Nous répondons en moins de 2 heures ! 😊';
      }

      setTimeout(function() {
        if (typing) typing.remove();
        _aiAddMsg(response, 'bot');
      }, 1200 + Math.random() * 800);
    }

    // Afficher le badge après 3 secondes (message de bienvenue)
    setTimeout(function() {
      var badge = document.getElementById('aiChatBadge');
      if (badge && !_aiChatOpen) badge.style.display = 'flex';
    }, 3000);
  </script>

'''

# ─── SECTION AVANTAGES CONCURRENTIELS ────────────────────────────────────────
AVANTAGES_SECTION = '''
  <!-- ═══ SECTION AVANTAGES CONCURRENTIELS ═══ -->
  <section style="padding:80px 24px;background:linear-gradient(180deg,#0A1220 0%,#060C14 100%);position:relative;overflow:hidden;">
    <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:800px;height:1px;background:linear-gradient(90deg,transparent,rgba(212,160,23,0.3),transparent);"></div>
    <div style="max-width:1100px;margin:0 auto;">
      <!-- En-tête -->
      <div style="text-align:center;margin-bottom:56px;">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 16px;background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.2);border-radius:99px;font-size:0.68rem;font-family:monospace;color:#D4A017;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">
          &#9670; Pourquoi AGTM ? &#9670;
        </div>
        <h2 style="font-family:Georgia,serif;font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;color:#F0EAD6;line-height:1.2;margin-bottom:12px;">
          Nos <span style="background:linear-gradient(135deg,#D4A017,#F0C040);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Avantages Concurrentiels</span>
        </h2>
        <p style="font-size:0.95rem;color:#6A8098;max-width:520px;margin:0 auto;line-height:1.7;">
          Une combinaison unique d'expertise humaine et d'outils technologiques de pointe
          pour une expérience d'apprentissage sans équivalent en Afrique francophone.
        </p>
      </div>

      <!-- Grille 3x2 avantages -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:48px;">

        <!-- 1. IA Pédagogique -->
        <div style="background:rgba(15,26,46,0.7);border:1px solid rgba(212,160,23,0.15);border-radius:16px;padding:28px;position:relative;overflow:hidden;transition:all 0.3s;" onmouseover="this.style.borderColor='rgba(212,160,23,0.4)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='rgba(212,160,23,0.15)';this.style.transform='translateY(0)'">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#D4A017,transparent);"></div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:48px;height:48px;background:rgba(212,160,23,0.12);border:1px solid rgba(212,160,23,0.3);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#129504;</div>
            <div>
              <div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#F0EAD6;">IA Pédagogique Claude 3.5</div>
              <div style="font-size:0.68rem;color:#D4A017;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;">Exclusif AGTM</div>
            </div>
          </div>
          <p style="font-size:0.8rem;color:#8AAAC0;line-height:1.6;margin-bottom:16px;">Génération de modules en <10 secondes. 100+ contenus validés par experts. Quiz adaptatifs et suivi personnalisé.</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span style="padding:3px 10px;background:rgba(212,160,23,0.1);border:1px solid rgba(212,160,23,0.2);border-radius:99px;font-size:0.62rem;color:#D4A017;">Claude 3.5 Sonnet</span>
            <span style="padding:3px 10px;background:rgba(212,160,23,0.1);border:1px solid rgba(212,160,23,0.2);border-radius:99px;font-size:0.62rem;color:#D4A017;">100+ modules</span>
          </div>
        </div>

        <!-- 2. Supabase Real-time -->
        <div style="background:rgba(15,26,46,0.7);border:1px solid rgba(42,111,212,0.15);border-radius:16px;padding:28px;position:relative;overflow:hidden;transition:all 0.3s;" onmouseover="this.style.borderColor='rgba(42,111,212,0.4)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='rgba(42,111,212,0.15)';this.style.transform='translateY(0)'">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#2A6FD4,transparent);"></div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:48px;height:48px;background:rgba(42,111,212,0.12);border:1px solid rgba(42,111,212,0.3);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#9889;</div>
            <div>
              <div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#F0EAD6;">Base de Données Temps Réel</div>
              <div style="font-size:0.68rem;color:#5A9FFF;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;">Supabase PostgreSQL</div>
            </div>
          </div>
          <p style="font-size:0.8rem;color:#8AAAC0;line-height:1.6;margin-bottom:16px;">Suivi de progression en temps réel, synchronisation multi-appareils, sécurité RLS enterprise-grade.</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span style="padding:3px 10px;background:rgba(42,111,212,0.1);border:1px solid rgba(42,111,212,0.2);border-radius:99px;font-size:0.62rem;color:#5A9FFF;">PostgreSQL</span>
            <span style="padding:3px 10px;background:rgba(42,111,212,0.1);border:1px solid rgba(42,111,212,0.2);border-radius:99px;font-size:0.62rem;color:#5A9FFF;">Real-time</span>
          </div>
        </div>

        <!-- 3. PWA Multi-appareils -->
        <div style="background:rgba(15,26,46,0.7);border:1px solid rgba(34,197,94,0.15);border-radius:16px;padding:28px;position:relative;overflow:hidden;transition:all 0.3s;" onmouseover="this.style.borderColor='rgba(34,197,94,0.4)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='rgba(34,197,94,0.15)';this.style.transform='translateY(0)'">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#22C55E,transparent);"></div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:48px;height:48px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#128247;</div>
            <div>
              <div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#F0EAD6;">Application PWA Installable</div>
              <div style="font-size:0.68rem;color:#22C55E;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;">iOS · Android · Desktop</div>
            </div>
          </div>
          <p style="font-size:0.8rem;color:#8AAAC0;line-height:1.6;margin-bottom:16px;">Installez l'app sur tous vos appareils. Fonctionne hors-ligne. Notifications push. Expérience native.</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span style="padding:3px 10px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);border-radius:99px;font-size:0.62rem;color:#22C55E;">Hors-ligne</span>
            <span style="padding:3px 10px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);border-radius:99px;font-size:0.62rem;color:#22C55E;">Multi-appareils</span>
          </div>
        </div>

        <!-- 4. Formateurs certifiés -->
        <div style="background:rgba(15,26,46,0.7);border:1px solid rgba(245,158,11,0.15);border-radius:16px;padding:28px;position:relative;overflow:hidden;transition:all 0.3s;" onmouseover="this.style.borderColor='rgba(245,158,11,0.4)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='rgba(245,158,11,0.15)';this.style.transform='translateY(0)'">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#F59E0B,transparent);"></div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:48px;height:48px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#127942;</div>
            <div>
              <div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#F0EAD6;">Formateurs Certifiés CECRL</div>
              <div style="font-size:0.68rem;color:#F59E0B;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;">8+ experts</div>
            </div>
          </div>
          <p style="font-size:0.8rem;color:#8AAAC0;line-height:1.6;margin-bottom:16px;">Formateurs natifs et certifiés CELTA/DELTA. Coaching 1-to-1 disponible. Suivi personnalisé de chaque apprenant.</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span style="padding:3px 10px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:99px;font-size:0.62rem;color:#F59E0B;">CELTA/DELTA</span>
            <span style="padding:3px 10px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:99px;font-size:0.62rem;color:#F59E0B;">1-to-1</span>
          </div>
        </div>

        <!-- 5. Assistante vocale IA -->
        <div style="background:rgba(15,26,46,0.7);border:1px solid rgba(168,85,247,0.15);border-radius:16px;padding:28px;position:relative;overflow:hidden;transition:all 0.3s;" onmouseover="this.style.borderColor='rgba(168,85,247,0.4)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='rgba(168,85,247,0.15)';this.style.transform='translateY(0)'">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#A855F7,transparent);"></div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:48px;height:48px;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.3);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#127908;</div>
            <div>
              <div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#F0EAD6;">Assistante Vocale IA</div>
              <div style="font-size:0.68rem;color:#C084FC;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;">Speech-to-Text</div>
            </div>
          </div>
          <p style="font-size:0.8rem;color:#8AAAC0;line-height:1.6;margin-bottom:16px;">Pratiquez votre prononciation avec notre IA vocale. Analyse en temps réel, score de prononciation, feedback instantané.</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span style="padding:3px 10px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);border-radius:99px;font-size:0.62rem;color:#C084FC;">Web Speech API</span>
            <span style="padding:3px 10px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);border-radius:99px;font-size:0.62rem;color:#C084FC;">Score IA</span>
          </div>
        </div>

        <!-- 6. Certificats blockchain -->
        <div style="background:rgba(15,26,46,0.7);border:1px solid rgba(212,160,23,0.25);border-radius:16px;padding:28px;position:relative;overflow:hidden;transition:all 0.3s;" onmouseover="this.style.borderColor='rgba(212,160,23,0.5)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='rgba(212,160,23,0.25)';this.style.transform='translateY(0)'">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#D4A017,transparent);opacity:0.8;"></div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:48px;height:48px;background:rgba(212,160,23,0.15);border:1px solid rgba(212,160,23,0.4);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#127891;</div>
            <div>
              <div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#F0EAD6;">Certificats Vérifiables</div>
              <div style="font-size:0.68rem;color:#D4A017;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;">Reconnus & Sécurisés</div>
            </div>
          </div>
          <p style="font-size:0.8rem;color:#8AAAC0;line-height:1.6;margin-bottom:16px;">Certificats numériques vérifiables en ligne. Reconnus par les employeurs. Partageable sur LinkedIn et CV.</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span style="padding:3px 10px;background:rgba(212,160,23,0.1);border:1px solid rgba(212,160,23,0.2);border-radius:99px;font-size:0.62rem;color:#D4A017;">Vérifiable</span>
            <span style="padding:3px 10px;background:rgba(212,160,23,0.1);border:1px solid rgba(212,160,23,0.2);border-radius:99px;font-size:0.62rem;color:#D4A017;">LinkedIn</span>
          </div>
        </div>

      </div>

      <!-- Bandeau comparatif -->
      <div style="background:rgba(6,12,20,0.8);border:1px solid rgba(212,160,23,0.15);border-radius:16px;padding:28px;text-align:center;">
        <div style="font-size:0.72rem;color:#6A8098;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:16px;">Comparaison avec les alternatives</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;">
          <div>
            <div style="font-size:1.8rem;font-weight:700;color:#D4A017;font-family:Georgia,serif;">10x</div>
            <div style="font-size:0.72rem;color:#6A8098;">Plus de contenu IA<br>vs concurrents locaux</div>
          </div>
          <div style="border-left:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:1.8rem;font-weight:700;color:#5A9FFF;font-family:Georgia,serif;">3x</div>
            <div style="font-size:0.72rem;color:#6A8098;">Plus rapide<br>que les méthodes classiques</div>
          </div>
          <div style="border-left:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:1.8rem;font-weight:700;color:#22C55E;font-family:Georgia,serif;">96%</div>
            <div style="font-size:0.72rem;color:#6A8098;">Taux de satisfaction<br>apprenants 2026</div>
          </div>
          <div style="border-left:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:1.8rem;font-weight:700;color:#F59E0B;font-family:Georgia,serif;">#1</div>
            <div style="font-size:0.72rem;color:#6A8098;">Plateforme IA anglais<br>en Afrique francophone</div>
          </div>
        </div>
      </div>
    </div>
  </section>

'''

# ─── SYNC SUPABASE MARKETING ──────────────────────────────────────────────────
SUPABASE_SYNC = '''
  <!-- ═══ SYNC SUPABASE MARKETING ═══ -->
  <script>
    // ── Configuration Supabase ──
    var SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
    var SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

    // ── Chargement dynamique des stats marketing depuis Supabase ──
    window._loadMarketingStats = async function() {
      try {
        // Tentative de chargement depuis Supabase
        var res = await fetch(SUPABASE_URL + '/rest/v1/marketing_config?select=key,value&is_active=eq.true', {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Supabase non configuré');
        var data = await res.json();
        // Mettre à jour les stats dynamiquement
        data.forEach(function(item) {
          var els = document.querySelectorAll('[data-mkt-key="' + item.key + '"]');
          els.forEach(function(el) { el.textContent = item.value; });
        });
        console.log('AGTM Marketing: Stats chargées depuis Supabase');
      } catch(e) {
        // Fallback: stats statiques déjà dans le HTML
        console.log('AGTM Marketing: Mode statique (Supabase non configuré)');
      }
    };

    // Charger les stats au démarrage
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', window._loadMarketingStats);
    } else {
      window._loadMarketingStats();
    }
  </script>

'''

# ─── INJECTION ────────────────────────────────────────────────────────────────
with open('index.html', 'rb') as f:
    content = f.read().decode('utf-8', errors='replace')

# 1. Injecter PWA + SW avant </body>
if 'serviceWorker' not in content:
    content = content.replace('</body>', PWA_SCRIPT + '</body>')
    sys.stdout.write('PWA + SW injecte\n')
else:
    sys.stdout.write('PWA deja present\n')

# 2. Injecter chatbot avant </body>
if 'aiChatToggle' not in content:
    content = content.replace('</body>', CHATBOT_WIDGET + '</body>')
    sys.stdout.write('Chatbot IA injecte\n')
else:
    sys.stdout.write('Chatbot deja present\n')

# 3. Injecter avantages concurrentiels avant la section formations
if 'Avantages Concurrentiels' not in content:
    marker = '<section class="formations-section"'
    if marker in content:
        content = content.replace(marker, AVANTAGES_SECTION + marker)
        sys.stdout.write('Section Avantages injectee\n')
    else:
        sys.stdout.write('Marqueur formations non trouve\n')
else:
    sys.stdout.write('Avantages deja presents\n')

# 4. Injecter sync Supabase marketing avant </body>
if '_loadMarketingStats' not in content:
    content = content.replace('</body>', SUPABASE_SYNC + '</body>')
    sys.stdout.write('Sync Supabase marketing injecte\n')
else:
    sys.stdout.write('Sync Supabase deja present\n')

# Sauvegarder
with open('index.html', 'wb') as f:
    f.write(content.encode('utf-8'))

sys.stdout.write('index.html sauvegarde OK\n')

# Verification finale
check = open('index.html', 'rb').read().decode('utf-8', errors='replace')
sys.stdout.write('serviceWorker: ' + str('serviceWorker' in check) + '\n')
sys.stdout.write('aiChatToggle: ' + str('aiChatToggle' in check) + '\n')
sys.stdout.write('Avantages: ' + str('Avantages Concurrentiels' in check) + '\n')
sys.stdout.write('manifest: ' + str('manifest.json' in check) + '\n')
sys.stdout.write('beforeinstallprompt: ' + str('beforeinstallprompt' in check) + '\n')
sys.stdout.write('Supabase sync: ' + str('_loadMarketingStats' in check) + '\n')
sys.stdout.write('Taille finale: ' + str(len(check)) + ' chars\n')
sys.stdout.flush()
