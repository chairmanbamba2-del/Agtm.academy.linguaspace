import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { checkPromoActive, EARLY_BIRD } from '../../lib/pricing'

const STORAGE_KEY = 'lingua_top_banner_dismissed'

export default function TopBanner() {
  const [active, setActive] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  )

  useEffect(() => {
    if (!checkPromoActive()) {
      setActive(false)
      return
    }
    setActive(true)
    const update = () => {
      const now = new Date()
      const diff = Math.max(0, Math.ceil((EARLY_BIRD.validUntil - now) / 86400000))
      setDaysLeft(diff)
      if (diff === 0) setActive(false)
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  if (!active || dismissed) return null

  return (
    <div className="relative bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-dark text-center shadow-lg">
      <div className="flex items-center justify-center gap-2 sm:gap-4 px-4 py-2 text-xs sm:text-sm font-medium">
        <span className="hidden sm:inline animate-pulse">⭐</span>
        <span>
          🚀 <strong>Early Bird</strong> — 5 langues à{' '}
          <strong className="text-dark/80">25 000 FCFA/mois</strong>
          <span className="hidden sm:inline">
            {' '}(au lieu de 30 000)
          </span>
        </span>
        <span className="bg-dark/20 px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono whitespace-nowrap">
          {daysLeft}j
        </span>
        <Link
          to="/subscribe?langs=en,es,de,fr,ar&price=25000"
          className="underline font-bold whitespace-nowrap text-dark hover:text-white transition-colors"
        >
          J'en profite →
        </Link>
        <button
          onClick={handleDismiss}
          className="ml-1 opacity-50 hover:opacity-100 transition-opacity text-base leading-none"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
