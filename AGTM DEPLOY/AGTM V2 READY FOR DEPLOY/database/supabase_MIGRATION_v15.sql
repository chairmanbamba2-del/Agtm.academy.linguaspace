-- ════════════════════════════════════════════════════════════════════
-- AGTM Global Academy — Migration v15
-- Correction critique : colonnes manquantes dans evaluations
-- (titre, niveau, classe_id) — causaient l'erreur de génération de lien
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- SAFE : ajouts uniquement — aucune donnée supprimée
-- ════════════════════════════════════════════════════════════════════

-- ── evaluations : colonnes manquantes ───────────────────────────────
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS titre     TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS niveau    TEXT DEFAULT 'B1';
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS classe_id BIGINT;


-- ── VÉRIFICATION ─────────────────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='evaluations'
  AND column_name IN ('titre','niveau','classe_id')
ORDER BY column_name;
