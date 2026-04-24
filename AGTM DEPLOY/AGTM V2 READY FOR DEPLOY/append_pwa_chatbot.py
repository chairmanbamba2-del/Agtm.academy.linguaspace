#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ajoute directement avant </html> les blocs PWA, Chatbot et Supabase sync
en utilisant une approche d'ajout de texte brut (pas de remplacement de </body>)
"""
import sys

PWA_BLOCK = """
  <!-- ═══ PWA : Service Worker + Bouton Install ═══ -->
  <style>
    #pwaInstallBtn {
      display: none; position: fixed; bottom: 90px; right: 24px; z-index: 8888;
      align-items: center; gap: 8px; padding: 12px 20px;
      background: linear-gradient(135deg, #2A6FD4 0%, #5A9FFF 100%);
      border: 1px solid rgba(90,159,255,0.4); border-radius: 99px; color: white;
      font-size: 0.82rem; font-weight: 700; cursor: pointer;
      box-shadow: 0 8px 24px rgba(42,111,212,0.4); transition: all 0.3s;
    }
    #pwaInstallBtn.visible { display: flex; }
    #pwaInstallBtn:hover { transform: translateY(-3px); }
    #pwaToast {
      display: none; position: fixed; bottom: 24px; left: 50%;
      transform: translateX(-50%);
      background: rgba(15,26,46,0.95); border: 1px solid rgba(212,160,23,0.3);
      border-radius: 12px; padding: 14px 24px; color: #F0EAD6;
      font-size: 0.82rem; z-index: 9000; backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5); white-space: nowrap;
    }
    #pwaToast.visible { display: block; }
  </style>
  <button id="pwaInstallBtn" onclick="window._installPWA()">&#128247; Installer l'App</button>
  <div id="pwaToast">&#10003; Application install&#233;e avec succ&#232;s !</div>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(r){ console.log('AGTM SW OK', r.scope); })
          .catch(function(e){ console.warn('AGTM SW err', e); });
      });
    }
    var _deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault(); _deferredPrompt = e;
      var b = document.getElementById('pwaInstallBtn');
      if (b) b.classList.add('visible');
    });
    window._installPWA = function() {
      if (!_deferredPrompt) return;
      _deferredPrompt.prompt();
      _deferredPrompt.userChoice.then(function(c) {
        if (c.outcome === 'accepted') {
          var b = document.getElementById('pwaInstallBtn');
          if (b) b.classList.remove('visible');
          var t = document.getElementById('pwaToast');
          if (t) { t.classList.add('visible'); setTimeout(function(){ t.classList.remove('visible'); }, 3000); }
        }
        _deferredPrompt = null;
      });
    };
    window.addEventListener('appinstalled', function() {
      var b = document.getElementById('pwaInstallBtn');
      if (b) b.classList.remove('visible');
    });
  </script>
