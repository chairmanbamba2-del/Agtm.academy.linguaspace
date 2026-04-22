-- ============================================================
-- Consolidated RLS fixes and role column migration
-- Combines fixes from 002, 003, and 005 with idempotent statements
-- ============================================================

-- 1. Add role column if not exists (from 005)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lingua_users' AND column_name = 'role'
  ) THEN
    ALTER TABLE lingua_users ADD COLUMN role TEXT DEFAULT 'user' 
      CHECK (role IN ('user', 'admin', 'super_admin'));
    
    -- Update existing users (default 'user')
    UPDATE lingua_users SET role = 'user' WHERE role IS NULL;
  END IF;
END $$;

-- Index for role queries
CREATE INDEX IF NOT EXISTS idx_lingua_users_role ON lingua_users(role);

-- 2. Drop all existing policies on lingua_users to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own profile" ON lingua_users;
DROP POLICY IF EXISTS "Users can select own profile" ON lingua_users;
DROP POLICY IF EXISTS "Users can update own profile" ON lingua_users;
DROP POLICY IF EXISTS "Users can delete own profile" ON lingua_users;
DROP POLICY IF EXISTS "Users manage own profile" ON lingua_users;
DROP POLICY IF EXISTS "enable_insert_for_auth_users" ON lingua_users;
DROP POLICY IF EXISTS "enable_select_for_auth_users" ON lingua_users;
DROP POLICY IF EXISTS "enable_update_for_auth_users" ON lingua_users;
DROP POLICY IF EXISTS "enable_delete_for_auth_users" ON lingua_users;

-- 3. Create new policies that WORK for signup (from 003)
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

-- 4. Create or replace function for profile creation (SECURITY DEFINER)
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

-- 5. Policies for other tables (from 002) - idempotent

-- lingua_subscriptions
DROP POLICY IF EXISTS "Users see own subscriptions" ON lingua_subscriptions;
DROP POLICY IF EXISTS "Users manage own subscriptions" ON lingua_subscriptions;
CREATE POLICY "Users manage own subscriptions" ON lingua_subscriptions
  FOR ALL USING (user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid()));

-- lingua_progress
DROP POLICY IF EXISTS "Users manage own progress" ON lingua_progress;
CREATE POLICY "Users manage own progress" ON lingua_progress
  FOR ALL USING (user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid()));

-- lingua_ai_sessions
DROP POLICY IF EXISTS "Users see own ai sessions" ON lingua_ai_sessions;
DROP POLICY IF EXISTS "Users manage own ai sessions" ON lingua_ai_sessions;
CREATE POLICY "Users manage own ai sessions" ON lingua_ai_sessions
  FOR ALL USING (user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid()));

-- lingua_module_progress
DROP POLICY IF EXISTS "Users manage own module progress" ON lingua_module_progress;
CREATE POLICY "Users manage own module progress" ON lingua_module_progress
  FOR ALL USING (user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid()));

-- 6. Function to promote user to admin (from 005)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT, new_role TEXT DEFAULT 'admin')
RETURNS VOID AS $$
BEGIN
  IF new_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Le rôle doit être admin ou super_admin';
  END IF;
  
  UPDATE lingua_users 
  SET role = new_role 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Verify policies were created (optional)
-- SELECT tablename, policyname, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename IN ('lingua_users', 'lingua_subscriptions', 'lingua_progress', 'lingua_ai_sessions', 'lingua_module_progress')
-- ORDER BY tablename, policyname;