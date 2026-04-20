import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useSubscription } from '../hooks/useSubscription'
import { generateLevelTest } from '../lib/ai'
import { updateProgress } from '../lib/supabase'
import { LANGUAGES, CEFR_LEVELS, CEFR_LABELS } from '../lib/constants'

// Calcule le niveau CEFR depuis le score (0-100)
function scoreToLevel(score) {
  if (score >= 90) return 'C2'
  if (score >= 75) return 'C1'
  if (score >= 60) return 'B2'
  if (score >= 45) return 'B1'
  if (score >= 25) return 'A2'
  return 'A1'
}

export default function Onboarding() {
  const navigate = useNavigate()
  const user = useUserStore(s => s.user)
  const { languages } = useSubscription()

  const [phase, setPhase]       = useState('welcome') // welcome | testing | result
  const [currentLang, setLang]  = useState(null)
  const [quiz, setQuiz]         = useState(null)
  const [answers, setAnswers]   = useState({})
  const [results, setResults]   = useState({})
  const [loading, setLoading]   = useState(false)
  const [qIndex, setQIndex]     = useState(0)

  async function startTest(lang) {
    setLang(lang)
    setLoading(true)
    try {
      const data = await generateLevelTest(lang)
      setQuiz(data.questions)
      setQIndex(0)
      setAnswers({})
      setPhase('testing')
    } catch {
      setQuiz(getFallbackQuiz(lang))
      setPhase('testing')
    } finally {
      setLoading(false)
    }
  }

  function answer(qId, choice) {
    setAnswers(a => ({ ...a, [qId]: choice }))
  }

  async function submitTest() {
    const correct = quiz.filter(q => answers[q.id] === q.correct).length
    const score   = Math.round((correct / quiz.length) * 100)
    const level   = scoreToLevel(score)

    // Sauvegarder dans Supabase
    await updateProgress(user.id, currentLang, { current_level: level, last_activity_at: new Date().toISOString() })
    setResults(r => ({ ...r, [currentLang]: { score, level } }))

    const remaining = languages.filter(l => !results[l] && l !== currentLang)
    if (remaining.length > 0) {
      setPhase('welcome')
    } else {
      setPhase('result')
    }
  }

  if (phase === 'welcome') {
    const tested   = Object.keys(results)
    const untested = languages.filter(l => !tested.includes(l))

    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-5xl mb-6">🎯</div>
          <p className="section-label justify-center flex">Test de niveau</p>
          <h1 className="font-serif text-3xl text-white mb-4">
            {tested.length === 0
              ? 'Évaluons votre niveau'
              : 'Continuez votre évaluation'}
          </h1>
          <p className="text-muted text-sm mb-10 leading-relaxed">
            10 questions rapides par langue pour vous placer au bon niveau dès le départ.
          </p>

          {tested.length > 0 && (
            <div className="card p-4 mb-6 text-left">
              <p className="text-xs text-muted mb-2 font-mono tracking-widest uppercase">Niveaux détectés</p>
              {tested.map(l => (
                <div key={l} className="flex items-center justify-between py-1">
                  <span className="text-sm text-white">{LANGUAGES[l].flag} {LANGUAGES[l].name}</span>
                  <span className="font-mono text-gold text-sm">{results[l].level} — {CEFR_LABELS[results[l].level]}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            {untested.map(lang => (
              <button key={lang} onClick={() => startTest(lang)} disabled={loading}
                className="card p-5 text-center hover:border-gold/40 transition-all disabled:opacity-50">
                <div className="text-3xl mb-2">{LANGUAGES[lang].flag}</div>
                <div className="text-sm font-medium text-white">{LANGUAGES[lang].name}</div>
                <div className="text-xs text-muted mt-1">Tester mon niveau</div>
              </button>
            ))}
          </div>

          {tested.length > 0 && (
            <button onClick={() => navigate('/dashboard')}
              className="btn-outline w-full text-center text-sm">
              Ignorer et aller au dashboard →
            </button>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'testing' && quiz) {
    const q = quiz[qIndex]
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">{LANGUAGES[currentLang].flag}</span>
              <span className="font-mono text-xs text-muted tracking-widest uppercase">{LANGUAGES[currentLang].name}</span>
            </div>
            <span className="font-mono text-xs text-muted">{qIndex + 1} / {quiz.length}</span>
          </div>
          <div className="h-1 bg-card rounded-full mb-8">
            <div className="h-1 bg-gold rounded-full transition-all" style={{ width: `${((qIndex + 1) / quiz.length) * 100}%` }} />
          </div>

          <h2 className="font-serif text-xl text-white mb-6 leading-snug">{q.question}</h2>

          <div className="space-y-3 mb-8">
            {q.options.map(opt => (
              <button key={opt} onClick={() => answer(q.id, opt[0])}
                className={`w-full text-left px-5 py-4 rounded text-sm transition-all border
                  ${answers[q.id] === opt[0]
                    ? 'border-gold bg-gold/10 text-white'
                    : 'border-white/10 bg-card text-white/80 hover:border-gold/30'}`}>
                {opt}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {qIndex < quiz.length - 1 ? (
              <button onClick={() => setQIndex(i => i + 1)} disabled={!answers[q.id]}
                className="btn-gold flex-1 text-center disabled:opacity-40 disabled:cursor-not-allowed">
                Question suivante →
              </button>
            ) : (
              <button onClick={submitTest} disabled={!answers[q.id]}
                className="btn-gold flex-1 text-center disabled:opacity-40 disabled:cursor-not-allowed">
                Voir mon niveau →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const firstLang = Object.keys(results)[0] || languages[0]
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-5xl mb-6">🏆</div>
          <h1 className="font-serif text-3xl text-white mb-2">Votre profil linguistique</h1>
          <p className="text-muted text-sm mb-8">Vous êtes placé au bon niveau dans chaque langue.</p>

          <div className="space-y-3 mb-10">
            {Object.entries(results).map(([lang, { level }]) => (
              <div key={lang} className="card p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{LANGUAGES[lang].flag}</span>
                  <span className="text-white font-medium">{LANGUAGES[lang].name}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl text-gold">{level}</div>
                  <div className="text-xs text-muted">{CEFR_LABELS[level]}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => navigate(`/placement/${firstLang}`)} className="btn-gold w-full text-center">
            Passer le test de placement complet →
          </button>
          <button onClick={() => navigate('/dashboard')} className="w-full py-2 mt-2 text-muted text-sm hover:text-white">
            Aller directement au dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-gold font-mono text-sm tracking-widest animate-pulse">CHARGEMENT DU TEST...</div>
    </div>
  )
}

// Quiz de secours si l'API échoue
function getFallbackQuiz(lang) {
  const questions = {
    en: [
      { id: 1, question: 'Choose the correct sentence:', options: ['A. She go to school.', 'B. She goes to school.', 'C. She going to school.', 'D. She gone to school.'], correct: 'B', explanation: 'Third person singular uses "goes".' },
      { id: 2, question: 'What is the past tense of "go"?', options: ['A. goed', 'B. gone', 'C. went', 'D. go'], correct: 'C', explanation: '"Went" is the irregular past tense of "go".' },
    ],
    fr: [
      { id: 1, question: 'Choisissez la bonne réponse :', options: ['A. Je suis allé hier.', 'B. Je suis aller hier.', 'C. J\'ai allé hier.', 'D. Je vais allé hier.'], correct: 'A', explanation: '"Aller" se conjugue avec "être" au passé composé.' },
    ],
    es: [
      { id: 1, question: 'Elige la respuesta correcta:', options: ['A. Yo habla español.', 'B. Yo hablas español.', 'C. Yo hablo español.', 'D. Yo hablan español.'], correct: 'C', explanation: 'Primera persona singular: hablo.' },
    ],
    de: [
      { id: 1, question: 'Wähle die richtige Antwort:', options: ['A. Ich bin müde.', 'B. Ich bist müde.', 'C. Ich sind müde.', 'D. Ich hat müde.'], correct: 'A', explanation: '"Sein" konjugiert: ich bin.' },
    ],
  }
  return (questions[lang] || questions.en).map(q => ({ ...q, id: String(q.id) }))
}
