export default function Spinner({ size = 'md', color = 'gold', label = '' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-2', lg: 'w-10 h-10 border-3' }
  const colors = { gold: 'border-gold/30 border-t-gold', white: 'border-white/20 border-t-white', muted: 'border-muted/20 border-t-muted' }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`} />
      {label && <p className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase animate-pulse">{label}</p>}
    </div>
  )
}
