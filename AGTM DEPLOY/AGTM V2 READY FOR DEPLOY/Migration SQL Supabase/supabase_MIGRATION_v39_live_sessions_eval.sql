-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION v39 — Live Sessions : identification, accès, évaluations
-- À exécuter dans Supabase SQL Editor
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Sessions Live Class ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,
  formateur_id  UUID,
  formateur_nom TEXT,
  video_id      TEXT,
  titre         TEXT DEFAULT 'Classe Virtuelle',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  ended_at      TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "live_sessions_select" ON public.live_sessions;
DROP POLICY IF EXISTS "live_sessions_insert" ON public.live_sessions;
DROP POLICY IF EXISTS "live_sessions_update" ON public.live_sessions;

CREATE POLICY "live_sessions_select" ON public.live_sessions
  FOR SELECT USING (true);

CREATE POLICY "live_sessions_insert" ON public.live_sessions
  FOR INSERT WITH CHECK (
    public.urol() IN ('admin','formateur','secretaire','directeur_pedagogique','sous_directeur_pedagogique')
  );

CREATE POLICY "live_sessions_update" ON public.live_sessions
  FOR UPDATE USING (
    public.urol() IN ('admin','formateur','secretaire','directeur_pedagogique','sous_directeur_pedagogique')
  );

-- ── 2. Participants d'une session Live ────────────────────────────
CREATE TABLE IF NOT EXISTS public.live_participants (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code   TEXT NOT NULL,
  user_id        UUID,
  etudiant_id    BIGINT,
  numero_dossier TEXT,
  nom            TEXT,
  prenom         TEXT,
  joined_at      TIMESTAMPTZ DEFAULT NOW(),
  left_at        TIMESTAMPTZ
);

ALTER TABLE public.live_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "live_participants_select" ON public.live_participants;
DROP POLICY IF EXISTS "live_participants_insert" ON public.live_participants;
DROP POLICY IF EXISTS "live_participants_update" ON public.live_participants;

CREATE POLICY "live_participants_select" ON public.live_participants
  FOR SELECT USING (
    public.urol() IN ('admin','formateur','secretaire','directeur_pedagogique','sous_directeur_pedagogique')
    OR auth.uid() = user_id
  );

CREATE POLICY "live_participants_insert" ON public.live_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "live_participants_update" ON public.live_participants
  FOR UPDATE USING (
    auth.uid() = user_id
    OR public.urol() IN ('admin','formateur','secretaire','directeur_pedagogique','sous_directeur_pedagogique')
  );

-- ── 3. Évaluations Live (synchro avec table evaluations) ─────────
CREATE TABLE IF NOT EXISTS public.live_evaluations (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code   TEXT NOT NULL,
  etudiant_id    BIGINT,
  user_id        UUID,
  nom_etudiant   TEXT,
  formateur_id   UUID,
  formateur_nom  TEXT,
  sujet          TEXT NOT NULL,
  theme          TEXT,
  score          NUMERIC(5,2),
  score_max      NUMERIC(5,2) DEFAULT 20,
  commentaire    TEXT,
  appreciation   TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  synced_to_eval BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.live_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "live_evaluations_select" ON public.live_evaluations;
DROP POLICY IF EXISTS "live_evaluations_insert" ON public.live_evaluations;

CREATE POLICY "live_evaluations_select" ON public.live_evaluations
  FOR SELECT USING (
    public.urol() IN ('admin','formateur','secretaire','directeur_pedagogique','sous_directeur_pedagogique')
    OR auth.uid() = user_id
  );

CREATE POLICY "live_evaluations_insert" ON public.live_evaluations
  FOR INSERT WITH CHECK (
    public.urol() IN ('admin','formateur','secretaire','directeur_pedagogique','sous_directeur_pedagogique')
  );

-- ── 4. Fonction : obtenir les infos apprenant par user_id ─────────
-- (liaison utilisateurs ↔ etudiants via email)
CREATE OR REPLACE FUNCTION public.get_live_student_info(p_user_id UUID)
RETURNS TABLE(
  etudiant_id    BIGINT,
  numero_dossier TEXT,
  nom            TEXT,
  prenom         TEXT,
  email          TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT e.id, e.numero_dossier, e.nom, e.prenom, e.email
  FROM public.etudiants e
  JOIN public.utilisateurs u ON lower(u.email) = lower(e.email)
  WHERE u.id = p_user_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_live_student_info TO anon, authenticated;

-- ── 5. Fonction : enregistrer un participant ─────────────────────
CREATE OR REPLACE FUNCTION public.register_live_participant(
  p_session_code TEXT,
  p_user_id      UUID,
  p_nom          TEXT,
  p_prenom       TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id             UUID;
  v_etudiant_id    BIGINT;
  v_numero_dossier TEXT;
BEGIN
  SELECT e.id, e.numero_dossier
  INTO   v_etudiant_id, v_numero_dossier
  FROM   public.etudiants e
  JOIN   public.utilisateurs u ON lower(u.email) = lower(e.email)
  WHERE  u.id = p_user_id
  LIMIT  1;

  INSERT INTO public.live_participants (
    session_code, user_id, etudiant_id, numero_dossier, nom, prenom
  ) VALUES (
    p_session_code, p_user_id, v_etudiant_id, v_numero_dossier, p_nom, p_prenom
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_live_participant TO anon, authenticated;

-- ── 6. Fonction : sauvegarder une évaluation live ─────────────────
CREATE OR REPLACE FUNCTION public.save_live_evaluation(
  p_session_code  TEXT,
  p_etudiant_id   BIGINT,
  p_user_id       UUID,
  p_nom_etudiant  TEXT,
  p_formateur_nom TEXT,
  p_sujet         TEXT,
  p_theme         TEXT,
  p_score         NUMERIC,
  p_score_max     NUMERIC,
  p_commentaire   TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id           UUID;
  v_appreciation TEXT;
BEGIN
  -- Appréciation automatique
  v_appreciation := CASE
    WHEN p_score_max > 0 AND (p_score / p_score_max) >= 0.8 THEN 'Très Bien'
    WHEN p_score_max > 0 AND (p_score / p_score_max) >= 0.6 THEN 'Bien'
    WHEN p_score_max > 0 AND (p_score / p_score_max) >= 0.5 THEN 'Passable'
    ELSE 'Insuffisant'
  END;

  -- Insérer dans live_evaluations
  INSERT INTO public.live_evaluations (
    session_code, etudiant_id, user_id, nom_etudiant,
    formateur_nom, sujet, theme,
    score, score_max, commentaire, appreciation, synced_to_eval
  ) VALUES (
    p_session_code, p_etudiant_id, p_user_id, p_nom_etudiant,
    p_formateur_nom, p_sujet, p_theme,
    p_score, p_score_max, p_commentaire, v_appreciation, TRUE
  )
  RETURNING id INTO v_id;

  -- Synchroniser dans la table evaluations principale (si etudiant connu)
  IF p_etudiant_id IS NOT NULL THEN
    INSERT INTO public.evaluations (
      etudiant_id, etudiant_nom, type_eval, matiere,
      chapitre, note, note_max, appreciation,
      formateur_nom, commentaire, date_eval
    ) VALUES (
      p_etudiant_id,
      p_nom_etudiant,
      'Classe Virtuelle',
      'English Corner',
      p_sujet || COALESCE(' — ' || NULLIF(p_theme, ''), ''),
      p_score,
      p_score_max,
      v_appreciation,
      p_formateur_nom,
      p_commentaire,
      CURRENT_DATE
    );
  END IF;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_live_evaluation TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- Fin de la migration v39
-- ═══════════════════════════════════════════════════════════════════
