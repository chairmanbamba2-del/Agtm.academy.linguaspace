// Configuration des modèles IA disponibles dans LINGUA SPACE
// Support: Anthropic (Claude), Groq (Llama, Mixtral), DeepSeek

export const AI_PROVIDERS = {
  anthropic: {
    name: 'Claude (Anthropic)',
    models: [
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', description: 'Équilibre performance/coût', speed: 'medium', cost: 'medium' },
      { id: 'claude-haiku-3', name: 'Claude Haiku 3', description: 'Rapide et économique', speed: 'fast', cost: 'low' },
      { id: 'claude-opus-3', name: 'Claude Opus 3', description: 'Plus puissant, plus cher', speed: 'slow', cost: 'high' },
    ],
    defaultModel: 'claude-sonnet-4-5',
    requiresKey: 'ANTHROPIC_API_KEY',
  },
  groq: {
    name: 'Groq (Llama/Mixtral)',
    models: [
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', description: 'Puissant et rapide', speed: 'very-fast', cost: 'low' },
      { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B', description: 'Vision + texte', speed: 'fast', cost: 'medium' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Expert mixture', speed: 'very-fast', cost: 'low' },
      { id: 'gemma2-9b-it', name: 'Gemma2 9B', description: 'Léger et efficace', speed: 'very-fast', cost: 'very-low' },
    ],
    defaultModel: 'llama-3.1-70b-versatile',
    requiresKey: 'GROQ_API_KEY',
  },
  deepseek: {
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'Modèle principal', speed: 'fast', cost: 'very-low' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Spécialisé code', speed: 'fast', cost: 'very-low' },
    ],
    defaultModel: 'deepseek-chat',
    requiresKey: 'DEEPSEEK_API_KEY',
  },
}

// Configuration par défaut selon le type de session
export const SESSION_CONFIGS = {
  free_talk: {
    recommendedProvider: 'anthropic',
    recommendedModel: 'claude-haiku-3',
    maxTokens: 1024,
    temperature: 0.7,
  },
  business: {
    recommendedProvider: 'anthropic',
    recommendedModel: 'claude-sonnet-4-5',
    maxTokens: 1536,
    temperature: 0.3,
  },
  grammar: {
    recommendedProvider: 'groq',
    recommendedModel: 'llama-3.1-70b-versatile',
    maxTokens: 1024,
    temperature: 0.1,
  },
  exam_prep: {
    recommendedProvider: 'anthropic',
    recommendedModel: 'claude-sonnet-4-5',
    maxTokens: 2048,
    temperature: 0.2,
  },
  role_play: {
    recommendedProvider: 'groq',
    recommendedModel: 'mixtral-8x7b-32768',
    maxTokens: 1024,
    temperature: 0.8,
  },
  islamic: {
    recommendedProvider: 'anthropic',
    recommendedModel: 'claude-sonnet-4-5',
    maxTokens: 2048,
    temperature: 0.4,
    systemPrompt: `Tu es un professeur spécialisé en langue arabe et culture islamique. Tu maîtrises :
- L'arabe littéraire (Fusha) et ses règles grammaticales
- Le Coran (Tajwid, Tafsir simplifié)
- Les Hadiths (authenticité, contexte)
- La jurisprudence de base (Fiqh) : prière, jeûne, pèlerinage
- Les fêtes et traditions : Ramadan, Aïd al-Fitr, Aïd al-Adha, Mawlid
- L'histoire islamique et la civilisation arabo-musulmane
- La culture contemporaine du monde arabe

Adapte ton enseignement à la langue maternelle de l'utilisateur (français, anglais, etc.).
Explique les concepts avec clarté et pédagogie. Utilise des analogies.
Sois respectueux des différentes sensibilités et écoles de pensée.
Pour le Coran, privilégie les explications basées sur le Tafsir des savants reconnus.
Pour les Hadiths, mentionne leur degré d'authenticité (Sahih, Hasan, Da'if).`,
  },
  research: {
    recommendedProvider: 'deepseek',
    recommendedModel: 'deepseek-chat',
    maxTokens: 4096,
    temperature: 0.5,
    webSearch: true, // Active la recherche web
  },
}

