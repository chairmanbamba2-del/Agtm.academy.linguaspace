// Gestion des permissions IA et configuration des modèles
import { supabase } from './supabase'
import { AI_PROVIDERS } from './ai-config'

// ─── Récupérer les permissions IA d'un utilisateur ──────────────────
export async function getUserAIPermissions(userId) {
  try {
    const { data, error } = await supabase
      .from('lingua_ai_permissions_view')
      .select('*')
      .or(`user_id.eq.${userId},plan_type.not.is.null`)
      .eq('is_allowed', true)
      .order('priority', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Erreur chargement permissions IA:', err)
    return []
  }
}

// ─── Récupérer la configuration IA optimale pour une session ────────
export async function getOptimalAIConfig(userId, sessionType, language = 'en', userPreference = null) {
  try {
    // Appeler la fonction PostgreSQL si elle existe
    const { data, error } = await supabase.rpc('get_optimal_ai_config', {
      p_user_id: userId,
      p_session_type: sessionType,
      p_language: language,
      p_user_preference_provider: userPreference?.provider || null,
      p_user_preference_model: userPreference?.model || null,
    })
    
    if (!error && data) {
      return data
    }
    
    // Fallback: logique frontend
    console.warn('Fonction RPC non disponible, utilisation du fallback')
    return getFallbackAIConfig(sessionType, language, userPreference)
  } catch (err) {
    console.error('Erreur configuration IA:', err)
    return getFallbackAIConfig(sessionType, language, userPreference)
  }
}

// ─── Configuration de fallback (si la base de données n'est pas disponible) ─
function getFallbackAIConfig(sessionType, language, userPreference) {
  const sessionConfigs = {
    free_talk: { provider: 'anthropic', model: 'claude-haiku-3' },
    business:  { provider: 'anthropic', model: 'claude-sonnet-4-5' },
    grammar:   { provider: 'groq', model: 'llama-3.1-70b-versatile' },
    exam_prep: { provider: 'anthropic', model: 'claude-sonnet-4-5' },
    role_play: { provider: 'groq', model: 'mixtral-8x7b-32768' },
    research:  { provider: 'deepseek', model: 'deepseek-chat' },
  }
  
  // Si l'utilisateur a une préférence valide
  if (userPreference?.provider && userPreference?.model) {
    const provider = AI_PROVIDERS[userPreference.provider]
    if (provider?.models.some(m => m.id === userPreference.model)) {
      return {
        provider: userPreference.provider,
        model: userPreference.model,
        source: 'user_preference',
      }
    }
  }
  
  const config = sessionConfigs[sessionType] || sessionConfigs.free_talk
  return {
    provider: config.provider,
    model: config.model,
    source: 'session_default',
  }
}

// ─── Vérifier si un modèle IA est autorisé pour un utilisateur ──────
export async function isModelAllowed(userId, provider, model) {
  try {
    const { data, error } = await supabase
      .from('lingua_ai_permissions')
      .select('is_allowed')
      .or(`user_id.eq.${userId},plan_type.not.is.null`)
      .eq('ai_provider', provider)
      .eq('ai_model', model)
      .eq('is_allowed', true)
      .limit(1)
    
    if (error) throw error
    return data.length > 0
  } catch (err) {
    console.error('Erreur vérification modèle:', err)
    return true // Par défaut autorisé en cas d'erreur
  }
}

// ─── Récupérer les paramètres globaux IA ────────────────────────────
export async function getAIGlobalSettings() {
  try {
    const { data, error } = await supabase
      .from('lingua_ai_global_settings')
      .select('setting_key, setting_value')
      .eq('is_active', true)
    
    if (error) throw error
    
    const settings = {}
    data.forEach(s => {
      settings[s.setting_key] = s.setting_value
    })
    return settings
  } catch (err) {
    console.error('Erreur chargement paramètres globaux:', err)
    return {}
  }
}

// ─── Envoyer un message via l'IA améliorée (multi-fournisseurs) ─────
export async function sendEnhancedAIMessage({
  messages,
  language,
  level,
  sessionType = 'free_talk',
  provider = null,
  model = null,
  enableWebSearch = false,
  webSearchQuery = '',
  userId,
  nativeLanguage,
}) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const { data: { session } } = await supabase.auth.getSession()
  
  // Si provider/model non spécifiés, déterminer la configuration optimale
  let finalProvider = provider
  let finalModel = model
  
  if (!finalProvider || !finalModel) {
    const config = await getOptimalAIConfig(userId, sessionType, language)
    finalProvider = config.provider
    finalModel = config.model
  }
  
  // Vérifier que le modèle est autorisé
  const allowed = await isModelAllowed(userId, finalProvider, finalModel)
  if (!allowed) {
    throw new Error(`Modèle IA non autorisé: ${finalProvider}/${finalModel}`)
  }
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/lingua-ai-enhanced`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      messages,
      language,
      sessionType,
      level,
      provider: finalProvider,
      model: finalModel,
      enableWebSearch,
      webSearchQuery,
      nativeLanguage,
    }),
  })
  
  if (!response.ok) {
    const err = await response.text()
    throw new Error(err || 'Erreur IA améliorée')
  }
  
  return response.json()
}

// ─── Obtenir la liste des modèles disponibles pour un utilisateur ───
export async function getAvailableModelsForUser(userId) {
  try {
    const permissions = await getUserAIPermissions(userId)
    const globalSettings = await getAIGlobalSettings()
    
    // Si l'utilisateur a des permissions spécifiques
    if (permissions.length > 0) {
      const models = []
      permissions.forEach(perm => {
        const provider = AI_PROVIDERS[perm.ai_provider]
        if (provider) {
          const model = provider.models.find(m => m.id === perm.ai_model)
          if (model) {
            models.push({
              id: `${perm.ai_provider}:${perm.ai_model}`,
              provider: perm.ai_provider,
              providerName: provider.name,
              model: perm.ai_model,
              name: model.name,
              description: model.description,
              speed: model.speed,
              cost: model.cost,
              isDefault: perm.is_default,
              maxTokensPerDay: perm.max_tokens_per_day,
            })
          }
        }
      })
      return models
    }
    
    // Sinon, utiliser les modèles par défaut selon les paramètres globaux
    const defaultProvider = globalSettings.default_provider || 'anthropic'
    const defaultModel = globalSettings.default_model || 'claude-sonnet-4-5'
    
    const provider = AI_PROVIDERS[defaultProvider]
    if (!provider) return []
    
    return provider.models.map(model => ({
      id: `${defaultProvider}:${model.id}`,
      provider: defaultProvider,
      providerName: provider.name,
      model: model.id,
      name: model.name,
      description: model.description,
      speed: model.speed,
      cost: model.cost,
      isDefault: model.id === defaultModel,
      maxTokensPerDay: parseInt(globalSettings.max_tokens_free || '10000'),
    }))
  } catch (err) {
    console.error('Erreur modèles disponibles:', err)
    return []
  }
}

// ─── Obtenir les statistiques d'utilisation IA d'un utilisateur ─────
export async function getUserAIUsage(userId, days = 7) {
  try {
    const since = new Date()
    since.setDate(since.getDate() - days)
    
    const { data, error } = await supabase
      .from('lingua_ai_sessions')
      .select('ai_provider, ai_model, tokens_used, created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    const usageByModel = {}
    let totalTokens = 0
    
    data.forEach(session => {
      const key = `${session.ai_provider}:${session.ai_model}`
      if (!usageByModel[key]) {
        usageByModel[key] = {
          provider: session.ai_provider,
          model: session.ai_model,
          tokens: 0,
          sessions: 0,
        }
      }
      usageByModel[key].tokens += session.tokens_used || 0
      usageByModel[key].sessions += 1
      totalTokens += session.tokens_used || 0
    })
    
    return {
      totalTokens,
      totalSessions: data.length,
      byModel: Object.values(usageByModel),
      recentSessions: data.slice(0, 10),
    }
  } catch (err) {
    console.error('Erreur statistiques IA:', err)
    return { totalTokens: 0, totalSessions: 0, byModel: [], recentSessions: [] }
  }
}