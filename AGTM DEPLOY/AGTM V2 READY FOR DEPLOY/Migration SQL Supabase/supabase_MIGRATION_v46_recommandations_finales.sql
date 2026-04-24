-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION v46 — Recommandations Finales (11. Audit)
-- Regroupe les 7 recommandations de la section 11 du rapport d'audit
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- ═══════════════════════════════════════════════════════════════════════════════

-- ================================================================
-- RECO ② : Liaison modules ↔ questions
-- Ajout de module_id et lecon_id dans quiz_questions
-- Permet d'associer chaque question à un module et/ou leçon
-- ================================================================
ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS module_id       TEXT,    -- ex: 'gram_b1_m1', 'toeic_m2'
  ADD COLUMN IF NOT EXISTS lecon_id        TEXT,    -- ID de leçon spécifique (optionnel)
  ADD COLUMN IF NOT EXISTS difficulty      TEXT DEFAULT 'MOYEN', -- 'FACILE' | 'MOYEN' | 'DIFFICILE'
  ADD COLUMN IF NOT EXISTS tags            JSONB;   -- Tags libres pour filtrage

COMMENT ON COLUMN quiz_questions.module_id   IS 'ID du module associé (ex: gram_b1_m1, voc_a1_m2)';
COMMENT ON COLUMN quiz_questions.lecon_id    IS 'ID de la leçon spécifique (optionnel, sous-niveau)';
COMMENT ON COLUMN quiz_questions.difficulty  IS 'Niveau de difficulté de la question';
COMMENT ON COLUMN quiz_questions.tags        IS 'Tags pour filtrage et catégorisation avancée';

CREATE INDEX IF NOT EXISTS idx_quiz_questions_module_id ON quiz_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);

-- ================================================================
-- RECO ⑥ : Mapping certifications explicite
-- Ajout du champ certification (TOEIC/TOEFL/IELTS) dans quiz_questions
-- ================================================================
ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS certification   TEXT;    -- 'TOEIC' | 'TOEFL' | 'IELTS' | 'BEPC' | 'BAC' | NULL

COMMENT ON COLUMN quiz_questions.certification IS 'Certification associée : TOEIC, TOEFL, IELTS, BEPC, BAC ou NULL si usage général';

CREATE INDEX IF NOT EXISTS idx_quiz_questions_certification ON quiz_questions(certification);

-- ================================================================
-- RECO ④ : Durée configurable des tests
-- Ajout de durée_max_minutes dans quiz_questions + table config
-- ================================================================
-- Durée configurable par question
ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS duree_max_secondes INTEGER DEFAULT 30;  -- secondes max par question

COMMENT ON COLUMN quiz_questions.duree_max_secondes IS 'Durée max en secondes pour répondre à cette question (défaut: 30s)';

