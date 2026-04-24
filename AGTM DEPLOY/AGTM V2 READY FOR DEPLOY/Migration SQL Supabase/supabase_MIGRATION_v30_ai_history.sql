-- ============================================================
--  Migration v30 — Historique conversations Assistant IA
--  Table : ai_chat_sessions (métadonnées des sessions)
--  © 2026 AGTM Academy — Issa Bamba
-- ============================================================

-- ── Table ai_chat_sessions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  session_id  text PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL DEFAULT 'Nouvelle conversation',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur gère ses propres sessions
CREATE POLICY "ai_sessions_own" ON ai_chat_sessions
  FOR ALL TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Index ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_updated
  ON ai_chat_sessions (user_id, updated_at DESC);
