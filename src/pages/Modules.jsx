// ── MODULES LIST PAGE ───────────────────────────────────────
import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { getModules, supabase } from '../lib/supabase'
import { LANGUAGES, CEFR_LEVELS, CEFR_LABELS } from '../lib/constants'
import MasterCard, { LevelBadge } from '../components/ui/MasterCard'

export default function Modules() {
  const { lang }    = useParams()
  const { loading } = useProfile()
  const user        = useUserStore(s => s.user)
  const progress    = useUserStore(s => s.progress)
  const { can }     = useSubscription()

  const [modules, setModules]       = useState([])
  const [modProgress, setModProg]   = useState([])
  const [selectedLevel, setLevel]   = useState(null)
  const [fetching, setFetching]     = useState(true)

  const language = LANGUAGES[lang]
  const prog     = progress.find(p => p.language === lang)
  const level    = prog?.current_level || 'A1'

  if (!loading && !can(`corner_${lang}`)) return <Navigate to="/subscribe" replace />

  useEffect(() => {
    if (!lang || !user) return
    Promise.all([
      getModules(lang),
      supabase.from('lingua_module_progress')
        .select('*').eq('user_id', user.id)
    ]).then(([mods, { data: mp }]) => {
      setModules(mods.length ? mods : DEMO_MODULES[lang] || [])
      setModProg(mp || [])
    }).finally(() => setFetching(false))
  }, [lang, user])

  if (!language) return <Navigate to="/dashboard" replace />

  const displayed = selectedLevel
    ? modules.filter(m => m.level === selectedLevel)
    : modules

  return (
    <AppLayout>
      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl">{language.flag}</span>
        <div>
          <p className="section-label">{language.corner}</p>
          <h1 className="font-serif text-3xl text-white">100 Modules <em className="text-gold">A1 → C2</em></h1>
          <p className="text-muted text-sm">Votre niveau : <span className="text-gold font-mono">{level}</span></p>
        </div>
      </div>

      {/* Filtre CEFR */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button onClick={() => setLevel(null)}
          className={`px-4 py-2 text-xs font-mono rounded transition-all
            ${!selectedLevel ? 'bg-gold text-dark font-bold' : 'bg-card text-muted hover:text-white border border-white/8'}`}>
          Tous
        </button>
        {CEFR_LEVELS.map(l => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-4 py-2 text-xs font-mono rounded transition-all
              ${selectedLevel === l ? 'bg-gold text-dark font-bold' : 'bg-card text-muted hover:text-white border border-white/8'}`}>
            {l} — {CEFR_LABELS[l]}
          </button>
        ))}
      </div>

      {fetching ? (
        <div className="text-center py-16 text-gold font-mono text-xs tracking-widest animate-pulse">CHARGEMENT...</div>
      ) : (
        <div className="space-y-2">
          {displayed.map(m => {
            const mp        = modProgress.find(p => p.module_id === m.id)
            const isLocked  = CEFR_LEVELS.indexOf(m.level) > CEFR_LEVELS.indexOf(level) + 1
            const completed = mp?.status === 'completed'
            const inProg    = mp?.status === 'in_progress'

            return (
               <MasterCard key={m.id} variant="content" padding="lg" className={`flex items-center gap-4 transition-all
                 ${isLocked ? 'opacity-40' : 'hover:border-gold/30 cursor-pointer'}`}>

                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                   ${completed ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : isLocked  ? 'bg-card text-muted border border-white/10'
                    : 'bg-gold/10 text-gold border border-gold/30'}`}>
                   {completed ? '✓' : isLocked ? '🔒' : m.order_num}
                 </div>

                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-0.5">
                     <span className="font-mono text-[9px] tracking-[0.2em] text-gold">{m.level}</span>
                     <span className="text-white/20 text-xs">·</span>
                     <span className="text-xs text-muted capitalize">{m.content_type || 'Leçon'}</span>
                     {m.duration_min && <span className="text-xs text-muted">{m.duration_min} min</span>}
                   </div>
                   <h3 className="text-sm font-medium text-white truncate">{m.title}</h3>
                   {m.description && <p className="text-xs text-muted mt-0.5 truncate">{m.description}</p>}
                 </div>

                 <div className="flex-shrink-0">
                   {completed && mp?.score != null && (
                     <span className="font-mono text-xs text-green-400">{mp.score}%</span>
                   )}
                   {!isLocked && (
                     <Link to={`/module/${lang}/${m.id}`}
                       className="btn-gold text-xs py-1.5 px-3 ml-3">
                       {completed ? 'Revoir' : inProg ? 'Continuer' : 'Commencer'}
                     </Link>
                   )}
                 </div>
               </MasterCard>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}

// Modules de démo
const DEMO_MODULES = {
  en: [
    { id: 'm1', language: 'en', level: 'A1', order_num: 1,  title: 'Greetings and Introductions', description: 'Learn to say hello, introduce yourself and ask simple questions.', content_type: 'lesson', duration_min: 15 },
    { id: 'm2', language: 'en', level: 'A1', order_num: 2,  title: 'Numbers and Alphabet', description: 'Count from 1 to 100 and spell your name.', content_type: 'exercise', duration_min: 20 },
    { id: 'm3', language: 'en', level: 'A1', order_num: 3,  title: 'Days, Months and Time', description: 'Tell the time and talk about your week.', content_type: 'lesson', duration_min: 25 },
    { id: 'm4', language: 'en', level: 'A2', order_num: 16, title: 'Present Simple vs Continuous', description: 'Understand when to use each tense.', content_type: 'lesson', duration_min: 30 },
    { id: 'm5', language: 'en', level: 'B1', order_num: 34, title: 'Expressing Opinions', description: 'Give your opinion confidently in English.', content_type: 'lesson', duration_min: 35 },
    { id: 'm6', language: 'en', level: 'B2', order_num: 54, title: 'Advanced Conditionals', description: 'Master all types of conditional sentences.', content_type: 'lesson', duration_min: 40 },
    { id: 'm7', language: 'en', level: 'C1', order_num: 74, title: 'Academic Writing Structures', description: 'Write formal essays and reports with precision.', content_type: 'exercise', duration_min: 50 },
    { id: 'm8', language: 'en', level: 'C2', order_num: 90, title: 'Idiomatic and Nuanced English', description: 'Master idioms, register and sophisticated vocabulary.', content_type: 'lesson', duration_min: 45 },
  ],
}
