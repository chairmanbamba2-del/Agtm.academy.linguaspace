-- ============================================================
--  MIGRATION v24 — Workflow Séance Strict + Honoraires Formateurs
--  AGTM Digital Academy
--  Date : 2026-04-11
--
--  1. Colonnes workflow sur seances (pointage_fait, rapport_soumis,
--     statut a_valider_direction)
--  2. Colonnes justification sur presences
--  3. Tarif sur classes
--  4. Table rapports_seances (rapport obligatoire par séance)
--  5. Table honoraires_formateurs (calcul auto à la validation)
--  6. Politiques RLS
-- ============================================================

-- ──────────────────────────────────────────────────────────
--  1. COLONNES WORKFLOW SUR SEANCES
-- ──────────────────────────────────────────────────────────
ALTER TABLE seances
  ADD COLUMN IF NOT EXISTS pointage_fait      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rapport_soumis     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rapport_seance_id  bigint;   -- ref rapports_seances (ajouté après la table)

-- Note : le statut 'a_valider_direction' est un nouveau statut valide
-- Flux : Planifiée → (pointage) → Planifiée+pointage_fait → (rapport) → a_valider_direction → (direction) → Réalisée

-- ──────────────────────────────────────────────────────────
--  2. COLONNES JUSTIFICATION SUR PRESENCES
-- ──────────────────────────────────────────────────────────
ALTER TABLE presences
  ADD COLUMN IF NOT EXISTS motif_absence  text,
  ADD COLUMN IF NOT EXISTS justifie       boolean NOT NULL DEFAULT false;

-- ──────────────────────────────────────────────────────────
--  3. TARIF TYPE SUR CLASSES
-- ──────────────────────────────────────────────────────────
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS tarif_type    text NOT NULL DEFAULT 'anglais_general';
  -- 'anglais_general' → 1500 FCFA/étudiant  (max 5 étudiants)
  -- 'anglais_pro'     → 1875 FCFA/étudiant  (3-4 étudiants)

