import { create } from 'zustand'

export const useUserStore = create((set) => ({
  // Auth
  user:         null,
  loading:      true,
  setUser:      (user)    => set({ user }),
  setLoading:   (loading) => set({ loading }),

  // Profil LINGUA
  linguaUser:     null,
  subscription:   null,
  progress:       [],
  isAdmin:        false,
  setLinguaUser:  (linguaUser)   => set({ 
    linguaUser,
    isAdmin: linguaUser?.role === 'admin' || linguaUser?.role === 'super_admin'
  }),
  setSubscription:(subscription) => set({ subscription }),
  setProgress:    (progress)     => set({ progress }),

  // UI
  currentLanguage: 'en',
  setCurrentLanguage: (lang) => set({ currentLanguage: lang }),

  // Native language (langue maternelle, pour le coach adaptatif)
  nativeLanguage: null,
  setNativeLanguage: (lang) => set({ nativeLanguage: lang }),

  // Reset complet (déconnexion)
  reset: () => set({
    user: null, linguaUser: null,
    subscription: null, progress: [],
    isAdmin: false, loading: false,
    nativeLanguage: null
  })
}))

// ─── Sélecteurs utiles ─────────────────────────────────────

// Vérifie l'accès à une fonctionnalité selon l'abonnement
export function checkAccess(subscription, feature) {
  if (!subscription || subscription.status !== 'active') return false

  const planType = subscription.plan_type || ''
  const languages = getAccessibleLanguages(subscription)

  if (feature.startsWith('corner_')) {
    const lang = feature.replace('corner_', '')
    return languages.includes(lang)
  }

  if (feature === 'ai_chat') return true

  if (['ai_premium', 'role_play', 'exam_prep'].includes(feature)) {
    return planType.startsWith('all_access')
  }

  if (feature === 'all_languages') {
    return planType.startsWith('all_access')
  }

  return false
}

// Retourne les langues accessibles selon l'abonnement
export function getAccessibleLanguages(subscription) {
  if (!subscription || subscription.status !== 'active') return []

  const planType = subscription.plan_type || ''

  if (planType.startsWith('all_access')) return ['en', 'es', 'de', 'fr', 'ar']

  if (planType === 'a_la_carte') {
    const langs = subscription.selected_language || ''
    return langs.split(',').map(l => l.trim()).filter(Boolean)
  }

  if (planType.startsWith('uni')) {
    if (subscription.selected_language) return [subscription.selected_language]
  }

  return []
}
