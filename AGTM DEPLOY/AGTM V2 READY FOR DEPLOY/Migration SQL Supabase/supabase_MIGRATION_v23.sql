-- ============================================================
--  MIGRATION v23 — Direction Pédagogique & Primauté Administrative
--  AGTM Digital Academy
--  Date : 2026-04-11
--
--  1. Colonnes de visa sur seances, evaluations, presences
--  2. Nouveaux rôles : directeur_pedagogique, sous_directeur_pedagogique
--  3. Politiques RLS pour la Direction Pédagogique (CRUD total)
--  4. Verrouillage formateur dès qu'une donnée est visée
-- ============================================================

-- ──────────────────────────────────────────────────────────
--  1. COLONNES DE VISA (verrou direction pédagogique)
-- ──────────────────────────────────────────────────────────

-- TABLE seances
ALTER TABLE seances
  ADD COLUMN IF NOT EXISTS vise_par_direction boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visa_par           text,       -- nom du directeur/sous-directeur
  ADD COLUMN IF NOT EXISTS visa_par_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visa_at            timestamptz;

-- TABLE evaluations
ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS vise_par_direction boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visa_par           text,
  ADD COLUMN IF NOT EXISTS visa_par_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visa_at            timestamptz;

-- TABLE presences
ALTER TABLE presences
  ADD COLUMN IF NOT EXISTS vise_par_direction boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visa_par           text,
  ADD COLUMN IF NOT EXISTS visa_par_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visa_at            timestamptz;

-- Index pour filtrage rapide des données visées
CREATE INDEX IF NOT EXISTS idx_seances_vise    ON seances(vise_par_direction);
CREATE INDEX IF NOT EXISTS idx_evaluations_vise ON evaluations(vise_par_direction);
CREATE INDEX IF NOT EXISTS idx_presences_vise  ON presences(vise_par_direction);

-- ──────────────────────────────────────────────────────────
--  2. MISE À JOUR DE LA TABLE UTILISATEURS
--     Ajouter les nouveaux rôles sans casser la contrainte
-- ──────────────────────────────────────────────────────────

-- Suppression de l'ancienne contrainte de rôle si elle existe
ALTER TABLE utilisateurs DROP CONSTRAINT IF EXISTS utilisateurs_role_check;

-- Nouvelle contrainte élargie incluant les rôles pédagogiques
ALTER TABLE utilisateurs ADD CONSTRAINT utilisateurs_role_check
  CHECK (role IN (
    'admin',
    'formateur',
    'etudiant',
    'secretaire',
    'investisseur',
    'directeur_pedagogique',
    'sous_directeur_pedagogique'
  ));

-- ──────────────────────────────────────────────────────────
--  3. HELPER : mise à jour de auth.user_role()
--     (conserve la logique existante, ajoute les nouveaux rôles)
-- ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata'  ->> 'role'),
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role'),
    'anon'
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper booléen : est-ce un rôle de direction pédagogique ?
CREATE OR REPLACE FUNCTION auth.is_direction_ped()
RETURNS boolean AS $$
  SELECT auth.user_role() IN ('directeur_pedagogique','sous_directeur_pedagogique')
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ──────────────────────────────────────────────────────────
--  4. POLITIQUES RLS — TABLE utilisateurs
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "utilisateurs_direction_ped" ON utilisateurs;

CREATE POLICY "utilisateurs_direction_ped" ON utilisateurs
  FOR SELECT
  USING (auth.is_direction_ped());

-- ──────────────────────────────────────────────────────────
--  5. POLITIQUES RLS — TABLE etudiants
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "etudiants_direction_ped" ON etudiants;

-- Direction pédagogique : CRUD total
CREATE POLICY "etudiants_direction_ped" ON etudiants
  FOR ALL
  USING (auth.is_direction_ped())
  WITH CHECK (auth.is_direction_ped());

-- ──────────────────────────────────────────────────────────
--  6. POLITIQUES RLS — TABLE classes
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "classes_direction_ped" ON classes;
DROP POLICY IF EXISTS "classes_admin_all"     ON classes;

-- Admin/Secrétaire
CREATE POLICY "classes_admin_all" ON classes
  FOR ALL
  USING (auth.user_role() IN ('admin','secretaire'));

-- Direction Pédagogique
CREATE POLICY "classes_direction_ped" ON classes
  FOR ALL
  USING (auth.is_direction_ped())
  WITH CHECK (auth.is_direction_ped());

