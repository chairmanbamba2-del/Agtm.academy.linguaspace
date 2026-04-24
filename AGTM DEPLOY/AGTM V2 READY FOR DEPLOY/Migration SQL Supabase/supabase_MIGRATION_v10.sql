-- ══════════════════════════════════════════════════════════════════
-- AGTM Global Academy — Migration v10
-- Table : candidatures (formulaire recrutement formateurs)
-- Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS candidatures (
    id                  BIGSERIAL PRIMARY KEY,
    nom                 TEXT NOT NULL,
    prenom              TEXT NOT NULL,
    email               TEXT NOT NULL,
    telephone           TEXT,
    poste               TEXT,
    niveau_etudes       TEXT,
    experience_annees   NUMERIC DEFAULT 0,
    matieres            TEXT,
    disponibilites      TEXT,
    motivations         TEXT,
    reponses            JSONB,
    cv_url              TEXT,
    statut              TEXT DEFAULT 'Nouveau',   -- 'Nouveau' | 'En étude' | 'Retenu' | 'Refusé'
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;

-- INSERT public (formulaire web anonyme)
CREATE POLICY "candidatures_anon_insert" ON candidatures
    FOR INSERT TO anon WITH CHECK (true);

-- SELECT/UPDATE/DELETE pour le service_role (logiciel admin)
CREATE POLICY "candidatures_auth_all" ON candidatures
    FOR ALL TO service_role USING (true);

-- Index pour tris fréquents
CREATE INDEX IF NOT EXISTS idx_candidatures_created_at ON candidatures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidatures_statut      ON candidatures(statut);
