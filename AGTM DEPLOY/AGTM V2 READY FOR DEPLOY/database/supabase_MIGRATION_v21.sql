-- ════════════════════════════════════════════════════════════════════
-- AGTM Digital Academy — Migration v21
-- Auteur : Issa BAMBA
-- Date   : 2026-04-04
-- Objectifs :
--   1. Corriger le bug v20 : INSERT utilisateurs sans colonne email
--   2. Définir le rôle admin dans app_metadata pour le compte admin
--   3. Rétablir le trigger de création automatique des utilisateurs
--   4. Synchroniser proprement la table utilisateurs
-- ════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 0 — DIAGNOSTIC : voir l'état actuel
-- ════════════════════════════════════════════════════════════════════

SELECT
    u.email,
    u.raw_app_meta_data->>'role'   AS app_role,
    u.raw_user_meta_data->>'role'  AS user_role,
    ut.role                         AS table_role,
    ut.nom,
    ut.prenom,
    ut.actif,
    u.created_at
FROM auth.users u
LEFT JOIN utilisateurs ut ON ut.id = u.id
ORDER BY u.created_at;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 1 — Rendre la colonne email nullable (corriger contrainte trop stricte)
--           Le trigger remplira email automatiquement pour les nouveaux users.
--           Les users existants ont déjà leur email dans auth.users.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE utilisateurs
    ALTER COLUMN email DROP NOT NULL;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 2 — Synchroniser TOUS les utilisateurs auth dans la table utilisateurs
--           Inclut maintenant l'email pour corriger le bug de v20
-- ════════════════════════════════════════════════════════════════════

INSERT INTO utilisateurs (id, email, role, nom, prenom, actif)
SELECT
    u.id,
    u.email,
    COALESCE(
        NULLIF(u.raw_app_meta_data->>'role',  ''),
        NULLIF(u.raw_user_meta_data->>'role', ''),
        'etudiant'
    ) AS role,
    COALESCE(
        NULLIF(u.raw_app_meta_data->>'nom',   ''),
        NULLIF(u.raw_user_meta_data->>'nom',  ''),
        ''
    ) AS nom,
    COALESCE(
        NULLIF(u.raw_app_meta_data->>'prenom',  ''),
        NULLIF(u.raw_user_meta_data->>'prenom', ''),
        ''
    ) AS prenom,
    true AS actif
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
    email  = EXCLUDED.email,
    role   = CASE
                 WHEN EXCLUDED.role <> 'etudiant' THEN EXCLUDED.role
                 ELSE utilisateurs.role   -- ne pas écraser un rôle existant par 'etudiant'
             END,
    nom    = CASE WHEN EXCLUDED.nom    <> '' THEN EXCLUDED.nom    ELSE utilisateurs.nom    END,
    prenom = CASE WHEN EXCLUDED.prenom <> '' THEN EXCLUDED.prenom ELSE utilisateurs.prenom END;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 3 — Définir le rôle ADMIN dans app_metadata
--           Pour le premier compte créé (le compte admin de Issa BAMBA)
-- ════════════════════════════════════════════════════════════════════

-- Applique le rôle admin au compte le plus ancien (= le compte admin principal)
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin","nom":"BAMBA","prenom":"Issa"}'::jsonb
WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);

-- Met à jour la table utilisateurs en conséquence
UPDATE utilisateurs
SET role = 'admin', nom = 'BAMBA', prenom = 'Issa'
WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 4 — Rétablir le trigger de création automatique des utilisateurs
--           (supprimé par erreur dans migration v19)
-- ════════════════════════════════════════════════════════════════════

DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS fn_create_utilisateur() CASCADE;

CREATE OR REPLACE FUNCTION fn_create_utilisateur()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.utilisateurs (id, email, role, nom, prenom, actif)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NULLIF(NEW.raw_app_meta_data  ->> 'role', ''), 'etudiant'),
        COALESCE(NULLIF(NEW.raw_app_meta_data  ->> 'nom',  ''),
                 NULLIF(NEW.raw_user_meta_data ->> 'nom',  ''), ''),
        COALESCE(NULLIF(NEW.raw_app_meta_data  ->> 'prenom',  ''),
                 NULLIF(NEW.raw_user_meta_data ->> 'prenom', ''), ''),
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        email  = EXCLUDED.email,
        role   = CASE
                     WHEN EXCLUDED.role <> 'etudiant' THEN EXCLUDED.role
                     ELSE utilisateurs.role
                 END,
        nom    = CASE WHEN EXCLUDED.nom    <> '' THEN EXCLUDED.nom    ELSE utilisateurs.nom    END,
        prenom = CASE WHEN EXCLUDED.prenom <> '' THEN EXCLUDED.prenom ELSE utilisateurs.prenom END;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION fn_create_utilisateur();


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 5 — Invalider toutes les sessions pour forcer re-login
--           (nécessaire pour que les nouveaux app_metadata soient lus)
-- ════════════════════════════════════════════════════════════════════

UPDATE auth.users SET updated_at = NOW();


-- ════════════════════════════════════════════════════════════════════
-- VÉRIFICATION FINALE — doit afficher rôle=admin pour le compte admin
-- ════════════════════════════════════════════════════════════════════

SELECT
    u.email,
    u.raw_app_meta_data->>'role'   AS app_metadata_role,
    ut.role                         AS table_role,
    ut.nom,
    ut.prenom,
    ut.actif
FROM auth.users u
LEFT JOIN utilisateurs ut ON ut.id = u.id
ORDER BY u.created_at;

-- FIN MIGRATION v21
