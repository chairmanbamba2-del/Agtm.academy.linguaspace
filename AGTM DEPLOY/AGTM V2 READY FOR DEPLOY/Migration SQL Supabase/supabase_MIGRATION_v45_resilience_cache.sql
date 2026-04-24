-- ════════════════════════════════════════════════════════════════════
-- MIGRATION v45 — Optimisation Résilience & Cache de Secours
-- À exécuter dans Supabase SQL Editor
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- 
-- 📌 CRÉATION COMPLÈTE DES TABLES :
--    ✓ ec_api_cache              → Cache API YouTube/Listen Notes
--    ✓ ai_generated_content       → Contenu C2 & Business English
--    ✓ youtube_fallback_metadata  → Vidéos de secours locales
--    ✓ get_content_with_fallback()→ Fonction de fallback intelligent
--    ✓ cache_monitoring           → Vue de surveillance temps réel
-- ════════════════════════════════════════════════════════════════════

-- ── 0. CRÉATION DE LA TABLE ec_api_cache (SI NON EXISTANTE) ─────────────
CREATE TABLE IF NOT EXISTS ec_api_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    fallback_data JSONB,
    service TEXT NOT NULL DEFAULT 'youtube',
    query TEXT,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    last_success TIMESTAMPTZ,
    error_count INTEGER DEFAULT 0,
    fallback_used BOOLEAN DEFAULT FALSE
);

-- Index pour recherche rapide par service et statut
CREATE INDEX IF NOT EXISTS idx_ec_api_cache_key ON ec_api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ec_api_cache_service ON ec_api_cache(service);
CREATE INDEX IF NOT EXISTS idx_ec_api_cache_expires ON ec_api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ec_api_cache_service_status ON ec_api_cache(service, fallback_used, expires_at);

-- ── 1. AJOUT DES COLONNES (si la table existait déjà sans elles) ────────
DO $$
BEGIN
    BEGIN
        ALTER TABLE ec_api_cache ADD COLUMN IF NOT EXISTS fallback_data JSONB;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE ec_api_cache ADD COLUMN IF NOT EXISTS last_success TIMESTAMPTZ;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE ec_api_cache ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE ec_api_cache ADD COLUMN IF NOT EXISTS fallback_used BOOLEAN DEFAULT FALSE;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
END $$;

-- ── 2. TABLE DE CONTENU GÉNÉRÉ PAR IA (modules C2 et Business English) ──
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    level TEXT CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Business')),
    category TEXT CHECK (category IN ('grammar', 'vocabulary', 'business', 'exam_prep', 'conversation', 'writing')),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index pour recherche par niveau et catégorie
CREATE INDEX IF NOT EXISTS idx_ai_content_level_category ON ai_generated_content(level, category, status);
CREATE INDEX IF NOT EXISTS idx_ai_content_module_id ON ai_generated_content(module_id);

-- RLS : lecture publique pour contenu publié, écriture limitée
ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_content_select_published" ON ai_generated_content;
CREATE POLICY "ai_content_select_published" ON ai_generated_content
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "ai_content_all_admin" ON ai_generated_content;
CREATE POLICY "ai_content_all_admin" ON ai_generated_content
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'));

-- ── 3. TABLE DE FALLBACK YOUTUBE (métadonnées locales) ───────────────────
CREATE TABLE IF NOT EXISTS youtube_fallback_metadata (
    video_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    channel TEXT NOT NULL,
    level TEXT DEFAULT 'B1',
    category TEXT DEFAULT 'General',
    duration TEXT,
    description TEXT,
    thumb_url TEXT,
    playlist_ids TEXT[],
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'api', 'import'))
);

-- Insertion des 7 vidéos de secours (BBC, TED, Business English Pod, etc.)
INSERT INTO youtube_fallback_metadata (video_id, title, channel, level, category, description, thumb_url)
VALUES 
    -- BBC Learning English Essentials
    ('d8QYGXlV2N8', 'The Grammar Gameshow - Present Perfect', 'BBC Learning English', 'B1', 'Grammar', 'Learn about the present perfect with our famous grammar gameshow.', 'https://i.ytimg.com/vi/d8QYGXlV2N8/mqdefault.jpg'),
    ('PZPq0PqGJfI', '6 Minute English - Climate Change', 'BBC Learning English', 'B2', 'Listening', 'Improve your English vocabulary and listening with 6 Minute English.', 'https://i.ytimg.com/vi/PZPq0PqGJfI/mqdefault.jpg'),
    ('vVXhTl2TTWc', 'English at Work - Business Meetings', 'BBC Learning English', 'C1', 'Business', 'Learn essential phrases for business meetings and professional communication.', 'https://i.ytimg.com/vi/vVXhTl2TTWc/mqdefault.jpg'),
    
    -- Business English
    ('9I8X8Qk5-7w', 'How to Negotiate in English', 'Business English Pod', 'C1', 'Business', 'Master negotiation techniques and vocabulary in English.', 'https://i.ytimg.com/vi/9I8X8Qk5-7w/mqdefault.jpg'),
    ('mH4K4Z8mB8E', 'Presentations in English - Structure', 'TED Talks', 'C1', 'Business', 'Learn how to structure effective presentations in English.', 'https://i.ytimg.com/vi/mH4K4Z8mB8E/mqdefault.jpg'),
    
    -- C2 Level Content
    ('rS2eCn5KQqo', 'Advanced English Idioms - Business Context', 'Advanced English', 'C2', 'Vocabulary', 'Learn advanced idioms used in professional business contexts.', 'https://i.ytimg.com/vi/rS2eCn5KQqo/mqdefault.jpg'),
    ('k5zG5l2q7Vc', 'Academic Writing - Complex Sentences', 'Academic English', 'C2', 'Writing', 'Master complex sentence structures for academic writing.', 'https://i.ytimg.com/vi/k5zG5l2q7Vc/mqdefault.jpg')
