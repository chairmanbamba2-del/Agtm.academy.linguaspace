// fix_corrections_critiques.js
// AGTM Digital Academy — 4 Corrections critiques manquantes
// 1. Proforma - Envoi email automatique
// 2. Alerte de seuil de caisse
// 3. Expiration des contrats (alerte proactive)
// 4. Solde de congés automatique
// Exécution: node fix_corrections_critiques.js

const fs = require('fs');
const path = require('path');

const DASHBOARD = path.join(__dirname, 'dashboard.html');
const BACKUP = path.join(__dirname, 'dashboard.html.corrections-backup');

console.log('🔧 CORRECTIONS CRITIQUES — 4 modules');
console.log('═══════════════════════════════════════\n');

let html = fs.readFileSync(DASHBOARD, 'utf8');
fs.writeFileSync(BACKUP, html, 'utf8');
console.log('✅ Backup: dashboard.html.corrections-backup (' + (html.length/1024).toFixed(1) + ' KB)\n');

let count = 0;

// ════════════════════════════════════════════════════════════════════
// 1. PROFORMA — Envoi email automatique
// ════════════════════════════════════════════════════════════════════

const proformaCode = `
    // CORRECTION 1 : PROFORMA — Envoi email automatique
    window._sendProformaEmail = async function(pfId) {
      if (!pfId) pfId = window._pfCurrentId || '';
      if (!pfId) { alert('Aucune proforma selectionnee'); return; }
      var email = prompt('Adresse email du destinataire :');
      if (!email) return;
      var btn = document.querySelector('.pf-email-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi...'; }
      try {
        var pdfData = await window._genPdfProforma(pfId);
        var resp = await fetch(SUPABASE_URL + '/functions/v1/send-email-proforma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON },
          body: JSON.stringify({ proforma_id: pfId, email: email, pdf_data: pdfData })
        });
        var result = await resp.json();
        if (resp.ok) {
          alert('Proforma envoyee avec succes a ' + email);
          if (window._logAction) window._logAction('proforma_email', 'Proforma #' + pfId + ' envoyee');
        } else {
          alert('Erreur envoi: ' + (result.error || 'Inconnue'));
        }
      } catch(e) {
        alert('Erreur: ' + e.message);
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Envoyer par email'; }
    };

    window._genPdfProforma = async function(pfId) {
      if (!pfId) pfId = window._pfCurrentId || '';
      var pf = window._pfData ? window._pfData.find(function(p) { return p.id == pfId; }) : null;
      if (!pf) { alert('Proforma introuvable'); return null; }
      var nom = pf.etudiant_nom || pf.etudiant || 'N/A';
      var formation = pf.formation || pf.module || 'N/A';
      var montant = pf.montant || pf.total || 0;
      var date = new Date().toLocaleDateString('fr-FR');
      return '<div style="font-family:Arial;padding:30px;max-width:800px;margin:auto">' +
        '<div style="text-align:center;border-bottom:2px solid #D4A017;padding-bottom:15px;margin-bottom:20px">' +
        '<h1 style="color:#0D1B2A;margin:0">AGTM DIGITAL ACADEMY</h1>' +
        '<p style="color:#4A6080;font-size:12px">Facture Proforma #' + pfId + '</p></div>' +
        '<table style="width:100%;border-collapse:collapse;margin:15px 0">' +
        '<tr><td style="padding:8px;font-weight:700">Etudiant:</td><td style="padding:8px">' + nom + '</td></tr>' +
        '<tr><td style="padding:8px;font-weight:700">Formation:</td><td style="padding:8px">' + formation + '</td></tr>' +
        '<tr><td style="padding:8px;font-weight:700">Montant:</td><td style="padding:8px;font-size:18px;font-weight:700;color:#D4A017">' + montant + ' FCFA</td></tr>' +
        '<tr><td style="padding:8px;font-weight:700">Date:</td><td style="padding:8px">' + date + '</td></tr></table>' +
        '<div style="margin-top:30px;padding-top:15px;border-top:1px solid #ddd;font-size:11px;color:#888;text-align:center">' +
        'AGTM DIGITAL ACADEMY - Abidjan, Cote d Ivoire<br>Ce document est une facture proforma.</div></div>';
    };

    window._addProformaEmailBtn = function() {
      var pfActions = document.getElementById('pfActions') || document.querySelector('.proforma-actions');
      if (!pfActions || document.getElementById('pfEmailBtn')) return;
      var btn = document.createElement('button');
      btn.id = 'pfEmailBtn';
      btn.className = 'pf-email-btn';
      btn.innerHTML = 'Envoyer par email';
      btn.onclick = function() { window._sendProformaEmail(); };
      btn.style.cssText = 'padding:8px 16px;border-radius:8px;border:2px solid #D4A017;background:#fff;color:#0D1B2A;cursor:pointer;font-weight:700;font-size:.8rem;margin-left:8px';
      pfActions.appendChild(btn);
    };
`;

