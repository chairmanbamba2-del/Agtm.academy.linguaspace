import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useModules, useModuleProgress } from '../hooks/useModules'
import { LANGUAGES, CEFR_LEVELS, CEFR_LABELS } from '../lib/constants'
import MasterCard, { LevelBadge } from '../components/ui/MasterCard'

export default function Modules() {
  const { lang }    = useParams()
  const { loading } = useProfile()
  const user        = useUserStore(s => s.user)
  const progress    = useUserStore(s => s.progress)
  const { can }     = useSubscription()

  const [selectedLevel, setLevel] = useState(null)

  const language = LANGUAGES[lang]
  const prog     = progress.find(p => p.language === lang)
  const level    = prog?.current_level || 'A1'

  const { data: modules = [], isLoading: fetching } = useModules(lang)
  const { data: modProgress = [] } = useModuleProgress(user?.id)

  if (!loading && !can(`corner_${lang}`)) return <Navigate to="/subscribe" replace />

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
