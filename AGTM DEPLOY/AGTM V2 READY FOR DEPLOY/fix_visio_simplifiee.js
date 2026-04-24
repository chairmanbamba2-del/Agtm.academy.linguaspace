// fix_visio_simplifiee.js
// AGTM Digital Academy — Simplification Visio (Jitsi Meet intégré)
// Problème : Google Meet demande numéro USA + code PIN
// Solution : Jitsi Meet en iframe intégré — 1 clic, pas de numéro, pas de PIN
// Exécution: node fix_visio_simplifiee.js

const fs = require('fs');
const path = require('path');

const DASHBOARD = path.join(__dirname, 'dashboard.html');
const BACKUP = path.join(__dirname, 'dashboard.html.visio-backup');

console.log('🔧 SIMPLIFICATION VISIO — Jitsi Meet intégré');
console.log('═══════════════════════════════════════════\n');

let html = fs.readFileSync(DASHBOARD, 'utf8');
fs.writeFileSync(BACKUP, html, 'utf8');
console.log('✅ Backup: dashboard.html.visio-backup (' + (html.length/1024).toFixed(1) + ' KB)\n');

// ════════════════════════════════════════════════════════════════════
// 1. REMPLACER LA MODALE GOOGLE MEET → Jitsi Meet iframe
// ════════════════════════════════════════════════════════════════════

const oldModal = `  <!-- ── GOOGLE MEET MODAL (cours en ligne) ──────────── -->
  <div id="_meetModal" style="display:none;position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.82);backdrop-filter:blur(6px);align-items:center;justify-content:center">
    <div style="background:#0D1B2A;border:2px solid #1a73e8;border-radius:16px;width:min(540px,94vw);overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.7)">
      <div style="background:#0A1520;padding:14px 18px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #1A3050">
        <div style="width:36px;height:36px;background:#1a73e8;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">🎥</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:800;color:#fff;font-size:.92rem">Cours en ligne — Google Meet</div>
          <div id="_meetModalTitle" style="color:#6AAAE8;font-size:.75rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
        </div>
        <button onclick="window._closeMeetModal()" style="padding:6px 12px;border-radius:8px;background:rgba(224,74,74,.15);border:1.5px solid rgba(224,74,74,.4);color:#E04A4A;font-weight:700;font-size:.8rem;cursor:pointer;flex-shrink:0">✕ Fermer</button>
      </div>
      <div style="padding:26px 22px;display:flex;flex-direction:column;gap:18px;align-items:center">
        <div style="font-size:3.2rem;line-height:1">📹</div>
        <div style="color:#e0e0e0;font-weight:700;font-size:.92rem;text-align:center">Réunion prête — cliquez pou`;

