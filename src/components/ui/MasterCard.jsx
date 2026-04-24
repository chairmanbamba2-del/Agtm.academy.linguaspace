// ============================================================
// MasterCard.jsx — COMPOSANT PREMIUM v2
// Carte réutilisable pour Dashboard, Corners, Modules
// Props : toutes compatibles avec les données existantes
// ============================================================

// ── Couleurs de langue ───────────────────────────────────────
const LANG_STYLES = {
  en: { accent: '#C8102E', glow: 'rgba(200,16,46,0.18)', bg: 'rgba(200,16,46,0.07)' },
  es: { accent: '#F1BF00', glow: 'rgba(241,191,0,0.18)', bg: 'rgba(241,191,0,0.07)' },
  de: { accent: '#94A3B8', glow: 'rgba(148,163,184,0.18)', bg: 'rgba(148,163,184,0.07)' },
  fr: { accent: '#4A7FBF', glow: 'rgba(74,127,191,0.18)', bg: 'rgba(74,127,191,0.07)' },
  ar: { accent: '#059669', glow: 'rgba(5,150,105,0.18)', bg: 'rgba(5,150,105,0.07)' },
}

// ── Variants de carte ───────────────────────────────────────
const VARIANT_STYLES = {
  // Dashboard : stats (XP, streak, langues)
  stat: {
    base: 'flex flex-col items-start gap-2',
    bg:   'rgba(14,30,53,0.8)',
    border: 'rgba(30,58,95,0.8)',
    hover: 'rgba(30,58,95,1)',
  },
  // Corner/Dashboard : carte d'une langue
  corner: {
    base: 'flex flex-col gap-3',
    bg:   'rgba(12,22,42,0.9)',
    border: 'rgba(30,58,95,0.8)',
    hover: 'rgba(30,58,95,1)',
  },
  // Contenu media (vidéo, audio)
  content: {
    base: 'flex flex-col',
    bg:   'rgba(14,30,53,0.7)',
    border: 'rgba(30,58,95,0.6)',
    hover: 'rgba(30,58,95,0.9)',
  },
  // Accès rapide (liens dashboard)
  action: {
    base: 'flex flex-col items-start gap-2',
    bg:   'rgba(13,20,38,0.8)',
    border: 'rgba(30,58,95,0.6)',
    hover: 'rgba(30,58,95,1)',
  },
}

/**
 * MasterCard — carte premium avec micro-interactions
 *
 * @param {string}  variant     'stat' | 'corner' | 'content' | 'action'
 * @param {string}  lang        'en' | 'es' | 'de' | 'fr' | null
 * @param {boolean} glow        Activer le glow au survol
 * @param {boolean} interactive Activer hover complet
 * @param {string}  padding     'sm' | 'md' | 'lg' | 'none'
 * @param {string}  className   Classes additionnelles
 * @param {function}onClick     Handler click (garde la compatibilité existante)
 * @param {node}    children    Contenu de la carte
 *
 * Props XP/Niveau (pour Dashboard) :
 * @param {number}  xp          Points d'expérience
 * @param {number}  xpMax       Maximum XP pour la barre (défaut: 5000)
 * @param {string}  level       Niveau CEFR courant ('A1'–'C2')
 * @param {number}  streak      Jours de série consécutifs
 */
