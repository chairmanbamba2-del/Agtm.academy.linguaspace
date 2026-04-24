-- ════════════════════════════════════════════════════════════════════
-- MIGRATION v41 — Améliorations séances : modalité, durée, pointage soumis
-- À exécuter dans Supabase SQL Editor
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- ════════════════════════════════════════════════════════════════════

-- ── 1. COLONNES SÉANCES : modalité, durée, pointage_soumis_le ─────────
ALTER TABLE seances ADD COLUMN IF NOT EXISTS modalite TEXT DEFAULT 'presentiel';
ALTER TABLE seances ADD COLUMN IF NOT EXISTS duree INTEGER;
ALTER TABLE seances ADD COLUMN IF NOT EXISTS pointage_soumis_le TIMESTAMPTZ;

-- Mettre à jour la valeur par défaut du statut (nouveaux enregistrements)
ALTER TABLE seances ALTER COLUMN statut SET DEFAULT 'Planifiée';

-- ── 2. VÉRIFICATION ──────────────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'seances'
  AND column_name  IN ('modalite','duree','pointage_soumis_le')
ORDER BY column_name;

-- ════════════════════════════════════════════════════════════════════
-- Fin de la migration v41
-- ════════════════════════════════════════════════════════════════════