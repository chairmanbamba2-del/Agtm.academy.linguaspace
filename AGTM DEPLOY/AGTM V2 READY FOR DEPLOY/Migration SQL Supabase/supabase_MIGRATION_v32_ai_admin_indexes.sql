-- ============================================================
--  MIGRATION v32 — Index de performance pour l'assistante IA
--  Objectif : accélérer les requêtes des outils admin de l'IA
--  Tables : rapports_seances, presences, devoirs, messages,
--           messages_etudiants, certificats_niveau
--  © 2026 AGTM Academy — Issa Bamba
-- ============================================================

-- ── 1. RAPPORTS_SEANCES ──────────────────────────────────────
-- Lecture par formateur (outil lire_rapports_seances)
CREATE INDEX IF NOT EXISTS idx_rapports_formateur_id
  ON rapports_seances (formateur_id);

-- Lecture par date (filtres chronologiques)
CREATE INDEX IF NOT EXISTS idx_rapports_date_seance
  ON rapports_seances (date_seance DESC);

-- ── 2. PRESENCES ─────────────────────────────────────────────
-- Jointure rapide seance_id → seances (pour lire_presences_absences)
CREATE INDEX IF NOT EXISTS idx_presences_seance_id
  ON presences (seance_id);

-- Lecture par étudiant
CREATE INDEX IF NOT EXISTS idx_presences_etudiant_id
  ON presences (etudiant_id);

-- ── 3. DEVOIRS ───────────────────────────────────────────────
-- Filtres par statut (outil lire_devoirs_soumis)
CREATE INDEX IF NOT EXISTS idx_devoirs_statut
  ON devoirs (statut);

-- Filtres par formateur nom (insensible à la casse)
CREATE INDEX IF NOT EXISTS idx_devoirs_formateur_nom
  ON devoirs (lower(formateur_nom));

-- Tri par date de création (tri par défaut)
CREATE INDEX IF NOT EXISTS idx_devoirs_created_at
  ON devoirs (created_at DESC);

-- ── 4. MESSAGES ──────────────────────────────────────────────
-- Boîte de réception (outil lire_messages_recus)
CREATE INDEX IF NOT EXISTS idx_messages_destinataire_user_id
  ON messages (destinataire_user_id, created_at DESC);

-- Messages non lus
CREATE INDEX IF NOT EXISTS idx_messages_lu
  ON messages (destinataire_user_id, lu);

-- ── 5. MESSAGES_ETUDIANTS ────────────────────────────────────
-- Messages reçus par étudiant
CREATE INDEX IF NOT EXISTS idx_messages_etudiants_etudiant_id
  ON messages_etudiants (etudiant_id, created_at DESC);

-- ── 6. CERTIFICATS_NIVEAU ────────────────────────────────────
-- Recherche par niveau (outil lire_certificats)
CREATE INDEX IF NOT EXISTS idx_certificats_niveau_obtenu
  ON certificats_niveau (niveau_obtenu);

-- Recherche par nom (insensible à la casse)
CREATE INDEX IF NOT EXISTS idx_certificats_nom
  ON certificats_niveau (upper(nom));

-- Tri par date
CREATE INDEX IF NOT EXISTS idx_certificats_date_test
  ON certificats_niveau (date_test DESC);

-- ── 7. SÉANCES — index pour le contexte école ────────────────
-- Chargement rapide du contexte semaine (utilisé par _aiFetchSchoolContext)
CREATE INDEX IF NOT EXISTS idx_seances_date_seance
  ON seances (date_seance);

-- ── 8. VÉRIFICATION ──────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'rapports_seances','presences','devoirs',
    'messages','messages_etudiants','certificats_niveau','seances'
  )
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
