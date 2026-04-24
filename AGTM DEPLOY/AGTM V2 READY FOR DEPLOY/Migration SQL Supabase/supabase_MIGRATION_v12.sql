-- ════════════════════════════════════════════════════════════════════
-- AGTM Global Academy — Migration v12
-- Liaison Séances ↔ Activités Pédagogiques, Évaluations enrichies,
-- Certificats de Niveau, Questions standardisées
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- SAFE : aucune donnée supprimée — ajouts uniquement
-- ════════════════════════════════════════════════════════════════════


-- ── 1. SÉANCES : liaison aux modules pédagogiques ──────────────────
ALTER TABLE seances ADD COLUMN IF NOT EXISTS module_id   TEXT;   -- ex: 'gram_a1_m1'
ALTER TABLE seances ADD COLUMN IF NOT EXISTS chapitre    TEXT;   -- titre du module
ALTER TABLE seances ADD COLUMN IF NOT EXISTS categorie   TEXT;   -- grammaire|vocabulaire|business|bepc|bac|toeic


-- ── 2. ÉVALUATIONS : colonnes manquantes (dual-use : notes + config) ─
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS module_id    TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS categorie    TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS type         TEXT;            -- QCM | Rédaction | Oral | Mixte (pour _apCreateEval)
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS date_limite  TIMESTAMPTZ;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS enseignant_id UUID;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS etudiant_nom TEXT;            -- déjà dans COMPLET mais sûr

-- Compatibilité 'classe_id' (BIGINT dans COMPLET.sql, TEXT dans _apCreateEval)
-- On utilise classe_id TEXT si BIGINT déjà absent
DO $$ BEGIN
  ALTER TABLE evaluations ADD COLUMN classe_nom TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;


-- ── 3. SOUMISSIONS ÉVALUATIONS : module + étudiant ─────────────────
ALTER TABLE soumissions_evaluations ADD COLUMN IF NOT EXISTS module_id    TEXT;
ALTER TABLE soumissions_evaluations ADD COLUMN IF NOT EXISTS etudiant_id  BIGINT REFERENCES etudiants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_soum_module_id    ON soumissions_evaluations(module_id);
CREATE INDEX IF NOT EXISTS idx_soum_etudiant_id  ON soumissions_evaluations(etudiant_id);


-- ── 4. QUIZ_QUESTIONS : standardisation reponse / pilier ───────────
-- Certaines migrations utilisent 'reponse', d'autres 'reponse_correcte'
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS reponse_correcte TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS pilier            TEXT DEFAULT 'Grammaire';

-- Synchroniser reponse_correcte ← reponse pour les enregistrements existants
UPDATE quiz_questions
SET reponse_correcte = reponse
WHERE reponse_correcte IS NULL AND reponse IS NOT NULL;


-- ── 5. RAPPORTS_COACHING : standardisation contenu ─────────────────
-- La v6 utilise 'contenu_complet', le dashboard utilise 'contenu'
ALTER TABLE rapports_coaching ADD COLUMN IF NOT EXISTS contenu TEXT;

UPDATE rapports_coaching
SET contenu = contenu_complet
WHERE contenu IS NULL AND contenu_complet IS NOT NULL;


-- ── 6. TABLE : CERTIFICATS DE NIVEAU ──────────────────────────────
CREATE TABLE IF NOT EXISTS certificats_niveau (
    id               BIGSERIAL PRIMARY KEY,
    nom              TEXT NOT NULL,
    prenom           TEXT NOT NULL,
    email            TEXT,
    niveau_obtenu    TEXT NOT NULL,   -- A1 | A2 | B1 | B2 | C1 | C2
    score            NUMERIC(5,2),
    score_max        NUMERIC(5,2) DEFAULT 20,
    nb_bonnes        INTEGER,
    nb_questions     INTEGER DEFAULT 20,
    code_certificat  TEXT UNIQUE,
    date_test        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE certificats_niveau ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "cert_anon_insert" ON certificats_niveau FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cert_auth_all" ON certificats_niveau FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_cert_niveau ON certificats_niveau(niveau_obtenu);
CREATE INDEX IF NOT EXISTS idx_cert_code   ON certificats_niveau(code_certificat);


-- ── 7. POLICIES manquantes ─────────────────────────────────────────
-- soumissions_evaluations : lecture authentifiée
DO $$ BEGIN
  CREATE POLICY "soum_auth_read" ON soumissions_evaluations FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- evaluations : anon lecture (lien public de l'évaluation)
DO $$ BEGIN
  CREATE POLICY "evals_anon_read" ON evaluations FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- quiz_questions : anon SELECT (déjà dans v6, mais idempotent)
DO $$ BEGIN
  CREATE POLICY "quiz_anon_read" ON quiz_questions FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 8. INDEX utilitaires ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_seances_module_id       ON seances(module_id);
CREATE INDEX IF NOT EXISTS idx_seances_classe_categorie ON seances(classe_id, categorie);
CREATE INDEX IF NOT EXISTS idx_evaluations_module_id    ON evaluations(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_niveau_pilier       ON quiz_questions(niveau, pilier);


-- ── VÉRIFICATION ──────────────────────────────────────────────────
SELECT 'seances.module_id'            AS colonne, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='seances'                    AND column_name='module_id'
UNION ALL
SELECT 'seances.chapitre'             , data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='seances'                    AND column_name='chapitre'
UNION ALL
SELECT 'evaluations.module_id'        , data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='evaluations'                AND column_name='module_id'
UNION ALL
SELECT 'soumissions.module_id'        , data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='soumissions_evaluations'    AND column_name='module_id'
UNION ALL
SELECT 'quiz_questions.reponse_correcte', data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='quiz_questions'            AND column_name='reponse_correcte'
UNION ALL
SELECT 'certificats_niveau (table)'   , 'EXISTS'   FROM information_schema.tables   WHERE table_schema='public' AND table_name='certificats_niveau'
ORDER BY colonne;
