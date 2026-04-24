-- ═══════════════════════════════════════════════════════════════
--  MIGRATION v37 — Fix RLS complet + Vue sync rapports/honoraires
--
--  Problème : v24 utilise auth.user_role() qui n'existe pas dans
--  Supabase. Les policies RLS échouent silencieusement → codes
--  d'erreur dans "Voir le rapport" pour admin, DP et formateur.
--
--  Solution :
--    1. Supprimer toutes les policies cassées (v24 + v31 partiel)
--    2. Recréer avec public.urol() (défini en v23_exec)
--    3. Couvrir honoraires_formateurs (oublié en v31)
--    4. Créer vue v_rapport_honoraires_sync pour suivi temps réel
--    5. Recréer la fonction soumettre_rapport_et_honoraires corrigée
--
--  ✅ Idempotent — peut être exécuté plusieurs fois sans erreur
--  📅 2026 — AGTM Academy — Issa Bamba
-- ═══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1. SUPPRIMER LES POLICIES CASSÉES (auth.user_role inexistant)
-- ──────────────────────────────────────────────────────────────

-- Policies v24 (cassées)
DROP POLICY IF EXISTS "rapport_seance_fmt_select"    ON rapports_seances;
DROP POLICY IF EXISTS "rapport_seance_fmt_insert"    ON rapports_seances;
DROP POLICY IF EXISTS "rapport_seance_direction"     ON rapports_seances;
DROP POLICY IF EXISTS "honoraires_fmt_own"           ON honoraires_formateurs;
DROP POLICY IF EXISTS "honoraires_direction_all"     ON honoraires_formateurs;

-- Policies v31 (partiellement correctes — recréation propre)
DROP POLICY IF EXISTS "rapports_seances_admin_all"   ON rapports_seances;
DROP POLICY IF EXISTS "rapports_seances_fmt_own"     ON rapports_seances;
DROP POLICY IF EXISTS "rapports_seances_dir_read"    ON rapports_seances;
DROP POLICY IF EXISTS "rapports_fmt_insert"          ON rapports_seances;
DROP POLICY IF EXISTS "rapports_fmt_select"          ON rapports_seances;
DROP POLICY IF EXISTS "rapports_fmt_update"          ON rapports_seances;
DROP POLICY IF EXISTS "seances_dir_read"             ON seances;
DROP POLICY IF EXISTS "seances_fmt_own"              ON seances;
DROP POLICY IF EXISTS "seances_fmt_read"             ON seances;

-- Éventuelles policies d'une tentative précédente
DROP POLICY IF EXISTS "rs_admin_full"  ON rapports_seances;
DROP POLICY IF EXISTS "rs_fmt_own"     ON rapports_seances;
DROP POLICY IF EXISTS "rs_dir_read"    ON rapports_seances;
DROP POLICY IF EXISTS "hf_admin_full"  ON honoraires_formateurs;
DROP POLICY IF EXISTS "hf_fmt_own"     ON honoraires_formateurs;
DROP POLICY IF EXISTS "hf_dir_read"    ON honoraires_formateurs;

-- ──────────────────────────────────────────────────────────────
-- 2. RLS — rapports_seances  (corrigé avec public.urol())
-- ──────────────────────────────────────────────────────────────
ALTER TABLE rapports_seances ENABLE ROW LEVEL SECURITY;

-- Admin + Secrétaire : accès complet
CREATE POLICY "rs_admin_full" ON rapports_seances
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire'))
  WITH CHECK(public.urol() IN ('admin','secretaire'));

-- Formateur : lecture + écriture de SES PROPRES rapports uniquement
CREATE POLICY "rs_fmt_own" ON rapports_seances
  FOR ALL
  USING     (formateur_id = auth.uid())
  WITH CHECK(formateur_id = auth.uid());

-- Directeur pédagogique + Sous-directeur : lecture de tous
CREATE POLICY "rs_dir_read" ON rapports_seances
  FOR SELECT
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

-- ──────────────────────────────────────────────────────────────
-- 3. RLS — honoraires_formateurs  (oubliés dans v31, corrigés ici)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE honoraires_formateurs ENABLE ROW LEVEL SECURITY;

-- Admin + Direction : accès complet (validation + paiement)
CREATE POLICY "hf_admin_full" ON honoraires_formateurs
  FOR ALL
  USING     (public.urol() IN ('admin','secretaire','directeur_pedagogique','sous_directeur_pedagogique'))
  WITH CHECK(public.urol() IN ('admin','secretaire','directeur_pedagogique','sous_directeur_pedagogique'));

