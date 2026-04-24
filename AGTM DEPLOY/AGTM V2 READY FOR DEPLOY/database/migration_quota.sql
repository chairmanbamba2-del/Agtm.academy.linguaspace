-- ═══════════════════════════════════════════════════════════════════
--  MIGRATION AGTM ACADEMY — Système de suivi du quota de séances
--  À coller dans : Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- ── TABLE : etudiants ────────────────────────────────────────────
ALTER TABLE etudiants
  ADD COLUMN IF NOT EXISTS quota_seances       INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS frequence_semaine   INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS date_debut_contrat  DATE,
  ADD COLUMN IF NOT EXISTS date_fin_contrat    DATE;

COMMENT ON COLUMN etudiants.quota_seances      IS 'Nombre total de séances prévues dans le contrat de formation';
COMMENT ON COLUMN etudiants.frequence_semaine  IS 'Nombre de séances par semaine selon le contrat (1, 2 ou 3)';
COMMENT ON COLUMN etudiants.date_debut_contrat IS 'Date de début du contrat de formation';
COMMENT ON COLUMN etudiants.date_fin_contrat   IS 'Date de fin estimée du contrat de formation';

-- ── TABLE : classes ──────────────────────────────────────────────
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS quota_seances      INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS frequence_semaine  INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS date_fin_contrat   DATE;

COMMENT ON COLUMN classes.quota_seances     IS 'Quota de séances par défaut pour les étudiants de cette classe';
COMMENT ON COLUMN classes.frequence_semaine IS 'Fréquence hebdomadaire des séances de la classe';
COMMENT ON COLUMN classes.date_fin_contrat  IS 'Date de fin estimée du programme de la classe';

-- ── TABLE : presences ────────────────────────────────────────────
ALTER TABLE presences
  ADD COLUMN IF NOT EXISTS motif_absence    TEXT,
  ADD COLUMN IF NOT EXISTS justifie         BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN presences.motif_absence IS 'Motif de l''absence (obligatoire pour rattrapages)';
COMMENT ON COLUMN presences.justifie      IS 'TRUE si l''absence est justifiée (éligible au rattrapage)';

-- ── Vérification finale ──────────────────────────────────────────
SELECT 'etudiants' AS table_name,
       column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'etudiants'
  AND column_name IN ('quota_seances','frequence_semaine','date_debut_contrat','date_fin_contrat')

UNION ALL

SELECT 'classes' AS table_name,
       column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'classes'
  AND column_name IN ('quota_seances','frequence_semaine','date_fin_contrat')

UNION ALL

SELECT 'presences' AS table_name,
       column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'presences'
  AND column_name IN ('motif_absence','justifie')

ORDER BY table_name, column_name;

-- ── TABLE : seances — Ajout champ salle ─────────────────────────
ALTER TABLE seances
  ADD COLUMN IF NOT EXISTS salle TEXT;

COMMENT ON COLUMN seances.salle IS 'Salle ou local physique (pour la détection de conflits de salle)';

-- ── Vérification ─────────────────────────────────────────────────
SELECT 'seances' AS table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'seances'
  AND column_name = 'salle';
