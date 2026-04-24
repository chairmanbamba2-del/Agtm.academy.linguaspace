-- ============================================================
-- AGTM LINGUA SPACE — Schéma de base de données complet
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- TABLE 1 : Utilisateurs LINGUA SPACE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lingua_users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  country       TEXT DEFAULT 'CI',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  agtm_user_id  UUID  -- NULL si pas de compte AGTM existant
);

-- ────────────────────────────────────────────────────────────
-- TABLE 2 : Abonnements
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lingua_subscriptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES lingua_users(id) ON DELETE CASCADE,
  plan_type         TEXT NOT NULL CHECK (plan_type IN ('uni', 'all_access')),
  selected_language TEXT CHECK (selected_language IN ('en', 'fr', 'es', 'de')),
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'trial')),
  payment_method    TEXT CHECK (payment_method IN ('orange_money', 'wave', 'mtn', 'card', 'flutterwave')),
  payment_ref       TEXT,
  amount_fcfa       INTEGER NOT NULL,
  started_at        TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  auto_renew        BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON lingua_subscriptions(user_id, status);

-- ────────────────────────────────────────────────────────────
-- TABLE 3 : Progression par langue
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lingua_progress (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES lingua_users(id) ON DELETE CASCADE,
  language            TEXT NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de')),
  current_level       TEXT DEFAULT 'A1' CHECK (current_level IN ('A1','A2','B1','B2','C1','C2')),
  modules_completed   INTEGER DEFAULT 0,
  xp_points           INTEGER DEFAULT 0,
  streak_days         INTEGER DEFAULT 0,
  last_activity_at    TIMESTAMPTZ,
  UNIQUE(user_id, language)
);

-- ────────────────────────────────────────────────────────────
-- TABLE 4 : Sessions IA (monitoring consommation tokens)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lingua_ai_sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES lingua_users(id) ON DELETE CASCADE,
  language         TEXT NOT NULL,
  session_type     TEXT CHECK (session_type IN ('free_talk','business','travel','daily_life','role_play','exam_prep','quiz')),
  model_used       TEXT,
  tokens_used      INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_month ON lingua_ai_sessions(user_id, created_at);

-- ────────────────────────────────────────────────────────────
-- TABLE 5 : Modules de cours
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lingua_modules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language        TEXT NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de')),
  level           TEXT NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  order_num       INTEGER NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  content_type    TEXT DEFAULT 'lesson' CHECK (content_type IN ('video','audio','reading','exercise','lesson')),
  content_url     TEXT,
  content_text    TEXT,
  transcript      TEXT,
  duration_min    INTEGER,
  is_published    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(language, order_num)
);

CREATE INDEX IF NOT EXISTS idx_modules_lang_level ON lingua_modules(language, level, is_published);

-- ────────────────────────────────────────────────────────────
-- TABLE 6 : Progression par module
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lingua_module_progress (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES lingua_users(id) ON DELETE CASCADE,
  module_id      UUID NOT NULL REFERENCES lingua_modules(id),
  status         TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  score          INTEGER CHECK (score >= 0 AND score <= 100),
  completed_at   TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

-- ────────────────────────────────────────────────────────────
-- TABLE 7 : Contenu des Corners (flux audio/vidéo)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lingua_content (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language        TEXT NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de')),
  title           TEXT NOT NULL,
  source          TEXT,  -- 'voa', 'rfi', 'dw', 'rne', 'bbc', 'agtm'
  content_type    TEXT CHECK (content_type IN ('audio', 'video', 'article')),
  media_url       TEXT,
  thumbnail_url   TEXT,
  transcript      TEXT,
  duration_sec    INTEGER,
  level_target    TEXT,
  tags            TEXT[],
  view_count      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_lang_active ON lingua_content(language, is_active, created_at DESC);

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════

-- Activer RLS sur toutes les tables
ALTER TABLE lingua_users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE lingua_subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lingua_progress        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lingua_ai_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lingua_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lingua_modules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lingua_content         ENABLE ROW LEVEL SECURITY;

-- lingua_users : chaque user voit et modifie uniquement son profil
DROP POLICY IF EXISTS "Users manage own profile" ON lingua_users;
CREATE POLICY "Users manage own profile" ON lingua_users
  FOR ALL USING (auth.uid() = id);

-- lingua_subscriptions : chaque user voit ses propres abonnements
DROP POLICY IF EXISTS "Users see own subscriptions" ON lingua_subscriptions;
CREATE POLICY "Users see own subscriptions" ON lingua_subscriptions
  FOR ALL USING (
    user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid())
  );

-- lingua_progress : chaque user gère sa progression
DROP POLICY IF EXISTS "Users manage own progress" ON lingua_progress;
CREATE POLICY "Users manage own progress" ON lingua_progress
  FOR ALL USING (
    user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid())
  );

