-- ================================================================
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
  ('BBC', '6 Minute English', 'https://podcasts.files.bbci.co.uk/p02pc9zn.rss', 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english', 'B1-B2', 'general', true),
  ('BBC', 'The English We Speak', 'https://podcasts.files.bbci.co.uk/p02pc9mq.rss', 'https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak', 'B2', 'vocabulary', true),
  ('BBC', 'English at Work', 'https://podcasts.files.bbci.co.uk/p026nwr3.rss', 'https://www.bbc.co.uk/learningenglish/english/features/english-at-work', 'B2-C1', 'business', true),
  ('BBC', '6 Minute Grammar', 'https://podcasts.files.bbci.co.uk/p02pc9sf.rss', 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-grammar', 'B1-B2', 'grammar', true),
  ('BBC', '6 Minute Vocabulary', 'https://podcasts.files.bbci.co.uk/p02pc9zy.rss', 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-vocabulary', 'B1-B2', 'vocabulary', true),
  ('BBC', 'News Report', 'https://podcasts.files.bbci.co.uk/p02pc9qv.rss', 'https://www.bbc.co.uk/learningenglish/english/features/news-report', 'B2-C1', 'news', true),
  ('BBC', 'Global News Podcast', 'https://podcasts.files.bbci.co.uk/p02nq0lx.rss', 'https://www.bbc.co.uk/programmes/p02nq0lx', 'C1', 'news', true)
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

-- Seed 74 playlists YouTube (priority=25)
INSERT INTO corner_content (id,title,provider,section,type,level,topic,tags,url,priority,active) VALUES
  ('PLv4XgHS4V3TJsIpVSOwhfJ3uexzSCf7QA','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLv4XgHS4V3TJsIpVSOwhfJ3uexzSCf7QA',25,true),
  ('PLNcfxD6u-vxJ7tijMS9Zx5FLLl-MKbsYB','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLNcfxD6u-vxJ7tijMS9Zx5FLLl-MKbsYB',25,true),
  ('PLd9hCvj34W5it4a-RMzhlwNJ-edf5HU3Q','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLd9hCvj34W5it4a-RMzhlwNJ-edf5HU3Q',25,true),
  ('PLNcfxD6u-vxJByvHDMIGoIRHJHDQVcOpf','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLNcfxD6u-vxJByvHDMIGoIRHJHDQVcOpf',25,true),
  ('PLv4XgHS4V3TKcZ9BOyapPYBJdSWOWOX9s','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLv4XgHS4V3TKcZ9BOyapPYBJdSWOWOX9s',25,true),
  ('PLd9hCvj34W5hWkRym8sljiEvEBJ1JGIu5','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLd9hCvj34W5hWkRym8sljiEvEBJ1JGIu5',25,true),
  ('PLv4XgHS4V3TL5_bbcuV0tUp5jnoDMW-TE','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLv4XgHS4V3TL5_bbcuV0tUp5jnoDMW-TE',25,true),
  ('PLZbwPn7vIwQy0MruruAZV-z5zCw7YraSS','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLZbwPn7vIwQy0MruruAZV-z5zCw7YraSS',25,true),
  ('PL5uXqO84WYGvnuPtUADSBiOb35_jq1dxv','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL5uXqO84WYGvnuPtUADSBiOb35_jq1dxv',25,true),
  ('PLJ5qkOTqBd8Hs1T6tRWpVVhuvF1MLz84S','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLJ5qkOTqBd8Hs1T6tRWpVVhuvF1MLz84S',25,true),
  ('PLZbwPn7vIwQxxm4-uwam9CIJilyU7nwns','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLZbwPn7vIwQxxm4-uwam9CIJilyU7nwns',25,true),
  ('PLbI-JpcNtWkVogeo5qq58GeHDLF0szLgP','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLbI-JpcNtWkVogeo5qq58GeHDLF0szLgP',25,true),
  ('PLRgsws9rC3IW72BgJVfxU2j1cVTgTW2JM','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLRgsws9rC3IW72BgJVfxU2j1cVTgTW2JM',25,true),
  ('PLU_eVIGNvkSVt4h2PSiK_rLlkW0zuAMGf','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLU_eVIGNvkSVt4h2PSiK_rLlkW0zuAMGf',25,true),
  ('PL2RW--lGzUm7hvH3t4B8uGdJM0UelpI2D','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL2RW--lGzUm7hvH3t4B8uGdJM0UelpI2D',25,true),
  ('PL7X4gfM23Zj471heI05NHQp_X8Ii_NBPB','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL7X4gfM23Zj471heI05NHQp_X8Ii_NBPB',25,true),
  ('PL-aB-_5YI8jgisawtCemAfyS55ZOG54gS','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL-aB-_5YI8jgisawtCemAfyS55ZOG54gS',25,true),
  ('PLd9hCvj34W5hIJ855osxqJ-fjgsmNB69n','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLd9hCvj34W5hIJ855osxqJ-fjgsmNB69n',25,true),
  ('PLcetZ6gSk96-FECmH9l7Vlx5VDigvgZpt','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLcetZ6gSk96-FECmH9l7Vlx5VDigvgZpt',25,true),
  ('PLKWcPfZiScgApTbS43FUY2Bl7Vatt1-r-','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLKWcPfZiScgApTbS43FUY2Bl7Vatt1-r-',25,true),
  ('PLD6t6ckHsrubLp8Ia8duzu5fN4riM2-Bl','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLD6t6ckHsrubLp8Ia8duzu5fN4riM2-Bl',25,true),
  ('PLD6t6ckHsrubRV7Wb42ggOhVNrBRAte13','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLD6t6ckHsrubRV7Wb42ggOhVNrBRAte13',25,true),
  ('PL5TC7-t9pIZlN_H08qcTXqZTz8XF5-00K','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL5TC7-t9pIZlN_H08qcTXqZTz8XF5-00K',25,true),
  ('PLeVxAnFsasIqIc8b03kHA3tw-xfIwgO2M','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLeVxAnFsasIqIc8b03kHA3tw-xfIwgO2M',25,true),
  ('PL5bLw9Uguvv3kSpd1tM79vb0DGAG67dab','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL5bLw9Uguvv3kSpd1tM79vb0DGAG67dab',25,true),
  ('PL5bLw9Uguvv1RUj4awa-xeNSn8tnhdwRP','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL5bLw9Uguvv1RUj4awa-xeNSn8tnhdwRP',25,true),
  ('PLD6t6ckHsruZjc3Zm_XOz59FsOTuU1wPd','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLD6t6ckHsruZjc3Zm_XOz59FsOTuU1wPd',25,true),
  ('PLrt2nkX3MUeBNAcBAap6B313_tlVRCAxz','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLrt2nkX3MUeBNAcBAap6B313_tlVRCAxz',25,true),
  ('PLhNRdHEdUQewzYZ0X6gt3x9_CVen_HldI','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLhNRdHEdUQewzYZ0X6gt3x9_CVen_HldI',25,true),
  ('PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',25,true),
  ('PL5uXqO84WYGvVyZ7aKvds8eO5b2uoDE2g','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL5uXqO84WYGvVyZ7aKvds8eO5b2uoDE2g',25,true),
  ('PLMWnmna4FyDORi2JIDmi1Yr5OHhAPCWoH','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLMWnmna4FyDORi2JIDmi1Yr5OHhAPCWoH',25,true),
  ('PLr0l60KfOjllSW7XTG6kxdve26kh4jfqV','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLr0l60KfOjllSW7XTG6kxdve26kh4jfqV',25,true),
  ('PL8f0I_2tet-f2hkTKFPgWS7koHkY4_Pw1','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL8f0I_2tet-f2hkTKFPgWS7koHkY4_Pw1',25,true),
  ('PLhNRdHEdUQexUblCTMd1ATwOd5J4SxtNM','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLhNRdHEdUQexUblCTMd1ATwOd5J4SxtNM',25,true),
  ('PLr0l60KfOjlli_fwQvwINYomkHN4s4bNh','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLr0l60KfOjlli_fwQvwINYomkHN4s4bNh',25,true),
  ('PLZg0MoLqSkGJ10g6RJ4sp_SZ2G5-GbgKD','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLZg0MoLqSkGJ10g6RJ4sp_SZ2G5-GbgKD',25,true),
  ('PL5uXqO84WYGs1n9F4uip4Yu51mC8LGzNP','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL5uXqO84WYGs1n9F4uip4Yu51mC8LGzNP',25,true),
  ('PLXj7Q_iqlVBAdWDE00F64yZy7lmh28iKu','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLXj7Q_iqlVBAdWDE00F64yZy7lmh28iKu',25,true),
  ('PLYeKA3G9P1xMAJhsOCYe6lNpptoQOXlZx','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLYeKA3G9P1xMAJhsOCYe6lNpptoQOXlZx',25,true),
  ('PLhNRdHEdUQeyIjNRrwWnMU_iph8amkaJg','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLhNRdHEdUQeyIjNRrwWnMU_iph8amkaJg',25,true),
  ('PLXj7Q_iqlVBCvyAjTw2a364Et-t63WQJ4','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLXj7Q_iqlVBCvyAjTw2a364Et-t63WQJ4',25,true),
  ('PLr0l60KfOjll5w6NijqhVvytlpLs49FvM','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLr0l60KfOjll5w6NijqhVvytlpLs49FvM',25,true),
  ('PL5uXqO84WYGuLRUr9f3KIqtcrdCWPbMcZ','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL5uXqO84WYGuLRUr9f3KIqtcrdCWPbMcZ',25,true),
  ('PLk54xitH04uis6MJ1f9zd6ba1bBZh-Pua','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLk54xitH04uis6MJ1f9zd6ba1bBZh-Pua',25,true),
  ('PLhNRdHEdUQeynyOmJASMe_xVYg0YZHWyt','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLhNRdHEdUQeynyOmJASMe_xVYg0YZHWyt',25,true),
  ('PL5uXqO84WYGtEhTY9zwE3q6JLph7skof5','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL5uXqO84WYGtEhTY9zwE3q6JLph7skof5',25,true),
  ('PLY_8pJZxQWIUD_34OWcisJJx6qqJkx_O6','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLY_8pJZxQWIUD_34OWcisJJx6qqJkx_O6',25,true),
  ('PLY3HPMKsInCppWI4zlZPrEbF0TRx3Hq2L','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLY3HPMKsInCppWI4zlZPrEbF0TRx3Hq2L',25,true),
  ('PLc20paEMF6XXLEQo_33UGVtcAKmpr2oY5','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLc20paEMF6XXLEQo_33UGVtcAKmpr2oY5',25,true),
  ('PLB0rRC265CEzxkiPOin9-lkWhF9fFQKOn','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLB0rRC265CEzxkiPOin9-lkWhF9fFQKOn',25,true),
  ('PL5uXqO84WYGttociTaMlqS_LvHCvnPq8q','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL5uXqO84WYGttociTaMlqS_LvHCvnPq8q',25,true),
  ('PL1VgFeDQB-hCosQktH4m2KYV8GBszGRrg','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL1VgFeDQB-hCosQktH4m2KYV8GBszGRrg',25,true),
  ('PLY_8pJZxQWIWVlUwAJvDIv38pVNPeqQvL','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLY_8pJZxQWIWVlUwAJvDIv38pVNPeqQvL',25,true),
  ('PL9y0f6xYyQ98mtJVM5Zvv91UZAa1gkdCd','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL9y0f6xYyQ98mtJVM5Zvv91UZAa1gkdCd',25,true),
  ('PLB0rRC265CExyno_yHmw011u9O8jxGxm9','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLB0rRC265CExyno_yHmw011u9O8jxGxm9',25,true),
  ('PLP8MyRC1DCDRGIMXf-4ATvrQKLbNJkd4-','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLP8MyRC1DCDRGIMXf-4ATvrQKLbNJkd4-',25,true),
  ('PLcetZ6gSk96_IQnT7zKUjp7GtQeeGDI1a','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLcetZ6gSk96_IQnT7zKUjp7GtQeeGDI1a',25,true),
  ('PLZOJurmtexYo_fVnU06ayQA7G5udAOM12','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLZOJurmtexYo_fVnU06ayQA7G5udAOM12',25,true),
  ('PLF53CD9A6635B92D8','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLF53CD9A6635B92D8',25,true),
  ('PLAICZJe8KZdkZjua1CPlRlzc5i6XCvoxg','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLAICZJe8KZdkZjua1CPlRlzc5i6XCvoxg',25,true),
  ('PLxPTDeU7d5rC-oAc7Qs9bnG0FhuHFrVLH','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLxPTDeU7d5rC-oAc7Qs9bnG0FhuHFrVLH',25,true),
  ('PLTwiEd1ZgTSpL7WED4LBrzFxjQLM_B5Bq','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLTwiEd1ZgTSpL7WED4LBrzFxjQLM_B5Bq',25,true),
  ('PLkdLBhG1Y5UZ0tnTpB2WFpdCCCmEQlqBT','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLkdLBhG1Y5UZ0tnTpB2WFpdCCCmEQlqBT',25,true),
  ('PLKKpE2q05aOER9xQIuxqSdu8lA6CyT_yW','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLKKpE2q05aOER9xQIuxqSdu8lA6CyT_yW',25,true),
  ('PLZVOY69jl6py49szfPfyg0PPKpN9Tf8Fm','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLZVOY69jl6py49szfPfyg0PPKpN9Tf8Fm',25,true),
  ('PLzS5ZRr8n-fz0-Ov1cAwPPC9eY24ZMFWj','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLzS5ZRr8n-fz0-Ov1cAwPPC9eY24ZMFWj',25,true),
  ('PLkdLBhG1Y5UYeW3JO-E5Zb3Sjzp-88e5O','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLkdLBhG1Y5UYeW3JO-E5Zb3Sjzp-88e5O',25,true),
  ('PLpFNTvMhF5pVJg-3UOyLGm3MVptWU7Jq1','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLpFNTvMhF5pVJg-3UOyLGm3MVptWU7Jq1',25,true),
  ('PLqE81DRO-TpEdaIQaWdMgDjNHihgC56nl','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLqE81DRO-TpEdaIQaWdMgDjNHihgC56nl',25,true),
  ('PLqE81DRO-TpFUby7iTm_7M7NWVyze4B82','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLqE81DRO-TpFUby7iTm_7M7NWVyze4B82',25,true),
  ('PLqE81DRO-TpHB0YabMgRBBax7sWhK9hgm','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLqE81DRO-TpHB0YabMgRBBax7sWhK9hgm',25,true),
  ('PLI7Ex3Iy2Ewop83-zyj1qwm9E5vUjHeEQ','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PLI7Ex3Iy2Ewop83-zyj1qwm9E5vUjHeEQ',25,true),
  ('PL60Dx6nQgiwdepCaaLC1uzKbvQ9C8o19W','','AGTM','listening','playlist','all','general','{english,youtube}','https://www.youtube.com/playlist?list=PL60Dx6nQgiwdepCaaLC1uzKbvQ9C8o19W',25,true)
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
  ('bbc-6-minute-english','6 Minute English','BBC Learning English','podcasts','rss','B1-B2','general listening','{podcast,listening,bbc,vocabulary,discussion}','https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025','https://podcasts.files.bbci.co.uk/p02pc9tn.rss',NULL,NULL,100,true),
  ('bbc-the-english-we-speak','The English We Speak','BBC Learning English','podcasts','rss','B1-C1','conversation','{podcast,bbc,conversation,idioms,spoken-english}','https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak_2024','https://podcasts.files.bbci.co.uk/p02pc9zn.rss',NULL,NULL,96,true),
  ('bbc-learning-easy-english','Learning Easy English','BBC Learning English','podcasts','rss','A2','easy listening','{podcast,bbc,easy-english,a2,listening}','https://www.bbc.co.uk/learningenglish/english/features/real-easy-english','https://podcasts.files.bbci.co.uk/p0hsrwv5.rss',NULL,NULL,95,true),
  ('bbc-learning-english-for-work','Learning English For Work','BBC Learning English','podcasts','rss','B1-C1','business english','{podcast,bbc,work,business,professional-english}','https://www.bbc.co.uk/learningenglish/english/business-english','https://podcasts.files.bbci.co.uk/p0h6ffwg.rss',NULL,NULL,94,true),
  ('voa-learning-english-podcast','VOA Learning English Podcast','VOA Learning English','podcasts','page','A2-B2','general learning','{podcast,voa,american-english,slow-english,news}','https://learningenglish.voanews.com/z/1689',NULL,NULL,NULL,95,true),
  ('british-council-podcasts','LearnEnglish Podcasts','British Council','podcasts','website','A2-B1','guided learning','{podcast,british-council,guided,a2,b1}','https://learnenglish.britishcouncil.org/general-english/audio-series/podcasts',NULL,NULL,NULL,93,true),
  ('all-ears-english','All Ears English Podcast','All Ears English','podcasts','rss','B1-C1','fluency','{podcast,fluency,american-english,conversation}','https://www.allearsenglish.com/episodes/','https://www.allearsenglish.com/feed/podcast',NULL,NULL,92,true),
  ('lukes-english-podcast','Luke''s English Podcast','Luke''s English Podcast','podcasts','website','B1-C1','british english','{podcast,british-english,natural-english,long-form}','https://teacherluke.co.uk/',NULL,NULL,NULL,90,true),
  ('american-english-podcast','American English Podcast','American English Podcast','podcasts','website','B1-C1','american english','{podcast,american-english,culture,stories}','https://americanenglishpodcast.com/',NULL,NULL,NULL,89,true),
  ('bc-reading','Practise English Reading Skills','British Council','reading','website','all','reading practice','{reading,british-council,comprehension,cefr}','https://learnenglish.britishcouncil.org/free-resources/reading',NULL,NULL,NULL,100,true),
  ('bc-story-zone','Story Zone','British Council','reading','website','A2-C1','stories','{reading,stories,british-council,graded-reading}','https://learnenglish.britishcouncil.org/free-resources/general/story-zone',NULL,NULL,NULL,95,true),
  ('cambridge-reading','Cambridge English Reading Activities','Cambridge English','reading','website','all','reading activities','{reading,cambridge,activities,practice}','https://www.cambridgeenglish.org/learning-english/activities-for-learners/?skill=reading',NULL,NULL,NULL,90,true),
  ('bc-writing','Practise English Writing Skills','British Council','writing','website','all','writing practice','{writing,british-council,model-texts,structure}','https://learnenglish.britishcouncil.org/free-resources/writing',NULL,NULL,NULL,100,true),
  ('oxford-writing','Free English Writing Lessons','Oxford Online English','writing','website','B1-C1','writing lessons','{writing,oxford,emails,essays,ielts}','https://www.oxfordonlineenglish.com/free-english-writing-lessons',NULL,NULL,NULL,96,true),
  ('uefap-writing','UEfAP Writing','UEfAP','writing','website','B2-C1','academic writing','{writing,academic,uefap,university}','https://www.uefap.org/writing/',NULL,NULL,NULL,92,true)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, provider=EXCLUDED.provider, section=EXCLUDED.section,
  type=EXCLUDED.type, level=EXCLUDED.level, topic=EXCLUDED.topic,
  tags=EXCLUDED.tags, url=EXCLUDED.url, rss_url=EXCLUDED.rss_url,
  image_url=EXCLUDED.image_url, description=EXCLUDED.description,
  priority=EXCLUDED.priority, active=EXCLUDED.active;
