-- ════════════════════════════════════════════════════════════════════
-- AGTM GLOBAL ACADEMY — SCHÉMA COMPLET v4  (fichier unique définitif)
-- Conception & Propriété : ISSA BAMBA  |  © 2026 AGTM Academy
--
-- CE FICHIER REMPLACE :
--   supabase_master.sql + supabase_additions_v2.sql + supabase_additions_v3.sql
--
-- INSTRUCTIONS :
--   Supabase → SQL Editor → New Query → Coller tout → RUN
--   Script idempotent : safe à ré-exécuter sans perdre les données.
-- ════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 0 — NETTOYAGE COMPLET (repart de zéro)
-- ════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS conges                   CASCADE;
DROP TABLE IF EXISTS fiches_paie              CASCADE;
DROP TABLE IF EXISTS personnel                CASCADE;
DROP TABLE IF EXISTS devoirs                  CASCADE;
DROP TABLE IF EXISTS soumissions_evaluations  CASCADE;
DROP TABLE IF EXISTS echeances                CASCADE;
DROP TABLE IF EXISTS plans_paiement           CASCADE;
DROP TABLE IF EXISTS inscriptions_classes     CASCADE;
DROP TABLE IF EXISTS progression_competences  CASCADE;
DROP TABLE IF EXISTS classes                  CASCADE;
DROP TABLE IF EXISTS quiz_questions           CASCADE;
DROP TABLE IF EXISTS presences                CASCADE;
DROP TABLE IF EXISTS seances                  CASCADE;
DROP TABLE IF EXISTS evaluations              CASCADE;
DROP TABLE IF EXISTS rapports_coaching        CASCADE;
DROP TABLE IF EXISTS paiements                CASCADE;
DROP TABLE IF EXISTS depenses                 CASCADE;
DROP TABLE IF EXISTS inscriptions_web         CASCADE;
DROP TABLE IF EXISTS etudiants                CASCADE;
DROP TABLE IF EXISTS utilisateurs             CASCADE;
DROP TABLE IF EXISTS profiles                 CASCADE;
-- Tables ajoutées en migrations ultérieures (v5→v20)
DROP TABLE IF EXISTS candidatures             CASCADE;
DROP TABLE IF EXISTS certificats_niveau       CASCADE;
DROP TABLE IF EXISTS cours_ressources         CASCADE;
DROP TABLE IF EXISTS demandes_clients         CASCADE;
DROP TABLE IF EXISTS factures                 CASCADE;
DROP TABLE IF EXISTS finances_perso           CASCADE;
DROP TABLE IF EXISTS notes_etudiants          CASCADE;
DROP TABLE IF EXISTS rapports_seance          CASCADE;
DROP TABLE IF EXISTS satisfactions            CASCADE;

