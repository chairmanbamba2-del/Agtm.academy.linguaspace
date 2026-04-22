// ============================================================
// Card.jsx — DESIGN ELITE v2
// Rétrocompatible à 100% avec l'API existante
// Nouvelles props optionnelles : glow, lang, glass
// ============================================================

/**
 * Card — conteneur carte LINGUA SPACE
 *
 * Props existantes (INCHANGÉES) :
 *   accent    'gold' | 'blue' | 'green' | null
 *   hover     boolean
 *   padding   'sm' | 'md' | 'lg' | 'none'
 *   className string
 *   onClick   function
 *
 * Nouvelles props optionnelles :
 *   glow      boolean  — halo lumineux au survol
 *   lang      string   — couleur d'accent selon la langue ('en'|'es'|'de'|'fr')
 *   glass     boolean  — effet glassmorphism
 */

const LANG_ACCENTS = {
  en: { color: '#C8102E', glow: 'rgba(200,16,46,0.25)',  bg: 'rgba(200,16,46,0.06)' },
  es: { color: '#F1BF00', glow: 'rgba(241,191,0,0.25)',  bg: 'rgba(241,191,0,0.06)' },
  de: { color: '#94A3B8', glow: 'rgba(148,163,184,0.25)',bg: 'rgba(148,163,184,0.06)' },
  fr: { color: '#4A7FBF', glow: 'rgba(74,127,191,0.25)', bg: 'rgba(74,127,191,0.06)' },
}

const ACCENT_COLORS = {
  gold:  { border: '#E8941A', glow: 'rgba(232,148,26,0.25)' },
  blue:  { border: '#1B4F8A', glow: 'rgba(27,79,138,0.25)'  },
  green: { border: '#22C55E', glow: 'rgba(34,197,94,0.25)'  },
}

export default function Card({
  children,
  // Props existantes
  accent    = null,
  hover     = false,
  padding   = 'md',
  className = '',
  onClick,
  // Nouvelles props optionnelles
  glow      = false,
  lang      = null,
  glass     = false,
}) {
  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-5 md:p-6',
    lg:   'p-6 md:p-8',
  }

  // Résoudre les couleurs
  const langStyle   = lang   ? LANG_ACCENTS[lang]    : null
  const accentStyle = accent ? ACCENT_COLORS[accent] : null
  const finalAccent = langStyle?.color || accentStyle?.border || null
  const finalGlow   = langStyle?.glow  || accentStyle?.glow   || 'rgba(232,148,26,0.25)'

  const isInteractive = hover || !!onClick || glow

  return (
    <div
      onClick={onClick}
      className={[
        'relative rounded-card border overflow-hidden',
        'transition-all duration-350',
        isInteractive ? 'cursor-pointer' : '',
        paddings[padding],
        className,
      ].join(' ')}
      style={{
        // Fond
        background: glass
          ? 'rgba(255,255,255,0.04)'
          : langStyle
            ? `linear-gradient(145deg, ${langStyle.bg}, rgba(14,30,53,0.85))`
            : 'rgba(14,30,53,0.8)',
        // Bordure
        borderColor: finalAccent
          ? `${finalAccent}44`
          : 'rgba(30,58,95,0.8)',
        // Ombre de base
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        // Glass
        backdropFilter: glass ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: glass ? 'blur(12px)' : undefined,
      }}
      onMouseEnter={e => {
        if (!isInteractive) return
        e.currentTarget.style.transform   = 'translateY(-2px)'
        e.currentTarget.style.borderColor = finalAccent ? `${finalAccent}66` : 'rgba(30,58,95,1)'
        e.currentTarget.style.boxShadow   = glow && finalGlow
          ? `0 8px 40px rgba(0,0,0,0.4), 0 0 24px ${finalGlow}, inset 0 1px 0 rgba(255,255,255,0.06)`
          : '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
      }}
      onMouseLeave={e => {
        if (!isInteractive) return
        e.currentTarget.style.transform   = ''
        e.currentTarget.style.borderColor = finalAccent ? `${finalAccent}44` : 'rgba(30,58,95,0.8)'
        e.currentTarget.style.boxShadow   = '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
      }}
    >
      {/* Bande accent haut de carte */}
      {finalAccent && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, ${finalAccent}BB, transparent)`,
          }}
        />
      )}

      {children}
    </div>
  )
}
