// ============================================================
// Sidebar.jsx — VERSION MISE À JOUR v2
// Ajout des sections Certification et Finance
// ============================================================
import { Link, useLocation } from 'react-router-dom'
import { useSubscription } from '../../hooks/useSubscription'
import { LANGUAGES } from '../../lib/constants'
import { useSignOut } from '../../hooks/useAuth'

const NAV_SECTIONS = [
  {
    label: 'Apprentissage',
    items: [
      { path: '/dashboard', icon: '🏠', label: 'Accueil' },
      { path: '/assistant',  icon: '🤖', label: 'IA Coach' },
      { path: '/progress',   icon: '📊', label: 'Progression' },
      { path: '/leaderboard',icon: '🏆', label: 'Leaderboard' },
    ]
  },
  {
    label: 'Certification',
    items: [
      { path: '/certification', icon: '🎓', label: 'Mes Certificats', badge: 'NEW' },
    ]
  },
  {
    label: 'Compte',
    items: [
      { path: '/receipts',  icon: '🧾', label: 'Mes Reçus', badge: 'NEW' },
      { path: '/settings',  icon: '⚙️', label: 'Paramètres' },
    ]
  },
]

export default function Sidebar() {
  const location = useLocation()
  const signOut  = useSignOut()
  const { languages, isPremium } = useSubscription()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen fixed left-0 top-0 pt-20 pb-6 px-3 overflow-y-auto"
           style={{ background: 'rgba(13,45,82,0.25)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

      {/* Corners accessibles */}
      {languages.length > 0 && (
        <div className="mb-2">
          <p className="font-mono text-[9px] tracking-[0.28em] text-muted uppercase px-3 mb-1.5 mt-2">Mes Corners</p>
          {languages.map(lang => {
            const l = LANGUAGES[lang]
            return (
              <Link key={lang} to={`/corner/${lang}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm transition-all mb-0.5
                  ${isActive(`/corner/${lang}`)
                    ? 'bg-blue/30 text-white'
                    : 'text-muted hover:text-white hover:bg-white/5'}`}>
                <span className="text-base">{l.flag}</span>
                <span>{l.corner}</span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Sections de navigation */}
      {NAV_SECTIONS.map(section => (
        <div key={section.label} className="mb-2">
          <p className="font-mono text-[9px] tracking-[0.28em] text-muted uppercase px-3 mb-1.5 mt-3">
            {section.label}
          </p>
          {section.items.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm transition-all mb-0.5
                ${isActive(item.path)
                  ? 'bg-gold/15 text-gold'
                  : 'text-muted hover:text-white hover:bg-white/5'}`}>
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="font-mono text-[8px] tracking-[0.1em] bg-gold text-dark px-1.5 py-0.5 rounded-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Admin link (affiché seulement si l'utilisateur est admin) */}
      <div className="mt-2 border-t border-white/5 pt-3">
        <Link to="/admin"
          className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted hover:text-white hover:bg-white/5 transition-all rounded-sm">
          <span>🔧</span><span>Administration</span>
        </Link>
        <button onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted hover:text-white transition-colors w-full text-left rounded-sm">
          <span>🚪</span><span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