-- Table de configuration générale des tests
CREATE TABLE IF NOT EXISTS config_tests (
    id                BIGSERIAL PRIMARY KEY,
    cle               TEXT UNIQUE NOT NULL,          -- 'duree_test_placement', 'duree_test_module', etc.
    valeur            TEXT NOT NULL,
    description       TEXT,
    updated_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE config_tests IS 'Configuration centralisée des durées et paramètres des tests';

-- Insertion des valeurs par défaut
INSERT INTO config_tests (cle, valeur, description) VALUES
  ('duree_test_placement', '30', 'Durée par défaut (en minutes) des tests de placement'),
  ('duree_test_module',    '20', 'Durée par défaut (en minutes) des évaluations de module'),
  ('duree_test_quiz_video','5',  'Durée par défaut (en minutes) des quiz vidéo English Corner'),
  ('score_min_validation', '60', 'Score minimum en % pour valider une évaluation'),
  ('nb_tentatives_max',    '3',  'Nombre maximum de tentatives autorisées par test')
ON CONFLICT (cle) DO NOTHING;

ALTER TABLE config_tests ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour config_tests
DROP POLICY IF EXISTS "config_tests_auth" ON config_tests;
CREATE POLICY "config_tests_auth" ON config_tests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "config_tests_anon_read" ON config_tests;
CREATE POLICY "config_tests_anon_read" ON config_tests
    FOR SELECT TO anon USING (true);

-- ================================================================
-- RECO ③ : Notifications soumission devoir
-- Trigger + Fonction pour notifier le formateur
-- ================================================================

-- Table de notifications
CREATE TABLE IF NOT EXISTS notifications (
    id                BIGSERIAL PRIMARY KEY,
    type              TEXT NOT NULL,                -- 'devoir_soumis', 'eval_terminee', 'message', 'alerte'
    titre             TEXT NOT NULL,
    message           TEXT NOT NULL,
    destinataire_id   BIGINT REFERENCES personnel(id) ON DELETE SET NULL,
    destinataire_email TEXT,                        -- Email du formateur/personnel
    destinataire_phone TEXT,                        -- WhatsApp / Téléphone
    canal             TEXT DEFAULT 'email',         -- 'email' | 'whatsapp' | 'both'
    statut            TEXT DEFAULT 'EN_ATTENTE',    -- 'EN_ATTENTE' | 'ENVOYE' | 'ECHEC'
    reference_id      BIGINT,                      -- ID de la référence (devoir_id, etc.)
    reference_type    TEXT,                        -- 'devoir', 'evaluation', 'seance'
    lu                BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    sent_at           TIMESTAMPTZ
);

COMMENT ON TABLE notifications IS 'Notifications internes et externes (email/WhatsApp)';
COMMENT ON COLUMN notifications.canal IS 'Canal de notification : email, whatsapp, both';

CREATE INDEX IF NOT EXISTS idx_notifications_destinataire ON notifications(destinataire_id);
CREATE INDEX IF NOT EXISTS idx_notifications_statut ON notifications(statut);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_auth" ON notifications;
CREATE POLICY "notifications_auth" ON notifications
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Ajout de colonnes pour les notifications dans devoirs
ALTER TABLE devoirs
  ADD COLUMN IF NOT EXISTS formateur_id        BIGINT REFERENCES personnel(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notification_envoyee BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN devoirs.formateur_id         IS 'Référence au formateur dans la table personnel';
COMMENT ON COLUMN devoirs.notification_envoyee  IS 'Indique si la notification a été envoyée au formateur';

-- Fonction trigger : notification à la soumission d'un devoir
CREATE OR REPLACE FUNCTION fn_notifier_soumission_devoir()
RETURNS TRIGGER AS $$
DECLARE
    v_formateur_nom   TEXT;
    v_formateur_email TEXT;
    v_formateur_phone TEXT;
BEGIN
    -- Déterminer le formateur : par formateur_id ou par correspondance de nom
    IF NEW.formateur_id IS NOT NULL THEN
        SELECT p.nom || ' ' || p.prenom, p.email, p.telephone
        INTO v_formateur_nom, v_formateur_email, v_formateur_phone
        FROM personnel p WHERE p.id = NEW.formateur_id;
    ELSIF NEW.formateur_nom IS NOT NULL THEN
        -- Essayer de trouver un formateur par nom approximatif
        SELECT p.nom || ' ' || p.prenom, p.email, p.telephone
        INTO v_formateur_nom, v_formateur_email, v_formateur_phone
        FROM personnel p
        WHERE NEW.formateur_nom ILIKE '%' || p.prenom || '%'
           OR NEW.formateur_nom ILIKE '%' || p.nom || '%'
           OR (p.prenom || ' ' || p.nom) ILIKE '%' || NEW.formateur_nom || '%'
        LIMIT 1;
    END IF;

    -- Créer la notification si on a un destinataire
    IF v_formateur_nom IS NOT NULL THEN
        INSERT INTO notifications (
            type, titre, message,
            destinataire_id, destinataire_email, destinataire_phone,
            canal, reference_id, reference_type, statut
        ) VALUES (
            'devoir_soumis',
            '📝 Nouveau devoir soumis',
            CASE
                WHEN v_formateur_nom IS NOT NULL
                THEN 'L''étudiant ' || NEW.etudiant_nom || ' a soumis le devoir "' || NEW.titre || '" le ' || TO_CHAR(NEW.created_at, 'DD/MM/YYYY à HH24:MI') || '.'
                ELSE 'Un étudiant a soumis le devoir "' || NEW.titre || '". Connectez-vous pour le consulter.'
            END,
            NEW.formateur_id,
            v_formateur_email,
            v_formateur_phone,
            CASE
                WHEN v_formateur_email IS NOT NULL AND v_formateur_phone IS NOT NULL THEN 'both'
                WHEN v_formateur_phone IS NOT NULL THEN 'whatsapp'
                ELSE 'email'
            END,
            NEW.id,
            'devoir',
            'EN_ATTENTE'
        );
        NEW.notification_envoyee = TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur insertion dans devoirs
DROP TRIGGER IF EXISTS trg_soumission_devoir_notification ON devoirs;
CREATE TRIGGER trg_soumission_devoir_notification
    BEFORE INSERT ON devoirs
    FOR EACH ROW
    EXECUTE FUNCTION fn_notifier_soumission_devoir();

-- ================================================================
-- RECO ① : Sélecteur formateur dédié
-- Vue matérialisée pour le sélecteur de formateurs
-- ================================================================
CREATE OR REPLACE VIEW v_formateurs_select AS
SELECT
    id,
    nom,
    prenom,
    nom || ' ' || prenom AS nom_complet,
    poste,
    email,
    telephone,
    statut
FROM personnel
WHERE statut = 'Actif'
  AND (poste ILIKE '%formateur%' OR poste ILIKE '%enseignant%' OR poste ILIKE '%directeur%')
ORDER BY nom, prenom;

COMMENT ON VIEW v_formateurs_select IS 'Vue pour le sélecteur de formateurs (membre du personnel actif avec rôle formateur/enseignant)';

-- ================================================================
-- RECO ⑦ : Timer quiz dashboard
-- Ajout d'un champ timer_dashboard dans la config
-- ================================================================
INSERT INTO config_tests (cle, valeur, description) VALUES
  ('timer_actif_dashboard', 'true', 'Afficher le timer dans les quiz du dashboard (true/false)'),
  ('timer_dashboard_secondes', '600', 'Timer par défaut en secondes pour les quiz dashboard (10 min)')
ON CONFLICT (cle) DO NOTHING;

-- ================================================================
-- MISE À JOUR DES POLICIES EXISTANTES
-- ================================================================

-- Policy pour anon sur devoirs : UPDATE pour notifier
DROP POLICY IF EXISTS "devoirs_anon_insert" ON devoirs;
CREATE POLICY "devoirs_anon_insert" ON devoirs
    FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "devoirs_auth" ON devoirs;
CREATE POLICY "devoirs_auth" ON devoirs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ================================================================
-- VÉRIFICATION FINALE
-- ================================================================
SELECT
    'MIGRATION v46 EXECUTED' AS statut,
    COUNT(DISTINCT qq.id) AS total_quiz_questions,
    COUNT(DISTINCT p.id) AS total_personnel_actif,
    COUNT(DISTINCT d.id) AS total_devoirs,
    (SELECT COUNT(*) FROM notifications) AS total_notifications,
    (SELECT COUNT(*) FROM config_tests) AS total_configs
FROM quiz_questions qq
CROSS JOIN personnel p
CROSS JOIN devoirs d
LIMIT 1;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Fin de la migration v46 — 7 Recommandations Finales
-- Propriété intellectuelle : ISSA BAMBA — AGTM Digital Academy © 2026
-- ═══════════════════════════════════════════════════════════════════════════════