-- ──────────────────────────────────────────────────────────
--  4. TABLE rapports_seances
--     Rapport obligatoire soumis par le formateur après chaque séance
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rapports_seances (
  id                       bigserial PRIMARY KEY,
  seance_id                bigint UNIQUE REFERENCES seances(id) ON DELETE CASCADE,
  formateur_id             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  formateur_nom            text NOT NULL DEFAULT '',
  classe_id                bigint,
  classe_nom               text NOT NULL DEFAULT '',
  date_seance              date,
  -- Contenu pédagogique
  theme                    text NOT NULL,
  objectifs                text,
  exercices                text,
  progression              text NOT NULL DEFAULT 'Bonne',  -- 'Bonne' | 'Moyenne' | 'À améliorer'
  plan_prochaine           text,
  observations             text,
  -- Résumé présences (calculé lors de la soumission)
  nb_presents              int NOT NULL DEFAULT 0,
  nb_absents_non_justifies int NOT NULL DEFAULT 0,
  nb_absents_justifies     int NOT NULL DEFAULT 0,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rapports_seances_seance ON rapports_seances(seance_id);
CREATE INDEX IF NOT EXISTS idx_rapports_seances_fmt    ON rapports_seances(formateur_id);

-- Ajouter la contrainte de clé étrangère sur seances
ALTER TABLE seances
  ADD CONSTRAINT fk_rapport_seance
  FOREIGN KEY (rapport_seance_id) REFERENCES rapports_seances(id) ON DELETE SET NULL;

-- ──────────────────────────────────────────────────────────
--  5. TABLE honoraires_formateurs
--     Calculé automatiquement à la validation Direction
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS honoraires_formateurs (
  id                       bigserial PRIMARY KEY,
  seance_id                bigint UNIQUE REFERENCES seances(id) ON DELETE CASCADE,
  formateur_id             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  formateur_nom            text NOT NULL DEFAULT '',
  classe_id                bigint,
  classe_nom               text NOT NULL DEFAULT '',
  date_seance              date,
  -- Tarification
  tarif_type               text NOT NULL DEFAULT 'anglais_general',
  tarif_unitaire           numeric(10,2) NOT NULL DEFAULT 1500,
  -- Détail présences
  nb_presents              int NOT NULL DEFAULT 0,
  nb_absents_nj            int NOT NULL DEFAULT 0,   -- Non Justifiés : 50% payé
  nb_absents_justifies     int NOT NULL DEFAULT 0,   -- Justifiés    : 0% (payé au rattrapage)
  -- Calcul
  montant_presents         numeric(10,2) NOT NULL DEFAULT 0,   -- presents × tarif
  montant_absents_nj       numeric(10,2) NOT NULL DEFAULT 0,   -- absents_nj × tarif × 0.5
  montant_total            numeric(10,2) NOT NULL DEFAULT 0,   -- montant_presents + montant_absents_nj
  -- Statut
  statut                   text NOT NULL DEFAULT 'en_attente', -- 'en_attente' | 'valide' | 'paye'
  valide_par               text,
  valide_par_user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  valide_at                timestamptz,
  -- Optionnel
  notes                    text,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_honoraires_fmt      ON honoraires_formateurs(formateur_id);
CREATE INDEX IF NOT EXISTS idx_honoraires_seance   ON honoraires_formateurs(seance_id);
CREATE INDEX IF NOT EXISTS idx_honoraires_statut   ON honoraires_formateurs(statut);
CREATE INDEX IF NOT EXISTS idx_honoraires_date     ON honoraires_formateurs(date_seance);

-- ──────────────────────────────────────────────────────────
--  6. RLS — rapports_seances
-- ──────────────────────────────────────────────────────────
ALTER TABLE rapports_seances ENABLE ROW LEVEL SECURITY;

-- Formateur : voir et créer ses propres rapports
CREATE POLICY "rapport_seance_fmt_select" ON rapports_seances
  FOR SELECT USING (
    formateur_id = auth.uid()
    OR auth.user_role() IN ('admin','secretaire','directeur_pedagogique','sous_directeur_pedagogique')
  );

CREATE POLICY "rapport_seance_fmt_insert" ON rapports_seances
  FOR INSERT WITH CHECK (
    formateur_id = auth.uid()
    OR auth.user_role() IN ('admin','secretaire','directeur_pedagogique','sous_directeur_pedagogique')
  );

-- Direction/Admin : tout faire (modifier, supprimer, corriger)
CREATE POLICY "rapport_seance_direction" ON rapports_seances
  FOR ALL USING (
    auth.user_role() IN ('admin','directeur_pedagogique','sous_directeur_pedagogique')
  ) WITH CHECK (
    auth.user_role() IN ('admin','directeur_pedagogique','sous_directeur_pedagogique')
  );

-- ──────────────────────────────────────────────────────────
--  7. RLS — honoraires_formateurs
-- ──────────────────────────────────────────────────────────
ALTER TABLE honoraires_formateurs ENABLE ROW LEVEL SECURITY;

-- Formateur : voir uniquement ses honoraires
CREATE POLICY "honoraires_fmt_own" ON honoraires_formateurs
  FOR SELECT USING (formateur_id = auth.uid());

-- Direction/Admin : CRUD total
CREATE POLICY "honoraires_direction_all" ON honoraires_formateurs
  FOR ALL USING (
    auth.user_role() IN ('admin','directeur_pedagogique','sous_directeur_pedagogique','secretaire')
  ) WITH CHECK (
    auth.user_role() IN ('admin','directeur_pedagogique','sous_directeur_pedagogique','secretaire')
  );

-- ──────────────────────────────────────────────────────────
--  8. RLS — seances (mise à jour : formateur peut soumettre rapport)
--     Le formateur peut mettre à jour pointage_fait, rapport_soumis,
--     rapport_seance_id sur ses séances NON visées
-- ──────────────────────────────────────────────────────────
-- Note : La policy seances_formateur_update existe déjà (migration v23)
-- Elle bloque si vise_par_direction = true.
-- Le workflow de rapport passe par statut 'a_valider_direction' :
-- la direction ne peut pas viser une séance déjà en validation.

-- ──────────────────────────────────────────────────────────
--  9. FONCTION DE CALCUL DES HONORAIRES
--     Appelée lors de la validation par la Direction
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_calculer_honoraires(p_seance_id bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seance          seances%ROWTYPE;
  v_rapport         rapports_seances%ROWTYPE;
  v_classe          classes%ROWTYPE;
  v_formateur_id    uuid;
  v_tarif_type      text;
  v_tarif_unitaire  numeric;
  v_nb_presents     int := 0;
  v_nb_absents_nj   int := 0;
  v_nb_absents_j    int := 0;
  v_montant_presents  numeric := 0;
  v_montant_nj        numeric := 0;
  v_montant_total     numeric := 0;
BEGIN
  -- Vérification des droits
  IF auth.user_role() NOT IN ('admin','directeur_pedagogique','sous_directeur_pedagogique') THEN
    RAISE EXCEPTION 'Accès refusé : réservé à la Direction Pédagogique';
  END IF;

  -- Récupérer la séance
  SELECT * INTO v_seance FROM seances WHERE id = p_seance_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Séance introuvable'; END IF;

  -- Récupérer la classe et son tarif
  IF v_seance.classe_id IS NOT NULL THEN
    SELECT * INTO v_classe FROM classes WHERE id = v_seance.classe_id;
    v_tarif_type := COALESCE(v_classe.tarif_type, 'anglais_general');
  ELSE
    v_tarif_type := 'anglais_general';
  END IF;

  -- Tarif unitaire
  v_tarif_unitaire := CASE v_tarif_type WHEN 'anglais_pro' THEN 1875 ELSE 1500 END;

  -- Compter les présences/absences
  SELECT
    COUNT(*) FILTER (WHERE present = 1)                          INTO v_nb_presents,
    COUNT(*) FILTER (WHERE present = 0 AND justifie = false)     INTO v_nb_absents_nj,
    COUNT(*) FILTER (WHERE present = 0 AND justifie = true)      INTO v_nb_absents_j
  FROM presences WHERE seance_id = p_seance_id;

  -- Calcul
  v_montant_presents := v_nb_presents   * v_tarif_unitaire;
  v_montant_nj       := v_nb_absents_nj * v_tarif_unitaire * 0.5;
  v_montant_total    := v_montant_presents + v_montant_nj;

  -- Récupérer le formateur_id depuis les utilisateurs (par nom)
  SELECT u.id INTO v_formateur_id
  FROM utilisateurs u
  WHERE CONCAT(u.prenom, ' ', u.nom) = v_seance.enseignant
     OR CONCAT(u.nom, ' ', u.prenom) = v_seance.enseignant
  LIMIT 1;

  -- Récupérer le rapport
  SELECT * INTO v_rapport FROM rapports_seances WHERE seance_id = p_seance_id;

  -- Upsert honoraires
  INSERT INTO honoraires_formateurs (
    seance_id, formateur_id, formateur_nom, classe_id, classe_nom, date_seance,
    tarif_type, tarif_unitaire,
    nb_presents, nb_absents_nj, nb_absents_justifies,
    montant_presents, montant_absents_nj, montant_total,
    statut, valide_par, valide_par_user_id, valide_at
  ) VALUES (
    p_seance_id,
    v_formateur_id,
    v_seance.enseignant,
    v_seance.classe_id,
    COALESCE(v_classe.nom, v_seance.programme, ''),
    v_seance.date_seance,
    v_tarif_type, v_tarif_unitaire,
    v_nb_presents, v_nb_absents_nj, v_nb_absents_j,
    v_montant_presents, v_montant_nj, v_montant_total,
    'valide',
    (SELECT CONCAT(prenom,' ',nom) FROM utilisateurs WHERE id = auth.uid()),
    auth.uid(),
    now()
  )
  ON CONFLICT (seance_id) DO UPDATE SET
    formateur_id    = EXCLUDED.formateur_id,
    formateur_nom   = EXCLUDED.formateur_nom,
    tarif_type      = EXCLUDED.tarif_type,
    tarif_unitaire  = EXCLUDED.tarif_unitaire,
    nb_presents     = EXCLUDED.nb_presents,
    nb_absents_nj   = EXCLUDED.nb_absents_nj,
    nb_absents_justifies = EXCLUDED.nb_absents_justifies,
    montant_presents    = EXCLUDED.montant_presents,
    montant_absents_nj  = EXCLUDED.montant_absents_nj,
    montant_total       = EXCLUDED.montant_total,
    statut          = 'valide',
    valide_par      = EXCLUDED.valide_par,
    valide_par_user_id  = EXCLUDED.valide_par_user_id,
    valide_at       = EXCLUDED.valide_at;

  -- Marquer la séance Réalisée
  UPDATE seances SET statut = 'Réalisée' WHERE id = p_seance_id;

  RETURN jsonb_build_object(
    'ok', true,
    'tarif_type', v_tarif_type,
    'tarif_unitaire', v_tarif_unitaire,
    'nb_presents', v_nb_presents,
    'nb_absents_nj', v_nb_absents_nj,
    'nb_absents_j', v_nb_absents_j,
    'montant_total', v_montant_total
  );
END;
$$;

-- ──────────────────────────────────────────────────────────
--  10. VÉRIFICATION
-- ──────────────────────────────────────────────────────────
SELECT 'rapports_seances' AS table_name,
       COUNT(*) AS policies
FROM pg_policies WHERE tablename = 'rapports_seances'
UNION ALL
SELECT 'honoraires_formateurs', COUNT(*)
FROM pg_policies WHERE tablename = 'honoraires_formateurs';
