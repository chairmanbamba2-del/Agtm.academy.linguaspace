import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { supabase } from '../lib/supabase'
import { LANGUAGES } from '../lib/constants'
import Spinner from '../components/ui/Spinner'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export default function PlacementTest() {
  const { lang }   = useParams()
  const navigate   = useNavigate()
  const user       = useUserStore(s => s.user)
  const language   = LANGUAGES[lang]

  const [phase, setPhase]     = useState('intro')
  const [testId, setTestId]   = useState(null)
  const [questions, setQs]    = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function getHeader() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    }
  }

  async function startTest() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/placement-test`, {
        method: 'POST',
        headers: await getHeader(),
        body: JSON.stringify({ action: 'generate', language: lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTestId(data.testId)
      setQs(data.questions)
      setPhase('testing')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitTest() {
    setLoading(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/placement-test`, {
        method: 'POST',
        headers: await getHeader(),
        body: JSON.stringify({ action: 'submit', language: lang, testId, answers }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setPhase('result')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const q = questions[current]
  const progress = questions.length ? Math.round((current / questions.length) * 100) : 0

  if (phase === 'intro') return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">{language?.flag}</div>
        <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-2">
          Test de placement gratuit
        </div>
        <h1 className="font-serif text-3xl text-white mb-3">
          Quel est votre niveau <em className="text-gold italic">en {language?.name}</em> ?
        </h1>
        <p className="text-muted text-sm mb-6 leading-relaxed">
          20 questions · 10 minutes · Résultat immédiat<br/>
          Votre niveau de départ sera configuré automatiquement.
        </p>
        <div className="card p-4 mb-6 text-left space-y-2">
          {['Aucune inscription supplémentaire', 'Questions adaptatives A1→C2', 'Résultat détaillé avec recommandations', 'Accès direct aux modules de votre niveau'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-muted">
              <span className="text-green-400">✓</span> {f}
            </div>
          ))}
        </div>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button onClick={startTest} disabled={loading}
          className="w-full py-3 bg-gold text-dark font-semibold rounded-sm hover:bg-gold-lt transition-all disabled:opacity-50">
          {loading ? 'Génération du test...' : 'Commencer le test →'}
        </button>
        <button onClick={() => navigate(-1)} className="w-full py-2 mt-2 text-muted text-sm hover:text-white">
          Revenir en arrière
        </button>
      </div>
    </div>
  )

  if (phase === 'testing' && q) return (
    <div className="min-h-screen bg-dark px-4 py-6">
      {/* Progress */}
      <div className="max-w-xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-muted">Question {current + 1}/{questions.length}</span>
          <span className="font-mono text-xs text-gold">{progress}%</span>
        </div>
        <div className="h-1.5 bg-card rounded">
          <div className="h-1.5 bg-gold rounded transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-xl mx-auto">
        <div className="card p-6 mb-4">
          <div className="font-mono text-[9px] text-gold uppercase tracking-widest mb-3">
            {language?.name} · Niveau {q.level}
          </div>
          <p className="text-base text-white mb-5 leading-snug">{q.question}</p>
          <div className="space-y-2">
            {(q.options || []).map((opt) => (
              <button key={opt}
                onClick={() => setAnswers(a => ({ ...a, [q.id]: opt[0] }))}
                className={`w-full text-left px-4 py-3 rounded text-sm border transition-all flex items-center gap-3
                  ${answers[q.id] === opt[0]
                    ? 'border-gold bg-gold/10 text-white'
                    : 'border-white/8 bg-dark text-white/70 hover:border-gold/30'}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all
                  ${answers[q.id] === opt[0] ? 'border-gold bg-gold' : 'border-muted/50'}`} />
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)}
            className="px-5 py-2.5 border border-white/20 text-white text-sm rounded-sm disabled:opacity-30">
            ← Précédent
          </button>
          {current < questions.length - 1 ? (
            <button disabled={!answers[q.id]} onClick={() => setCurrent(c => c + 1)}
              className="flex-1 py-2.5 bg-gold text-dark font-semibold text-sm rounded-sm disabled:opacity-40 hover:bg-gold-lt">
              Question suivante →
            </button>
          ) : (
            <button disabled={!answers[q.id] || loading} onClick={submitTest}
              className="flex-1 py-2.5 bg-green-500 text-dark font-semibold text-sm rounded-sm disabled:opacity-40 hover:bg-green-400">
              {loading ? 'Évaluation...' : 'Terminer le test ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (phase === 'result' && result) return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{language?.flag}</div>
          <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-2">
            Résultat du test de placement
          </div>
          <h2 className="font-serif text-4xl text-gold font-bold">{result.level}</h2>
          <p className="text-muted text-sm mt-1">
            {result.score}% · Votre niveau de départ en {language?.name}
          </p>
        </div>

        <div className="card p-5 mb-4">
          <p className="text-sm text-white/80 leading-relaxed mb-4">{result.recommendation}</p>

          {result.strengths?.length > 0 && (
            <div className="mb-3">
              <div className="font-mono text-[9px] text-green-400 uppercase tracking-wider mb-1">Points forts</div>
              <div className="flex flex-wrap gap-1">
                {result.strengths.map((s) => (
                  <span key={s} className="font-mono text-[9px] px-2 py-0.5 bg-green-900/30 border border-green-500/30 text-green-400 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.weaknesses?.length > 0 && (
            <div>
              <div className="font-mono text-[9px] text-yellow-400 uppercase tracking-wider mb-1">À améliorer</div>
              <div className="flex flex-wrap gap-1">
                {result.weaknesses.map((w) => (
                  <span key={w} className="font-mono text-[9px] px-2 py-0.5 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate(`/modules/${lang}`)}
            className="flex-1 py-3 bg-gold text-dark font-semibold text-sm rounded-sm hover:bg-gold-lt transition-all">
            Voir mes modules {result.level} →
          </button>
          <button onClick={() => navigate(`/corner/${lang}`)}
            className="flex-1 py-3 border border-white/20 text-white text-sm rounded-sm hover:border-gold/40">
            Aller au Corner
          </button>
        </div>
      </div>
    </div>
  )

  return <div className="flex items-center justify-center h-screen bg-dark"><Spinner /></div>
}