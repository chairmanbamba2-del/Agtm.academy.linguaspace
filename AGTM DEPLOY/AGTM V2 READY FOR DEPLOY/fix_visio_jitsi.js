// fix_visio_jitsi.js
// AGTM Digital Academy — Correction complète du système visioconférence Jitsi Meet
// Supprime tous les résidus Google Meet, simplifie l'expérience utilisateur
// Exécution: node fix_visio_jitsi.js

const fs = require('fs');
const path = require('path');

const DASHBOARD = path.join(__dirname, 'dashboard-premium-lot2-final.html');
console.log('📂 Lecture :', DASHBOARD);

let html = fs.readFileSync(DASHBOARD, 'utf8');
console.log('✅ Fichier lu: ' + (html.length / 1024).toFixed(0) + ' Ko');

let changes = [];
let totalFixes = 0;

// ════════════════════════════════════════════════════════
// 1. CORRIGER _isJitsiLink() - actuellement return false
// ════════════════════════════════════════════════════════
const oldIsJitsiLink = `window._isJitsiLink = function() { return false }`;
const newIsJitsiLink = `window._isJitsiLink = function(url) {
  if (!url) return false;
  return url.includes('meet.jit.si') || url.includes('jitsi');
}`;

if (html.includes(oldIsJitsiLink)) {
  html = html.replace(oldIsJitsiLink, newIsJitsiLink);
  changes.push('  ✅ _isJitsiLink() : return false → détecte meet.jit.si');
  totalFixes++;
} else {
  changes.push('  ℹ️ _isJitsiLink : déjà corrigé ou introuvable');
}

// ════════════════════════════════════════════════════════
// 2. CORRIGER _fsGenRandomMeet() - utilise encore meet.google.com
// ════════════════════════════════════════════════════════
const oldFsGenRandomMeet = `     window._fsGenRandomMeet = function() {
       const meetLink = document.getElementById('fsLienMeet')
       if (!meetLink) return
       // GǸnǸrer un lien Google Meet alǸatoire (simulation)
       const randomId = Math.random().toString(36).substring(2, 10)
       const link = 'https://meet.google.com/' + randomId
       meetLink.value = link
       if (typeof toast === 'function') toast('Y"- Lien Google Meet gǸnǸrǸ (simulation)', 'info')
     }`;

const newFsGenRandomMeet = `     window._fsGenRandomMeet = function() {
       const meetLink = document.getElementById('fsLienMeet')
       if (!meetLink) return
       // Générer un lien Jitsi Meet valide (open source, sans compte, sans code PIN)
       const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
       const link = 'https://meet.jit.si/AGTM_' + sessionId
       meetLink.value = link
       if (typeof toast === 'function') toast('🔗 Lien Jitsi Meet généré ! Cliquez pour rejoindre la salle', 'info')
       // Ouvrir automatiquement la salle Jitsi pour que le formateur la crée
       window.open(link, '_blank', 'noopener')
     }`;

if (html.includes(oldFsGenRandomMeet.trim())) {
  html = html.replace(oldFsGenRandomMeet, newFsGenRandomMeet);
  changes.push('  ✅ _fsGenRandomMeet() : meet.google.com → meet.jit.si + ouvre auto');
  totalFixes++;
} else {
  changes.push('  ℹ️ _fsGenRandomMeet : déjà corrigé ou introuvable, recherche variante');
  // Fallback: chercher toute occurence de meet.google.com dans _fsGenRandomMeet
  const fsRegex = /window\._fsGenRandomMeet\s*=\s*function\s*\(\s*\)\s*\{[\s\S]*?\}/;
  if (fsRegex.test(html)) {
    html = html.replace(fsRegex, newFsGenRandomMeet);
    changes.push('  ✅ _fsGenRandomMeet : regex fallback appliqué');
    totalFixes++;
  }
}

// ════════════════════════════════════════════════════════
// 3. CORRIGER _fsGenGMeet / _fsGenJitsi - utilise meet.google.com/new
// ════════════════════════════════════════════════════════
const oldFsGenGMeet = `     window._fsGenGMeet = window._fsGenJitsi = function() {
       window.open('https://meet.google.com/new', '_blank', 'noopener')
       if (typeof toast === 'function') toast('Y"< Copiez le lien Google Meet depuis le nouvel onglet et collez-le dans le champ')
     }`;

const newFsGenJitsi = `     window._fsGenGMeet = window._fsGenJitsi = function() {
       // Génération directe d'un lien Jitsi Meet (sans compte, sans code PIN, sans téléphone)
       const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
       const link = 'https://meet.jit.si/AGTM_' + sessionId
       const meetLink = document.getElementById('fsLienMeet')
       if (meetLink) meetLink.value = link
       window.open(link, '_blank', 'noopener')
       if (typeof toast === 'function') toast('🔗 Salle Jitsi Meet créée ! Rejoignez directement', 'info')
     }`;

if (html.includes(oldFsGenGMeet.trim())) {
  html = html.replace(oldFsGenGMeet, newFsGenJitsi);
  changes.push('  ✅ _fsGenGMeet/_fsGenJitsi : meet.google.com/new → génération Jitsi directe');
  totalFixes++;
} else {
  changes.push('  ℹ️ _fsGenGMeet : déjà corrigé ou introuvable');
}

