import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { LANGUAGES, CEFR_LABELS } from '../lib/constants'

export default function Dashboard() {
  const navigate = useNavigate()
  const { loading } = useProfile()
  const linguaUser   = useUserStore(s => s.linguaUser)
  const progress     = useUserStore(s => s.progress)
  const { subscription, isActive, isPremium, languages, daysLeft } = useSubscription()

  // Rediriger si pas d'abonnement actif
  useEffect(() => {
    if (!loading && !isActive) navigate('/subscribe')
  }, [loading, isActive])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-gold font-mono text-sm tracking-widest animate-pulse">CHARGEMENT...</div>
      </div>
    )
  }

  const totalXP = progress.reduce((sum, p) => sum + (p.xp_points || 0), 0)
  const maxStreak = progress.reduce((max, p) => Math.max(max, p.streak_days || 0), 0)

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="section-label">Tableau de bord</p>
          <h1 className="font-serif text-3xl text-white">
            Bonjour, <em className="text-gold">{linguaUser?.full_name?.split(' ')[0] || 'là'}</em> 👋
          </h1>
        </div>
        {isPremium && (
          <span className="font-mono text-[9px] tracking-[0.2em] bg-blue/30 border border-blue/50 text-blue-300 px-3 py-1.5">
            ALL ACCESS
          </span>
        )}
      </div>

      {/* Alerte expiration */}
      {isActive && daysLeft <= 5 && (
        <div className="bg-gold/10 border border-gold/30 rounded px-5 py-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-gold text-sm font-medium">Votre abonnement expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}</p>
            <p className="text-muted text-xs mt-0.5">Renouvelez pour continuer votre progression.</p>
          </div>
          <Link to="/subscribe" className="btn-gold text-xs py-2 px-4">Renouveler</Link>
        </div>
      )}

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'XP Total',      value: totalXP.toLocaleString(), icon: '⚡' },
          { label: 'Meilleure série', value: `${maxStreak}j`,       icon: '🔥' },
          { label: 'Langues actives', value: languages.length,      icon: '🌍' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="font-serif text-2xl text-gold">{s.value}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mes Corners */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-white">Mes Corners</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {languages.map(lang => {
            const l = LANGUAGES[lang]
            const prog = progress.find(p => p.language === lang)
            const level = prog?.current_level || 'A1'
            const xp    = prog?.xp_points || 0
            const streak = prog?.streak_days || 0

            return (
              <div key={lang} className="card p-6 group hover:border-gold/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{l.flag}</span>
                    <div>
                      <h3 className="font-serif text-lg text-white">{l.corner}</h3>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-gold uppercase">{level} — {CEFR_LABELS[level]}</p>
                    </div>
                  </div>
                  {streak > 0 && (
                    <span className="font-mono text-xs text-gold flex items-center gap-1">🔥 {streak}j</span>
                  )}
                </div>

                <div className="h-1.5 bg-dark rounded-full mb-4">
                  <div className="h-1.5 bg-gold rounded-full transition-all"
                       style={{ width: `${Math.min((xp / 5000) * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-muted mb-5">{xp} XP</p>

                <div className="flex gap-2">
                  <Link to={`/corner/${lang}`}
                    className="flex-1 btn-gold text-center text-xs py-2">
                    Entrer dans le Corner
                  </Link>
                  <Link to={`/modules/${lang}`}
                    className="flex-1 btn-outline text-center text-xs py-2">
                    Modules
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Accès rapide */}
      <div>
        <h2 className="font-serif text-xl text-white mb-4">Accès rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/assistant', icon: '🤖', label: 'IA Coach',    sub: 'Speaking & Listening' },
            { to: '/progress',  icon: '📊', label: 'Progression', sub: 'Mes statistiques' },
            { to: '/settings',  icon: '⚙️', label: 'Paramètres', sub: 'Compte & abonnement' },
            { to: '/subscribe', icon: '⬆️', label: isPremium ? 'Mon forfait' : 'Passer Premium', sub: isPremium ? 'ALL ACCESS actif' : 'Débloquer tout' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="card p-5 hover:border-gold/30 transition-all group">
              <div className="text-2xl mb-3">{item.icon}</div>
              <div className="text-sm font-medium text-white group-hover:text-gold transition-colors">{item.label}</div>
              <div className="text-xs text-muted mt-1">{item.sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
