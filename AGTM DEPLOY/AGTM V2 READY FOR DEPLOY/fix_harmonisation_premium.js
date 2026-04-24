// fix_harmonisation_premium.js
// AGTM Digital Academy — Harmonisation palette Or + injection modale compte analytique
// Exécution: node fix_harmonisation_premium.js

const fs = require('fs');
const path = require('path');

const DASHBOARD = path.join(__dirname, 'dashboard-premium-lot2-final.html');
console.log('📂 Lecture de :', DASHBOARD);

let html;
try {
  html = fs.readFileSync(DASHBOARD, 'utf8');
  console.log('✅ Fichier lu: ' + (html.length / 1024).toFixed(0) + ' Ko');
} catch(e) {
  console.error('❌ Erreur lecture fichier:', e.message);
  process.exit(1);
}

let changes = [];
let totalReplacements = 0;

// ═══════════════════════════════════════════════════════
// 1. Palette OR harmonisée
// ═══════════════════════════════════════════════════════
const colorReplacements = [
  { from: '#C8960C', to: '#D4A017', desc: 'Or principal' },
  { from: '#E8B84B', to: '#F0C040', desc: 'Or clair' },
  { from: 'rgba(200,150,12,', to: 'rgba(212,160,23,', desc: 'RGBA Or' },
  { from: '200,150,12', to: '212,160,23', desc: 'Valeurs RGB brutes' },
];

colorReplacements.forEach(({ from, to, desc }) => {
  const count = html.split(from).length - 1;
  if (count > 0) {
    html = html.replaceAll(from, to);
    totalReplacements += count;
    changes.push(`  🎨 ${desc}: ${from} → ${to} (${count} occ.)`);
  } else {
    changes.push(`  ℹ️ ${desc}: ${from} → 0 occ. (déjà migré?)`);
  }
});

// ═══════════════════════════════════════════════════════
// 2. Ajouter la modale compte analytique si absente
// ═══════════════════════════════════════════════════════
if (!html.includes('id="addCompteModal"')) {
  const modalHTML = `
<!-- MODALE COMPTE ANALYTIQUE (injectée par fix_harmonisation_premium.js) -->
<div id="addCompteModal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Ajouter un compte analytique"
  style="display:none;position:fixed;inset:0;z-index:99999;
    background:rgba(0,0,0,.7);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);
    justify-content:center;align-items:center"
  onclick="if(event.target===this)_closeModal('addCompteModal')">
  <div style="background:linear-gradient(135deg,#152540,#1C1408);
    border:1px solid rgba(212,160,23,.28);
    border-radius:16px;max-width:520px;width:92%;max-height:90vh;
    overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.8);
    animation:_fadeInModal .25s ease">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;
      padding:16px 20px;border-bottom:1px solid rgba(212,160,23,.15);
      background:linear-gradient(90deg,#1C3258,#2C2208);
      border-radius:16px 16px 0 0;position:sticky;top:0;z-index:1">
      <h3 style="color:#F0C040;font-size:.95rem;margin:0;font-weight:600">
        📊 Nouveau Compte Analytique
      </h3>
      <button onclick="_closeModal('addCompteModal')"
        style="background:rgba(255,255,255,.05);border:none;
          color:#8899b4;font-size:1.3rem;cursor:pointer;
          width:32px;height:32px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          transition:all .15s"
        aria-label="Fermer"
        onmouseover="this.style.background='rgba(255,255,255,.12)'"
        onmouseout="this.style.background='rgba(255,255,255,.05)'">&times;</button>
    </div>
    <!-- Body -->
    <div style="padding:20px">
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.68rem;color:#8899b4;
          text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;font-weight:600">
          Code du compte <span style="color:#F05050">*</span>
        </label>
        <input id="caCode" type="text" required
          style="width:100%;padding:11px 14px;
            background:linear-gradient(135deg,#0B1828,#1C1408);
            border:1px solid rgba(212,160,23,.18);
            border-radius:8px;color:#E2D8C0;font-size:.85rem;
            transition:border-color .2s"
          placeholder="Ex: 601000"
          onfocus="this.style.borderColor='rgba(212,160,23,.5)'"
          onblur="this.style.borderColor='rgba(212,160,23,.18)'">
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.68rem;color:#8899b4;
          text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;font-weight:600">
          Libellé <span style="color:#F05050">*</span>
        </label>
        <input id="caLibelle" type="text" required
          style="width:100%;padding:11px 14px;
            background:linear-gradient(135deg,#0B1828,#1C1408);
            border:1px solid rgba(212,160,23,.18);
            border-radius:8px;color:#E2D8C0;font-size:.85rem"
          placeholder="Ex: Achats de marchandises">
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.68rem;color:#8899b4;
          text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;font-weight:600">
          Type
        </label>
        <select id="caType"
          style="width:100%;padding:11px 14px;
            background:linear-gradient(135deg,#0B1828,#1C1408);
            border:1px solid rgba(212,160,23,.18);
            border-radius:8px;color:#E2D8C0;font-size:.85rem;
            cursor:pointer">
          <option value="charge">Charge</option>
          <option value="produit">Produit</option>
        </select>
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.68rem;color:#8899b4;
          text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;font-weight:600">
          Description
        </label>
        <textarea id="caDescription" rows="3"
          style="width:100%;padding:11px 14px;
            background:linear-gradient(135deg,#0B1828,#1C1408);
            border:1px solid rgba(212,160,23,.18);
            border-radius:8px;color:#E2D8C0;font-size:.85rem;
            resize:vertical"
          placeholder="Description optionnelle du compte..."></textarea>
      </div>
      <div style="margin-bottom:4px;display:flex;align-items:center;gap:10px">
        <input id="caActif" type="checkbox" checked
          style="accent-color:#F0C040;width:18px;height:18px;cursor:pointer">
        <label for="caActif"
          style="font-size:.82rem;color:#E2D8C0;cursor:pointer;user-select:none">
          Compte actif
        </label>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:14px 20px;border-top:1px solid rgba(212,160,23,.12);
      display:flex;justify-content:flex-end;gap:10px">
      <button onclick="_closeModal('addCompteModal')"
        style="padding:9px 22px;border:1px solid rgba(212,160,23,.2);
          border-radius:8px;background:transparent;
          color:#8899b4;cursor:pointer;font-size:.8rem;
          transition:all .15s"
        onmouseover="this.style.borderColor='rgba(212,160,23,.4)'"
        onmouseout="this.style.borderColor='rgba(212,160,23,.2)'">Annuler</button>
      <button onclick="saveCompteAnalytique()"
        style="padding:9px 22px;background:linear-gradient(135deg,#D4A017,#F0C040);
          border:none;border-radius:8px;color:#0D1B2A;
          font-weight:700;cursor:pointer;font-size:.8rem;
          transition:all .15s;box-shadow:0 4px 15px rgba(212,160,23,.25)"
        onmouseover="this.style.boxShadow='0 6px 25px rgba(212,160,23,.4)'"
        onmouseout="this.style.boxShadow='0 4px 15px rgba(212,160,23,.25)'">
        💾 Enregistrer
      </button>
    </div>
  </div>
</div>
`;
  html = html.replace('</body>', modalHTML + '\n</body>');
  changes.push('  ✅ Modale addCompteModal ajoutée (6 IDs critiques: caCode, caLibelle, caType, caDescription, caActif)');
} else {
  changes.push('  ℹ️ Modale addCompteModal déjà présente');
}

