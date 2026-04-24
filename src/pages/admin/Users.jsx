// ============================================================
// Users.jsx — Gestion des utilisateurs admin LINGUA SPACE
// Route protégée : /admin/users
// ============================================================
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { admin } from '../../lib/admin'
import { formatNumber } from '../../lib/utils'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [page, filterRole, filterStatus])

  async function loadUsers() {
    try {
      setLoading(true)
      const payload = {
        page,
        per_page: 20,
        search,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      }
      const data = await admin.listUsers(payload)
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (userId) => {
    if (!confirm('Suspendre cet utilisateur ?')) return
    try {
      await admin.suspendUser(userId, 'Suspended by admin')
      alert('Utilisateur suspendu')
      loadUsers()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const handleReactivate = async (userId) => {
    try {
      await admin.reactivateUser(userId)
      alert('Utilisateur réactivé')
      loadUsers()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const handleCreateUser = async () => {
    const email = prompt('Email du nouvel utilisateur :')
    if (!email) return
    const password = prompt('Mot de passe temporaire :')
    if (!password) return
    const role = prompt('Rôle (user, admin, super_admin) :', 'user')
    const fullName = prompt('Nom complet (optionnel) :', '')
    const phone = prompt('Téléphone (optionnel) :', '')
    const planType = prompt('Forfait (uni / all_access / vide pour aucun) :', '')
    let selectedLanguage = null
    let paymentMode = 'manual'
    let notes = ''
    if (planType) {
      if (planType === 'uni') {
        selectedLanguage = prompt('Langue (en, es, de, fr) :', 'en')
      }
      paymentMode = prompt('Mode paiement (orange_money, wave, mtn, card, manual, free) :', 'manual')
      notes = prompt('Notes (optionnel) :', '')
    }
    try {
      await admin.createUser({ 
        email, 
        password, 
        role,
        fullName: fullName || undefined,
        phone: phone || undefined,
        planType: planType || undefined,
        selectedLanguage: selectedLanguage || undefined,
        paymentMode: paymentMode || undefined,
        notes: notes || undefined,
      })
      alert('Utilisateur créé' + (planType ? ' avec abonnement' : ''))
      loadUsers()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const handleCreateSubscriptionForUser = async (userId) => {
    const planType = prompt('Plan (uni / all_access) :', 'uni')
    const selectedLanguage = planType === 'uni' ? prompt('Langue (en, es, de, fr) :', 'en') : null
    const months = parseInt(prompt('Durée (mois) :', '1'))
    const paymentMode = prompt('Mode paiement (orange_money, wave, mtn, card, manual, free) :', 'manual')
    const notes = prompt('Notes (optionnel) :', '')
    try {
      await admin.createSubscription({
        userId,
        planType,
        selectedLanguage,
        paymentMode,
        notes,
        months,
      })
      alert('Abonnement créé')
      loadUsers()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const roles = ['user', 'admin', 'super_admin']
  const statuses = ['active', 'suspended', 'inactive']

  return (
    <AppLayout>
      <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-1">Administration</div>
      <h1 className="font-serif text-3xl text-white mb-2">Gestion des <em className="text-gold italic">Utilisateurs</em></h1>
      <p className="text-muted mb-8">Créez, modifiez et gérez les utilisateurs LINGUA SPACE.</p>

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
              onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
            />
            <select className="input" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">Tous les rôles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tous les statuts</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={loadUsers} className="btn bg-blue text-white">
              🔍 Rechercher
            </button>
          </div>
          <button onClick={handleCreateUser} className="btn bg-gold text-dark font-semibold">
            + Créer utilisateur
          </button>
        </div>
      </div>

      {/* Table */}
      {error && (
        <div className="card p-5 mb-6 border-red/30 bg-red/5 text-red">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted">
          Chargement des utilisateurs...
        </div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          <div className="text-4xl mb-4">👥</div>
          <div className="text-lg mb-2">Aucun utilisateur trouvé</div>
          <div className="text-sm">Essayez de modifier vos filtres ou créez un nouvel utilisateur.</div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted text-xs font-mono tracking-wider border-b border-white/10">
                  <th className="pb-3 px-2">Utilisateur</th>
                  <th className="pb-3 px-2">Rôle</th>
                  <th className="pb-3 px-2">Statut</th>
                  <th className="pb-3 px-2">Créé le</th>
                  <th className="pb-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="py-4 px-2">
                      <div className="font-medium text-white">{u.email}</div>
                      <div className="text-xs text-muted">{u.full_name || '—'}</div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider ${
                        u.role === 'super_admin' ? 'bg-purple/20 text-purple' :
                        u.role === 'admin' ? 'bg-blue/20 text-blue' :
                        'bg-green/20 text-green'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider ${
                        u.status === 'active' ? 'bg-green/20 text-green' :
                        u.status === 'suspended' ? 'bg-red/20 text-red' :
                        'bg-muted/20 text-muted'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-sm text-muted">
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </td>
                     <td className="py-4 px-2">
                       <div className="flex gap-2">
                         <button
                           onClick={() => handleCreateSubscriptionForUser(u.id)}
                           className="text-xs px-3 py-1 bg-gold/20 hover:bg-gold/30 text-gold rounded-sm transition-colors"
                         >
                           ➕ Abo
                         </button>
                         <button
                           onClick={() => alert(`Détails: ${JSON.stringify(u, null, 2)}`)}
                           className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-sm transition-colors"
                         >
                           👁️ Voir
                         </button>
                         {u.status === 'active' ? (
                           <button
                             onClick={() => handleSuspend(u.id)}
                             className="text-xs px-3 py-1 bg-red/20 hover:bg-red/30 text-red rounded-sm transition-colors"
                           >
                             ⏸️ Suspendre
                           </button>
                         ) : (
                           <button
                             onClick={() => handleReactivate(u.id)}
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