const newModal = `  <!-- ── JITSI MEET MODAL (cours en ligne) ──────────── -->
  <div id="_meetModal" style="display:none;position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:#0D1B2A;border:2px solid #D4A017;border-radius:16px;width:min(900px,96vw);height:min(600px,90vh);overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.7);display:flex;flex-direction:column">
      <div style="background:#0A1520;padding:10px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #1A3050;flex-shrink:0">
        <div style="width:32px;height:32px;background:#D4A017;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">🎥</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:800;color:#fff;font-size:.85rem">Cours en ligne — Jitsi Meet</div>
          <div id="_meetModalTitle" style="color:#E8B84B;font-size:.72rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
        </div>
        <button onclick="window._closeMeetModal()" style="padding:5px 10px;border-radius:6px;background:rgba(224,74,74,.15);border:1.5px solid rgba(224,74,74,.4);color:#E04A4A;font-weight:700;font-size:.75rem;cursor:pointer;flex-shrink:0">✕ Quitter</button>
      </div>
      <div style="flex:1;position:relative;background:#0A0A1A;overflow:hidden">
        <iframe id="_jitsiIframe" style="width:100%;height:100%;border:none" allow="camera;microphone;display-capture;fullscreen" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
        <div id="_jitsiLoading" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0A0A1A;gap:12px">
          <div style="width:40px;height:40px;border:3px solid rgba(212,160,23,.3);border-top-color:#D4A017;border-radius:50%;animation:spin 1s linear infinite"></div>
          <div style="color:#E8B84B;font-size:.85rem;font-weight:600">Connexion à la salle de cours...</div>
          <div style="color:#6A8090;font-size:.72rem">Jitsi Meet — pas de numéro, pas de code PIN</div>
        </div>
      </div>
    </div>
  </div>
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;

// Remplacer la modale
const oldIdx = html.indexOf(oldModal);
if (oldIdx >= 0) {
  // Trouver la fin de l'ancienne modale (jusqu'à la prochaine div après le contenu)
  const endOld = html.indexOf('</div>', oldIdx + oldModal.length);
  const endModal = html.indexOf('</div>', endOld + 6) + 6; // fermer la div externe
  const fullOldModal = html.substring(oldIdx, endModal);
  html = html.replace(fullOldModal, newModal);
  console.log('✅ Modale Google Meet remplacée par Jitsi Meet iframe');
} else {
  console.log('⚠️ Modale Google Meet non trouvée, recherche alternative...');
  // Fallback: chercher le début de la modale
  const altIdx = html.indexOf('id="_meetModal"');
  if (altIdx >= 0) {
    const start = html.lastIndexOf('<div', altIdx);
    const end = html.indexOf('</div>', altIdx);
    const end2 = html.indexOf('</div>', end + 6) + 6;
    const fullOld = html.substring(start, end2);
    html = html.replace(fullOld, newModal);
    console.log('✅ Modale remplacée (fallback)');
  }
}

// ════════════════════════════════════════════════════════════════════
// 2. REMPLACER LES FONCTIONS Jitsi/Meet
// ════════════════════════════════════════════════════════════════════

// Ancien bloc de fonctions à remplacer
const oldFunctions = `    window._openJitsiRoom = window._openMeetRoom = function(url, title) {
      if (!url) return
      const modal   = document.getElementById('_meetModal')
      const titleEl = document.getElementById('_meetModalTitle')
      const linkEl  = document.getElementById('_meetModalLink')
      if (!modal) { window.open(url, '_blank', 'noopener'); return }
      _meetCurrentUrl = url
      if (titleEl) titleEl.textContent = title || url
      if (linkEl)  linkEl.value = url
      modal.style.display = 'flex'
      document.body.style.overflow = 'hidden'
      // Ouvre immédiatement Google Meet dans un nouvel onglet
      window.open(url, '_blank', 'noopener')
    }

    window._closeJitsiModal = window._closeMeetModal = function() {
      const modal = document.getElementById('_meetModal')
      if (modal) modal.style.display = 'none'
      document.body.style.overflow = ''
    }

    window._isJitsiLink = function() { return false }

    // Ouvre Google Meet pour créer une nouvelle réunion — l'utilisateur copie le lien généré
     window._fsGenGMeet = window._fsGenJitsi = function() {
       window.open('https://meet.google.com/new', '_blank', 'noopener')
       if (typeof toast === 'function') toast('📋 Copiez le lien Google Meet depuis le nouvel onglet et collez-le dans le champ')
     }
     window._fsGenRandomMeet = function() {
       const meetLink = document.getElementById('fsLienMeet')
       if (!meetLink) return
       // Générer un lien Google Meet aléatoire (simulation)
       const randomId = Math.random().toString(36).substring(2, 10)
       const link = 'https://meet.google.com/' + randomId
       meetLink.value = link
       if (typeof toast === 'function') toast('🔗 Lien Google Meet généré (simulation)', 'info')
     }

    window._edtGenGMeet = window._edtGenJitsi = function() {
      window.open('https://meet.google.com/new', '_blank', 'noopener')
      if (typeof toast === 'function') toast('📋 Copiez le lien Google Meet depuis le nouvel onglet et collez-le dans le champ')
    }`;

const newFunctions = `    // ═══════════════════════════════════════════════════════════════
    // JITSI MEET SIMPLIFIÉ — 1 clic, pas de numéro, pas de code PIN
    // ═══════════════════════════════════════════════════════════════
    // Utilise meet.jit.si en iframe intégré
    // L'étudiant clique → la visio s'ouvre directement dans la page
    // Aucun numéro USA, aucun code PIN à composer

    window._openJitsiRoom = window._openMeetRoom = function(url, title) {
      if (!url) return
      const modal   = document.getElementById('_meetModal')
      const titleEl = document.getElementById('_meetModalTitle')
      const iframe  = document.getElementById('_jitsiIframe')
      const loading = document.getElementById('_jitsiLoading')
      if (!modal) { window.open(url, '_blank', 'noopener'); return }

      // Extraire le nom de la salle depuis l'URL
      var roomName = url
      // Si c'est un lien meet.google.com, le convertir en salle Jitsi
      if (url.indexOf('meet.google.com') >= 0) {
        var parts = url.split('/')
        roomName = 'AGTM-' + (parts[parts.length-1] || Math.random().toString(36).substring(2,10))
      } else if (url.indexOf('meet.jit.si') >= 0) {
        var parts2 = url.split('/')
        roomName = parts2[parts2.length-1] || 'AGTM-Cours'
      } else {
        // Utiliser l'URL comme nom de salle (nettoyé)
        roomName = 'AGTM-' + url.replace(/[^a-zA-Z0-9]/g,'-').substring(0,30) || 'AGTM-Cours'
      }

      // Nom d'utilisateur
      var userName = title || 'Participant'
      var displayName = userName.substring(0, 30)

      if (titleEl) titleEl.textContent = displayName + ' — Salle: ' + roomName

      // Afficher le chargement
      if (loading) loading.style.display = 'flex'

      // Construire l'URL Jitsi Meet avec paramètres simplifiés
      // Pas de numéro, pas de PIN — authentification anonyme directe
      var jitsiUrl = 'https://meet.jit.si/' + encodeURIComponent(roomName) +
        '#config.startWithAudioMuted=false' +
        '&config.startWithVideoMuted=false' +
        '&config.prejoinPageEnabled=false' +  // PAS de page d'avant réunion (pas de numéro USA)
        '&config.disableDeepLinking=true' +    // Reste dans l'iframe
        '&userInfo.displayName=' + encodeURIComponent(displayName) +
        '&interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=true' +
        '&interfaceConfig.SHOW_JITSI_WATERMARK=false' +
        '&interfaceConfig.SHOW_BRAND_WATERMARK=false' +
        '&interfaceConfig.ENABLE_DIAL_OUT=false' +  // PAS de numéro USA
        '&interfaceConfig.FILM_STRIP_MAX_HEIGHT=120'

      // Charger dans l'iframe
      if (iframe) {
        iframe.src = jitsiUrl
        iframe.onload = function() {
          if (loading) loading.style.display = 'none'
        }
        // Timeout de securite pour cacher le loading
        setTimeout(function() {
          if (loading) loading.style.display = 'none'
        }, 8000)
      }

      _meetCurrentUrl = jitsiUrl
      modal.style.display = 'flex'
      document.body.style.overflow = 'hidden'
    }

    window._closeJitsiModal = window._closeMeetModal = function() {
      const modal = document.getElementById('_meetModal')
      const iframe = document.getElementById('_jitsiIframe')
      // Nettoyer l'iframe pour libérer la caméra/micro
      if (iframe) { iframe.src = ''; iframe.onload = null }
      if (modal) modal.style.display = 'none'
      document.body.style.overflow = ''
    }

    window._isJitsiLink = function() { return true }

    // Générer un lien Jitsi Meet (pas Google Meet)
    window._fsGenGMeet = window._fsGenJitsi = function() {
      var roomName = 'AGTM-' + Math.random().toString(36).substring(2, 10)
      var link = 'https://meet.jit.si/' + roomName
      var meetLink = document.getElementById('fsLienMeet')
      if (meetLink) meetLink.value = link
      if (typeof toast === 'function') toast('🔗 Lien Jitsi généré : ' + link, 'success')
    }

    window._fsGenRandomMeet = function() {
      var roomName = 'AGTM-' + Math.random().toString(36).substring(2, 10)
      var link = 'https://meet.jit.si/' + roomName
      var meetLink = document.getElementById('fsLienMeet')
      if (meetLink) meetLink.value = link
      if (typeof toast === 'function') toast('🔗 Lien Jitsi généré : ' + link, 'success')
    }

    window._edtGenGMeet = window._edtGenJitsi = function() {
      var roomName = 'AGTM-' + Math.random().toString(36).substring(2, 10)
      var link = 'https://meet.jit.si/' + roomName
      if (typeof toast === 'function') toast('🔗 Lien Jitsi généré : ' + link, 'success')
      window.open(link, '_blank', 'noopener')
    }`;

// Remplacer les fonctions
if (html.indexOf(oldFunctions) >= 0) {
  html = html.replace(oldFunctions, newFunctions);
  console.log('✅ Fonctions Jitsi/Meet remplacées (version simplifiée)');
} else {
  console.log('⚠️ Bloc de fonctions non trouvé exactement, recherche partielle...');
  // Chercher _openJitsiRoom
  const ojr = html.indexOf('_openJitsiRoom = window._openMeetRoom');
  if (ojr >= 0) {
    // Trouver le début et la fin du bloc
    const start = html.lastIndexOf('    ', ojr);
    const end = html.indexOf('    window._edtGenGMeet', ojr);
    if (end > 0) {
      const oldBlock = html.substring(start, end);
      const newBlock = newFunctions.substring(newFunctions.indexOf('    window._openJitsiRoom'), newFunctions.indexOf('    window._edtGenGMeet'));
      html = html.replace(oldBlock, newBlock);
      console.log('✅ Fonctions remplacées (fallback)');
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// 3. AJOUTER UN BOUTON "Rejoindre en 1 clic" dans le planning
// ════════════════════════════════════════════════════════════════════

// Chercher le bouton existant "Rejoindre le cours" et ajouter une version simplifiée
const oldBtn = `📹 Rejoindre le cours`;
const newBtn = `📹 Rejoindre le cours`;
// On ne remplace pas le bouton existant, on ajoute une fonction de fallback

// ════════════════════════════════════════════════════════════════════
// 4. AJOUTER UNE FONCTION DE REJOINT RAPIDE (1 clic, pas de modale)
// ════════════════════════════════════════════════════════════════════

const quickJoinCode = `
    // ═══════════════════════════════════════════════════════════════
    // REJOINT RAPIDE — 1 clic, pas de modale, pas de numéro
    // ═══════════════════════════════════════════════════════════════
    window._joinCoursRapide = function(url, title) {
      if (!url) { if (typeof toast === 'function') toast('❌ Aucun lien de cours disponible', 'error'); return }
      // Ouvrir Jitsi Meet directement dans un nouvel onglet (pas de modale)
      // Si c'est un lien Google Meet, le convertir en Jitsi
      var roomName = url
      if (url.indexOf('meet.google.com') >= 0) {
        var parts = url.split('/')
        roomName = 'AGTM-' + (parts[parts.length-1] || Math.random().toString(36).substring(2,10))
      } else if (url.indexOf('meet.jit.si') >= 0) {
        var parts2 = url.split('/')
        roomName = parts2[parts2.length-1] || 'AGTM-Cours'
      } else {
        roomName = 'AGTM-' + url.replace(/[^a-zA-Z0-9]/g,'-').substring(0,30)
      }
      var jitsiUrl = 'https://meet.jit.si/' + encodeURIComponent(roomName) +
        '#config.prejoinPageEnabled=false' +
        '&config.disableDeepLinking=true' +
        '&userInfo.displayName=' + encodeURIComponent(title || 'Participant')
      window.open(jitsiUrl, '_blank', 'noopener')
      if (typeof toast === 'function') toast('✅ Cours ouvert — pas de numéro, pas de code PIN !')
    }

    // Version simplifiée pour les étudiants (bouton unique)
    window._rejoindreCours = function(seanceId) {
      try {
        var seances = window._seancesData || []
        var seance = seances.find(function(s) { return s.id == seanceId })
        if (!seance) { if (typeof toast === 'function') toast('❌ Séance introuvable', 'error'); return }
        var url = seance.lien_meet || seance.lien_jitsi || seance.lien || ''
        var sujet = seance.sujet || 'Cours AGTM'
        window._joinCoursRapide(url, sujet)
        // Pointer la présence
        if (seanceId && window._mesSeancesEtud && window._mesSeancesEtud.id && typeof sb !== 'undefined') {
          sb.from('presences').upsert(
            { seance_id: Number(seanceId), etudiant_id: window._mesSeancesEtud.id, present: 1 },
            { onConflict: 'seance_id,etudiant_id' }
          ).catch(function(){})
        }
      } catch(e) { console.error('Erreur rejoindreCours:', e) }
    }
