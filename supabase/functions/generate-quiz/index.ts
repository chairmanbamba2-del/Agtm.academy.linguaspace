import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
const supabase  = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SERVICE_ROLE_KEY')!
)

const LANG_NAMES: Record<string, string> = {
  en: 'English', fr: 'French', es: 'Spanish', de: 'German'
}

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
    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { transcript, language, level, isPlacementTest } = await req.json()

    const langName = LANG_NAMES[language] || language

    const prompt = isPlacementTest
      ? `Generate a placement test in ${langName} to evaluate learner level from A1 to C1.
Create exactly 10 multiple choice questions covering:
- 2 questions at A1 level (very basic)
- 2 questions at A2 level (elementary)
- 2 questions at B1 level (intermediate)
- 2 questions at B2 level (upper-intermediate)
- 2 questions at C1 level (advanced)

Each question should test grammar, vocabulary, or comprehension.`
      : `Generate exactly 5 multiple choice comprehension questions in ${langName} at CEFR level ${level}.
Base the questions on this content: "${transcript.slice(0, 3000)}"
Questions should test understanding of the main ideas, specific details, vocabulary in context.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `You are an expert language assessment specialist. You MUST respond with ONLY valid JSON — no markdown, no explanation, no preamble.

Return this exact structure:
{
  "questions": [
    {
      "id": "1",
      "question": "Question text in ${langName}",
      "options": ["A. option", "B. option", "C. option", "D. option"],
      "correct": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`,
      messages: [{ role: 'user', content: prompt }]
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '{}'

    // Nettoyer et parser le JSON
    const cleaned = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let quiz
    try {
      quiz = JSON.parse(cleaned)
    } catch {
      // Fallback basique si le JSON est malformé
      quiz = { questions: [] }
    }

    return new Response(JSON.stringify(quiz), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('generate-quiz error:', error)
    return new Response(JSON.stringify({ error: error.message, questions: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
