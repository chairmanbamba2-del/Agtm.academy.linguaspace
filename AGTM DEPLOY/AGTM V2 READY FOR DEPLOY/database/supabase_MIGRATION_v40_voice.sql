-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION v40 — Voice Interactions : log STT/TTS et prononciation
-- À exécuter dans Supabase SQL Editor
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Table voice_interactions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.voice_interactions (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                UUID,
  session_id             TEXT,
  stt_method             TEXT,          -- 'webspeech' | 'whisper'
  language               TEXT,          -- 'en-US' | 'fr-FR'
  transcription          TEXT,
  sent_to_ai             BOOLEAN DEFAULT FALSE,
  pronunciation_expected TEXT,          -- phrase cible (si exercice prononciation)
  pronunciation_score    NUMERIC(5,2),  -- 0–100
  tts_used               BOOLEAN DEFAULT FALSE,
  duration_ms            INTEGER,       -- durée de la session vocale
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.voice_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "voice_interactions_select" ON public.voice_interactions;
DROP POLICY IF EXISTS "voice_interactions_insert" ON public.voice_interactions;

-- Chaque utilisateur voit ses propres interactions ; admins voient tout
CREATE POLICY "voice_interactions_select" ON public.voice_interactions
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.urol() IN ('admin','directeur_pedagogique','sous_directeur_pedagogique')
  );

-- N'importe quel utilisateur authentifié peut insérer ses propres logs
CREATE POLICY "voice_interactions_insert" ON public.voice_interactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR user_id IS NULL  -- logs anonymes (non connectés)
  );

-- ── 2. Index sur user_id et created_at (performance tableaux de bord) ──
CREATE INDEX IF NOT EXISTS voice_interactions_user_id_idx
  ON public.voice_interactions (user_id);

CREATE INDEX IF NOT EXISTS voice_interactions_created_at_idx
  ON public.voice_interactions (created_at DESC);

-- ── 3. Vue analytics : stats vocales par utilisateur ──────────────
CREATE OR REPLACE VIEW public.voice_stats_by_user AS
SELECT
  user_id,
  COUNT(*)                                          AS total_interactions,
  COUNT(*) FILTER (WHERE sent_to_ai)                AS questions_envoyees,
  COUNT(*) FILTER (WHERE tts_used)                  AS reponses_ecoutees,
  COUNT(*) FILTER (WHERE stt_method = 'whisper')    AS via_whisper,
  COUNT(*) FILTER (WHERE stt_method = 'webspeech')  AS via_webspeech,
  ROUND(AVG(pronunciation_score) FILTER (WHERE pronunciation_score IS NOT NULL), 1) AS score_prononciation_moyen,
  ROUND(AVG(duration_ms)::NUMERIC / 1000, 1)        AS duree_moy_secondes,
  MAX(created_at)                                   AS derniere_interaction
FROM public.voice_interactions
GROUP BY user_id;

GRANT SELECT ON public.voice_stats_by_user TO authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- Fin de la migration v40
-- ═══════════════════════════════════════════════════════════════════
