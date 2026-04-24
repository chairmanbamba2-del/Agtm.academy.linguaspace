// ══════════════════════════════════════════════════════════════
//  fix_securite_v2.js — Correctifs de sécurité immédiats
//  AGTM Digital Academy — Audit de sécurité critique
//
//  Usage : node fix_securite_v2.js
// ══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

console.log('');
console.log('=== AUDIT DE SECURITE - Correctifs immédiats ===');
console.log('');

// ═══ 1. NETLIFY.TOML — Nettoyer ═════════════════════════════
console.log('[1] netlify.toml :');
let n = fs.readFileSync('netlify.toml', 'utf8');
let nModified = false;

// Remplacer les lignes contenant des clés en clair
const keysToClean = [
  'ANTHROPIC_API_KEY_BACKUP', 'ANTHROPIC_API_KEY',
  'GROQ_API_KEY_BACKUP', 'GROQ_API_KEY',
  'DEEPSEEK_API_KEY_BACKUP', 'DEEPSEEK_API_KEY',
  'BRAVE_SEARCH_API_KEY', 'TAVILY_API_KEY',
  'YOUTUBE_API_KEY_BACKUP', 'YOUTUBE_API_KEY',
  'LISTEN_NOTES_KEY',
  'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM',
  'TWILIO_TEMPLATE_ETUDIANT', 'TWILIO_TEMPLATE_NOUVEAU',
  'SUPABASE_SERVICE_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_URL'
];

let nLines = n.split('\n');
let inValue = false;
let cleanedLines = [];
let cleanedCount = 0;

for (let i = 0; i < nLines.length; i++) {
  let line = nLines[i];
  
  // Détecter les clés sensibles
  const isKeyLine = keysToClean.some(k => line.trim().startsWith(k + ' = ') || line.trim().startsWith(k + '='));
  
  // Détecter les lignes contenant directement des valeurs de clé (format multiligne TOML)
  const hasKeyValue = /"(sk-ant|gsk_|AIza|sb_secret|AC[a-z0-9]|tvly-|BSA)[^"]*"/.test(line);

  if (isKeyLine || hasKeyValue) {
    // Extraire le nom de la clé
    let keyName = line.trim().split('=')[0].trim();
    // Remplacer la valeur
    const newLine = keyName + ' = "VOIR_NETLIFY_UI"';
    cleanedLines.push(newLine);
    cleanedCount++;
    nModified = true;
    console.log('  > NETTOYE: ' + keyName);
  } else {
    cleanedLines.push(line);
  }
}

if (nModified) {
  fs.writeFileSync('netlify.toml', cleanedLines.join('\n'), 'utf8');
  console.log('  => OK: ' + cleanedCount + ' cles nettoyees');
} else {
  console.log('  => Deja propre');
}

// ═══ 2. DASHBOARD.HTML — SERVICE_ROLE → ANON_KEY ═══════════
console.log('[2] dashboard.html :');
let d = fs.readFileSync('dashboard.html', 'utf8');

// Trouver le SERVICE_ROLE JWT
const svcMatch = d.match(/const SUPABASE_SERVICE_ROLE\s*=\s*'[^']+'/);
if (svcMatch) {
  console.log('  > SERVICE_ROLE JWT trouve, suppression...');
  d = d.replace(
    /const SUPABASE_SERVICE_ROLE\s*=\s*'[^']+';/,
    'const SUPABASE_SERVICE_ROLE = null; // SECURITY: removed - use ANON_KEY'
  );
  // Remplacer les références Bearer
  d = d.replace(/\`Bearer \$\{SUPABASE_SERVICE_ROLE\}\`/g, '`Bearer ${SUPABASE_ANON_KEY}`');
  d = d.replace(/apikey:\s*SUPABASE_SERVICE_ROLE/g, 'apikey: SUPABASE_ANON_KEY');
  fs.writeFileSync('dashboard.html', d, 'utf8');
  console.log('  => OK: SERVICE_ROLE remplace par ANON_KEY');
} else {
  console.log('  => SERVICE_ROLE non trouve (deja corrige?)');
}

// Verification
const remainingSvc = (d.match(/SERVICE_ROLE/g) || []).length;
console.log('  => SERVICE_ROLE restants: ' + remainingSvc);

// ═══ 3. .env.example ═══════════════════════════════════════
console.log('[3] .env.example :');
if (!fs.existsSync('.env.example')) {
  const envContent = `# AGTM Digital Academy - Variables d'environnement
# Copier vers .env et remplir avec vos vraies cles
# ATTENTION: Ne jamais commit le .env

SUPABASE_URL=https://fglzovvsyloprokmdadx.supabase.co
SUPABASE_ANON_KEY=sb_publishable_VOTRE_CLE
SUPABASE_SERVICE_KEY=sb_secret_VOTRE_CLE

ANTHROPIC_API_KEY=sk-ant-VOTRE_CLE
GROQ_API_KEY=gsk_VOTRE_CLE
DEEPSEEK_API_KEY=sk-VOTRE_CLE

BRAVE_SEARCH_API_KEY=BSA_VOTRE_CLE
TAVILY_API_KEY=tvly-VOTRE_CLE
LISTEN_NOTES_KEY=VOTRE_CLE

YOUTUBE_API_KEY=AIza_VOTRE_CLE

TWILIO_ACCOUNT_SID=AC_VOTRE_SID
TWILIO_AUTH_TOKEN=VOTRE_TOKEN
TWILIO_WHATSAPP_FROM=+225XXXXXXXXX
ADMIN_WHATSAPP_PHONE=+225XXXXXXXXX
`;
  fs.writeFileSync('.env.example', envContent, 'utf8');
  console.log('  => CREE');
} else {
  console.log('  => Existe deja');
}

// ═══ 4. .gitignore — ajouter netlify.toml ═══════════════════
console.log('[4] .gitignore :');
let gi = fs.readFileSync('.gitignore', 'utf8');
if (!gi.includes('netlify.toml')) {
  gi += '\n# Netlify config (contient des cles)\nnetlify.toml\nnetlify_optimized.toml\n';
  fs.writeFileSync('.gitignore', gi, 'utf8');
  console.log('  => netlify.toml ajoute a .gitignore');
} else {
  console.log('  => Deja present');
}

// ═══ 5. Vérification finale ═════════════════════════════════
console.log('');
console.log('=== VERIFICATION FINALE ===');
let nv = fs.readFileSync('netlify.toml', 'utf8');
const stillHasKeys = nv.includes('sk-ant') || nv.includes('gsk_') || nv.includes('sb_secret');
console.log('netlify.toml: ' + (stillHasKeys ? 'ENCORE DES CLES !' : 'PROPRE'));

const dv = fs.readFileSync('dashboard.html', 'utf8');
const svcCount = (dv.match(/SERVICE_ROLE/g) || []).length;
const anonCount = (dv.match(/SUPABASE_ANON_KEY/g) || []).length;
console.log('dashboard.html: SERVICE_ROLE=' + svcCount + ', ANON_KEY=' + anonCount);

console.log('');
console.log('=== ACTIONS MANUELLES REQUISES ===');
console.log('1. Generer NOUVELLES cles API (cles compromises: Anthropic, Groq, DeepSeek, Twilio)');
console.log('2. Configurer les cles dans Netlify UI: Settings > Environment variables');
console.log('3. Si deja commit: git rm --cached netlify.toml && git rm --cached netlify_optimized.toml');
console.log('4. Pusher les modifs: git add . && git commit -m "fix: securite - retrait cles API du code"');
console.log('');
