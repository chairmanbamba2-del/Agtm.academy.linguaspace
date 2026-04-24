import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { sendAIMessage, speak, startListening, stopSpeaking } from '../lib/ai'
import NativeLangModal from '../components/ui/NativeLangModal'
import VoiceSettingsModal from '../components/ui/VoiceSettings'
import { LANGUAGES } from '../lib/constants'
import MasterCard, { LevelBadge } from '../components/ui/MasterCard'
import { AIVoiceWave, PulseAvatar, ElasticBubble } from '../components/ui/AIWidgets'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const EXAMS = [
  { id: 'toeic',    label: 'TOEIC',    desc: 'Test of English for International Communication' },
  { id: 'toefl',    label: 'TOEFL',    desc: 'Test of English as a Foreign Language' },
  { id: 'ielts',    label: 'IELTS',    desc: 'International English Language Testing System' },
  { id: 'bepc',     label: 'BEPC',     desc: 'Brevet d\'Études du Premier Cycle' },
  { id: 'bac',      label: 'BAC',      desc: 'Baccalauréat — épreuve de langue' },
  { id: 'other',    label: 'Autre',    desc: 'Examen personnalisé' },
]

const AI_MODES = [
  { id: 'free_talk',  icon: '💬', label: 'Free Talk', plan: 'standard' },
  { id: 'business',   icon: '💼', label: 'Business',  plan: 'standard' },
  { id: 'daily_life', icon: '🏠', label: 'Quotidien', plan: 'standard' },
  { id: 'travel',     icon: '✈️',  label: 'Voyage',    plan: 'standard' },
  { id: 'role_play',  icon: '🎭', label: 'Role Play', plan: 'premium' },
  { id: 'exam_prep',  icon: '📝', label: 'Exam Prep', plan: 'premium' },
  { id: 'islamic',    icon: '🕌', label: 'أستاذ العربية', plan: 'premium' },
  { id: 'level_test', icon: '📊', label: 'Test niveau', plan: 'standard' },
]

const getGreeting = (lang, level, mode, exam) => {
  const levelTest = `👋 Bienvenue au test de niveau ! Je vais évaluer ton niveau actuel en ${LANGUAGES[lang]?.name || lang} à travers une conversation interactive. Réponds naturellement, il n'y a pas de bonne ou mauvaise réponse. Prêt(e) à commencer ?`
  const examPrep = exam && exam !== 'other'
    ? `📚 Préparation ${exam.toUpperCase()} activée. Je suis ton coach pour l'examen ${EXAMS.find(e => e.id === exam)?.label || exam}. Nous allons travailler les compétences clés. Quel sujet veux-tu aborder ?`
    : `📚 Mode préparation d'examen activé. Quel examen prépares-tu ? (${EXAMS.map(e => e.label).join(', ')})`
  return { level_test: levelTest, exam_prep: examPrep }
}

function getEstimatedLevel(messages) {
  const userMsgs = messages.filter(m => m.role === 'user').map(m => m.content).join(' ')
  const len = userMsgs.length
  const avgWordLen = userMsgs.split(/\s+/).reduce((a, w) => a + w.length, 0) / Math.max(userMsgs.split(/\s+/).length, 1)
  const hasComplex = /(although|however|therefore|nevertheless|consequently|furthermore)/i.test(userMsgs)
  const hasBasic = /(hello|hi|yes|no|good|bad|big|small|like|go|come)/i.test(userMsgs)
  if (len > 500 && hasComplex) return 'B2'
  if (len > 200 && avgWordLen > 5) return 'B1'
  if (len > 80) return 'A2'
  return hasBasic ? 'A1' : 'A1'
}

