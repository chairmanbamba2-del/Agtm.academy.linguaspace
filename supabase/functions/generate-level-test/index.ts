// ============================================================
// EDGE FUNCTION : generate-level-test
// Génère un test de niveau complet (40 questions, 4 blocs)
// via Claude API et le stocke dans lingua_level_tests
// ============================================================
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
const supabase  = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const LANG_NAMES: Record<string,string> = {
  en: 'English', fr: 'French', es: 'Spanish', de: 'German'
}

const LANG_NAMES_FR: Record<string,string> = {
  en: 'Anglais', fr: 'Français', es: 'Espagnol', de: 'Allemand'
}

// Transcriptions audio de démonstration (en production : liens vers vrais fichiers)
const AUDIO_TRANSCRIPTS: Record<string,string> = {
  en: `Listen to this conversation between two colleagues discussing a business project:
"Good morning Sarah! Have you had a chance to look at the quarterly report?"
"Yes, I reviewed it yesterday. The sales figures are quite impressive, up 23% compared to last quarter."
"Exactly! The marketing team did an excellent job with the new campaign. However, I'm concerned about the operational costs."
"I agree. We need to find ways to reduce expenses without affecting product quality."
"Perhaps we should schedule a meeting with the finance department this week?"
"That's a great idea. I'll send out the invitations this afternoon."`,
  fr: `Écoutez cette conversation entre deux étudiants qui discutent de leurs études :
"Salut Marc ! Tu as commencé à réviser pour l'examen de demain ?"
"Oui, j'ai étudié toute la soirée hier. La grammaire française est vraiment difficile !"
"Je sais ! Surtout les temps verbaux. Tu as compris la différence entre l'imparfait et le passé composé ?"
"Plus ou moins. L'imparfait décrit une action continue dans le passé, et le passé composé une action terminée."
"C'est ça ! Et n'oublie pas les accords des participes passés."
"Merci pour le rappel. On pourrait réviser ensemble ce soir ?"`,
  es: `Escuche esta conversación entre dos personas en un restaurante:
"Buenos días, ¿en qué puedo ayudarle?"
"Hola, quisiera reservar una mesa para cuatro personas esta noche."
"Por supuesto. ¿Para qué hora la necesita?"
"Para las ocho y media, si es posible."
"Déjeme verificar... Sí, tenemos disponibilidad. ¿A nombre de quién hago la reserva?"
"A nombre de García. Y por favor, preferimos una mesa cerca de la ventana."
"Con mucho gusto. Quedamos a las ocho y media para cuatro personas a nombre de García, mesa junto a la ventana."`,
  de: `Hören Sie dieses Gespräch zwischen einem Arzt und einem Patienten:
"Guten Morgen, Herr Schmidt. Wie geht es Ihnen heute?"
"Nicht so gut, Herr Doktor. Ich habe seit drei Tagen Kopfschmerzen und Fieber."
"Haben Sie auch Husten oder Halsschmerzen?"
"Ja, leichten Husten, aber keine Halsschmerzen."
"Ich werde Ihnen ein Rezept für Ibuprofen geben. Nehmen Sie dreimal täglich eine Tablette ein."
"Soll ich auch im Bett bleiben?"
"Ja, ruhen Sie sich aus und trinken Sie viel Wasser. Wenn es sich in zwei Tagen nicht bessert, kommen Sie wieder."`,
}

// ─── Algorithme de pondération CEFR ─────────────────────────
function calculateLevel(scores: {
  listening: number; reading: number;
  grammar: number; writing: number
}): { level: string; global: number } {
  // Pondération : Oral 35% · Écrit 30% · Grammaire 25% · Expression 10%
  const global = Math.round(
    scores.listening * 0.35 +
    scores.reading   * 0.30 +
    scores.grammar   * 0.25 +
    scores.writing   * 0.10
  )
  const level =
    global >= 90 ? 'C2' :
    global >= 75 ? 'C1' :
    global >= 60 ? 'B2' :
    global >= 45 ? 'B1' :
    global >= 25 ? 'A2' : 'A1'
  return { level, global }
}

