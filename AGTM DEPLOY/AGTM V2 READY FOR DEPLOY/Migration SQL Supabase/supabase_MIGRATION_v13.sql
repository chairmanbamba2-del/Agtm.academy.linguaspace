-- ════════════════════════════════════════════════════════════════════
-- AGTM Global Academy — Migration v13
-- Colonnes manquantes : taux/séances RH (personnel + fiches_paie)
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- SAFE : ajouts uniquement — aucune donnée supprimée
-- ════════════════════════════════════════════════════════════════════

-- ── PERSONNEL : taux de facturation par séance ──────────────────────
--    Utilisé dans le module RH pour calculer le salaire des formateurs
--    sur la base du nombre de séances dispensées (pTaux dans le formulaire)
ALTER TABLE personnel
  ADD COLUMN IF NOT EXISTS taux_seance NUMERIC(10,2) DEFAULT 0;


-- ── FICHES_PAIE : rémunération à la séance ──────────────────────────
--    Trois colonnes pour le calcul du salaire variable des formateurs :
--    salaire_seances = nb_seances × taux_seance
ALTER TABLE fiches_paie
  ADD COLUMN IF NOT EXISTS nb_seances      INTEGER       DEFAULT 0;

ALTER TABLE fiches_paie
  ADD COLUMN IF NOT EXISTS taux_seance     NUMERIC(10,2) DEFAULT 0;

ALTER TABLE fiches_paie
  ADD COLUMN IF NOT EXISTS salaire_seances NUMERIC(10,2) DEFAULT 0;


-- ── VÉRIFICATION ─────────────────────────────────────────────────────
SELECT 'personnel.taux_seance'         AS colonne, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='personnel' AND column_name='taux_seance'
UNION ALL
SELECT 'fiches_paie.nb_seances'        , data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='fiches_paie' AND column_name='nb_seances'
UNION ALL
SELECT 'fiches_paie.taux_seance'       , data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='fiches_paie' AND column_name='taux_seance'
UNION ALL
SELECT 'fiches_paie.salaire_seances'   , data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='fiches_paie' AND column_name='salaire_seances'
ORDER BY colonne;
