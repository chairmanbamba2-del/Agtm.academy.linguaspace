// ============================================================
// Sidebar.jsx — DESIGN ELITE v2
// Glassmorphism + gradients langue + micro-interactions
// Logique métier : INCHANGÉE (NAV_SECTIONS, isAdmin, signOut)
// ============================================================
import { Link, useLocation } from 'react-router-dom'
import { useSubscription } from '../../hooks/useSubscription'
import { LANGUAGES } from '../../lib/constants'
import { useSignOut } from '../../hooks/useAuth'
import { useUserStore } from '../../store/userStore'

// Couleurs des flags par langue (identitaires)
const LANG_COLORS = {
  en: { accent: '#C8102E', glow: 'rgba(200,16,46,0.20)' },
  es: { accent: '#F1BF00', glow: 'rgba(241,191,0,0.20)' },
  de: { accent: '#94A3B8', glow: 'rgba(148,163,184,0.20)' },
  fr: { accent: '#4A7FBF', glow: 'rgba(74,127,191,0.20)' },
}

const NAV_SECTIONS = [
  {
    label: 'Apprentissage',
    items: [
      { path: '/dashboard',   icon: '⊞',  label: 'Accueil'      },
      { path: '/assistant',   icon: '◎',  label: 'IA Coach'     },
      { path: '/progress',    icon: '↗',  label: 'Progression'  },
      { path: '/leaderboard', icon: '◈',  label: 'Leaderboard'  },
    ],
  },
  {
    label: 'Certification',
    items: [
      { path: '/certification', icon: '◇', label: 'Mes Certificats', badge: 'NEW' },
    ],
  },
  {
    label: 'Compte',
    items: [
      { path: '/receipts', icon: '▤',  label: 'Mes Reçus',    badge: 'NEW' },
      { path: '/settings', icon: '◐',  label: 'Paramètres'               },
    ],
  },
]

export default function Sidebar({ open, onClose }) {
  const location  = useLocation()
  const signOut   = useSignOut()
  const { languages, isPremium } = useSubscription()
  const { isAdmin } = useUserStore()

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <aside
      className={[
        // Position & dimensions
        'fixed left-0 top-0 z-sidebar',
        'w-[240px] h-screen',
        'pt-[64px] pb-6',
        'flex flex-col',
        'overflow-y-auto sidebar-scrollbar',
        // Mobile : slide-in
        'transition-transform duration-350 ease-smooth',
        open ? 'translate-x-0' : '-translate-x-full',
        // Desktop : toujours visible
        'md:translate-x-0',
      ].join(' ')}
      style={{
        background:    'rgba(9,18,34,0.92)',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight:   '1px solid rgba(255,255,255,0.05)',
        boxShadow:     '4px 0 32px rgba(0,0,0,0.5)',
      }}
    >

      {/* ── Halo décoratif interne ─────────────────────────────── */}
      <div
        className="absolute top-0 left-0 w-full h-48 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(27,79,138,0.15) 0%, transparent 70%)',
        }}
      />

      {/* ── Corps de la sidebar ───────────────────────────────── */}
      <div className="relative flex flex-col flex-1 px-3 pt-4">

        {/* ── Mes Corners (par langue) ─────────────────────────── */}
        {languages.length > 0 && (
          <div className="mb-4">
            <SectionLabel>Mes Corners</SectionLabel>
            {languages.map(lang => {
              const l     = LANGUAGES[lang]
              const lc    = LANG_COLORS[lang] || LANG_COLORS.en
              const active = isActive(`/corner/${lang}`)

              return (
                <Link
                  key={lang}
                  to={`/corner/${lang}`}
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 mb-0.5 rounded-sm text-sm transition-all duration-250 group"
                  style={active ? {
                    background: `linear-gradient(135deg, ${lc.glow}, rgba(0,0,0,0))`,
                    borderLeft: `2px solid ${lc.accent}`,
                    paddingLeft: '10px',
                    color: '#FAFAF8',
                  } : {}}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.background = ''
                  }}
                >
                  <span className="text-base leading-none">{l.flag}</span>
                  <span className={active ? 'text-white' : 'text-muted group-hover:text-white transition-colors'}>
                    {l.corner}
                  </span>
                  {active && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: lc.accent, boxShadow: `0 0 6px ${lc.accent}` }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Sections de navigation ───────────────────────────── */}
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-4">
            <SectionLabel>{section.label}</SectionLabel>
            {section.items.map(item => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 mb-0.5 rounded-sm text-sm transition-all duration-250 group"
                  style={active ? {
                    background: 'linear-gradient(135deg, rgba(232,148,26,0.12), rgba(232,148,26,0.04))',
                    borderLeft: '2px solid #E8941A',
                    paddingLeft: '10px',
                  } : {}}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.background = ''
                  }}
                >
                  {/* Icône texte (élégant, pas d'emoji) */}
                  <span
                    className={[
                      'text-base leading-none w-5 text-center flex-shrink-0 transition-colors duration-200',
                      active ? 'text-gold' : 'text-muted/60 group-hover:text-muted',
                    ].join(' ')}
                  >
                    {item.icon}
                  </span>

                  <span
                    className={[
                      'flex-1 transition-colors duration-200',
                      active ? 'text-gold font-medium' : 'text-muted group-hover:text-white',
                    ].join(' ')}
                  >
                    {item.label}
                  </span>

                  {/* Badge NEW */}
                  {item.badge && (
                    <span
                      className="font-mono text-[7px] tracking-[0.15em] px-1.5 py-0.5 rounded-sm flex-shrink-0"
                      style={{
                        background: 'rgba(232,148,26,0.9)',
                        color:      '#080F1A',
                        fontWeight: '700',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}

        {/* ── Spacer ──────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Zone admin + déconnexion ─────────────────────────── */}
        <div
          className="mt-3 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Badge plan actif */}
          {isPremium && (
            <div
              className="mx-2 mb-3 px-3 py-2 rounded-sm text-center"
              style={{
                background:  'linear-gradient(135deg, rgba(27,79,138,0.3), rgba(13,45,82,0.2))',
                border:      '1px solid rgba(93,165,229,0.2)',
              }}
            >
              <p className="font-mono text-[7px] tracking-[0.2em] text-blue-300/70 uppercase mb-0.5">Forfait actif</p>
              <p className="font-mono text-[10px] tracking-widest text-blue-200 font-bold">ALL ACCESS</p>
            </div>
          )}

          {/* Liens admin */}
          {isAdmin && (
            <div className="mb-2">
              <SectionLabel>Administration</SectionLabel>
              {[
                { path: '/admin',          label: 'Dashboard' },
                { path: '/admin/users',    label: 'Utilisateurs' },
                { path: '/admin/finance',  label: 'Finance' },
                { path: '/admin/marketing',label: 'Marketing' },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 mb-0.5 rounded-sm text-sm text-muted hover:text-white hover:bg-white/4 transition-all duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Déconnexion */}
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-muted/60 hover:text-muted w-full text-left transition-all duration-200 hover:bg-white/4"
          >
            <span className="text-base leading-none opacity-50">→</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

// ── Sous-composant : label de section ───────────────────────
function SectionLabel({ children }) {
  return (
    <p className="font-mono text-[8px] tracking-[0.3em] text-muted/50 uppercase px-3 mb-2 mt-1 select-none">
      {children}
    </p>
  )
}
