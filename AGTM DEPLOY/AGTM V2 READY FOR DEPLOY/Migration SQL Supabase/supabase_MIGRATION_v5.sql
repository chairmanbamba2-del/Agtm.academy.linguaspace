-- ════════════════════════════════════════════════════════════════════
-- AGTM GLOBAL ACADEMY — MIGRATION v5
-- Conception & Propriété : ISSA BAMBA  |  © 2026 AGTM Academy
--
-- CE FICHIER AJOUTE uniquement les nouvelles tables/politiques.
-- Il NE SUPPRIME PAS les données existantes.
--
-- À exécuter dans : Supabase → SQL Editor → New Query → RUN
-- ════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 1 — TABLE DEVOIRS (soumissions en ligne depuis devoir_form.html)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS devoirs (
    id                    BIGSERIAL PRIMARY KEY,
    etudiant_nom          TEXT NOT NULL,
    etudiant_email        TEXT,
    classe_nom            TEXT,
    niveau                TEXT DEFAULT 'B1',
    formateur_nom         TEXT,
    titre                 TEXT NOT NULL,
    description           TEXT,
    reponse               TEXT,
    fichier_url           TEXT,
    statut                TEXT DEFAULT 'Soumis',
    note                  NUMERIC(5,2),
    commentaire_formateur TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE devoirs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='devoirs' AND policyname='devoirs_anon_insert'
  ) THEN
    CREATE POLICY "devoirs_anon_insert" ON devoirs FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='devoirs' AND policyname='devoirs_auth'
  ) THEN
    CREATE POLICY "devoirs_auth" ON devoirs FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 2 — TABLE SOUMISSIONS_EVALUATIONS (si elle n'existe pas encore)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS soumissions_evaluations (
    id               BIGSERIAL PRIMARY KEY,
    evaluation_titre TEXT NOT NULL DEFAULT 'Évaluation en ligne',
    etudiant_nom     TEXT NOT NULL,
    etudiant_email   TEXT,
    niveau           TEXT DEFAULT 'A1',
    score            NUMERIC(5,2) DEFAULT 0,
    score_max        NUMERIC(5,2) DEFAULT 20,
    nb_questions     INTEGER DEFAULT 0,
    nb_bonnes        INTEGER DEFAULT 0,
    reponses         JSONB,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE soumissions_evaluations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='soumissions_evaluations' AND policyname='soum_anon_insert'
  ) THEN
    CREATE POLICY "soum_anon_insert" ON soumissions_evaluations FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='soumissions_evaluations' AND policyname='soum_auth_all'
  ) THEN
    CREATE POLICY "soum_auth_all" ON soumissions_evaluations FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 3 — POLITIQUE ANON INSERT sur RAPPORTS_COACHING
--           (permet la soumission via rapport_form.html sans connexion)
-- ════════════════════════════════════════════════════════════════════
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='rapports_coaching' AND policyname='rapports_anon_insert'
  ) THEN
    CREATE POLICY "rapports_anon_insert" ON rapports_coaching
        FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 4 — COLONNE DEPENSES (si table existe sans la colonne mode_paiement)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS depenses (
    id            BIGSERIAL PRIMARY KEY,
    categorie     TEXT NOT NULL DEFAULT 'Autre',
    description   TEXT NOT NULL,
    montant       NUMERIC(10,2) NOT NULL,
    date_depense  DATE DEFAULT CURRENT_DATE,
    mode_paiement TEXT DEFAULT 'Espèces',
    justificatif  TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE depenses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='depenses' AND policyname='depenses_auth'
  ) THEN
    CREATE POLICY "depenses_auth" ON depenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 5 — COLONNES ENRICHIES SUR EVALUATIONS