// Chercher un point d'injection
var pfMarker = 'pfTotal';
if (html.indexOf(pfMarker) !== -1) {
  var pfFnMarker = 'window._renderProforma';
  if (html.indexOf(pfFnMarker) !== -1) {
    html = html.replace(pfFnMarker, proformaCode + '\n    ' + pfFnMarker);
    count++;
    console.log('1/4 Proforma - Envoi email automatique injecte');
  } else {
    html = html.replace(/(id="pfTotal"[^>]*>)/, '$1\n' + proformaCode);
    count++;
    console.log('1/4 Proforma - Envoi email injecte (fallback)');
  }
} else {
  console.log('1/4 Proforma - Section non trouvee');
}

// ════════════════════════════════════════════════════════════════════
// 2. ALERTE DE SEUIL DE CAISSE
// ════════════════════════════════════════════════════════════════════

var caisseCode = `
    // CORRECTION 2 : ALERTE DE SEUIL DE CAISSE
    window._seuilCaisse = 100000;
    window._alerteCaisseActivee = false;

    window._setSeuilCaisse = function(nouveauSeuil) {
      var s = parseInt(nouveauSeuil);
      if (isNaN(s) || s < 0) { alert('Montant invalide'); return; }
      window._seuilCaisse = s;
      localStorage.setItem('agtm_seuil_caisse', s);
      window._checkSeuilCaisse();
      alert('Seuil de caisse fixe a ' + s.toLocaleString('fr-FR') + ' FCFA');
    };

    window._checkSeuilCaisse = function() {
      try {
        var solde = window._soldeCaisse || 0;
        var seuil = parseInt(localStorage.getItem('agtm_seuil_caisse')) || window._seuilCaisse;
        if (solde <= seuil && !window._alerteCaisseActivee) {
          window._alerteCaisseActivee = true;
          var msg = 'ALERTE CAISSE : Solde (' + solde.toLocaleString('fr-FR') + ' FCFA) sous le seuil (' + seuil.toLocaleString('fr-FR') + ' FCFA)';
          if (window._showNotification) window._showNotification(msg, 'danger');
          console.warn(msg);
        }
        if (solde > seuil) window._alerteCaisseActivee = false;
      } catch(e) { console.error('Erreur checkSeuilCaisse:', e); }
    };

    window._initSeuilCaisse = function() {
      var saved = localStorage.getItem('agtm_seuil_caisse');
      if (saved) window._seuilCaisse = parseInt(saved);
      window._checkSeuilCaisse();
      setInterval(function() { window._checkSeuilCaisse(); }, 60000);
    };
`;

var caisseMarker = 'journalCaisse';
if (html.indexOf(caisseMarker) !== -1) {
  html = html.replace(/(window\._renderJournalCaisse|function\s+renderJournalCaisse)/, caisseCode + '\n    $1');
  count++;
  console.log('2/4 Alerte seuil de caisse injectee');
} else {
  // Fallback: injecter pres de la section caisse
  html = html.replace(/(id="caisse"[^>]*>)/, '$1\n' + caisseCode);
  count++;
  console.log('2/4 Alerte seuil de caisse injectee (fallback)');
}

// ════════════════════════════════════════════════════════════════════
// 3. EXPIRATION DES CONTRATS (alerte proactive)
// ════════════════════════════════════════════════════════════════════

