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
  listUsers: async (payload = {}) => {
    const { page = 1, per_page = 20, search, role, status } = payload
    const offset = (page - 1) * per_page
    let query = supabase
      .from('lingua_users')
      .select('id, email, full_name, phone, role, status, created_at, suspended_at, suspended_reason', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1)
    if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    if (status && status !== 'all') query = query.eq('status', status)
    if (role && role !== 'all') query = query.eq('role', role)
    const { data, error, count } = await query
    if (error) {
      if (error.message?.includes('range') || error.code === '416') {
        return { users: [], total: 0, page, per_page }
      }
      throw new Error(error.message)
    }
    return { users: data || [], total: count || 0, page, per_page }
  },
  createUser:         (payload) => adminCall('create_user', payload),
  suspendUser:        (userId, reason) => adminCall('suspend_user', { userId, reason }),
  reactivateUser:     (userId) => adminCall('reactivate_user', { userId }),

  // Abonnements
  createSubscription: (payload) => adminCall('create_subscription', payload),
  updateSubscription: (payload) => adminCall('update_subscription', payload),
  upgradeSubscription:(subscriptionId, userId) =>
    adminCall('upgrade_subscription', { subscriptionId, userId }),

  // Transactions
  addManualTransaction: (payload) => adminCall('add_manual_transaction', payload),
}