-- Formateur : lecture seule de ses propres classes
DROP POLICY IF EXISTS "classes_formateur_read" ON classes;
CREATE POLICY "classes_formateur_read" ON classes
  FOR SELECT
  USING (
    auth.user_role() = 'formateur'
    AND personnel_id IN (SELECT id FROM personnel WHERE email = auth.email())
  );

-- Etudiant : lecture des classes auxquelles il est inscrit
DROP POLICY IF EXISTS "classes_etudiant_read" ON classes;
CREATE POLICY "classes_etudiant_read" ON classes
  FOR SELECT
  USING (
    auth.user_role() = 'etudiant'
    AND id IN (
      SELECT ic.classe_id FROM inscriptions_classes ic
      JOIN etudiants e ON e.id = ic.etudiant_id
      WHERE e.email = auth.email()
    )
  );

-- ──────────────────────────────────────────────────────────
--  7. POLITIQUES RLS — TABLE seances
--     VERROU : formateur ne peut plus modifier une séance visée
-- ──────────────────────────────────────────────────────────

-- Supprimer anciennes politiques formateur
DROP POLICY IF EXISTS "seances_formateur_own"    ON seances;
DROP POLICY IF EXISTS "seances_direction_ped"    ON seances;
DROP POLICY IF EXISTS "seances_formateur_select" ON seances;
DROP POLICY IF EXISTS "seances_formateur_insert" ON seances;
DROP POLICY IF EXISTS "seances_formateur_update" ON seances;
DROP POLICY IF EXISTS "seances_formateur_delete" ON seances;

-- Direction Pédagogique : CRUD total (inclus poser/retirer le visa)
CREATE POLICY "seances_direction_ped" ON seances
  FOR ALL
  USING (auth.is_direction_ped())
  WITH CHECK (auth.is_direction_ped());

-- Formateur : lecture de ses séances (même si visées)
CREATE POLICY "seances_formateur_select" ON seances
  FOR SELECT
  USING (
    auth.user_role() = 'formateur'
    AND enseignant IN (
      SELECT prenom || ' ' || nom FROM personnel WHERE email = auth.email()
    )
  );

-- Formateur : création d'une nouvelle séance (non visée par défaut)
CREATE POLICY "seances_formateur_insert" ON seances
  FOR INSERT
  WITH CHECK (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
  );

-- Formateur : modification UNIQUEMENT si la séance n'est PAS visée
CREATE POLICY "seances_formateur_update" ON seances
  FOR UPDATE
  USING (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
    AND enseignant IN (
      SELECT prenom || ' ' || nom FROM personnel WHERE email = auth.email()
    )
  )
  WITH CHECK (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
  );

-- Formateur : suppression UNIQUEMENT si la séance n'est PAS visée
CREATE POLICY "seances_formateur_delete" ON seances
  FOR DELETE
  USING (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
    AND enseignant IN (
      SELECT prenom || ' ' || nom FROM personnel WHERE email = auth.email()
    )
  );

-- ──────────────────────────────────────────────────────────
--  8. POLITIQUES RLS — TABLE evaluations
--     VERROU : formateur bloqué si visée
-- ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "eval_formateur_own"    ON evaluations;
DROP POLICY IF EXISTS "eval_direction_ped"    ON evaluations;
DROP POLICY IF EXISTS "eval_formateur_select" ON evaluations;
DROP POLICY IF EXISTS "eval_formateur_insert" ON evaluations;
DROP POLICY IF EXISTS "eval_formateur_update" ON evaluations;
DROP POLICY IF EXISTS "eval_formateur_delete" ON evaluations;

-- Direction Pédagogique : CRUD total
CREATE POLICY "eval_direction_ped" ON evaluations
  FOR ALL
  USING (auth.is_direction_ped())
  WITH CHECK (auth.is_direction_ped());

-- Formateur : lecture de toutes ses évaluations
CREATE POLICY "eval_formateur_select" ON evaluations
  FOR SELECT
  USING (auth.user_role() = 'formateur');

-- Formateur : création (non visée par défaut)
CREATE POLICY "eval_formateur_insert" ON evaluations
  FOR INSERT
  WITH CHECK (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
  );

-- Formateur : modification seulement si non visée
CREATE POLICY "eval_formateur_update" ON evaluations
  FOR UPDATE
  USING (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
  )
  WITH CHECK (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
  );

-- Formateur : suppression seulement si non visée
CREATE POLICY "eval_formateur_delete" ON evaluations
  FOR DELETE
  USING (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
  );