"""

CHATBOT_BLOCK = """
  <!-- ═══ ASSISTANTE IA MARKETING — Widget Flottant ═══ -->
  <style>
    #aiChatToggle {
      position: fixed; bottom: 24px; right: 24px; z-index: 9990;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #D4A017 0%, #F0C040 100%);
      border: none; cursor: pointer; display: flex; align-items: center;
      justify-content: center; font-size: 1.6rem;
      box-shadow: 0 8px 32px rgba(212,160,23,0.5); transition: all 0.3s;
      animation: chatPulse 2.5s ease-in-out infinite;
    }
    #aiChatToggle:hover { transform: scale(1.1); }
    @keyframes chatPulse {
      0%,100% { box-shadow: 0 8px 32px rgba(212,160,23,0.5), 0 0 0 0 rgba(212,160,23,0.4); }
      50% { box-shadow: 0 8px 32px rgba(212,160,23,0.5), 0 0 0 12px rgba(212,160,23,0); }
    }
    #aiChatBadge {
      position: absolute; top: -4px; right: -4px; width: 20px; height: 20px;
      background: #EF4444; border-radius: 50%; border: 2px solid #060C14;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6rem; font-weight: 700; color: white;
    }
    #aiChatWindow {
      position: fixed; bottom: 96px; right: 24px; z-index: 9989;
      width: 360px; max-height: 520px;
      background: linear-gradient(135deg, #0A1628 0%, #060C14 100%);
      border: 1px solid rgba(212,160,23,0.25); border-radius: 20px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7);
      display: flex; flex-direction: column; overflow: hidden;
      transform: scale(0.8) translateY(20px); opacity: 0;
      pointer-events: none; transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      transform-origin: bottom right;
    }
    #aiChatWindow.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
    .ai-chat-header {
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(212,160,23,0.12) 0%, rgba(42,111,212,0.08) 100%);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex; align-items: center; gap: 12px;
    }
    .ai-chat-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #D4A017, #F0C040);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; flex-shrink: 0;
    }
    .ai-chat-info { flex: 1; }
    .ai-chat-name { font-size: 0.88rem; font-weight: 700; color: #F0EAD6; }
    .ai-chat-status { font-size: 0.68rem; color: #22C55E; }
    .ai-chat-close { background: none; border: none; color: #6A8098; cursor: pointer; font-size: 1rem; }
    .ai-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .ai-msg { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 0.8rem; line-height: 1.5; }
    .ai-msg.bot {
      background: rgba(15,26,46,0.8); border: 1px solid rgba(255,255,255,0.06);
      color: #C0D0E0; align-self: flex-start; border-bottom-left-radius: 4px;
    }
    .ai-msg.user {
      background: linear-gradient(135deg, rgba(212,160,23,0.2), rgba(212,160,23,0.1));
      border: 1px solid rgba(212,160,23,0.25); color: #F0EAD6;
      align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .ai-quick-replies { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; }
    .ai-quick-btn {
      padding: 5px 12px; background: rgba(42,111,212,0.1);
      border: 1px solid rgba(42,111,212,0.25); border-radius: 99px;
      color: #5A9FFF; font-size: 0.7rem; cursor: pointer; transition: all 0.2s;
    }
    .ai-quick-btn:hover { background: rgba(42,111,212,0.2); }
    .ai-chat-input-area {
      padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06);
      display: flex; gap: 8px; align-items: center;
    }
    #aiChatInput {
      flex: 1; background: rgba(15,26,46,0.8); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 99px; padding: 8px 16px; color: #F0EAD6; font-size: 0.78rem; outline: none;
    }
    #aiChatInput:focus { border-color: rgba(212,160,23,0.4); }
    #aiChatInput::placeholder { color: #4A5568; }
    #aiChatSend {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #D4A017, #F0C040);
      border: none; cursor: pointer; display: flex; align-items: center;
      justify-content: center; font-size: 0.9rem; transition: all 0.2s; flex-shrink: 0;
    }
    .ai-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px;
      background: rgba(15,26,46,0.8); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px; border-bottom-left-radius: 4px; align-self: flex-start; width: fit-content; }
    .ai-typing span { width: 6px; height: 6px; background: #6A8098; border-radius: 50%;
      animation: typingDot 1.4s ease-in-out infinite; }
    .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingDot { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }
    @media (max-width: 480px) {
      #aiChatWindow { width: calc(100vw - 32px); right: 16px; bottom: 88px; }
      #aiChatToggle { right: 16px; bottom: 16px; }
      #pwaInstallBtn { right: 16px; bottom: 88px; }
    }
  </style>
  <button id="aiChatToggle" onclick="window._toggleAIChat()" title="Assistante IA AGTM" style="position:relative;">
    <span id="aiChatIcon">&#129302;</span>
    <span id="aiChatBadge">1</span>
  </button>
  <div id="aiChatWindow">
    <div class="ai-chat-header">
      <div class="ai-chat-avatar">&#129302;</div>
      <div class="ai-chat-info">
        <div class="ai-chat-name">Amara &#8212; Assistante AGTM</div>
        <div class="ai-chat-status">&#9679; En ligne</div>
      </div>
      <button class="ai-chat-close" onclick="window._toggleAIChat()">&#10005;</button>
    </div>
    <div class="ai-chat-messages" id="aiChatMessages">
      <div class="ai-msg bot">&#128075; Bonjour ! Je suis <strong>Amara</strong>, votre assistante IA AGTM Digital Academy.<br><br>Comment puis-je vous aider ? &#128522;</div>
    </div>
    <div class="ai-quick-replies" id="aiQuickReplies">
      <button class="ai-quick-btn" onclick="window._aiQuickReply('Quelles formations proposez-vous ?')">&#128218; Formations</button>
      <button class="ai-quick-btn" onclick="window._aiQuickReply('Quels sont vos tarifs ?')">&#128176; Tarifs</button>
      <button class="ai-quick-btn" onclick="window._aiQuickReply('Comment m inscrire ?')">&#128221; S inscrire</button>
      <button class="ai-quick-btn" onclick="window._aiQuickReply('Parlez-moi de l IA pedagogique')">&#129504; IA</button>
    </div>
    <div class="ai-chat-input-area">
      <input type="text" id="aiChatInput" placeholder="Posez votre question...">
      <button id="aiChatSend">&#10148;</button>
    </div>
  </div>
  <script>
    var _aiChatOpen = false;
    window._toggleAIChat = function() {
      _aiChatOpen = !_aiChatOpen;
      var win = document.getElementById('aiChatWindow');
      var icon = document.getElementById('aiChatIcon');
      var badge = document.getElementById('aiChatBadge');
      if (win) win.classList.toggle('open', _aiChatOpen);
      if (icon) icon.textContent = _aiChatOpen ? 'x' : String.fromCodePoint(0x1F916);
      if (badge) badge.style.display = _aiChatOpen ? 'none' : 'flex';
      if (_aiChatOpen) { var inp = document.getElementById('aiChatInput'); if (inp) setTimeout(function(){ inp.focus(); }, 300); }
    };
    window._aiQuickReply = function(t) { var i = document.getElementById('aiChatInput'); if (i) { i.value = t; window._aiSendMsg(); } };
    window._aiSendMsg = function() {
      var i = document.getElementById('aiChatInput');
      if (!i || !i.value.trim()) return;
      var msg = i.value.trim(); i.value = '';
      _aiAddMsg(msg, 'user');
      var qr = document.getElementById('aiQuickReplies'); if (qr) qr.style.display = 'none';
      setTimeout(function(){ _aiRespond(msg); }, 800);
    };
    document.getElementById('aiChatSend').addEventListener('click', window._aiSendMsg);
    document.getElementById('aiChatInput').addEventListener('keydown', function(e){ if(e.key==='Enter') window._aiSendMsg(); });
    function _aiAddMsg(text, type) {
      var c = document.getElementById('aiChatMessages'); if (!c) return;
      var d = document.createElement('div'); d.className = 'ai-msg ' + type; d.innerHTML = text;
      c.appendChild(d); c.scrollTop = c.scrollHeight;
    }
    function _aiShowTyping() {
      var c = document.getElementById('aiChatMessages'); if (!c) return null;
      var d = document.createElement('div'); d.className = 'ai-typing'; d.id = 'aiTypingIndicator';
      d.innerHTML = '<span></span><span></span><span></span>'; c.appendChild(d); c.scrollTop = c.scrollHeight; return d;
    }
    function _aiRespond(msg) {
      var typing = _aiShowTyping();
      var lower = msg.toLowerCase();
      var response = '';
      if (lower.includes('formation') || lower.includes('cours') || lower.includes('module')) {
        response = '&#128218; Nous proposons <strong>100+ modules IA</strong> couvrant A1&#8594;C1 :<br>&#8226; &#128188; Business English<br>&#8226; &#127891; TOEFL/IELTS<br>&#8226; &#128221; Professional Writing<br>&#8226; &#128187; Technical English<br><a href="inscription.html" style="color:#D4A017;">S inscrire &#8594;</a>';
      } else if (lower.includes('tarif') || lower.includes('prix') || lower.includes('abonnement')) {
        response = '&#128176; Nos formules :<br>&#8226; <strong style="color:#D4A017;">Starter</strong> &#8212; 10 modules/mois<br>&#8226; <strong style="color:#5A9FFF;">Premium</strong> &#8212; Illimit&#233; + formateur<br>&#8226; <strong style="color:#22C55E;">Elite</strong> &#8212; 1-to-1 + certificat<br>&#128222; +225 07 123 45 67';
      } else if (lower.includes('inscri') || lower.includes('rejoindre') || lower.includes('commencer')) {
        response = '&#128221; Pour vous inscrire :<br>1. <a href="inscription.html" style="color:#D4A017;">Cliquez ici</a><br>2. Formulaire (2 min)<br>3. Test de placement gratuit<br>4. Acc&#232;s imm&#233;diat !<br>&#10003; Sans engagement';
      } else if (lower.includes('ia') || lower.includes('intelligence') || lower.includes('technolog')) {
        response = '&#129504; Notre <strong>Moteur IA</strong> :<br>&#8226; G&#233;n&#233;ration <10s via Claude 3.5<br>&#8226; 100+ modules valid&#233;s<br>&#8226; Quiz adaptatifs<br>&#8226; Suivi temps r&#233;el<br>&#8226; Assistante vocale<br>&#127942; 100% valid&#233; par experts';
      } else if (lower.includes('contact') || lower.includes('telephone') || lower.includes('email')) {
        response = '&#128222; Nos coordonn&#233;es :<br>&#8226; &#128231; contact.eipservices@gmail.com<br>&#8226; &#128241; +225 07 123 45 67<br>&#8226; &#127970; Abidjan, C&#244;te d Ivoire<br>&#8226; &#128336; 7j/7, 8h-20h';
      } else {
        response = '&#129300; Pour une r&#233;ponse compl&#232;te :<br>&#8226; &#128222; +225 07 123 45 67<br>&#8226; &#128231; contact.eipservices@gmail.com<br>Nous r&#233;pondons en <2h ! &#128522;';
      }
      setTimeout(function() { if (typing) typing.remove(); _aiAddMsg(response, 'bot'); }, 1200 + Math.random() * 800);
    }
    setTimeout(function() {
      var b = document.getElementById('aiChatBadge');
      if (b && !_aiChatOpen) b.style.display = 'flex';
    }, 3000);
  </script>