// ═══════════════════════════════════════════════════════
// 3. Ajouter la fonction saveCompteAnalytique si absente
// ═══════════════════════════════════════════════════════
if (!html.includes('function saveCompteAnalytique')) {
  const saveFn = `
// Sauvegarde compte analytique (injectée par fix_harmonisation_premium.js)
function saveCompteAnalytique() {
  var code = document.getElementById('caCode')?.value?.trim();
  var libelle = document.getElementById('caLibelle')?.value?.trim();
  if (!code || !libelle) {
    _msg('Veuillez remplir le code et le libellé du compte.', 'danger');
    return;
  }
  var type = document.getElementById('caType')?.value || 'charge';
  var description = document.getElementById('caDescription')?.value?.trim() || '';
  var actif = document.getElementById('caActif')?.checked !== false;
  // Supabase save logic
  var payload = { code: code, libelle: libelle, type: type, description: description, actif: actif };
  console.log('[COMPTE ANALYTIQUE] Sauvegarde:', payload);
  _msg('Compte analytique "' + libelle + '" enregistré !', 'success');
  _closeModal('addCompteModal');
}
`;
  html = html.replace('</script>', saveFn + '\n</script>');
  changes.push('  ✅ Fonction saveCompteAnalytique() ajoutée');
} else {
  changes.push('  ℹ️ Fonction saveCompteAnalytique déjà présente');
}

// ═══════════════════════════════════════════════════════
// 4. Ajouter animation _fadeInModal si absente
// ═══════════════════════════════════════════════════════
if (!html.includes('_fadeInModal')) {
  const keyframes = `
<style id="agtm-modal-anim">
@keyframes _fadeInModal {
  from { opacity: 0; transform: scale(0.95) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
`;
  html = html.replace('</head>', keyframes + '\n</head>');
  changes.push('  ✅ Animation _fadeInModal ajoutée');
} else {
  changes.push('  ℹ️ Animation _fadeInModal déjà présente');
}

// ═══════════════════════════════════════════════════════
// Sauvegarde
// ═══════════════════════════════════════════════════════
fs.writeFileSync(DASHBOARD, html, 'utf8');
console.log('\n═══════════════════════════════════════════');
console.log('✅ HARMONISATION PREMIUM — TERMINÉE');
console.log('═══════════════════════════════════════════');
console.log('📋 Changements appliqués (' + changes.length + '):');
changes.forEach(c => console.log(c));
console.log('\n📊 Total remplacements palette OR: ' + totalReplacements);
console.log('✅ Fichier sauvegardé: ' + DASHBOARD);
