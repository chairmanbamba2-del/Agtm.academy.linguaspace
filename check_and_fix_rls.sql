-- ============================================================
-- CHECK and FIX RLS for lingua_users (Conditional - Safe)
-- ============================================================

-- 1. First, show ALL current policies for lingua_users
SELECT 'Current policies on lingua_users:' as title;
SELECT tablename, policyname, cmd, 
       CASE WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
            WHEN qual IS NOT NULL THEN 'USING: ' || qual
            ELSE '(none)' END as condition
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd, policyname;

-- 2. Check if an INSERT policy already exists
DO $$
DECLARE
  insert_policy_exists BOOLEAN;
  insert_policy_name TEXT;
BEGIN
  -- Check if any INSERT policy exists
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lingua_users' AND cmd = 'INSERT'
  ) INTO insert_policy_exists;
  
  -- Get the name of the first INSERT policy
  SELECT policyname INTO insert_policy_name
  FROM pg_policies 
  WHERE tablename = 'lingua_users' AND cmd = 'INSERT'
  LIMIT 1;
  
  IF insert_policy_exists THEN
    RAISE NOTICE 'ℹ️ INSERT policy already exists: %', insert_policy_name;
    RAISE NOTICE '   Checking if it allows authenticated users...';
    
    -- Check if the policy has WITH CHECK (auth.role() = 'authenticated') or similar
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'lingua_users' 
        AND cmd = 'INSERT'
        AND (with_check LIKE '%auth.role() = %authenticated%' 
             OR with_check LIKE '%auth.uid() IS NOT NULL%'
             OR with_check IS NULL)
    ) INTO insert_policy_exists;
    
    IF insert_policy_exists THEN
      RAISE NOTICE '✅ INSERT policy looks good. No changes needed.';
    ELSE
      RAISE NOTICE '⚠️ INSERT policy exists but might be restrictive. Consider updating it.';
    END IF;
  ELSE
    RAISE NOTICE '❌ No INSERT policy found. Creating one...';
    
    -- Create INSERT policy for authenticated users
    CREATE POLICY "lingua_users_insert_auth" ON lingua_users
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
    RAISE NOTICE '✅ Created INSERT policy "lingua_users_insert_auth"';
  END IF;
END $$;

-- 3. Ensure RPC backup function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'create_lingua_user_profile'
  ) THEN
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
    RAISE NOTICE '✅ Created RPC function create_lingua_user_profile';
  ELSE
    RAISE NOTICE 'ℹ️ RPC function create_lingua_user_profile already exists';
  END IF;
END $$;

-- 4. Show final status
SELECT 'Final policies on lingua_users:' as title;
SELECT tablename, policyname, cmd, 
       CASE WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
            WHEN qual IS NOT NULL THEN 'USING: ' || qual
            ELSE '(none)' END as condition
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd, policyname;

-- 5. Test instructions
SELECT '---' as spacer;
SELECT 'TEST INSTRUCTIONS:' as title;
SELECT '1. Open http://localhost:5173/signup' as step;
SELECT '2. Fill the signup form' as step;
SELECT '3. Check browser console (F12) for logs' as step;
SELECT '4. If signup fails, check Network tab for error details' as step;