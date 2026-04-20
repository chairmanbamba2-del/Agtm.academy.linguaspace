-- ============================================================
-- Migration : Ajout de la colonne role à lingua_users
-- ============================================================

-- Ajouter la colonne role si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lingua_users' AND column_name = 'role'
  ) THEN
    ALTER TABLE lingua_users ADD COLUMN role TEXT DEFAULT 'user' 
      CHECK (role IN ('user', 'admin', 'super_admin'));
    
    -- Mettre à jour les utilisateurs existants (par défaut 'user')
    UPDATE lingua_users SET role = 'user' WHERE role IS NULL;
  END IF;
END $$;

-- Ajouter un index pour les requêtes par rôle
CREATE INDEX IF NOT EXISTS idx_lingua_users_role ON lingua_users(role);

-- Fonction utilitaire pour promouvoir un utilisateur en admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT, new_role TEXT DEFAULT 'admin')
RETURNS VOID AS $$
BEGIN
  IF new_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Le rôle doit être admin ou super_admin';
  END IF;
  
  UPDATE lingua_users 
  SET role = new_role 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;