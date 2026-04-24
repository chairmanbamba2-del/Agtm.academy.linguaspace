import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Modal from '../components/ui/Modal'
import MasterCard, { LevelBadge } from '../components/ui/MasterCard'
import { ElasticBubble } from '../components/ui/AIWidgets'
import { useUserStore } from '../store/userStore'
import { generateQuiz } from '../lib/ai'
import { LANGUAGES } from '../lib/constants'
import { useModule, useCompleteModule } from '../hooks/useModules'

export default function Module() {
  const { lang, id } = useParams()
  const navigate      = useNavigate()
  const user          = useUserStore(s => s.user)
  const progress      = useUserStore(s => s.progress)

  const [quiz, setQuiz]         = useState(null)
  const [answers, setAnswers]   = useState({})
  const [showResult, setResult] = useState(false)
  const [phase, setPhase]       = useState('content')
  const [loading, setLoading]   = useState(false)
  const [quizModalOpen, setQuizModalOpen] = useState(false)

  const prog  = progress.find(p => p.language === lang)
  const level = prog?.current_level || 'A1'

  const { data: module, isLoading: moduleLoading } = useModule(id)
  const completeMutation = useCompleteModule()

  async function startQuiz() {
    setQuizModalOpen(true)
    setPhase('quiz')

    if (module.quiz_json && module.quiz_json.questions) {
      setQuiz(module.quiz_json.questions)
      return
    }

    setLoading(true)
    try {
      const data = await generateQuiz({
        transcript: module.transcript || module.description || module.title,
        language: lang,
        level
      })
      setQuiz(data.questions)
    } catch {
      setQuiz(FALLBACK_QUIZ)
    } finally {
      setLoading(false)
    }
  }

  async function submitQuiz() {
    const correct = quiz.filter(q => answers[q.id] === q.correct).length
    const score   = Math.round((correct / quiz.length) * 100)
    setPhase('result')

    const xpGain = score >= 80 ? 100 : score >= 60 ? 70 : 40

    completeMutation.mutate({
      userId: user.id,
      moduleId: module.id,
      score,
      lang,
      xpPoints: (prog?.xp_points || 0) + xpGain,
      modulesCompleted: (prog?.modules_completed || 0) + 1,
    })
  }

  const handleQuizModalClose = () => {
    setQuizModalOpen(false);
    if (phase === 'result') {
      setPhase('content');
      setQuiz(null);
      setAnswers({});
    } else {
      setPhase('content');
    }
  };

  const score = quiz ? quiz.filter(q => answers[q.id] === q.correct).length : 0

  if (moduleLoading || !module) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-gold font-mono text-xs tracking-widest animate-pulse">
          CHARGEMENT DU MODULE...
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-2 text-xs text-muted mb-6">
        <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <Link to={`/modules/${lang}`} className="hover:text-white transition-colors">{LANGUAGES[lang]?.corner}</Link>
        <span>/</span>
        <span className="text-white">{module.title}</span>
      </div>

      <MasterCard variant="corner" padding="lg" className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[9px] tracking-[0.2em] text-gold border border-gold/30 px-2 py-0.5">{module.level}</span>
              <span className="text-xs text-muted capitalize">{module.content_type}</span>
              {module.duration_min && <span className="text-xs text-muted">· {module.duration_min} min</span>}
            </div>
            <h1 className="font-serif text-2xl text-white mb-2">{module.title}</h1>
            <p className="text-muted text-sm">{module.description}</p>
          </div>
          <span className="text-3xl flex-shrink-0">{LANGUAGES[lang]?.flag}</span>
        </div>
      </MasterCard>

      <div>
        {module.content_url && (
          <MasterCard variant="content" padding="none" className="mb-6 aspect-video overflow-hidden">
            <iframe src={module.content_url} className="w-full h-full" allowFullScreen title={module.title} />
          </MasterCard>
        )}

        <MasterCard variant="content" padding="lg" className="mb-8">
           <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:text-white prose-p:text-white/80 prose-li:text-white/80 leading-relaxed">
            {module.content_text || module.description || `Ce module couvre les fondamentaux de la leçon "${module.title}". Travaillez les exercices et pratiquez avec votre coach IA pour consolider vos acquis.`}
          </div>
        </MasterCard>

        <div className="flex gap-3">
          <button onClick={startQuiz} className="btn-gold flex-1 text-center">
            Passer le quiz de validation →
          </button>
          <Link to={`/corner/${lang}`} className="btn-outline flex-1 text-center text-sm">
            Pratiquer avec l'IA
          </Link>
        </div>
      </div>

      <Modal
        open={quizModalOpen}
        onClose={handleQuizModalClose}
        title={phase === 'quiz' ? 'Quiz de validation' : 'Résultat du quiz'}
        size="lg"
      >
        {phase === 'quiz' && (
          <div>
            {loading ? (
              <div className="card p-10 text-center">
                <div className="font-mono text-xs text-gold tracking-widest animate-pulse mb-3">GÉNÉRATION DU QUIZ IA...</div>
              </div>
            ) : quiz ? (
              <div>
                <div className="space-y-6 mb-8">
                  {quiz.map((q, i) => (
                    <MasterCard key={q.id} variant="content" padding="lg" className="mb-0">
                      <p className="text-xs text-muted font-mono mb-2">Question {i + 1} / {quiz.length}</p>
                      <p className="text-white mb-4 leading-snug">{q.question}</p>
                      <div className="space-y-2">
                        {q.options.map(opt => {
                          const isSelected = answers[q.id] === opt[0];
                          const isCorrect = q.correct === opt[0];
                          const showResult = phase === 'result';
                          return (
                            <MasterCard
                              key={opt}
                              variant="action"
                              interactive={!showResult}
                              onClick={() => !showResult && setAnswers(a => ({ ...a, [q.id]: opt[0] }))}
                              className={`w-full text-left transition-all ${isSelected ? 'ring-2 ring-gold' : ''} ${showResult ? (isCorrect ? 'border-green-500 shadow-green' : isSelected ? 'border-red-500 shadow-red' : '') : ''}`}
                            >
                              <div className="px-4 py-3 text-sm">
                                {opt}
                              </div>
                            </MasterCard>
                          );
                        })}
                      </div>
                    </MasterCard>
                  ))}
                </div>

                <MasterCard
                  variant="action"
                  interactive={Object.keys(answers).length === quiz.length}
                  onClick={submitQuiz}
                  className={`w-full text-center ${Object.keys(answers).length === quiz.length ? '' : 'opacity-40 cursor-not-allowed'}`}
                >
                  <div className="px-6 py-4 font-semibold">
                    Valider et voir mon score →
                  </div>
                </MasterCard>
              </div>
            ) : null}
          </div>
        )}

        {phase === 'result' && quiz && (
          <div>
            <ElasticBubble>
              <MasterCard variant="corner" padding="xl" className="text-center mb-8">
                <div className="text-6xl mb-4">
                  {score / quiz.length >= 0.8 ? '🏆' : score / quiz.length >= 0.6 ? '👍' : '💪'}
                </div>
                <div className="font-serif text-5xl text-gold mb-2">{score}/{quiz.length}</div>
                <div className="font-mono text-sm text-white mb-1">
                  {score / quiz.length >= 0.8 ? 'Excellent ! Module validé.' : score / quiz.length >= 0.6 ? 'Bien ! Continuez ainsi.' : 'Revoyez le contenu et réessayez.'}
                </div>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <LevelBadge level={level} lang={lang} size="md" />
                  <span className="text-muted text-xs">+{score >= quiz.length * 0.8 ? 100 : score >= quiz.length * 0.6 ? 70 : 40} XP gagnés</span>
                </div>
              </MasterCard>
            </ElasticBubble>

            <div className="space-y-3 mb-8">
              {quiz.map(q => {
                const ok = answers[q.id] === q.correct
                return (
                  <MasterCard key={q.id} variant="content" padding="md" className={`border ${ok ? 'border-green-500/30 shadow-green' : 'border-red-500/30 shadow-red'}`}>
                    <p className="text-sm text-white mb-1">{q.question}</p>
                     <p className={`text-xs font-mono ${ok ? 'text-green-400' : 'text-red-400'}`}>
                       {ok ? '✓ Correct' : `✗ Réponse correcte : ${q.correct}`}
                     </p>
                     {q.explanation && <p className="text-xs text-muted mt-1">{q.explanation}</p>}
                  </MasterCard>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setPhase('content'); setQuiz(null); setAnswers({}); setQuizModalOpen(false); }}
                className="btn-outline flex-1 text-sm text-center">Revoir le module</button>
              <Link to={`/modules/${lang}`}
                className="btn-gold flex-1 text-sm text-center">Module suivant →</Link>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  )
}

const FALLBACK_QUIZ = [
  { id: '1', question: 'Which greeting is used in the morning?', options: ['A. Good evening', 'B. Good morning', 'C. Good night', 'D. Good afternoon'], correct: 'B', explanation: 'Good morning is used before noon.' },
  { id: '2', question: 'How do you say your name in English?', options: ['A. I have name is...', 'B. My name is...', 'C. Name me is...', 'D. I name...'], correct: 'B', explanation: 'The correct structure is "My name is ___."' },
  { id: '3', question: 'Which response is correct after "Nice to meet you"?', options: ['A. Yes please', 'B. Thank you very much', 'C. Nice to meet you too', 'D. I am fine'], correct: 'C', explanation: 'The standard reply is "Nice to meet you too."' },
]
