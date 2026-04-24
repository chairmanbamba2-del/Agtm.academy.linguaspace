-- ============================================================
-- Migration : Messagerie bidirectionnelle + Rôles admin custom
-- ============================================================

-- 1. Table des messages
CREATE TABLE IF NOT EXISTS lingua_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject     TEXT DEFAULT '',
  body        TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lingua_messages ENABLE ROW LEVEL SECURITY;

-- Un utilisateur voit ses propres messages (envoyés ou reçus)
CREATE POLICY "messages_select_own" ON lingua_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
    OR check_user_is_admin()
  );

CREATE POLICY "messages_insert_own" ON lingua_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Les admins peuvent voir et supprimer tous les messages
CREATE POLICY "messages_delete_admin" ON lingua_messages
  FOR DELETE USING (check_user_is_admin());

-- Index pour les conversations
CREATE INDEX IF NOT EXISTS idx_messages_sender   ON lingua_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON lingua_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created  ON lingua_messages(created_at DESC);

-- 2. Table des rôles admin personnalisés
CREATE TABLE IF NOT EXISTS lingua_admin_roles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  permissions JSONB DEFAULT '[]'::jsonb, -- ex: ["users.read", "users.write", "finance.read", "marketing", "certifications", "messaging", "ai_permissions", "docs"]
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lingua_admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_roles_select" ON lingua_admin_roles
  FOR SELECT USING (check_user_is_admin());

CREATE POLICY "admin_roles_insert" ON lingua_admin_roles
  FOR INSERT WITH CHECK (check_user_is_admin());

CREATE POLICY "admin_roles_update" ON lingua_admin_roles
  FOR UPDATE USING (check_user_is_admin());

CREATE POLICY "admin_roles_delete" ON lingua_admin_roles
  FOR DELETE USING (check_user_is_admin());

-- Ajouter 'super_admin' par défaut
INSERT INTO lingua_admin_roles (name, description, permissions)
VALUES ('super_admin', 'Accès complet à toutes les fonctionnalités', 
  '["users.read","users.write","finance.read","finance.write","marketing","certifications","messaging","ai_permissions","docs","admin_roles"]')
ON CONFLICT (name) DO NOTHING;

INSERT INTO lingua_admin_roles (name, description, permissions)
VALUES ('support', 'Support utilisateur et messagerie',
  '["users.read","messaging","certifications.read"]')
ON CONFLICT (name) DO NOTHING;

INSERT INTO lingua_admin_roles (name, description, permissions)
VALUES ('finance_admin', 'Gestion financière uniquement',
  '["finance.read","finance.write","users.read"]')
ON CONFLICT (name) DO NOTHING;

-- 3. Ajouter une colonne admin_role_id à lingua_users
ALTER TABLE lingua_users 
  ADD COLUMN IF NOT EXISTS admin_role_id UUID REFERENCES lingua_admin_roles(id);

-- 4. Vue des conversations (dernier message par paire)
CREATE OR REPLACE VIEW lingua_conversations AS
SELECT DISTINCT ON (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
  m.id,
  m.sender_id,
  m.receiver_id,
  m.subject,
  m.body,
  m.read_at,
  m.created_at,
  CASE WHEN m.read_at IS NULL AND m.receiver_id = auth.uid() THEN true ELSE false END AS unread
FROM lingua_messages m
ORDER BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), m.created_at DESC;

-- 5. Fonction pour compter les messages non lus
CREATE OR REPLACE FUNCTION count_unread_messages(p_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM lingua_messages
  WHERE receiver_id = p_user_id AND read_at IS NULL;
$$;

-- ============================================================
-- 6. Table du Language Lab
-- ============================================================
CREATE TABLE IF NOT EXISTS lingua_lab_content (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language      TEXT NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de')),
  section       TEXT NOT NULL CHECK (section IN ('reading', 'writing', 'listening', 'speaking', 'podcasts')),
  title         TEXT NOT NULL,
  description   TEXT DEFAULT '',
  level_target  TEXT DEFAULT 'A1' CHECK (level_target IN ('A1','A2','B1','B2','C1','C2')),
  exercise_type TEXT DEFAULT '',
  difficulty    TEXT DEFAULT '',
  media_url     TEXT DEFAULT '',
  duration_min  INTEGER DEFAULT 0,
  order_index   INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lingua_lab_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lab_content_select" ON lingua_lab_content
  FOR SELECT USING (is_active = true OR check_user_is_admin());

CREATE INDEX IF NOT EXISTS idx_lab_lang_section ON lingua_lab_content(language, section);
CREATE INDEX IF NOT EXISTS idx_lab_level ON lingua_lab_content(level_target);
