-- ============================================================
-- Migration 016 : Permissions IA et contrôle d'accès
-- Ajoute le support multi-fournisseurs (Anthropic, Groq, DeepSeek)
-- avec contrôle admin des modèles accessibles par utilisateur
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLE : Permissions IA par utilisateur
-- Permet à l'admin de contrôler quels modèles IA sont accessibles
-- pour chaque utilisateur ou groupe d'utilisateurs
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lingua_ai_permissions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES lingua_users(id) ON DELETE CASCADE,
  plan_type         TEXT CHECK (plan_type IN ('uni', 'all_access')),
  -- Si user_id est NULL, la permission s'applique à tout le plan_type
  -- Si plan_type est NULL, la permission est spécifique à l'utilisateur
  
  ai_provider       TEXT NOT NULL CHECK (ai_provider IN ('anthropic', 'groq', 'deepseek')),
  ai_model          TEXT NOT NULL,
  -- Modèle spécifique (ex: 'claude-sonnet-4-5', 'llama-3.1-70b-versatile', 'deepseek-chat')
  
  is_allowed        BOOLEAN DEFAULT TRUE,
  -- FALSE pour bloquer l'accès à un modèle spécifique
  
  max_tokens_per_day INTEGER DEFAULT 10000,
  -- Limite quotidienne de tokens pour ce modèle
  
  priority          INTEGER DEFAULT 10,
  -- Priorité d'utilisation (plus bas = prioritaire)
  
  is_default        BOOLEAN DEFAULT FALSE,
  -- Si TRUE, ce modèle est utilisé par défaut pour cet utilisateur/plan
  
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_combination CHECK (
    (user_id IS NOT NULL AND plan_type IS NULL) OR
    (user_id IS NULL AND plan_type IS NOT NULL) OR
    (user_id IS NOT NULL AND plan_type IS NOT NULL)
  ),
  
  UNIQUE(user_id, plan_type, ai_provider, ai_model)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_ai_permissions_user ON lingua_ai_permissions(user_id, is_allowed, is_default);
CREATE INDEX IF NOT EXISTS idx_ai_permissions_plan ON lingua_ai_permissions(plan_type, is_allowed, is_default);

