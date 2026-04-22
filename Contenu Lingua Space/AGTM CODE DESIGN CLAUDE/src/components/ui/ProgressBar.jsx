/**
 * ProgressBar — barre de progression animée
 *
 * Usage :
 *   <ProgressBar value={65} max={100} label="XP" color="gold" />
 *   <ProgressBar value={3} max={6} labels={CEFR_LEVELS} showSteps />
 */
export default function ProgressBar({
  value     = 0,
  max       = 100,
  label     = '',
  color     = 'gold',   // 'gold' | 'blue' | 'green'
  showSteps = false,
  labels    = [],
  height    = 'sm',     // 'xs' | 'sm' | 'md'
  className = '',
}) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)

  const colors = {
    gold:  'bg-gold',
    blue:  'bg-blue',
    green: 'bg-green-500',
  }

  const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5' }

  return (
    <div className={className}>
      {/* Label + valeur */}
      {(label || value !== undefined) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-muted">{label}</span>}
          <span className="text-xs font-mono text-gold ml-auto">
            {Math.round(pct)}%
          </span>
        </div>
      )}

      {/* Barre principale */}
      <div className={`w-full ${heights[height]} bg-dark rounded-full overflow-hidden`}>
        <div
          className={`${heights[height]} ${colors[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Étapes CEFR */}
      {showSteps && labels.length > 0 && (
        <div className="flex justify-between mt-1">
          {labels.map((l, i) => (
            <span key={l}
              className={`font-mono text-[9px] ${i < Math.round(value) ? 'text-gold' : 'text-muted'}`}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
