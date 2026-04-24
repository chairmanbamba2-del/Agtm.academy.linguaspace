export const PRICING_GRID = {
  1: 10000,
  2: 15000,
  3: 20000,
  4: 25000,
  5: 30000,
}

export const EARLY_BIRD = {
  languageCount: 5,
  price: 25000,
  validUntil: new Date('2026-05-30T23:59:59'),
}

export function checkPromoActive() {
  return new Date() <= EARLY_BIRD.validUntil
}

export function getPrices(languageCount) {
  const count = Math.min(Math.max(1, languageCount), 5)
  const original = PRICING_GRID[count]
  const isPromo = checkPromoActive() && count === EARLY_BIRD.languageCount
  const effective = isPromo ? EARLY_BIRD.price : original
  return {
    original,
    effective,
    isPromo,
    perLanguage: Math.round(effective / count),
    count,
  }
}

export const ALL_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', corner: 'English Corner' },
  { code: 'es', name: 'Español', flag: '🇪🇸', corner: 'Rincón Español' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', corner: 'Deutsche Ecke' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', corner: 'Espace Francophone' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', corner: 'الركن العربي' },
]
