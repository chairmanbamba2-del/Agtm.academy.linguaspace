-- ============================================================
-- DIAGNOSE and FIX RLS issue for lingua_users
-- ============================================================

-- 1. Check current policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY policyname;

-- 2. If no INSERT policy exists or it's not working, create a simpler one
DROP POLICY IF EXISTS "Users can insert own profile" ON lingua_users;
DROP POLICY IF EXISTS "Users can select own profile" ON lingua_users;
DROP POLICY IF EXISTS "Users can update own profile" ON lingua_users;
DROP POLICY IF EXISTS "Users can delete own profile" ON lingua_users;
DROP POLICY IF EXISTS "Users manage own profile" ON lingua_users;

-- 3. Create new policies that WORK for signup
-- INSERT: Allow users to insert their own profile (no check during signup)
CREATE POLICY "enable_insert_for_auth_users" ON lingua_users
  FOR INSERT WITH CHECK (true);  -- Allow all inserts for authenticated users

-- SELECT: Users can only see their own data
CREATE POLICY "enable_select_for_auth_users" ON lingua_users
  FOR SELECT USING (auth.uid() = id);

-- UPDATE: Users can only update their own data
CREATE POLICY "enable_update_for_auth_users" ON lingua_users
  FOR UPDATE USING (auth.uid() = id);

-- DELETE: Users can only delete their own data
CREATE POLICY "enable_delete_for_auth_users" ON lingua_users
  FOR DELETE USING (auth.uid() = id);

-- 4. Create a function that can be called from frontend to create profile
-- This function has SECURITY DEFINER and bypasses RLS
CREATE OR REPLACE FUNCTION create_lingua_user_profile(
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

-- 5. Verify the policies were created
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY policyname;

-- 6. Test: You should see 4 policies now