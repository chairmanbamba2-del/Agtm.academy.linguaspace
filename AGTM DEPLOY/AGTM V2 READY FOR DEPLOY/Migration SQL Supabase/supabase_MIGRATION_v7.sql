-- ════════════════════════════════════════════════════════════════════
-- AGTM GLOBAL ACADEMY — MIGRATION v7
-- Nouvelles tables : cours_ressources, finances_perso, candidatures
-- SAFE : aucune donnée existante supprimée
-- ════════════════════════════════════════════════════════════════════

-- ── 1. COURS_RESSOURCES (liens de cours, tests, évals, devoirs) ──
DO $$ BEGIN
  CREATE TABLE cours_ressources (
      id          BIGSERIAL PRIMARY KEY,
      titre       TEXT NOT NULL,
      type        TEXT NOT NULL DEFAULT 'cours',  -- cours|test|evaluation|devoir
      niveau      TEXT DEFAULT 'A1',
      description TEXT,
      url         TEXT NOT NULL,
      ordre       INTEGER DEFAULT 1,
      created_at  TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE cours_ressources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "cours_auth" ON cours_ressources FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cours_anon_read" ON cours_ressources FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 2. FINANCES_PERSO (finances personnelles ISSA BAMBA) ─────────
DO $$ BEGIN
  CREATE TABLE finances_perso (
      id          BIGSERIAL PRIMARY KEY,
      type        TEXT NOT NULL DEFAULT 'Entrée',   -- Entrée|Sortie
      categorie   TEXT DEFAULT 'Autre',
      description TEXT NOT NULL,
      montant     NUMERIC(12,2) NOT NULL,
      date_op     DATE DEFAULT CURRENT_DATE,
      notes       TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE finances_perso ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "perso_auth" ON finances_perso FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 3. CANDIDATURES (recrutement formateurs) ─────────────────────
DO $$ BEGIN
  CREATE TABLE candidatures (
      id                BIGSERIAL PRIMARY KEY,
      nom               TEXT NOT NULL,
      prenom            TEXT NOT NULL,
      email             TEXT,
      telephone         TEXT,
      poste             TEXT DEFAULT 'Formateur d''anglais',
      niveau_etudes     TEXT,
      experience_annees INTEGER DEFAULT 0,
      matieres          TEXT,
      disponibilites    TEXT,
      motivations       TEXT,
      reponses          JSONB,
      statut            TEXT DEFAULT 'Nouveau',   -- Nouveau|Retenu|Refusé
      created_at        TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "cands_anon_insert" ON candidatures FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cands_auth" ON candidatures FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── VÉRIFICATION ─────────────────────────────────────────────────
SELECT table_name AS "Table", 'OK' AS "Statut"
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('cours_ressources','finances_perso','candidatures')
ORDER BY table_name;
