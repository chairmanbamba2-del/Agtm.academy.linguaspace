-- ============================================================
--  MIGRATION v26 EXEC — Policies admin/secrétaire manquantes
--  La v23 a recréé les policies seances/evaluations/presences
--  mais a oublié les rôles admin et secretaire → RLS bloquait.
-- ============================================================

-- ── 1. SEANCES ───────────────────────────────────────────────
DROP POLICY IF EXISTS "seances_admin_all"      ON seances;
DROP POLICY IF EXISTS "seances_secretaire_all" ON seances;

CREATE POLICY "seances_admin_all" ON seances
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- ── 2. EVALUATIONS ───────────────────────────────────────────
DROP POLICY IF EXISTS "eval_admin_all"      ON evaluations;
DROP POLICY IF EXISTS "eval_secretaire_all" ON evaluations;

CREATE POLICY "eval_admin_all" ON evaluations
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- ── 3. PRESENCES ─────────────────────────────────────────────
DROP POLICY IF EXISTS "presences_admin_all"      ON presences;
DROP POLICY IF EXISTS "presences_secretaire_all" ON presences;

CREATE POLICY "presences_admin_all" ON presences
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- ── 4. PERSONNEL ─────────────────────────────────────────────
DROP POLICY IF EXISTS "personnel_admin_all" ON personnel;

CREATE POLICY "personnel_admin_all" ON personnel
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- ── 5. UTILISATEURS ──────────────────────────────────────────
DROP POLICY IF EXISTS "utilisateurs_admin_all" ON utilisateurs;

CREATE POLICY "utilisateurs_admin_all" ON utilisateurs
  FOR ALL
  USING     (public.urol() = 'admin')
  WITH CHECK(public.urol() = 'admin');

-- ── 6. INSCRIPTIONS_CLASSES ──────────────────────────────────
DROP POLICY IF EXISTS "insc_admin_all" ON inscriptions_classes;

CREATE POLICY "insc_admin_all" ON inscriptions_classes
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- ── 7. DEVOIRS ───────────────────────────────────────────────
DROP POLICY IF EXISTS "devoirs_admin_all" ON devoirs;

CREATE POLICY "devoirs_admin_all" ON devoirs
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- ── 8. SATISFACTIONS ─────────────────────────────────────────
DROP POLICY IF EXISTS "satisfactions_admin_all" ON satisfactions;

CREATE POLICY "satisfactions_admin_all" ON satisfactions
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- ── 9. MESSAGES ──────────────────────────────────────────────
DROP POLICY IF EXISTS "messages_admin_all" ON messages;

CREATE POLICY "messages_admin_all" ON messages
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- ── 10. RAPPORTS_SEANCES ─────────────────────────────────────
DROP POLICY IF EXISTS "rapports_seances_admin_all" ON rapports_seances;

CREATE POLICY "rapports_seances_admin_all" ON rapports_seances
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- ── 11. HONORAIRES_FORMATEURS ────────────────────────────────
-- (déjà géré dans v24 : honoraires_direction_all inclut admin+secretaire)

-- ── VÉRIFICATION ─────────────────────────────────────────────
SELECT tablename, COUNT(*) AS nb_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('seances','evaluations','presences','personnel',
                    'utilisateurs','inscriptions_classes','devoirs',
                    'satisfactions','messages','rapports_seances')
GROUP BY tablename
ORDER BY tablename;
