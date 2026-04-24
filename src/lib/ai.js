import { supabase } from './supabase'
import { sendEnhancedAIMessage as enhancedSend, getAvailableModelsForUser, getUserAIPermissions } from './ai-permissions'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// ─── Voice Settings (persisted in localStorage) ─────────────
const VOICE_SETTINGS_KEY = 'lingua_voice_settings'
const DEFAULT_VOICE_SETTINGS = {
  provider: 'auto',        // 'auto' | 'elevenlabs' | 'browser'
  voice: 'female',         // 'female' | 'male'
  speed: 1.0,              // 0.5 - 2.0
  autoPlay: true,
}

export function getVoiceSettings() {
  try {
    const raw = localStorage.getItem(VOICE_SETTINGS_KEY)
    return raw ? { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_VOICE_SETTINGS }
  } catch {
    return { ...DEFAULT_VOICE_SETTINGS }
  }
}

export function setVoiceSettings(settings) {
  const current = getVoiceSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(updated))
  return updated
}

// ─── Envoyer un message à l'assistant IA ──────────────────
export async function sendAIMessage({ messages, language, level, mode, userId, nativeLanguage }) {
  try {
    return await sendEnhancedAIMessage({
      messages,
      language,
      level,
      sessionType: mode,
      userId,
      nativeLanguage,
    })
  } catch (err) {
    console.warn('IA améliorée échouée, fallback:', err.message)
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
      const errText = await response.text()
      throw new Error(errText || 'Erreur IA')
    }
    return response.json()
  }
}

// ─── Détection de la langue d'un texte ────────────────────
export function detectTextLanguage(text) {
  const patterns = {
    ar: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/,
    fr: /[éèêëàâùûüôöîïçœæ]/i,
    es: /[ñáéíóúü¿¡]/i,
    de: /[äöüß]/i,
  }
  for (const [lang, regex] of Object.entries(patterns)) {
    if (regex.test(text)) return lang
  }
  return 'en'
}

// ─── Synthèse vocale (TTS) — ElevenLabs → Browser fallback ─
let currentAudio = null

export async function speak(text, language = 'en') {
  if (!text || typeof text !== 'string') return

  window.speechSynthesis.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }

  const settings = getVoiceSettings()

  // Essayer ElevenLabs si configuré
  if (settings.provider !== 'browser') {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/lingua-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          text,
          language,
          voice: settings.voice,
          speed: settings.speed,
        }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        currentAudio = new Audio(url)
        currentAudio.playbackRate = settings.speed
        await currentAudio.play()
        currentAudio.onended = () => {
          URL.revokeObjectURL(url)
          currentAudio = null
        }
        return
      }
      console.warn('ElevenLabs failed, falling back to browser TTS')
    } catch (err) {
      console.warn('ElevenLabs error:', err.message)
    }
  }

  // Fallback: Browser SpeechSynthesis
  const langMap = { en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', ar: 'ar-SA' }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = langMap[language] || 'en-US'
  utterance.rate = settings.speed
  utterance.pitch = 1.0
  utterance.volume = 1.0

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  window.speechSynthesis.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

// ─── Reconnaissance vocale (STT) — Whisper → Browser fallback ─
let mediaRecorder = null
let audioChunks = []

export function startListening(language, onResult, onError) {
  const settings = getVoiceSettings()

  // Essayer Whisper (MediaRecorder + Edge Function)
  if (settings.provider !== 'browser') {
    return tryWhisperSTT(language, onResult, onError)
  }

  // Fallback: Browser SpeechRecognition
  return tryBrowserSTT(language, onResult, onError)
}

function tryBrowserSTT(language, onResult, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    onError('Reconnaissance vocale non disponible sur ce navigateur.')
    return null
  }

  const langMap = { en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', ar: 'ar-SA' }
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
      ? 'Accès au microphone refusé.'
      : 'Erreur de reconnaissance vocale.')
  }

  recognition.start()
  return recognition
}

function tryWhisperSTT(language, onResult, onError) {
  if (!navigator.mediaDevices?.getUserMedia) {
    return tryBrowserSTT(language, onResult, onError)
  }

  audioChunks = []

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })

        try {
          const { data: { session } } = await supabase.auth.getSession()
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.webm')
          formData.append('language', language)

          const res = await fetch(`${SUPABASE_URL}/functions/v1/lingua-stt`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: formData,
          })

          if (!res.ok) throw new Error('Whisper failed')

          const data = await res.json()
          if (data.text) {
            onResult(data.text)
          } else {
            throw new Error('Empty transcription')
          }
        } catch (err) {
          console.warn('Whisper STT failed, fallback to browser:', err.message)
          const recognition = tryBrowserSTT(language, onResult, onError)
          if (recognition) {
            // Overwrite mediaRecorder ref with recognition ref
            return
          }
          onError(err.message)
        }
      }

      mediaRecorder.start()

      // Stop after 8 seconds of silence, or 30s max
      setTimeout(() => {
        if (mediaRecorder?.state === 'recording') {
          mediaRecorder.stop()
        }
      }, 8000)
    })
    .catch(() => {
      // Microphone access denied, fallback to browser STT
      tryBrowserSTT(language, onResult, onError)
    })

  // Return a mock object with stop() for the recognitionRef
  return {
    stop: () => {
      if (mediaRecorder?.state === 'recording') {
        mediaRecorder.stop()
      }
    }
  }
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

// ─── IA améliorée (multi‑fournisseurs) ──────────────────────────────
export async function sendEnhancedAIMessage(params) {
  return enhancedSend(params)
}

// ─── Modèles IA disponibles pour l'utilisateur ──────────────────────
export async function getAvailableAIModels(userId) {
  return getAvailableModelsForUser(userId)
}

// ─── Permissions IA de l'utilisateur ────────────────────────────────
export async function getUserAIPermissionsList(userId) {
  return getUserAIPermissions(userId)
}
