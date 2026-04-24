-- ════════════════════════════════════════════════════════════════════
-- AGTM GLOBAL ACADEMY — MIGRATION v9
-- Colonnes manquantes sur la table seances
-- SAFE : aucune donnée existante supprimée
-- ════════════════════════════════════════════════════════════════════

-- Colonne module (thème / chapitre de la séance)
ALTER TABLE seances ADD COLUMN IF NOT EXISTS module TEXT;

-- Colonne titre (alias de sujet, parfois utilisé dans l'UI)
ALTER TABLE seances ADD COLUMN IF NOT EXISTS titre TEXT;

-- Colonne classe_id (référence à la classe)
ALTER TABLE seances ADD COLUMN IF NOT EXISTS classe_id BIGINT REFERENCES classes(id) ON DELETE SET NULL;

-- ── VÉRIFICATION ─────────────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'seances'
ORDER BY ordinal_position;
