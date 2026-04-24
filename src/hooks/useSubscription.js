import { useUserStore, checkAccess, getAccessibleLanguages } from '../store/userStore'

export function useSubscription() {
  const subscription = useUserStore(s => s.subscription)
  const isAdmin      = useUserStore(s => s.isAdmin)

  const isSuperUser = isAdmin

  const devSubscription = {
    status:            'active',
    plan_type:         'all_access',
    selected_language: null,
  }

  const freeSubscription = {
    status:            'inactive',
    plan_type:         'free',
    selected_language: null,
  }

  // Déterminer l'abonnement actif avec fallback
  let activeSub
  if (isSuperUser) {
    activeSub = devSubscription
  } else if (subscription) {
    activeSub = subscription
  } else {
    // Pas d'abonnement trouvé (chargé) ou erreur de fetch
    activeSub = freeSubscription
  }

  const isActive  = isSuperUser ? true : activeSub?.status === 'active'
  const isPremium = isSuperUser ? true : activeSub?.plan_type?.startsWith('all_access')
  const isStandard= isSuperUser ? false : (activeSub?.plan_type?.startsWith('uni') || activeSub?.plan_type === 'a_la_carte')
  const isALaCarte = activeSub?.plan_type === 'a_la_carte'
  const languages = isSuperUser ? ['en', 'es', 'de', 'fr', 'ar'] : (getAccessibleLanguages(activeSub).length > 0 ? getAccessibleLanguages(activeSub) : ['en'])
  const can       = (feature) => isSuperUser ? true : checkAccess(activeSub, feature)
  const daysLeft  = isSuperUser ? 30 : (activeSub?.expires_at
    ? Math.max(0, Math.ceil((new Date(activeSub.expires_at) - new Date()) / 86400000))
    : 0)
  
  // Plan type pour un usage simple
  const plan = activeSub?.plan_type || 'free'
  // Le hook ne fait pas de fetch lui-même, donc loading = false
  const loading = false

  return { 
    subscription: activeSub, 
    isActive, 
    isPremium, 
    isStandard, 
    isALaCarte,
    languages, 
    can, 
    daysLeft,
    plan,
    loading
  }
}
