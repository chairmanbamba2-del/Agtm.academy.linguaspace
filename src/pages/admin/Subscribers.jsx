// ============================================================
// Subscribers.jsx — Gestion des abonnés admin LINGUA SPACE
// Route protégée : /admin/subscribers
// ============================================================
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { supabase } from '../../lib/supabase'
import { formatDate, formatNumber } from '../../lib/utils'
import { admin } from '../../lib/admin'

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('active')
  const [expiringSoon, setExpiringSoon] = useState([])

  useEffect(() => {
    loadSubscribers()
    loadExpiringSoon()
  }, [page, filterPlan, filterStatus])

  async function loadSubscribers() {
    try {
      setLoading(true)
      let query = supabase
        .from('lingua_subscriptions')
        .select('*', { count: 'exact' })
        .order('expires_at', { ascending: true, nulls_last: true })
        .range((page - 1) * 20, page * 20 - 1)

      if (filterPlan !== 'all') query = query.eq('plan_type', filterPlan)
      if (filterStatus !== 'all') query = query.eq('status', filterStatus)

      const { data, count, error } = await query
      if (error) throw error

      // Joindre manuellement les infos utilisateur
      const userIds = [...new Set((data || []).map(s => s.user_id).filter(Boolean))]
      let userMap = {}
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('lingua_users')
          .select('id, email, full_name, phone')
          .in('id', userIds)
        if (users) {
          users.forEach(u => { userMap[u.id] = u })
        }
      }

      let enriched = (data || []).map(s => ({
        ...s,
        lingua_users: userMap[s.user_id] || null,
      }))

      // Filtre client si search
      if (search) {
        const q = search.toLowerCase()
        enriched = enriched.filter(s => {
          const u = s.lingua_users
          return (u?.email?.toLowerCase() || '').includes(q) ||
                 (u?.full_name?.toLowerCase() || '').includes(q)
        })
      }

      setSubscribers(enriched)
    } catch (err) {
      if (!err.message?.includes('range')) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadExpiringSoon() {
    try {
      const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('lingua_subscriptions')
        .select('*')
        .eq('status', 'active')
        .lt('expires_at', in7days)
        .order('expires_at', { ascending: true })
        .limit(20)
      setExpiringSoon(data || [])
    } catch (e) {
      console.warn('loadExpiringSoon:', e.message)
    }
  }

  const handleExtend = async (subscriptionId, userId, months = 1) => {
    if (!confirm(`Prolonger l'abonnement de ${months} mois ?`)) return
    try {
      await admin.updateSubscription({ subscriptionId, userId, months })
      alert('Abonnement prolongé')
      loadSubscribers()
      loadExpiringSoon()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const handleUpgrade = async (subscriptionId, userId) => {
    if (!confirm('Upgrader vers ALL ACCESS ?')) return
    try {
      await admin.upgradeSubscription(subscriptionId, userId)
      alert('Upgrade effectué')
      loadSubscribers()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const handleSuspend = async (userId) => {
    if (!confirm('Suspendre cet abonné ?')) return
    try {
      await admin.suspendUser(userId, 'Suspended by admin')
      alert('Utilisateur suspendu')
      loadSubscribers()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const handleReactivate = async (userId) => {
    try {
      await admin.reactivateUser(userId)
      alert('Utilisateur réactivé')
      loadSubscribers()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const handleCreateSubscription = async () => {
    const userId = prompt('ID utilisateur (email ou ID) :')
    if (!userId) return
    const planType = prompt('Plan (uni / all_access) :', 'uni')
    const selectedLanguage = planType === 'uni' ? prompt('Langue (en, es, de, fr) :', 'en') : null
    const months = parseInt(prompt('Durée (mois) :', '1'))
    const paymentMode = prompt('Mode paiement (orange_money, wave, mtn, card, manual, free) :', 'manual')
    const notes = prompt('Notes (optionnel) :', '')
    try {
      // Need to find user ID if email provided
      let targetUserId = userId
      if (userId.includes('@')) {
        // Assume it's email
        const { data } = await supabase
          .from('lingua_users')
          .select('id')
          .eq('email', userId)
          .single()
        if (data) targetUserId = data.id
        else throw new Error('Utilisateur non trouvé')
      }
      await admin.createSubscription({
        userId: targetUserId,
        planType,
        selectedLanguage,
        paymentMode,
        notes,
        months,
      })
      alert('Abonnement créé')
      loadSubscribers()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const runExpireSubscriptions = async () => {
    if (!confirm('Exécuter la fonction d\'expiration des abonnements ?')) return
    try {
      const { error } = await supabase.rpc('expire_subscriptions')
      if (error) throw error
      alert('Fonction exécutée')
      loadSubscribers()
      loadExpiringSoon()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const plans = ['uni', 'all_access']
  const statuses = ['active', 'expired', 'suspended']

  return (
    <AppLayout>
      <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-1">Administration</div>
      <h1 className="font-serif text-3xl text-white mb-2">Gestion des <em className="text-gold italic">Abonnés</em></h1>
      <p className="text-muted mb-8">Visualisez, prolongez, suspendez et gérez les abonnements LINGUA SPACE.</p>

      {/* Toolbar */}
      <div className="card p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 flex-1">
            <input
              type="text"
              placeholder="Rechercher par email, nom..."
              className="input flex-1 min-w-60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadSubscribers()}
            />
            <select className="input" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
              <option value="all">Tous les forfaits</option>
              {plans.map(p => <option key={p} value={p}>{p === 'all_access' ? 'ALL ACCESS' : 'UNI'}</option>)}
            </select>
            <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tous les statuts</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={loadSubscribers} className="btn bg-blue text-white">
              🔍 Rechercher
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateSubscription} className="btn bg-gold text-dark font-semibold">
              + Créer abonnement
            </button>
            <button onClick={runExpireSubscriptions} className="btn bg-red text-white font-semibold">
              ⏰ Expirer abonnements
            </button>
          </div>
        </div>
      </div>

      {/* Expiring soon */}
      {expiringSoon.length > 0 && (
        <div className="card p-5 mb-6 border-red/30 bg-red/5">
          <h3 className="font-serif text-lg text-white mb-3">⚠️ Abonnements expirant bientôt (7 jours)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiringSoon.map(s => (
              <div key={s.id} className="p-3 bg-white/5 rounded border border-red/20">
                <div className="font-medium text-white">{s.lingua_users?.full_name || s.lingua_users?.email}</div>
                <div className="text-xs text-muted">Expire le {formatDate(s.expires_at)}</div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleExtend(s.id, s.user_id, 1)}
                    className="text-xs px-2 py-1 bg-gold/20 hover:bg-gold/30 text-gold rounded-sm"
                  >
                    +1 mois
                  </button>
                  <button
                    onClick={() => handleExtend(s.id, s.user_id, 3)}
                    className="text-xs px-2 py-1 bg-blue/20 hover:bg-blue/30 text-blue rounded-sm"
                  >
                    +3 mois
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {error && (
        <div className="card p-5 mb-6 border-red/30 bg-red/5 text-red">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted">
          Chargement des abonnés...
        </div>
      ) : subscribers.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          <div className="text-4xl mb-4">👥</div>
          <div className="text-lg mb-2">Aucun abonné trouvé</div>
          <div className="text-sm">Essayez de modifier vos filtres ou créez un nouvel abonnement.</div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted text-xs font-mono tracking-wider border-b border-white/10">
                  <th className="pb-3 px-2">Utilisateur</th>
                  <th className="pb-3 px-2">Forfait</th>
                  <th className="pb-3 px-2">Langue</th>
                  <th className="pb-3 px-2">Début</th>
                  <th className="pb-3 px-2">Expiration</th>
                  <th className="pb-3 px-2">Statut</th>
                  <th className="pb-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map(s => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="py-4 px-2">
                      <div className="font-medium text-white">{s.full_name || '—'}</div>
                      <div className="text-xs text-muted">{s.email}</div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider ${
                        s.plan_type?.startsWith('all_access') ? 'bg-blue/20 text-blue' :
                        'bg-gold/20 text-gold'
                      }`}>
                        {s.plan_type?.startsWith('all_access') ? 'ALL ACCESS' : 'UNI'}
                        {s.plan_type?.includes('trimestrial') && <span className="ml-1 opacity-60">T</span>}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-sm text-white">
                      {s.selected_language?.toUpperCase() || '4 langues'}
                    </td>
                    <td className="py-4 px-2 text-sm text-muted">
                      {formatDate(s.started_at)}
                    </td>
                    <td className="py-4 px-2 text-sm text-muted">
                      {formatDate(s.expires_at)}
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider ${
                        s.status === 'active' ? 'bg-green/20 text-green' :
                        s.status === 'expired' ? 'bg-red/20 text-red' :
                        'bg-muted/20 text-muted'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExtend(s.subscription_id, s.user_id, 1)}
                          className="text-xs px-3 py-1 bg-gold/20 hover:bg-gold/30 text-gold rounded-sm transition-colors"
                        >
                          +1 mois
                        </button>
                        {s.plan_type?.startsWith('uni') && (
                          <button
                            onClick={() => handleUpgrade(s.subscription_id, s.user_id)}
                            className="text-xs px-3 py-1 bg-blue/20 hover:bg-blue/30 text-blue rounded-sm transition-colors"
                          >
                            ↑ ALL ACCESS
                          </button>
                        )}
                        {s.status === 'active' ? (
                          <button
                            onClick={() => handleSuspend(s.user_id)}
                            className="text-xs px-3 py-1 bg-red/20 hover:bg-red/30 text-red rounded-sm transition-colors"
                          >
                            ⏸️ Suspendre
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(s.user_id)}
                            className="text-xs px-3 py-1 bg-green/20 hover:bg-green/30 text-green rounded-sm transition-colors"
                          >
                            ▶️ Réactiver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 text-sm text-muted">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-sm disabled:opacity-30"
            >
              ← Précédent
            </button>
            <div>Page {page}</div>
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-sm"
            >
              Suivant →
            </button>
          </div>
        </>
      )}
    </AppLayout>
  )
}