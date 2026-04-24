export const LANGUAGES = {
  en: { code: 'en', name: 'English',    flag: '🇬🇧', corner: 'English Corner',      color: '#C8102E', speechLang: 'en-US' },
  es: { code: 'es', name: 'Español',    flag: '🇪🇸', corner: 'Rincón Español',      color: '#F1BF00', speechLang: 'es-ES' },
  de: { code: 'de', name: 'Deutsch',    flag: '🇩🇪', corner: 'Deutsche Ecke',       color: '#94A3B8', speechLang: 'de-DE' },
  fr: { code: 'fr', name: 'Français',   flag: '🇫🇷', corner: 'Espace Francophone',  color: '#4A7FBF', speechLang: 'fr-FR' },
  ar: { code: 'ar', name: 'العربية',    flag: '🇸🇦', corner: 'الركن العربي',        color: '#059669', speechLang: 'ar-SA' },
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
  uni_monthly: {
    id:       'uni_monthly',
    name:     'LINGUA UNI — Mensuel',
    price:    10000,
    currency: 'FCFA',
    model:    'claude-sonnet-4-20250514',
    sessions: 30,
    color:    '#E8941A',
    period:   'monthly',
    features: [
      '1 Corner au choix (EN, ES, DE, FR, AR)',
      '100 modules A1 → C2',
      'Flux audio/vidéo + Quiz IA',
      'Claude Sonnet — 30 sessions/mois',
      'Test de niveau inclus',
      'Rapport hebdomadaire',
      'Sans engagement — résiliez quand vous voulez',
    ]
  },
  uni_trimestrial: {
    id:       'uni_trimestrial',
    name:     'LINGUA UNI — Trimestriel',
    price:    25000,
    currency: 'FCFA',
    model:    'claude-sonnet-4-20250514',
    sessions: 30,
    color:    '#E8941A',
    period:   'trimestrial',
    badge:    'Économisez 17%',
    features: [
      '1 Corner au choix — 3 mois',
      '100 modules A1 → C2',
      'Flux audio/vidéo + Quiz IA',
      'Claude Sonnet — 30 sessions/mois',
      'Test de niveau inclus',
      'Rapport hebdomadaire',
      'Soit 8 333 FCFA/mois — économisez 5 000 FCFA',
    ]
  },
  all_access_monthly: {
    id:       'all_access_monthly',
    name:     'LINGUA ALL ACCESS — Mensuel',
    price:    30000,
    currency: 'FCFA',
    model:    'claude-opus-4-5',
    sessions: null,
    color:    '#93C5FD',
    period:   'monthly',
    features: [
      'Les 5 Corners (EN, ES, DE, FR, AR)',
      '400 modules A1 → C2 toutes langues',
      'Flux illimité + Quiz IA',
      'Claude Opus — Sessions illimitées',
      'Role Play & Exam Prep',
      'Rapport de progression détaillé',
      'Leaderboard mensuel',
    ]
  },
  all_access_trimestrial: {
    id:       'all_access_trimestrial',
    name:     'LINGUA ALL ACCESS — Trimestriel',
    price:    75000,
    currency: 'FCFA',
    model:    'claude-opus-4-5',
    sessions: null,
    color:    '#93C5FD',
    period:   'trimestrial',
    badge:    'Économisez 17%',
    features: [
      'Les 5 Corners — 3 mois',
      '400 modules A1 → C2 toutes langues',
      'Flux illimité + Quiz IA',
      'Claude Opus — Sessions illimitées',
      'Role Play & Exam Prep',
      'Rapport de progression détaillé',
      'Leaderboard mensuel',
      'Soit 12 333 FCFA/mois — économisez 8 000 FCFA',
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
  { id: 'islamic',    label: 'أستاذ الثقافة', icon: '🕌', plan: 'premium'  },
]

export const PAYMENT_METHODS = [
  { id: 'orange_money', label: 'Orange Money', emoji: '🟠' },
  { id: 'wave',         label: 'Wave',          emoji: '🔵' },
  { id: 'mtn',          label: 'MTN MoMo',      emoji: '🟡' },
  { id: 'card',         label: 'Carte bancaire', emoji: '💳' },
]