`;

// Injecter le code de rejoint rapide avant la fin du dernier </script>
const lastScript = html.lastIndexOf('</script>');
html = html.substring(0, lastScript) + quickJoinCode + html.substring(lastScript);

fs.writeFileSync(DASHBOARD, html, 'utf8');

// ════════════════════════════════════════════════════════════════════
// VERIFICATION
// ════════════════════════════════════════════════════════════════════
const v = fs.readFileSync(DASHBOARD, 'utf8');
const checks = [
  ['meet.jit.si', 'Jitsi Meet URL'],
  ['prejoinPageEnabled=false', 'Pas de page pré-réunion (pas de numéro USA)'],
  ['ENABLE_DIAL_OUT=false', 'Pas de numéro USA'],
  ['_jitsiIframe', 'Iframe Jitsi'],
  ['_joinCoursRapide', 'Rejoint rapide 1 clic'],
  ['_rejoindreCours', 'Rejoindre cours avec présence'],
  ['_closeMeetModal', 'Fermeture modale'],
  ['_fsGenJitsi', 'Génération lien Jitsi'],
  ['_edtGenJitsi', 'Génération EDT Jitsi'],
  ['DISABLE_JOIN_LEAVE_NOTIFICATIONS', 'Notifications désactivées'],
  ['SHOW_JITSI_WATERMARK=false', 'Watermark désactivé'],
];

console.log('--- VERIFICATION ---');
var ok = 0, ko = 0;
checks.forEach(function(c) {
  var found = v.includes(c[0]);
  console.log('  ' + (found ? '✅' : '❌') + ' ' + c[1] + ' (' + c[0] + '): ' + (found ? 'OK' : 'MANQUANT'));
  if (found) ok++; else ko++;
});
console.log('\n✅ ' + ok + '/' + (ok+ko) + ' vérifications OK');
console.log('✅ Taille finale: ' + (v.length/1024).toFixed(1) + ' KB');
console.log('✅ Backup: dashboard.html.visio-backup');
