-- Correction des politiques RLS pour inclure super_admin
-- Suppression et recréation des politiques

-- 1. lingua_ai_permissions
DROP POLICY IF EXISTS "Admins can manage AI permissions" ON lingua_ai_permissions;
CREATE POLICY "Admins can manage AI permissions" ON lingua_ai_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lingua_users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Users can view their own AI permissions" ON lingua_ai_permissions;
CREATE POLICY "Users can view their own AI permissions" ON lingua_ai_permissions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM lingua_users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 2. lingua_ai_global_settings
DROP POLICY IF EXISTS "Admins can manage global AI settings" ON lingua_ai_global_settings;
CREATE POLICY "Admins can manage global AI settings" ON lingua_ai_global_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lingua_users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- La politique "Everyone can view global AI settings" reste inchangée

-- 3. Vérification
SELECT tablename, policyname, qual 
FROM pg_policies 
WHERE tablename IN ('lingua_ai_permissions', 'lingua_ai_global_settings')
ORDER BY tablename, policyname;