// ─── Génération des questions par bloc ──────────────────────
async function generateBlock(
  blockType: string,
  language: string,
  transcript?: string
): Promise<any[]> {
  const langName = LANG_NAMES[language]

  const prompts: Record<string, string> = {
    listening: `Generate 10 multiple-choice listening comprehension questions in ${langName} based on this audio transcript:

"${transcript}"

Questions should test understanding of: main ideas, specific details, speaker intentions, vocabulary in context.
Vary difficulty from A1 to C1 level.`,

    reading: `Generate 10 multiple-choice reading comprehension questions in ${langName}.
Include a short passage (150-200 words) appropriate for mixed levels (A1-C1), then 10 questions testing:
main ideas, specific details, vocabulary, inference, text structure.
Format: {"passage": "...", "questions": [...]}`,

    grammar: `Generate 10 multiple-choice grammar and vocabulary questions in ${langName}.
Cover: tenses, articles, prepositions, conjunctions, vocabulary meaning, word forms.
Mix levels from A1 (very basic) to B2 (upper-intermediate).`,

    expression: `Generate 2 open-ended writing/expression prompts in ${langName}.
Question 1 (B1 level): A short paragraph task (80-100 words) — describe a personal experience or opinion.
Question 2 (B2 level): A structured response task — give your opinion with arguments on a social topic.
Format: {"prompts": [{"id": "1", "instruction": "...", "min_words": 80}, ...]}`,
  }

  const systemPrompt = `You are an expert language assessment specialist certified in CEFR evaluation.
You MUST respond with ONLY valid JSON — no markdown, no preamble, no explanation.

For questions array, use this structure:
{
  "questions": [
    {
      "id": "1",
      "type": "mcq",
      "question": "Question text in ${langName}",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": "A",
      "level": "B1",
      "explanation": "Brief explanation"
    }
  ]
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompts[blockType] }]
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const cleaned = raw.replace(/```json|```/g, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    return parsed.questions || parsed.prompts || []
  } catch {
    console.error('JSON parse error for block:', blockType)
    return []
  }
}

// ─── Évaluation de l'expression écrite par Claude ──────────
async function evaluateWriting(
  prompts: any[], answers: any[], language: string
): Promise<{ score: number; feedback: any[] }> {
  const langName = LANG_NAMES[language]

  const evaluationRequest = prompts.map((p, i) => ({
    prompt: p.instruction,
    answer: answers[i]?.text || '',
    min_words: p.min_words,
  }))

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: `You are an expert CEFR examiner. Evaluate written responses and return ONLY valid JSON.`,
    messages: [{
      role: 'user',
      content: `Evaluate these ${langName} writing responses on a scale of 0-100 each.
Criteria: task achievement (40%), grammar (30%), vocabulary (20%), coherence (10%).

${JSON.stringify(evaluationRequest)}

Return: {"evaluations": [{"id": "1", "score": 75, "feedback": "...", "grammar_errors": [...], "suggestions": [...]}], "average_score": 75}`
    }]
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return {
      score: parsed.average_score || 0,
      feedback: parsed.evaluations || []
    }
  } catch {
    return { score: 0, feedback: [] }
  }
}

// ─── Handler principal ───────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      }
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { language, action, testId, answers } = await req.json()

    // ── ACTION 1 : Générer le test ──────────────────────────
    if (action === 'generate') {
      // Vérifier l'abonnement et le paiement du test
      const { data: sub } = await supabase
        .from('lingua_subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!sub) return new Response('Active subscription required', { status: 403 })

      // Générer les 4 blocs en parallèle
      const transcript = AUDIO_TRANSCRIPTS[language] || AUDIO_TRANSCRIPTS.en

      const [listeningQs, readingQs, grammarQs, writingQs] = await Promise.all([
        generateBlock('listening', language, transcript),
        generateBlock('reading',   language),
        generateBlock('grammar',   language),
        generateBlock('expression', language),
      ])

      const questionsData = {
        transcript,
        listening:  listeningQs,
        reading:    readingQs,
        grammar:    grammarQs,
        expression: writingQs,
      }

      // Créer le test dans la DB
      const { data: test, error } = await supabase
        .from('lingua_level_tests')
        .insert({
          user_id:       user.id,
          language,
          status:        'in_progress',
          questions_data: questionsData,
          started_at:    new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({
        testId: test.id,
        questions: questionsData,
        duration_minutes: 45,
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // ── ACTION 2 : Soumettre les réponses et calculer le score ─
    if (action === 'submit') {
      const { data: test } = await supabase
        .from('lingua_level_tests')
        .select('*')
        .eq('id', testId)
        .eq('user_id', user.id)
        .single()

      if (!test) return new Response('Test not found', { status: 404 })

      const questions = test.questions_data
      const endTime   = new Date()
      const duration  = Math.round((endTime.getTime() - new Date(test.started_at).getTime()) / 1000)

      // Calculer scores MCQ
      function scoreBlock(qArray: any[], answerMap: Record<string,string>): number {
        if (!qArray || qArray.length === 0) return 0
        const correct = qArray.filter((q: any) => answerMap[q.id] === q.correct).length
        return Math.round((correct / qArray.length) * 100)
      }

      const listeningScore = scoreBlock(questions.listening, answers.listening || {})
      const readingScore   = scoreBlock(questions.reading,   answers.reading   || {})
      const grammarScore   = scoreBlock(questions.grammar,   answers.grammar   || {})

      // Évaluer l'expression écrite avec Claude
      const writingEval = await evaluateWriting(
        questions.expression || [],
        answers.expression   || [],
        language
      )

      const { level, global } = calculateLevel({
        listening: listeningScore,
        reading:   readingScore,
        grammar:   grammarScore,
        writing:   writingEval.score,
      })

      const passed = global >= 60

      // Mettre à jour le test
      await supabase
        .from('lingua_level_tests')
        .update({
          status:                      passed ? 'completed' : 'failed',
          score_comprehension_orale:   listeningScore,
          score_comprehension_ecrite:  readingScore,
          score_grammaire_vocabulaire: grammarScore,
          score_expression:            writingEval.score,
          score_global:                global,
          level_obtained:              level,
          passed,
          answers_data:                answers,
          ai_evaluation:               { writing: writingEval.feedback },
          duration_seconds:            duration,
          completed_at:                endTime.toISOString(),
        })
        .eq('id', testId)

      return new Response(JSON.stringify({
        passed,
        level,
        scores: {
          global:    global,
          listening: listeningScore,
          reading:   readingScore,
          grammar:   grammarScore,
          writing:   writingEval.score,
        },
        feedback:    writingEval.feedback,
        testId,
        message: passed
          ? `Félicitations ! Vous avez obtenu le niveau ${level}.`
          : `Score insuffisant (${global}%). Un niveau minimum de 60% est requis pour obtenir un certificat.`,
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    return new Response('Invalid action', { status: 400 })

  } catch (error) {
    console.error('generate-level-test error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})