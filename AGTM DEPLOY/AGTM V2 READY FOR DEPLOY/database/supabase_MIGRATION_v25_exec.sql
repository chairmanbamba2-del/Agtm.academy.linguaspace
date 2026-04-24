-- ============================================================
--  MIGRATION v25 EXEC — Traçabilité évaluations + GED
--  Ajout colonnes formateur sur soumissions_evaluations
-- ============================================================

-- Colonnes formateur sur soumissions_evaluations (traçabilité)
ALTER TABLE soumissions_evaluations
  ADD COLUMN IF NOT EXISTS formateur_nom text,
  ADD COLUMN IF NOT EXISTS formateur_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_soumissions_fmt ON soumissions_evaluations(formateur_id);

-- VÉRIFICATION
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'soumissions_evaluations'
  AND column_name  IN ('formateur_nom','formateur_id')
ORDER BY column_name;
