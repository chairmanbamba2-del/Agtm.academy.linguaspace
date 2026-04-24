-- ============================================================
--  MIGRATION v23 EXEC — Direction Pédagogique
--  Stratégie : helper public.urol() au lieu de auth.user_role()
--              pour compatibilité avec la Management API
-- ============================================================

-- ── Helper de rôle dans le schéma public ─────────────────────
CREATE OR REPLACE FUNCTION public.urol()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata'  ->> 'role',
    current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role',
    current_setting('request.jwt.claims', true)::jsonb ->> 'role',
    'anon'
  )
$$;

-- ── 1. COLONNES DE VISA ──────────────────────────────────────
ALTER TABLE seances
  ADD COLUMN IF NOT EXISTS vise_par_direction boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visa_par           text,
  ADD COLUMN IF NOT EXISTS visa_par_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visa_at            timestamptz;

ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS vise_par_direction boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visa_par           text,
  ADD COLUMN IF NOT EXISTS visa_par_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visa_at            timestamptz;

ALTER TABLE presences
  ADD COLUMN IF NOT EXISTS vise_par_direction boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visa_par           text,
  ADD COLUMN IF NOT EXISTS visa_par_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visa_at            timestamptz;

CREATE INDEX IF NOT EXISTS idx_seances_vise     ON seances(vise_par_direction);
CREATE INDEX IF NOT EXISTS idx_evaluations_vise ON evaluations(vise_par_direction);
CREATE INDEX IF NOT EXISTS idx_presences_vise   ON presences(vise_par_direction);

-- ── 2. NOUVEAUX RÔLES ────────────────────────────────────────
ALTER TABLE utilisateurs DROP CONSTRAINT IF EXISTS utilisateurs_role_check;

ALTER TABLE utilisateurs ADD CONSTRAINT utilisateurs_role_check
  CHECK (role IN (
    'admin','formateur','etudiant','secretaire','investisseur',
    'directeur_pedagogique','sous_directeur_pedagogique'
  ));

-- ── 3. RLS — utilisateurs ────────────────────────────────────
DROP POLICY IF EXISTS "utilisateurs_direction_ped" ON utilisateurs;
CREATE POLICY "utilisateurs_direction_ped" ON utilisateurs
  FOR SELECT
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

-- ── 4. RLS — etudiants ───────────────────────────────────────
DROP POLICY IF EXISTS "etudiants_direction_ped" ON etudiants;
CREATE POLICY "etudiants_direction_ped" ON etudiants
  FOR ALL
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

-- ── 5. RLS — classes ─────────────────────────────────────────
DROP POLICY IF EXISTS "classes_direction_ped" ON classes;
DROP POLICY IF EXISTS "classes_admin_all"     ON classes;

CREATE POLICY "classes_admin_all" ON classes
  FOR ALL
  USING (public.urol() IN ('admin','secretaire'));

CREATE POLICY "classes_direction_ped" ON classes
  FOR ALL
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

DROP POLICY IF EXISTS "classes_formateur_read" ON classes;
CREATE POLICY "classes_formateur_read" ON classes
  FOR SELECT
  USING (
    public.urol() = 'formateur'
    AND personnel_id IN (SELECT id FROM personnel WHERE email = auth.email())
  );

DROP POLICY IF EXISTS "classes_etudiant_read" ON classes;
CREATE POLICY "classes_etudiant_read" ON classes
  FOR SELECT
  USING (
    public.urol() = 'etudiant'
    AND id IN (
      SELECT ic.classe_id FROM inscriptions_classes ic
      JOIN etudiants e ON e.id = ic.etudiant_id
      WHERE e.email = auth.email()
    )
  );

-- ── 6. RLS — seances ─────────────────────────────────────────
DROP POLICY IF EXISTS "seances_formateur_own"    ON seances;
DROP POLICY IF EXISTS "seances_direction_ped"    ON seances;
DROP POLICY IF EXISTS "seances_formateur_select" ON seances;
DROP POLICY IF EXISTS "seances_formateur_insert" ON seances;
DROP POLICY IF EXISTS "seances_formateur_update" ON seances;
DROP POLICY IF EXISTS "seances_formateur_delete" ON seances;

CREATE POLICY "seances_direction_ped" ON seances
  FOR ALL
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

CREATE POLICY "seances_formateur_select" ON seances
  FOR SELECT
  USING (
    public.urol() = 'formateur'
    AND enseignant IN (
      SELECT prenom || ' ' || nom FROM personnel WHERE email = auth.email()
    )
  );

CREATE POLICY "seances_formateur_insert" ON seances
  FOR INSERT
  WITH CHECK (
    public.urol() = 'formateur'
    AND vise_par_direction = false
  );

CREATE POLICY "seances_formateur_update" ON seances
  FOR UPDATE
  USING (
    public.urol() = 'formateur'
    AND vise_par_direction = false
    AND enseignant IN (
      SELECT prenom || ' ' || nom FROM personnel WHERE email = auth.email()
    )
  )
  WITH CHECK (
    public.urol() = 'formateur'
    AND vise_par_direction = false
  );

CREATE POLICY "seances_formateur_delete" ON seances
  FOR DELETE
  USING (
    public.urol() = 'formateur'
    AND vise_par_direction = false
    AND enseignant IN (
      SELECT prenom || ' ' || nom FROM personnel WHERE email = auth.email()
    )
  );

-- ── 7. RLS — evaluations ──────────────────────────────────────
DROP POLICY IF EXISTS "eval_formateur_own"    ON evaluations;
DROP POLICY IF EXISTS "eval_direction_ped"    ON evaluations;
DROP POLICY IF EXISTS "eval_formateur_select" ON evaluations;
DROP POLICY IF EXISTS "eval_formateur_insert" ON evaluations;
DROP POLICY IF EXISTS "eval_formateur_update" ON evaluations;
DROP POLICY IF EXISTS "eval_formateur_delete" ON evaluations;

