import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { LANGUAGES, CEFR_LEVELS, CEFR_LABELS } from '../lib/constants'
import MasterCard, { LevelBadge } from '../components/ui/MasterCard'

export default function Progress() {
  useProfile()
  const progress     = useUserStore(s => s.progress)
  const { languages } = useSubscription()

  const totalXP      = progress.reduce((s, p) => s + (p.xp_points || 0), 0)
  const totalModules = progress.reduce((s, p) => s + (p.modules_completed || 0), 0)
  const maxStreak    = progress.reduce((max, p) => Math.max(max, p.streak_days || 0), 0)

  return (
    <AppLayout>
      <p className="section-label">Mes statistiques</p>
      <h1 className="font-serif text-3xl text-white mb-8">Ma <em className="text-gold">Progression</em></h1>

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { v: totalXP.toLocaleString(), l: 'XP Total',        i: '⚡' },
          { v: totalModules,              l: 'Modules complétés', i: '📚' },
          { v: `${maxStreak}j`,           l: 'Meilleure série',  i: '🔥' },
        ].map(s => (
          <MasterCard key={s.l} variant="content" padding="lg" className="text-center">
            <div className="text-3xl mb-2">{s.i}</div>
            <div className="font-serif text-3xl text-gold">{s.v}</div>
            <div className="text-xs text-muted mt-1">{s.l}</div>
          </MasterCard>
        ))}
      </div>

      {/* Progression par langue */}
      <h2 className="font-serif text-xl text-white mb-4">Progression par langue</h2>
      <div className="space-y-4 mb-10">
        {languages.map(lang => {
          const prog  = progress.find(p => p.language === lang)
          const level = prog?.current_level || 'A1'
          const xp    = prog?.xp_points || 0
          const idx   = CEFR_LEVELS.indexOf(level)
          const pct   = Math.round(((idx + 1) / CEFR_LEVELS.length) * 100)
          const l     = LANGUAGES[lang]

           return (
             <MasterCard key={lang} variant="content" padding="lg">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <span className="text-3xl">{l.flag}</span>
                   <div>
                     <h3 className="font-serif text-lg text-white">{l.corner}</h3>
                     <p className="text-xs text-muted">{prog?.modules_completed || 0} modules complétés</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="font-mono text-xl text-gold">{level}</div>
                   <div className="text-xs text-muted">{CEFR_LABELS[level]}</div>
                 </div>
               </div>

               {/* Barre CEFR */}
               <div className="flex gap-1 mb-3">
                 {CEFR_LEVELS.map((l, i) => (
                   <div key={l} className={`flex-1 h-2 rounded-sm transition-all
                     ${i <= idx ? 'bg-gold' : 'bg-card'}`} />
                 ))}
               </div>
               <div className="flex justify-between text-[9px] font-mono text-muted mb-4">
                 {CEFR_LEVELS.map(l => <span key={l}>{l}</span>)}
               </div>

               <div className="flex items-center justify-between text-xs text-muted">
                 <span>🔥 {prog?.streak_days || 0} jours de série</span>
                 <span>⚡ {xp.toLocaleString()} XP</span>
               </div>
             </MasterCard>
           )
        })}
      </div>

      {/* Badges */}
      <h2 className="font-serif text-xl text-white mb-4">Badges</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '🌟', name: 'Premier pas',  desc: 'Compte créé',          earned: true },
          { icon: '🔥', name: 'En feu !',     desc: '7 jours consécutifs',  earned: maxStreak >= 7 },
          { icon: '📚', name: 'Studieux',     desc: '10 modules complétés', earned: totalModules >= 10 },
          { icon: '🌍', name: 'Polyglotte',   desc: '2 langues actives',    earned: languages.length >= 2 },
          { icon: '⚡', name: '1000 XP',      desc: 'Mille points d\'XP',   earned: totalXP >= 1000 },
          { icon: '🏆', name: 'Niveau B1',    desc: 'Atteindre B1',         earned: progress.some(p => ['B1','B2','C1','C2'].includes(p.current_level)) },
          { icon: '🎯', name: 'Quiz Parfait', desc: '100% à un quiz',       earned: false },
          { icon: '🚀', name: 'ALL ACCESS',   desc: 'Forfait premium',      earned: false },
        ].map(b => (
          <MasterCard key={b.name} variant="content" padding="md" className={`text-center transition-all ${b.earned ? '' : 'opacity-35'}`}>
            <div className="text-3xl mb-2">{b.icon}</div>
            <div className="text-sm font-medium text-white mb-0.5">{b.name}</div>
            <div className="text-xs text-muted">{b.desc}</div>
            {b.earned && <div className="text-[9px] text-gold font-mono mt-1 tracking-widest">OBTENU</div>}
          </MasterCard>
        ))}
      </div>
    </AppLayout>
  )
}
