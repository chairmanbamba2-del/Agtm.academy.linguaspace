// scripts/gen_sql.js — Génère supabase_MIGRATION_v33_v34_english_corner.sql
// Usage : node scripts/gen_sql.js

const fs = require('fs')
const path = require('path')
const { computePriority } = require('../netlify/functions/lib/priority')
const seed = require('../data/corner_content_seed.json')

const PLAYLISTS = [
  'PLv4XgHS4V3TJsIpVSOwhfJ3uexzSCf7QA','PLNcfxD6u-vxJ7tijMS9Zx5FLLl-MKbsYB',
  'PLd9hCvj34W5it4a-RMzhlwNJ-edf5HU3Q','PLNcfxD6u-vxJByvHDMIGoIRHJHDQVcOpf',
  'PLv4XgHS4V3TKcZ9BOyapPYBJdSWOWOX9s','PLd9hCvj34W5hWkRym8sljiEvEBJ1JGIu5',
  'PLv4XgHS4V3TL5_bbcuV0tUp5jnoDMW-TE','PLZbwPn7vIwQy0MruruAZV-z5zCw7YraSS',
  'PL5uXqO84WYGvnuPtUADSBiOb35_jq1dxv','PLJ5qkOTqBd8Hs1T6tRWpVVhuvF1MLz84S',
  'PLZbwPn7vIwQxxm4-uwam9CIJilyU7nwns','PLbI-JpcNtWkVogeo5qq58GeHDLF0szLgP',
  'PLRgsws9rC3IW72BgJVfxU2j1cVTgTW2JM','PLU_eVIGNvkSVt4h2PSiK_rLlkW0zuAMGf',
  'PL2RW--lGzUm7hvH3t4B8uGdJM0UelpI2D','PL7X4gfM23Zj471heI05NHQp_X8Ii_NBPB',
  'PL-aB-_5YI8jgisawtCemAfyS55ZOG54gS','PLd9hCvj34W5hIJ855osxqJ-fjgsmNB69n',
  'PLcetZ6gSk96-FECmH9l7Vlx5VDigvgZpt','PLKWcPfZiScgApTbS43FUY2Bl7Vatt1-r-',
  'PLD6t6ckHsrubLp8Ia8duzu5fN4riM2-Bl','PLD6t6ckHsrubRV7Wb42ggOhVNrBRAte13',
  'PL5TC7-t9pIZlN_H08qcTXqZTz8XF5-00K','PLeVxAnFsasIqIc8b03kHA3tw-xfIwgO2M',
  'PL5bLw9Uguvv3kSpd1tM79vb0DGAG67dab','PL5bLw9Uguvv1RUj4awa-xeNSn8tnhdwRP',
  'PLD6t6ckHsruZjc3Zm_XOz59FsOTuU1wPd','PLrt2nkX3MUeBNAcBAap6B313_tlVRCAxz',
  'PLhNRdHEdUQewzYZ0X6gt3x9_CVen_HldI','PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
  'PL5uXqO84WYGvVyZ7aKvds8eO5b2uoDE2g','PLMWnmna4FyDORi2JIDmi1Yr5OHhAPCWoH',
  'PLr0l60KfOjllSW7XTG6kxdve26kh4jfqV','PL8f0I_2tet-f2hkTKFPgWS7koHkY4_Pw1',
  'PLhNRdHEdUQexUblCTMd1ATwOd5J4SxtNM','PLr0l60KfOjlli_fwQvwINYomkHN4s4bNh',
  'PLZg0MoLqSkGJ10g6RJ4sp_SZ2G5-GbgKD','PL5uXqO84WYGs1n9F4uip4Yu51mC8LGzNP',
  'PLXj7Q_iqlVBAdWDE00F64yZy7lmh28iKu','PLYeKA3G9P1xMAJhsOCYe6lNpptoQOXlZx',
  'PLhNRdHEdUQeyIjNRrwWnMU_iph8amkaJg','PLXj7Q_iqlVBCvyAjTw2a364Et-t63WQJ4',
  'PLr0l60KfOjll5w6NijqhVvytlpLs49FvM','PL5uXqO84WYGuLRUr9f3KIqtcrdCWPbMcZ',
  'PLk54xitH04uis6MJ1f9zd6ba1bBZh-Pua','PLhNRdHEdUQeynyOmJASMe_xVYg0YZHWyt',
  'PL5uXqO84WYGtEhTY9zwE3q6JLph7skof5','PLY_8pJZxQWIUD_34OWcisJJx6qqJkx_O6',
  'PLY3HPMKsInCppWI4zlZPrEbF0TRx3Hq2L','PLc20paEMF6XXLEQo_33UGVtcAKmpr2oY5',
  'PLB0rRC265CEzxkiPOin9-lkWhF9fFQKOn','PL5uXqO84WYGttociTaMlqS_LvHCvnPq8q',
  'PL1VgFeDQB-hCosQktH4m2KYV8GBszGRrg','PLY_8pJZxQWIWVlUwAJvDIv38pVNPeqQvL',
  'PL9y0f6xYyQ98mtJVM5Zvv91UZAa1gkdCd','PLB0rRC265CExyno_yHmw011u9O8jxGxm9',
  'PLP8MyRC1DCDRGIMXf-4ATvrQKLbNJkd4-','PLcetZ6gSk96_IQnT7zKUjp7GtQeeGDI1a',
  'PLZOJurmtexYo_fVnU06ayQA7G5udAOM12','PLF53CD9A6635B92D8',
  'PLAICZJe8KZdkZjua1CPlRlzc5i6XCvoxg','PLxPTDeU7d5rC-oAc7Qs9bnG0FhuHFrVLH',
  'PLTwiEd1ZgTSpL7WED4LBrzFxjQLM_B5Bq','PLkdLBhG1Y5UZ0tnTpB2WFpdCCCmEQlqBT',
  'PLKKpE2q05aOER9xQIuxqSdu8lA6CyT_yW','PLZVOY69jl6py49szfPfyg0PPKpN9Tf8Fm',
  'PLzS5ZRr8n-fz0-Ov1cAwPPC9eY24ZMFWj','PLkdLBhG1Y5UYeW3JO-E5Zb3Sjzp-88e5O',
  'PLpFNTvMhF5pVJg-3UOyLGm3MVptWU7Jq1','PLqE81DRO-TpEdaIQaWdMgDjNHihgC56nl',
  'PLqE81DRO-TpFUby7iTm_7M7NWVyze4B82','PLqE81DRO-TpHB0YabMgRBBax7sWhK9hgm',
  'PLI7Ex3Iy2Ewop83-zyj1qwm9E5vUjHeEQ','PL60Dx6nQgiwdepCaaLC1uzKbvQ9C8o19W',
]