export default function MasterCard({
  variant     = 'stat',
  lang        = null,
  glow        = false,
  interactive = false,
  padding     = 'md',
  className   = '',
  onClick,
  children,
  // Props métier (passées mais non requises pour le rendu)
  xp     = null,
  xpMax  = 5000,
  level  = null,
  streak = null,
}) {
  const vs = VARIANT_STYLES[variant] || VARIANT_STYLES.stat
  const ls = lang ? LANG_STYLES[lang] : null

  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-5 md:p-6',
    lg:   'p-6 md:p-8',
  }

  // Dérive la couleur d'accent : langue > gold
  const accentColor = ls?.accent || '#E8941A'
  const glowColor   = ls?.glow   || 'rgba(232,148,26,0.25)'

  return (
    <div
      onClick={onClick}
      className={[
        // Base
        'relative rounded-card overflow-hidden',
        'border',
        'transition-all duration-350',
        // Cursor
        (onClick || interactive) ? 'cursor-pointer' : '',
        // Padding
        paddings[padding],
        // Contenu layout
        vs.base,
        className,
      ].join(' ')}
      style={{
        background:   ls ? `linear-gradient(145deg, ${ls.bg}, rgba(14,30,53,0.8))` : `linear-gradient(145deg, ${vs.bg}, rgba(10,18,32,0.9))`,
        borderColor:  vs.border,
        boxShadow:    '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      // Micro-interactions hover via handlers (compatibilité Tailwind JIT)
      onMouseEnter={e => {
        if (!onClick && !interactive && !glow) return
        e.currentTarget.style.borderColor = accentColor + '55'
        e.currentTarget.style.transform   = 'translateY(-2px)'
        e.currentTarget.style.boxShadow   = glow
          ? `0 8px 40px rgba(0,0,0,0.4), 0 0 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.06)`
          : '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
      }}
      onMouseLeave={e => {
        if (!onClick && !interactive && !glow) return
        e.currentTarget.style.borderColor = vs.border
        e.currentTarget.style.transform   = ''
        e.currentTarget.style.boxShadow   = '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
      }}
    >

      {/* ── Bande d'accent en haut (si langue) ─────────────────── */}
      {ls && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, ${ls.accent}, transparent)`,
            opacity: 0.7,
          }}
        />
      )}

      {/* ── Contenu ────────────────────────────────────────────── */}
      {children}

      {/* ── Barre XP (si prop xp fournie) ─────────────────────── */}
      {xp !== null && (
        <XPBar xp={xp} xpMax={xpMax} accentColor={accentColor} />
      )}
    </div>
  )
}

// ── Sous-composant : Barre XP ───────────────────────────────
export function XPBar({ xp, xpMax = 5000, accentColor = '#E8941A', className = '' }) {
  const pct = Math.min(Math.round((xp / xpMax) * 100), 100)

  return (
    <div className={`w-full ${className}`}>
      {/* Track */}
      <div
        className="w-full h-[3px] rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        {/* Fill */}
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width:      `${pct}%`,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}aa)`,
            boxShadow:  `0 0 6px ${accentColor}66`,
          }}
        />
      </div>
    </div>
  )
}

// ── Sous-composant : Badge de niveau CEFR ──────────────────
export function LevelBadge({ level, lang = null, size = 'sm' }) {
  const ls = lang ? LANG_STYLES[lang] : null
  const accentColor = ls?.accent || '#E8941A'

  const sizes = {
    xs: 'text-[7px] px-1.5 py-0.5 tracking-[0.15em]',
    sm: 'text-[8px] px-2 py-0.5 tracking-[0.2em]',
    md: 'text-[10px] px-2.5 py-1 tracking-[0.2em]',
  }

  return (
    <span
      className={`font-mono uppercase rounded-sm inline-flex items-center font-bold ${sizes[size]}`}
      style={{
        color:       accentColor,
        background:  `${accentColor}18`,
        border:      `1px solid ${accentColor}33`,
      }}
    >
      {level}
    </span>
  )
}

// ── Sous-composant : Indicateur de streak ──────────────────
export function StreakBadge({ streak, className = '' }) {
  if (!streak || streak === 0) return null
  return (
    <span className={`flex items-center gap-1 font-mono text-[10px] text-gold ${className}`}>
      <span
        className="inline-block"
        style={{ filter: 'drop-shadow(0 0 4px rgba(232,148,26,0.6))' }}
      >
        🔥
      </span>
      {streak}j
    </span>
  )
}

// ── Sous-composant : Skeleton (état de chargement) ─────────
export function MasterCardSkeleton({ variant = 'stat', padding = 'md' }) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5 md:p-6', lg: 'p-6 md:p-8' }

  return (
    <div
      className={`rounded-card border ${paddings[padding]} animate-pulse`}
      style={{
        background:  'rgba(14,30,53,0.6)',
        borderColor: 'rgba(30,58,95,0.6)',
      }}
    >
      <div className="h-3 rounded-sm w-1/3 mb-3"
           style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="h-6 rounded-sm w-2/3 mb-2"
           style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="h-2 rounded-sm w-1/2"
           style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}