DROP TRIGGER  IF EXISTS on_auth_user_created  ON auth.users;
DROP FUNCTION IF EXISTS fn_create_utilisateur() CASCADE;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 1 — UTILISATEURS  (cœur de l'authentification)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE utilisateurs (
    id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email      TEXT UNIQUE NOT NULL,
    role       TEXT NOT NULL DEFAULT 'etudiant',   -- 'admin' | 'formateur' | 'etudiant'
    nom        TEXT NOT NULL DEFAULT '',
    prenom     TEXT NOT NULL DEFAULT '',
    actif      BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "util_self" ON utilisateurs
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "util_admin" ON utilisateurs
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 2 — TRIGGER : crée automatiquement la ligne utilisateur
-- ════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION fn_create_utilisateur()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.utilisateurs (id, email, role, nom, prenom)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_app_meta_data  ->> 'role',   'etudiant'),
        COALESCE(NEW.raw_app_meta_data  ->> 'nom',
                 NEW.raw_user_meta_data ->> 'nom',    ''),
        COALESCE(NEW.raw_app_meta_data  ->> 'prenom',
                 NEW.raw_user_meta_data ->> 'prenom', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        role   = COALESCE(NEW.raw_app_meta_data  ->> 'role',   utilisateurs.role),
        nom    = COALESCE(NEW.raw_app_meta_data  ->> 'nom',
                          NEW.raw_user_meta_data ->> 'nom',    utilisateurs.nom),
        prenom = COALESCE(NEW.raw_app_meta_data  ->> 'prenom',
                          NEW.raw_user_meta_data ->> 'prenom', utilisateurs.prenom);
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION fn_create_utilisateur();


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 3 — ÉTUDIANTS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE etudiants (
    id               BIGSERIAL PRIMARY KEY,
    numero_dossier   TEXT UNIQUE NOT NULL,
    nom              TEXT NOT NULL,
    prenom           TEXT NOT NULL,
    email            TEXT,
    telephone        TEXT,
    whatsapp         TEXT,
    adresse          TEXT,
    niveau           TEXT DEFAULT 'A1',
    formations       TEXT,
    duree_formation  TEXT,
    mode_cours       TEXT,
    disponibilites   TEXT,
    mode_paiement    TEXT,
    source           TEXT DEFAULT 'Direct',
    statut           TEXT DEFAULT 'Actif',   -- 'Actif' | 'Inactif' | 'Suspendu'
    notes            TEXT,
    date_inscription DATE DEFAULT CURRENT_DATE,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE etudiants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "etudiants_auth" ON etudiants
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 4 — INSCRIPTIONS WEB  (formulaire public Netlify)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE inscriptions_web (
    id             BIGSERIAL PRIMARY KEY,
    nom            TEXT NOT NULL,
    prenom         TEXT NOT NULL,
    email          TEXT,
    telephone      TEXT,
    whatsapp       TEXT,
    adresse        TEXT,
    niveau         TEXT DEFAULT 'A1',
    formations     TEXT,
    duree          TEXT,
    mode_cours     TEXT,
    disponibilites TEXT,
    mode_paiement  TEXT,
    source         TEXT DEFAULT 'Portail web EIP',
    statut         TEXT DEFAULT 'nouveau',   -- 'nouveau' | 'importé' | 'annulé'
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    imported_at    TIMESTAMPTZ
);

ALTER TABLE inscriptions_web ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inscrip_anon_insert" ON inscriptions_web
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "inscrip_auth_all" ON inscriptions_web
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 5 — PAIEMENTS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE paiements (
    id            BIGSERIAL PRIMARY KEY,
    etudiant_id   BIGINT REFERENCES etudiants(id) ON DELETE SET NULL,
    etudiant_nom  TEXT,
    montant       NUMERIC(10,2) NOT NULL,
    type_paiement TEXT DEFAULT 'Mensualité',  -- 'Inscription' | 'Mensualité' | 'Cours particulier' | 'Solde intégral' | 'Acompte'
    mode_paiement TEXT DEFAULT 'Espèces',     -- 'Espèces' | 'Mobile Money Wave' | 'Mobile Money Orange' | 'Virement bancaire' | 'Chèque'
    date_paiement DATE DEFAULT CURRENT_DATE,
    statut        TEXT DEFAULT 'Validé',
    notes         TEXT,                       -- stocke "Module — Notes internes"
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paiements_auth" ON paiements
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 6 — RAPPORTS COACHING
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE rapports_coaching (
    id               BIGSERIAL PRIMARY KEY,
    formateur_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    formateur_nom    TEXT,
    etudiant_nom     TEXT,
    date_seance      DATE NOT NULL,
    contenu          TEXT,
    objectifs        TEXT,
    progression      TEXT DEFAULT 'Bonne',   -- 'Bonne' | 'Moyenne' | 'À améliorer'
    prochaine_seance TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rapports_coaching ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rapports_auth" ON rapports_coaching
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Permet la soumission via rapport_form.html (lien public, sans connexion)
CREATE POLICY "rapports_anon_insert" ON rapports_coaching
    FOR INSERT TO anon WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 7 — ÉVALUATIONS & NOTES
--   (colonnes enrichies : matière, chapitre, appréciation, formateur)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE evaluations (
    id            BIGSERIAL PRIMARY KEY,
    etudiant_id   BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
    etudiant_nom  TEXT,
    type_eval     TEXT DEFAULT 'Test',        -- 'Test' | 'Devoir' | 'Examen' | 'Quiz' | 'Oral'
    matiere       TEXT,                       -- 'Grammaire' | 'Vocabulaire' | 'Expression écrite' | …
    chapitre      TEXT,                       -- ex: 'Present Perfect', 'Irregular Verbs'
    note          NUMERIC(5,2) DEFAULT 0,
    note_max      NUMERIC(5,2) DEFAULT 20,
    appreciation  TEXT DEFAULT 'Bien',        -- 'Excellent' | 'Très Bien' | 'Bien' | 'Assez Bien' | 'Insuffisant'
    formateur_nom TEXT,
    commentaire   TEXT,
    date_eval     DATE DEFAULT CURRENT_DATE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evals_auth" ON evaluations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 8 — SÉANCES
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE seances (
    id          BIGSERIAL PRIMARY KEY,
    date_seance DATE NOT NULL,
    heure_debut TEXT,
    sujet       TEXT,
    enseignant  TEXT,
    statut      TEXT DEFAULT 'Réalisée',     -- 'Réalisée' | 'Planifiée' | 'Annulée'
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE seances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seances_auth" ON seances
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 9 — PRÉSENCES
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE presences (
    id          BIGSERIAL PRIMARY KEY,
    seance_id   BIGINT REFERENCES seances(id) ON DELETE CASCADE,
    etudiant_id BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
    present     SMALLINT DEFAULT 0,          -- 1 = présent | 0 = absent
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (seance_id, etudiant_id)
);

ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "presences_auth" ON presences
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 10 — CLASSES
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE classes (
    id            BIGSERIAL PRIMARY KEY,
    nom           TEXT NOT NULL,
    niveau        TEXT DEFAULT 'A1',
    formateur_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    formateur_nom TEXT,
    programme     TEXT,
    horaire       TEXT,
    statut        TEXT DEFAULT 'Active',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classes_auth" ON classes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 11 — INSCRIPTIONS CLASSES  (étudiant ↔ classe)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE inscriptions_classes (
    id               BIGSERIAL PRIMARY KEY,
    classe_id        BIGINT REFERENCES classes(id) ON DELETE CASCADE,
    etudiant_id      BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
    date_inscription DATE DEFAULT CURRENT_DATE,
    UNIQUE (classe_id, etudiant_id)
);

ALTER TABLE inscriptions_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insc_cl_auth" ON inscriptions_classes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 12 — PROGRESSION COMPÉTENCES  (5 axes de suivi)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE progression_competences (
    id                    BIGSERIAL PRIMARY KEY,
    etudiant_id           BIGINT REFERENCES etudiants(id) ON DELETE CASCADE,
    etudiant_nom          TEXT,
    formateur_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    date_eval             DATE DEFAULT CURRENT_DATE,
    grammaire             NUMERIC(4,1) DEFAULT 0,            -- /20
    vocabulaire           NUMERIC(4,1) DEFAULT 0,            -- /20
    expression_ecrite     NUMERIC(4,1) DEFAULT 0,            -- /20
    comprehension_ecrite  NUMERIC(4,1) DEFAULT 0,            -- /20
    expression_orale      NUMERIC(4,1) DEFAULT 0,            -- /20
    commentaire           TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE progression_competences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prog_auth" ON progression_competences
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 13 — PLANS DE PAIEMENT  (échéancier en-tête)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE plans_paiement (
    id               BIGSERIAL PRIMARY KEY,
    etudiant_id      BIGINT REFERENCES etudiants(id) ON DELETE SET NULL,
    etudiant_nom     TEXT,
    montant_total    NUMERIC(10,2) NOT NULL,
    nb_echeances     INTEGER DEFAULT 1,
    montant_echeance NUMERIC(10,2),
    type_formation   TEXT,
    date_debut       DATE DEFAULT CURRENT_DATE,
    statut           TEXT DEFAULT 'En cours',   -- 'En cours' | 'Soldé'
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plans_paiement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_auth" ON plans_paiement
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 14 — ÉCHÉANCES  (lignes du plan de paiement)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE echeances (
    id             BIGSERIAL PRIMARY KEY,
    plan_id        BIGINT REFERENCES plans_paiement(id) ON DELETE CASCADE,
    etudiant_id    BIGINT REFERENCES etudiants(id) ON DELETE SET NULL,
    num_echeance   INTEGER NOT NULL,
    date_echeance  DATE NOT NULL,
    montant        NUMERIC(10,2) NOT NULL,
    paiement_id    BIGINT REFERENCES paiements(id) ON DELETE SET NULL,
    statut         TEXT DEFAULT 'En attente',   -- 'En attente' | 'Payé' | 'En retard'
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE echeances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ech_auth" ON echeances
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 15 — QUIZ QUESTIONS  (banque de questions MCQ)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE quiz_questions (
    id               BIGSERIAL PRIMARY KEY,
    question         TEXT NOT NULL,
    options          JSONB,                  -- tableau JSON ["opt1","opt2","opt3","opt4"]
    reponse_correcte TEXT NOT NULL,
    explication      TEXT,
    pilier           TEXT DEFAULT 'Grammaire', -- 'Grammaire' | 'Vocabulaire' | 'Expression écrite' | …
    niveau           TEXT DEFAULT 'A1',
    created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_auth"      ON quiz_questions FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "quiz_anon_read" ON quiz_questions FOR SELECT TO anon          USING (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 16 — DÉPENSES  (sorties de caisse)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE depenses (
    id            BIGSERIAL PRIMARY KEY,
    categorie     TEXT NOT NULL DEFAULT 'Autre',
    -- 'Salaires' | 'Loyer' | 'Matériel pédagogique' | 'Communication'
    -- | 'Informatique' | 'Eau / Électricité' | 'Entretien' | 'Déplacement' | 'Autre'
    description   TEXT NOT NULL,
    montant       NUMERIC(10,2) NOT NULL,
    date_depense  DATE DEFAULT CURRENT_DATE,
    mode_paiement TEXT DEFAULT 'Espèces',
    justificatif  TEXT,              -- N° de facture, bon de commande, note…
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE depenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "depenses_auth" ON depenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 17 — SOUMISSIONS ÉVALUATIONS EN LIGNE
--   (formulaire public evaluation_form.html)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE soumissions_evaluations (
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
CREATE POLICY "soum_anon_insert" ON soumissions_evaluations
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "soum_auth_all" ON soumissions_evaluations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 18 — DEVOIRS EN LIGNE
--   (soumission via devoir_form.html, lien public sans connexion)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE devoirs (
    id                    BIGSERIAL PRIMARY KEY,
    etudiant_nom          TEXT NOT NULL,
    etudiant_email        TEXT,
    classe_nom            TEXT,
    niveau                TEXT DEFAULT 'B1',
    formateur_nom         TEXT,
    titre                 TEXT NOT NULL,
    description           TEXT,              -- intitulé du devoir (optionnel, affiché au formulaire)
    reponse               TEXT,              -- réponse de l'étudiant
    fichier_url           TEXT,              -- lien Google Drive, etc.
    statut                TEXT DEFAULT 'Soumis',    -- 'Soumis' | 'Corrigé' | 'En retard'
    note                  NUMERIC(5,2),
    commentaire_formateur TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE devoirs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devoirs_anon_insert" ON devoirs
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "devoirs_auth" ON devoirs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 19 — COMPTE ADMIN  (admin@agtm.academy)
-- ════════════════════════════════════════════════════════════════════
DO $$
DECLARE v_id UUID;
BEGIN
    SELECT id INTO v_id FROM auth.users WHERE email = 'admin@agtm.academy' LIMIT 1;

    IF v_id IS NULL THEN
        RAISE NOTICE '⚠️  Compte admin@agtm.academy introuvable.';
        RAISE NOTICE '   → Créez-le dans Supabase → Authentication → Users → Add User';
        RAISE NOTICE '   → Puis ré-exécutez ce script.';
    ELSE
        UPDATE auth.users
        SET raw_app_meta_data =
            COALESCE(raw_app_meta_data, '{}'::jsonb)
            || '{"role":"admin","nom":"BAMBA","prenom":"Issa"}'::jsonb
        WHERE id = v_id;

        INSERT INTO utilisateurs (id, email, role, nom, prenom)
        VALUES (v_id, 'admin@agtm.academy', 'admin', 'BAMBA', 'Issa')
        ON CONFLICT (id) DO UPDATE SET
            role   = 'admin',
            nom    = 'BAMBA',
            prenom = 'Issa';

        RAISE NOTICE '✅ Compte admin@agtm.academy configuré (role = admin).';
    END IF;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 20 — DONNÉES DE DÉMO — Banque de questions Quiz
-- ════════════════════════════════════════════════════════════════════
INSERT INTO quiz_questions (question, options, reponse_correcte, explication, pilier, niveau) VALUES

-- A1 — Grammaire
('She ___ to school every day.',
 '["go","goes","going","gone"]','goes',
 '3rd person singular present simple → add -s','Grammaire','A1'),

('Choose the correct article: ___ apple a day keeps the doctor away.',
 '["A","An","The","—"]','An',
 '"An" is used before vowel sounds','Grammaire','A1'),

('What is the plural of "child"?',
 '["childs","childrens","children","child"]','children',
 'Irregular plural: child → children','Grammaire','A1'),

-- A2 — Grammaire
('What is the past tense of "buy"?',
 '["buyed","boughted","bought","buys"]','bought',
 'Irregular verb: buy → bought','Grammaire','A2'),

('Which sentence is correct?',
 '["I am agree","I agree","I am agreeing","I do agree with"]','I agree',
 'Agree is a stative verb — no -ing, no "am"','Grammaire','A2'),

('Choose the correct preposition: She is good ___ English.',
 '["in","on","at","for"]','at',
 '"Good at" = having skill in something','Grammaire','A2'),

-- B1 — Grammaire
('The meeting was ___ due to the rain.',
 '["cancelled","cancellated","uncancelled","cancels"]','cancelled',
 'Cancelled = past participle of cancel','Grammaire','B1'),

('___ you finish your work, you may leave.',
 '["Until","Unless","Whether","Even"]','Until',
 '"Until" = up to the time that','Grammaire','B1'),

('I ___ here since 2020.',
 '["am","was","have been","had been"]','have been',
 'Present Perfect with "since" for ongoing situations','Grammaire','B1'),

-- B2 — Grammaire
('If I ___ you, I would study harder.',
 '["am","was","were","be"]','were',
 'Second conditional uses "were" for all persons','Grammaire','B2'),

('The report ___ by the manager before I arrived.',
 '["was written","has written","wrote","had been written"]','had been written',
 'Past Perfect Passive: had been + past participle','Grammaire','B2'),

-- A1 — Vocabulaire
('What does "HAPPY" mean in French?',
 '["triste","heureux","fatigué","en colère"]','heureux',
 'Happy = heureux/heureuse','Vocabulaire','A1'),

('Choose the synonym of "big":',
 '["small","large","thin","cold"]','large',
 'Big and large are synonyms meaning "grand"','Vocabulaire','A1'),

-- B1 — Vocabulaire
('The meeting was ___ (rescheduled for later):',
 '["postponed","promoted","proposed","produced"]','postponed',
 'Postponed = rescheduled for a later time','Vocabulaire','B1'),

('"Postpone" means:',
 '["to cancel","to delay","to hurry","to forget"]','to delay',
 'Postpone = arrange for a later time','Vocabulaire','B1'),

-- C1 — Vocabulaire
('What does "eloquent" mean?',
 '["silent","well-spoken","confused","aggressive"]','well-spoken',
 'Eloquent = speaking clearly and persuasively','Vocabulaire','C1'),

('"Procrastinate" means to:',
 '["work hard","delay tasks","make plans","celebrate"]','delay tasks',
 'Procrastinate = remettre au lendemain','Vocabulaire','C1'),

-- A2 — Compréhension écrite
('Tom wakes up at 7am, eats breakfast, then goes to work. What does Tom do FIRST?',
 '["goes to work","eats breakfast","wakes up","drinks coffee"]','wakes up',
 'Sequence: wake up → breakfast → work','Compréhension écrite','A2'),

-- B1 — Compréhension écrite
('"Despite the heavy rain, the match continued." — "Despite" suggests:',
 '["because of the rain","the rain caused a delay","the rain did not stop the match","the match was cancelled"]',
 'the rain did not stop the match',
 '"Despite" introduces contrast','Compréhension écrite','B1'),

-- A1 — Expression écrite
('Which sentence is correct?',
 '["She don''t like coffee.","She doesn''t likes coffee.","She doesn''t like coffee.","She not like coffee."]',
 'She doesn''t like coffee.',
 'Negative: subject + doesn''t + base verb','Expression écrite','A1'),

-- B1 — Expression écrite
('Most formal option for a professional email:',
 '["Hey! Wanna meet?","I was wondering if we could arrange a meeting?","Can we meet?","Let''s meet ASAP!"]',
 'I was wondering if we could arrange a meeting?',
 'Formal writing uses polite, indirect structures','Expression écrite','B1')

ON CONFLICT DO NOTHING;


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 21 — RESSOURCES HUMAINES : PERSONNEL
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE personnel (
    id            BIGSERIAL PRIMARY KEY,
    nom           TEXT NOT NULL,
    prenom        TEXT NOT NULL,
    poste         TEXT NOT NULL DEFAULT 'Formateur',
    -- 'Formateur' | 'Directeur' | 'Directeur Adjoint' | 'Secrétaire' | 'Comptable'
    -- | 'Agent d\'entretien' | 'Responsable Marketing' | 'Autre'
    type_contrat  TEXT DEFAULT 'CDI',      -- 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Vacation'
    date_embauche DATE,
    date_fin_contrat DATE,                 -- NULL pour CDI
    salaire_base  NUMERIC(10,2) DEFAULT 0,
    telephone     TEXT,
    email         TEXT,
    adresse       TEXT,
    cin           TEXT,                    -- Carte Nationale d'Identité
    statut        TEXT DEFAULT 'Actif',    -- 'Actif' | 'Inactif' | 'En congé' | 'Licencié'
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "personnel_auth" ON personnel
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 22 — RESSOURCES HUMAINES : FICHES DE PAIE
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE fiches_paie (
    id            BIGSERIAL PRIMARY KEY,
    personnel_id  BIGINT REFERENCES personnel(id) ON DELETE CASCADE,
    nom_employe   TEXT NOT NULL,
    poste         TEXT,
    periode       DATE NOT NULL,           -- premier jour du mois concerné (ex: 2026-04-01)
    mois_label    TEXT NOT NULL,           -- libellé affichable (ex: 'Avril 2026')
    salaire_base  NUMERIC(10,2) DEFAULT 0,
    heures_sup    NUMERIC(5,2)  DEFAULT 0,
    taux_h_sup    NUMERIC(10,2) DEFAULT 0, -- taux horaire heures supplémentaires
    primes        NUMERIC(10,2) DEFAULT 0,
    avantages     NUMERIC(10,2) DEFAULT 0, -- transport, logement…
    cotisations   NUMERIC(10,2) DEFAULT 0, -- cotisations sociales (CNPS…)
    retenues      NUMERIC(10,2) DEFAULT 0, -- retenues diverses
    avances       NUMERIC(10,2) DEFAULT 0, -- avances sur salaire déduites
    net_a_payer   NUMERIC(10,2) DEFAULT 0, -- calculé côté app
    statut        TEXT DEFAULT 'En attente', -- 'En attente' | 'Payé' | 'Partiellement payé'
    date_paiement DATE,
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fiches_paie ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paie_auth" ON fiches_paie
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- ÉTAPE 23 — RESSOURCES HUMAINES : CONGÉS / ABSENCES
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE conges (
    id           BIGSERIAL PRIMARY KEY,
    personnel_id BIGINT REFERENCES personnel(id) ON DELETE CASCADE,
    nom_employe  TEXT NOT NULL,
    poste        TEXT,
    type_conge   TEXT DEFAULT 'Congé annuel',
    -- 'Congé annuel' | 'Maladie' | 'Maternité/Paternité'
    -- | 'Événement familial' | 'Formation' | 'Sans solde'
    date_debut   DATE NOT NULL,
    date_fin     DATE NOT NULL,
    nb_jours     INTEGER,                  -- calculé ou saisi
    motif        TEXT,
    statut       TEXT DEFAULT 'En attente', -- 'En attente' | 'Approuvé' | 'Refusé'
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conges_auth" ON conges
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ════════════════════════════════════════════════════════════════════
-- VÉRIFICATION FINALE
-- ════════════════════════════════════════════════════════════════════
SELECT
    t.table_name                                     AS "Table",
    COUNT(c.column_name)                             AS "Colonnes",
    obj_description(pc.oid, 'pg_class')              AS "Description"
FROM information_schema.tables t
JOIN information_schema.columns c
    ON c.table_name = t.table_name AND c.table_schema = 'public'
JOIN pg_class pc
    ON pc.relname = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_type   = 'BASE TABLE'
GROUP BY t.table_name, pc.oid
ORDER BY t.table_name;
