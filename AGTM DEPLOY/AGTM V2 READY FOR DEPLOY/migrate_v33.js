// AGTM Academy — Migration v33 : corner_content
// Table unifiée pour tout le contenu English Corner (playlists, podcasts, RSS, sites)
// Usage : node migrate_v33.js "VotreMotDePasseDB"

const { Client }   = require('pg')
const { randomUUID } = require('crypto')
const { computePriority } = require('./netlify/functions/lib/priority')

const PROJECT_REF = 'fglzovvsyloprokmdadx'
const DB_PASSWORD = process.argv[2] || process.env.SUPABASE_DB_PASSWORD || ''

if (!DB_PASSWORD) {
  console.error('\n ERREUR : Mot de passe DB requis')
  console.error(' Usage : node migrate_v33.js "VotreMotDePasseDB"')
  process.exit(1)
}

// ── DDL ──────────────────────────────────────────────────────────
const DDL = `
CREATE TABLE IF NOT EXISTS corner_content (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT        NOT NULL DEFAULT '',
  provider    TEXT        NOT NULL DEFAULT '',
  section     TEXT        NOT NULL CHECK (section IN ('listening','podcasts','reading','writing')),
  type        TEXT        NOT NULL CHECK (type    IN ('playlist','podcast','rss','website','page')),
  level       TEXT        NOT NULL DEFAULT 'all'
              CHECK (level IN ('A1','A2','B1','B2','C1','A1-A2','A2-B1','B1-B2','B1-C1','B2-C1','all')),
  topic       TEXT        NOT NULL DEFAULT 'general',
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  url         TEXT        NOT NULL DEFAULT '',
  rss_url     TEXT,
  image_url   TEXT,
  description TEXT,
  priority    INTEGER     NOT NULL DEFAULT 0,
  active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_section ON corner_content (section);
CREATE INDEX IF NOT EXISTS idx_cc_type    ON corner_content (type);
CREATE INDEX IF NOT EXISTS idx_cc_level   ON corner_content (level);
CREATE INDEX IF NOT EXISTS idx_cc_active  ON corner_content (active);

ALTER TABLE corner_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cc_read_public"   ON corner_content;
DROP POLICY IF EXISTS "cc_write_service" ON corner_content;

CREATE POLICY "cc_read_public"
  ON corner_content FOR SELECT USING (true);

CREATE POLICY "cc_write_service"
  ON corner_content FOR ALL USING (true) WITH CHECK (true);
`