"""

SUPABASE_BLOCK = """
  <!-- ═══ SYNC SUPABASE MARKETING ═══ -->
  <script>
    var SUPABASE_URL = window.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
    var SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
    window._loadMarketingStats = async function() {
      try {
        var res = await fetch(SUPABASE_URL + '/rest/v1/marketing_config?select=key,value&is_active=eq.true', {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
        });
        if (!res.ok) throw new Error('Supabase non configure');
        var data = await res.json();
        data.forEach(function(item) {
          document.querySelectorAll('[data-mkt-key="' + item.key + '"]').forEach(function(el) { el.textContent = item.value; });
        });
        console.log('AGTM Marketing: Stats chargees depuis Supabase');
      } catch(e) {
        console.log('AGTM Marketing: Mode statique');
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', window._loadMarketingStats);
    } else {
      window._loadMarketingStats();
    }
  </script>
"""

# Lire le fichier
with open('index.html', 'rb') as f:
    content = f.read().decode('utf-8', errors='replace')

# Verifier ce qui est deja present
has_sw = 'serviceWorker' in content
has_chat = 'aiChatToggle' in content
has_mkt = '_loadMarketingStats' in content

# Ajouter avant </html>
additions = ''
if not has_sw:
    additions += PWA_BLOCK
    sys.stdout.write('PWA injecte\n')
else:
    sys.stdout.write('PWA deja present\n')

if not has_chat:
    additions += CHATBOT_BLOCK
    sys.stdout.write('Chatbot injecte\n')
else:
    sys.stdout.write('Chatbot deja present\n')

if not has_mkt:
    additions += SUPABASE_BLOCK
    sys.stdout.write('Supabase sync injecte\n')
else:
    sys.stdout.write('Supabase sync deja present\n')

if additions:
    # Ajouter avant </html>
    if '</html>' in content:
        content = content.replace('</html>', additions + '\n</html>')
    else:
        content += additions

with open('index.html', 'wb') as f:
    f.write(content.encode('utf-8'))

sys.stdout.write('Sauvegarde OK\n')

# Verification
c2 = open('index.html', 'rb').read().decode('utf-8', errors='replace')
sys.stdout.write('serviceWorker: ' + str(c2.count('serviceWorker')) + '\n')
sys.stdout.write('aiChatToggle: ' + str(c2.count('aiChatToggle')) + '\n')
sys.stdout.write('_loadMarketingStats: ' + str(c2.count('_loadMarketingStats')) + '\n')
sys.stdout.write('beforeinstallprompt: ' + str(c2.count('beforeinstallprompt')) + '\n')
sys.stdout.write('manifest.json: ' + str(c2.count('manifest.json')) + '\n')
sys.stdout.write('Taille: ' + str(len(c2)) + '\n')
sys.stdout.flush()
