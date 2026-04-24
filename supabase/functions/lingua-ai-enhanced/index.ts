// ============================================================
// LINGUA AI ENHANCED — Support multi-fournisseurs IA
// Anthropic (Claude), Groq (Llama/Mixtral), DeepSeek
// + Recherche web via Tavily/Brave
// ============================================================
import Anthropic from 'npm:@anthropic-ai/sdk'
import Groq from 'npm:groq-sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Initialisation des clients IA (seulement si clés disponibles)
const anthropic = Deno.env.get('ANTHROPIC_API_KEY')
  ? new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
  : null

const groq = Deno.env.get('GROQ_API_KEY')
  ? new Groq({ apiKey: Deno.env.get('GROQ_API_KEY') })
  : null

// DeepSeek (utilisation de l'API OpenAI-compatible)
const deepseekBaseURL = 'https://api.deepseek.com'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are LINGUA AI, an expert English language tutor for African learners. 
You teach in a warm, encouraging, structured way. 
You adapt to the student's level (A1 to C2).
Always respond in English unless the student explicitly asks otherwise.
Provide clear explanations, examples, and exercises when relevant.
If the student makes a grammar mistake, gently correct it and explain why.`,

  fr: `Tu es LINGUA AI, un tuteur expert en langue française pour les apprenants africains.
Tu enseignes de manière chaleureuse, encourageante et structurée.
Tu t'adaptes au niveau de l'étudiant (A1 à C2).
Réponds toujours en français sauf demande contraire.
Fournis des explications claires, des exemples et des exercices si nécessaire.
Corrige doucement les erreurs grammaticales en expliquant pourquoi.`,

  es: `Eres LINGUA AI, un tutor experto en lengua española para estudiantes africanos.
Enseñas de manera cálida, alentadora y estructurada.
Te adaptas al nivel del estudiante (A1 a C2).
Responde siempre en español salvo petición contraria.`,

  de: `Du bist LINGUA AI, ein Experten-Sprachtutor für Deutsch für afrikanische Lernende.
