-- ============================================================
--  Migration v29 — Gestion marketing autonome
--  Table : marketing_config (clé-valeur éditable par l'admin
--          ou le responsable marketing, sans accès au code)
--  © 2026 AGTM Academy — Issa Bamba
-- ============================================================

-- ── Table marketing_config ───────────────────────────────────
CREATE TABLE IF NOT EXISTS marketing_config (
  cle         text PRIMARY KEY,
  valeur      text NOT NULL DEFAULT '',
  description text DEFAULT '',
  updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE marketing_config ENABLE ROW LEVEL SECURITY;

-- Lecture : tout utilisateur authentifié
CREATE POLICY "mkt_config_read" ON marketing_config
  FOR SELECT TO authenticated USING (true);

-- Écriture : admin ou secrétaire uniquement
CREATE POLICY "mkt_config_write" ON marketing_config
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM utilisateurs
      WHERE id = auth.uid()
        AND role IN ('admin','secretaire')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM utilisateurs
      WHERE id = auth.uid()
        AND role IN ('admin','secretaire')
    )
  );

-- ── Valeurs par défaut ───────────────────────────────────────
INSERT INTO marketing_config (cle, valeur, description) VALUES
  -- Inscriptions
  ('inscription_ouverte',   'true',
   'Inscriptions ouvertes (true) ou fermées (false)'),
  ('periode_inscription',   'Inscriptions ouvertes toute l''année',
   'Texte affiché pour la période d''inscription'),
  ('prochaine_rentree',     '',
   'Date de la prochaine rentrée (ex: 3 février 2026)'),
  ('contact_inscription',   '+225 XX XX XX XX XX',
   'Numéro WhatsApp/Tel pour les inscriptions'),
  ('offre_speciale',        '',
   'Offre spéciale en cours — laisser vide si aucune'),

  -- Messages marketing
  ('message_accueil',
   'Rejoignez AGTM Digital Academy et transformez votre avenir avec l''anglais.',
   'Slogan affiché en haut de la page de présentation'),
  ('message_cta',
   'Commencez votre parcours aujourd''hui — +500 apprenants formés',
   'Texte du bouton d''appel à l''action'),

  -- Statistiques affichées publiquement
  ('stats_apprenants',      '500+',  'Nombre d''apprenants formés'),
  ('stats_satisfaction',    '95%',   'Taux de satisfaction'),
  ('stats_formateurs',      '8+',    'Nombre de formateurs certifiés'),
  ('stats_niveaux',         '6',     'Nombre de niveaux CECRL'),
  ('stats_modes',           '3',     'Nombre de modes de cours'),

  -- Tarifs des formations (affichés dans les fiches)
  ('prix_general',          '35 000 FCFA/mois',
   'Prix Anglais Général'),
  ('prix_business',         '50 000 FCFA/mois',
   'Prix Business English'),
  ('prix_toeic',            '60 000 FCFA/mois',
   'Prix Préparation TOEIC'),
  ('prix_toefl',            '65 000 FCFA/mois',
   'Prix Préparation TOEFL'),
  ('prix_bac_bepc',         '30 000 FCFA/mois',
   'Prix Préparation BAC/BEPC'),
  ('prix_kids',             '25 000 FCFA/mois',
   'Prix Kids & Teens English'),
  ('prix_depart',           '25 000',
   'Prix de départ affiché (chiffre seul, sans unité)'),

  -- Tiers IA (prix affichés en marketing)
  ('prix_ia_recommande',    '+2 000 FCFA/mois',
   'Supplément mensuel tier IA Recommandé'),
  ('prix_ia_premium',       '+4 000 FCFA/mois',
   'Supplément mensuel tier IA Premium')

ON CONFLICT (cle) DO NOTHING;

-- ── Index ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_mkt_config_updated ON marketing_config (updated_at DESC);