// ── Seed — 74 Playlists YouTube AGTM ─────────────────────────────
// Section: listening | Type: playlist | URL: playlist YouTube
const PLAYLISTS = [
  // Groupe 1 × 28
  'PLv4XgHS4V3TJsIpVSOwhfJ3uexzSCf7QA',
  'PLNcfxD6u-vxJ7tijMS9Zx5FLLl-MKbsYB',
  'PLd9hCvj34W5it4a-RMzhlwNJ-edf5HU3Q',
  'PLNcfxD6u-vxJByvHDMIGoIRHJHDQVcOpf',
  'PLv4XgHS4V3TKcZ9BOyapPYBJdSWOWOX9s',
  'PLd9hCvj34W5hWkRym8sljiEvEBJ1JGIu5',
  'PLv4XgHS4V3TL5_bbcuV0tUp5jnoDMW-TE',
  'PLZbwPn7vIwQy0MruruAZV-z5zCw7YraSS',
  'PL5uXqO84WYGvnuPtUADSBiOb35_jq1dxv',
  'PLJ5qkOTqBd8Hs1T6tRWpVVhuvF1MLz84S',
  'PLZbwPn7vIwQxxm4-uwam9CIJilyU7nwns',
  'PLbI-JpcNtWkVogeo5qq58GeHDLF0szLgP',
  'PLRgsws9rC3IW72BgJVfxU2j1cVTgTW2JM',
  'PLU_eVIGNvkSVt4h2PSiK_rLlkW0zuAMGf',
  'PL2RW--lGzUm7hvH3t4B8uGdJM0UelpI2D',
  'PL7X4gfM23Zj471heI05NHQp_X8Ii_NBPB',
  'PL-aB-_5YI8jgisawtCemAfyS55ZOG54gS',
  'PLd9hCvj34W5hIJ855osxqJ-fjgsmNB69n',
  'PLcetZ6gSk96-FECmH9l7Vlx5VDigvgZpt',
  'PLKWcPfZiScgApTbS43FUY2Bl7Vatt1-r-',
  'PLD6t6ckHsrubLp8Ia8duzu5fN4riM2-Bl',
  'PLD6t6ckHsrubRV7Wb42ggOhVNrBRAte13',
  'PL5TC7-t9pIZlN_H08qcTXqZTz8XF5-00K',
  'PLeVxAnFsasIqIc8b03kHA3tw-xfIwgO2M',
  'PL5bLw9Uguvv3kSpd1tM79vb0DGAG67dab',
  'PL5bLw9Uguvv1RUj4awa-xeNSn8tnhdwRP',
  'PLD6t6ckHsruZjc3Zm_XOz59FsOTuU1wPd',
  'PLrt2nkX3MUeBNAcBAap6B313_tlVRCAxz',
  // Groupe 2 × 46
  'PLhNRdHEdUQewzYZ0X6gt3x9_CVen_HldI',
  'PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
  'PL5uXqO84WYGvVyZ7aKvds8eO5b2uoDE2g',
  'PLMWnmna4FyDORi2JIDmi1Yr5OHhAPCWoH',
  'PLr0l60KfOjllSW7XTG6kxdve26kh4jfqV',
  'PL8f0I_2tet-f2hkTKFPgWS7koHkY4_Pw1',
  'PLhNRdHEdUQexUblCTMd1ATwOd5J4SxtNM',
  'PLr0l60KfOjlli_fwQvwINYomkHN4s4bNh',
  'PLZg0MoLqSkGJ10g6RJ4sp_SZ2G5-GbgKD',
  'PL5uXqO84WYGs1n9F4uip4Yu51mC8LGzNP',
  'PLXj7Q_iqlVBAdWDE00F64yZy7lmh28iKu',
  'PLYeKA3G9P1xMAJhsOCYe6lNpptoQOXlZx',
  'PLhNRdHEdUQeyIjNRrwWnMU_iph8amkaJg',
  'PLXj7Q_iqlVBCvyAjTw2a364Et-t63WQJ4',
  'PLr0l60KfOjll5w6NijqhVvytlpLs49FvM',
  'PL5uXqO84WYGuLRUr9f3KIqtcrdCWPbMcZ',
  'PLk54xitH04uis6MJ1f9zd6ba1bBZh-Pua',
  'PLhNRdHEdUQeynyOmJASMe_xVYg0YZHWyt',
  'PL5uXqO84WYGtEhTY9zwE3q6JLph7skof5',
  'PLY_8pJZxQWIUD_34OWcisJJx6qqJkx_O6',
  'PLY3HPMKsInCppWI4zlZPrEbF0TRx3Hq2L',
  'PLc20paEMF6XXLEQo_33UGVtcAKmpr2oY5',
  'PLB0rRC265CEzxkiPOin9-lkWhF9fFQKOn',
  'PL5uXqO84WYGttociTaMlqS_LvHCvnPq8q',
  'PL1VgFeDQB-hCosQktH4m2KYV8GBszGRrg',
  'PLY_8pJZxQWIWVlUwAJvDIv38pVNPeqQvL',
  'PL9y0f6xYyQ98mtJVM5Zvv91UZAa1gkdCd',
  'PLB0rRC265CExyno_yHmw011u9O8jxGxm9',
  'PLP8MyRC1DCDRGIMXf-4ATvrQKLbNJkd4-',
  'PLcetZ6gSk96_IQnT7zKUjp7GtQeeGDI1a',
  'PLZOJurmtexYo_fVnU06ayQA7G5udAOM12',
  'PLF53CD9A6635B92D8',
  'PLAICZJe8KZdkZjua1CPlRlzc5i6XCvoxg',
  'PLxPTDeU7d5rC-oAc7Qs9bnG0FhuHFrVLH',
  'PLTwiEd1ZgTSpL7WED4LBrzFxjQLM_B5Bq',
  'PLkdLBhG1Y5UZ0tnTpB2WFpdCCCmEQlqBT',
  'PLKKpE2q05aOER9xQIuxqSdu8lA6CyT_yW',
  'PLZVOY69jl6py49szfPfyg0PPKpN9Tf8Fm',
  'PLzS5ZRr8n-fz0-Ov1cAwPPC9eY24ZMFWj',
  'PLkdLBhG1Y5UYeW3JO-E5Zb3Sjzp-88e5O',
  'PLpFNTvMhF5pVJg-3UOyLGm3MVptWU7Jq1',
  'PLqE81DRO-TpEdaIQaWdMgDjNHihgC56nl',
  'PLqE81DRO-TpFUby7iTm_7M7NWVyze4B82',
  'PLqE81DRO-TpHB0YabMgRBBax7sWhK9hgm',
  'PLI7Ex3Iy2Ewop83-zyj1qwm9E5vUjHeEQ',
  'PL60Dx6nQgiwdepCaaLC1uzKbvQ9C8o19W',
]

