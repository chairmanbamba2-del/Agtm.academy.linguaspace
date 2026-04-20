/**
 * Badge — étiquette de statut/niveau
 *
 * Usage :
 *   <Badge>ACTIF</Badge>
 *   <Badge variant="premium">ALL ACCESS</Badge>
 *   <Badge variant="level">B1</Badge>
 */
export default function Badge({
  children,
  variant   = 'default',  // 'default' | 'gold' | 'premium' | 'level' | 'success' | 'danger'
  size      = 'sm',
  className = '',
}) {
  const variants = {
    default: 'bg-white/8 border-white/15 text-white/70',
    gold:    'bg-gold/15 border-gold/30 text-gold',
    premium: 'bg-blue/20 border-blue/40 text-blue-300',
    level:   'bg-dark border-gold/30 text-gold',
    success: 'bg-green-900/30 border-green-500/40 text-green-400',
    danger:  'bg-red-900/30 border-red-500/40 text-red-400',
  }

  const sizes = {
    xs: 'text-[8px] px-1.5 py-0.5 tracking-[0.15em]',
    sm: 'text-[9px] px-2 py-0.5 tracking-[0.2em]',
    md: 'text-[10px] px-2.5 py-1 tracking-[0.2em]',
  }

  return (
    <span className={`
      font-mono uppercase border rounded-sm inline-flex items-center
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  )
}