var contratCode = `
    // CORRECTION 3 : EXPIRATION DES CONTRATS - Alerte proactive
    window._checkExpirationContrat = function() {
      try {
        var personnel = window._personnelData || [];
        var now = new Date();
        var dans30Jours = new Date(now.getTime() + 30*24*60*60*1000);
        var alertes = [];
        personnel.forEach(function(p) {
          if (p.date_fin_contrat) {
            var fin = new Date(p.date_fin_contrat);
            if (fin > now && fin <= dans30Jours) {
              var joursRestants = Math.ceil((fin - now) / (24*60*60*1000));
              alertes.push(p.nom + ' ' + (p.prenom || '') + ' - contrat expire dans ' + joursRestants + ' jours (' + fin.toLocaleDateString('fr-FR') + ')');
            }
            if (fin <= now) {
              alertes.push(p.nom + ' ' + (p.prenom || '') + ' - CONTRAT EXPIRE depuis le ' + fin.toLocaleDateString('fr-FR'));
            }
          }
        });
        if (alertes.length > 0) {
          var msg = 'ALERTE CONTRATS :\\n' + alertes.join('\\n');
          if (window._showNotification) window._showNotification(msg, 'warning');
          console.warn(msg);
          // Afficher dans le dashboard
          var container = document.getElementById('alertesContainer') || document.querySelector('.alertes-section');
          if (container) {
            var htmlAlerte = '<div class="alerte-contrats" style="background:#FFF3CD;border:1px solid #FFC107;border-radius:8px;padding:12px;margin:8px 0">' +
              '<strong style="color:#856404">Contrats arrivant a expiration</strong><ul style="margin:8px 0 0 16px;font-size:.82rem">';
            alertes.forEach(function(a) { htmlAlerte += '<li>' + a + '</li>'; });
            htmlAlerte += '</ul></div>';
            container.innerHTML = htmlAlerte + container.innerHTML;
          }
        }
      } catch(e) { console.error('Erreur checkExpirationContrat:', e); }
    };

    window._initAlerteContrats = function() {
      window._checkExpirationContrat();
      setInterval(function() { window._checkExpirationContrat(); }, 3600000);
    };
`;

var contratMarker = 'date_fin_contrat';
if (html.indexOf(contratMarker) !== -1) {
  html = html.replace(/(window\._renderPersonnel|function\s+renderPersonnel)/, contratCode + '\n    $1');
  count++;
  console.log('3/4 Alerte expiration contrats injectee');
} else {
  html = html.replace(/(id="personnel"[^>]*>)/, '$1\n' + contratCode);
  count++;
  console.log('3/4 Alerte expiration contrats injectee (fallback)');
}

// ════════════════════════════════════════════════════════════════════
// 4. SOLDE DE CONGES AUTOMATIQUE
// ════════════════════════════════════════════════════════════════════