CREATE POLICY "eval_direction_ped" ON evaluations
  FOR ALL
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

CREATE POLICY "eval_formateur_select" ON evaluations
  FOR SELECT
  USING (public.urol() = 'formateur');

CREATE POLICY "eval_formateur_insert" ON evaluations
  FOR INSERT
  WITH CHECK (public.urol() = 'formateur' AND vise_par_direction = false);

CREATE POLICY "eval_formateur_update" ON evaluations
  FOR UPDATE
  USING (public.urol() = 'formateur' AND vise_par_direction = false)
  WITH CHECK (public.urol() = 'formateur' AND vise_par_direction = false);

CREATE POLICY "eval_formateur_delete" ON evaluations
  FOR DELETE
  USING (public.urol() = 'formateur' AND vise_par_direction = false);

-- ── 8. RLS — presences ────────────────────────────────────────
DROP POLICY IF EXISTS "presences_direction_ped"    ON presences;
DROP POLICY IF EXISTS "presences_formateur_read"   ON presences;
DROP POLICY IF EXISTS "presences_formateur_all"    ON presences;
DROP POLICY IF EXISTS "presences_formateur_insert" ON presences;
DROP POLICY IF EXISTS "presences_formateur_update" ON presences;
DROP POLICY IF EXISTS "presences_formateur_delete" ON presences;

CREATE POLICY "presences_direction_ped" ON presences
  FOR ALL
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

CREATE POLICY "presences_formateur_read" ON presences
  FOR SELECT
  USING (public.urol() = 'formateur');

CREATE POLICY "presences_formateur_insert" ON presences
  FOR INSERT
  WITH CHECK (public.urol() = 'formateur' AND vise_par_direction = false);

CREATE POLICY "presences_formateur_update" ON presences
  FOR UPDATE
  USING (public.urol() = 'formateur' AND vise_par_direction = false)
  WITH CHECK (public.urol() = 'formateur' AND vise_par_direction = false);

CREATE POLICY "presences_formateur_delete" ON presences
  FOR DELETE
  USING (public.urol() = 'formateur' AND vise_par_direction = false);

-- ── 9. RLS — personnel ────────────────────────────────────────
DROP POLICY IF EXISTS "personnel_direction_ped" ON personnel;
CREATE POLICY "personnel_direction_ped" ON personnel
  FOR ALL
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

-- ── 10. RLS — inscriptions_classes ───────────────────────────
DROP POLICY IF EXISTS "insc_direction_ped" ON inscriptions_classes;
CREATE POLICY "insc_direction_ped" ON inscriptions_classes
  FOR ALL
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

-- ── 11. RLS — devoirs ─────────────────────────────────────────
DROP POLICY IF EXISTS "devoirs_direction_ped" ON devoirs;
CREATE POLICY "devoirs_direction_ped" ON devoirs
  FOR ALL
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

-- ── 12. RLS — satisfactions ───────────────────────────────────
DROP POLICY IF EXISTS "sat_direction_ped" ON satisfactions;
CREATE POLICY "sat_direction_ped" ON satisfactions
  FOR ALL
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

-- ── 13. RLS — messages ────────────────────────────────────────
DROP POLICY IF EXISTS "msg_direction_ped" ON messages;
CREATE POLICY "msg_direction_ped" ON messages
  FOR ALL
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

-- ── 14. FONCTIONS DE VISA ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_viser_seance(
  p_seance_id   bigint,
  p_visa_par    text,
  p_user_id     uuid
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF public.urol() NOT IN ('directeur_pedagogique','sous_directeur_pedagogique','admin') THEN
    RAISE EXCEPTION 'Accès refusé : réservé à la Direction Pédagogique';
  END IF;
  UPDATE seances SET
    vise_par_direction = true,
    visa_par           = p_visa_par,
    visa_par_user_id   = p_user_id,
    visa_at            = now()
  WHERE id = p_seance_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_retirer_visa_seance(p_seance_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF public.urol() NOT IN ('directeur_pedagogique','sous_directeur_pedagogique','admin') THEN
    RAISE EXCEPTION 'Accès refusé : réservé à la Direction Pédagogique';
  END IF;
  UPDATE seances SET
    vise_par_direction = false,
    visa_par           = null,
    visa_par_user_id   = null,
    visa_at            = null
  WHERE id = p_seance_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_viser_evaluation(
  p_eval_id  bigint,
  p_visa_par text,
  p_user_id  uuid
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF public.urol() NOT IN ('directeur_pedagogique','sous_directeur_pedagogique','admin') THEN
    RAISE EXCEPTION 'Accès refusé : réservé à la Direction Pédagogique';
  END IF;
  UPDATE evaluations SET
    vise_par_direction = true,
    visa_par           = p_visa_par,
    visa_par_user_id   = p_user_id,
    visa_at            = now()
  WHERE id = p_eval_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_retirer_visa_evaluation(p_eval_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF public.urol() NOT IN ('directeur_pedagogique','sous_directeur_pedagogique','admin') THEN
    RAISE EXCEPTION 'Accès refusé : réservé à la Direction Pédagogique';
  END IF;
  UPDATE evaluations SET
    vise_par_direction = false,
    visa_par           = null,
    visa_par_user_id   = null,
    visa_at            = null
  WHERE id = p_eval_id;
END;
$$;

-- ── VÉRIFICATION ─────────────────────────────────────────────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname LIKE '%direction_ped%'
ORDER BY tablename, policyname;
