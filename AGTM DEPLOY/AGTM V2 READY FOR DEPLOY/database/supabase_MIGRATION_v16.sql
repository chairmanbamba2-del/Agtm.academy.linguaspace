-- ════════════════════════════════════════════════════════════════════
-- AGTM Global Academy — Migration v16
-- Identification complète des candidats (test de placement + évals)
-- Colonnes : etablissement, telephone, appreciation
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- SAFE : ajouts uniquement — aucune donnée supprimée
-- ════════════════════════════════════════════════════════════════════

-- ── 1. soumissions_evaluations : identification candidat ─────────
ALTER TABLE soumissions_evaluations
  ADD COLUMN IF NOT EXISTS etablissement TEXT;

ALTER TABLE soumissions_evaluations
  ADD COLUMN IF NOT EXISTS telephone TEXT;

ALTER TABLE soumissions_evaluations
  ADD COLUMN IF NOT EXISTS appreciation TEXT;


-- ── 2. certificats_niveau : établissement & téléphone ────────────
ALTER TABLE certificats_niveau
  ADD COLUMN IF NOT EXISTS etablissement TEXT;

ALTER TABLE certificats_niveau
  ADD COLUMN IF NOT EXISTS telephone TEXT;


-- ── 3. RLS : garantir INSERT anonyme sur les deux tables ─────────
--    (idempotent — ne plante pas si la politique existe déjà)

-- soumissions_evaluations : INSERT anon
DO $$ BEGIN
  CREATE POLICY "soum_anon_insert" ON soumissions_evaluations
    FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- soumissions_evaluations : SELECT anon
DO $$ BEGIN
  CREATE POLICY "soum_anon_select" ON soumissions_evaluations
    FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- certificats_niveau : INSERT anon
DO $$ BEGIN
  CREATE POLICY "cert_anon_insert" ON certificats_niveau
    FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- certificats_niveau : SELECT anon
DO $$ BEGIN
  CREATE POLICY "cert_anon_select" ON certificats_niveau
    FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- evaluations : INSERT anon (résultats quiz public)
DO $$ BEGIN
  CREATE POLICY "evals_anon_insert" ON evaluations
    FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- evaluations : SELECT anon (lecture lien public)
DO $$ BEGIN
  CREATE POLICY "evals_anon_read" ON evaluations
    FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- quiz_questions : SELECT anon
DO $$ BEGIN
  CREATE POLICY "quiz_anon_read" ON quiz_questions
    FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 4. VÉRIFICATION ──────────────────────────────────────────────
SELECT
  t.table_name,
  c.column_name,
  c.data_type
FROM information_schema.tables t
JOIN information_schema.columns c
  ON c.table_name = t.table_name AND c.table_schema = t.table_schema
WHERE t.table_schema = 'public'
  AND t.table_name IN ('soumissions_evaluations','certificats_niveau')
  AND c.column_name IN ('etablissement','telephone','appreciation')
ORDER BY t.table_name, c.column_name;

-- Vérifier les politiques
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('soumissions_evaluations','certificats_niveau','evaluations','quiz_questions')
  AND 'anon' = ANY(roles)
ORDER BY tablename, cmd;