// Configuration de la recherche web
export const WEB_SEARCH_CONFIG = {
  providers: {
    tavily: {
      name: 'Tavily',
      requiresKey: 'TAVILY_API_KEY',
      maxResults: 5,
      freshness: 'week', // day, week, month, year
    },
    brave: {
      name: 'Brave Search',
      requiresKey: 'BRAVE_SEARCH_API_KEY',
      maxResults: 5,
      freshness: 'week',
    },
  },
  defaultProvider: 'tavily',
  enabled: true,
}

// Fonction utilitaire pour choisir le meilleur modèle selon les besoins
export function getOptimalAIConfig(sessionType, language, level, userPreference = null) {
  const config = SESSION_CONFIGS[sessionType] || SESSION_CONFIGS.free_talk
  
  // Si l'utilisateur a une préférence, l'utiliser
  if (userPreference && AI_PROVIDERS[userPreference.provider]) {
    const provider = AI_PROVIDERS[userPreference.provider]
    const model = provider.models.find(m => m.id === userPreference.model) || provider.models[0]
    return {
      provider: userPreference.provider,
      model: model.id,
      providerName: provider.name,
      modelName: model.name,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      webSearch: config.webSearch || false,
    }
  }
  
  // Sinon, utiliser la configuration recommandée
  const provider = AI_PROVIDERS[config.recommendedProvider]
  const model = provider.models.find(m => m.id === config.recommendedModel) || provider.models[0]
  
  return {
    provider: config.recommendedProvider,
    model: model.id,
    providerName: provider.name,
    modelName: model.name,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    webSearch: config.webSearch || false,
  }
}

// Liste des modèles pour l'interface de sélection
export function getAvailableModels() {
  const models = []
  
  Object.entries(AI_PROVIDERS).forEach(([providerId, provider]) => {
    provider.models.forEach(model => {
      models.push({
        id: `${providerId}:${model.id}`,
        provider: providerId,
        providerName: provider.name,
        model: model.id,
        name: model.name,
        description: model.description,
        speed: model.speed,
        cost: model.cost,
      })
    })
  })
  
  return models
}

// Configuration YouTube pour le contenu éducatif
export const YOUTUBE_CONFIG = {
  apiKey: import.meta.env.VITE_YOUTUBE_API_KEY,
  channels: {
    en: [
      'UC4cmBAit8i_NJZE8qK8sfpA', // BBC Learning English
      'UCk0BTPQpFMg4kf6W-BPHm5Q', // English with Lucy
      'UCV1h_cBE0Drdx19qkTM0WNw', // Speak English With Vanessa
    ],
    fr: [
      'UC4gijqLkQhqUlksnXqk3P6w', // Français Authentique
      'UCVRGFnN4bGq3bwQd4hVfh8g', // InnerFrench
      'UCyk7C-psV4p_1kH_XNpB0Zw', // Piece of French
    ],
    es: [
      'UCxJGMJbjokfnH4pnE5cBcHg', // Butterfly Spanish
      'UCaF4q7C8UQf0T5l6bG1zBuw', // Spanish with Vicente
      'UC5BjyL2p4jQ6qXhq3qQ8p9A', // Dreaming Spanish
    ],
    de: [
      'UCbxb2fqe9oNgglAoYqsYOtQ', // Easy German
      'UCZ1asC4s0DdD5g8mMp-TyWw', // Learn German with Anja
      'UCZwegPHTcBzcue7Qp_T_8Cg', // Deutsch für Euch
    ],
    ar: [
      'UCvQ7gLgKQPt1W5oGz4oKz3Q', // Arabic with Alaa
      'UCn7Z1DIXSFj0q5k4oFYV_UA', // Learn Arabic with Khasu
      'UCQYTxG6vMvX1oQp_9QJ6v6Q', // Arabic 101
    ],
  },
  maxResults: 5,
  relevance: 'language learning',
}