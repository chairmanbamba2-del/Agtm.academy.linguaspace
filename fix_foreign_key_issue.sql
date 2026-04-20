-- ============================================================
-- FIX foreign key constraint issue for lingua_users
-- Error: "lingua_users_id_fkey" - ID doesn't exist in auth.users
-- ============================================================

-- 1. Check the current foreign key constraint
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'lingua_users';

-- 2. Create a function that waits for user to exist in auth.users
-- This function will retry a few times before giving up
CREATE OR REPLACE FUNCTION public.create_lingua_user_with_retry(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL,
  max_retries INTEGER DEFAULT 5,
  retry_delay_ms INTEGER DEFAULT 100
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  retry_count INTEGER := 0;
  user_exists BOOLEAN := FALSE;
BEGIN
  -- Try to insert with retry logic
  WHILE retry_count < max_retries LOOP
    -- Check if user exists in auth.users
    SELECT EXISTS (
      SELECT 1 FROM auth.users WHERE id = p_user_id
    ) INTO user_exists;
    
    IF user_exists THEN
      -- User exists, insert into lingua_users
      INSERT INTO lingua_users (id, email, full_name, phone)
      VALUES (p_user_id, p_email, p_full_name, p_phone)
      ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE '✅ Successfully inserted user profile after % retries', retry_count;
      RETURN;
    ELSE
      -- Wait and retry
      PERFORM pg_sleep(retry_delay_ms::float / 1000);
      retry_count := retry_count + 1;
    END IF;
  END LOOP;
  
  -- If we get here, user never appeared in auth.users
  RAISE EXCEPTION 'User % not found in auth.users after % retries', p_user_id, max_retries;
END;
$$;

-- 3. Update the existing RPC function to use the retry logic
-- First, check if the old function exists and replace it
DROP FUNCTION IF EXISTS public.create_lingua_user_profile(UUID, TEXT, TEXT, TEXT);

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
  -- Use the retry function instead of direct insert
  PERFORM public.create_lingua_user_with_retry(
    p_user_id,
    p_email,
    p_full_name,
    p_phone
  );
END;
$$;

-- 4. Create a simpler direct-insert function for debugging
CREATE OR REPLACE FUNCTION public.debug_insert_lingua_user(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) INTO auth_user_exists;
  
  IF auth_user_exists THEN
    INSERT INTO lingua_users (id, email, full_name, phone)
    VALUES (p_user_id, p_email, p_full_name, p_phone)
    ON CONFLICT (id) DO NOTHING;
    
    RETURN 'SUCCESS: User profile inserted';
  ELSE
    RETURN 'ERROR: User ' || p_user_id || ' not found in auth.users';
  END IF;
END;
$$;

-- 5. Test the functions exist
SELECT 'Functions created:' as status;
SELECT proname, pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN ('create_lingua_user_with_retry', 'create_lingua_user_profile', 'debug_insert_lingua_user')
ORDER BY proname;

-- 6. Provide test instructions
SELECT '---' as spacer;
SELECT 'TEST INSTRUCTIONS:' as title;
SELECT '1. Sign up a new user in the app' as step;
SELECT '2. Check browser console for logs' as step;
SELECT '3. If error persists, test manually with:' as step;
SELECT '   SELECT debug_insert_lingua_user(''user-uuid-here'', ''test@test.com'', ''Test User'');' as step;

-- 7. Alternative: Make the FK constraint deferred (if needed)
-- Uncomment if retry logic doesn't work:
/*
ALTER TABLE lingua_users 
  DROP CONSTRAINT lingua_users_id_fkey,
  ADD CONSTRAINT lingua_users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) 
  ON DELETE CASCADE 
  DEFERRABLE INITIALLY DEFERRED;
*/