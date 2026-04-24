-- Correction de l'accès admin pour lingua_users
-- Supprime la politique problématique et crée une fonction helper

-- 1. Supprimer la politique "Admin full access users" qui cause une boucle RLS
DROP POLICY IF EXISTS "Admin full access users" ON lingua_users;

-- 2. Créer une fonction SECURITY DEFINER pour vérifier le rôle sans boucle RLS
CREATE OR REPLACE FUNCTION check_user_is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM lingua_users
  WHERE id = user_id;
  
  RETURN user_role IN ('admin', 'super_admin');
END;
$$;

-- 3. Ajouter une politique pour permettre aux admins de lire toutes les lignes
CREATE POLICY "Admins can read all users" ON lingua_users
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- 4. Ajouter une politique pour permettre aux admins de mettre à jour toutes les lignes
CREATE POLICY "Admins can update all users" ON lingua_users
  FOR UPDATE USING (check_user_is_admin(auth.uid()));

-- 5. Vérifier que les politiques de base existent toujours
-- (elles sont créées par 006_consolidated_rls_fixes.sql)

-- 6. Tester la fonction avec l'utilisateur admin
SELECT email, role, check_user_is_admin(id) as is_admin
FROM lingua_users 
WHERE email = 'admin@lingua.space';