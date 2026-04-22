// ============================================================
// Navbar.jsx — DESIGN ELITE v2
// Glassmorphism + bordure gold subtile + micro-interactions
// Logique métier : INCHANGÉE (auth/subscription conservés)
// ============================================================
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useUserStore } from '../../store/userStore'
import { useSignOut } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'

export default function Navbar({ onMenuToggle }) {
  const location     = useLocation()
  const user         = useUserStore(s => s.user)
  const linguaUser   = useUserStore(s => s.linguaUser)
  const subscription = useUserStore(s => s.subscription)
  const { isPremium } = useSubscription()
  const [menuOpen, setMenuOpen] = useState(false)
  const signOut = useSignOut()

  const isActive = (path) => location.pathname.startsWith(path)

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/assistant',  label: 'IA Coach'   },
    { to: '/progress',   label: 'Progression' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-navbar h-[64px] flex items-center justify-between px-5 md:px-8"
      style={{
        background:    'rgba(8,15,26,0.85)',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom:  '1px solid rgba(232,148,26,0.12)',
        boxShadow:     '0 1px 24px rgba(0,0,0,0.4)',
      }}
    >

      {/* ── Logo ──────────────────────────────────────────────── */}
      <Link
        to={user ? '/dashboard' : '/'}
        className="flex flex-col leading-none group flex-shrink-0"
      >
        <span className="font-mono text-[8px] tracking-[0.28em] text-muted uppercase transition-colors group-hover:text-muted/80">
          AGTM Digital Academy
        </span>
        <span
          className="font-serif text-[1.2rem] text-gold leading-tight tracking-wide transition-all group-hover:text-gold-lt"
          style={{ textShadow: '0 0 20px rgba(232,148,26,0.3)' }}
        >
          LINGUA SPACE
        </span>
      </Link>

      {/* ── Navigation desktop ────────────────────────────────── */}
      {user && (
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={[
                'relative px-4 py-2 text-sm font-medium rounded-sm transition-all duration-250',
                isActive(to)
                  ? 'text-white'
                  : 'text-muted hover:text-white',
              ].join(' ')}
            >
              {label}
              {/* Indicateur actif */}
              {isActive(to) && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-gold"
                  style={{ boxShadow: '0 0 8px rgba(232,148,26,0.6)' }}
                />
              )}
            </Link>
          ))}
        </div>
      )}

      {/* ── Actions droite ────────────────────────────────────── */}
      <div className="flex items-center gap-3">

        {/* Badge premium */}
        {user && isPremium && (
          <span
            className="hidden md:inline-flex items-center font-mono text-[8px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm border"
            style={{
              background:   'rgba(27,79,138,0.25)',
              borderColor:  'rgba(93,165,229,0.3)',
              color:        '#93C5FD',
              boxShadow:    '0 0 12px rgba(59,130,246,0.1)',
            }}
          >
            ALL ACCESS
          </span>
        )}

        {/* Bouton S'abonner (si pas d'abonnement) */}
        {user && !subscription && (
          <Link
            to="/subscribe"
            className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase px-4 py-2 rounded-sm transition-all duration-250 hover:-translate-y-px"
            style={{
              background:  'linear-gradient(135deg, #E8941A, #F5B942)',
              color:       '#080F1A',
              boxShadow:   '0 4px 16px rgba(232,148,26,0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(232,148,26,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,148,26,0.3)'
            }}
          >
            S'abonner
          </Link>
        )}

        {/* Avatar / Déconnexion desktop */}
        {user && (
          <button
            onClick={signOut}
            className="hidden md:flex items-center gap-2 pl-3 border-l border-white/8 text-sm text-muted hover:text-white transition-colors duration-200"
            title="Déconnexion"
          >
            {/* Initiale utilisateur */}
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-dark flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #E8941A, #F5B942)' }}
            >
              {(linguaUser?.full_name || user?.email || '?')[0].toUpperCase()}
            </span>
            <span className="text-xs">Déconnexion</span>
          </button>
        )}

        {/* Liens visiteur (non connecté) */}
        {!user && (
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-muted hover:text-white transition-colors duration-200"
            >
              Connexion
            </Link>
            <Link
              to="/subscribe"
              className="text-sm text-muted hover:text-white transition-colors duration-200"
            >
              Forfaits
            </Link>
            <Link
              to="/signup"
              className="text-[11px] font-semibold tracking-widest uppercase px-4 py-2 rounded-sm transition-all duration-250 hover:-translate-y-px"
              style={{
                background: 'linear-gradient(135deg, #E8941A, #F5B942)',
                color:      '#080F1A',
                boxShadow:  '0 4px 16px rgba(232,148,26,0.3)',
              }}
            >
              Commencer
            </Link>
          </div>
        )}

        {/* Burger mobile */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-sm text-white transition-all duration-200 hover:bg-white/5"
          onClick={() => {
            setMenuOpen(v => !v)
            onMenuToggle?.()
          }}
          aria-label="Menu principal"
        >
          <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>
      </div>

      {/* ── Menu mobile déroulant ──────────────────────────────── */}
      <div
        className={[
          'absolute top-full left-0 right-0 md:hidden',
          'overflow-hidden transition-all duration-350',
          menuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
        style={{
          background:   'rgba(8,15,26,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(232,148,26,0.12)',
        }}
      >
        <div className="px-5 py-4 flex flex-col gap-1">
          {user ? (
            <>
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    'px-3 py-2.5 rounded-sm text-sm transition-all',
                    isActive(to)
                      ? 'bg-gold/10 text-gold border-l-2 border-gold pl-4'
                      : 'text-muted hover:text-white hover:bg-white/5',
                  ].join(' ')}
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-sm text-sm text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                Paramètres
              </Link>
              <div className="border-t border-white/6 mt-2 pt-2">
                <button
                  onClick={() => { setMenuOpen(false); signOut() }}
                  className="px-3 py-2.5 text-sm text-muted hover:text-white w-full text-left transition-all"
                >
                  Déconnexion
                </button>
              </div>
            </>
           ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm text-muted hover:text-white transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/subscribe"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm text-muted hover:text-white transition-colors"
              >
                Forfaits
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="mt-1 px-4 py-3 text-center text-[11px] font-semibold tracking-widest uppercase rounded-sm"
                style={{
                  background: 'linear-gradient(135deg, #E8941A, #F5B942)',
                  color:      '#080F1A',
                }}
              >
                Commencer
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