// ── Seed — 7 Sources BBC Podcasts ────────────────────────────────
// Section: podcasts | Type: podcast
const PODCASTS = [
  { title: '6 Minute English',    rss: 'https://podcasts.files.bbci.co.uk/p02pc9zn.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',    level: 'B1-B2', topic: 'general'   },
  { title: 'The English We Speak',rss: 'https://podcasts.files.bbci.co.uk/p02pc9mq.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak', level: 'B2',    topic: 'vocabulary'},
  { title: 'English at Work',     rss: 'https://podcasts.files.bbci.co.uk/p026nwr3.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/english-at-work',      level: 'B2-C1', topic: 'business'  },
  { title: '6 Minute Grammar',    rss: 'https://podcasts.files.bbci.co.uk/p02pc9sf.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-grammar',    level: 'B1-B2', topic: 'grammar'   },
  { title: '6 Minute Vocabulary', rss: 'https://podcasts.files.bbci.co.uk/p02pc9zy.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-vocabulary',  level: 'B1-B2', topic: 'vocabulary'},
  { title: 'News Report',         rss: 'https://podcasts.files.bbci.co.uk/p02pc9qv.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/news-report',          level: 'B2-C1', topic: 'news'      },
  { title: 'Global News Podcast', rss: 'https://podcasts.files.bbci.co.uk/p02nq0lx.rss', site: 'https://www.bbc.co.uk/programmes/p02nq0lx',                                  level: 'C1',    topic: 'news'      },
]

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
  console.log('\n=== Migration v33 — corner_content ===\n')
  let client = null
  for (const cfg of configs) {
    console.log(`Tentative : ${cfg.label}…`)
    const c = new Client({ ...cfg, database: 'postgres', password: DB_PASSWORD, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 })
    try { await c.connect(); client = c; console.log('✅ Connecté\n'); break }
    catch (e) { console.log(`   ✗ ${e.message}`); try { await c.end() } catch {} }
  }
  if (!client) { console.error('\n❌ Connexion impossible.'); process.exit(1) }

  // ── 1. DDL ─────────────────────────────────────────────────────
  console.log('── DDL ──')
  const stmts = splitSQL(DDL)
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
  if (fail) { await client.end(); console.error('❌ Erreurs DDL. Annulation.'); process.exit(1) }

  // ── 2. Seed playlists ──────────────────────────────────────────
  console.log(`\n── Seed playlists (${PLAYLISTS.length}) ──`)
  let plOk = 0
  for (const [i, id] of PLAYLISTS.entries()) {
    try {
      const plItem = { provider: 'AGTM', type: 'playlist', level: 'all', topic: 'general', title: '', rssUrl: null }
      await client.query(
        `INSERT INTO corner_content (id, title, provider, section, type, level, topic, tags, url, priority, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO NOTHING`,
        [id, '', 'AGTM', 'listening', 'playlist', 'all', 'general',
         ['english', 'youtube'], `https://www.youtube.com/playlist?list=${id}`, computePriority(plItem), true]
      )
      plOk++
    } catch (e) { console.error(`  ✗ playlist ${id}: ${e.message}`) }
  }
  console.log(`  ✅ ${plOk}/${PLAYLISTS.length} playlists insérées`)

  // ── 3. Seed podcasts ───────────────────────────────────────────
  console.log(`\n── Seed podcasts BBC (${PODCASTS.length}) ──`)
  let pdOk = 0
  for (const [i, p] of PODCASTS.entries()) {
    try {
      const pdItem = { provider: 'BBC', type: 'podcast', level: p.level, topic: p.topic, title: p.title, rssUrl: p.rss }
      await client.query(
        `INSERT INTO corner_content (id, title, provider, section, type, level, topic, tags, url, rss_url, priority, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO NOTHING`,
        [randomUUID(), p.title, 'BBC', 'podcasts', 'podcast', p.level, p.topic,
         ['english', 'bbc', 'podcast'], p.site, p.rss, computePriority(pdItem), true]
      )
      pdOk++
    } catch (e) { console.error(`  ✗ podcast ${p.title}: ${e.message}`) }
  }
  console.log(`  ✅ ${pdOk}/${PODCASTS.length} podcasts insérés`)

  await client.end()
  console.log(`\n=== Résultat : DDL OK · ${plOk} playlists · ${pdOk} podcasts ===`)
  console.log('✅ Migration v33 réussie — corner_content prête.')
}

run()
