-- Vérifier les politiques RLS pour lingua_users
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE 'N/A'
  END as policy_details
FROM pg_policies 
WHERE tablename = 'lingua_users'
ORDER BY cmd;

-- Vérifier aussi si l'utilisateur peut s'insérer
-- (devrait montrer "WITH CHECK: (auth.role() = 'authenticated'::text)" pour INSERT)