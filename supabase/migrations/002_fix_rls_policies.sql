-- ============================================================
-- FIX RLS Policies for lingua_users table
-- Solves: "new row violates row-level security policy for table 'lingua_users'"
-- ============================================================

-- Drop the existing broad policy and create specific ones
DROP POLICY IF EXISTS "Users manage own profile" ON lingua_users;

-- Allow users to insert their own profile (WITH CHECK ensures id matches auth.uid())
CREATE POLICY "Users can insert own profile" ON lingua_users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to select their own profile
CREATE POLICY "Users can select own profile" ON lingua_users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON lingua_users
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON lingua_users
  FOR DELETE USING (auth.uid() = id);

-- ============================================================
-- Ensure other tables have proper INSERT policies
-- ============================================================

-- lingua_subscriptions: allow users to insert their own subscriptions
DROP POLICY IF EXISTS "Users see own subscriptions" ON lingua_subscriptions;
CREATE POLICY "Users manage own subscriptions" ON lingua_subscriptions
  FOR ALL USING (user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid()));

-- lingua_progress: allow users to insert their own progress
DROP POLICY IF EXISTS "Users manage own progress" ON lingua_progress;
CREATE POLICY "Users manage own progress" ON lingua_progress
  FOR ALL USING (user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid()));

-- lingua_ai_sessions: allow users to insert their own sessions
DROP POLICY IF EXISTS "Users see own ai sessions" ON lingua_ai_sessions;
CREATE POLICY "Users manage own ai sessions" ON lingua_ai_sessions
  FOR ALL USING (user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid()));

-- lingua_module_progress: allow users to insert their own module progress
DROP POLICY IF EXISTS "Users manage own module progress" ON lingua_module_progress;
CREATE POLICY "Users manage own module progress" ON lingua_module_progress
  FOR ALL USING (user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid()));

-- Note: lingua_modules and lingua_content keep their read-only policies
-- (auth users can read published/active content)