const PODCASTS_V32 = [
  { title: '6 Minute English',    rss: 'https://podcasts.files.bbci.co.uk/p02pc9zn.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',    level: 'B1-B2', topic: 'general'   },
  { title: 'The English We Speak',rss: 'https://podcasts.files.bbci.co.uk/p02pc9mq.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak', level: 'B2',    topic: 'vocabulary'},
  { title: 'English at Work',     rss: 'https://podcasts.files.bbci.co.uk/p026nwr3.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/english-at-work',      level: 'B2-C1', topic: 'business'  },
  { title: '6 Minute Grammar',    rss: 'https://podcasts.files.bbci.co.uk/p02pc9sf.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-grammar',    level: 'B1-B2', topic: 'grammar'   },
  { title: '6 Minute Vocabulary', rss: 'https://podcasts.files.bbci.co.uk/p02pc9zy.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-vocabulary',  level: 'B1-B2', topic: 'vocabulary'},
  { title: 'News Report',         rss: 'https://podcasts.files.bbci.co.uk/p02pc9qv.rss', site: 'https://www.bbc.co.uk/learningenglish/english/features/news-report',          level: 'B2-C1', topic: 'news'      },
  { title: 'Global News Podcast', rss: 'https://podcasts.files.bbci.co.uk/p02nq0lx.rss', site: 'https://www.bbc.co.uk/programmes/p02nq0lx',                                  level: 'C1',    topic: 'news'      },
]

