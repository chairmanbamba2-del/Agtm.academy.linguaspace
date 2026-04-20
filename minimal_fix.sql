-- ============================================================
-- MINIMAL FIX for lingua_users INSERT issue
-- Only touches lingua_users table, no other tables
-- ============================================================

-- 1. First, let's see what policies exist for lingua_users
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd, policyname;

-- 2. Check if INSERT policy exists
-- If NO INSERT policy exists, create a simple one
DO $$
DECLARE
  insert_policy_exists BOOLEAN;
BEGIN
  -- Check if any INSERT policy exists for lingua_users
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lingua_users' AND cmd = 'INSERT'
  ) INTO insert_policy_exists;
  
  IF NOT insert_policy_exists THEN
    -- Create a simple INSERT policy that allows authenticated users
    CREATE POLICY "allow_signup" ON lingua_users
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    RAISE NOTICE '✅ Created INSERT policy "allow_signup" for lingua_users';
  ELSE
    RAISE NOTICE 'ℹ️ INSERT policy already exists for lingua_users';
  END IF;
END $$;

-- 3. Create or replace the backup function (bypasses RLS)
-- This function can be called from frontend if INSERT still fails
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

RAISE NOTICE '✅ Created function create_lingua_user_profile';

-- 4. Show final policies
SELECT tablename, policyname, cmd, 
       CASE WHEN qual IS NULL THEN '(none)' ELSE '...' END as qual,
       CASE WHEN with_check IS NULL THEN '(none)' ELSE '...' END as with_check
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd, policyname;

-- 5. Verify function
SELECT proname, pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'create_lingua_user_profile';