// AGTM Academy — Migration v31 : ec_podcast_cache
// Cache serveur pour Listen Notes API (TTL 24h, économise les quotas)
// Usage : node migrate_v31.js "VotreMotDePasseDB"

const { Client } = require('pg')

const PROJECT_REF = 'fglzovvsyloprokmdadx'
const DB_PASSWORD = process.argv[2] || process.env.SUPABASE_DB_PASSWORD || ''

if (!DB_PASSWORD) {
  console.error('\n ERREUR : Mot de passe DB requis')
  console.error(' Usage : node migrate_v31.js "VotreMotDePasseDB"')
  process.exit(1)
}

const SQL = `
-- Table de cache pour les résultats Listen Notes API
CREATE TABLE IF NOT EXISTS ec_podcast_cache (
  cache_key   TEXT        PRIMARY KEY,
  data        JSONB       NOT NULL,
  cached_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  query       TEXT,
  action      TEXT        DEFAULT 'search'
);

-- Index pour nettoyer les entrées expirées facilement
CREATE INDEX IF NOT EXISTS idx_ec_podcast_cache_cached_at
  ON ec_podcast_cache (cached_at);

-- RLS : lecture publique, écriture via service_role uniquement
ALTER TABLE ec_podcast_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cache_read_public"  ON ec_podcast_cache;
DROP POLICY IF EXISTS "cache_write_service" ON ec_podcast_cache;

CREATE POLICY "cache_read_public"
  ON ec_podcast_cache FOR SELECT
  USING (true);

-- Nettoyage automatique des entrées > 7 jours (déclenché manuellement ou via cron)
CREATE OR REPLACE FUNCTION clean_podcast_cache()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE removed INTEGER;
BEGIN
  DELETE FROM ec_podcast_cache
  WHERE cached_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;
`

const configs = [
  { label: 'Pooler Session (5432)',    host: `aws-0-eu-west-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}` },
  { label: 'Pooler Transaction (6543)',host: `aws-0-eu-west-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
  { label: 'Direct (5432)',            host: `db.${PROJECT_REF}.supabase.co`,        port: 5432, user: 'postgres' },
]

// Exécute le SQL statement par statement (gère les blocs $$ correctement)
function splitSQL(sql) {
  const results = []; let current = '', inDollar = false, tag = ''
  for (const line of sql.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('--')) continue
    if (!inDollar) { const m = t.match(/\$\w*\$/); if (m) { inDollar = true; tag = m[0] } }
    else if (t.includes(tag)) inDollar = false
    current += line + '\n'
    if (!inDollar && t.endsWith(';')) { const s = current.trim(); if (s.length > 1) results.push(s); current = '' }
  }
  if (current.trim()) results.push(current.trim())
  return results
}

async function run() {
  console.log('\n=== Migration v31 — ec_podcast_cache ===\n')
  let client = null
  for (const cfg of configs) {
    console.log(`Tentative : ${cfg.label}…`)
    const c = new Client({ ...cfg, database: 'postgres', password: DB_PASSWORD, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 })
    try { await c.connect(); client = c; console.log('✅ Connecté\n'); break }
    catch (e) { console.log(`   ✗ ${e.message}`); try { await c.end() } catch {} }
  }
  if (!client) { console.error('\n❌ Connexion impossible.'); process.exit(1) }

  const stmts = splitSQL(SQL)
  console.log(`Statements : ${stmts.length}\n`)
  let ok = 0, fail = 0
  for (let i = 0; i < stmts.length; i++) {
    const preview = stmts[i].replace(/\s+/g,' ').substring(0,80)
    try { await client.query(stmts[i]); ok++; console.log(`  [${i+1}/${stmts.length}] ✅ ${preview}…`) }
    catch (e) {
      if (e.message.includes('already exists') || e.message.includes('does not exist')) { console.log(`  [${i+1}/${stmts.length}] ⏭  ${preview}… (déjà OK)`); ok++ }
      else { console.error(`  [${i+1}/${stmts.length}] ✗  ${preview}\n     → ${e.message}`); fail++ }
    }
  }
  await client.end()
  console.log(`\n=== Résultat : ${ok} OK, ${fail} erreurs ===`)
  if (fail === 0) console.log('✅ Migration v31 réussie — ec_podcast_cache prête.')
  else { console.error('⚠️  Certaines instructions ont échoué.'); process.exit(1) }
}

run()
