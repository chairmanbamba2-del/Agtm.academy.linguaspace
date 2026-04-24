-- ════════════════════════════════════════════════════════════════════
-- AGTM GLOBAL ACADEMY — MIGRATION v8
-- Nouveaux champs : format & programme sur séances
-- Nouvelles policies anon : pointage_form (feuille de présence publique)
-- SAFE : aucune donnée existante supprimée
-- ════════════════════════════════════════════════════════════════════

-- ── 1. COLONNES SÉANCES ──────────────────────────────────────────────
ALTER TABLE seances ADD COLUMN IF NOT EXISTS format    TEXT DEFAULT 'Groupe';
ALTER TABLE seances ADD COLUMN IF NOT EXISTS programme TEXT DEFAULT 'Général';
ALTER TABLE seances ADD COLUMN IF NOT EXISTS sujet     TEXT;
ALTER TABLE seances ADD COLUMN IF NOT EXISTS enseignant TEXT;
ALTER TABLE seances ADD COLUMN IF NOT EXISTS heure_fin  TEXT;


-- ── 2. POLICIES ANON — SEANCES (lecture pour le formulaire public) ────
DO $$ BEGIN
  CREATE POLICY "seances_anon_read" ON seances FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "seances_anon_update_statut" ON seances FOR UPDATE TO anon
    USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 3. POLICIES ANON — PERSONNEL (vérification matricule formateur) ───
DO $$ BEGIN
  CREATE POLICY "personnel_anon_read" ON personnel FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 4. POLICIES ANON — ETUDIANTS (vérification N° dossier) ───────────
DO $$ BEGIN
  CREATE POLICY "etudiants_anon_read" ON etudiants FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 5. POLICIES ANON — PRESENCES (insertion depuis formulaire public) ─
DO $$ BEGIN
  CREATE POLICY "presences_anon_insert" ON presences FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "presences_anon_upsert" ON presences FOR UPDATE TO anon USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "presences_anon_read" ON presences FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── VÉRIFICATION ─────────────────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'seances'
  AND column_name  IN ('format','programme','sujet','enseignant')
ORDER BY column_name;
