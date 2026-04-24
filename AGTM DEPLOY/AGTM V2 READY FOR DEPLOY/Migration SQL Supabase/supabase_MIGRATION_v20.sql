-- ════════════════════════════════════════════════════════════════════
-- AGTM Digital Academy — Migration v20
-- Auteur : Issa BAMBA
-- Date   : 2026-04-04
-- Objectifs :
--   1. Réinitialiser app_metadata pour l'admin principal
--   2. Synchroniser la table utilisateurs avec auth.users
--   3. Corriger les sessions expirées après synchro Supabase/Git
-- ════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 1 : Vérifier les utilisateurs existants dans auth.users
--           (exécutez d'abord ce SELECT pour trouver l'email admin)
-- ════════════════════════════════════════════════════════════════════

SELECT id, email, raw_app_meta_data, raw_user_meta_data, created_at
FROM auth.users
ORDER BY created_at;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 2 : Définir le rôle admin dans app_metadata
--           Remplacez 'VOTRE_EMAIL_ICI' par votre email réel
-- ════════════════════════════════════════════════════════════════════

-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin","nom":"BAMBA","prenom":"Issa"}'::jsonb
-- WHERE email = 'VOTRE_EMAIL_ICI';


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 3 : Synchroniser la table utilisateurs (si elle est vide)
--           Insère les utilisateurs auth manquants dans la table utilisateurs
-- ════════════════════════════════════════════════════════════════════

INSERT INTO utilisateurs (id, role, nom, prenom, actif)
SELECT
    u.id,
    COALESCE(u.raw_app_meta_data->>'role', u.raw_user_meta_data->>'role', 'etudiant') AS role,
    COALESCE(u.raw_app_meta_data->>'nom',  u.raw_user_meta_data->>'nom',  '') AS nom,
    COALESCE(u.raw_app_meta_data->>'prenom', u.raw_user_meta_data->>'prenom', '') AS prenom,
    true AS actif
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM utilisateurs ut WHERE ut.id = u.id
)
ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 4 : Invalider toutes les sessions actives
--           Force tous les utilisateurs à se reconnecter
--           (utile après un changement de clé JWT)
-- ════════════════════════════════════════════════════════════════════

-- UPDATE auth.users SET updated_at = NOW();


-- ════════════════════════════════════════════════════════════════════
-- VÉRIFICATION FINALE
-- ════════════════════════════════════════════════════════════════════

SELECT u.email, ut.role, ut.nom, ut.prenom, ut.actif,
       u.raw_app_meta_data->>'role' AS meta_role
FROM auth.users u
LEFT JOIN utilisateurs ut ON ut.id = u.id
ORDER BY u.created_at;

-- FIN MIGRATION v20
