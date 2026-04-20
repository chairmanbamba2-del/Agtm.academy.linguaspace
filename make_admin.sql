-- ============================================================
-- Script pour promouvoir un utilisateur en administrateur
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. Vérifier si la colonne 'role' existe, sinon l'ajouter
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lingua_users' AND column_name = 'role'
  ) THEN
    ALTER TABLE lingua_users ADD COLUMN role TEXT DEFAULT 'user' 
      CHECK (role IN ('user', 'admin', 'super_admin'));
    RAISE NOTICE 'Colonne role ajoutée à lingua_users';
  END IF;
END $$;

-- 2. Promouvoir votre compte (remplacez l'email ci-dessous)
UPDATE lingua_users 
SET role = 'super_admin' 
WHERE email = 'votre-email@exemple.com';

-- 3. Vérifier la mise à jour
SELECT email, full_name, role 
FROM lingua_users 
WHERE email = 'votre-email@exemple.com';

-- 4. Pour voir tous les administrateurs
SELECT email, full_name, role, created_at
FROM lingua_users 
WHERE role IN ('admin', 'super_admin')
ORDER BY role, created_at;