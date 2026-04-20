import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { supabase } from '../lib/supabase'
import { LANGUAGES } from '../lib/constants'
import Spinner from '../components/ui/Spinner'

const BLOCKS = [
  { id: 'listening', label: 'Compréhension orale',  icon: '🎧', weight: '35%' },
  { id: 'reading',   label: 'Compréhension écrite', icon: '📖', weight: '30%' },
  { id: 'grammar',   label: 'Grammaire & Vocab',    icon: '✏️', weight: '25%' },
  { id: 'expression',label: 'Expression guidée',    icon: '✍️', weight: '10%' },
]

const DURATION = 45 * 60 // 45 minutes en secondes

export default function LevelTest() {
  const { lang }   = useParams()
  const navigate   = useNavigate()
  const user       = useUserStore(s => s.user)
  const language   = LANGUAGES[lang]

  const [phase, setPhase]       = useState('intro')   // intro | loading | testing | submitting | result
  const [testId, setTestId]     = useState(null)
  const [questions, setQs]      = useState(null)
  const [answers, setAnswers]   = useState({ listening:{}, reading:{}, grammar:{}, expression:[] })
  const [blockIdx, setBlockIdx] = useState(0)
  const [qIdx, setQIdx]         = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState('')

  const timerRef = useRef(null)

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'testing') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const timerColor = timeLeft < 300 ? 'text-red-400' : timeLeft < 600 ? 'text-yellow-400' : 'text-gold'

  // ── Démarrer le test ───────────────────────────────────────
  async function startTest() {
    setPhase('loading')
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-level-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ language: lang, action: 'generate' }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setTestId(data.testId)
      setQs(data.questions)
      setPhase('testing')
    } catch (err) {
      setError(err.message)
      setPhase('intro')
    }
  }

  // ── Soumettre le test ──────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (phase === 'submitting' || phase === 'result') return
    setPhase('submitting')
    clearInterval(timerRef.current)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-level-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ language: lang, action: 'submit', testId, answers }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult(data)
      setPhase('result')
    } catch (err) {
      setError(err.message)
      setPhase('testing')
    }
  }, [phase, testId, answers, lang])

  // ── Générer le certificat ──────────────────────────────────
  async function generateCertificate() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ testId }),
      })
      const cert = await res.json()
      navigate(`/certificate/${cert.id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  // ── Réponse MCQ ────────────────────────────────────────────
  function answerMCQ(blockId, questionId, value) {
    setAnswers(a => ({ ...a, [blockId]: { ...a[blockId], [questionId]: value } }))
  }

  // ── Réponse expression ────────────────────────────────────
  function answerExpression(idx, text) {
    setAnswers(a => {
      const expr = [...(a.expression || [])]
      expr[idx] = { ...expr[idx], text }
      return { ...a, expression: expr }
    })
  }

  if (!language) return <div className="flex items-center justify-center h-screen bg-dark text-red-400">Langue non trouvée</div>

  // ── PHASE : INTRO ─────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <span className="text-6xl block mb-4">{language.flag}</span>
            <div className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase mb-2">Test officiel LINGUA SPACE</div>
            <h1 className="font-serif text-3xl text-white mb-2">Test de niveau — {language.name}</h1>
            <p className="text-muted text-sm">Évaluation officielle CEFR · Durée : 45 minutes</p>
          </div>

          <div className="card p-6 mb-6">
            <h3 className="font-serif text-lg text-white mb-4">Structure du test</h3>
            <div className="space-y-3">
              {BLOCKS.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3 p-3 bg-dark rounded">
                  <span className="text-xl">{b.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{b.label}</div>
                    <div className="text-xs text-muted">{b.id === 'expression' ? '2 questions ouvertes' : '10 questions QCM'}</div>
                  </div>
                  <span className="font-mono text-xs text-gold">{b.weight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gold/8 border border-gold/20 px-4 py-3 rounded text-xs text-muted mb-6 leading-relaxed">
            ⚠️ <strong className="text-white">Important :</strong> Une fois le test commencé, vous avez exactement 45 minutes.
            Le test se soumet automatiquement à la fin du temps. Score minimum requis pour obtenir un certificat : <strong className="text-gold">60%</strong>.
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded mb-4">{error}</div>
          )}

          <div className="flex gap-3">
            <button onClick={() => navigate('/certification')} className="btn-outline flex-1 text-sm text-center py-3 border border-white/20 text-white">
              ← Annuler
            </button>
            <button onClick={startTest} className="flex-1 py-3 text-sm font-semibold bg-gold text-dark hover:bg-gold-lt transition-all rounded-sm">
              Commencer le test →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── PHASE : LOADING ───────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" color="gold" />
        <div className="font-mono text-xs text-gold tracking-widest animate-pulse">GÉNÉRATION DU TEST PAR L'IA...</div>
        <p className="text-muted text-sm text-center max-w-xs">Claude prépare 40 questions adaptées à votre niveau. Cela prend 20-30 secondes.</p>
      </div>
    )
  }

  // ── PHASE : TESTING ───────────────────────────────────────
  if ((phase === 'testing' || phase === 'submitting') && questions) {
    const currentBlock = BLOCKS[blockIdx]
    const currentQs    = questions[currentBlock.id] || []
    const isExpression = currentBlock.id === 'expression'
    const currentQ     = isExpression ? currentQs[qIdx] : currentQs[qIdx]
    const totalBlocks  = BLOCKS.length
    const globalPct    = Math.round(((blockIdx * 10 + qIdx) / (totalBlocks * 10)) * 100)

    function goNext() {
      const blockQs = questions[currentBlock.id] || []
      if (qIdx < blockQs.length - 1) {
        setQIdx(i => i + 1)
      } else if (blockIdx < BLOCKS.length - 1) {
        setBlockIdx(i => i + 1)
        setQIdx(0)
      } else {
        handleSubmit()
      }
    }

    const isLastQuestion = blockIdx === BLOCKS.length - 1 && qIdx === (questions[currentBlock.id]?.length || 1) - 1
    const currentAnswer  = isExpression
      ? answers.expression?.[qIdx]?.text || ''
      : answers[currentBlock.id]?.[currentQ?.id]

    return (
      <div className="min-h-screen bg-dark flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-[#1E3A5F] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{language.flag}</span>
            <div>
              <div className="font-mono text-[9px] text-muted tracking-widest uppercase">Test officiel — {language.name}</div>
              <div className="font-serif text-base text-white">{currentBlock.icon} {currentBlock.label}</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-mono text-xs text-muted">Progression</div>
              <div className="font-mono text-sm text-white">{blockIdx + 1}/{totalBlocks} blocs</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-xs text-muted">Temps restant</div>
              <div className={`font-mono text-xl ${timerColor}`}>{formatTime(timeLeft)}</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-dark">
          <div className="h-1 bg-gold transition-all duration-500" style={{ width: `${globalPct}%` }} />
        </div>

        {/* Blocs steps */}
        <div className="flex gap-1 px-6 py-3 bg-dark border-b border-white/4">
          {BLOCKS.map((b, i) => (
            <div key={b.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono
              ${i < blockIdx ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                i === blockIdx ? 'bg-gold/20 text-gold border border-gold/30' :
                'bg-card text-muted border border-white/5'}`}>
              {i < blockIdx ? '✓' : b.icon} {b.label.split(' ')[0]}
            </div>
          ))}
        </div>

        {/* Contenu du test */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">

          {/* Transcript audio pour le bloc listening */}
          {currentBlock.id === 'listening' && qIdx === 0 && questions.transcript && (
            <div className="card p-4 mb-4 border-l-4 border-gold">
              <div className="font-mono text-[10px] text-gold tracking-widest uppercase mb-2">📻 Transcription audio</div>
              <p className="text-sm text-white/80 leading-relaxed italic">{questions.transcript}</p>
            </div>
          )}

          {/* Texte de lecture pour le bloc reading */}
          {currentBlock.id === 'reading' && qIdx === 0 && questions.reading_passage && (
            <div className="card p-4 mb-4 border-l-4 border-blue">
              <div className="font-mono text-[10px] text-blue-300 tracking-widest uppercase mb-2">📖 Texte à lire</div>
              <p className="text-sm text-white/80 leading-relaxed">{questions.reading_passage}</p>
            </div>
          )}

          {!isExpression && currentQ ? (
            <div className="card p-6">
              <div className="font-mono text-[10px] text-gold tracking-widest uppercase mb-3">
                Question {qIdx + 1} / {currentQs.length} · {currentBlock.label}
              </div>
              <p className="text-base text-white mb-5 leading-snug">{currentQ.question}</p>
              <div className="space-y-2">
                {(currentQ.options || []).map(opt => (
                  <button key={opt}
                    onClick={() => answerMCQ(currentBlock.id, currentQ.id, opt[0])}
                    className={`w-full text-left px-4 py-3 rounded text-sm border transition-all flex items-center gap-3
                      ${currentAnswer === opt[0]
                        ? 'border-gold bg-gold/10 text-white'
                        : 'border-white/8 bg-dark text-white/70 hover:border-gold/30'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all
                      ${currentAnswer === opt[0] ? 'border-gold bg-gold' : 'border-muted/50'}`} />
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : isExpression && currentQ ? (
            <div className="card p-6">
              <div className="font-mono text-[10px] text-gold tracking-widest uppercase mb-3">
                Expression {qIdx + 1} / {currentQs.length} · Réponse libre
              </div>
              <p className="text-base text-white mb-2 leading-snug">{currentQ.instruction}</p>
              <p className="text-xs text-muted mb-4">Minimum {currentQ.min_words || 80} mots</p>
              <textarea
                value={currentAnswer}
                onChange={e => answerExpression(qIdx, e.target.value)}
                placeholder={`Rédigez votre réponse en ${language.name} ici...`}
                rows={8}
                className="w-full bg-dark border border-white/10 text-white px-4 py-3 text-sm rounded resize-none focus:outline-none focus:border-gold/40 placeholder:text-white/20"
              />
              <div className="text-right text-xs text-muted mt-1">
                {(currentAnswer || '').split(/\s+/).filter(Boolean).length} mots
              </div>
            </div>
          ) : null}

          <div className="flex gap-3 mt-4">
            <button onClick={() => { if (qIdx > 0) setQIdx(i => i - 1); else if (blockIdx > 0) { setBlockIdx(i => i - 1); setQIdx((questions[BLOCKS[blockIdx-1].id]?.length || 1) - 1) } }}
              disabled={blockIdx === 0 && qIdx === 0}
              className="btn-outline py-2.5 px-5 text-sm border border-white/20 text-white disabled:opacity-30">
              ← Précédent
            </button>

            {phase === 'submitting' ? (
              <div className="flex-1 flex items-center justify-center gap-2 text-gold font-mono text-sm">
                <Spinner size="sm" /> Évaluation en cours...
              </div>
            ) : (
              <button onClick={goNext}
                disabled={!isExpression && !currentAnswer}
                className="flex-1 py-2.5 font-semibold text-sm bg-gold text-dark hover:bg-gold-lt transition-all rounded-sm disabled:opacity-40">
                {isLastQuestion ? 'Soumettre le test ✓' : 'Question suivante →'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── PHASE : RÉSULTAT ──────────────────────────────────────
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full">
          <div className="text-center mb-8">
            <span className="text-6xl block mb-3">{result.passed ? '🏆' : '💪'}</span>
            <div className="font-serif text-4xl text-gold mb-2">{result.scores.global}%</div>
            <div className="font-mono text-sm text-white tracking-wider">
              {result.passed ? `Niveau ${result.level} obtenu !` : 'Score insuffisant'}
            </div>
            <p className="text-muted text-sm mt-2">{result.message}</p>
          </div>

          {/* Scores par compétence */}
          <div className="card p-6 mb-6">
            <h3 className="font-serif text-lg text-white mb-4">Résultats détaillés</h3>
            {[
              { label: 'Compréhension orale', val: result.scores.listening, w: '35%', color: 'bg-blue' },
              { label: 'Compréhension écrite', val: result.scores.reading,  w: '30%', color: 'bg-blue' },
              { label: 'Grammaire & Vocabulaire', val: result.scores.grammar, w: '25%', color: 'bg-gold' },
              { label: 'Expression guidée',    val: result.scores.writing,  w: '10%', color: 'bg-purple-500' },
            ].map(s => (
              <div key={s.label} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">{s.label} <span className="text-white/30">({s.w})</span></span>
                  <span className={`font-mono font-bold ${s.val >= 60 ? 'text-green-400' : 'text-red-400'}`}>{s.val}%</span>
                </div>
                <div className="h-1.5 bg-dark rounded">
                  <div className={`h-1.5 rounded transition-all ${s.color}`} style={{ width: `${s.val}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {result.passed ? (
              <button onClick={generateCertificate}
                className="flex-1 py-3 font-semibold bg-gold text-dark hover:bg-gold-lt transition-all rounded-sm text-sm">
                🎓 Générer mon certificat →
              </button>
            ) : (
              <button onClick={() => navigate('/certification')}
                className="flex-1 py-3 font-semibold bg-gold text-dark hover:bg-gold-lt transition-all rounded-sm text-sm">
                Retour à mes certifications
              </button>
            )}
            <button onClick={() => navigate('/certification')}
              className="py-3 px-5 text-sm border border-white/20 text-white hover:border-white/40 transition-all rounded-sm">
              Mes certificats
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}
        </div>
      </div>
    )
  }

  return null
}
