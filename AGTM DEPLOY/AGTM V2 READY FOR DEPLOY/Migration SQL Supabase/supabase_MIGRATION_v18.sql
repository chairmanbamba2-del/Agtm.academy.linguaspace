-- ════════════════════════════════════════════════════════════════════
-- AGTM Global Academy — Migration v18
-- Nouvelles fonctionnalités :
--   1. Table satisfactions — évaluations apprenants après chaque séance
--   2. Colonnes supplémentaires fiches_paie (cotisations, heures_sup)
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- SAFE : ajouts uniquement — aucune donnée supprimée
-- ════════════════════════════════════════════════════════════════════

-- ── 1. TABLE SATISFACTIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS satisfactions (
  id            BIGSERIAL PRIMARY KEY,
  seance_id     BIGINT REFERENCES seances(id) ON DELETE SET NULL,
  etudiant_id   BIGINT REFERENCES etudiants(id) ON DELETE SET NULL,
  note          SMALLINT NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire   TEXT,
  seance_sujet  TEXT,
  etudiant_nom  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_satisfactions_seance ON satisfactions(seance_id);
CREATE INDEX IF NOT EXISTS idx_satisfactions_etudiant ON satisfactions(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_satisfactions_note ON satisfactions(note);

-- RLS
ALTER TABLE satisfactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "sat_auth_all" ON satisfactions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "sat_anon_insert" ON satisfactions
    FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "sat_anon_select" ON satisfactions
    FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 2. FICHES_PAIE : colonnes supplémentaires ────────────────────────
ALTER TABLE fiches_paie
  ADD COLUMN IF NOT EXISTS cotisations NUMERIC DEFAULT 0;

ALTER TABLE fiches_paie
  ADD COLUMN IF NOT EXISTS heures_sup  NUMERIC DEFAULT 0;


-- ── 3. INDEX sur fiches_paie pour les jointures ──────────────────────
CREATE INDEX IF NOT EXISTS idx_fiches_paie_personnel ON fiches_paie(personnel_id);


-- ── VÉRIFICATION ──────────────────────────────────────────────────────
SELECT 'satisfactions' AS table_name, COUNT(*) AS nb_lignes FROM satisfactions;

SELECT
  column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'satisfactions'
ORDER BY ordinal_position;
