// ─────────────────────────────────────────────────────────────
// AIWidgets.jsx  —  3 micro-composants UI pour l'Assistant IA
// ─────────────────────────────────────────────────────────────

// ── 1. AIVoiceWave ───────────────────────────────────────────
// 5 barres asymétriques simulant un spectre audio.
// Props : active (bool) — stoppe les barres si false.
export function AIVoiceWave({ active = true, className = '' }) {
  const bars = [
    { h: 'h-3',   anim: active ? 'animate-wave-1' : '' },
    { h: 'h-5',   anim: active ? 'animate-wave-2' : '' },
    { h: 'h-7',   anim: active ? 'animate-wave-3' : '' },
    { h: 'h-4',   anim: active ? 'animate-wave-4' : '' },
    { h: 'h-6',   anim: active ? 'animate-wave-5' : '' },
  ]
  return (
    <div className={`flex items-center gap-[3px] ${className}`}>
      {bars.map((b, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-gold origin-bottom transition-transform ${b.h} ${b.anim}`}
          style={{ opacity: active ? 1 : 0.3 }}
        />
      ))}
    </div>
  )
}

// ── 2. PulseAvatar ───────────────────────────────────────────
// Wrapper avec halo pulsé. isThinking intensifie la pulsation.
// Props : isThinking (bool), children (avatar img/div).
export function PulseAvatar({ isThinking = false, children, className = '' }) {
  return (
    <div
      className={`rounded-full ${isThinking ? 'animate-halo-thinking' : 'animate-halo-idle'} ${className}`}
    >
      {children}
    </div>
  )
}

// ── 3. ElasticBubble ─────────────────────────────────────────
// Wrapper "pop-in" pour les bulles de chat.
// Props : children, className.
export function ElasticBubble({ children, className = '' }) {
  return (
    <div className={`animate-pop-in ${className}`}>
      {children}
    </div>
  )
}
