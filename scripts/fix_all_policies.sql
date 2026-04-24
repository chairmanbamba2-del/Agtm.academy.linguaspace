-- Correction globale des politiques RLS pour éviter les boucles
-- Simplifie les politiques et supprime les politiques problématiques

-- 1. Supprimer les politiques "Admin full access" problématiques
DROP POLICY IF EXISTS "Admin full access subscriptions" ON lingua_subscriptions;
DROP POLICY IF EXISTS "Admin full access transactions" ON lingua_transactions;

-- 2. Simplifier les politiques pour utiliser user_id = auth.uid() directement
-- lingua_subscriptions
DROP POLICY IF EXISTS "Users manage own subscriptions" ON lingua_subscriptions;
CREATE POLICY "Users manage own subscriptions" ON lingua_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- lingua_progress
DROP POLICY IF EXISTS "Users manage own progress" ON lingua_progress;
CREATE POLICY "Users manage own progress" ON lingua_progress
  FOR ALL USING (user_id = auth.uid());

-- lingua_ai_sessions
DROP POLICY IF EXISTS "Users manage own ai sessions" ON lingua_ai_sessions;
CREATE POLICY "Users manage own ai sessions" ON lingua_ai_sessions
  FOR ALL USING (user_id = auth.uid());

-- lingua_module_progress
DROP POLICY IF EXISTS "Users manage own module progress" ON lingua_module_progress;
CREATE POLICY "Users manage own module progress" ON lingua_module_progress
  FOR ALL USING (user_id = auth.uid());

-- 3. Ajouter des politiques admin pour les tables nécessaires (si besoin)
-- Les admins peuvent lire toutes les subscriptions via la fonction check_user_is_admin
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON lingua_subscriptions;
CREATE POLICY "Admins can read all subscriptions" ON lingua_subscriptions
  FOR SELECT USING (check_user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all progress" ON lingua_progress;
CREATE POLICY "Admins can read all progress" ON lingua_progress
  FOR SELECT USING (check_user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all ai sessions" ON lingua_ai_sessions;
CREATE POLICY "Admins can read all ai sessions" ON lingua_ai_sessions
  FOR SELECT USING (check_user_is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all module progress" ON lingua_module_progress;
CREATE POLICY "Admins can read all module progress" ON lingua_module_progress
  FOR SELECT USING (check_user_is_admin(auth.uid()));

-- 4. Vérifier que la fonction check_user_is_admin existe (créée précédemment)
-- Si elle n'existe pas, la créer
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

-- 5. Tester l'accès
SELECT 
  (SELECT COUNT(*) FROM lingua_users WHERE email = 'admin@lingua.space') as admin_exists,
  check_user_is_admin((SELECT id FROM lingua_users WHERE email = 'admin@lingua.space')) as is_admin;