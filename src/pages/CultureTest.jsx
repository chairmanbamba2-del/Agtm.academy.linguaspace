import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/utils'

const RUBRICS = [
  { id: 'monde_arabe', label: 'Connaissance du monde arabe', icon: '🌍' },
  { id: 'ramadan',     label: 'Ramadan & pratiques',         icon: '☪️' },
  { id: 'art_cuisine', label: 'Art, cuisine & patrimoine',   icon: '🎨' },
  { id: 'histoire_geo',label: 'Histoire & géographie',       icon: '📜' },
  { id: 'famille',     label: 'Famille & société',           icon: '👨‍👩‍👧‍👦' },
]

const DURATION = 30 * 60

export default function CultureTest() {
  const navigate   = useNavigate()
  const user       = useUserStore(s => s.user)
  const nativeLang = useUserStore(s => s.nativeLanguage)

  const [phase, setPhase]     = useState('intro')
  const [questions, setQs]    = useState(null)
  const [answers, setAnswers] = useState({})
  const [rubricIdx, setRubricIdx] = useState(0)
  const [qIdx, setQIdx]        = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [result, setResult]    = useState(null)
  const [error, setError]      = useState('')
  const [loading, setLoading]  = useState(false)

  const timerRef = useRef(null)
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

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

  async function startTest() {
    setPhase('loading')
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/lingua-ai-enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          sessionType: 'islamic',
          nativeLanguage: nativeLang || 'fr',
          messages: [{
            role: 'user',
            content: `Génère un test de culture arabe pour un apprenant africain (langue maternelle: ${nativeLang || 'français'}). 
Le test doit couvrir 5 rubriques avec ${nativeLang === 'ar' ? '2' : '3'} questions chacune :
1. Connaissance du monde arabe (géographie, pays, capitales, drapeaux)
2. Ramadan & pratiques religieuses
3. Art, cuisine & patrimoine
4. Histoire & géographie
5. Famille & société

Chaque question doit être au format QCM (4 choix, 1 seule bonne réponse).
Les questions doivent être en ${nativeLang || 'français'} mais le contenu porte sur la culture arabe.

Réponds UNIQUEMENT au format JSON valide, rien d'autre:
{
  "questions": [
    {
      "rubric": "monde_arabe|ramadan|art_cuisine|histoire_geo|famille",
      "question": "texte de la question",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "explication courte"
    }
  ]
}`
          }]
        })
      })
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || data.content || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Réponse IA invalide')
      const parsed = JSON.parse(jsonMatch[0])
      if (!parsed.questions?.length) throw new Error('Aucune question générée')
      setQs(parsed.questions)
      setPhase('testing')
    } catch (err) {
      setError(err.message)
      setPhase('intro')
    }
  }

  const handleSubmit = useCallback(async () => {
    if (phase === 'submitting' || phase === 'result') return
    setPhase('submitting')
    clearInterval(timerRef.current)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const evalRes = await fetch(`${SUPABASE_URL}/functions/v1/lingua-ai-enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          sessionType: 'research',
          nativeLanguage: nativeLang || 'fr',
          messages: [{
            role: 'user',
            content: `Évalue ce test de culture arabe. Voici les questions et les réponses de l'étudiant.

Questions:
${JSON.stringify(questions, null, 2)}

Réponses de l'étudiant (index de la réponse choisie par question):
${JSON.stringify(answers, null, 2)}

Calcule un score par rubrique (0-100) et un score global (0-100).
Détermine un niveau: si score >= 90 → 'C2', >= 75 → 'C1', >= 60 → 'B2', >= 45 → 'B1', >= 25 → 'A2', sinon → 'A1'.
L'étudiant a réussi si score >= 60.

Réponds UNIQUEMENT au format JSON valide:
{
  "rubric_scores": {
    "monde_arabe": nombre,
    "ramadan": nombre,
    "art_cuisine": nombre,
    "histoire_geo": nombre,
    "famille": nombre
  },
  "score_global": nombre,
  "level_obtained": "A1|A2|B1|B2|C1|C2",
  "passed": true|false,
  "feedback": "message personnalisé pour l'étudiant",
  "details": "par question commentée"
}`
          }]
        })
      })
      const evalData = await evalRes.json()
      const evalText = evalData.choices?.[0]?.message?.content || evalData.content || ''
      const evalJson = evalText.match(/\{[\s\S]*\}/)
      if (!evalJson) throw new Error('Évaluation invalide')
      const evaluation = JSON.parse(evalJson[0])
      setResult(evaluation)

      const now = new Date()

      const { data: testRecord, error: testErr } = await supabase
        .from('lingua_level_tests')
        .insert({
          user_id: user.id,
          language: 'ar',
          category: 'culture_arabe',
          status: 'completed',
          passed: evaluation.passed,
          level_obtained: evaluation.level_obtained,
          score_global: evaluation.score_global,
          score_comprehension_orale: 0,
          score_comprehension_ecrite: evaluation.score_global,
          score_grammaire_vocabulaire: 0,
          score_expression: 0,
          questions_data: questions,
          answers_data: answers,
          ai_evaluation: evaluation,
          duration_seconds: DURATION - timeLeft,
          started_at: new Date(Date.now() - (DURATION - timeLeft) * 1000).toISOString(),
          completed_at: now.toISOString(),
        })
        .select()
        .single()

      if (testErr) throw testErr

      if (evaluation.passed) {
        const verifyCode = Math.random().toString(36).substring(2, 10).toUpperCase()
        const certNumber = `CULTURE-AR-${now.getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`

        const { data: cert, error: certErr } = await supabase
          .from('lingua_certificates')
          .insert({
            certificate_number: certNumber,
            user_id: user.id,
            test_id: testRecord.id,
            language: 'ar',
            category: 'culture_arabe',
            native_language: nativeLang || null,
            recipient_name: user?.user_metadata?.full_name || user?.email || 'Apprenant',
            level_certified: evaluation.level_obtained,
            score_global: evaluation.score_global,
            rubric_scores: evaluation.rubric_scores,
            is_valid: true,
            verification_code: verifyCode,
            valid_until: new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            issued_at: now.toISOString(),
          })
          .select()
          .single()

        if (certErr) throw certErr
        navigate(`/certificate/${cert.id}`)
      } else {
        setPhase('result')
      }
    } catch (err) {
      setError(err.message)
      setPhase('testing')
    }
  }, [phase, questions, answers, user, nativeLang, timeLeft])

  function answerQuestion(qIndex, value) {
    setAnswers(a => ({ ...a, [qIndex]: value }))
  }

  if (!user) return null

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted mb-6">
          <button onClick={() => navigate('/certification')} className="hover:text-white">Certifications</button>
          <span>/</span>
          <span className="text-white">Test Culture Arabe</span>
        </div>

        {error && (
          <div className="card p-5 mb-6 border-red/30 bg-red/5 text-red">
            {error}
          </div>
        )}

        {phase === 'intro' && (
          <div className="card p-8 text-center">
            <div className="text-6xl mb-4">🕌</div>
            <h1 className="font-serif text-3xl text-white mb-2">Test de Culture Arabe</h1>
            <p className="text-muted text-sm mb-6 max-w-lg mx-auto leading-relaxed">
              Évaluez vos connaissances sur le monde arabe : pays, traditions, Ramadan, art culinaire,
              histoire, géographie, famille et société. Les questions sont adaptées à votre langue maternelle.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {RUBRICS.map(r => (
                <div key={r.id} className="bg-white/5 p-4 rounded-sm text-center">
                  <div className="text-2xl mb-1">{r.icon}</div>
                  <div className="text-xs text-white/70">{r.label}</div>
                </div>
              ))}
            </div>

            <div className="text-sm text-muted mb-6 leading-relaxed">
              <strong className="text-white">15 questions</strong> à choix multiples · 
              Durée : <strong className="text-white">30 minutes</strong> · 
              Score minimum : <strong className="text-gold">60%</strong>
            </div>

            <button onClick={startTest} className="btn bg-gold text-dark font-semibold px-10 py-3">
              🎯 Commencer le test
            </button>
          </div>
        )}

        {phase === 'loading' && (
          <div className="card p-12 text-center">
            <div className="animate-spin text-4xl mb-4">🕌</div>
            <div className="font-mono text-xs text-gold tracking-widest animate-pulse">GÉNÉRATION DU TEST...</div>
          </div>
        )}

        {phase === 'testing' && questions && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-xs text-gold tracking-widest uppercase">
                Rubrique {rubricIdx + 1} / {RUBRICS.length}
              </div>
              <div className={`font-mono text-sm ${timerColor} font-bold`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {questions.map((q, qi) => {
              const qRubricIdx = RUBRICS.findIndex(r => r.id === q.rubric)
              if (qRubricIdx !== rubricIdx) return null
              return (
                <div key={qi} className="card p-5 mb-4">
                  <div className="text-xs text-gold mb-2 flex items-center gap-2">
                    <span>{RUBRICS[qRubricIdx]?.icon}</span>
                    <span className="font-mono tracking-wider">{RUBRICS[qRubricIdx]?.label}</span>
                  </div>
                  <p className="text-white text-sm mb-4 leading-relaxed">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => answerQuestion(qi, oi)}
                        className={`w-full text-left p-3 rounded-sm text-sm transition-all ${
                          answers[qi] === oi
                            ? 'bg-gold/20 border border-gold/50 text-white'
                            : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/30'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => { setRubricIdx(i => Math.max(0, i - 1)); setQIdx(0) }}
                disabled={rubricIdx === 0}
                className="px-5 py-2 bg-white/5 text-muted hover:bg-white/10 rounded-sm disabled:opacity-30 text-sm"
              >
                ← Rubrique précédente
              </button>
              {rubricIdx < RUBRICS.length - 1 ? (
                <button
                  onClick={() => setRubricIdx(i => i + 1)}
                  className="px-5 py-2 bg-white/10 text-white hover:bg-white/20 rounded-sm text-sm"
                >
                  Rubrique suivante →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={phase === 'submitting'}
                  className="px-8 py-2 bg-gold text-dark font-semibold rounded-sm text-sm disabled:opacity-50"
                >
                  {phase === 'submitting' ? 'Évaluation...' : 'Soumettre le test'}
                </button>
              )}
            </div>

            <div className="flex justify-center gap-1 mt-4">
              {RUBRICS.map((r, i) => (
                <div key={r.id} className={`w-3 h-3 rounded-full ${i === rubricIdx ? 'bg-gold' : i < rubricIdx ? 'bg-green-500' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
        )}

        {phase === 'submitting' && (
          <div className="card p-12 text-center">
            <div className="animate-spin text-4xl mb-4">📝</div>
            <div className="font-mono text-xs text-gold tracking-widest animate-pulse">ÉVALUATION EN COURS...</div>
          </div>
        )}

        {phase === 'result' && result && !result.passed && (
          <div className="card p-8 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="font-serif text-2xl text-white mb-2">Test non réussi</h2>
            <p className="text-muted mb-2">Score : <strong className="text-gold text-xl">{result.score_global}%</strong></p>
            <p className="text-muted text-sm mb-1">Niveau atteint : <strong className="text-white">{result.level_obtained}</strong></p>
            <p className="text-muted text-sm mb-6">{result.feedback}</p>
            <p className="text-xs text-muted mb-6">Score minimum requis : 60%. Vous pouvez repasser le test.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setPhase('intro'); setResult(null); setAnswers({}) }} className="btn bg-gold text-dark font-semibold px-8">
                🔄 Repasser le test
              </button>
              <button onClick={() => navigate('/certification')} className="btn bg-white/5 text-muted hover:bg-white/10 px-6">
                Mes certificats
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
