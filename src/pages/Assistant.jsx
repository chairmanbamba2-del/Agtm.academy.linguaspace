import { useState, useRef, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { sendAIMessage, speak, startListening } from '../lib/ai'
import { LANGUAGES, AI_MODES } from '../lib/constants'

export default function Assistant() {
  const { loading } = useProfile()
  const user        = useUserStore(s => s.user)
  const progress    = useUserStore(s => s.progress)
  const { isActive, isPremium, languages, can } = useSubscription()

  const [selectedLang, setSelectedLang] = useState(null)
  const [selectedMode, setMode]         = useState('free_talk')
  const [messages, setMessages]         = useState([])
  const [input, setInput]               = useState('')
  const [aiLoading, setAILoading]       = useState(false)
  const [isListening, setListening]     = useState(false)
  const [isSpeaking, setSpeaking]       = useState(false)
  const [error, setError]               = useState('')

  const chatEndRef   = useRef(null)
  const recognitionRef = useRef(null)

  if (!loading && !isActive) return <Navigate to="/subscribe" replace />

  const currentLang = selectedLang || languages[0]
  const langInfo    = LANGUAGES[currentLang]
  const prog        = progress.find(p => p.language === currentLang)
  const level       = prog?.current_level || 'A1'

  const accessibleModes = AI_MODES.filter(m =>
    m.plan === 'standard' || (m.plan === 'premium' && isPremium)
  )

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Message de bienvenue à chaque changement de langue/mode
    if (!currentLang) return
    const welcome = {
      role: 'assistant',
      content: getWelcomeMessage(currentLang, level, selectedMode)
    }
    setMessages([welcome])
  }, [currentLang, selectedMode])

  async function sendMessage(text) {
    if (!text.trim() || aiLoading) return
    setError('')
    setInput('')

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setAILoading(true)

    try {
      const history = newMessages.map(m => ({ role: m.role, content: m.content }))
      const response = await sendAIMessage({
        messages: history,
        language: currentLang,
        level,
        mode: selectedMode,
        userId: user.id
      })

      const aiMsg = { role: 'assistant', content: response }
      setMessages(m => [...m, aiMsg])

      // Lire la réponse à voix haute
      setSpeaking(true)
      speak(response, currentLang)
      setTimeout(() => setSpeaking(false), response.length * 60)
    } catch (err) {
      setError('Erreur de connexion à l\'IA. Réessayez.')
    } finally {
      setAILoading(false)
    }
  }

  function handleVoice() {
    if (isListening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    setListening(true)
    recognitionRef.current = startListening(
      currentLang,
      (transcript) => {
        setListening(false)
        sendMessage(transcript)
      },
      (err) => {
        setListening(false)
        setError(err)
      }
    )
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-h-[800px]">
        {/* Header */}
        <div className="mb-4">
          <p className="section-label">IA Coach</p>
          <h1 className="font-serif text-2xl text-white">Assistant <em className="text-gold">Multilingue</em></h1>
        </div>

        {/* Config bar */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Langue */}
          <div className="flex gap-1">
            {languages.map(l => (
              <button key={l} onClick={() => setSelectedLang(l)}
                className={`px-3 py-1.5 text-sm rounded transition-all flex items-center gap-1.5
                  ${currentLang === l ? 'bg-gold text-dark font-semibold' : 'bg-card text-muted hover:text-white border border-white/8'}`}>
                {LANGUAGES[l].flag} {LANGUAGES[l].name}
              </button>
            ))}
          </div>

          {/* Mode */}
          <div className="flex gap-1 flex-wrap">
            {accessibleModes.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 text-xs rounded transition-all flex items-center gap-1
                  ${selectedMode === m.id ? 'bg-blue/40 text-white border border-blue/50' : 'bg-card text-muted hover:text-white border border-white/8'}`}>
                {m.icon} {m.label}
              </button>
            ))}
            {!isPremium && (
              <span className="px-3 py-1.5 text-xs text-muted border border-white/5 rounded flex items-center gap-1">
                🔒 Role Play & Exam Prep <span className="text-gold">→ Premium</span>
              </span>
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 overflow-y-auto card p-4 mb-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 self-end"
                     style={{ background: 'linear-gradient(135deg, #E8941A, #1B4F8A)' }}>
                  🤖
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-gold/15 border border-gold/20 text-white rounded-br-sm'
                  : 'bg-blue/20 border border-blue/30 text-white rounded-bl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {aiLoading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2 self-end"
                   style={{ background: 'linear-gradient(135deg, #E8941A, #1B4F8A)' }}>🤖</div>
              <div className="bg-blue/20 border border-blue/30 px-4 py-3 rounded rounded-bl-sm">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"
                         style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center text-xs text-red-400 bg-red-900/20 border border-red-500/20 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="flex gap-3 items-end">
          {/* Bouton micro */}
          <button onClick={handleVoice}
            className={`flex-shrink-0 w-12 h-12 rounded flex items-center justify-center text-xl transition-all
              ${isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-card text-muted hover:text-white border border-white/10'}`}
            title={isListening ? 'Arrêter l\'écoute' : 'Parler'}>
            {isListening ? '⏹' : '🎙️'}
          </button>

          {/* Input texte */}
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Écrivez ou parlez en ${langInfo?.name}... (Entrée pour envoyer)`}
              rows={1}
              className="w-full bg-card border border-white/10 text-white px-4 py-3 text-sm rounded resize-none
                         focus:outline-none focus:border-gold/40 transition-colors placeholder:text-white/25"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          {/* Bouton envoyer */}
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || aiLoading}
            className="flex-shrink-0 btn-gold px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed">
            {aiLoading ? '⏳' : '→'}
          </button>
        </div>

        {isListening && (
          <p className="text-center text-xs text-red-400 mt-2 animate-pulse">
            🔴 Écoute en cours... Parlez en {langInfo?.name}
          </p>
        )}
        {isSpeaking && (
          <p className="text-center text-xs text-blue-400 mt-2">
            🔊 L'IA parle...
          </p>
        )}
      </div>
    </AppLayout>
  )
}

function getWelcomeMessage(lang, level, mode) {
  const messages = {
    en: {
      free_talk:  `Hello! I'm your English Coach. Your current level is ${level}. What would you like to talk about today? 😊`,
      business:   `Welcome to Business English mode! I'm ready to help you with professional communication. Let's practice emails, meetings, or presentations. Where shall we start?`,
      travel:     `Hi! Let's practice travel English. Imagine you just arrived at an international airport. How can I help you today?`,
      daily_life: `Hey! Let's practice everyday English. Tell me about your day or ask me anything!`,
      role_play:  `Welcome to Role Play mode! I can be your interviewer, colleague, customer, or any character you need. What scenario would you like to practice?`,
      exam_prep:  `Hello! I'm your IELTS/TOEFL preparation coach. We can practice speaking tests, listening comprehension, or grammar. What's your target exam?`,
    },
    fr: {
      free_talk:  `Bonjour ! Je suis votre coach de français. Votre niveau actuel est ${level}. De quoi voulez-vous parler aujourd'hui ? 😊`,
      business:   `Bienvenue dans le mode Français professionnel ! Pratiquons les emails, réunions et présentations en entreprise.`,
    },
    es: {
      free_talk:  `¡Hola! Soy tu coach de español. Tu nivel actual es ${level}. ¿De qué quieres hablar hoy? 😊`,
      business:   `¡Bienvenido al modo español de negocios! Vamos a practicar comunicación profesional en español.`,
    },
    de: {
      free_talk:  `Hallo! Ich bin Ihr Deutsch-Coach. Ihr aktuelles Niveau ist ${level}. Worüber möchten Sie heute sprechen? 😊`,
      business:   `Willkommen im Geschäftsdeutsch-Modus! Lassen Sie uns professionelle Kommunikation auf Deutsch üben.`,
    },
  }
  return messages[lang]?.[mode] || messages[lang]?.free_talk || messages.en.free_talk
}
