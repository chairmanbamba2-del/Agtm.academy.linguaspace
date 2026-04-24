-- ════════════════════════════════════════════════════════════════════
-- MIGRATION v44 — Table de progression écoute/listening
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

-- ── 3. CACHE TABLE FIX (v43 compatibility) ───────────────────────────
-- Save existing cache data if table exists
DO $$
DECLARE
    row_count INTEGER := 0;
BEGIN
    -- Check if ec_api_cache exists and has data
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ec_api_cache') THEN
        -- Create temp table with same structure (without referencing ec_api_cache)
        CREATE TEMP TABLE IF NOT EXISTS temp_old_cache (
            cache_key  TEXT,
            data       JSONB,
            cached_at  TIMESTAMPTZ,
            service    TEXT,
            query      TEXT,
            action     TEXT,
            expires_at TIMESTAMPTZ
        );
        
        -- Copy data from existing ec_api_cache
        INSERT INTO temp_old_cache 
        SELECT cache_key, data, cached_at, service, query, action, expires_at
        FROM ec_api_cache;
        
        GET DIAGNOSTICS row_count = ROW_COUNT;
        RAISE NOTICE '✅ Données de cache existantes sauvegardées (%)', row_count;
    END IF;
END $$;

-- Drop existing table to recreate with trigger instead of generated column
DROP TABLE IF EXISTS ec_api_cache CASCADE;

-- Migrate old podcast cache data before creating new table
DO $$ 
BEGIN
    -- Migrer les anciennes données de ec_podcast_cache vers la nouvelle table (après création)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ec_podcast_cache') THEN
        RAISE NOTICE '📦 Migration des données ec_podcast_cache...';
        -- Les données seront insérées après création de la table
    END IF;
END $$;

-- Create new cache table without generated column
CREATE TABLE IF NOT EXISTS ec_api_cache (
    cache_key  TEXT PRIMARY KEY,
    data       JSONB NOT NULL,
    cached_at  TIMESTAMPTZ DEFAULT NOW(),
    service    TEXT DEFAULT 'youtube',  -- 'youtube', 'listenotes', 'news', etc.
    query      TEXT,
    action     TEXT,
    expires_at TIMESTAMPTZ
);

-- Index for automatic cleanup of expired entries
CREATE INDEX IF NOT EXISTS idx_ec_api_cache_expires ON ec_api_cache(expires_at);

-- Function to set expires_at on insert/update
CREATE OR REPLACE FUNCTION set_cache_expiry()
RETURNS TRIGGER AS $$
BEGIN
    NEW.expires_at = NEW.cached_at + INTERVAL '24 hours';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set expiry
DROP TRIGGER IF EXISTS trg_cache_expiry ON ec_api_cache;
CREATE TRIGGER trg_cache_expiry
    BEFORE INSERT OR UPDATE ON ec_api_cache
    FOR EACH ROW
    EXECUTE FUNCTION set_cache_expiry();

-- Restore saved cache data
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'temp_old_cache') THEN
        INSERT INTO ec_api_cache (cache_key, data, cached_at, service, query, action, expires_at)
        SELECT cache_key, data, cached_at, service, query, action, 
               cached_at + INTERVAL '24 hours' as expires_at
        FROM temp_old_cache
        ON CONFLICT (cache_key) DO NOTHING;
        
        DROP TABLE temp_old_cache;
        RAISE NOTICE '✅ Données de cache restaurées';
    END IF;
    
    -- Migrer les anciennes données de ec_podcast_cache
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ec_podcast_cache') THEN
        INSERT INTO ec_api_cache (cache_key, data, cached_at, service, query, action, expires_at)
        SELECT 
            cache_key, 
            data, 
            cached_at, 
            'listenotes' AS service,
            query,
            action,
            cached_at + INTERVAL '24 hours' as expires_at
        FROM ec_podcast_cache
        ON CONFLICT (cache_key) DO NOTHING;
        
        -- Supprimer l'ancienne table après migration
        DROP TABLE ec_podcast_cache;
        RAISE NOTICE '✅ Données ec_podcast_cache migrées';
    END IF;
END $$;

-- RLS: public read, limited write (via service key)
ALTER TABLE ec_api_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ec_api_cache_select" ON ec_api_cache
    FOR SELECT USING (true);
CREATE POLICY "ec_api_cache_insert" ON ec_api_cache
    FOR INSERT WITH CHECK (true);
CREATE POLICY "ec_api_cache_update" ON ec_api_cache
    FOR UPDATE USING (true);
CREATE POLICY "ec_api_cache_delete" ON ec_api_cache
    FOR DELETE USING (true);

-- ── 4. FUNCTIONS UTILES ─────────────────────────────────────────────
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

-- ── 5. VÉRIFICATION ─────────────────────────────────────────────────
DO $$
BEGIN
    -- Check if listening progress table was created
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_listening_progress') THEN
        RAISE NOTICE '✅ Table user_listening_progress créée avec succès';
    ELSE
        RAISE EXCEPTION '❌ Échec de création de la table user_listening_progress';
    END IF;
    
    -- Check if cache table was created
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ec_api_cache') THEN
        RAISE NOTICE '✅ Table ec_api_cache créée avec succès';
    ELSE
        RAISE WARNING '⚠️ Table ec_api_cache non créée';
    END IF;
    
    -- Check RLS policies for listening progress
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_listening_progress') >= 4 THEN
        RAISE NOTICE '✅ Politiques RLS configurées (user_listening_progress)';
    ELSE
        RAISE WARNING '⚠️ Nombre de politiques RLS insuffisant pour user_listening_progress';
    END IF;
    
    -- Check RLS policies for cache table
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'ec_api_cache') >= 4 THEN
        RAISE NOTICE '✅ Politiques RLS configurées (ec_api_cache)';
    ELSE
        RAISE WARNING '⚠️ Nombre de politiques RLS insuffisant pour ec_api_cache';
    END IF;
    
    -- Cache statistics (from v43)
    RAISE NOTICE '📊 Statistiques du cache ec_api_cache :';
    BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ec_api_cache') THEN
            FOR r IN 
                SELECT 
                    COUNT(*) as total_entries,
                    service,
                    MIN(cached_at) as oldest,
                    MAX(cached_at) as newest
                FROM ec_api_cache
                GROUP BY service
                ORDER BY service
            LOOP
                RAISE NOTICE '  Service %: % entrées (plus ancienne: %, plus récente: %)', 
                    r.service, r.total_entries, r.oldest, r.newest;
            END LOOP;
        ELSE
            RAISE NOTICE '  Table ec_api_cache vide ou inexistante';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '⚠️ Erreur lors de la lecture des stats du cache: %', SQLERRM;
    END;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- Fin de la migration v44
-- ════════════════════════════════════════════════════════════════════