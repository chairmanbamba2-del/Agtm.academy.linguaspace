-- ════════════════════════════════════════════════════════════════════
-- MIGRATION v44 — Partie 1 : Table de progression écoute/listening
-- À exécuter dans Supabase SQL Editor
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- ════════════════════════════════════════════════════════════════════

-- ── 1. TABLE DE PROGRESSION ÉCOUTE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS user_listening_progress (
    id               BIGSERIAL PRIMARY KEY,
    user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id       TEXT        NOT NULL,           -- YouTube video ID, podcast episode GUID, etc.
    content_type     TEXT        NOT NULL DEFAULT 'youtube_video' CHECK (content_type IN ('youtube_video', 'podcast_episode', 'rss_episode')),
    content_title    TEXT,                           -- Title for display
    content_provider TEXT,                           -- Provider (BBC, TED, etc.)
    content_level    TEXT,                           -- Level (A1, B1, etc.)
    
    -- Watch tracking
    watched          BOOLEAN     DEFAULT FALSE,
    watched_at       TIMESTAMPTZ,
    watch_duration   INTEGER,                        -- Seconds watched (optional)
    
    -- Quiz tracking
    quiz_completed   BOOLEAN     DEFAULT FALSE,
    quiz_score       NUMERIC(5,2),                   -- Score percentage
    quiz_answers     JSONB,                          -- User's answers
    quiz_correct     INTEGER,                        -- Number of correct answers
    quiz_total       INTEGER,                        -- Total questions
    completed_at     TIMESTAMPTZ,
    
    -- Metadata
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one progress record per user per content
    UNIQUE (user_id, content_id, content_type)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_listening_progress_user ON user_listening_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_listening_progress_content ON user_listening_progress (content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_listening_progress_watched ON user_listening_progress (user_id, watched) WHERE watched = TRUE;
CREATE INDEX IF NOT EXISTS idx_listening_progress_quiz ON user_listening_progress (user_id, quiz_completed) WHERE quiz_completed = TRUE;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_listening_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listening_progress_updated_at ON user_listening_progress;
CREATE TRIGGER listening_progress_updated_at
    BEFORE UPDATE ON user_listening_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_listening_progress_updated_at();

-- ── 2. ROW LEVEL SECURITY ───────────────────────────────────────────
ALTER TABLE user_listening_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "listening_progress_select_own" ON user_listening_progress;
DROP POLICY IF EXISTS "listening_progress_insert_own" ON user_listening_progress;
DROP POLICY IF EXISTS "listening_progress_update_own" ON user_listening_progress;
DROP POLICY IF EXISTS "listening_progress_service" ON user_listening_progress;

-- Users can read their own progress
CREATE POLICY "listening_progress_select_own" ON user_listening_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "listening_progress_insert_own" ON user_listening_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "listening_progress_update_own" ON user_listening_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do anything (for sync operations)
CREATE POLICY "listening_progress_service" ON user_listening_progress
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ── 3. FUNCTIONS UTILES ─────────────────────────────────────────────
-- Function to mark video as watched
CREATE OR REPLACE FUNCTION mark_video_watched(
    p_user_id UUID,
    p_content_id TEXT,
    p_content_title TEXT DEFAULT NULL,
    p_content_provider TEXT DEFAULT NULL,
    p_content_level TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO user_listening_progress (
        user_id,
        content_id,
        content_type,
        content_title,
        content_provider,
        content_level,
        watched,
        watched_at
    ) VALUES (
        p_user_id,
        p_content_id,
        'youtube_video',
        p_content_title,
        p_content_provider,
        p_content_level,
        TRUE,
        NOW()
    )
    ON CONFLICT (user_id, content_id, content_type) 
    DO UPDATE SET
        watched = TRUE,
        watched_at = CASE 
            WHEN user_listening_progress.watched = FALSE THEN NOW()
            ELSE user_listening_progress.watched_at 
        END,
        content_title = COALESCE(p_content_title, user_listening_progress.content_title),
        content_provider = COALESCE(p_content_provider, user_listening_progress.content_provider),
        content_level = COALESCE(p_content_level, user_listening_progress.content_level),
        updated_at = NOW()
    RETURNING jsonb_build_object(
        'id', id,
        'content_id', content_id,
        'watched', watched,
        'watched_at', watched_at
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to save quiz results
CREATE OR REPLACE FUNCTION save_quiz_results(
    p_user_id UUID,
    p_content_id TEXT,
    p_content_type TEXT DEFAULT 'youtube_video',
    p_quiz_score NUMERIC DEFAULT 0,
    p_quiz_answers JSONB DEFAULT '{}'::JSONB,
    p_quiz_correct INTEGER DEFAULT 0,
    p_quiz_total INTEGER DEFAULT 0,
    p_content_title TEXT DEFAULT NULL,
    p_content_provider TEXT DEFAULT NULL,
    p_content_level TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO user_listening_progress (
        user_id,
        content_id,
        content_type,
        content_title,
        content_provider,
        content_level,
        quiz_completed,
        quiz_score,
        quiz_answers,
        quiz_correct,
        quiz_total,
        completed_at
    ) VALUES (
        p_user_id,
        p_content_id,
        p_content_type,
        p_content_title,
        p_content_provider,
        p_content_level,
        TRUE,
        p_quiz_score,
        p_quiz_answers,
        p_quiz_correct,
        p_quiz_total,
        NOW()
    )
    ON CONFLICT (user_id, content_id, content_type) 
    DO UPDATE SET
        quiz_completed = TRUE,
        quiz_score = p_quiz_score,
        quiz_answers = p_quiz_answers,
        quiz_correct = p_quiz_correct,
        quiz_total = p_quiz_total,
        completed_at = NOW(),
        content_title = COALESCE(p_content_title, user_listening_progress.content_title),
        content_provider = COALESCE(p_content_provider, user_listening_progress.content_provider),
        content_level = COALESCE(p_content_level, user_listening_progress.content_level),
        updated_at = NOW()
    RETURNING jsonb_build_object(
        'id', id,
        'content_id', content_id,
        'quiz_completed', quiz_completed,
        'quiz_score', quiz_score,
        'completed_at', completed_at
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user listening statistics
CREATE OR REPLACE FUNCTION get_listening_stats(p_user_id UUID)
RETURNS TABLE (
    total_watched INTEGER,
    total_quizzes INTEGER,
    avg_score NUMERIC(5,2),
    by_level JSONB,
    recent_activity JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(DISTINCT content_id) FILTER (WHERE watched = TRUE) as watched_count,
            COUNT(DISTINCT content_id) FILTER (WHERE quiz_completed = TRUE) as quiz_count,
            ROUND(AVG(quiz_score) FILTER (WHERE quiz_completed = TRUE), 2) as avg_score_val
        FROM user_listening_progress
        WHERE user_id = p_user_id
    ),
    level_stats_agg AS (
        SELECT COALESCE(jsonb_object_agg(
            content_level,
            jsonb_build_object('watched', watched, 'quizzes', quizzes, 'avg_score', avg_score)
        ), '{}'::JSONB) as levels_json
        FROM (
            SELECT
                content_level,
                COUNT(DISTINCT content_id) FILTER (WHERE watched = TRUE) as watched,
                COUNT(DISTINCT content_id) FILTER (WHERE quiz_completed = TRUE) as quizzes,
                ROUND(AVG(quiz_score) FILTER (WHERE quiz_completed = TRUE), 2) as avg_score
            FROM user_listening_progress
            WHERE user_id = p_user_id AND content_level IS NOT NULL
            GROUP BY content_level
        ) ls
    ),
    recent_agg AS (
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'content_id', content_id,
                'content_title', content_title,
                'content_level', content_level,
                'watched_at', watched_at,
                'completed_at', completed_at,
                'quiz_score', quiz_score
            )
        ), '[]'::JSONB) as recent_items
        FROM (
            SELECT
                content_id,
                content_title,
                content_level,
                watched_at,
                completed_at,
                quiz_score
            FROM user_listening_progress
            WHERE user_id = p_user_id AND (watched = TRUE OR quiz_completed = TRUE)
            ORDER BY GREATEST(watched_at, completed_at) DESC NULLS LAST
            LIMIT 10
        ) sub
    )
    SELECT
        COALESCE(stats.watched_count, 0)::INTEGER,
        COALESCE(stats.quiz_count, 0)::INTEGER,
        COALESCE(stats.avg_score_val, 0)::NUMERIC(5,2),
        level_stats_agg.levels_json,
        recent_agg.recent_items
    FROM stats
    CROSS JOIN level_stats_agg
    CROSS JOIN recent_agg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 4. VÉRIFICATION ─────────────────────────────────────────────────
DO $$
BEGIN
    -- Check if listening progress table was created
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_listening_progress') THEN
        RAISE NOTICE '✅ Table user_listening_progress créée avec succès';
    ELSE
        RAISE EXCEPTION '❌ Échec de création de la table user_listening_progress';
    END IF;
    
    -- Check RLS policies
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_listening_progress') >= 4 THEN
        RAISE NOTICE '✅ Politiques RLS configurées';
    ELSE
        RAISE WARNING '⚠️ Nombre de politiques RLS insuffisant';
    END IF;
    
    -- Check functions
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'mark_video_watched') THEN
        RAISE NOTICE '✅ Fonction mark_video_watched créée';
    ELSE
        RAISE WARNING '⚠️ Fonction mark_video_watched non créée';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'save_quiz_results') THEN
        RAISE NOTICE '✅ Fonction save_quiz_results créée';
    ELSE
        RAISE WARNING '⚠️ Fonction save_quiz_results non créée';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'get_listening_stats') THEN
        RAISE NOTICE '✅ Fonction get_listening_stats créée';
    ELSE
        RAISE WARNING '⚠️ Fonction get_listening_stats non créée';
    END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- Fin de la migration v44 Partie 1
-- ════════════════════════════════════════════════════════════════════