-- ════════════════════════════════════════════════════════════════════
-- AGTM Global Academy — Migration v14
-- Accès public aux évaluations en ligne (apprenants sans compte)
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- SAFE : ajouts uniquement — aucune donnée supprimée
-- ════════════════════════════════════════════════════════════════════

-- ── 1. evaluations : INSERT anonyme (résultats quiz public) ─────────
--    Les apprenants sans compte peuvent soumettre leurs résultats
--    via un lien partageable (?eval_id=X)
DO $$ BEGIN
  CREATE POLICY "evals_anon_insert" ON evaluations
    FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 2. soumissions_evaluations : SELECT anonyme (consultation) ──────
--    Permet de vérifier si une soumission a déjà été faite
DO $$ BEGIN
  CREATE POLICY "soum_anon_select" ON soumissions_evaluations
    FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 3. quiz_questions : vérifier que la policy anon SELECT existe ────
DO $$ BEGIN
  CREATE POLICY "quiz_anon_read_v14" ON quiz_questions
    FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── VÉRIFICATION ─────────────────────────────────────────────────────
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('evaluations','soumissions_evaluations','quiz_questions')
  AND 'anon' = ANY(roles)
ORDER BY tablename, cmd;
