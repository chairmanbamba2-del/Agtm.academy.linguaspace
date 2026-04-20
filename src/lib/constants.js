export const LANGUAGES = {
  en: { code: 'en', name: 'English',    flag: '🇬🇧', corner: 'English Corner',      color: '#C8102E', speechLang: 'en-US' },
  es: { code: 'es', name: 'Español',    flag: '🇪🇸', corner: 'Rincón Español',      color: '#F1BF00', speechLang: 'es-ES' },
  de: { code: 'de', name: 'Deutsch',    flag: '🇩🇪', corner: 'Deutsche Ecke',       color: '#94A3B8', speechLang: 'de-DE' },
  fr: { code: 'fr', name: 'Français',   flag: '🇫🇷', corner: 'Espace Francophone',  color: '#4A7FBF', speechLang: 'fr-FR' },
}

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const CEFR_LABELS = {
  A1: 'Découverte',
  A2: 'Survie',
  B1: 'Seuil',
  B2: 'Avancé',
  C1: 'Autonome',
  C2: 'Maîtrise',
}

export const PLANS = {
  uni: {
    id:       'uni',
    name:     'LINGUA UNI',
    price:    10000,
    currency: 'FCFA',
    model:    'claude-sonnet-4-20250514',
    sessions: 30,
    color:    '#E8941A',
    features: [
      '1 Corner au choix',
      '100 modules A1 → C2',
      'Flux audio/vidéo + Quiz IA',
      'Claude Sonnet — 30 sessions/mois',
      'Test de niveau inclus',
      'Rapport hebdomadaire',
    ]
  },
  all_access: {
    id:       'all_access',
    name:     'LINGUA ALL ACCESS',
    price:    15000,
    currency: 'FCFA',
    model:    'claude-opus-4-5',
    sessions: null, // illimité
    color:    '#93C5FD',
    features: [
      'Les 4 Corners (EN, ES, DE, FR)',
      '400 modules A1 → C2 toutes langues',
      'Flux illimité + Quiz IA',
      'Claude Opus — Sessions illimitées',
      'Role Play & Exam Prep',
      'Rapport de progression détaillé',
      'Leaderboard mensuel',
    ]
  }
}

export const AI_MODES = [
  { id: 'free_talk',  label: 'Free Talk',    icon: '🗣️', plan: 'standard' },
  { id: 'business',   label: 'Business',      icon: '💼', plan: 'standard' },
  { id: 'travel',     label: 'Voyage',        icon: '✈️', plan: 'standard' },
  { id: 'daily_life', label: 'Quotidien',     icon: '🌅', plan: 'standard' },
  { id: 'role_play',  label: 'Role Play',     icon: '🎭', plan: 'premium'  },
  { id: 'exam_prep',  label: 'Exam Prep',     icon: '🎯', plan: 'premium'  },
]

export const PAYMENT_METHODS = [
  { id: 'orange_money', label: 'Orange Money', emoji: '🟠' },
  { id: 'wave',         label: 'Wave',          emoji: '🔵' },
  { id: 'mtn',          label: 'MTN MoMo',      emoji: '🟡' },
  { id: 'card',         label: 'Carte bancaire', emoji: '💳' },
]