-- ──────────────────────────────────────────────────────────
--  9. POLITIQUES RLS — TABLE presences
-- ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "presences_direction_ped"    ON presences;
DROP POLICY IF EXISTS "presences_formateur_read"   ON presences;
DROP POLICY IF EXISTS "presences_formateur_all"    ON presences;
DROP POLICY IF EXISTS "presences_formateur_insert" ON presences;
DROP POLICY IF EXISTS "presences_formateur_update" ON presences;
DROP POLICY IF EXISTS "presences_formateur_delete" ON presences;

-- Direction Pédagogique : CRUD total
CREATE POLICY "presences_direction_ped" ON presences
  FOR ALL
  USING (auth.is_direction_ped())
  WITH CHECK (auth.is_direction_ped());

-- Formateur : lecture libre
CREATE POLICY "presences_formateur_read" ON presences
  FOR SELECT
  USING (auth.user_role() = 'formateur');

-- Formateur : insertion (non visée)
CREATE POLICY "presences_formateur_insert" ON presences
  FOR INSERT
  WITH CHECK (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
  );

-- Formateur : modification seulement si non visée
CREATE POLICY "presences_formateur_update" ON presences
  FOR UPDATE
  USING (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
  )
  WITH CHECK (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
  );

-- Formateur : suppression seulement si non visée
CREATE POLICY "presences_formateur_delete" ON presences
  FOR DELETE
  USING (
    auth.user_role() = 'formateur'
    AND vise_par_direction = false
  );

-- ──────────────────────────────────────────────────────────
-- 10. POLITIQUES RLS — TABLE personnel
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "personnel_direction_ped" ON personnel;

-- Direction Pédagogique : CRUD total (gestion formateurs)
CREATE POLICY "personnel_direction_ped" ON personnel
  FOR ALL
  USING (auth.is_direction_ped())
  WITH CHECK (auth.is_direction_ped());

-- ──────────────────────────────────────────────────────────
-- 11. POLITIQUES RLS — TABLE inscriptions_classes
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "insc_direction_ped" ON inscriptions_classes;

CREATE POLICY "insc_direction_ped" ON inscriptions_classes
  FOR ALL
  USING (auth.is_direction_ped())
  WITH CHECK (auth.is_direction_ped());

-- ──────────────────────────────────────────────────────────
-- 12. POLITIQUES RLS — TABLE devoirs
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "devoirs_direction_ped" ON devoirs;

CREATE POLICY "devoirs_direction_ped" ON devoirs
  FOR ALL
  USING (auth.is_direction_ped())
  WITH CHECK (auth.is_direction_ped());

-- ──────────────────────────────────────────────────────────
-- 13. POLITIQUES RLS — TABLE satisfaction_seances
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "sat_direction_ped" ON satisfaction_seances;

CREATE POLICY "sat_direction_ped" ON satisfaction_seances
  FOR ALL
  USING (auth.is_direction_ped())
  WITH CHECK (auth.is_direction_ped());

-- ──────────────────────────────────────────────────────────
-- 14. POLITIQUES RLS — TABLE messages
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "msg_direction_ped" ON messages;

-- Direction Pédagogique : accès complet messagerie pédagogique
CREATE POLICY "msg_direction_ped" ON messages
  FOR ALL
  USING (auth.is_direction_ped())
  WITH CHECK (auth.is_direction_ped());

-- ──────────────────────────────────────────────────────────
-- 15. FONCTION DE VISA — pose/retrait du visa direction
-- ──────────────────────────────────────────────────────────

-- Poser un visa sur une séance
CREATE OR REPLACE FUNCTION fn_viser_seance(
  p_seance_id   bigint,
  p_visa_par    text,
  p_user_id     uuid
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT auth.is_direction_ped() THEN
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

-- Retirer un visa d'une séance
CREATE OR REPLACE FUNCTION fn_retirer_visa_seance(p_seance_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT auth.is_direction_ped() THEN
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

-- Poser un visa sur une évaluation
CREATE OR REPLACE FUNCTION fn_viser_evaluation(
  p_eval_id  bigint,
  p_visa_par text,
  p_user_id  uuid
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT auth.is_direction_ped() THEN
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

-- Retirer un visa d'une évaluation
CREATE OR REPLACE FUNCTION fn_retirer_visa_evaluation(p_eval_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT auth.is_direction_ped() THEN
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

-- ──────────────────────────────────────────────────────────
-- 16. VÉRIFICATION FINALE
-- ──────────────────────────────────────────────────────────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname LIKE '%direction_ped%'
ORDER BY tablename, policyname;
