import { useUserStore, checkAccess, getAccessibleLanguages } from '../store/userStore'

export function useSubscription() {
  const subscription = useUserStore(s => s.subscription)

  // ✅ MODE DEV — abonnement fictif pour tester sans payer
  const isDev = import.meta.env.VITE_APP_ENV === 'development'

  const devSubscription = {
    status:            'active',
    plan_type:         'all_access',
    selected_language: null,
  }

  const activeSub = isDev ? devSubscription : subscription

  const isActive  = isDev ? true : activeSub?.status === 'active'
  const isPremium = isDev ? true : activeSub?.plan_type === 'all_access'
  const isStandard= isDev ? false : activeSub?.plan_type === 'uni'
  const languages = isDev ? ['en', 'es', 'de', 'fr'] : getAccessibleLanguages(activeSub)
  const can       = (feature) => isDev ? true : checkAccess(activeSub, feature)
  const daysLeft  = isDev ? 30 : (activeSub?.expires_at
    ? Math.max(0, Math.ceil((new Date(activeSub.expires_at) - new Date()) / 86400000))
    : 0)

  return { subscription: activeSub, isActive, isPremium, isStandard, languages, can, daysLeft }
}
