import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function adminCall(action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, payload }),
  })
  if (!res.ok) {
    const e = await res.json()
    throw new Error(e.error || 'Erreur admin')
  }
  return res.json()
}

export const admin = {
  // Utilisateurs
  listUsers:          (payload) => adminCall('list_users', payload),
  createUser:         (payload) => adminCall('create_user', payload),
  suspendUser:        (userId, reason) => adminCall('suspend_user', { userId, reason }),
  reactivateUser:     (userId) => adminCall('reactivate_user', { userId }),

  // Abonnements
  updateSubscription: (payload) => adminCall('update_subscription', payload),
  upgradeSubscription:(subscriptionId, userId) =>
    adminCall('upgrade_subscription', { subscriptionId, userId }),
}