-- lingua_ai_sessions : chaque user voit ses sessions
DROP POLICY IF EXISTS "Users see own ai sessions" ON lingua_ai_sessions;
CREATE POLICY "Users see own ai sessions" ON lingua_ai_sessions
  FOR ALL USING (
    user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid())
  );

-- lingua_module_progress : chaque user gère sa progression modules
DROP POLICY IF EXISTS "Users manage own module progress" ON lingua_module_progress;
CREATE POLICY "Users manage own module progress" ON lingua_module_progress
  FOR ALL USING (
    user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid())
  );

-- lingua_modules : lecture publique pour utilisateurs authentifiés (modules publiés)
DROP POLICY IF EXISTS "Auth users read published modules" ON lingua_modules;
CREATE POLICY "Auth users read published modules" ON lingua_modules
  FOR SELECT USING (auth.role() = 'authenticated' AND is_published = TRUE);

-- lingua_content : lecture publique pour utilisateurs authentifiés
DROP POLICY IF EXISTS "Auth users read active content" ON lingua_content;
CREATE POLICY "Auth users read active content" ON lingua_content
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- ════════════════════════════════════════════════════════════
-- DONNÉES DE DÉMONSTRATION — Modules anglais
-- (Supprimer ou adapter pour la production)
-- ════════════════════════════════════════════════════════════

INSERT INTO lingua_modules (language, level, order_num, title, description, content_type, duration_min, is_published)
VALUES
  ('en', 'A1', 1,  'Greetings and Introductions',   'Learn to say hello and introduce yourself.',      'lesson',   15, TRUE),
  ('en', 'A1', 2,  'Numbers and the Alphabet',       'Count to 100 and spell your name.',               'exercise', 20, TRUE),
  ('en', 'A1', 3,  'Days, Months and Seasons',       'Talk about time and dates.',                      'lesson',   20, TRUE),
  ('en', 'A1', 4,  'Colors, Shapes and Sizes',       'Describe objects around you.',                    'lesson',   15, TRUE),
  ('en', 'A1', 5,  'My Family',                      'Talk about family members and relationships.',    'lesson',   25, TRUE),
  ('en', 'A2', 16, 'Present Simple vs Continuous',  'Understand when to use each tense.',              'lesson',   30, TRUE),
  ('en', 'A2', 17, 'Past Simple',                    'Talk about finished actions in the past.',        'lesson',   30, TRUE),
  ('en', 'A2', 18, 'Comparatives and Superlatives',  'Compare people, places and things.',              'exercise', 25, TRUE),
  ('en', 'B1', 34, 'Expressing Opinions',            'Give and defend your point of view.',             'lesson',   35, TRUE),
  ('en', 'B1', 35, 'Conditionals (Type 1 & 2)',      'Real and hypothetical situations.',               'lesson',   40, TRUE),
  ('en', 'B1', 36, 'Passive Voice',                  'Use passive structures naturally.',               'exercise', 35, TRUE),
  ('en', 'B2', 54, 'Advanced Conditionals',          'Master all types of conditional sentences.',      'lesson',   40, TRUE),
  ('en', 'B2', 55, 'Discourse Markers',              'Connect ideas and structure arguments.',          'lesson',   35, TRUE),
  ('en', 'C1', 74, 'Academic Writing Structures',   'Write formal essays and reports.',                'exercise', 50, TRUE),
  ('en', 'C1', 75, 'Nuanced Vocabulary',             'Collocations, connotations and register.',        'lesson',   45, TRUE),
  ('en', 'C2', 90, 'Idiomatic English Mastery',      'Master idioms and sophisticated expressions.',    'lesson',   45, TRUE)
ON CONFLICT (language, order_num) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- FONCTION : Expiration automatique des abonnements
-- Créer un Cron Job dans Supabase Dashboard pour l'appeler
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE lingua_subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dans Supabase Dashboard > Database > Cron Jobs, ajouter :
-- Schedule: 0 2 * * * (tous les jours à 2h du matin)
-- Command: SELECT expire_subscriptions();
