import { useState, useRef, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { sendAIMessage, speak, startListening } from '../lib/ai'
import { LANGUAGES, AI_MODES } from '../lib/constants'
import MasterCard, { LevelBadge } from '../components/ui/MasterCard'
import { AIVoiceWave, PulseAvatar, ElasticBubble } from '../components/ui/AIWidgets'

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

  // Couleur d'accent selon la langue active
  const LANG_ACCENT = {
    en: { color: '#C8102E', glow: 'rgba(200,16,46,0.3)'  },
    es: { color: '#F1BF00', glow: 'rgba(241,191,0,0.3)'  },
    de: { color: '#94A3B8', glow: 'rgba(148,163,184,0.3)' },
    fr: { color: '#4A7FBF', glow: 'rgba(74,127,191,0.3)'  },
  }
  const langAccent = LANG_ACCENT[currentLang] || { color: '#E8941A', glow: 'rgba(232,148,26,0.3)' }

  return (
    <AppLayout>
      {/* ── Conteneur principal ──────────────────────────────── */}
      <div className="flex flex-col h-[calc(100dvh-80px)] max-h-[880px]">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-5 flex-shrink-0">
          <div>
            <p className="font-mono text-[9px] tracking-[0.3em] text-gold/70 uppercase mb-1">IA Coach</p>
            <h1 className="font-serif text-2xl text-white leading-tight">
              Assistant <em className="text-gold" style={{ textShadow: '0 0 20px rgba(232,148,26,0.4)' }}>Multilingue</em>
            </h1>
          </div>
            {/* Indicateur de niveau actif */}
            {level && (
              <div className="flex items-center gap-2">
                <LevelBadge level={level} lang={currentLang} size="sm" />
                <span className="font-mono text-xs text-muted">{langInfo?.name}</span>
              </div>
            )}
        </div>

        {/* ── Barre de configuration ──────────────────────────── */}
         <MasterCard
           variant="action"
           padding="sm"
           className="flex flex-wrap gap-2 mb-4 flex-shrink-0"
         >
          {/* Sélecteur de langue */}
          <div className="flex gap-1 items-center flex-wrap">
            {languages.map(l => {
              const la  = LANG_ACCENT[l] || { color: '#E8941A' }
              const sel = currentLang === l
              return (
                 <button
                   key={l}
                   onClick={() => setSelectedLang(l)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-250 ${sel ? '' : 'glass'}`}
                   style={sel ? {
                     background:  `${la.color}22`,
                     border:      `1px solid ${la.color}55`,
                     color:       '#FAFAF8',
                     boxShadow:   `0 0 12px ${la.color}33`,
                   } : { color: '#8A9AB5' }}
                 >
                   {LANGUAGES[l].flag} {LANGUAGES[l].name}
                 </button>
              )
            })}
          </div>

          {/* Séparateur */}
          <div className="w-px self-stretch bg-white/8 mx-1 hidden sm:block" />

          {/* Sélecteur de mode */}
          <div className="flex gap-1 flex-wrap items-center">
            {accessibleModes.map(m => {
              const sel = selectedMode === m.id
              return (
                 <button
                   key={m.id}
                   onClick={() => setMode(m.id)}
                   className={`flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs transition-all duration-250 ${sel ? '' : 'glass'}`}
                   style={sel ? {
                     background:  'rgba(27,79,138,0.35)',
                     border:      '1px solid rgba(27,79,138,0.6)',
                     color:       '#FAFAF8',
                     boxShadow:   '0 0 10px rgba(27,79,138,0.2)',
                   } : { color: '#8A9AB5' }}
                 >
                   <span>{m.icon}</span>
                   <span>{m.label}</span>
                 </button>
              )
            })}
            {!isPremium && (
               <span
                 className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs glass"
                 style={{
                   color:    '#8A9AB5',
                   opacity:  0.6,
                 }}
               >
                 <span>🔒</span>
                 <span>Role Play</span>
                 <span style={{ color: '#E8941A' }}>→ Premium</span>
               </span>
            )}
           </div>
         </MasterCard>

        {/* ── Zone de chat ──────────────────────────────────── */}
         <MasterCard
           variant="content"
           padding="sm"
           className="flex-1 overflow-y-auto sidebar-scrollbar mb-3 space-y-5"
         >
           {messages.map((msg, i) => (
             <ElasticBubble key={i}>
               <ChatBubble msg={msg} langAccent={langAccent} />
             </ElasticBubble>
           ))}

          {/* Typing indicator */}
          {aiLoading && (
            <div className="flex items-end gap-2.5">
               <AIAvatar isSpeaking={false} langAccent={langAccent} isThinking={aiLoading} />
              <div
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
                style={{
                  background: 'rgba(27,79,138,0.2)',
                  border:     '1px solid rgba(27,79,138,0.3)',
                }}
              >
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="block w-1.5 h-1.5 rounded-full bg-gold/70"
                    style={{
                      animation:      'bounce-dot 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.18}s`,
                    }}
                  />
                 ))}
          </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div
              className="text-center text-xs px-4 py-2.5 rounded-card"
              style={{
                color:       '#F87171',
                background:  'rgba(239,68,68,0.08)',
                border:      '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {error}
            </div>
          )}

          <div ref={chatEndRef} />
        </MasterCard>

        {/* ── Indicateurs vocaux ────────────────────────────── */}
        {(isListening || isSpeaking) && (
          <div className="flex items-center justify-center gap-6 py-2 mb-1 flex-shrink-0">
             {isListening && <VoiceWaveIndicator label={`Écoute · ${langInfo?.name}`} color="#EF4444" active={isListening} />}
             {isSpeaking  && <VoiceWaveIndicator label="L'IA parle..." color={langAccent.color} active={isSpeaking} />}
          </div>
        )}

        {/* ── Zone de saisie ────────────────────────────────── */}
         <MasterCard
           variant="action"
           padding="none"
           className="flex gap-2 items-end p-2 flex-shrink-0"
         >
          {/* Bouton micro */}
          <button
            onClick={handleVoice}
            title={isListening ? "Arrêter l'écoute" : 'Parler'}
            className="flex-shrink-0 w-11 h-11 rounded-card flex items-center justify-center transition-all duration-250"
            style={isListening ? {
              background: 'rgba(239,68,68,0.2)',
              border:     '1px solid rgba(239,68,68,0.5)',
              color:      '#FCA5A5',
              boxShadow:  '0 0 16px rgba(239,68,68,0.3)',
              animation:  'speak-pulse 1.5s ease-in-out infinite',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border:     '1px solid rgba(255,255,255,0.08)',
              color:      '#8A9AB5',
            }}
          >
            <span className="text-lg leading-none">{isListening ? '■' : '⏺'}</span>
          </button>

          {/* Input texte */}
          <div className="flex-1">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Écrivez en ${langInfo?.name || 'votre langue'}… (Entrée pour envoyer)`}
              rows={1}
              className="w-full text-white text-sm resize-none focus:outline-none"
              style={{
                background:       'transparent',
                border:           'none',
                color:            '#FAFAF8',
                minHeight:        '44px',
                maxHeight:        '120px',
                padding:          '0.65rem 0.5rem',
                lineHeight:       '1.5',
                caretColor:       langAccent.color,
                fontFamily:       'DM Sans, sans-serif',
              }}
            />
          </div>

          {/* Bouton envoyer */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || aiLoading}
            className="flex-shrink-0 w-11 h-11 rounded-card flex items-center justify-center text-dark font-bold text-lg transition-all duration-250 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: input.trim() && !aiLoading
                ? 'linear-gradient(135deg, #E8941A, #F5B942)'
                : 'rgba(232,148,26,0.2)',
              boxShadow: input.trim() && !aiLoading
                ? '0 4px 16px rgba(232,148,26,0.35)'
                : 'none',
            }}
          >
            {aiLoading ? (
              <span
                className="w-4 h-4 border-2 border-dark/40 border-t-dark rounded-full"
                style={{ animation: 'spin-slow 0.8s linear infinite' }}
              />
            ) : (
              <span className="text-base">↑</span>
            )}
           </button>
         </MasterCard>
       </div>
    </AppLayout>
  )
}

// ── Sous-composant : bulle de chat ──────────────────────────
function ChatBubble({ msg, langAccent }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar IA */}
      {!isUser && <AIAvatar isSpeaking={false} langAccent={langAccent} />}

      {/* Bulle de message */}
      <div
        className="max-w-[78%] text-sm leading-relaxed"
        style={isUser ? {
          // Bulle utilisateur : dorée, coin bas-droit carré
          background:    'linear-gradient(135deg, rgba(232,148,26,0.18), rgba(232,148,26,0.08))',
          border:        '1px solid rgba(232,148,26,0.25)',
          color:         '#FAFAF8',
          borderRadius:  '18px 18px 4px 18px',
          padding:       '0.75rem 1rem',
          boxShadow:     '0 2px 12px rgba(232,148,26,0.1)',
        } : {
          // Bulle IA : bleue, coin bas-gauche carré
          background:    'linear-gradient(135deg, rgba(27,79,138,0.25), rgba(13,45,82,0.3))',
          border:        '1px solid rgba(27,79,138,0.35)',
          color:         '#FAFAF8',
          borderRadius:  '18px 18px 18px 4px',
          padding:       '0.75rem 1rem',
          boxShadow:     '0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        {msg.content}
      </div>
    </div>
  )
}

// ── Sous-composant : avatar IA ──────────────────────────────
function AIAvatar({ isSpeaking, langAccent, isThinking = false }) {
  return (
    <PulseAvatar isThinking={isThinking || isSpeaking}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 select-none"
        style={{
          background: 'linear-gradient(135deg, #E8941A 0%, #1B4F8A 100%)',
        }}
      >
        ◎
      </div>
    </PulseAvatar>
  )
}

// ── Sous-composant : indicateur vague sonore ────────────────
function VoiceWaveIndicator({ label, color, active = true }) {
  return (
    <div className="flex items-center gap-3">
      <AIVoiceWave active={active} />
      <span
        className="font-mono text-[9px] tracking-[0.15em] uppercase"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
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
