-- ════════════════════════════════════════════════════════════════════
-- MIGRATION v42 — Liaison formateur_id dans séances
-- À exécuter dans Supabase SQL Editor
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- ════════════════════════════════════════════════════════════════════

-- ── 1. COLONNE FORMATEUR_ID (clé étrangère vers personnel) ─────────────
ALTER TABLE seances ADD COLUMN IF NOT EXISTS formateur_id BIGINT REFERENCES personnel(id) ON DELETE SET NULL;

-- ── 2. METTRE À JOUR LES SÉANCES EXISTANTES ────────────────────────────
-- Associer les séances aux formateurs dont le nom correspond (approximatif)
UPDATE seances s
SET formateur_id = p.id
FROM personnel p
WHERE (
  s.enseignant ILIKE '%' || p.prenom || '%' OR
  s.enseignant ILIKE '%' || p.nom || '%' OR
  (p.prenom || ' ' || p.nom) ILIKE '%' || s.enseignant || '%'
)
AND (p.poste ILIKE '%formateur%' OR p.poste ILIKE '%enseignant%');

-- ── 3. VÉRIFICATION ──────────────────────────────────────────────────
SELECT 
  s.id,
  s.date_seance,
  s.enseignant,
  s.formateur_id,
  p.prenom,
  p.nom,
  p.poste
FROM seances s
LEFT JOIN personnel p ON s.formateur_id = p.id
ORDER BY s.date_seance DESC
LIMIT 10;

-- ════════════════════════════════════════════════════════════════════
-- Fin de la migration v42
-- ════════════════════════════════════════════════════════════════════