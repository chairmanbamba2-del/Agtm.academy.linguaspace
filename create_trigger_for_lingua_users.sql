-- ============================================================
-- CREATE TRIGGER for automatic lingua_users profile creation
-- This trigger automatically creates a lingua_users entry
-- when a new user signs up in auth.users
-- ============================================================

-- 1. First, check if the trigger function already exists
SELECT '=== Checking existing triggers and functions ===' as title;

-- Check for existing trigger on auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_schema,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth'
  AND trigger_name LIKE '%lingua%';

-- 2. Create the trigger function in the auth schema (security definer)
-- This function will be called AFTER INSERT on auth.users
CREATE OR REPLACE FUNCTION auth.create_lingua_user_profile_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into lingua_users table
  INSERT INTO public.lingua_users (
    id, 
    email, 
    full_name, 
    phone, 
    country,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'country', 'CI'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

SELECT '✅ Trigger function created' as result;

-- 3. Create the trigger on auth.users table
DROP TRIGGER IF EXISTS trg_create_lingua_user_profile ON auth.users;

CREATE TRIGGER trg_create_lingua_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.create_lingua_user_profile_trigger();

SELECT '✅ Trigger created on auth.users table' as result;

-- 4. Create a backup RPC function (for manual creation if needed)
CREATE OR REPLACE FUNCTION public.create_lingua_user_profile_backup(
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
  INSERT INTO public.lingua_users (id, email, full_name, phone, country, created_at)
  VALUES (p_user_id, p_email, p_full_name, p_phone, 'CI', NOW())
  ON CONFLICT (id) DO NOTHING;
END;
$$;

SELECT '✅ Backup RPC function created' as result;

-- 5. Test the setup by checking structure
SELECT '=== Verification ===' as title;

-- Check if lingua_users table exists and has correct structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'lingua_users'
ORDER BY ordinal_position;

-- Check the foreign key constraint
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'lingua_users'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Check RLS policies on lingua_users
SELECT 
  policyname,
  cmd,
  CASE WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
       WHEN qual IS NOT NULL THEN 'USING: ' || qual
       ELSE '(none)' END as condition
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd, policyname;

-- 6. Test instructions
SELECT '=== TEST INSTRUCTIONS ===' as title;
SELECT '1. Sign up a new user at http://localhost:5173/signup' as step;
SELECT '2. Check if user appears in auth.users:' as step;
SELECT '   SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at DESC LIMIT 1;' as step;
SELECT '3. Check if user appears in lingua_users:' as step;
SELECT '   SELECT id, email, full_name FROM public.lingua_users ORDER BY created_at DESC LIMIT 1;' as step;
SELECT '4. If trigger fails, manually create profile with:' as step;
SELECT '   SELECT create_lingua_user_profile_backup(''user-uuid'', ''email@test.com'', ''Test User'');' as step;

-- 7. Cleanup (if needed)
SELECT '=== CLEANUP (if needed) ===' as note;
SELECT '-- To remove the trigger:' as cleanup_step;
SELECT '-- DROP TRIGGER IF EXISTS trg_create_lingua_user_profile ON auth.users;' as cleanup_code;
SELECT '-- DROP FUNCTION IF EXISTS auth.create_lingua_user_profile_trigger();' as cleanup_code;