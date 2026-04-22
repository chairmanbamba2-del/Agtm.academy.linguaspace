/**
 * Button — composant bouton universel LINGUA SPACE
 *
 * Usage :
 *   <Button>Texte</Button>
 *   <Button variant="outline" size="sm" loading>Chargement</Button>
 *   <Button variant="ghost" icon="🤖">IA Coach</Button>
 */
export default function Button({
  children,
  variant  = 'gold',   // 'gold' | 'outline' | 'ghost' | 'danger'
  size     = 'md',     // 'sm' | 'md' | 'lg'
  loading  = false,
  disabled = false,
  icon     = null,
  fullWidth = false,
  onClick,
  type     = 'button',
  className = '',
}) {
  const base = `
    inline-flex items-center justify-center gap-2 font-medium
    transition-all duration-200 rounded-sm select-none
    disabled:opacity-40 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-gold/40
  `

  const variants = {
    gold:    'bg-gold text-dark hover:bg-gold-lt hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(232,148,26,0.3)]',
    outline: 'border border-white/20 text-white hover:border-white/50 hover:-translate-y-0.5 bg-transparent',
    ghost:   'text-muted hover:text-white bg-transparent',
    danger:  'border border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-900/20 bg-transparent',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 tracking-wide',
    md: 'text-sm px-5 py-2.5 tracking-wider',
    lg: 'text-base px-7 py-3.5 tracking-widest',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
