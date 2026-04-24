-- ════════════════════════════════════════════════════════════════════
-- AGTM Global Academy — Migration v17
-- Corrections et nouvelles fonctionnalités :
--   1. Classes : modification & suppression dans le dashboard
--   2. Apprenants RH : correction génération documents (Engagement, Identifiants, Emploi du temps)
--   3. Séances : champ lien_meet exposé + affichage copyable après création
--   4. Comptabilité : intégration automatique fiches_paie → dépenses "Salaires"
--   5. Dashboard : KPIs charges/salaires/solde net du mois
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- SAFE : ajouts uniquement — aucune donnée supprimée
-- ════════════════════════════════════════════════════════════════════

-- ── Note : lien_meet est déjà ajouté en v11 ─────────────────────────
-- Toutes les colonnes nécessaires existent déjà dans le schéma actuel.
-- Les modifications sont purement côté application (dashboard.html).

-- ── 1. S'assurer que seances.lien_meet existe ────────────────────────
ALTER TABLE seances
  ADD COLUMN IF NOT EXISTS lien_meet TEXT;

-- ── 2. Index sur fiches_paie.statut pour les requêtes du dashboard ──
CREATE INDEX IF NOT EXISTS idx_fiches_paie_statut ON fiches_paie(statut);
CREATE INDEX IF NOT EXISTS idx_fiches_paie_periode ON fiches_paie(periode);

-- ── 3. Index sur depenses.categorie pour le regroupement ────────────
CREATE INDEX IF NOT EXISTS idx_depenses_categorie ON depenses(categorie);
CREATE INDEX IF NOT EXISTS idx_depenses_date ON depenses(date_depense);

-- ── 4. Index sur depenses.justificatif pour la déduplication fiches_paie ──
CREATE INDEX IF NOT EXISTS idx_depenses_justificatif ON depenses(justificatif);

-- ── Vérification du résultat ────────────────────────────────────────
SELECT 'seances.lien_meet', data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='seances' AND column_name='lien_meet';

SELECT 'Indexes créés avec succès' AS status;
