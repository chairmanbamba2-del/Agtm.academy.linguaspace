-- ============================================================
-- FIX RLS INSERT POLICY for lingua_users
-- Simple fix: Allow INSERT for authenticated users without check
-- ============================================================

-- 1. First, check current policies
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lingua_users';

-- 2. If there's already an INSERT policy, drop it
DROP POLICY IF EXISTS "enable_insert_for_auth_users" ON lingua_users;
DROP POLICY IF EXISTS "Users can insert own profile" ON lingua_users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON lingua_users;

-- 3. Create a new INSERT policy that ALLOWS inserts for authenticated users
--    The WITH CHECK (true) means any authenticated user can insert any row
CREATE POLICY "allow_insert_authenticated" ON lingua_users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Ensure SELECT, UPDATE, DELETE policies exist (keep existing ones)
--    If they don't exist, create them:
-- SELECT policy (users see only their own data)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lingua_users' AND policyname = 'allow_select_own' AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "allow_select_own" ON lingua_users
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- UPDATE policy (users update only their own data)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lingua_users' AND policyname = 'allow_update_own' AND cmd = 'UPDATE'
  ) THEN
    CREATE POLICY "allow_update_own" ON lingua_users
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- DELETE policy (users delete only their own data)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lingua_users' AND policyname = 'allow_delete_own' AND cmd = 'DELETE'
  ) THEN
    CREATE POLICY "allow_delete_own" ON lingua_users
      FOR DELETE USING (auth.uid() = id);
  END IF;
END $$;

-- 5. Verify the policies
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd, policyname;

-- 6. Also create the RPC function as a backup (security definer)
CREATE OR REPLACE FUNCTION public.create_lingua_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO lingua_users (id, email, full_name, phone)
  VALUES (p_user_id, p_email, p_full_name, p_phone)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- 7. Test the function exists
SELECT proname, pg_get_function_arguments(oid) 
FROM pg_proc 
WHERE proname = 'create_lingua_user_profile';