ON CONFLICT (video_id) DO UPDATE SET
    title = EXCLUDED.title,
    last_updated = NOW();

-- ── 4. FONCTION POUR RÉCUPÉRER CONTENU AVEC FALLBACK ─────────────────────
CREATE OR REPLACE FUNCTION get_content_with_fallback(
    p_service TEXT,
    p_query TEXT DEFAULT NULL,
    p_force_refresh BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cache_key TEXT;
    v_cache_record RECORD;
    v_fallback_data JSONB;
    v_result JSONB;
BEGIN
    -- Générer la clé de cache
    v_cache_key := p_service || '_' || COALESCE(p_query, 'default');
    
    -- Chercher dans le cache
    SELECT * INTO v_cache_record 
    FROM ec_api_cache 
    WHERE cache_key = v_cache_key;
    
    -- Si cache valide et pas de force refresh
    IF v_cache_record.id IS NOT NULL 
       AND v_cache_record.expires_at > NOW() 
       AND NOT p_force_refresh 
       AND v_cache_record.error_count < 3 THEN
       
        -- Retourner données cache (priorité aux données normales, sinon fallback)
        IF v_cache_record.fallback_used THEN
            RETURN COALESCE(v_cache_record.fallback_data, v_cache_record.data);
        ELSE
            RETURN v_cache_record.data;
        END IF;
    END IF;
    
    -- Si pas de cache ou expiré, retourner fallback si disponible
    IF v_cache_record.id IS NOT NULL AND v_cache_record.fallback_data IS NOT NULL THEN
        -- Marquer que le fallback est utilisé
        UPDATE ec_api_cache 
        SET fallback_used = TRUE,
            error_count = error_count + 1,
            last_success = CASE WHEN error_count < 3 THEN NOW() ELSE last_success END
        WHERE cache_key = v_cache_key;
        
        RETURN v_cache_record.fallback_data;
    END IF;
    
    -- Fallback générique selon le service
    CASE p_service
        WHEN 'youtube' THEN
            v_fallback_data := jsonb_build_object(
                'videos', (
                    SELECT jsonb_agg(jsonb_build_object(
                        'id', video_id,
                        'title', title,
                        'channel', channel,
                        'level', level,
                        'cat', category,
                        'duration', COALESCE(duration, '10:00'),
                        'thumb', thumb_url,
                        'emoji', CASE category 
                            WHEN 'Grammar' THEN '📝'
                            WHEN 'Business' THEN '💼'
                            WHEN 'Listening' THEN '👂'
                            ELSE '🎬'
                        END
                    ))
                    FROM youtube_fallback_metadata
                    LIMIT 20
                ),
                'total', (SELECT COUNT(*) FROM youtube_fallback_metadata),
                'page', 1,
                'limit', 20,
                'fallback', true,
                'message', 'Using fallback data - API may be unavailable'
            );
        WHEN 'listenotes' THEN
            v_fallback_data := jsonb_build_object(
                'podcasts', jsonb_build_array(
                    jsonb_build_object(
                        'title', '6 Minute English - BBC',
                        'description', 'Learn and practise useful English language for everyday situations.',
                        'audio', 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english/ep-240925',
                        'duration', '6:00',
                        'level', 'B1',
                        'source', 'BBC'
                    ),
                    jsonb_build_object(
                        'title', 'Business English Pod',
                        'description', 'Learn business English for meetings, presentations, negotiations, and more.',
                        'audio', 'https://traffic.libsyn.com/businessenglishpod/BEP-001-sample.mp3',
                        'duration', '15:00',
                        'level', 'C1',
                        'source', 'Business English Pod'
                    )
                ),
                'fallback', true
            );
        ELSE
            v_fallback_data := jsonb_build_object(
                'error', 'Service not available',
                'fallback', true,
                'timestamp', NOW()
            );
    END CASE;
    
    -- Mettre à jour ou insérer dans le cache
    IF v_cache_record.id IS NULL THEN
        INSERT INTO ec_api_cache (cache_key, data, service, query, fallback_data, fallback_used, error_count, expires_at)
        VALUES (v_cache_key, '{}'::jsonb, p_service, p_query, v_fallback_data, TRUE, 1, NOW() + INTERVAL '24 hours');
    ELSE
        UPDATE ec_api_cache 
        SET fallback_data = v_fallback_data,
            fallback_used = TRUE,
            error_count = error_count + 1,
            cached_at = NOW(),
            expires_at = NOW() + INTERVAL '24 hours'
        WHERE cache_key = v_cache_key;
    END IF;
    
    RETURN v_fallback_data;
END;
$$;

-- ── 5. VUE POUR SURVEILLANCE DU CACHE ──────────────────────────────────
CREATE OR REPLACE VIEW cache_monitoring AS
SELECT 
    service,
    COUNT(*)::int as total_entries,
    COUNT(*) FILTER (WHERE fallback_used)::int as fallback_used_count,
    COUNT(*) FILTER (WHERE expires_at < NOW())::int as expired_count,
    COALESCE(AVG(error_count)::numeric(10,2), 0) as avg_errors,
    MIN(cached_at) as oldest_entry,
    MAX(cached_at) as newest_entry
FROM ec_api_cache
GROUP BY service
ORDER BY total_entries DESC;

COMMENT ON VIEW cache_monitoring IS 'Surveillance en temps réel du cache API — utilisé par le dashboard d''administration';

-- ── 6. FONCTION TRIGGER POUR updated_at ────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer et recréer le trigger pour éviter les doublons
DROP TRIGGER IF EXISTS update_ai_content_updated_at ON ai_generated_content;
CREATE TRIGGER update_ai_content_updated_at
    BEFORE UPDATE ON ai_generated_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ── 7. INSERTION DE CONTENU C2 & BUSINESS ENGLISH ─────────────────────
INSERT INTO ai_generated_content (module_id, title, content, level, category, status)
VALUES 
    ('c2-advanced-idioms', 'Advanced Business Idioms', 
     '{"objectives": ["Master 20+ advanced business idioms", "Understand contextual usage", "Apply in professional scenarios"], "sections": [{"title": "Idioms for Success", "content": "Hit the ground running, Move the needle, Raise the bar"}, {"title": "Idioms for Challenges", "content": "Ball is in your court, Think outside the box, Go back to the drawing board"}], "quiz": [{"type": "mcq", "question": "What does ''move the needle'' mean?", "options": ["Make significant progress", "Measure something precisely", "Avoid difficult tasks", "Follow standard procedures"], "correct": 0}]}'::jsonb,
     'C2', 'vocabulary', 'published'),
     
    ('c2-academic-writing', 'Complex Sentence Structures', 
     '{"objectives": ["Construct complex sentences", "Use subordinate clauses effectively", "Vary sentence length for impact"], "sections": [{"title": "Subordinate Clauses", "content": "Although, Despite, Whereas, Provided that"}, {"title": "Parallel Structure", "content": "Not only... but also, Either... or, Both... and"}], "quiz": [{"type": "mcq", "question": "Which conjunction introduces a contrast?", "options": ["Although", "Because", "Since", "While"], "correct": 0}]}'::jsonb,
     'C2', 'writing', 'published'),
     
    ('business-negotiation', 'Advanced Negotiation Techniques', 
     '{"objectives": ["Master negotiation vocabulary", "Apply BATNA principles", "Handle objections professionally"], "sections": [{"title": "Key Phrases", "content": "What if we were to..., How about we..., I propose that..."}, {"title": "Strategy", "content": "Anchoring, Framing, Concession trading"}], "quiz": [{"type": "mcq", "question": "What does BATNA stand for?", "options": ["Best Alternative To a Negotiated Agreement", "Business Agreement Terms and Negotiation Act", "Basic Approach To Negotiation Analysis", "Best Available Trade Negotiation Asset"], "correct": 0}]}'::jsonb,
     'Business', 'business', 'published')
ON CONFLICT (module_id) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- ── 8. VÉRIFICATION FINALE ─────────────────────────────────────────────
-- Ces requêtes affichent un résumé de ce qui a été créé/inséré
-- Elles n'affectent pas la base de données

-- Vérifier les tables créées
SELECT '✅ Migration v45 exécutée avec succès' as status;

-- Afficher le monitoring du cache
SELECT * FROM cache_monitoring;

-- Afficher le contenu AI par niveau
SELECT level, COUNT(*)::int as count, 
       STRING_AGG(module_id, ', ') as modules
FROM ai_generated_content 
WHERE status = 'published'
GROUP BY level
ORDER BY CASE level 
    WHEN 'A1' THEN 1 WHEN 'A2' THEN 2 WHEN 'B1' THEN 3 
    WHEN 'B2' THEN 4 WHEN 'C1' THEN 5 WHEN 'C2' THEN 6 
    WHEN 'Business' THEN 7 ELSE 8 END;

-- Afficher les vidéos de secours
SELECT COUNT(*)::int as total_videos, 
       STRING_AGG(DISTINCT level, ', ') as levels_available
FROM youtube_fallback_metadata;

-- ════════════════════════════════════════════════════════════════════
-- Fin de la migration v45
-- © 2026 AGTM Academy — Issa Bamba. Tous droits réservés.
-- ════════════════════════════════════════════════════════════════════