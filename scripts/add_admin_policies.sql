-- Add admin SELECT policies for all lingua tables
-- This ensures admins can read all data for dashboard and management

-- lingua_certificates
DROP POLICY IF EXISTS "Admins can read all certificates" ON lingua_certificates;
CREATE POLICY "Admins can read all certificates" ON lingua_certificates
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- lingua_level_tests
DROP POLICY IF EXISTS "Admins can read all level tests" ON lingua_level_tests;
CREATE POLICY "Admins can read all level tests" ON lingua_level_tests
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- lingua_transactions
DROP POLICY IF EXISTS "Admins can read all transactions" ON lingua_transactions;
CREATE POLICY "Admins can read all transactions" ON lingua_transactions
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- lingua_content
DROP POLICY IF EXISTS "Admins can read all content" ON lingua_content;
CREATE POLICY "Admins can read all content" ON lingua_content
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- lingua_expenses
DROP POLICY IF EXISTS "Admins can read all expenses" ON lingua_expenses;
CREATE POLICY "Admins can read all expenses" ON lingua_expenses
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- lingua_financial_summary (view, but add policy if it's a table)
-- Note: views inherit RLS from underlying tables, but we add policy if needed

-- lingua_placement_tests
DROP POLICY IF EXISTS "Admins can read all placement tests" ON lingua_placement_tests;
CREATE POLICY "Admins can read all placement tests" ON lingua_placement_tests
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- lingua_playlists
DROP POLICY IF EXISTS "Admins can read all playlists" ON lingua_playlists;
CREATE POLICY "Admins can read all playlists" ON lingua_playlists
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- lingua_subscription_events
DROP POLICY IF EXISTS "Admins can read all subscription events" ON lingua_subscription_events;
CREATE POLICY "Admins can read all subscription events" ON lingua_subscription_events
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- lingua_themes
DROP POLICY IF EXISTS "Admins can read all themes" ON lingua_themes;
CREATE POLICY "Admins can read all themes" ON lingua_themes
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- lingua_ai_global_settings
DROP POLICY IF EXISTS "Admins can read all ai settings" ON lingua_ai_global_settings;
CREATE POLICY "Admins can read all ai settings" ON lingua_ai_global_settings
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- lingua_ai_permissions
DROP POLICY IF EXISTS "Admins can read all ai permissions" ON lingua_ai_permissions;
CREATE POLICY "Admins can read all ai permissions" ON lingua_ai_permissions
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- Ensure check_user_is_admin function exists
CREATE OR REPLACE FUNCTION check_user_is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM lingua_users
  WHERE id = user_id;
  
  RETURN user_role IN ('admin', 'super_admin');
END;
$$;

-- Test: verify admin can read all tables
SELECT 
  (SELECT COUNT(*) FROM lingua_certificates) as certs,
  (SELECT COUNT(*) FROM lingua_level_tests) as tests,
  (SELECT COUNT(*) FROM lingua_transactions) as transactions;