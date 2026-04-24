-- ================================================================
-- AGTM Academy — Migration v35 : Playlists YouTube curées par niveau CEFR
-- English Corner > Section Video > Groupe 3
-- Coller intégralement dans Supabase → SQL Editor → Run
-- ================================================================
--
-- Playlists ajoutées (avec métadonnées riches) :
--   A1  — Anglais A1 Beginner            (PLAitepfdbTqtBnSJaT6I0tfyvBnf9NTNz)
--   A2  — Niveau A2                       (PLVnO1V78R5Pfkq0s40TWO-2AOiZrWOyK)
--   B1  — Anglais intermédiaire B1        (PLEwnbyckpJVq5PxIzyt8QseOXEbzv4H)
--   B2-C1 — Advanced English B2-C1       (PLF08grTlUqUyXOcP2zC5XNrELuHH5fue)
--   B2-C1 — Business English Course      (PLh0bLFae5jipDeSAGuT4yjdp_ZkoGQGEl)
--
-- Playlist mise à jour (métadonnées enrichies) :
--   B1-B2 — B1-B2 Intermediate Level     (PLJ5qkOTqBd8Hs1T6tRWpVVhuvF1MLz84S)
-- ================================================================

-- ── 1. Mise à jour de la playlist B1-B2 déjà présente ─────────────
-- (insérée en v33 sans titre ni métadonnées)
UPDATE corner_content
SET
  title       = 'B1-B2 Intermediate Level English Videos',
  provider    = 'EIP English In Practice',
  level       = 'B1-B2',
  topic       = 'real conversations & practical exercises',
  tags        = '{english,youtube,b1,b2,intermediate,conversation,practice,exercises}',
  description = 'Des conversations réelles et des exercices pratiques pour consolider le niveau intermédiaire B1-B2. Idéal pour progresser en fluidité orale et compréhension.',
  priority    = 75
WHERE id = 'PLJ5qkOTqBd8Hs1T6tRWpVVhuvF1MLz84S';

-- ── 2. Insertion des 5 nouvelles playlists curées ─────────────────
INSERT INTO corner_content
  (id, title, provider, section, type, level, topic, tags, url, rss_url, image_url, description, priority, active)
VALUES

  -- A1 — Vocabulaire & grammaire progressifs
  (
    'PLAitepfdbTqtBnSJaT6I0tfyvBnf9NTNz',
    'Anglais A1 Beginner',
    'EIP English In Practice',
    'listening',
    'playlist',
    'A1',
    'beginner vocabulary & grammar',
    '{english,youtube,a1,beginner,vocabulary,grammar,progressive}',
    'https://www.youtube.com/playlist?list=PLAitepfdbTqtBnSJaT6I0tfyvBnf9NTNz',
    NULL,
    NULL,
    'Playlist conçue pour les grands débutants A1. Le vocabulaire et la grammaire sont introduits progressivement, avec des explications claires et des exercices adaptés au niveau débutant.',
    80,
    true
  ),

  -- A2 — Écoute & compréhension orale
  (
    'PLVnO1V78R5Pfkq0s40TWO-2AOiZrWOyK',
    'Niveau A2',
    'EIP English In Practice',
    'listening',
    'playlist',
    'A2',
    'listening & oral comprehension',
    '{english,youtube,a2,elementary,listening,oral,comprehension,speaking}',
    'https://www.youtube.com/playlist?list=PLVnO1V78R5Pfkq0s40TWO-2AOiZrWOyK',
    NULL,
    NULL,
    'Playlist axée sur l''écoute et la compréhension orale pour le niveau A2. Développe la capacité à comprendre des conversations simples du quotidien et à s''exprimer dans des situations courantes.',
    78,
    true
  ),

  -- B1 — Grammaire : des bases au niveau avancé
  (
    'PLEwnbyckpJVq5PxIzyt8QseOXEbzv4H',
    'Anglais intermédiaire B1',
    'EIP English In Practice',
    'listening',
    'playlist',
    'B1',
    'grammar foundations to advanced',
    '{english,youtube,b1,intermediate,grammar,foundations,progressive,structures}',
    'https://www.youtube.com/playlist?list=PLEwnbyckpJVq5PxIzyt8QseOXEbzv4H',
    NULL,
    NULL,
    'Couvre les structures grammaticales essentielles du niveau B1, des bases jusqu''au niveau avancé. Une progression pédagogique claire pour consolider les acquis et aborder des points de grammaire plus complexes.',
    76,
    true
  ),

  -- B2-C1 — Grammaire avancée & exercices de niveau supérieur
  (
    'PLF08grTlUqUyXOcP2zC5XNrELuHH5fue',
    'Advanced English B2-C1',
    'EIP English In Practice',
    'listening',
    'playlist',
    'B2-C1',
    'advanced grammar & superior exercises',
    '{english,youtube,b2,c1,advanced,grammar,exercises,superior,fluency}',
    'https://www.youtube.com/playlist?list=PLF08grTlUqUyXOcP2zC5XNrELuHH5fue',
    NULL,
    NULL,
    'Leçons de grammaire avancée et exercices de niveau supérieur pour les apprenants B2-C1. Couvre les structures complexes, la précision linguistique et les nuances de l''anglais avancé.',
    82,
    true
  ),

  -- B2-C1 — Business English (réunions, présentations, négociations, appels)
  (
    'PLh0bLFae5jipDeSAGuT4yjdp_ZkoGQGEl',
    'Business English Course',
    'EIP English In Practice',
    'listening',
    'playlist',
    'B2-C1',
    'professional business english',
    '{english,youtube,b2,c1,business,professional,meetings,presentations,negotiations,phone-calls}',
    'https://www.youtube.com/playlist?list=PLh0bLFae5jipDeSAGuT4yjdp_ZkoGQGEl',
    NULL,
    NULL,
    'Cours complet d''anglais des affaires couvrant les réunions professionnelles, les présentations, les négociations et les appels téléphoniques. Indispensable pour les professionnels souhaitant maîtriser l''anglais en milieu de travail.',
    85,
    true
  )

ON CONFLICT (id) DO UPDATE SET
  title       = EXCLUDED.title,
  provider    = EXCLUDED.provider,
  section     = EXCLUDED.section,
  type        = EXCLUDED.type,
  level       = EXCLUDED.level,
  topic       = EXCLUDED.topic,
  tags        = EXCLUDED.tags,
  url         = EXCLUDED.url,
  rss_url     = EXCLUDED.rss_url,
  image_url   = EXCLUDED.image_url,
  description = EXCLUDED.description,
  priority    = EXCLUDED.priority,
  active      = EXCLUDED.active;

-- ── 3. Vérification ───────────────────────────────────────────────
SELECT id, title, level, topic, priority
FROM corner_content
WHERE id IN (
  'PLAitepfdbTqtBnSJaT6I0tfyvBnf9NTNz',
  'PLVnO1V78R5Pfkq0s40TWO-2AOiZrWOyK',
  'PLJ5qkOTqBd8Hs1T6tRWpVVhuvF1MLz84S',
  'PLEwnbyckpJVq5PxIzyt8QseOXEbzv4H',
  'PLF08grTlUqUyXOcP2zC5XNrELuHH5fue',
  'PLh0bLFae5jipDeSAGuT4yjdp_ZkoGQGEl'
)
ORDER BY priority DESC;