function esc(s) { return s ? String(s).replace(/'/g, "''") : '' }

const plPriority = computePriority({ provider:'AGTM', type:'playlist', level:'all', topic:'general', title:'', rssUrl:null })
const pdPriority = computePriority({ provider:'BBC', type:'podcast', level:'B1-B2', topic:'general', title:'BBC', rssUrl:'x' })

let sql = `-- ================================================================
-- AGTM Academy — Migrations v32 + v33 + v34 (English Corner)
-- Coller intégralement dans Supabase → SQL Editor → Run
-- ================================================================

-- ================================================================
-- v32 : podcast_sources + podcast_episodes
-- ================================================================

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
CREATE POLICY "sources_read_public"   ON podcast_sources FOR SELECT USING (true);
CREATE POLICY "sources_write_service" ON podcast_sources FOR ALL   USING (true) WITH CHECK (true);

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

CREATE INDEX IF NOT EXISTS idx_pe_source_id ON podcast_episodes (source_id);
CREATE INDEX IF NOT EXISTS idx_pe_published ON podcast_episodes (published_at DESC);

ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "episodes_read_public"   ON podcast_episodes;
DROP POLICY IF EXISTS "episodes_write_service" ON podcast_episodes;
CREATE POLICY "episodes_read_public"   ON podcast_episodes FOR SELECT USING (true);
CREATE POLICY "episodes_write_service" ON podcast_episodes FOR ALL   USING (true) WITH CHECK (true);

INSERT INTO podcast_sources (provider, title, rss_url, site_url, level, topic, active) VALUES
`
sql += PODCASTS_V32.map((p, i) =>
  `  ('BBC', '${esc(p.title)}', '${p.rss}', '${p.site}', '${p.level}', '${p.topic}', true)${i < PODCASTS_V32.length - 1 ? ',' : ''}`
).join('\n')
sql += `
ON CONFLICT (rss_url) DO NOTHING;

-- ================================================================
-- v33 : corner_content (table unifiée)
-- ================================================================

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
CREATE POLICY "cc_read_public"   ON corner_content FOR SELECT USING (true);
CREATE POLICY "cc_write_service" ON corner_content FOR ALL   USING (true) WITH CHECK (true);

-- Seed 74 playlists YouTube (priority=${plPriority})
INSERT INTO corner_content (id,title,provider,section,type,level,topic,tags,url,priority,active) VALUES
`
sql += PLAYLISTS.map((id, i) =>
  `  ('${id}','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=${id}',${plPriority},true)${i < PLAYLISTS.length - 1 ? ',' : ''}`
).join('\n')
sql += `
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- v34 : extend CHECK level + cleanup UUID v33 + seed 15 items
-- ================================================================

ALTER TABLE corner_content DROP CONSTRAINT IF EXISTS corner_content_level_check;
ALTER TABLE corner_content
  ADD CONSTRAINT corner_content_level_check
    CHECK (level IN (
      'A1','A2','B1','B2','C1',
      'A1-A2','A2-B1','A2-B2','A2-C1',
      'B1-B2','B1-C1','B2-C1',
      'all'
    ));

-- Supprimer les éventuels UUID v33 pour les providers du seed curé
DELETE FROM corner_content
WHERE provider IN (
    'BBC Learning English','VOA Learning English','British Council',
    'All Ears English','Luke''s English Podcast','American English Podcast',
    'Cambridge English','Oxford Online English','UEfAP'
  )
  AND section != 'listening'
  AND id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

INSERT INTO corner_content
  (id,title,provider,section,type,level,topic,tags,url,rss_url,image_url,description,priority,active)
VALUES
`
sql += seed.map((item, i) => {
  const tags = '{' + item.tags.join(',') + '}'
  const rss  = item.rssUrl    ? `'${esc(item.rssUrl)}'`    : 'NULL'
  const img  = item.imageUrl  ? `'${esc(item.imageUrl)}'`  : 'NULL'
  const desc = item.description ? `'${esc(item.description)}'` : 'NULL'
  return `  ('${esc(item.id)}','${esc(item.title)}','${esc(item.provider)}','${item.section}','${item.type}','${item.level}','${esc(item.topic)}','${tags}','${esc(item.url)}',${rss},${img},${desc},${item.priority},${item.active})${i < seed.length - 1 ? ',' : ''}`
}).join('\n')
sql += `
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, provider=EXCLUDED.provider, section=EXCLUDED.section,
  type=EXCLUDED.type, level=EXCLUDED.level, topic=EXCLUDED.topic,
  tags=EXCLUDED.tags, url=EXCLUDED.url, rss_url=EXCLUDED.rss_url,
  image_url=EXCLUDED.image_url, description=EXCLUDED.description,
  priority=EXCLUDED.priority, active=EXCLUDED.active;
`

const outPath = path.join(__dirname, '..', 'supabase_MIGRATION_v33_v34_english_corner.sql')
fs.writeFileSync(outPath, sql)
console.log(`✅ Fichier généré : supabase_MIGRATION_v33_v34_english_corner.sql`)
console.log(`   Taille : ${sql.length} caractères | Lignes : ${sql.split('\n').length}`)
console.log(`   Playlists : ${PLAYLISTS.length} | Podcasts v32 : ${PODCASTS_V32.length} | Seed v34 : ${seed.length}`)