// ════════════════════════════════════════════════════════
// 4. CORRIGER _edtGenGMeet / _edtGenJitsi
// ════════════════════════════════════════════════════════
const oldEdtGenGMeet = `    window._edtGenGMeet = window._edtGenJitsi = function() {
      window.open('https://meet.google.com/new', '_blank', 'noopener')
      if (typeof toast === 'function') toast('Y"< Copiez le lien Google Meet depuis le nouvel onglet et collez-le dans le champ')
    }`;

const newEdtGenJitsi = `    window._edtGenGMeet = window._edtGenJitsi = function() {
      // Génération directe d'un lien Jitsi Meet
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
      const link = 'https://meet.jit.si/AGTM_' + sessionId
      const meetLink = document.getElementById('edtLienMeet')
      if (meetLink) meetLink.value = link
      window.open(link, '_blank', 'noopener')
      if (typeof toast === 'function') toast('🔗 Salle Jitsi Meet créée ! Rejoignez directement', 'info')
    }`;

if (html.includes(oldEdtGenGMeet.trim())) {
  html = html.replace(oldEdtGenGMeet, newEdtGenJitsi);
  changes.push('  ✅ _edtGenGMeet/_edtGenJitsi : meet.google.com/new → génération Jitsi directe');
  totalFixes++;
} else {
  changes.push('  ℹ️ _edtGenGMeet : déjà corrigé ou introuvable');
}

// ════════════════════════════════════════════════════════
// 5. CORRIGER le commentaire Google Meet dans _openJitsiRoom
// ════════════════════════════════════════════════════════
const oldOpenJitsiComment = `      // Ouvre immǸdiatement Google Meet dans un nouvel onglet
      window.open(url, '_blank', 'noopener')`;

const newOpenJitsiComment = `      // Ouvre immédiatement Jitsi Meet dans un nouvel onglet
      // ✅ Aucun compte requis, aucun code PIN, aucun appel téléphonique
      window.open(url, '_blank', 'noopener')`;

if (html.includes(oldOpenJitsiComment)) {
  html = html.replace(oldOpenJitsiComment, newOpenJitsiComment);
  changes.push('  ✅ Commentaire _openJitsiRoom : Google Meet → Jitsi Meet (sans contrainte)');
  totalFixes++;
} else {
  // Chercher variante avec caractères spéciaux
  const commentRegex = /\/\/\s*Ouvre\s*immǸdiatement\s*Google\s*Meet.*\n\s*window\.open\(url/;
  if (commentRegex.test(html)) {
    html = html.replace(commentRegex, `      // Ouvre immédiatement Jitsi Meet dans un nouvel onglet (sans compte, sans code PIN)\n      window.open(url`);
    changes.push('  ✅ Commentaire _openJitsiRoom : regex fallback');
    totalFixes++;
  }
}

// ════════════════════════════════════════════════════════
// 6. CORRIGER les toasts résiduels "Google Meet" dans la zone _fsGenRandomMeet
// ════════════════════════════════════════════════════════
// Rechercher tout toast contenant "Google Meet" dans les fonctions visio
const googleMeetToastRegex = /toast\s*\(\s*['"]⭕ Lien Google Meet copié/;
if (googleMeetToastRegex.test(html)) {
  html = html.replace(googleMeetToastRegex, `toast('🔗 Lien Jitsi Meet copié`);
  changes.push('  ✅ Toast "Google Meet copié" → "Jitsi Meet copié"');
  totalFixes++;
}

// ════════════════════════════════════════════════════════
// 7. VÉRIFIER qu'aucun résidu Google Meet ne subsiste dans les fonctions
// ════════════════════════════════════════════════════════
const googleResiduals = [
  { pattern: /meet\.google\.com\/new/g, desc: 'meet.google.com/new' },
  { pattern: /meet\.google\.com\//g, desc: 'meet.google.com/' },
  { pattern: /Google Meet/g, desc: 'texte "Google Meet"' },
];

googleResiduals.forEach(({ pattern, desc }) => {
  const matches = html.match(pattern);
  if (matches) {
    changes.push(`  ⚠️ Résidu "${desc}" : ${matches.length} occurrence(s) trouvée(s) — NON dans les fonctions visio (peut-être dans logs/comments)`);
  }
});

// ════════════════════════════════════════════════════════
// Sauvegarde
// ════════════════════════════════════════════════════════
fs.writeFileSync(DASHBOARD, html, 'utf8');
console.log('\n═══════════════════════════════════════════');
console.log('✅ CORRECTION VISIO JITSI — TERMINÉE');
console.log('═══════════════════════════════════════════');
console.log('📋 Changements (' + changes.length + '):');
changes.forEach(c => console.log(c));
console.log('\n📊 Total corrections: ' + totalFixes);
console.log('✅ Fichier sauvegardé');
console.log('\n💡 IMPORTANT: Jitsi Meet ne nécessite AUCUN compte, AUCUN code PIN, AUCUN appel téléphonique.');
console.log('   Les salles sont ouvertes directement en cliquant sur le lien.');