--           (matiere, chapitre, appreciation, formateur_nom)
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS matiere       TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS chapitre      TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS appreciation  TEXT DEFAULT 'Bien';
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS formateur_nom TEXT;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 6 — COLONNES ENRICHIES SUR CLASSES
--           (formateur_id, formateur_nom, horaire, programme)
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE classes ADD COLUMN IF NOT EXISTS formateur_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS formateur_nom TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS horaire       TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS programme     TEXT;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 7 — TABLE PLANS_PAIEMENT (si elle n'existe pas encore)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS plans_paiement (
    id               BIGSERIAL PRIMARY KEY,
    etudiant_id      BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
    etudiant_nom     TEXT,
    total_formation  NUMERIC(10,2) NOT NULL,
    nb_echeances     INTEGER DEFAULT 1,
    date_debut       DATE DEFAULT CURRENT_DATE,
    statut           TEXT DEFAULT 'En cours',
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plans_paiement ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='plans_paiement' AND policyname='plans_auth'
  ) THEN
    CREATE POLICY "plans_auth" ON plans_paiement FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS echeances (
    id              BIGSERIAL PRIMARY KEY,
    plan_id         BIGINT REFERENCES plans_paiement(id) ON DELETE CASCADE,
    etudiant_id     BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
    etudiant_nom    TEXT,
    montant         NUMERIC(10,2) NOT NULL,
    date_echeance   DATE NOT NULL,
    statut          TEXT DEFAULT 'En attente',
    date_paiement   DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE echeances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='echeances' AND policyname='ech_auth'
  ) THEN
    CREATE POLICY "ech_auth" ON echeances FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 8 — MODULE RH : PERSONNEL
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS personnel (
    id               BIGSERIAL PRIMARY KEY,
    nom              TEXT NOT NULL,
    prenom           TEXT NOT NULL,
    poste            TEXT NOT NULL DEFAULT 'Formateur',
    type_contrat     TEXT DEFAULT 'CDI',
    date_embauche    DATE,
    date_fin_contrat DATE,
    salaire_base     NUMERIC(10,2) DEFAULT 0,
    telephone        TEXT,
    email            TEXT,
    adresse          TEXT,
    cin              TEXT,
    statut           TEXT DEFAULT 'Actif',
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='personnel' AND policyname='personnel_auth'
  ) THEN
    CREATE POLICY "personnel_auth" ON personnel FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 9 — MODULE RH : FICHES DE PAIE
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fiches_paie (
    id            BIGSERIAL PRIMARY KEY,
    personnel_id  BIGINT REFERENCES personnel(id) ON DELETE CASCADE,
    nom_employe   TEXT NOT NULL,
    poste         TEXT,
    periode       DATE NOT NULL,
    mois_label    TEXT NOT NULL,
    salaire_base  NUMERIC(10,2) DEFAULT 0,
    heures_sup    NUMERIC(5,2)  DEFAULT 0,
    taux_h_sup    NUMERIC(10,2) DEFAULT 0,
    primes        NUMERIC(10,2) DEFAULT 0,
    avantages     NUMERIC(10,2) DEFAULT 0,
    cotisations   NUMERIC(10,2) DEFAULT 0,
    retenues      NUMERIC(10,2) DEFAULT 0,
    avances       NUMERIC(10,2) DEFAULT 0,
    net_a_payer   NUMERIC(10,2) DEFAULT 0,
    statut        TEXT DEFAULT 'En attente',
    date_paiement DATE,
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fiches_paie ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='fiches_paie' AND policyname='paie_auth'
  ) THEN
    CREATE POLICY "paie_auth" ON fiches_paie FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 10 — MODULE RH : CONGÉS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conges (
    id           BIGSERIAL PRIMARY KEY,
    personnel_id BIGINT REFERENCES personnel(id) ON DELETE CASCADE,
    nom_employe  TEXT NOT NULL,
    poste        TEXT,
    type_conge   TEXT DEFAULT 'Congé annuel',
    date_debut   DATE NOT NULL,
    date_fin     DATE NOT NULL,
    nb_jours     INTEGER,
    motif        TEXT,
    statut       TEXT DEFAULT 'En attente',
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='conges' AND policyname='conges_auth'
  ) THEN
    CREATE POLICY "conges_auth" ON conges FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- VÉRIFICATION — Tables créées ou existantes
-- ════════════════════════════════════════════════════════════════════
SELECT table_name AS "Table", 'OK' AS "Statut"
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'utilisateurs','etudiants','paiements','rapports_coaching','evaluations',
    'seances','presences','classes','inscriptions_classes','plans_paiement',
    'echeances','quiz_questions','depenses','soumissions_evaluations','devoirs',
    'personnel','fiches_paie','conges'
  )
ORDER BY table_name;
