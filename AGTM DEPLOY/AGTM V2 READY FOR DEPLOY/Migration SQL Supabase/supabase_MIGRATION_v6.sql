-- ════════════════════════════════════════════════════════════════════
-- AGTM GLOBAL ACADEMY — MIGRATION v6 (FICHIER UNIQUE & COMPLET)
-- Conception & Propriete : ISSA BAMBA  |  2026 AGTM Academy
--
-- CE FICHIER EST 100% SAFE : aucune donnee existante n'est supprimee.
-- Utilise EXCEPTION WHEN duplicate_table pour ignorer les tables deja presentes.
--
-- A executer dans : Supabase SQL Editor -> New Query -> RUN
-- ════════════════════════════════════════════════════════════════════


-- ── 1. UTILISATEURS ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE utilisateurs (
      id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      nom        TEXT,
      prenom     TEXT,
      role       TEXT DEFAULT 'etudiant',
      telephone  TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "util_self" ON utilisateurs FOR ALL TO authenticated
    USING (id = auth.uid()) WITH CHECK (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "util_admin" ON utilisateurs FOR ALL TO authenticated
    USING ((auth.jwt()->'app_metadata'->>'role') IN ('admin','formateur'))
    WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('admin','formateur'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 2. ETUDIANTS ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE etudiants (
      id               BIGSERIAL PRIMARY KEY,
      nom              TEXT NOT NULL,
      prenom           TEXT,
      email            TEXT,
      telephone        TEXT,
      niveau           TEXT DEFAULT 'A1',
      objectif         TEXT,
      statut           TEXT DEFAULT 'Actif',
      date_inscription DATE DEFAULT CURRENT_DATE,
      notes            TEXT,
      created_at       TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE etudiants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "etudiants_auth" ON etudiants FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 3. CLASSES ──────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE classes (
      id          BIGSERIAL PRIMARY KEY,
      nom         TEXT NOT NULL,
      niveau      TEXT DEFAULT 'A1',
      nb_max      INTEGER DEFAULT 10,
      description TEXT,
      statut      TEXT DEFAULT 'Active',
      created_at  TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "classes_auth" ON classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE classes ADD COLUMN IF NOT EXISTS formateur_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS formateur_nom TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS horaire       TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS programme     TEXT;


-- ── 4. INSCRIPTIONS_CLASSES ─────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE inscriptions_classes (
      id          BIGSERIAL PRIMARY KEY,
      etudiant_id BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
      classe_id   BIGINT REFERENCES classes(id)   ON DELETE CASCADE,
      date_debut  DATE DEFAULT CURRENT_DATE,
      statut      TEXT DEFAULT 'Actif',
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(etudiant_id, classe_id)
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE inscriptions_classes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "inscr_auth" ON inscriptions_classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 5. PAIEMENTS ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE paiements (
      id            BIGSERIAL PRIMARY KEY,
      etudiant_id   BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
      etudiant_nom  TEXT,
      montant       NUMERIC(10,2) NOT NULL,
      mode_paiement TEXT DEFAULT 'Especes',
      motif         TEXT DEFAULT 'Frais de scolarite',
      reference     TEXT,
      statut        TEXT DEFAULT 'Paye',
      date_paiement DATE DEFAULT CURRENT_DATE,
      notes         TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "paiements_auth" ON paiements FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 6. SEANCES ──────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE seances (
      id            BIGSERIAL PRIMARY KEY,
      titre         TEXT NOT NULL,
      formateur_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      formateur_nom TEXT,
      date_seance   DATE NOT NULL,
      heure_debut   TIME,
      heure_fin     TIME,
      niveau        TEXT DEFAULT 'A1',
      module        TEXT,
      objectifs     TEXT,
      statut        TEXT DEFAULT 'Planifiee',
      notes         TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE seances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "seances_auth" ON seances FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Colonne v6 : lien classe pour le suivi des presences
ALTER TABLE seances ADD COLUMN IF NOT EXISTS classe_id BIGINT REFERENCES classes(id) ON DELETE SET NULL;


-- ── 7. PRESENCES ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE presences (
      id          BIGSERIAL PRIMARY KEY,
      seance_id   BIGINT REFERENCES seances(id)   ON DELETE CASCADE,
      etudiant_id BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
      present     SMALLINT DEFAULT 0,
      notes       TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(seance_id, etudiant_id)
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE presences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "presences_auth" ON presences FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 8. EVALUATIONS ──────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE evaluations (
      id           BIGSERIAL PRIMARY KEY,
      etudiant_id  BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
      etudiant_nom TEXT,
      titre        TEXT NOT NULL,
      type_eval    TEXT DEFAULT 'Controle',
      note         NUMERIC(5,2),
      note_max     NUMERIC(5,2) DEFAULT 20,
      date_eval    DATE DEFAULT CURRENT_DATE,
      commentaire  TEXT,
      created_at   TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "eval_auth" ON evaluations FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS matiere       TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS chapitre      TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS appreciation  TEXT DEFAULT 'Bien';
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS formateur_nom TEXT;


-- ── 9. RAPPORTS_COACHING ────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE rapports_coaching (
      id               BIGSERIAL PRIMARY KEY,
      formateur_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      formateur_nom    TEXT,
      etudiant_nom     TEXT,
      date_seance      DATE DEFAULT CURRENT_DATE,
      contenu_complet  TEXT,
      objectifs        TEXT,
      prochaine_seance TEXT,
      progression      TEXT DEFAULT 'Bonne',
      created_at       TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE rapports_coaching ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "rapports_auth" ON rapports_coaching FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "rapports_anon_insert" ON rapports_coaching FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 10. QUIZ_QUESTIONS ──────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE quiz_questions (
      id          BIGSERIAL PRIMARY KEY,
      niveau      TEXT DEFAULT 'A1',
      type_q      TEXT DEFAULT 'QCM',
      question    TEXT NOT NULL,
      options     JSONB,
      reponse     TEXT NOT NULL,
      explication TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "quiz_auth" ON quiz_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "quiz_anon_read" ON quiz_questions FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 11. SOUMISSIONS_EVALUATIONS ─────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE soumissions_evaluations (
      id               BIGSERIAL PRIMARY KEY,
      evaluation_titre TEXT NOT NULL DEFAULT 'Evaluation en ligne',
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
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE soumissions_evaluations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "soum_anon_insert" ON soumissions_evaluations FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "soum_auth_all" ON soumissions_evaluations FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 12. DEVOIRS ─────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE devoirs (
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
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE devoirs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "devoirs_anon_insert" ON devoirs FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "devoirs_auth" ON devoirs FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 13. DEPENSES ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE depenses (
      id            BIGSERIAL PRIMARY KEY,
      categorie     TEXT NOT NULL DEFAULT 'Autre',
      description   TEXT NOT NULL,
      montant       NUMERIC(10,2) NOT NULL,
      date_depense  DATE DEFAULT CURRENT_DATE,
      mode_paiement TEXT DEFAULT 'Especes',
      justificatif  TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE depenses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "depenses_auth" ON depenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 14. PLANS_PAIEMENT ──────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE plans_paiement (
      id              BIGSERIAL PRIMARY KEY,
      etudiant_id     BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
      etudiant_nom    TEXT,
      total_formation NUMERIC(10,2) NOT NULL,
      nb_echeances    INTEGER DEFAULT 1,
      date_debut      DATE DEFAULT CURRENT_DATE,
      statut          TEXT DEFAULT 'En cours',
      notes           TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE plans_paiement ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "plans_auth" ON plans_paiement FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 15. ECHEANCES ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE echeances (
      id            BIGSERIAL PRIMARY KEY,
      plan_id       BIGINT REFERENCES plans_paiement(id) ON DELETE CASCADE,
      etudiant_id   BIGINT REFERENCES etudiants(id)      ON DELETE CASCADE,
      etudiant_nom  TEXT,
      montant       NUMERIC(10,2) NOT NULL,
      date_echeance DATE NOT NULL,
      statut        TEXT DEFAULT 'En attente',
      date_paiement DATE,
      created_at    TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE echeances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "ech_auth" ON echeances FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 16. PERSONNEL (RH) ──────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE personnel (
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
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "personnel_auth" ON personnel FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 17. FICHES_PAIE (RH) ────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE fiches_paie (
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
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE fiches_paie ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "paie_auth" ON fiches_paie FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 18. CONGES (RH) ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TABLE conges (
      id           BIGSERIAL PRIMARY KEY,
      personnel_id BIGINT REFERENCES personnel(id) ON DELETE CASCADE,
      nom_employe  TEXT NOT NULL,
      poste        TEXT,
      type_conge   TEXT DEFAULT 'Conge annuel',
      date_debut   DATE NOT NULL,
      date_fin     DATE NOT NULL,
      nb_jours     INTEGER,
      motif        TEXT,
      statut       TEXT DEFAULT 'En attente',
      created_at   TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE conges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "conges_auth" ON conges FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- VERIFICATION FINALE
-- ════════════════════════════════════════════════════════════════════
SELECT
  table_name AS "Table",
  'OK' AS "Statut"
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'utilisateurs','etudiants','classes','inscriptions_classes',
    'paiements','seances','presences','evaluations',
    'rapports_coaching','quiz_questions','soumissions_evaluations',
    'devoirs','depenses','plans_paiement','echeances',
    'personnel','fiches_paie','conges'
  )
ORDER BY table_name;
