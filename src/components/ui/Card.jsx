/**
 * Card — conteneur carte LINGUA SPACE
 *
 * Usage :
 *   <Card>contenu</Card>
 *   <Card accent="gold" hover>contenu</Card>
 *   <Card padding="lg" className="...">contenu</Card>
 */
export default function Card({
  children,
  accent    = null,    // 'gold' | 'blue' | 'green' | null
  hover     = false,
  padding   = 'md',   // 'sm' | 'md' | 'lg' | 'none'
  className = '',
  onClick,
}) {
  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
  }

  const accentColors = {
    gold:  'border-t-gold',
    blue:  'border-t-blue',
    green: 'border-t-green-500',
  }

  return (
    <div
      onClick={onClick}
      className={`
        bg-card border border-[#1E3A5F] rounded-sm relative
        ${paddings[padding]}
        ${hover ? 'transition-all hover:border-gold/30 cursor-pointer' : ''}
        ${accent ? `border-t-2 ${accentColors[accent]}` : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
