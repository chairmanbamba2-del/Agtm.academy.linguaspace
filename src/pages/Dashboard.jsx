import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { LANGUAGES, CEFR_LABELS } from '../lib/constants'
import MasterCard, { XPBar, LevelBadge, StreakBadge } from '../components/ui/MasterCard'

export default function Dashboard() {
  const navigate = useNavigate()
  const { loading } = useProfile()
  const user         = useUserStore(s => s.user)
  const linguaUser   = useUserStore(s => s.linguaUser)
  const progress     = useUserStore(s => s.progress)
  const isAdmin      = useUserStore(s => s.isAdmin)
  const { subscription, isActive, isPremium, languages, daysLeft } = useSubscription()

  // Rediriger si pas d'abonnement actif (sauf admin)
  useEffect(() => {
    if (!loading && !isActive && !isAdmin) navigate('/subscribe')
  }, [loading, isActive, isAdmin])

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
          <p className="section-label">Mon espace</p>
          <h1 className="font-serif text-3xl text-white">
            Bon retour <em className="text-gold italic">{user?.email?.split('@')[0] || 'sur Lingua Space'}</em>
          </h1>
        </div>
        {isPremium && (
          // MAP: Badge ALL ACCESS → style glassmorphism (identique à Sidebar)
          <div
            className="mx-2 px-3 py-2 rounded-sm text-center"
            style={{
              background:  'linear-gradient(135deg, rgba(27,79,138,0.3), rgba(13,45,82,0.2))',
              border:      '1px solid rgba(93,165,229,0.2)',
            }}
          >
            <p className="font-mono text-[7px] tracking-[0.2em] text-blue-300/70 uppercase mb-0.5">Forfait actif</p>
            <p className="font-mono text-[10px] tracking-widest text-blue-200 font-bold">ALL ACCESS</p>
          </div>
        )}
      </div>

      {/* Alerte expiration */}
      {isActive && daysLeft <= 5 && (
        // MAP: Alerte → MasterCard avec glow gold
        <MasterCard variant="corner" glow className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold text-sm font-medium">Votre abonnement expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}</p>
              <p className="text-muted text-xs mt-0.5">Renouvelez pour continuer votre progression.</p>
            </div>
            <Link to="/subscribe" className="btn-gold text-xs py-2 px-4">Renouveler</Link>
          </div>
        </MasterCard>
      )}

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {/* MAP: XP Total → MasterCard stat avec barre XP */}
        <MasterCard variant="stat" padding="md" xp={totalXP}>
          <div className="text-2xl mb-2">⚡</div>
          <div className="font-serif text-2xl text-gold">{totalXP.toLocaleString()}</div>
          <div className="text-xs text-muted mt-1">XP Total</div>
        </MasterCard>

        {/* MAP: Meilleure série → MasterCard stat avec StreakBadge */}
        <MasterCard variant="stat" padding="md" streak={maxStreak}>
          <div className="text-2xl mb-2">🔥</div>
          <div className="font-serif text-2xl text-gold">{maxStreak}j</div>
          <div className="text-xs text-muted mt-1">Meilleure série</div>
          {/* StreakBadge s'affiche automatiquement via la prop streak */}
        </MasterCard>

        {/* MAP: Langues actives → MasterCard stat simple */}
        <MasterCard variant="stat" padding="md">
          <div className="text-2xl mb-2">🌍</div>
          <div className="font-serif text-2xl text-gold">{languages.length}</div>
          <div className="text-xs text-muted mt-1">Langues actives</div>
        </MasterCard>
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
              // MAP: Carte langue → MasterCard corner avec couleur langue
              <MasterCard
                key={lang}
                variant="corner"
                lang={lang}
                glow
                interactive
                xp={xp}
                xpMax={5000}
                streak={streak}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{l.flag}</span>
                    <div>
                      <h3 className="font-serif text-lg text-white">{l.corner}</h3>
                      {/* MAP: Niveau CEFR → LevelBadge */}
                      <LevelBadge level={level} lang={lang} size="sm" />
                    </div>
                  </div>
                  {/* MAP: Streak → StreakBadge (s'affiche automatiquement via prop streak) */}
                </div>

                {/* MAP: Barre XP → XPBar (s'affiche automatiquement via props xp/xpMax) */}
                <p className="text-xs text-muted mb-5">{xp} XP</p>

                <div className="flex gap-2">
                  <Link to={`/corner/${lang}`}
                    className="flex-1 btn-gold text-center text-xs py-2">
                    Corner
                  </Link>
                  <Link to={`/lab/${lang}`}
                    className="flex-1 text-center text-xs py-2 border border-white/10 text-muted hover:text-white hover:border-gold/30 rounded-sm transition-all">
                    🧪 Lab
                  </Link>
                  <Link to={`/modules/${lang}`}
                    className="flex-1 btn-outline text-center text-xs py-2">
                    Modules
                  </Link>
                </div>
              </MasterCard>
            )
          })}
        </div>
      </div>

      {/* Accès rapide */}
      <div>
        <h2 className="font-serif text-xl text-white mb-4">Accès rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/assistant', icon: '🤖', label: 'IA Coach',    sub: 'Speaking, Listening & Lab' },
            { to: '/progress',  icon: '📊', label: 'Progression', sub: 'Mes statistiques' },
            { to: '/settings',  icon: '⚙️', label: 'Paramètres', sub: 'Compte & abonnement' },
            { to: '/subscribe', icon: '⬆️', label: isPremium ? 'Mon forfait' : 'Passer Premium', sub: isPremium ? 'ALL ACCESS actif' : 'Débloquer tout' },
          ].map(item => (
            // MAP: Carte accès rapide → MasterCard action
            <Link key={item.to} to={item.to}>
              <MasterCard variant="action" padding="sm" interactive>
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="text-sm font-medium text-white group-hover:text-gold transition-colors">{item.label}</div>
                <div className="text-xs text-muted mt-1">{item.sub}</div>
              </MasterCard>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
