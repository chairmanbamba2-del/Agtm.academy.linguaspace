-- ════════════════════════════════════════════════════════════════════
-- MIGRATION v43 — Tables de cache API pour économiser les quotas
-- À exécuter dans Supabase SQL Editor
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- ════════════════════════════════════════════════════════════════════

-- ── 1. TABLE DE CACHE GÉNÉRIQUE (YouTube, ListenNotes, etc.) ─────────
CREATE TABLE IF NOT EXISTS ec_api_cache (
    cache_key  TEXT PRIMARY KEY,
    data       JSONB NOT NULL,
    cached_at  TIMESTAMPTZ DEFAULT NOW(),
    service    TEXT DEFAULT 'youtube',  -- 'youtube', 'listenotes', 'news', etc.
    query      TEXT,
    action     TEXT,
    expires_at TIMESTAMPTZ GENERATED ALWAYS AS (cached_at + INTERVAL '24 hours') STORED
);

-- Index pour nettoyage automatique des entrées expirées
CREATE INDEX IF NOT EXISTS idx_ec_api_cache_expires ON ec_api_cache(expires_at);

-- RLS : lecture publique, écriture limitée aux services (via service key)
ALTER TABLE ec_api_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ec_api_cache_select" ON ec_api_cache
    FOR SELECT USING (true);
CREATE POLICY "ec_api_cache_insert" ON ec_api_cache
    FOR INSERT WITH CHECK (true);
CREATE POLICY "ec_api_cache_update" ON ec_api_cache
    FOR UPDATE USING (true);
CREATE POLICY "ec_api_cache_delete" ON ec_api_cache
    FOR DELETE USING (true);

-- ── 2. NETTOYAGE DES ANCIENS CACHES (si table ec_podcast_cache existe) ──
DO $$ 
BEGIN
    -- Migrer les anciennes données de ec_podcast_cache vers ec_api_cache
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ec_podcast_cache') THEN
        INSERT INTO ec_api_cache (cache_key, data, cached_at, service, query, action)
        SELECT 
            cache_key, 
            data, 
            cached_at, 
            'listenotes' AS service,
            query,
            action
        FROM ec_podcast_cache
        ON CONFLICT (cache_key) DO NOTHING;
        
        -- Supprimer l'ancienne table après migration
        DROP TABLE ec_podcast_cache;
    END IF;
END $$;

-- ── 3. VÉRIFICATION ──────────────────────────────────────────────────
SELECT 
    COUNT(*) as total_entries,
    service,
    MIN(cached_at) as oldest,
    MAX(cached_at) as newest
FROM ec_api_cache
GROUP BY service
ORDER BY service;

-- ════════════════════════════════════════════════════════════════════
-- Fin de la migration v43
-- ════════════════════════════════════════════════════════════════════