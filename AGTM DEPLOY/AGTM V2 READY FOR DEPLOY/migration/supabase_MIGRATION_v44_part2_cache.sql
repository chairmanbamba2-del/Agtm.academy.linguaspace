-- ════════════════════════════════════════════════════════════════════
-- MIGRATION v44 — Partie 2 : Table de cache API (compatible v43)
-- À exécuter dans Supabase SQL Editor
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- ════════════════════════════════════════════════════════════════════

-- ── 1. SAUVEGARDE DES DONNÉES EXISTANTES ────────────────────────────
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

-- ── 2. MIGRATION DES ANCIENS CACHES PODCAST ─────────────────────────
DO $$ 
BEGIN
    -- Migrer les anciennes données de ec_podcast_cache vers la nouvelle table (après création)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ec_podcast_cache') THEN
        RAISE NOTICE '📦 Migration des données ec_podcast_cache...';
        -- Les données seront insérées après création de la table
    END IF;
END $$;

-- ── 3. CRÉATION DE LA TABLE DE CACHE ────────────────────────────────
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

-- ── 4. TRIGGER POUR EXPIRATION AUTOMATIQUE ──────────────────────────
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

-- ── 5. RESTAURATION DES DONNÉES SAUVEGARDÉES ────────────────────────
DO $$
BEGIN
    -- Restore saved cache data from temp table
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

-- ── 6. ROW LEVEL SECURITY ───────────────────────────────────────────
ALTER TABLE ec_api_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "ec_api_cache_select" ON ec_api_cache;
DROP POLICY IF EXISTS "ec_api_cache_insert" ON ec_api_cache;
DROP POLICY IF EXISTS "ec_api_cache_update" ON ec_api_cache;
DROP POLICY IF EXISTS "ec_api_cache_delete" ON ec_api_cache;

-- Create new policies
CREATE POLICY "ec_api_cache_select" ON ec_api_cache
    FOR SELECT USING (true);
CREATE POLICY "ec_api_cache_insert" ON ec_api_cache
    FOR INSERT WITH CHECK (true);
CREATE POLICY "ec_api_cache_update" ON ec_api_cache
    FOR UPDATE USING (true);
CREATE POLICY "ec_api_cache_delete" ON ec_api_cache
    FOR DELETE USING (true);

-- ── 7. VÉRIFICATION ─────────────────────────────────────────────────
DO $$
BEGIN
    -- Check if cache table was created
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ec_api_cache') THEN
        RAISE NOTICE '✅ Table ec_api_cache créée avec succès';
    ELSE
        RAISE WARNING '⚠️ Table ec_api_cache non créée';
    END IF;
    
    -- Check RLS policies for cache table
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'ec_api_cache') >= 4 THEN
        RAISE NOTICE '✅ Politiques RLS configurées (ec_api_cache)';
    ELSE
        RAISE WARNING '⚠️ Nombre de politiques RLS insuffisant pour ec_api_cache';
    END IF;
    
    -- Cache statistics
    RAISE NOTICE '📊 Statistiques du cache ec_api_cache :';
    BEGIN
        DECLARE r RECORD;
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
-- Fin de la migration v44 Partie 2
-- ════════════════════════════════════════════════════════════════════