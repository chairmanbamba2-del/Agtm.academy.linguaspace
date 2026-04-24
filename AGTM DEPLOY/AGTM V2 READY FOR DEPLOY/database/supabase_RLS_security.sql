-- ═══════════════════════════════════════════════════════════════════════
--  AGTM DIGITAL ACADEMY — Politiques de Sécurité RLS (Row Level Security)
--  Rôles : admin, formateur, etudiant, secretaire, investisseur
--
--  IMPORTANT: Exécuter dans Supabase → SQL Editor → New query → Run
--  Ces politiques garantissent que chaque utilisateur ne voit que ses données
-- ═══════════════════════════════════════════════════════════════════════

-- ══ 0. ACTIVER RLS SUR TOUTES LES TABLES ════════════════════════════
ALTER TABLE etudiants           ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE seances             ENABLE ROW LEVEL SECURITY;
ALTER TABLE presences           ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscriptions_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_etudiants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel           ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilisateurs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoirs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE satisfaction_seances ENABLE ROW LEVEL SECURITY;

-- ══ HELPER : récupérer le rôle de l'utilisateur courant ══════════════
-- Stocké dans raw_user_meta_data lors de la création du compte
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role'),
    'anon'
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ══ 1. TABLE : utilisateurs ══════════════════════════════════════════
-- Chaque user voit son propre profil. Admin voit tout.
DROP POLICY IF EXISTS "utilisateurs_own"   ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_admin" ON utilisateurs;

CREATE POLICY "utilisateurs_own" ON utilisateurs
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "utilisateurs_admin" ON utilisateurs
  FOR ALL USING (auth.user_role() = 'admin');

-- ══ 2. TABLE : etudiants ════════════════════════════════════════════
DROP POLICY IF EXISTS "etudiants_admin_all"        ON etudiants;
DROP POLICY IF EXISTS "etudiants_formateur_read"   ON etudiants;
DROP POLICY IF EXISTS "etudiants_own_read"         ON etudiants;
DROP POLICY IF EXISTS "etudiants_secretaire_all"   ON etudiants;
DROP POLICY IF EXISTS "etudiants_investor_none"    ON etudiants;

-- Admin : tout faire
CREATE POLICY "etudiants_admin_all" ON etudiants
  FOR ALL USING (auth.user_role() IN ('admin','secretaire'));

-- Formateur : lire uniquement les étudiants de ses classes (sans infos financières)
CREATE POLICY "etudiants_formateur_read" ON etudiants
  FOR SELECT USING (
    auth.user_role() = 'formateur'
    AND id IN (
      SELECT ic.etudiant_id FROM inscriptions_classes ic
      JOIN classes cl ON cl.id = ic.classe_id
      JOIN personnel p ON p.id = cl.personnel_id
      WHERE p.email = auth.email()
    )
  );

-- Étudiant : lire uniquement son propre dossier
CREATE POLICY "etudiants_own_read" ON etudiants
  FOR SELECT USING (
    auth.user_role() = 'etudiant'
    AND email = auth.email()
  );

-- Investisseur : aucun accès aux données personnelles
CREATE POLICY "etudiants_investor_none" ON etudiants
  FOR SELECT USING (auth.user_role() = 'investisseur' AND FALSE);

-- ══ 3. TABLE : seances ═══════════════════════════════════════════════
DROP POLICY IF EXISTS "seances_admin_all"        ON seances;
DROP POLICY IF EXISTS "seances_formateur_own"    ON seances;
DROP POLICY IF EXISTS "seances_etudiant_read"    ON seances;
DROP POLICY IF EXISTS "seances_investor_agg"     ON seances;

-- Admin/Secrétaire : tout faire
CREATE POLICY "seances_admin_all" ON seances
  FOR ALL USING (auth.user_role() IN ('admin','secretaire'));

-- Formateur : voir et modifier uniquement ses séances
CREATE POLICY "seances_formateur_own" ON seances
  FOR ALL USING (
    auth.user_role() = 'formateur'
    AND enseignant IN (
      SELECT prenom || ' ' || nom FROM personnel WHERE email = auth.email()
    )
  );

-- Étudiant : voir les séances de ses classes (lecture seule)
CREATE POLICY "seances_etudiant_read" ON seances
  FOR SELECT USING (
    auth.user_role() = 'etudiant'
    AND classe_id IN (
      SELECT ic.classe_id FROM inscriptions_classes ic
      JOIN etudiants e ON e.id = ic.etudiant_id
      WHERE e.email = auth.email()
    )
  );

-- Investisseur : lecture agrégée (statut + date uniquement, pas enseignant ni classe_id lisible)
CREATE POLICY "seances_investor_read" ON seances
  FOR SELECT USING (auth.user_role() = 'investisseur');

-- ══ 4. TABLE : presences ═════════════════════════════════════════════
DROP POLICY IF EXISTS "presences_admin_all"       ON presences;
DROP POLICY IF EXISTS "presences_formateur_read"  ON presences;
DROP POLICY IF EXISTS "presences_etudiant_own"    ON presences;
DROP POLICY IF EXISTS "presences_investor_none"   ON presences;

