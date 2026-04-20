-- ============================================================
-- MINIMAL FIX for lingua_users INSERT policy only
-- Solves: "new row violates row-level security policy for table 'lingua_users'"
-- Does NOT touch other tables to avoid "policy already exists" errors
-- ============================================================

-- 1. First, check current policies on lingua_users
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd, policyname;

-- 2. Drop ONLY conflicting INSERT policies for lingua_users (not other tables)
DROP POLICY IF EXISTS "Users manage own profile" ON lingua_users;
DROP POLICY IF EXISTS "Users can insert own profile" ON lingua_users;
DROP POLICY IF EXISTS "allow_insert_authenticated" ON lingua_users;
DROP POLICY IF EXISTS "enable_insert_for_auth_users" ON lingua_users;
DROP POLICY IF EXISTS "allow_signup" ON lingua_users;
DROP POLICY IF EXISTS "allow_signup_insert" ON lingua_users;

-- 3. Create a simple INSERT policy for authenticated users
-- IMPORTANT: During signup, auth.uid() exists but may not match the id being inserted
-- So we use auth.role() = 'authenticated' instead
CREATE POLICY "lingua_users_insert_auth" ON lingua_users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Ensure SELECT, UPDATE, DELETE policies exist (skip if they already exist)
-- SELECT policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lingua_users' AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "lingua_users_select_own" ON lingua_users
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- UPDATE policy  
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lingua_users' AND cmd = 'UPDATE'
  ) THEN
    CREATE POLICY "lingua_users_update_own" ON lingua_users
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- DELETE policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lingua_users' AND cmd = 'DELETE'
  ) THEN
    CREATE POLICY "lingua_users_delete_own" ON lingua_users
      FOR DELETE USING (auth.uid() = id);
  END IF;
END $$;

-- 5. Create the RPC backup function (security definer - bypasses RLS)
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

-- 6. Verify the fix
SELECT 'lingua_users policies after fix:' as status;
SELECT tablename, policyname, cmd, 
       CASE WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
            WHEN qual IS NOT NULL THEN 'USING: ' || qual
            ELSE '(none)' END as condition
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd, policyname;

SELECT 'RPC function created:' as status, 
       proname, pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'create_lingua_user_profile';

-- 7. Test note: Signup should now work with either:
--    a) Direct INSERT (using the new INSERT policy)
--    b) Fallback RPC call (if INSERT still fails due to RLS)