-- ============================================================
--  MIGRATION v31 — Correction RLS rapports_seances
--  Problème : formateurs et DP ne voient pas les rapports soumis
--  Cause : policies SELECT manquantes pour formateur et DP
--  © 2026 AGTM Academy — Issa Bamba
-- ============================================================

-- ── 1. RAPPORTS_SEANCES : recréer toutes les policies ────────
DROP POLICY IF EXISTS "rapports_seances_admin_all"   ON rapports_seances;
DROP POLICY IF EXISTS "rapports_seances_fmt_own"     ON rapports_seances;
DROP POLICY IF EXISTS "rapports_seances_dir_read"    ON rapports_seances;
DROP POLICY IF EXISTS "rapports_fmt_insert"          ON rapports_seances;
DROP POLICY IF EXISTS "rapports_fmt_select"          ON rapports_seances;
DROP POLICY IF EXISTS "rapports_fmt_update"          ON rapports_seances;

-- Admin + secrétaire : accès total (lecture + écriture)
CREATE POLICY "rapports_seances_admin_all" ON rapports_seances
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- Formateur : lecture et écriture de SES PROPRES rapports
CREATE POLICY "rapports_seances_fmt_own" ON rapports_seances
  FOR ALL
  USING     (formateur_id = auth.uid())
  WITH CHECK(formateur_id = auth.uid());

-- Directeur pédagogique + sous-directeur : lecture de tous les rapports
CREATE POLICY "rapports_seances_dir_read" ON rapports_seances
  FOR SELECT
  USING     (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

-- ── 2. SEANCES : s'assurer que DP peut lire les séances ──────
--    (nécessaire pour la jointure PostgREST seances(...) dans les rapports)
DROP POLICY IF EXISTS "seances_dir_read" ON seances;

CREATE POLICY "seances_dir_read" ON seances
  FOR SELECT
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

-- Formateur : lecture de toutes les séances (nécessaire pour l'emploi du temps,
--             les rapports et l'affichage des statuts de validation)
DROP POLICY IF EXISTS "seances_fmt_own" ON seances;
DROP POLICY IF EXISTS "seances_fmt_read" ON seances;

CREATE POLICY "seances_fmt_read" ON seances
  FOR SELECT
  USING (public.urol() IN ('formateur'));

-- ── 3. VÉRIFICATION ──────────────────────────────────────────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('rapports_seances','seances')
ORDER BY tablename, policyname;