export default function Assistant() {
  const { loading } = useProfile()
  const user = useUserStore(s => s.user)
  const progress = useUserStore(s => s.progress)
  const setProgress = useUserStore(s => s.setProgress)
  const nativeLanguage = useUserStore(s => s.nativeLanguage)
  const { isActive, isPremium, languages, can } = useSubscription()

  const [selectedLang, setSelectedLang] = useState(null)
  const [selectedMode, setMode] = useState('free_talk')
  const [selectedExam, setSelectedExam] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [aiLoading, setAILoading] = useState(false)
  const [isListening, setListening] = useState(false)
  const [isSpeaking, setSpeaking] = useState(false)
  const [error, setError] = useState('')
  const [suggestedLevel, setSuggestedLevel] = useState(null)
  const [showLevelPicker, setShowLevelPicker] = useState(false)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)

  useEffect(() => {
    setExamFromMode()
  }, [selectedMode])

  function setExamFromMode() {
    if (selectedMode !== 'exam_prep') setSelectedExam(null)
  }

  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const currentLang = selectedLang || languages[0]
  const langInfo = LANGUAGES[currentLang]
  const prog = progress.find(p => p.language === currentLang)
  const level = prog?.current_level || 'A1'
  const isAdmin = useUserStore(s => s.isAdmin)
  const isRTL = currentLang === 'ar'

  const accessibleModes = AI_MODES.filter(m =>
    m.plan === 'standard' || (m.plan === 'premium' && isPremium)
  )

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (!currentLang) return
    const greeting = getGreeting(currentLang, level, selectedMode, selectedExam)
    const content = selectedMode === 'level_test' ? greeting.level_test
      : selectedMode === 'exam_prep' ? greeting.exam_prep
      : getWelcomeMessage(currentLang, level, selectedMode)
    setMessages([{ role: 'assistant', content }])
    setSuggestedLevel(null)
    setShowLevelPicker(false)
  }, [currentLang, selectedMode, selectedExam])

  async function sendMessage(text, { skipLevelCheck = false } = {}) {
    if (!text.trim() || aiLoading) return
    setError('')
    setInput('')

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setAILoading(true)

    try {
      const history = newMessages.map(m => ({ role: m.role, content: m.content }))

      const systemPrompt = selectedMode === 'level_test'
        ? `Tu es un coach linguistique expert. Tu évalues le niveau de l'utilisateur en ${langInfo?.name || currentLang} via une conversation naturelle.
           Règles :
           - N'interromps pas l'évaluation, guide l'utilisateur avec des questions ouvertes
           - Adapte la difficulté en fonction des réponses
           - Après 3-5 échanges, tu dois fournir une estimation de niveau (A1, A2, B1, B2, C1, C2)
           - Tu restes bienveillant et encourageant
           - À la fin, propose à l'utilisateur de valider le niveau estimé ou de continuer à s'entraîner
           Retourne un JSON à la fin de ton message au format: <<LEVEL: X>> où X est le niveau estimé`

        : selectedMode === 'exam_prep'
        ? `Tu es un coach spécialisé dans la préparation aux examens (${selectedExam || 'général'}). 
           - Pose des questions type examen
           - Corrige et explique les erreurs
           - Donne des conseils méthodologiques
           - Adapte le niveau à l'objectif de l'étudiant (niveau actuel: ${level})
           - En mode TOEIC, utilise le format et le timing du TOEIC
           - En mode BEPC/BAC, respecte le programme officiel français
           Sois exigeant mais encourageant.`

        : selectedMode === 'islamic'
        ? `${nativeLanguage && currentLang === 'ar'
          ? `Tu es LINGUA AI, un coach d'arabe intensif pour les apprenants africains.
L'utilisateur parle ${LANGUAGES[nativeLanguage]?.name || nativeLanguage} comme langue maternelle.

RÈGLES PÉDAGOGIQUES :
1. Enseigne l'arabe (Fusha) en mode bilingue : introduis chaque concept dans la langue maternelle de l'utilisateur, puis pratique en arabe
2. Utilise la translittération (lettres latines) pour aider la prononciation
3. Compare les structures grammaticales entre l'arabe et la langue maternelle de l'utilisateur
4. Corrige les erreurs IMMÉDIATEMENT avec des explications claires
5. Après chaque notion, propose 2-3 exercices pratiques progressifs
6. Augmente progressivement la proportion d'arabe dans les réponses
7. Récompense les bonnes réponses avec des encouragements
8. Adapte le vocabulaire au contexte africain et islamique
9. à la fin de chaque session, donne un résumé des points appris et des axes d'amélioration
Niveau actuel: ${level}. Mode: enseignement intensif de l'arabe.`
          : `Tu es un coach linguistique pour l'apprentissage de l'arabe.
Niveau de l'utilisateur: ${level}. Mode: ${selectedMode}. Langue: arabe.
Corrige les erreurs avec bienveillance. Propose des défis adaptés.`}`
        : `Tu es un coach linguistique expert. Niveau de l'utilisateur: ${level}.
           - Corrige les erreurs avec bienveillance après chaque réponse
           - Si l'utilisateur semble sous-estimé ou sur-estimé, tu peux proposer un ajustement
           - Propose des défis adaptés à son niveau
           - Garde la conversation naturelle et engageante
           Mode actuel: ${selectedMode}. Langue: ${langInfo?.name || currentLang}.`

      const response = await sendAIMessage({
        messages: [{ role: 'system', content: systemPrompt }, ...history],
        language: currentLang,
        level,
        mode: selectedMode,
        userId: user.id,
        nativeLanguage,
      })

      const aiMsg = { role: 'assistant', content: response }
      setMessages(m => [...m, aiMsg])

      if (selectedMode === 'level_test' && !skipLevelCheck) {
        const levelMatch = response.match(/<<LEVEL:\s*([ABCD]\d?)>>/i)
        if (levelMatch) {
          setSuggestedLevel(levelMatch[1].toUpperCase())
          setShowLevelPicker(true)
        } else {
          const estimated = getEstimatedLevel([...messages, userMsg, aiMsg])
          if (messages.filter(m => m.role === 'user').length >= 3) {
            setSuggestedLevel(estimated)
            setShowLevelPicker(true)
          }
        }
      }

      setSpeaking(true)
      stopSpeaking()
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
      (transcript) => { setListening(false); sendMessage(transcript) },
      (err) => { setListening(false); setError(err) }
    )
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  function handleLevelChange(newLevel) {
    const updated = progress.map(p =>
      p.language === currentLang ? { ...p, current_level: newLevel } : p
    )
    if (!updated.find(p => p.language === currentLang)) {
      updated.push({ language: currentLang, current_level: newLevel, xp_points: 0, streak_days: 0 })
    }
    setProgress(updated)
    setShowLevelPicker(false)
    setSuggestedLevel(null)
    supabase.from('lingua_progress').upsert({
      user_id: user.id,
      language: currentLang,
      current_level: newLevel,
      xp_points: prog?.xp_points || 0,
      streak_days: prog?.streak_days || 0,
    }, { onConflict: 'user_id,language' }).catch(() => {})
  }

  function handleAdjustLevel(change) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const idx = levels.indexOf(level)
    const newIdx = Math.max(0, Math.min(levels.length - 1, idx + change))
    handleLevelChange(levels[newIdx])
  }

  const LANG_ACCENT = {
    en: { color: '#C8102E', glow: 'rgba(200,16,46,0.3)' },
    es: { color: '#F1BF00', glow: 'rgba(241,191,0,0.3)' },
    de: { color: '#94A3B8', glow: 'rgba(148,163,184,0.3)' },
    fr: { color: '#4A7FBF', glow: 'rgba(74,127,191,0.3)' },
    ar: { color: '#059669', glow: 'rgba(5,150,105,0.3)' },
  }
  const langAccent = LANG_ACCENT[currentLang] || { color: '#E8941A', glow: 'rgba(232,148,26,0.3)' }

  if (!loading && !isActive && !isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-xl text-white font-serif mb-2">Abonnement requis</h2>
          <p className="text-muted mb-4">Souscris à un abonnement pour accéder au coach IA</p>
          <a href="/subscribe" className="btn bg-gold text-dark font-semibold px-6 py-3">Voir les offres</a>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100dvh-80px)] max-h-[880px]">
        {/* Header */}
        <div className="flex items-end justify-between mb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              {level && <LevelBadge level={level} lang={currentLang} size="sm" />}
              <span className="font-mono text-xs text-muted">{langInfo?.name}</span>
            </div>
            <h1 className="font-serif text-2xl text-white leading-tight mt-1">
              Coach <em className="text-gold" style={{ textShadow: '0 0 20px rgba(232,148,26,0.4)' }}>IA</em>
            </h1>
          </div>
          <div className="flex gap-1">
            {showLevelPicker && suggestedLevel && (
              <>
                <button onClick={() => handleLevelChange(suggestedLevel)} className="text-xs px-3 py-1.5 bg-green/20 text-green rounded-sm hover:bg-green/30">✅ Valider {suggestedLevel}</button>
                <button onClick={() => handleAdjustLevel(-1)} className="text-xs px-3 py-1.5 bg-white/5 text-muted rounded-sm hover:bg-white/10">-</button>
                <button onClick={() => handleAdjustLevel(1)} className="text-xs px-3 py-1.5 bg-white/5 text-muted rounded-sm hover:bg-white/10">+</button>
                <button onClick={() => setShowLevelPicker(false)} className="text-xs px-3 py-1.5 bg-white/5 text-muted rounded-sm">✕</button>
              </>
            )}
            {!showLevelPicker && (
              <button onClick={() => setShowLevelPicker(true)} className="text-xs px-3 py-1.5 bg-white/5 text-muted rounded-sm hover:bg-white/10">⚙️ Niveau</button>
            )}
            <button
              onClick={() => setShowVoiceSettings(true)}
              className="text-xs px-3 py-1.5 bg-white/5 text-muted rounded-sm hover:bg-white/10"
              title="Paramètres vocaux"
            >
              🔊 Voix
            </button>
          </div>
        </div>

        {/* Contrôles */}
        <MasterCard variant="action" padding="sm" className="mb-3 flex-shrink-0">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-1 items-center flex-wrap">
              {languages.map(l => {
                const sel = currentLang === l
                return (
                  <button key={l} onClick={() => setSelectedLang(l)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-250 ${sel ? '' : 'glass'}`}
                    style={sel ? { background: `${LANG_ACCENT[l]?.color}22`, border: `1px solid ${LANG_ACCENT[l]?.color}55`, color: '#FAFAF8', boxShadow: `0 0 12px ${LANG_ACCENT[l]?.color}33` } : { color: '#8A9AB5' }}>
                    {LANGUAGES[l]?.flag} {LANGUAGES[l]?.name}
                  </button>
                )
              })}
            </div>
            <div className="w-px self-stretch bg-white/8 mx-1 hidden sm:block" />
            <div className="flex gap-1 flex-wrap items-center">
              {accessibleModes.map(m => {
                const sel = selectedMode === m.id
                return (
                  <button key={m.id} onClick={() => setMode(m.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs transition-all duration-250 ${sel ? '' : 'glass'}`}
                    style={sel ? { background: 'rgba(27,79,138,0.35)', border: '1px solid rgba(27,79,138,0.6)', color: '#FAFAF8', boxShadow: '0 0 10px rgba(27,79,138,0.2)' } : { color: '#8A9AB5' }}>
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </MasterCard>

        {/* Sélecteur d'examen (exam_prep) */}
        {selectedMode === 'exam_prep' && (
          <MasterCard variant="action" padding="sm" className="mb-3 flex-shrink-0">
            <div className="flex gap-2 flex-wrap">
              {EXAMS.map(e => (
                <button key={e.id} onClick={() => setSelectedExam(e.id)}
                  className={`text-xs px-4 py-2 rounded-sm transition-all ${selectedExam === e.id ? 'bg-gold/20 text-gold border border-gold/40' : 'bg-white/5 text-muted border border-white/10 hover:bg-white/10'}`}>
                  <span className="block font-medium">{e.label}</span>
                  <span className="block text-[9px] opacity-60">{e.desc}</span>
                </button>
              ))}
            </div>
          </MasterCard>
        )}

        {/* Niveau ajustable */}
        {showLevelPicker && !suggestedLevel && (
          <MasterCard variant="content" padding="sm" className="mb-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Ajuster le niveau :</span>
              <div className="flex gap-1">
                {['A1','A2','B1','B2','C1','C2'].map(l => (
                  <button key={l} onClick={() => handleLevelChange(l)}
                    className={`px-3 py-1 rounded-sm text-xs font-mono ${level === l ? 'bg-gold text-dark' : 'bg-white/5 text-muted hover:bg-white/10'}`}>{l}</button>
                ))}
              </div>
            </div>
          </MasterCard>
        )}

        {/* Zone de chat */}
        <MasterCard variant="content" padding="sm" className="flex-1 overflow-y-auto sidebar-scrollbar mb-3 space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>
          {messages.map((msg, i) => (
            <ElasticBubble key={i}>
              <ChatBubble msg={msg} langAccent={langAccent} isRTL={isRTL} />
            </ElasticBubble>
          ))}
          {aiLoading && (
            <div className="flex items-end gap-2.5">
              <AIAvatar isSpeaking={false} langAccent={langAccent} isThinking={aiLoading} />
              <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(27,79,138,0.2)', border: '1px solid rgba(27,79,138,0.3)' }}>
                {[0,1,2].map(i => (
                  <span key={i} className="block w-1.5 h-1.5 rounded-full bg-gold/70" style={{ animation: 'bounce-dot 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            </div>
          )}
          {error && <div className="text-center text-xs px-4 py-2.5 rounded-card" style={{ color: '#F87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
          <div ref={chatEndRef} />
        </MasterCard>

        {/* Indicateurs vocaux */}
        {(isListening || isSpeaking) && (
          <div className="flex items-center justify-center gap-6 py-2 mb-1 flex-shrink-0">
            {isListening && <VoiceWaveIndicator label={`Écoute · ${langInfo?.name}`} color="#EF4444" active={isListening} />}
            {isSpeaking && <VoiceWaveIndicator label="L'IA parle..." color={langAccent.color} active={isSpeaking} />}
          </div>
        )}

        {/* Modal langue maternelle */}
        {!loading && user && !nativeLanguage && (
          <NativeLangModal onClose={() => {}} />
        )}

        {/* Paramètres vocaux */}
        {showVoiceSettings && (
          <VoiceSettingsModal onClose={() => setShowVoiceSettings(false)} />
        )}

        {/* Zone de saisie */}
        <MasterCard variant="action" padding="none" className="flex gap-2 items-end p-2 flex-shrink-0">
          <button onClick={handleVoice} className="flex-shrink-0 w-11 h-11 rounded-card flex items-center justify-center transition-all duration-250"
            style={isListening ? { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', color: '#FCA5A5', boxShadow: '0 0 16px rgba(239,68,68,0.3)', animation: 'speak-pulse 1.5s ease-in-out infinite' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8A9AB5' }}>
            <span className="text-lg leading-none">{isListening ? '■' : '⏺'}</span>
          </button>
          <div className="flex-1">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={`Écrivez en ${langInfo?.name || 'votre langue'}… (Entrée pour envoyer)`} rows={1}
              className="w-full text-white text-sm resize-none focus:outline-none"
              style={{ background: 'transparent', border: 'none', color: '#FAFAF8', minHeight: '44px', maxHeight: '120px', padding: '0.65rem 0.5rem', lineHeight: '1.5', caretColor: langAccent.color, fontFamily: 'DM Sans, sans-serif' }} />
          </div>
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || aiLoading}
            className="flex-shrink-0 w-11 h-11 rounded-card flex items-center justify-center text-dark font-bold text-lg transition-all duration-250 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: input.trim() && !aiLoading ? 'linear-gradient(135deg, #E8941A, #F5B942)' : 'rgba(232,148,26,0.2)', boxShadow: input.trim() && !aiLoading ? '0 4px 16px rgba(232,148,26,0.35)' : 'none' }}>
            {aiLoading ? (<span className="w-4 h-4 border-2 border-dark/40 border-t-dark rounded-full" style={{ animation: 'spin-slow 0.8s linear infinite' }} />) : (<span className="text-base">↑</span>)}
          </button>
        </MasterCard>
      </div>
    </AppLayout>
  )
}

function ChatBubble({ msg, langAccent, isRTL }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {!isUser && <AIAvatar isSpeaking={false} langAccent={langAccent} />}
      <div className="max-w-[78%] text-sm leading-relaxed" dir="auto" style={isUser ? {
        background: 'linear-gradient(135deg, rgba(232,148,26,0.18), rgba(232,148,26,0.08))',
        border: '1px solid rgba(232,148,26,0.25)', color: '#FAFAF8',
        borderRadius: '18px 18px 4px 18px', padding: '0.75rem 1rem',
        boxShadow: '0 2px 12px rgba(232,148,26,0.1)',
      } : {
        background: 'linear-gradient(135deg, rgba(27,79,138,0.25), rgba(13,45,82,0.3))',
        border: '1px solid rgba(27,79,138,0.35)', color: '#FAFAF8',
        borderRadius: '18px 18px 18px 4px', padding: '0.75rem 1rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function AIAvatar({ isSpeaking, langAccent, isThinking = false }) {
  return (
    <PulseAvatar isThinking={isThinking || isSpeaking}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 select-none"
        style={{ background: 'linear-gradient(135deg, #E8941A 0%, #1B4F8A 100%)' }}>
        ◎
      </div>
    </PulseAvatar>
  )
}

function VoiceWaveIndicator({ label, color, active = true }) {
  return (
    <div className="flex items-center gap-3">
      <AIVoiceWave active={active} />
      <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color }}>{label}</span>
    </div>
  )
}

function getWelcomeMessage(lang, level, mode) {
  const m = {
    en: {
      free_talk: `Hello! I'm your English Coach. Your current level is ${level}. What would you like to talk about today? 😊`,
      business: `Welcome to Business English! Let's practice professional communication. Ready?`,
      travel: `Hi! Let's practice travel English. Imagine you just arrived at an airport. How can I help?`,
      daily_life: `Hey! Let's practice everyday English. Tell me about your day!`,
      role_play: `Welcome to Role Play! I can be your interviewer, colleague, or customer. What scenario?`,
      level_test: `👋 Welcome to the level test! I'll assess your level through conversation. Just answer naturally. Ready?`,
      exam_prep: `📚 Exam prep mode activated! What exam are you preparing for?`,
    },
    fr: {
      free_talk: `Bonjour ! Je suis votre coach de français. Niveau actuel : ${level}. De quoi voulez-vous parler ? 😊`,
      business: `Bienvenue en français professionnel ! Pratiquons les emails et réunions.`,
      level_test: `👋 Test de niveau activé ! Je vais évaluer votre niveau en français. Prêt(e) ?`,
    },
    es: {
      free_talk: `¡Hola! Soy tu coach de español. Nivel actual: ${level}. ¿De qué quieres hablar? 😊`,
      business: `¡Bienvenido al modo negocios!`,
    },
    de: {
      free_talk: `Hallo! Ich bin Ihr Deutsch-Coach. Ihr Niveau: ${level}. Worüber möchten Sie sprechen? 😊`,
      business: `Willkommen im Geschäftsdeutsch-Modus!`,
    },
    ar: {
      free_talk: `السلام عليكم! أنا مدربك للغة العربية. مستواك الحالي: ${level}. عن ماذا تود أن تتحدث اليوم؟ 😊`,
      business: `مرحباً بك في العربية التجارية! لنتمرن على المراسلات والاجتماعات المهنية.`,
      travel: `مرحباً! لنتمرن على العربية للسفر. تخيل أنك وصلت للتو إلى المطار. كيف يمكنني مساعدتك؟`,
      daily_life: `مرحباً! لنتمرن على العربية في الحياة اليومية. أخبرني عن يومك!`,
      role_play: `مرحباً بك في لعب الأدوار! يمكنني أن أكون محاورك، زميلك، أو عميلك. ما السيناريو الذي تختار؟`,
      islamic: `السلام عليكم ورحمة الله وبركاته! أنا مدربك المتخصص في اللغة العربية والثقافة الإسلامية.
مستواك الحالي: ${level}. سأعلمك العربية بأسلوب ثنائي اللغة يناسب لغتك الأم.
يمكننا دراسة القرآن، الحديث، الفقه، أو مجرد ممارسة المحادثة العربية. ماذا تختار؟ 🕌`,
      level_test: `👋 مرحباً بك في اختبار المستوى! سأقوم بتقييم مستواك في اللغة العربية من خلال محادثة تفاعلية. أجب بشكل طبيعي، لا توجد إجابة صحيحة أو خاطئة. هل أنت مستعد؟`,
      exam_prep: `📚 تم تفعيل وضع التحضير للامتحان! ما الامتحان الذي تستعد له؟`,
    },
  }
  return m[lang]?.[mode] || m[lang]?.free_talk || m.en.free_talk
}
