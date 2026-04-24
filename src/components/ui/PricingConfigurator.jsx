import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALL_LANGUAGES, getPrices, checkPromoActive, EARLY_BIRD } from '../../lib/pricing'
import MasterCard from './MasterCard'

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const start = display
    if (start === value) return
    const diff = value - start
    const duration = 400
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value])

  return <>{display.toLocaleString()}</>
}

export default function PricingConfigurator({ onSubscribe, showTitle = true }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const promo = checkPromoActive()

  const toggleLang = (code) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    )
  }

  const prices = getPrices(selected.length)

  const handleSubscribe = () => {
    const codes = selected.join(',')
    const url = `/subscribe?langs=${codes}&price=${prices.effective}`
    if (onSubscribe) onSubscribe({ codes, price: prices.effective })
    else navigate(url)
  }

  return (
    <MasterCard variant="content" padding="xl" className="text-center">
      {showTitle && (
        <div className="mb-6">
          <div className="font-mono text-xs tracking-ultra text-muted uppercase mb-1">
            Construisez votre forfait
          </div>
          <p className="text-sm text-muted">
            Choisissez <strong className="text-white">1 à 5 langues</strong> — le prix s'ajuste
            automatiquement
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {ALL_LANGUAGES.map((lang) => {
          const isOn = selected.includes(lang.code)
          return (
            <button
              key={lang.code}
              onClick={() => toggleLang(lang.code)}
              className={`
                flex flex-col items-center gap-1 px-4 py-3 rounded-sm border text-sm
                transition-all duration-200 cursor-pointer
                ${
                  isOn
                    ? 'border-gold bg-gold/10 text-white shadow-gold-sm'
                    : 'border-bdr bg-card text-muted hover:border-white/20 hover:text-white'
                }
              `}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium whitespace-nowrap">{lang.name}</span>
              <span className="text-[10px] opacity-60">{lang.corner}</span>
              {isOn && <span className="text-gold text-xs mt-0.5">✓</span>}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <div className="mb-8 animate-fade-in">
          <div className="font-mono text-xs text-muted mb-2 uppercase tracking-wide">
            {selected.length} langue{selected.length > 1 ? 's' : ''} sélectionnée
            {selected.length > 1 ? 's' : ''}
          </div>

          <div className="inline-block bg-dark border border-gold/20 rounded-sm px-8 py-5 mb-4 min-w-[260px]">
            <div className="font-serif text-5xl text-gold">
              <AnimatedNumber value={prices.effective} />{' '}
              <span className="text-lg text-muted">FCFA</span>
            </div>
            <div className="text-sm text-muted mt-1">/mois</div>
            {selected.length > 1 && (
              <div className="text-xs text-muted mt-1">
                soit <span className="text-white font-medium">{prices.perLanguage.toLocaleString()} FCFA</span> /langue
              </div>
            )}
          </div>

          {promo && selected.length === 5 && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-sm px-4 py-2 text-sm text-amber-300 mb-4">
              <span>⭐</span>
              <span>
                Offre Early Bird — Vous économisez{' '}
                <strong>5 000 FCFA/mois</strong> ! Valable jusqu'au 30 mai 2026
              </span>
            </div>
          )}

          {!promo && selected.length === 5 && (
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-sm px-4 py-2 text-sm text-green-300 mb-4">
              <span>✅</span>
              <span>Prix dégressif — 5 langues au meilleur tarif</span>
            </div>
          )}

          {selected.length < 5 && promo && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-sm px-4 py-2 text-xs text-amber-300 mb-4">
              <span>⭐</span>
              <span>
                Early Bird : 5 langues à <strong>25 000 FCFA/mois</strong> au lieu de 30 000
              </span>
            </div>
          )}

          <div className="max-w-md mx-auto text-left space-y-2 mb-8">
            <p className="text-xs text-muted font-mono uppercase tracking-wide mb-2">
              Inclus dans votre forfait
            </p>
            {selected.map((code) => {
              const l = ALL_LANGUAGES.find((x) => x.code === code)
              return (
                <div key={code} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="text-gold">✓</span>
                  <span>
                    {l?.flag} {l?.corner}
                  </span>
                  <span className="text-muted text-xs">— 100 modules A1→C2</span>
                </div>
              )
            })}
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span className="text-gold">✓</span>
              <span>Quiz IA automatiques sur chaque module</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span className="text-gold">✓</span>
              <span>Coach IA — Free Talk & Business Mode (30 sessions/mois)</span>
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            className="btn-gold px-8 py-3 text-base font-semibold"
          >
            S'abonner — {prices.effective.toLocaleString()} FCFA/mois →
          </button>
        </div>
      )}

      {selected.length === 0 && (
        <div className="py-8">
          <p className="text-muted text-sm mb-2">
            Cliquez sur une ou plusieurs langues pour construire votre abonnement
          </p>
          <div className="text-4xl opacity-20">👆</div>
        </div>
      )}
    </MasterCard>
  )
}
