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

  // Reset complet (déconnexion)
  reset: () => set({
    user: null, linguaUser: null,
    subscription: null, progress: [],
    isAdmin: false, loading: false
  })
}))

// ─── Sélecteurs utiles ─────────────────────────────────────

// Vérifie l'accès à une fonctionnalité selon l'abonnement
export function checkAccess(subscription, feature) {
  if (!subscription || subscription.status !== 'active') return false

  const planKey = subscription.plan_type === 'uni'
    ? `uni_${subscription.selected_language}`
    : 'all_access'

  const rules = {
    'corner_en':   ['uni_en',  'all_access'],
    'corner_es':   ['uni_es',  'all_access'],
    'corner_de':   ['uni_de',  'all_access'],
    'corner_fr':   ['uni_fr',  'all_access'],
    'ai_chat':     ['uni_en', 'uni_es', 'uni_de', 'uni_fr', 'all_access'],
    'ai_premium':  ['all_access'],
    'role_play':   ['all_access'],
    'exam_prep':   ['all_access'],
    'all_languages':['all_access'],
  }

  return rules[feature]?.includes(planKey) ?? false
}

// Retourne les langues accessibles selon l'abonnement
export function getAccessibleLanguages(subscription) {
  if (!subscription || subscription.status !== 'active') return []
  if (subscription.plan_type === 'all_access') return ['en', 'es', 'de', 'fr']
  return [subscription.selected_language]
}
