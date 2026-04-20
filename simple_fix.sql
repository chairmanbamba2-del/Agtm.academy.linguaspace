-- ============================================================
-- SIMPLE FIX for RLS INSERT issue
-- Only adds missing INSERT policy and creates backup function
-- Does NOT drop any existing policies
-- ============================================================

-- 1. First, check current policies on lingua_users
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd, policyname;

-- 2. Check if there's already an INSERT policy
-- If not, create one
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lingua_users' 
      AND cmd = 'INSERT'
  ) THEN
    -- Create INSERT policy that allows authenticated users to insert their profile
    CREATE POLICY "allow_signup_insert" ON lingua_users
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    RAISE NOTICE 'Created INSERT policy "allow_signup_insert"';
  ELSE
    RAISE NOTICE 'INSERT policy already exists, keeping it';
  END IF;
END $$;

-- 3. Create or replace the RPC function (bypass RLS)
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

-- 4. Verify the function exists
SELECT proname, pg_get_function_arguments(oid) AS arguments
FROM pg_proc 
WHERE proname = 'create_lingua_user_profile';

-- 5. Show final policies
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd, policyname;