-- Formateur : lecture de SES PROPRES honoraires (filtre formateur_id)
CREATE POLICY "hf_fmt_own" ON honoraires_formateurs
  FOR SELECT
  USING (formateur_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- 4. RLS — seances  (formateurs et DP peuvent lire les séances)
-- ──────────────────────────────────────────────────────────────
CREATE POLICY "seances_dir_read" ON seances
  FOR SELECT
  USING (public.urol() IN ('directeur_pedagogique','sous_directeur_pedagogique'));

CREATE POLICY "seances_fmt_read" ON seances
  FOR SELECT
  USING (public.urol() = 'formateur');

-- ──────────────────────────────────────────────────────────────
-- 5. VUE CONSOLIDÉE — v_rapport_honoraires_sync
--    Jointure rapports_seances + honoraires_formateurs + seances
--    Utilisée par le dashboard pour le suivi en temps réel
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_rapport_honoraires_sync AS
SELECT
  -- Rapport
  rs.id                         AS rapport_id,
  rs.seance_id,
  rs.formateur_id,
  rs.formateur_nom,
  rs.classe_id,
  rs.classe_nom,
  rs.date_seance,
  rs.theme,
  rs.objectifs,
  rs.exercices,
  rs.progression,
  rs.plan_prochaine,
  rs.observations,
  rs.nb_presents,
  rs.nb_absents_non_justifies,
  rs.nb_absents_justifies,
  rs.created_at                 AS rapport_soumis_le,
  -- Honoraires (NULL si pas encore calculé)
  hf.id                         AS honoraires_id,
  hf.tarif_type,
  hf.tarif_unitaire,
  hf.montant_presents,
  hf.montant_absents_nj,
  hf.montant_total,
  hf.statut                     AS hon_statut,
  hf.valide_par,
  hf.valide_at,
  hf.notes                      AS hon_notes,
  -- Séance
  s.statut                      AS seance_statut,
  s.vise_par_direction,
  s.visa_par,
  s.visa_at
FROM rapports_seances rs
LEFT JOIN honoraires_formateurs hf ON hf.seance_id = rs.seance_id
LEFT JOIN seances s                ON s.id          = rs.seance_id;

COMMENT ON VIEW v_rapport_honoraires_sync IS
  'Vue consolidée rapports_seances + honoraires_formateurs + seances.
   Utilisée pour le suivi pédagogique et financier en temps réel.
   Hérite des politiques RLS des tables sources.';

-- Accès authentifié (RLS des tables sources s'applique via SECURITY INVOKER)
GRANT SELECT ON v_rapport_honoraires_sync TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- 6. FONCTION CORRIGÉE — soumettre_rapport_et_honoraires
--    Remplace auth.user_role() par public.urol()
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.soumettre_rapport_et_honoraires(
  p_seance_id             bigint,
  p_theme                 text,
  p_objectifs             text,
  p_exercices             text,
  p_progression           text,
  p_plan_prochaine        text,
  p_observations          text,
  p_nb_presents           int,
  p_nb_absents_nj         int,
  p_nb_absents_justifies  int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seance          seances%ROWTYPE;
  v_fmt             utilisateurs%ROWTYPE;
  v_tarif_unitaire  numeric(10,2) := 2500;
  v_tarif_type      text          := 'anglais_general';
  v_montant_pres    numeric(10,2);
  v_montant_abs     numeric(10,2);
  v_montant_total   numeric(10,2);
  v_rapport_id      bigint;
  v_hon_id          bigint;
  v_fmt_nom         text;
  v_classe_nom      text;
BEGIN
  -- ── Vérification rôle ────────────────────────────────────────
  IF public.urol() NOT IN ('admin','secretaire','directeur_pedagogique',
                            'sous_directeur_pedagogique','formateur') THEN
    RETURN jsonb_build_object('error', 'Accès non autorisé — rôle : ' || public.urol());
  END IF;

  -- ── Charger la séance ────────────────────────────────────────
  SELECT * INTO v_seance FROM seances WHERE id = p_seance_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Séance introuvable (id=' || p_seance_id || ')');
  END IF;

  -- ── Charger le profil formateur ──────────────────────────────
  SELECT * INTO v_fmt FROM utilisateurs WHERE id = auth.uid();
  v_fmt_nom := COALESCE(
    TRIM(COALESCE(v_fmt.prenom,'') || ' ' || COALESCE(v_fmt.nom,'')),
    v_seance.enseignant,
    'Formateur'
  );

  -- ── Classe nom ──────────────────────────────────────────────
  v_classe_nom := COALESCE(
    v_seance.classe_nom,
    (SELECT nom FROM classes WHERE id = v_seance.classe_id LIMIT 1),
    'Classe ' || v_seance.classe_id::text
  );

  -- ── Tarif dynamique selon type de classe ────────────────────
  BEGIN
    SELECT
      CASE WHEN LOWER(COALESCE(c.type_cours,'')) LIKE '%pro%' THEN 'anglais_pro'
           ELSE 'anglais_general' END,
      CASE WHEN LOWER(COALESCE(c.type_cours,'')) LIKE '%pro%' THEN 3500::numeric
           ELSE 2500::numeric END
    INTO v_tarif_type, v_tarif_unitaire
    FROM classes c WHERE c.id = v_seance.classe_id;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- ── Calcul montants honoraires ───────────────────────────────
  v_montant_pres  := p_nb_presents       * v_tarif_unitaire;
  v_montant_abs   := p_nb_absents_nj     * v_tarif_unitaire * 0.5; -- 50% pour abs. NJ
  v_montant_total := v_montant_pres + v_montant_abs;

  -- ── Upsert rapport_seances ───────────────────────────────────
  INSERT INTO rapports_seances (
    seance_id, formateur_id, formateur_nom, classe_id, classe_nom,
    date_seance, theme, objectifs, exercices, progression,
    plan_prochaine, observations,
    nb_presents, nb_absents_non_justifies, nb_absents_justifies
  ) VALUES (
    p_seance_id, auth.uid(), v_fmt_nom, v_seance.classe_id, v_classe_nom,
    v_seance.date_seance, p_theme, p_objectifs, p_exercices, p_progression,
    p_plan_prochaine, p_observations,
    p_nb_presents, p_nb_absents_nj, p_nb_absents_justifies
  )
  ON CONFLICT (seance_id) DO UPDATE SET
    theme                    = EXCLUDED.theme,
    objectifs                = EXCLUDED.objectifs,
    exercices                = EXCLUDED.exercices,
    progression              = EXCLUDED.progression,
    plan_prochaine           = EXCLUDED.plan_prochaine,
    observations             = EXCLUDED.observations,
    nb_presents              = EXCLUDED.nb_presents,
    nb_absents_non_justifies = EXCLUDED.nb_absents_non_justifies,
    nb_absents_justifies     = EXCLUDED.nb_absents_justifies
  RETURNING id INTO v_rapport_id;

  -- ── Upsert honoraires_formateurs ─────────────────────────────
  INSERT INTO honoraires_formateurs (
    seance_id, formateur_id, formateur_nom, classe_id, classe_nom,
    date_seance, tarif_type, tarif_unitaire,
    nb_presents, nb_absents_nj, nb_absents_justifies,
    montant_presents, montant_absents_nj, montant_total, statut
  ) VALUES (
    p_seance_id, auth.uid(), v_fmt_nom, v_seance.classe_id, v_classe_nom,
    v_seance.date_seance, v_tarif_type, v_tarif_unitaire,
    p_nb_presents, p_nb_absents_nj, p_nb_absents_justifies,
    v_montant_pres, v_montant_abs, v_montant_total, 'en_attente'
  )
  ON CONFLICT (seance_id) DO UPDATE SET
    nb_presents           = EXCLUDED.nb_presents,
    nb_absents_nj         = EXCLUDED.nb_absents_nj,
    nb_absents_justifies  = EXCLUDED.nb_absents_justifies,
    montant_presents      = EXCLUDED.montant_presents,
    montant_absents_nj    = EXCLUDED.montant_absents_nj,
    montant_total         = EXCLUDED.montant_total
  RETURNING id INTO v_hon_id;

  -- ── Mettre à jour seance.rapport_seance_id ───────────────────
  UPDATE seances SET rapport_seance_id = v_rapport_id
  WHERE id = p_seance_id AND rapport_seance_id IS NULL;

  RETURN jsonb_build_object(
    'success',        true,
    'rapport_id',     v_rapport_id,
    'honoraires_id',  v_hon_id,
    'montant_total',  v_montant_total,
    'formateur_nom',  v_fmt_nom
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.soumettre_rapport_et_honoraires TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- 7. VÉRIFICATION FINALE
-- ──────────────────────────────────────────────────────────────
SELECT
  tablename          AS "Table",
  policyname         AS "Policy",
  cmd                AS "Opération",
  CASE WHEN qual LIKE '%urol%' THEN '✅ public.urol()'
       WHEN qual LIKE '%user_role%' THEN '❌ auth.user_role() (CASSÉ)'
       ELSE '— autre' END AS "Fonction RLS"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('rapports_seances','honoraires_formateurs','seances')
ORDER BY tablename, policyname;
