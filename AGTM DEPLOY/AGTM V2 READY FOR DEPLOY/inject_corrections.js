const fs = require('fs');
const d = fs.readFileSync('dashboard.html', 'utf8');
const idx = d.lastIndexOf('</script>');

const code = `

// CORRECTIONS CRITIQUES 2-4
window._seuilCaisse = 100000;
window._alerteCaisseActivee = false;

window._setSeuilCaisse = function(s) {
  var n = parseInt(s);
  if (isNaN(n) || n < 0) { alert('Montant invalide'); return; }
  window._seuilCaisse = n;
  localStorage.setItem('agtm_seuil_caisse', n);
  window._checkSeuilCaisse();
  alert('Seuil fixe a ' + n.toLocaleString('fr-FR') + ' FCFA');
};

window._checkSeuilCaisse = function() {
  try {
    var s = window._soldeCaisse || 0;
    var seuil = parseInt(localStorage.getItem('agtm_seuil_caisse')) || window._seuilCaisse;
    if (s <= seuil && !window._alerteCaisseActivee) {
      window._alerteCaisseActivee = true;
      var m = 'ALERTE CAISSE: Solde (' + s.toLocaleString('fr-FR') + ' FCFA) sous seuil (' + seuil.toLocaleString('fr-FR') + ' FCFA)';
      if (window._showNotification) window._showNotification(m, 'danger');
    }
    if (s > seuil) window._alerteCaisseActivee = false;
  } catch(e) { console.error(e); }
};

window._initSeuilCaisse = function() {
  var s = localStorage.getItem('agtm_seuil_caisse');
  if (s) window._seuilCaisse = parseInt(s);
  window._checkSeuilCaisse();
  setInterval(function() { window._checkSeuilCaisse(); }, 60000);
};

window._checkExpirationContrat = function() {
  try {
    var p = window._personnelData || [];
    var n = new Date();
    var d30 = new Date(n.getTime() + 30*24*60*60*1000);
    var a = [];
    p.forEach(function(e) {
      if (e.date_fin_contrat) {
        var f = new Date(e.date_fin_contrat);
        if (f > n && f <= d30) {
          var j = Math.ceil((f - n) / (24*60*60*1000));
          a.push(e.nom + ' ' + (e.prenom || '') + ' - contrat expire dans ' + j + ' jours (' + f.toLocaleDateString('fr-FR') + ')');
        }
        if (f <= n) {
          a.push(e.nom + ' ' + (e.prenom || '') + ' - CONTRAT EXPIRE depuis ' + f.toLocaleDateString('fr-FR'));
        }
      }
    });
    if (a.length > 0) {
      var m = 'ALERTE CONTRATS: ' + a.join(' | ');
      if (window._showNotification) window._showNotification(m, 'warning');
    }
  } catch(e) { console.error(e); }
};

window._initAlerteContrats = function() {
  window._checkExpirationContrat();
  setInterval(function() { window._checkExpirationContrat(); }, 3600000);
};

window._calculSoldeConge = function(id) {
  try {
    var p = window._personnelData || [];
    var c = window._congeData || [];
    var r = [];
    var l = id ? [p.find(function(x) { return x.id == id; })] : p;
    l.forEach(function(e) {
      if (!e.id) return;
      var d = e.date_embauche ? new Date(e.date_embauche) : new Date();
      var n = new Date();
      var m = (n.getFullYear() - d.getFullYear()) * 12 + (n.getMonth() - d.getMonth());
      if (m < 0) m = 0;
      var ac = Math.floor(m * 2.5);
      var pr = 0;
      c.forEach(function(v) {
        if (v.employe_id == e.id && v.statut == 'valide') {
          var db = v.date_debut ? new Date(v.date_debut) : null;
          var fn = v.date_fin ? new Date(v.date_fin) : null;
          if (db && fn) pr += Math.ceil((fn - db) / (24*60*60*1000)) + 1;
        }
      });
      r.push({ id: e.id, nom: e.nom + ' ' + (e.prenom || ''), acquis: ac, pris: pr, solde: ac - pr });
    });
    window._soldeCongesData = r;
    return id ? r[0] : r;
  } catch(e) { console.error(e); return []; }
};

window._afficherSoldeConge = function(id) {
  var r = window._calculSoldeConge(id);
  if (!r || (Array.isArray(r) && r.length === 0)) { alert('Aucune donnee'); return; }
  var l = Array.isArray(r) ? r : [r];
  var h = '<div style="margin:10px 0"><h4>Solde conges</h4><table style="width:100%;border-collapse:collapse;font-size:.82rem"><tr style="background:#0D1B2A;color:#E8B84B"><th>Employe</th><th>Acquis</th><th>Pris</th><th>Solde</th></tr>';
  l.forEach(function(x) {
    var c = x.solde < 0 ? '#721C24' : x.solde < 5 ? '#856404' : '#155724';
    h += '<tr><td>' + x.nom + '</td><td style="text-align:center">' + x.acquis + '</td><td style="text-align:center">' + x.pris + '</td><td style="text-align:center;font-weight:700;color:' + c + '">' + x.solde + ' j</td></tr>';
  });
  h += '</table></div>';
  var ct = document.getElementById('congeSoldeContainer');
  if (ct) { ct.innerHTML = h; } else { alert(h.replace(/<[^>]*>/g, '')); }
};

window._initSoldeConges = function() {
  window._calculSoldeConge();
  setInterval(function() { window._calculSoldeConge(); }, 300000);
};
`;

const result = d.substring(0, idx) + code + d.substring(idx);
fs.writeFileSync('dashboard.html', result, 'utf8');

const v = fs.readFileSync('dashboard.html', 'utf8');
console.log('_checkSeuilCaisse:', v.includes('_checkSeuilCaisse'));
console.log('_checkExpirationContrat:', v.includes('_checkExpirationContrat'));
console.log('_calculSoldeConge:', v.includes('_calculSoldeConge'));
console.log('Taille:', v.length);
