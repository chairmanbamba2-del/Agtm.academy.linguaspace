import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

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
    const systemPrompt = `${SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.en}

Current student level: ${level}
Session type: ${sessionType}
Session focus: ${getSessionFocus(sessionType, language)}`

    // Appel Claude
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-5',
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   messages.map((m: any) => ({
        role:    m.role,
        content: m.content,
      })),
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    // Logger la session
    await supabase.from('lingua_ai_sessions').insert({
      user_id:          user.id,
      language,
      session_type:     sessionType,
      model_used:       'claude-sonnet-4-5',
      tokens_used:      response.usage.input_tokens + response.usage.output_tokens,
      duration_seconds: 0,
    }).then(() => {}).catch(() => {}) // non bloquant

    return new Response(
      JSON.stringify({
        message:    assistantMessage,
        usage:      response.usage,
        model:      response.model,
      }),
      {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('lingua-ai error:', error)

    // Erreur Anthropic spécifique
    if (error?.status === 401) {
      return new Response(
        JSON.stringify({ error: 'Invalid Anthropic API key' }),
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
  }
  return focuses[type]?.[lang] || focuses.free_talk[lang] || 'General practice'
}