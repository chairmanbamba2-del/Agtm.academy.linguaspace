-- ============================================================
-- CHECK CURRENT RLS POLICIES for lingua_users table
-- ============================================================

-- 1. Show ALL policies for lingua_users table
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY policyname;

-- 2. Check if RLS is enabled on the table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'lingua_users';

-- 3. Check if the create_lingua_user_profile function exists
SELECT 
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  CASE p.prosecdef WHEN true THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%lingua_user%'
ORDER BY p.proname;

-- 4. Count rows in lingua_users (should work with service role key)
SELECT COUNT(*) as total_users FROM lingua_users;

-- 5. Check if there are any INSERT policies with 'with_check' clause
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'lingua_users' AND cmd = 'INSERT';