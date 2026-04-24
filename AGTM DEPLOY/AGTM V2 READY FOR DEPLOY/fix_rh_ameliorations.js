// fix_rh_ameliorations.js
// AGTM Digital Academy — 5 Améliorations RH
// 1. Graphiques effectifs (Chart.js)
// 2. Export CSV personnel/paie
// 3. Intégration pointage → paie
// 4. Notifications congés
// 5. Filtre avancé recrutement
// Exécution: node fix_rh_ameliorations.js

const fs = require('fs');
const path = require('path');

const DASHBOARD = path.join(__dirname, 'dashboard.html');
const BACKUP = path.join(__dirname, 'dashboard.html.rh-backup');

console.log('🔧 AMELIORATIONS RH — 5 modules');
console.log('════════════════════════════════\n');

let html = fs.readFileSync(DASHBOARD, 'utf8');
fs.writeFileSync(BACKUP, html, 'utf8');
console.log('✅ Backup: dashboard.html.rh-backup (' + (html.length/1024).toFixed(1) + ' KB)\n');

// ════════════════════════════════════════════════════════════════════
// CODE A INJECTER (avant la fin du dernier </script>)
// ════════════════════════════════════════════════════════════════════

const code = `

// ═══════════════════════════════════════════════════════════════════
// AMELIORATIONS RH — 5 modules (23/04/2026)
// ═══════════════════════════════════════════════════════════════════

// ─── 1. GRAPHIQUES EFFECTIFS (Chart.js) ───
window._renderEffectifChart = function() {
  try {
    var canvas = document.getElementById('effectifChart');
    if (!canvas) {
      // Creer le canvas si besoin
      var container = document.getElementById('effectifChartContainer') || document.querySelector('.rh-stats');
      if (!container) return;
      canvas = document.createElement('canvas');
      canvas.id = 'effectifChart';
      canvas.style.cssText = 'max-height:250px;margin:10px 0';
      container.appendChild(canvas);
    }
    if (typeof Chart === 'undefined') { console.warn('Chart.js non charge'); return; }
    var personnel = window._personnelData || [];
    // Compter par mois d'embauche (12 derniers mois)
    var now = new Date();
    var mois = [];
    for (var i = 11; i >= 0; i--) {
      var m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      mois.push({ label: m.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), count: 0, date: m });
    }
    personnel.forEach(function(p) {
      if (p.date_embauche) {
        var d = new Date(p.date_embauche);
        for (var j = 0; j < mois.length; j++) {
          if (d <= mois[j].date) { mois[j].count++; }
        }
      }
    });
    // Cumul
    var cumul = 0;
    var labels = [], data = [];
    mois.forEach(function(m) { cumul += m.count; labels.push(m.label); data.push(cumul); });
    if (window._effectifChartInstance) window._effectifChartInstance.destroy();
    window._effectifChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Effectifs',
          data: data,
          borderColor: '#D4A017',
          backgroundColor: 'rgba(212,160,23,0.1)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#D4A017',
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#0D1B2A', titleColor: '#E8B84B' }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, color: '#4A6080' } },
          x: { ticks: { color: '#4A6080', maxRotation: 45 } }
        }
      }
    });
  } catch(e) { console.error('Erreur graphique effectifs:', e); }
};

// ─── 2. EXPORT CSV (personnel + paie) ───
window._exportCSV = function(type) {
  try {
    var data = [];
    var headers = [];
    var filename = '';

    if (type === 'personnel' || !type) {
      data = window._personnelData || [];
      headers = ['ID', 'Nom', 'Prenom', 'Poste', 'Email', 'Telephone', 'Date embauche', 'Salaire', 'Statut'];
      filename = 'personnel_export.csv';
    } else if (type === 'paie') {
      data = window._paieData || window._calculPaieData ? window._calculPaieData() : [];
      headers = ['ID', 'Employe', 'Mois', 'Salaire base', 'Primes', 'Avances', 'Net a payer', 'Statut'];
      filename = 'paie_export.csv';
    } else if (type === 'conges') {
      data = window._congeData || [];
      headers = ['ID', 'Employe', 'Date debut', 'Date fin', 'Type', 'Statut'];
      filename = 'conges_export.csv';
    } else if (type === 'recrutement') {
      data = window._recrutementData || [];
      headers = ['ID', 'Candidat', 'Poste', 'Date', 'Statut', 'Email', 'Telephone'];
      filename = 'recrutement_export.csv';
    }

    if (!data || data.length === 0) { alert('Aucune donnee a exporter'); return; }

    var csv = headers.join(';') + '\\r\\n';
    data.forEach(function(row) {
      var vals = headers.map(function(h) {
        var key = h.toLowerCase().replace(/ /g, '_').replace(/[^a-z_]/g, '');
        var val = row[key] !== undefined ? row[key] : row[h] || '';
        return '"' + String(val).replace(/"/g, '""') + '"';
      });
      csv += vals.join(';') + '\\r\\n';
    });

    var blob = new Blob(['\\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    if (window._logAction) window._logAction('export_csv', 'Export ' + filename);
    alert('Export CSV termine : ' + filename);
  } catch(e) { console.error('Erreur export CSV:', e); alert('Erreur export: ' + e.message); }
};

// ─── 3. INTEGRATION POINTAGE → PAIE ───
window._calculPaieData = function() {
  try {
    var personnel = window._personnelData || [];
    var conges = window._congeData || [];
    var pointages = window._pointageData || [];
    var now = new Date();
    var moisCourant = now.getMonth() + 1;
    var anneeCourant = now.getFullYear();

    return personnel.map(function(p) {
      if (!p.id) return null;
      var salaireBase = parseFloat(p.salaire) || 0;
      // Heures travaillees depuis pointages
      var heuresTravaillees = 0;
      pointages.forEach(function(pt) {
        if (pt.employe_id == p.id) {
          var d = pt.date ? new Date(pt.date) : null;
          if (d && d.getMonth() + 1 === moisCourant && d.getFullYear() === anneeCourant) {
            heuresTravaillees += parseFloat(pt.heures) || 0;
          }
        }
      });
      // Jours de conges pris ce mois
      var joursConge = 0;
      conges.forEach(function(c) {
        if (c.employe_id == p.id && c.statut == 'valide') {
          var debut = c.date_debut ? new Date(c.date_debut) : null;
          var fin = c.date_fin ? new Date(c.date_fin) : null;
          if (debut && fin && debut.getMonth() + 1 === moisCourant) {
            joursConge += Math.ceil((fin - debut) / (24*60*60*1000)) + 1;
          }
        }
      });
      // Calcul paie
      var tauxHoraire = salaireBase / 173.33; // 173.33h/mois standard
      var salaireCalcule = heuresTravaillees > 0 ? Math.round(tauxHoraire * heuresTravaillees) : salaireBase;
      var deductionConge = joursConge > 0 ? Math.round(salaireBase * 0.033 * joursConge) : 0; // ~3.3%/jour
      var primes = parseFloat(p.primes) || 0;
      var avances = parseFloat(p.avances) || 0;
      var net = salaireCalcule + primes - deductionConge - avances;

      return {
        id: p.id,
        employe: p.nom + ' ' + (p.prenom || ''),
        mois: moisCourant + '/' + anneeCourant,
        salaire_base: salaireCalcule,
        primes: primes,
        avances: avances,
        deduction_conge: deductionConge,
        heures: heuresTravaillees,
        net_a_payer: Math.max(net, 0),
        statut: heuresTravaillees > 0 ? 'calcule' : 'forfait'
      };
    }).filter(function(r) { return r !== null; });
  } catch(e) { console.error('Erreur calculPaieData:', e); return []; }
};

window._renderPaie = function() {
  try {
    var container = document.getElementById('paieContainer') || document.querySelector('.paie-section');
    if (!container) return;
    var data = window._calculPaieData();
    window._paieData = data;
    var totalNet = 0;
    var html = '<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
      '<h4 style="color:#0D1B2A;margin:0">Paie du mois</h4>' +
      '<button onclick="window._exportCSV(\\'paie\\')" style="padding:6px 14px;background:#0D1B2A;color:#E8B84B;border:none;border-radius:6px;cursor:pointer;font-size:.78rem">Export CSV</button></div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:.8rem">' +
      '<tr style="background:#0D1B2A;color:#E8B84B"><th>Employe</th><th>Salaire</th><th>Primes</th><th>Avances</th><th>Net</th><th>Statut</th></tr>';
    data.forEach(function(r) {
      totalNet += r.net_a_payer;
      html += '<tr><td style="padding:6px;border-bottom:1px solid #ddd">' + r.employe + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #ddd;text-align:right">' + r.salaire_base.toLocaleString('fr-FR') + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #ddd;text-align:right">' + r.primes.toLocaleString('fr-FR') + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #ddd;text-align:right">' + r.avances.toLocaleString('fr-FR') + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #ddd;text-align:right;font-weight:700;color:#D4A017">' + r.net_a_payer.toLocaleString('fr-FR') + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #ddd;text-align:center"><span class="badge ' + (r.statut === 'calcule' ? 'bg-success' : 'bg-info') + '">' + r.statut + '</span></td></tr>';
    });
    html += '<tr style="background:#FFF8E1;font-weight:700"><td colspan="4" style="padding:8px;text-align:right">Total net a payer</td>' +
      '<td style="padding:8px;color:#D4A017;font-size:1rem">' + totalNet.toLocaleString('fr-FR') + ' FCFA</td><td></td></tr>';
    html += '</table></div>';
    container.innerHTML = html;
  } catch(e) { console.error('Erreur renderPaie:', e); }
};

// ─── 4. NOTIFICATIONS CONGES ───
window._checkNouvellesDemandesConges = function() {
  try {
    var conges = window._congeData || [];
    var notifications = window._notificationData || [];
    var nouvelles = conges.filter(function(c) {
      return c.statut === 'en_attente' || c.statut === 'soumis';
    });
    if (nouvelles.length > 0) {
      var msg = nouvelles.length + ' demande(s) de conge en attente de validation';
      if (window._showNotification) window._showNotification(msg, 'warning');
      // Ajouter au panneau de notifications
      var notifPanel = document.getElementById('notificationsPanel') || document.querySelector('.notifications-section');
      if (notifPanel) {
        var htmlNotif = '<div class="conge-notification" style="background:#FFF3CD;border:1px solid #FFC107;border-radius:8px;padding:10px;margin:6px 0">' +
          '<strong style="color:#856404">Demandes de conges</strong><ul style="margin:6px 0 0 14px;font-size:.78rem">';
        nouvelles.forEach(function(c) {
          var emp = (window._personnelData || []).find(function(p) { return p.id == c.employe_id; });
          var nom = emp ? emp.nom + ' ' + (emp.prenom || '') : 'Employe #' + c.employe_id;
          htmlNotif += '<li>' + nom + ' - du ' + (c.date_debut ? new Date(c.date_debut).toLocaleDateString('fr-FR') : '?') +
            ' au ' + (c.date_fin ? new Date(c.date_fin).toLocaleDateString('fr-FR') : '?') + '</li>';
        });
        htmlNotif += '</ul></div>';
        notifPanel.innerHTML = htmlNotif + notifPanel.innerHTML;
      }
    }
  } catch(e) { console.error('Erreur checkNouvellesDemandesConges:', e); }
};

window._initNotificationsConges = function() {
  window._checkNouvellesDemandesConges();
  setInterval(function() { window._checkNouvellesDemandesConges(); }, 120000);
};

// ─── 5. FILTRE AVANCE RECRUTEMENT ───
window._recrutementData = [];

window._filtrerRecrutement = function() {
  try {
    var poste = (document.getElementById('filtrePoste') || {}).value || '';
    var statut = (document.getElementById('filtreStatut') || {}).value || '';
    var dateDebut = (document.getElementById('filtreDateDebut') || {}).value || '';
    var dateFin = (document.getElementById('filtreDateFin') || {}).value || '';

    var data = window._recrutementData || [];
    var filtres = data.filter(function(r) {
      if (poste && r.poste && r.poste.toLowerCase().indexOf(poste.toLowerCase()) === -1) return false;
      if (statut && r.statut && r.statut !== statut) return false;
      if (dateDebut && r.date) {
        var d = new Date(r.date);
        if (d < new Date(dateDebut)) return false;
      }
      if (dateFin && r.date) {
        var d2 = new Date(r.date);
        if (d2 > new Date(dateFin + 'T23:59:59')) return false;
      }
      return true;
    });

    var container = document.getElementById('recrutementTableBody') || document.querySelector('.recrutement-list');
    if (!container) return;
    if (filtres.length === 0) {
      container.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#888">Aucun resultat</td></tr>';
      return;
    }
    var html = '';
    filtres.forEach(function(r) {
      var badge = r.statut === 'accepte' ? 'bg-success' : r.statut === 'refuse' ? 'bg-danger' : r.statut === 'entretien' ? 'bg-warning' : 'bg-info';
      html += '<tr><td style="padding:8px;border-bottom:1px solid #ddd">' + (r.candidat || r.nom || '') + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #ddd">' + (r.poste || '') + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #ddd">' + (r.date ? new Date(r.date).toLocaleDateString('fr-FR') : '') + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #ddd"><span class="badge ' + badge + '">' + (r.statut || '') + '</span></td>' +
        '<td style="padding:8px;border-bottom:1px solid #ddd">' + (r.email || '') + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #ddd">' + (r.telephone || '') + '</td></tr>';
    });
    container.innerHTML = html;
  } catch(e) { console.error('Erreur filtreRecrutement:', e); }
};

window._initFiltreRecrutement = function() {
  // Creer les filtres si la section recrutement existe
  var section = document.getElementById('recrutementFilters') || document.querySelector('.recrutement-filters');
  if (!section) {
    var container = document.getElementById('recrutementContainer') || document.querySelector('.recrutement-section');
    if (!container) return;
    section = document.createElement('div');
    section.id = 'recrutementFilters';
    section.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;padding:12px;background:#F8F9FA;border-radius:8px';
    section.innerHTML =
      '<input id="filtrePoste" placeholder="Poste..." style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:.8rem;flex:1">' +
      '<select id="filtreStatut" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:.8rem">' +
      '<option value="">Tous statuts</option><option value="nouveau">Nouveau</option><option value="entretien">Entretien</option>' +
      '<option value="accepte">Accepte</option><option value="refuse">Refuse</option></select>' +
      '<input id="filtreDateDebut" type="date" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:.8rem">' +
      '<input id="filtreDateFin" type="date" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:.8rem">' +
      '<button onclick="window._filtrerRecrutement()" style="padding:6px 14px;background:#D4A017;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.8rem">Filtrer</button>' +
      '<button onclick="window._exportCSV(\\'recrutement\\')" style="padding:6px 14px;background:#0D1B2A;color:#E8B84B;border:none;border-radius:6px;cursor:pointer;font-size:.8rem">Export CSV</button>';
    container.insertBefore(section, container.firstChild);
  }
  // Ecouter les changements
  ['filtrePoste', 'filtreStatut', 'filtreDateDebut', 'filtreDateFin'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function() { window._filtrerRecrutement(); });
  });
};

// ─── INITIALISATION GLOBALE RH ───
window._initAmeliorationsRH = function() {
  window._renderEffectifChart();
  window._renderPaie();
  window._initNotificationsConges();
  window._initFiltreRecrutement();
  // Re-initialiser periodiquement
  setInterval(function() {
    window._renderEffectifChart();
    window._renderPaie();
  }, 60000);
};
`;

// Injecter avant la fin du dernier </script>
const idx = html.lastIndexOf('</script>');
html = html.substring(0, idx) + code + html.substring(idx);

fs.writeFileSync(DASHBOARD, html, 'utf8');

// Verification
const v = fs.readFileSync(DASHBOARD, 'utf8');
const checks = [
  ['_renderEffectifChart', 'Graphiques effectifs'],
  ['_exportCSV', 'Export CSV'],
  ['_calculPaieData', 'Integration pointage-paie'],
  ['_renderPaie', 'Affichage paie'],
  ['_checkNouvellesDemandesConges', 'Notifications conges'],
  ['_filtrerRecrutement', 'Filtre recrutement'],
  ['_initAmeliorationsRH', 'Initialisation globale'],
];

console.log('--- VERIFICATION ---');
checks.forEach(function(c) {
  console.log('  ' + c[1] + ' (' + c[0] + '): ' + (v.includes(c[0]) ? 'OK' : 'MANQUANT'));
});
console.log('\n✅ Taille finale: ' + (v.length/1024).toFixed(1) + ' KB');
console.log('✅ Backup: dashboard.html.rh-backup');
