-- ============================================================
-- AGTM LINGUA SPACE — Migration 002
-- Module Certification + Module Finance & Comptabilité
-- À exécuter dans Supabase SQL Editor APRÈS 001_lingua_schema.sql
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- MODULE CERTIFICATION
-- ════════════════════════════════════════════════════════════

-- Séquences pour numéros automatiques
CREATE SEQUENCE IF NOT EXISTS lingua_certificate_seq START 1;
CREATE SEQUENCE IF NOT EXISTS lingua_receipt_seq     START 1;

-- Tests de niveau officiels
CREATE TABLE IF NOT EXISTS lingua_level_tests (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                     UUID NOT NULL REFERENCES lingua_users(id) ON DELETE CASCADE,
  language                    TEXT NOT NULL CHECK (language IN ('en','fr','es','de')),
  status                      TEXT DEFAULT 'pending'
                              CHECK (status IN ('pending','in_progress','completed','expired','failed')),
  -- Scores par compétence (0-100)
  score_comprehension_orale   INTEGER CHECK (score_comprehension_orale   BETWEEN 0 AND 100),
  score_comprehension_ecrite  INTEGER CHECK (score_comprehension_ecrite  BETWEEN 0 AND 100),
  score_grammaire_vocabulaire INTEGER CHECK (score_grammaire_vocabulaire BETWEEN 0 AND 100),
  score_expression            INTEGER CHECK (score_expression            BETWEEN 0 AND 100),
  score_global                INTEGER CHECK (score_global                BETWEEN 0 AND 100),
  -- Résultat
  level_obtained              TEXT CHECK (level_obtained IN ('A1','A2','B1','B2','C1','C2')),
  passed                      BOOLEAN DEFAULT FALSE,
  -- Données du test
  questions_data              JSONB,   -- Questions générées par Claude
  answers_data                JSONB,   -- Réponses de l'utilisateur
  ai_evaluation               JSONB,   -- Évaluation expression écrite par Claude
  duration_seconds            INTEGER,
  -- Paiement
  payment_ref                 TEXT,
  amount_paid_fcfa            INTEGER DEFAULT 5000,
  -- Timestamps
  started_at                  TIMESTAMPTZ,
  completed_at                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tests_user_lang   ON lingua_level_tests(user_id, language, status);
CREATE INDEX IF NOT EXISTS idx_tests_completed   ON lingua_level_tests(completed_at DESC) WHERE status = 'completed';

-- Certificats émis
CREATE TABLE IF NOT EXISTS lingua_certificates (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_number  TEXT UNIQUE NOT NULL,       -- LINGUA-EN-2025-00042
  user_id             UUID NOT NULL REFERENCES lingua_users(id) ON DELETE CASCADE,
  test_id             UUID NOT NULL REFERENCES lingua_level_tests(id),
  language            TEXT NOT NULL CHECK (language IN ('en','fr','es','de')),
  -- Infos affichées
  recipient_name      TEXT NOT NULL,
  level_certified     TEXT NOT NULL CHECK (level_certified IN ('A1','A2','B1','B2','C1','C2')),
  score_global        INTEGER NOT NULL,
  score_listening     INTEGER,
  score_reading       INTEGER,
  score_grammar       INTEGER,
  score_writing       INTEGER,
  -- Validité
  issued_at           TIMESTAMPTZ DEFAULT NOW(),
  valid_until         TIMESTAMPTZ,                -- +2 ans
  is_valid            BOOLEAN DEFAULT TRUE,
  -- Vérification
  verification_code   TEXT UNIQUE NOT NULL,       -- Code court: ABC12345
  pdf_url             TEXT,                       -- URL Supabase Storage
  pdf_generated_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certs_user     ON lingua_certificates(user_id, language);
CREATE INDEX IF NOT EXISTS idx_certs_verify   ON lingua_certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certs_number   ON lingua_certificates(certificate_number);

-- ════════════════════════════════════════════════════════════
-- MODULE FINANCE & COMPTABILITÉ
-- ════════════════════════════════════════════════════════════

-- Transactions (toutes les entrées/sorties financières)
CREATE TABLE IF NOT EXISTS lingua_transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type             TEXT NOT NULL CHECK (type IN ('subscription','certificate','test','refund','expense','other')),
  direction        TEXT NOT NULL CHECK (direction IN ('income','expense')),
  -- Référence
  subscription_id  UUID REFERENCES lingua_subscriptions(id),
  test_id          UUID REFERENCES lingua_level_tests(id),
  user_id          UUID REFERENCES lingua_users(id),
  -- Montant
  amount_fcfa      INTEGER NOT NULL,
  currency         TEXT DEFAULT 'XOF',
  payment_method   TEXT,
  payment_ref      TEXT,
  -- Description comptable
  description      TEXT NOT NULL,
  category         TEXT CHECK (category IN (
    'abonnement_uni','abonnement_all_access',
    'certificat','test_niveau','repassage',
    'infrastructure','api_claude','marketing',
    'salaires','autre'
  )),
  -- Reçu
  receipt_number   TEXT UNIQUE,                   -- REC-2025-00001
  receipt_pdf_url  TEXT,
  receipt_sent_at  TIMESTAMPTZ,
  -- Statut
  status           TEXT DEFAULT 'confirmed'
                   CHECK (status IN ('pending','confirmed','failed','refunded')),
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_date    ON lingua_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user    ON lingua_transactions(user_id, direction);
CREATE INDEX IF NOT EXISTS idx_transactions_type    ON lingua_transactions(type, status);
CREATE INDEX IF NOT EXISTS idx_transactions_month   ON lingua_transactions(date_trunc('month', transaction_date));

-- Dépenses opérationnelles
CREATE TABLE IF NOT EXISTS lingua_expenses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category     TEXT NOT NULL CHECK (category IN (
    'api_claude','cinetpay_fees','netlify','resend',
    'cloudflare','marketing','salaires','autre'
  )),
  description  TEXT NOT NULL,
  amount_fcfa  INTEGER NOT NULL,
  amount_usd   NUMERIC(10,2),
  exchange_rate NUMERIC(10,4),
  currency     TEXT DEFAULT 'XOF',
  vendor       TEXT,
  invoice_ref  TEXT,
  expense_date TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════
-- VUES ANALYTIQUES
-- ════════════════════════════════════════════════════════════

-- Résumé financier mensuel
CREATE OR REPLACE VIEW lingua_financial_summary AS
SELECT
  date_trunc('month', transaction_date)                                       AS month,
  SUM(CASE WHEN direction='income'  THEN amount_fcfa ELSE 0 END)             AS total_income,
  SUM(CASE WHEN direction='expense' THEN amount_fcfa ELSE 0 END)             AS total_expenses,
  SUM(CASE WHEN direction='income'  THEN amount_fcfa ELSE 0 END) -
  SUM(CASE WHEN direction='expense' THEN amount_fcfa ELSE 0 END)             AS net_result,
  COUNT(CASE WHEN type='subscription' AND direction='income' THEN 1 END)     AS new_subscriptions,
  COUNT(CASE WHEN type='certificate'  AND direction='income' THEN 1 END)     AS certificates_sold,
  COUNT(CASE WHEN type='test'         AND direction='income' THEN 1 END)     AS tests_taken,
  ROUND(
    SUM(CASE WHEN direction='income' THEN amount_fcfa ELSE 0 END)::numeric /
    NULLIF(SUM(amount_fcfa), 0) * 100, 2
  )                                                                           AS margin_pct
FROM lingua_transactions
WHERE status = 'confirmed'
GROUP BY date_trunc('month', transaction_date)
ORDER BY month DESC;

-- Détail des abonnés actifs
CREATE OR REPLACE VIEW lingua_active_subscribers AS
SELECT
  lu.id, lu.full_name, lu.email, lu.phone, lu.country,
  ls.plan_type, ls.selected_language,
  ls.amount_fcfa, ls.payment_method,
  ls.started_at, ls.expires_at,
  ls.auto_renew,
  -- Progression
  (SELECT COUNT(*) FROM lingua_progress lp WHERE lp.user_id = lu.id) AS languages_active,
  (SELECT SUM(xp_points) FROM lingua_progress lp WHERE lp.user_id = lu.id) AS total_xp,
  -- Certificats
  (SELECT COUNT(*) FROM lingua_certificates lc WHERE lc.user_id = lu.id) AS certificates_count
FROM lingua_users lu
JOIN lingua_subscriptions ls ON ls.user_id = lu.id
WHERE ls.status = 'active'
ORDER BY ls.started_at DESC;

-- ════════════════════════════════════════════════════════════
-- FONCTIONS UTILITAIRES
-- ════════════════════════════════════════════════════════════

-- Génère un numéro de certificat unique
CREATE OR REPLACE FUNCTION generate_certificate_number(lang TEXT)
RETURNS TEXT AS $$
DECLARE
  seq_val BIGINT;
  year_val TEXT;
BEGIN
  seq_val  := nextval('lingua_certificate_seq');
  year_val := EXTRACT(YEAR FROM NOW())::TEXT;
  RETURN 'LINGUA-' || UPPER(lang) || '-' || year_val || '-' || LPAD(seq_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Génère un numéro de reçu unique
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  seq_val  BIGINT;
  year_val TEXT;
BEGIN
  seq_val  := nextval('lingua_receipt_seq');
  year_val := EXTRACT(YEAR FROM NOW())::TEXT;
  RETURN 'REC-' || year_val || '-' || LPAD(seq_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Expire automatiquement les tests non complétés après 24h
CREATE OR REPLACE FUNCTION expire_pending_tests()
RETURNS void AS $$
BEGIN
  UPDATE lingua_level_tests
  SET status = 'expired'
  WHERE status IN ('pending','in_progress')
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Invalide les certificats expirés
CREATE OR REPLACE FUNCTION invalidate_expired_certificates()
RETURNS void AS $$
BEGIN
  UPDATE lingua_certificates
  SET is_valid = FALSE
  WHERE is_valid = TRUE
    AND valid_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

ALTER TABLE lingua_level_tests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lingua_certificates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lingua_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lingua_expenses      ENABLE ROW LEVEL SECURITY;

-- Tests : accès par le propriétaire uniquement
CREATE POLICY "Users manage own tests"
  ON lingua_level_tests FOR ALL
  USING (user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid()));

-- Certificats : lecture par le propriétaire + lecture publique via verification_code
CREATE POLICY "Users see own certificates"
  ON lingua_certificates FOR SELECT
  USING (user_id IN (SELECT id FROM lingua_users WHERE id = auth.uid()));

-- Certificats : vérification publique (sans auth) via verification_code
CREATE POLICY "Public certificate verification"
  ON lingua_certificates FOR SELECT
  USING (TRUE);  -- Filtrage par verification_code fait dans l'application

-- Transactions : accès admin uniquement (service role via Edge Functions)
-- Pas de politique RLS publique = uniquement accessible via service_role key

-- ════════════════════════════════════════════════════════════
-- CRON JOBS (à configurer dans Supabase Dashboard)
-- ════════════════════════════════════════════════════════════
-- Dashboard → Database → Cron Jobs :
--
-- 1. expire_pending_tests
--    Schedule : 0 * * * *  (toutes les heures)
--    Command  : SELECT expire_pending_tests();
--
-- 2. invalidate_expired_certificates
--    Schedule : 0 3 * * *  (tous les jours à 3h)
--    Command  : SELECT invalidate_expired_certificates();
--
-- 3. expire_subscriptions (depuis 001)
--    Schedule : 0 2 * * *  (tous les jours à 2h)
--    Command  : SELECT expire_subscriptions();