-- ────────────────────────────────────────────────────────────
-- TABLE : Paramètres globaux IA
-- Configuration système (modèles par défaut, limites, etc.)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lingua_ai_global_settings (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key             TEXT UNIQUE NOT NULL,
  setting_value           TEXT NOT NULL,
  description             TEXT,
  is_active               BOOLEAN DEFAULT TRUE,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Paramètres par défaut
INSERT INTO lingua_ai_global_settings (setting_key, setting_value, description) VALUES
  ('default_provider', 'anthropic', 'Fournisseur IA par défaut pour tous les utilisateurs'),
  ('default_model', 'claude-sonnet-4-5', 'Modèle IA par défaut'),
  ('free_talk_provider', 'anthropic', 'Fournisseur pour les sessions free_talk'),
  ('free_talk_model', 'claude-haiku-3', 'Modèle pour les sessions free_talk'),
  ('business_provider', 'anthropic', 'Fournisseur pour les sessions business'),
  ('business_model', 'claude-sonnet-4-5', 'Modèle pour les sessions business'),
  ('grammar_provider', 'groq', 'Fournisseur pour les sessions grammar'),
  ('grammar_model', 'llama-3.1-70b-versatile', 'Modèle pour les sessions grammar'),
  ('research_provider', 'deepseek', 'Fournisseur pour les sessions research'),
  ('research_model', 'deepseek-chat', 'Modèle pour les sessions research'),
  ('max_tokens_free', '10000', 'Limite quotidienne de tokens pour les utilisateurs free'),
  ('max_tokens_premium', '50000', 'Limite quotidienne de tokens pour les utilisateurs premium'),
  ('enable_web_search', 'true', 'Activer la recherche web pour les sessions research'),
  ('web_search_provider', 'tavily', 'Fournisseur de recherche web par défaut')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- ────────────────────────────────────────────────────────────
-- Mise à jour de la table lingua_ai_sessions
-- Ajoute les colonnes pour le suivi détaillé des fournisseurs IA
-- ────────────────────────────────────────────────────────────
ALTER TABLE lingua_ai_sessions 
ADD COLUMN IF NOT EXISTS ai_provider TEXT,
ADD COLUMN IF NOT EXISTS ai_model TEXT,
ADD COLUMN IF NOT EXISTS web_search_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tokens_input INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens_output INTEGER DEFAULT 0;

-- Mettre à jour les anciennes sessions avec des valeurs par défaut
UPDATE lingua_ai_sessions 
SET ai_provider = 'anthropic', 
    ai_model = 'claude-sonnet-4.5'
WHERE ai_provider IS NULL;

-- ────────────────────────────────────────────────────────────
-- FONCTION : Vérifier les permissions IA d'un utilisateur
-- Retourne les modèles autorisés pour un utilisateur donné
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_user_ai_permissions(
  p_user_id UUID,
  p_plan_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  ai_provider TEXT,
  ai_model TEXT,
  is_allowed BOOLEAN,
  max_tokens_per_day INTEGER,
  priority INTEGER,
  is_default BOOLEAN,
  permission_source TEXT -- 'user', 'plan', 'global'
) AS $$
BEGIN
  -- Permissions spécifiques à l'utilisateur
  RETURN QUERY
  SELECT 
    p.ai_provider,
    p.ai_model,
    p.is_allowed,
    p.max_tokens_per_day,
    p.priority,
    p.is_default,
    'user'::TEXT AS permission_source
  FROM lingua_ai_permissions p
  WHERE p.user_id = p_user_id
    AND p.plan_type IS NULL
    AND p.is_allowed = TRUE
  
  UNION ALL
  
  -- Permissions du plan (si l'utilisateur a un abonnement actif)
  SELECT 
    p.ai_provider,
    p.ai_model,
    p.is_allowed,
    p.max_tokens_per_day,
    p.priority,
    p.is_default,
    'plan'::TEXT AS permission_source
  FROM lingua_ai_permissions p
  WHERE p.plan_type = p_plan_type
    AND p.user_id IS NULL
    AND p.is_allowed = TRUE
  
  UNION ALL
  
  -- Permissions globales (paramètres par défaut)
  SELECT 
    'anthropic'::TEXT AS ai_provider,
    'claude-sonnet-4-5'::TEXT AS ai_model,
    TRUE AS is_allowed,
    10000 AS max_tokens_per_day,
    100 AS priority,
    TRUE AS is_default,
    'global'::TEXT AS permission_source
  
  ORDER BY priority ASC, permission_source DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- FONCTION : Obtenir la configuration IA optimale pour une session
-- Prend en compte les permissions, le type de session et les préférences
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_optimal_ai_config(
  p_user_id UUID,
  p_session_type TEXT,
  p_language TEXT DEFAULT 'en',
  p_user_preference_provider TEXT DEFAULT NULL,
  p_user_preference_model TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_plan_type TEXT;
  v_config JSON;
  v_default_provider TEXT;
  v_default_model TEXT;
BEGIN
  -- Récupérer le plan de l'utilisateur
  SELECT plan_type INTO v_plan_type
  FROM lingua_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  LIMIT 1;

  -- Si l'utilisateur a une préférence et que c'est autorisé
  IF p_user_preference_provider IS NOT NULL AND p_user_preference_model IS NOT NULL THEN
    -- Vérifier si cette combinaison est autorisée
    PERFORM 1 FROM get_user_ai_permissions(p_user_id, v_plan_type) perms
    WHERE perms.ai_provider = p_user_preference_provider
      AND perms.ai_model = p_user_preference_model
      AND perms.is_allowed = TRUE
    LIMIT 1;
    
    IF FOUND THEN
      SELECT json_build_object(
        'provider', p_user_preference_provider,
        'model', p_user_preference_model,
        'source', 'user_preference'
      ) INTO v_config;
      RETURN v_config;
    END IF;
  END IF;

  -- Sinon, utiliser la configuration recommandée selon le type de session
  CASE p_session_type
    WHEN 'free_talk' THEN
      SELECT setting_value INTO v_default_provider
      FROM lingua_ai_global_settings
      WHERE setting_key = 'free_talk_provider';
      
      SELECT setting_value INTO v_default_model
      FROM lingua_ai_global_settings
      WHERE setting_key = 'free_talk_model';
      
    WHEN 'business' THEN
      SELECT setting_value INTO v_default_provider
      FROM lingua_ai_global_settings
      WHERE setting_key = 'business_provider';
      
      SELECT setting_value INTO v_default_model
      FROM lingua_ai_global_settings
      WHERE setting_key = 'business_model';
      
    WHEN 'grammar' THEN
      SELECT setting_value INTO v_default_provider
      FROM lingua_ai_global_settings
      WHERE setting_key = 'grammar_provider';
      
      SELECT setting_value INTO v_default_model
      FROM lingua_ai_global_settings
      WHERE setting_key = 'grammar_model';
      
    WHEN 'research' THEN
      SELECT setting_value INTO v_default_provider
      FROM lingua_ai_global_settings
      WHERE setting_key = 'research_provider';
      
      SELECT setting_value INTO v_default_model
      FROM lingua_ai_global_settings
      WHERE setting_key = 'research_model';
      
    ELSE
      SELECT setting_value INTO v_default_provider
      FROM lingua_ai_global_settings
      WHERE setting_key = 'default_provider';
      
      SELECT setting_value INTO v_default_model
      FROM lingua_ai_global_settings
      WHERE setting_key = 'default_model';
  END CASE;

  -- Vérifier que le modèle par défaut est autorisé
  PERFORM 1 FROM get_user_ai_permissions(p_user_id, v_plan_type) perms
  WHERE perms.ai_provider = v_default_provider
    AND perms.ai_model = v_default_model
    AND perms.is_allowed = TRUE
  LIMIT 1;

  IF FOUND THEN
    SELECT json_build_object(
      'provider', v_default_provider,
      'model', v_default_model,
      'source', 'session_default'
    ) INTO v_config;
  ELSE
    -- Fallback: premier modèle autorisé
    SELECT json_build_object(
      'provider', perms.ai_provider,
      'model', perms.ai_model,
      'source', 'fallback'
    ) INTO v_config
    FROM get_user_ai_permissions(p_user_id, v_plan_type) perms
    WHERE perms.is_allowed = TRUE
    ORDER BY perms.priority ASC
    LIMIT 1;
  END IF;

  RETURN COALESCE(v_config, json_build_object(
    'provider', 'anthropic',
    'model', 'claude-sonnet-4-5',
    'source', 'hardcoded_fallback'
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- FONCTION : Vérifier la limite de tokens quotidienne
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_daily_token_limit(
  p_user_id UUID,
  p_provider TEXT,
  p_model TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_tokens INTEGER;
  v_used_tokens INTEGER;
  v_plan_type TEXT;
BEGIN
  -- Récupérer la limite pour ce modèle
  SELECT max_tokens_per_day INTO v_max_tokens
  FROM get_user_ai_permissions(p_user_id, v_plan_type) perms
  WHERE perms.ai_provider = p_provider
    AND perms.ai_model = p_model
  LIMIT 1;

  -- Si pas de limite spécifique, utiliser la limite globale
  IF v_max_tokens IS NULL THEN
    SELECT 
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM lingua_subscriptions 
          WHERE user_id = p_user_id AND status = 'active' AND plan_type = 'all_access'
        ) THEN setting_value::INTEGER
        ELSE setting_value::INTEGER
      END INTO v_max_tokens
    FROM lingua_ai_global_settings
    WHERE setting_key IN ('max_tokens_premium', 'max_tokens_free')
    ORDER BY CASE setting_key 
      WHEN 'max_tokens_premium' THEN 1 
      WHEN 'max_tokens_free' THEN 2 
    END
    LIMIT 1;
  END IF;

  -- Calculer l'utilisation aujourd'hui
  SELECT COALESCE(SUM(tokens_used), 0) INTO v_used_tokens
  FROM lingua_ai_sessions
  WHERE user_id = p_user_id
    AND ai_provider = p_provider
    AND ai_model = p_model
    AND created_at >= CURRENT_DATE;

  RETURN v_used_tokens < COALESCE(v_max_tokens, 10000);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- POLICIES RLS pour les tables IA
-- ────────────────────────────────────────────────────────────
-- lingua_ai_permissions : Lecture pour les admins seulement
ALTER TABLE lingua_ai_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage AI permissions" ON lingua_ai_permissions;
CREATE POLICY "Admins can manage AI permissions" ON lingua_ai_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lingua_users 
       WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Users can view their own AI permissions" ON lingua_ai_permissions;
CREATE POLICY "Users can view their own AI permissions" ON lingua_ai_permissions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM lingua_users 
       WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- lingua_ai_global_settings : Lecture pour tous, écriture admin seulement
ALTER TABLE lingua_ai_global_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view global AI settings" ON lingua_ai_global_settings;
CREATE POLICY "Everyone can view global AI settings" ON lingua_ai_global_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage global AI settings" ON lingua_ai_global_settings;
CREATE POLICY "Admins can manage global AI settings" ON lingua_ai_global_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lingua_users 
       WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ────────────────────────────────────────────────────────────
-- TRIGGER : Mise à jour automatique de updated_at
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ai_permissions_updated_at ON lingua_ai_permissions;
CREATE TRIGGER update_ai_permissions_updated_at
  BEFORE UPDATE ON lingua_ai_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_global_settings_updated_at ON lingua_ai_global_settings;
CREATE TRIGGER update_ai_global_settings_updated_at
  BEFORE UPDATE ON lingua_ai_global_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- VUE : Vue consolidée des permissions IA
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW lingua_ai_permissions_view AS
SELECT 
  p.id,
  p.user_id,
  u.email AS user_email,
  u.full_name AS user_name,
  p.plan_type,
  p.ai_provider,
  p.ai_model,
  p.is_allowed,
  p.max_tokens_per_day,
  p.priority,
  p.is_default,
  p.created_at,
  p.updated_at,
  CASE 
    WHEN p.user_id IS NOT NULL AND p.plan_type IS NULL THEN 'user_specific'
    WHEN p.user_id IS NULL AND p.plan_type IS NOT NULL THEN 'plan_specific'
    WHEN p.user_id IS NOT NULL AND p.plan_type IS NOT NULL THEN 'user_plan_specific'
  END AS permission_type
FROM lingua_ai_permissions p
LEFT JOIN lingua_users u ON p.user_id = u.id
ORDER BY 
  permission_type,
  p.plan_type NULLS FIRST,
  u.email NULLS FIRST,
  p.priority ASC;