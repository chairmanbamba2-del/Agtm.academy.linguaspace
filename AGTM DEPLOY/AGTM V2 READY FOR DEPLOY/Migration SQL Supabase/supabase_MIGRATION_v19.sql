-- ════════════════════════════════════════════════════════════════════
-- AGTM Digital Academy — Migration v19
-- Auteur : Issa BAMBA
-- Date   : 2026-04-04
-- Objectifs :
--   1. Supprimer le trigger fn_create_utilisateur (création auto utilisateurs)
--   2. Renforcer les politiques RLS sur la table classes
--   3. Politique admin explicite pour finances_perso
-- ════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════
-- 1. SUPPRIMER LE TRIGGER ET LA FONCTION fn_create_utilisateur
--    Raison : la création des entrées utilisateurs est désormais gérée
--    manuellement dans le dashboard (évite conflits et emails forcés).
-- ════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS fn_create_utilisateur();


-- ════════════════════════════════════════════════════════════════════
-- 2. RENFORCER LES POLITIQUES RLS — TABLE classes
--    Remplacer la politique générique par des politiques distinctes
--    pour SELECT, INSERT, UPDATE et DELETE.
-- ════════════════════════════════════════════════════════════════════

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "classes_auth" ON classes;

-- SELECT : tout utilisateur authentifié peut voir les classes
CREATE POLICY "classes_select" ON classes
    FOR SELECT TO authenticated USING (true);

-- INSERT : tout utilisateur authentifié peut créer une classe
CREATE POLICY "classes_insert" ON classes
    FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE : tout utilisateur authentifié peut modifier une classe
CREATE POLICY "classes_update" ON classes
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- DELETE : tout utilisateur authentifié peut supprimer une classe
CREATE POLICY "classes_delete" ON classes
    FOR DELETE TO authenticated USING (true);


-- ════════════════════════════════════════════════════════════════════
-- 3. POLITIQUE RLS — TABLE finances_perso (admin uniquement)
--    Seul l'admin (role stocké dans app_metadata) peut accéder.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS finances_perso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perso_all" ON finances_perso;
DROP POLICY IF EXISTS "perso_auth" ON finances_perso;

CREATE POLICY "perso_admin_only" ON finances_perso
    FOR ALL TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );


-- ════════════════════════════════════════════════════════════════════
-- 4. RENFORCER RLS — TABLE inscriptions_classes
-- ════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "insc_cl_auth" ON inscriptions_classes;

CREATE POLICY "insc_cl_select" ON inscriptions_classes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "insc_cl_insert" ON inscriptions_classes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "insc_cl_delete" ON inscriptions_classes
    FOR DELETE TO authenticated USING (true);


-- FIN MIGRATION v19