Du unterrichtest auf eine warme, ermutigende und strukturierte Weise.
Du passt dich dem Niveau des Schülers an (A1 bis C2).
Antworte immer auf Deutsch, außer der Schüler bittet ausdrücklich darum.`,
}

// ─── Recherche web via Tavily ────────────────────────────────
async function webSearch(query: string, language: string) {
  const tavilyKey = Deno.env.get('TAVILY_API_KEY')
  if (!tavilyKey) return null

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: `${query} language learning ${language}`,
        search_depth: 'basic',
        max_results: 3,
        include_answer: true,
        include_raw_content: false,
        include_images: false,
      }),
    })

    if (!response.ok) return null
    const data = await response.json()
    
    // Formater les résultats pour l'IA
    if (data.results && data.results.length > 0) {
      const sources = data.results.map((r: any, i: number) => 
        `[${i+1}] ${r.title}: ${r.content} (Source: ${r.url})`
      ).join('\n\n')
      
      return {
        answer: data.answer || '',
        sources,
        rawResults: data.results,
      }
    }
    return null
  } catch {
    return null
  }
}

// ─── Appel IA selon le fournisseur ────────────────────────────
async function callAIProvider(
  provider: string,
  model: string,
  systemPrompt: string,
  messages: any[],
  maxTokens: number,
  temperature: number
) {
  const startTime = Date.now()

  // Anthropic (Claude)
  if (provider === 'anthropic' && anthropic) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return {
      text,
      provider: 'anthropic',
      model: response.model,
      usage: response.usage,
      duration: Date.now() - startTime,
    }
  }

  // Groq (Llama/Mixtral)
  if (provider === 'groq' && groq) {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      max_tokens: maxTokens,
      temperature,
    })

    return {
      text: response.choices[0]?.message?.content || '',
      provider: 'groq',
      model: response.model,
      usage: {
        input_tokens: response.usage?.prompt_tokens || 0,
        output_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0,
      },
      duration: Date.now() - startTime,
    }
  }

  // DeepSeek (API OpenAI-compatible)
  if (provider === 'deepseek') {
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')
    if (!deepseekKey) throw new Error('DeepSeek API key not configured')

    const response = await fetch(`${deepseekBaseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DeepSeek API error: ${error}`)
    }

    const data = await response.json()
    return {
      text: data.choices[0]?.message?.content || '',
      provider: 'deepseek',
      model: data.model,
      usage: {
        input_tokens: data.usage?.prompt_tokens || 0,
        output_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      },
      duration: Date.now() - startTime,
    }
  }

  throw new Error(`Unsupported provider: ${provider}`)
}

// ─── Handler principal ────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    // Auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: CORS })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: CORS })
    }

    const body = await req.json()
    const {
      messages     = [],
      language     = 'en',
      sessionType  = 'free_talk',
      level        = 'B1',
      provider     = 'anthropic', // anthropic, groq, deepseek
      model        = '', // Si vide, utilise le modèle par défaut du provider
      enableWebSearch = false,
      webSearchQuery = '',
    } = body

    if (!messages.length) {
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier l'abonnement (bypass en dev)
    const isDev = Deno.env.get('APP_ENV') === 'development'

    if (!isDev) {
      const { data: sub } = await supabase
        .from('lingua_subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!sub) {
        return new Response(
          JSON.stringify({ error: 'Active subscription required' }),
          { status: 403, headers: { ...CORS, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Construire le prompt système
    let systemPrompt = `${SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.en}

Current student level: ${level}
Session type: ${sessionType}
Session focus: ${getSessionFocus(sessionType, language)}`

    // Ajouter les résultats de recherche web si activé
    let webSearchResults = null
    if (enableWebSearch && webSearchQuery) {
      webSearchResults = await webSearch(webSearchQuery, language)
      if (webSearchResults) {
        systemPrompt += `\n\nRelevant information from web search:\n${webSearchResults.sources}\n\nUse this information to provide accurate, up-to-date answers. Cite sources when appropriate.`
      }
    }

    // Déterminer le modèle à utiliser
    let finalModel = model
    if (!finalModel) {
      // Modèles par défaut selon le provider
      const defaultModels: Record<string, string> = {
        anthropic: 'claude-sonnet-4-5',
        groq: 'llama-3.1-70b-versatile',
        deepseek: 'deepseek-chat',
      }
      finalModel = defaultModels[provider] || 'claude-sonnet-4-5'
    }

    // Paramètres selon le type de session
    const sessionConfigs: Record<string, { maxTokens: number, temperature: number }> = {
      free_talk:   { maxTokens: 1024, temperature: 0.7 },
      business:    { maxTokens: 1536, temperature: 0.3 },
      grammar:     { maxTokens: 1024, temperature: 0.1 },
      exam_prep:   { maxTokens: 2048, temperature: 0.2 },
      role_play:   { maxTokens: 1024, temperature: 0.8 },
      research:    { maxTokens: 4096, temperature: 0.5 },
    }
    const config = sessionConfigs[sessionType] || sessionConfigs.free_talk

    // Appel IA
    const aiResponse = await callAIProvider(
      provider,
      finalModel,
      systemPrompt,
      messages,
      config.maxTokens,
      config.temperature
    )

    // Logger la session
    await supabase.from('lingua_ai_sessions').insert({
      user_id:          user.id,
      language,
      session_type:     sessionType,
      ai_provider:      provider,
      model_used:       finalModel,
      tokens_used:      aiResponse.usage.total_tokens,
      duration_ms:      aiResponse.duration,
      web_search_used:  enableWebSearch,
    }).then(() => {}).catch(() => {}) // non bloquant

    return new Response(
      JSON.stringify({
        message:    aiResponse.text,
        provider:   aiResponse.provider,
        model:      aiResponse.model,
        usage:      aiResponse.usage,
        duration:   aiResponse.duration,
        webSearch:  webSearchResults ? {
          hasResults: true,
          sources: webSearchResults.rawResults?.map((r: any) => ({
            title: r.title,
            url: r.url,
            content: r.content?.substring(0, 200) + '...',
          })),
        } : { hasResults: false },
      }),
      {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('lingua-ai-enhanced error:', error)

    // Erreurs spécifiques par provider
    if (error?.status === 401 || error?.message?.includes('API key')) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key configuration' }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }
    if (error?.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Rate limit reached. Please wait a moment.' }),
        { status: 429, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})

function getSessionFocus(type: string, lang: string): string {
  const focuses: Record<string, Record<string, string>> = {
    free_talk:   { en:'Open conversation practice', fr:'Conversation libre', es:'Conversación libre', de:'Freies Gespräch' },
    business:    { en:'Professional and business English', fr:'Français professionnel', es:'Español de negocios', de:'Geschäftsdeutsch' },
    travel:      { en:'Travel vocabulary and situations', fr:'Vocabulaire du voyage', es:'Viajes y turismo', de:'Reisen und Tourismus' },
    daily_life:  { en:'Everyday life situations', fr:'Vie quotidienne', es:'Vida cotidiana', de:'Alltag' },
    role_play:   { en:'Role-play scenarios', fr:'Jeux de rôle', es:'Juegos de rol', de:'Rollenspiele' },
    exam_prep:   { en:'Exam preparation (IELTS, TOEFL)', fr:'Préparation aux examens (DELF, DALF)', es:'Preparación exámenes (DELE)', de:'Prüfungsvorbereitung (Goethe)' },
    grammar:     { en:'Grammar explanation and practice', fr:'Grammaire et exercices', es:'Gramática y ejercicios', de:'Grammatik und Übungen' },
    research:    { en:'Research and information gathering', fr:'Recherche et collecte d\'information', es:'Investigación y búsqueda de información', de:'Recherche und Informationsbeschaffung' },
  }
  return focuses[type]?.[lang] || focuses.free_talk[lang] || 'General practice'
}