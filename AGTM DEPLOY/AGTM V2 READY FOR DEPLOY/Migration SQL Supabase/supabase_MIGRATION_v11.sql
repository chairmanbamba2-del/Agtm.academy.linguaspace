-- ════════════════════════════════════════════════════════════════════
-- AGTM Global Academy — Migration v11
-- Corrections critiques : FK classes→personnel, colonnes manquantes
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- SAFE : aucune donnée existante supprimée — colonnes ajoutées uniquement
-- ════════════════════════════════════════════════════════════════════


-- ── 1. CLASSES : ajouter personnel_id → FK vers personnel ───────────────
--    classes.formateur_id référence auth.users (UUID) et ne peut pas
--    servir de join PostgREST vers personnel (BIGINT).
--    On ajoute personnel_id BIGINT pour la liaison directe.
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS personnel_id BIGINT REFERENCES personnel(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_classes_personnel_id ON classes(personnel_id);


-- ── 2. SÉANCES : ajouter lien_meet ──────────────────────────────────────
--    Utilisé dans le tableau de bord pour les liens Google Meet.
ALTER TABLE seances
  ADD COLUMN IF NOT EXISTS lien_meet TEXT;


-- ── 3. INSCRIPTIONS WEB : colonnes utilisées dans renderFormulaireInscription ─
ALTER TABLE inscriptions_web
  ADD COLUMN IF NOT EXISTS date_naissance DATE;

ALTER TABLE inscriptions_web
  ADD COLUMN IF NOT EXISTS objectifs TEXT;

ALTER TABLE inscriptions_web
  ADD COLUMN IF NOT EXISTS niveau_actuel TEXT;


-- ── 4. SOUMISSIONS ÉVALUATIONS : lien vers l'évaluation source ──────────
--    Permet de savoir quelle évaluation un étudiant a déjà soumise.
ALTER TABLE soumissions_evaluations
  ADD COLUMN IF NOT EXISTS evaluation_id BIGINT REFERENCES evaluations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_soumissions_evaluation_id ON soumissions_evaluations(evaluation_id);


-- ── 5. POLICIES anon pour inscriptions_web ──────────────────────────────
--    Le formulaire public est anonyme.
DO $$ BEGIN
  CREATE POLICY "inscriptions_web_anon_insert" ON inscriptions_web
    FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "inscriptions_web_auth_all" ON inscriptions_web
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 6. POLICIES anon pour devoirs ────────────────────────────────────────
--    Les étudiants non connectés peuvent soumettre un devoir.
DO $$ BEGIN
  CREATE POLICY "devoirs_anon_insert" ON devoirs
    FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 7. POLICIES anon pour soumissions_evaluations ────────────────────────
--    Déjà créées dans COMPLET.sql mais on s'assure de leur existence.
DO $$ BEGIN
  CREATE POLICY "soum_anon_insert" ON soumissions_evaluations
    FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 8. CLASSES : policy pour lecture anon (dropdown formateurs) ─────────
DO $$ BEGIN
  CREATE POLICY "classes_anon_read" ON classes
    FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── VÉRIFICATION ─────────────────────────────────────────────────────────
SELECT 'classes.personnel_id'          AS col, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='classes'                AND column_name='personnel_id'
UNION ALL
SELECT 'seances.lien_meet'             , data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='seances'                AND column_name='lien_meet'
UNION ALL
SELECT 'inscriptions_web.date_naissance', data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='inscriptions_web'        AND column_name='date_naissance'
UNION ALL
SELECT 'inscriptions_web.objectifs'    , data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='inscriptions_web'        AND column_name='objectifs'
UNION ALL
SELECT 'inscriptions_web.niveau_actuel', data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='inscriptions_web'        AND column_name='niveau_actuel'
UNION ALL
SELECT 'soumissions_evaluations.evaluation_id', data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='soumissions_evaluations' AND column_name='evaluation_id'
ORDER BY col;
