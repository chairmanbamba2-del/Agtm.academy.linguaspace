import { CEFR_LEVELS } from './constants'

// ─── Formatage ──────────────────────────────────────────────

/** Formate un nombre avec séparateur de milliers */
export const formatNumber = (n) => (n || 0).toLocaleString('fr-FR')

/** Formate une durée en secondes → "3min 45s" */
export function formatDuration(seconds) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}min`
  return `${m}min ${s}s`
}

/** Formate une date ISO → "18 avril 2025" */
export function formatDate(iso, locale = 'fr-FR') {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(locale, {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

/** Retourne "il y a X" depuis une date ISO */
export function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours   = Math.floor(diff / 3600000)
  const days    = Math.floor(diff / 86400000)

  if (minutes < 1)  return 'à l\'instant'
  if (minutes < 60) return `il y a ${minutes}min`
  if (hours < 24)   return `il y a ${hours}h`
  if (days < 7)     return `il y a ${days}j`
  return formatDate(iso)
}

// ─── Niveaux CEFR ───────────────────────────────────────────

/** Calcule le pourcentage de progression dans la trajectoire CEFR */
export function cefrProgress(level) {
  const idx = CEFR_LEVELS.indexOf(level)
  return idx === -1 ? 0 : Math.round(((idx + 1) / CEFR_LEVELS.length) * 100)
}

/** Retourne le niveau CEFR suivant */
export function nextLevel(level) {
  const idx = CEFR_LEVELS.indexOf(level)
  return idx === -1 || idx === CEFR_LEVELS.length - 1 ? null : CEFR_LEVELS[idx + 1]
}

/** Calcule le niveau depuis un score de 0 à 100 */
export function scoreToLevel(score) {
  if (score >= 90) return 'C2'
  if (score >= 75) return 'C1'
  if (score >= 60) return 'B2'
  if (score >= 45) return 'B1'
  if (score >= 25) return 'A2'
  return 'A1'
}

// ─── XP & Gamification ──────────────────────────────────────

/** XP requis pour passer au niveau CEFR suivant */
export const XP_PER_LEVEL = {
  A1: 500,
  A2: 1000,
  B1: 2000,
  B2: 4000,
  C1: 8000,
  C2: Infinity,
}

/** Calcule l'XP vers le prochain niveau */
export function xpToNextLevel(level, currentXP) {
  const required = XP_PER_LEVEL[level] || 1000
  const progress = Math.min((currentXP / required) * 100, 100)
  const remaining = Math.max(required - currentXP, 0)
  return { required, progress, remaining }
}

/** Calcule le gain d'XP selon le score */
export function calculateXP(score) {
  if (score >= 90) return 120
  if (score >= 80) return 100
  if (score >= 70) return 80
  if (score >= 60) return 60
  if (score >= 50) return 40
  return 20
}

// ─── Validation ─────────────────────────────────────────────

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone) {
  return /^[+]?[\d\s\-()]{8,15}$/.test(phone)
}

// ─── Divers ─────────────────────────────────────────────────

/** Tronque un texte à N caractères */
export function truncate(text, maxLength = 100) {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

/** Génère un ID unique */
export const uid = () => Math.random().toString(36).slice(2, 10)

/** Délai asynchrone */
export const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/** Copie du texte dans le presse-papier */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
