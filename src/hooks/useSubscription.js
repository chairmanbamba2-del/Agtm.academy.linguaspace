import { useUserStore, checkAccess, getAccessibleLanguages } from '../store/userStore'

export function useSubscription() {
  const subscription = useUserStore(s => s.subscription)
  const isAdmin      = useUserStore(s => s.isAdmin)

  const isDev = import.meta.env.VITE_APP_ENV === 'development'
  const isSuperUser = isDev || isAdmin

  const devSubscription = {
    status:            'active',
    plan_type:         'all_access',
    selected_language: null,
  }

  const activeSub = isSuperUser ? devSubscription : subscription

  const isActive  = isSuperUser ? true : activeSub?.status === 'active'
  const isPremium = isSuperUser ? true : activeSub?.plan_type === 'all_access'
  const isStandard= isSuperUser ? false : activeSub?.plan_type === 'uni'
  const languages = isSuperUser ? ['en', 'es', 'de', 'fr'] : getAccessibleLanguages(activeSub)
  const can       = (feature) => isSuperUser ? true : checkAccess(activeSub, feature)
  const daysLeft  = isSuperUser ? 30 : (activeSub?.expires_at
    ? Math.max(0, Math.ceil((new Date(activeSub.expires_at) - new Date()) / 86400000))
    : 0)

  return { subscription: activeSub, isActive, isPremium, isStandard, languages, can, daysLeft }
}
