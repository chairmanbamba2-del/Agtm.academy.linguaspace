// AGTM Academy — Migration v32 : podcast_sources + podcast_episodes
// Usage : node migrate_v32.js "VotreMotDePasseDB"

const { Client } = require('pg')

const PROJECT_REF = 'fglzovvsyloprokmdadx'
const DB_PASSWORD = process.argv[2] || process.env.SUPABASE_DB_PASSWORD || ''

if (!DB_PASSWORD) {
  console.error('\n ERREUR : Mot de passe DB requis')
  console.error(' Usage : node migrate_v32.js "VotreMotDePasseDB"')
  process.exit(1)
}

const SQL = `
-- ── podcast_sources ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS podcast_sources (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider   TEXT        NOT NULL,
  title      TEXT        NOT NULL,
  rss_url    TEXT        NOT NULL,
  site_url   TEXT,
  level      TEXT,
  topic      TEXT,
  active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rss_url)
);

ALTER TABLE podcast_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sources_read_public"   ON podcast_sources;
DROP POLICY IF EXISTS "sources_write_service" ON podcast_sources;

CREATE POLICY "sources_read_public"
  ON podcast_sources FOR SELECT USING (true);

CREATE POLICY "sources_write_service"
  ON podcast_sources FOR ALL USING (true) WITH CHECK (true);

-- ── podcast_episodes ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS podcast_episodes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id    UUID        REFERENCES podcast_sources(id) ON DELETE CASCADE,
  guid         TEXT        NOT NULL,
  title        TEXT        NOT NULL,
  description  TEXT,
  audio_url    TEXT,
  image_url    TEXT,
  published_at TIMESTAMPTZ,
  duration     INTEGER,
  episode_url  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_id, guid)
);

CREATE INDEX IF NOT EXISTS idx_pe_source_id  ON podcast_episodes (source_id);
CREATE INDEX IF NOT EXISTS idx_pe_published  ON podcast_episodes (published_at DESC);

ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "episodes_read_public"   ON podcast_episodes;
DROP POLICY IF EXISTS "episodes_write_service" ON podcast_episodes;

CREATE POLICY "episodes_read_public"
  ON podcast_episodes FOR SELECT USING (true);

CREATE POLICY "episodes_write_service"
  ON podcast_episodes FOR ALL USING (true) WITH CHECK (true);

-- ── Seed — Sources BBC Learning English ─────────────────────────
INSERT INTO podcast_sources (provider, title, rss_url, site_url, level, topic, active) VALUES
  ('BBC', '6 Minute English',
   'https://podcasts.files.bbci.co.uk/p02pc9zn.rss',
   'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',
   'B1-B2', 'general', true),
  ('BBC', 'The English We Speak',
   'https://podcasts.files.bbci.co.uk/p02pc9mq.rss',
   'https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak',
   'B2', 'vocabulary', true),
  ('BBC', 'English at Work',
   'https://podcasts.files.bbci.co.uk/p026nwr3.rss',
   'https://www.bbc.co.uk/learningenglish/english/features/english-at-work',
   'B2-C1', 'business', true),
  ('BBC', '6 Minute Grammar',
   'https://podcasts.files.bbci.co.uk/p02pc9sf.rss',
   'https://www.bbc.co.uk/learningenglish/english/features/6-minute-grammar',
   'B1-B2', 'grammar', true),
  ('BBC', '6 Minute Vocabulary',
   'https://podcasts.files.bbci.co.uk/p02pc9zy.rss',
   'https://www.bbc.co.uk/learningenglish/english/features/6-minute-vocabulary',
   'B1-B2', 'vocabulary', true),
  ('BBC', 'News Report',
   'https://podcasts.files.bbci.co.uk/p02pc9qv.rss',
   'https://www.bbc.co.uk/learningenglish/english/features/news-report',
   'C1-C2', 'news', true),
  ('BBC', 'Global News Podcast',
   'https://podcasts.files.bbci.co.uk/p02nq0lx.rss',
   'https://www.bbc.co.uk/programmes/p02nq0lx',
   'C1', 'news', true)
ON CONFLICT (rss_url) DO NOTHING;
`

const configs = [
  { label: 'Pooler Session (5432)',     host: `aws-0-eu-west-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}` },
  { label: 'Pooler Transaction (6543)', host: `aws-0-eu-west-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
  { label: 'Direct (5432)',             host: `db.${PROJECT_REF}.supabase.co`,        port: 5432, user: 'postgres' },
]

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
  console.log('\n=== Migration v32 — podcast_sources + podcast_episodes ===\n')
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
    const preview = stmts[i].replace(/\s+/g, ' ').substring(0, 80)
    try {
      await client.query(stmts[i])
      ok++
      console.log(`  [${i+1}/${stmts.length}] ✅ ${preview}…`)
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('does not exist')) {
        console.log(`  [${i+1}/${stmts.length}] ⏭  ${preview}… (déjà OK)`)
        ok++
      } else {
        console.error(`  [${i+1}/${stmts.length}] ✗  ${preview}\n     → ${e.message}`)
        fail++
      }
    }
  }
  await client.end()
  console.log(`\n=== Résultat : ${ok} OK, ${fail} erreurs ===`)
  if (fail === 0) console.log('✅ Migration v32 réussie — tables podcasts prêtes.')
  else { console.error('⚠️  Certaines instructions ont échoué.'); process.exit(1) }
}

run()