CREATE POLICY "presences_admin_all"      ON presences FOR ALL   USING (auth.user_role() IN ('admin','secretaire'));
CREATE POLICY "presences_formateur_read" ON presences FOR SELECT USING (auth.user_role() = 'formateur');
CREATE POLICY "presences_etudiant_own"   ON presences FOR SELECT USING (auth.user_role() = 'etudiant' AND etudiant_id IN (SELECT id FROM etudiants WHERE email = auth.email()));
CREATE POLICY "presences_investor_none"  ON presences FOR SELECT USING (auth.user_role() = 'investisseur' AND FALSE);

-- ══ 5. TABLE : evaluations ════════════════════════════════════════════
DROP POLICY IF EXISTS "eval_admin_all"       ON evaluations;
DROP POLICY IF EXISTS "eval_formateur_own"   ON evaluations;
DROP POLICY IF EXISTS "eval_etudiant_own"    ON evaluations;
DROP POLICY IF EXISTS "eval_investor_none"   ON evaluations;

CREATE POLICY "eval_admin_all"     ON evaluations FOR ALL    USING (auth.user_role() IN ('admin','secretaire'));
CREATE POLICY "eval_formateur_own" ON evaluations FOR ALL    USING (auth.user_role() = 'formateur');
CREATE POLICY "eval_etudiant_own"  ON evaluations FOR SELECT USING (auth.user_role() = 'etudiant' AND (etudiant_id IN (SELECT id FROM etudiants WHERE email = auth.email()) OR etudiant_nom IN (SELECT prenom || ' ' || nom FROM etudiants WHERE email = auth.email())));
CREATE POLICY "eval_investor_none" ON evaluations FOR SELECT USING (auth.user_role() = 'investisseur' AND FALSE);

-- ══ 6. TABLE : paiements ═════════════════════════════════════════════
-- Investisseur : lecture d'agrégats seulement (montant + date, pas etudiant_id)
DROP POLICY IF EXISTS "paie_admin_all"      ON paiements;
DROP POLICY IF EXISTS "paie_etudiant_own"   ON paiements;
DROP POLICY IF EXISTS "paie_investor_agg"   ON paiements;

CREATE POLICY "paie_admin_all"    ON paiements FOR ALL    USING (auth.user_role() IN ('admin','secretaire'));
CREATE POLICY "paie_etudiant_own" ON paiements FOR SELECT USING (auth.user_role() = 'etudiant' AND etudiant_id IN (SELECT id FROM etudiants WHERE email = auth.email()));
-- Investisseur : accès agrégé uniquement (le code JS ne récupère que SUM/COUNT)
CREATE POLICY "paie_investor_agg" ON paiements FOR SELECT USING (auth.user_role() = 'investisseur');

-- ══ 7. TABLE : messages + messages_etudiants ═════════════════════════
DROP POLICY IF EXISTS "msg_admin_all"    ON messages;
DROP POLICY IF EXISTS "msg_perso"        ON messages;
DROP POLICY IF EXISTS "msgetud_own"      ON messages_etudiants;
DROP POLICY IF EXISTS "msgetud_admin"    ON messages_etudiants;

CREATE POLICY "msg_admin_all"  ON messages FOR ALL USING (auth.user_role() IN ('admin','secretaire','formateur'));
CREATE POLICY "msg_perso"      ON messages FOR SELECT USING (destinataire_id = auth.uid() OR expediteur_id = auth.uid());
CREATE POLICY "msgetud_admin"  ON messages_etudiants FOR ALL USING (auth.user_role() IN ('admin','secretaire','formateur'));
CREATE POLICY "msgetud_own"    ON messages_etudiants FOR SELECT USING (auth.user_role() = 'etudiant' AND etudiant_id IN (SELECT id FROM etudiants WHERE email = auth.email()));

-- ══ 8. TABLE : personnel ═════════════════════════════════════════════
DROP POLICY IF EXISTS "personnel_admin_all"    ON personnel;
DROP POLICY IF EXISTS "personnel_own"          ON personnel;
DROP POLICY IF EXISTS "personnel_investor_none" ON personnel;

CREATE POLICY "personnel_admin_all"     ON personnel FOR ALL    USING (auth.user_role() IN ('admin','secretaire'));
CREATE POLICY "personnel_own"           ON personnel FOR SELECT USING (email = auth.email());
-- Investisseur : aucun accès aux données RH personnelles
CREATE POLICY "personnel_investor_none" ON personnel FOR SELECT USING (auth.user_role() = 'investisseur' AND FALSE);

-- ══ 9. TABLE : satisfaction_seances ══════════════════════════════════
DROP POLICY IF EXISTS "sat_admin"    ON satisfaction_seances;
DROP POLICY IF EXISTS "sat_investor" ON satisfaction_seances;

CREATE POLICY "sat_admin"    ON satisfaction_seances FOR ALL USING (auth.user_role() IN ('admin','secretaire'));
-- Investisseur : lecture agrégée (note uniquement)
CREATE POLICY "sat_investor" ON satisfaction_seances FOR SELECT USING (auth.user_role() = 'investisseur');

-- ══ 10. Vérification des politiques actives ═══════════════════════════
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
