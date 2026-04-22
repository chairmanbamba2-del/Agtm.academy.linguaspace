-- ============================================================
-- Performance indexes for Supabase
-- Optimizes frequent queries and maintenance operations
-- ============================================================

-- 1. Index for expiring subscriptions (used by expire_subscriptions function)
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON lingua_subscriptions(expires_at) WHERE status = 'active';

-- 2. Index for user analytics (sorting by creation date)
CREATE INDEX IF NOT EXISTS idx_users_created_at ON lingua_users(created_at);

-- 3. Index for progress streak calculations (last activity per user)
CREATE INDEX IF NOT EXISTS idx_progress_last_activity ON lingua_progress(last_activity_at) WHERE last_activity_at IS NOT NULL;

-- 4. Composite index for progress queries by user and language (already covered by UNIQUE constraint, but add for ordering)
CREATE INDEX IF NOT EXISTS idx_progress_user_lang_activity ON lingua_progress(user_id, language, last_activity_at DESC);

-- 5. Index for module progress completion tracking
CREATE INDEX IF NOT EXISTS idx_module_progress_completed_at ON lingua_module_progress(completed_at) WHERE completed_at IS NOT NULL;

-- 6. Index for AI sessions analytics (user and date queries)
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_date ON lingua_ai_sessions(user_id, created_at DESC);

-- 7. Index for content popularity (views, active content)
CREATE INDEX IF NOT EXISTS idx_content_views_active ON lingua_content(view_count DESC) WHERE is_active = TRUE;

-- 8. Index for content search by tags (using GIN index for array column)
CREATE INDEX IF NOT EXISTS idx_content_tags ON lingua_content USING GIN(tags);

-- 9. Index for module ordering (language, level, order_index)
-- Note: order_index column may not exist; check schema. If not, omit.
-- We'll first check if column exists, but we can create index conditionally.
-- Since we cannot dynamically check, we'll assume column exists (add if needed later).
-- CREATE INDEX IF NOT EXISTS idx_modules_order ON lingua_modules(language, level, order_index) WHERE is_published = TRUE;

-- 10. Index for subscription renewal (auto_renew and status)
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal ON lingua_subscriptions(auto_renew, status) WHERE auto_renew = TRUE AND status = 'active';

-- 11. Index for user language progress summary (xp_points ranking)
CREATE INDEX IF NOT EXISTS idx_progress_xp ON lingua_progress(language, xp_points DESC);

-- 12. Index for user streak leaderboard
CREATE INDEX IF NOT EXISTS idx_progress_streak ON lingua_progress(language, streak_days DESC) WHERE streak_days > 0;