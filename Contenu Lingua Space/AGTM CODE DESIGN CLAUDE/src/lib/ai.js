import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// ─── Envoyer un message à l'assistant IA ──────────────────
export async function sendAIMessage({ messages, language, level, mode, userId }) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(`${SUPABASE_URL}/functions/v1/lingua-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ messages, language, level, mode, userId })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(err || 'Erreur IA')
  }

  const text = await response.json()
  return text
}

// ─── Générer un quiz depuis une transcription ─────────────
export async function generateQuiz({ transcript, language, level }) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ transcript, language, level })
  })

  if (!response.ok) throw new Error('Erreur génération quiz')

  return response.json()
}

// ─── Test de niveau initial (onboarding) ──────────────────
export async function generateLevelTest(language) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      transcript: `Generate a placement test for ${language} language learners. Include grammar, vocabulary, and comprehension questions appropriate for mixed levels from A1 to C1.`,
      language,
      level: 'mixed',
      isPlacementTest: true
    })
  })

  if (!response.ok) throw new Error('Erreur test de niveau')
  return response.json()
}

// ─── Initier un paiement CinetPay ─────────────────────────
export async function initPayment({ userId, planType, selectedLanguage, paymentMethod }) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(`${SUPABASE_URL}/functions/v1/payment-init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ userId, planType, selectedLanguage, paymentMethod })
  })

  if (!response.ok) throw new Error('Erreur initiation paiement')
  return response.json()
}

// ─── Synthèse vocale (TTS) ────────────────────────────────
export function speak(text, language = 'en') {
  if (!window.speechSynthesis) return

  window.speechSynthesis.cancel()

  const langMap = { en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE' }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = langMap[language] || 'en-US'
  utterance.rate = 0.9
  utterance.pitch = 1.0
  utterance.volume = 1.0

  window.speechSynthesis.speak(utterance)
}

// ─── Reconnaissance vocale (STT) ──────────────────────────
export function startListening(language, onResult, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    onError('La reconnaissance vocale n\'est pas disponible sur votre navigateur.')
    return null
  }

  const langMap = { en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE' }

  const recognition = new SpeechRecognition()
  recognition.lang = langMap[language] || 'en-US'
  recognition.continuous = false
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }

  recognition.onerror = (event) => {
    onError(event.error === 'not-allowed'
      ? 'Accès au microphone refusé. Autorisez le microphone dans votre navigateur.'
      : 'Erreur de reconnaissance vocale.')
  }

  recognition.start()
  return recognition
}