var congeCode = `
    // CORRECTION 4 : SOLDE DE CONGES AUTOMATIQUE
    window._calculSoldeConge = function(employeId) {
      try {
        var personnel = window._personnelData || [];
        var conges = window._congeData || [];
        var emp = employeId ? personnel.find(function(p) { return p.id == employeId; }) : null;
        if (!emp && employeId) return { error: 'Employe introuvable' };
        var resultats = [];
        var liste = employeId ? [emp] : personnel;
        liste.forEach(function(p) {
          if (!p.id) return;
          // Jours acquis: 2.5 jours par mois depuis date_embauche
          var dateEmbauche = p.date_embauche ? new Date(p.date_embauche) : new Date();
          var now = new Date();
          var moisTravailles = (now.getFullYear() - dateEmbauche.getFullYear()) * 12 + (now.getMonth() - dateEmbauche.getMonth());
          if (moisTravailles < 0) moisTravailles = 0;
          var joursAcquis = Math.floor(moisTravailles * 2.5);
          // Jours pris
          var joursPris = 0;
          conges.forEach(function(c) {
            if (c.employe_id == p.id && c.statut == 'valide') {
              var debut = c.date_debut ? new Date(c.date_debut) : null;
              var fin = c.date_fin ? new Date(c.date_fin) : null;
              if (debut && fin) {
                joursPris += Math.ceil((fin - debut) / (24*60*60*1000)) + 1;
              }
            }
          });
          var solde = joursAcquis - joursPris;
          resultats.push({
            id: p.id,
            nom: p.nom + ' ' + (p.prenom || ''),
            joursAcquis: joursAcquis,
            joursPris: joursPris,
            solde: solde
          });
        });
        window._soldeCongesData = resultats;
        return employeId ? resultats[0] : resultats;
      } catch(e) { console.error('Erreur calculSoldeConge:', e); return []; }
    };

    window._afficherSoldeConge = function(employeId) {
      var resultats = window._calculSoldeConge(employeId);
      if (!resultats || (Array.isArray(resultats) && resultats.length === 0)) {
        alert('Aucune donnee de conges disponible');
        return;
      }
      var liste = Array.isArray(resultats) ? resultats : [resultats];
      var htmlTable = '<div style="margin:10px 0"><h4 style="color:#0D1B2A;margin-bottom:8px">Solde de conges</h4>' +
        '<table style="width:100%;border-collapse:collapse;font-size:.82rem">' +
        '<tr style="background:#0D1B2A;color:#E8B84B"><th style="padding:8px">Employe</th><th style="padding:8px">Jours acquis</th><th style="padding:8px">Jours pris</th><th style="padding:8px">Solde</th></tr>';
      liste.forEach(function(r) {
        var couleur = r.solde < 0 ? '#721C24' : r.solde < 5 ? '#856404' : '#155724';
        htmlTable += '<tr><td style="padding:8px;border-bottom:1px solid #ddd">' + r.nom + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #ddd;text-align:center">' + r.joursAcquis + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #ddd;text-align:center">' + r.joursPris + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;font-weight:700;color:' + couleur + '">' + r.solde + ' jours</td></tr>';
      });
      htmlTable += '</table></div>';
      // Afficher dans une modale ou une section
      var container = document.getElementById('congeSoldeContainer');
      if (container) {
        container.innerHTML = htmlTable;
      } else {
        // Creer une modale legere
        var modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
        modal.onclick = function() { document.body.removeChild(modal); };
        var content = document.createElement('div');
        content.style.cssText = 'background:#fff;border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto';
        content.onclick = function(e) { e.stopPropagation(); };
        content.innerHTML = htmlTable + '<button onclick="this.closest(\\'div[style]\\').parentElement.remove()" style="margin-top:12px;padding:8px 16px;background:#0D1B2A;color:#fff;border:none;border-radius:6px;cursor:pointer">Fermer</button>';
        modal.appendChild(content);
        document.body.appendChild(modal);
      }
    };

    window._initSoldeConges = function() {
      window._calculSoldeConge();
      setInterval(function() { window._calculSoldeConge(); }, 300000);
    };
`;

var congeMarker = 'conge';
if (html.indexOf(congeMarker) !== -1) {
  html = html.replace(/(window\._renderConges|function\s+renderConges)/, congeCode + '\n    $1');
  count++;
  console.log('4/4 Solde de conges automatique injecte');
} else {
  html = html.replace(/(id="conges"[^>]*>)/, '$1\n' + congeCode);
  count++;
  console.log('4/4 Solde de conges automatique injecte (fallback)');
}

// ════════════════════════════════════════════════════════════════════
// SAUVEGARDE
// ════════════════════════════════════════════════════════════════════

fs.writeFileSync(DASHBOARD, html, 'utf8');
console.log('\n✅ Fichier mis a jour: dashboard.html (' + (html.length/1024).toFixed(1) + ' KB)');
console.log('✅ ' + count + '/4 corrections injectees avec succes');
console.log('✅ Backup: dashboard.html.corrections-backup');

// Verifier les injections
console.log('\n--- VERIFICATION ---');
var saved = fs.readFileSync(DASHBOARD, 'utf8');
var checks = [
  ['_sendProformaEmail', 'Proforma email'],
  ['_genPdfProforma', 'Generation PDF'],
  ['_checkSeuilCaisse', 'Seuil caisse'],
  ['_checkExpirationContrat', 'Expiration contrats'],
  ['_calculSoldeConge', 'Solde conges'],
];
checks.forEach(function(c) {
  console.log('  ' + c[1] + ' (' + c[0] + '): ' + (saved.indexOf(c[0]) !== -1 ? 'OK' : 'MANQUANT'));
});
