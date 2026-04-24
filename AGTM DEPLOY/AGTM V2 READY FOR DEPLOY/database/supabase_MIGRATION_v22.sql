-- ============================================================
--  MIGRATION v22 — Boîte de messagerie unifiée
--  AGTM Digital Academy
--  Date : 2026-04-04
--
--  Crée une table `messages` pour les échanges entre tous
--  les rôles : admin ↔ formateur ↔ étudiant.
--  Les anciennes tables (messages_etudiants,
--  messages_envois_etudiant) sont conservées telles quelles
--  pour compatibilité avec le code existant.
-- ============================================================

-- ──────────────────────────────────────────────────────────
--  1. TABLE PRINCIPALE : messages
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id                   bigserial PRIMARY KEY,
  expediteur_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expediteur_nom       text NOT NULL DEFAULT '',
  expediteur_role      text NOT NULL DEFAULT 'etudiant',  -- 'admin' | 'formateur' | 'etudiant'
  destinataire_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  destinataire_nom     text NOT NULL DEFAULT '',
  destinataire_role    text NOT NULL DEFAULT 'admin',     -- 'admin' | 'formateur' | 'etudiant'
  -- lien optionnel vers un enregistrement étudiant (messages impliquant un étudiant)
  etudiant_id          bigint REFERENCES etudiants(id) ON DELETE SET NULL,
  sujet                text NOT NULL,
  contenu              text NOT NULL,
  lu                   boolean NOT NULL DEFAULT false,
  -- fil de discussion (réponse à un message)
  parent_id            bigint REFERENCES messages(id) ON DELETE SET NULL,
  fichier_url          text,
  fichier_nom          text,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- Index pour accélérer les requêtes par destinataire / expéditeur
CREATE INDEX IF NOT EXISTS idx_messages_dest   ON messages(destinataire_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_exped  ON messages(expediteur_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_etud   ON messages(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_id);

-- ──────────────────────────────────────────────────────────
--  2. RLS
-- ──────────────────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Un utilisateur voit les messages dont il est expéditeur OU destinataire
CREATE POLICY "msg_read_own"
  ON messages FOR SELECT
  TO authenticated
  USING (
    expediteur_user_id   = auth.uid()
    OR destinataire_user_id = auth.uid()
  );

-- L'admin voit tous les messages
CREATE POLICY "msg_admin_all"
  ON messages FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Tout utilisateur authentifié peut insérer (envoyer) un message
CREATE POLICY "msg_insert_auth"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = expediteur_user_id
  );

-- L'expéditeur peut supprimer ses propres messages
CREATE POLICY "msg_delete_own"
  ON messages FOR DELETE
  TO authenticated
  USING (
    expediteur_user_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Mise à jour du champ `lu` par le destinataire (ou l'admin)
CREATE POLICY "msg_update_lu"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    destinataire_user_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
--  3. Colonne `repondu` sur messages_envois_etudiant
--     (marquer qu'une réponse a été envoyée via messages_etudiants)
-- ──────────────────────────────────────────────────────────
ALTER TABLE messages_envois_etudiant
  ADD COLUMN IF NOT EXISTS repondu boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS repondu_at timestamptz,
  ADD COLUMN IF NOT EXISTS repondu_par text;

-- ──────────────────────────────────────────────────────────
--  4. Colonne `reponse_admin` sur messages_envois_etudiant
--     (stocker la réponse courte inline pour affichage étudiant)
-- ──────────────────────────────────────────────────────────
ALTER TABLE messages_envois_etudiant
  ADD COLUMN IF NOT EXISTS reponse_contenu text;
