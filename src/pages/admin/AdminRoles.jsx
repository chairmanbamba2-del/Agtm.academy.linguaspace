import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AppLayout from '../../components/layout/AppLayout'
import MasterCard from '../../components/ui/MasterCard'

const ALL_PERMISSIONS = [
  { id: 'users.read',         label: 'Lecture utilisateurs',    group: 'Utilisateurs' },
  { id: 'users.write',        label: 'Écriture utilisateurs',   group: 'Utilisateurs' },
  { id: 'finance.read',       label: 'Lecture finances',        group: 'Finance' },
  { id: 'finance.write',      label: 'Écriture finances',       group: 'Finance' },
  { id: 'marketing',          label: 'Marketing',               group: 'Marketing' },
  { id: 'certifications',     label: 'Certifications',          group: 'Certifications' },
  { id: 'certifications.read',label: 'Lecture certifications',  group: 'Certifications' },
  { id: 'messaging',          label: 'Messagerie',              group: 'Messagerie' },
  { id: 'ai_permissions',     label: 'Permissions IA',          group: 'IA' },
  { id: 'docs',               label: 'Documentation',           group: 'Documentation' },
  { id: 'admin_roles',        label: 'Gestion des rôles',       group: 'Administration' },
]

const PERMISSION_GROUPS = [...new Set(ALL_PERMISSIONS.map(p => p.group))]

export default function AdminRoles() {
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editRole, setEditRole] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', permissions: [] })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [rolesRes, usersRes] = await Promise.all([
      supabase.from('lingua_admin_roles').select('*').order('name'),
      supabase.from('lingua_users').select('id, full_name, email, role, admin_role_id').order('full_name'),
    ])
    if (rolesRes.error) setError(rolesRes.error.message)
    else setRoles(rolesRes.data || [])
    setUsers(usersRes.data || [])
    setLoading(false)
  }

  function resetForm() { setForm({ name: '', description: '', permissions: [] }); setEditRole(null) }

  function openEdit(role) {
    setEditRole(role.id)
    setForm({ name: role.name, description: role.description, permissions: role.permissions || [] })
  }

  function togglePermission(permId) {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(permId)
        ? f.permissions.filter(p => p !== permId)
        : [...f.permissions, permId]
    }))
  }

  async function saveRole() {
    if (!form.name.trim()) return
    if (editRole) {
      await supabase.from('lingua_admin_roles').update(form).eq('id', editRole)
    } else {
      await supabase.from('lingua_admin_roles').insert(form)
    }
    resetForm(); loadData()
  }

  async function deleteRole(id) {
    if (!confirm('Supprimer ce rôle ?')) return
    await supabase.from('lingua_admin_roles').delete().eq('id', id)
    loadData()
  }

  async function assignRole(userId, roleId) {
    await supabase.from('lingua_users').update({ admin_role_id: roleId || null }).eq('id', userId)
    loadData()
  }

  return (
    <AppLayout>
      <div className="max-w-5xl">
        <h1 className="font-serif text-2xl text-white mb-1">Rôles administrateurs</h1>
        <p className="text-sm text-muted mb-6">Gérez les rôles et permissions des administrateurs</p>

        {error && (
          <div className="text-xs px-4 py-2.5 rounded-card mb-4" style={{ color: '#F87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Formulaire */}
        <MasterCard variant="content" padding="sm" className="mb-6">
          <h2 className="text-sm font-medium text-white mb-3">{editRole ? 'Modifier le rôle' : 'Nouveau rôle'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">Nom du rôle</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full text-sm text-white bg-white/5 border border-white/10 rounded-sm px-3 py-2 focus:outline-none focus:border-gold/30" />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">Description</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full text-sm text-white bg-white/5 border border-white/10 rounded-sm px-3 py-2 focus:outline-none focus:border-gold/30" />
            </div>
          </div>

          <label className="text-[10px] text-muted uppercase tracking-wider block mb-2">Permissions</label>
          <div className="space-y-3 mb-4">
            {PERMISSION_GROUPS.map(group => (
              <div key={group}>
                <p className="text-[9px] font-mono text-muted/60 uppercase tracking-wider mb-1">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_PERMISSIONS.filter(p => p.group === group).map(p => (
                    <button key={p.id} onClick={() => togglePermission(p.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-sm transition-all ${form.permissions.includes(p.id)
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'bg-white/5 text-muted border border-white/10 hover:bg-white/10'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={saveRole} disabled={!form.name.trim()}
              className="text-xs px-4 py-2 bg-gold/20 text-gold rounded-sm hover:bg-gold/30 disabled:opacity-30">
              {editRole ? 'Mettre à jour' : 'Créer le rôle'}
            </button>
            {editRole && (
              <button onClick={resetForm} className="text-xs px-4 py-2 bg-white/5 text-muted rounded-sm hover:bg-white/10">Annuler</button>
            )}
          </div>
        </MasterCard>

        {/* Liste des rôles */}
        <MasterCard variant="content" padding="sm" className="mb-6">
          <h2 className="text-sm font-medium text-white mb-3">Rôles existants</h2>
          <div className="space-y-2">
            {roles.map(role => (
              <div key={role.id} className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-sm">
                <div>
                  <span className="text-sm text-white font-medium">{role.name}</span>
                  <span className="text-[10px] text-muted ml-2">{role.description}</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(role.permissions || []).map(p => {
                      const perm = ALL_PERMISSIONS.find(x => x.id === p)
                      return perm ? (
                        <span key={p} className="text-[8px] px-1.5 py-0.5 bg-gold/10 text-gold/70 rounded-sm">{perm.label}</span>
                      ) : null
                    })}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(role)} className="text-[10px] px-2 py-1 bg-white/5 text-muted rounded-sm hover:bg-white/10">✏️</button>
                  <button onClick={() => deleteRole(role.id)} className="text-[10px] px-2 py-1 bg-red/10 text-red rounded-sm hover:bg-red/20">🗑️</button>
                </div>
              </div>
            ))}
            {roles.length === 0 && <p className="text-xs text-muted py-4 text-center">Aucun rôle défini</p>}
          </div>
        </MasterCard>

        {/* Attribution */}
        <MasterCard variant="content" padding="sm">
          <h2 className="text-sm font-medium text-white mb-3">Attribution aux administrateurs</h2>
          <div className="space-y-1">
            {users.filter(u => u.role === 'admin' || u.role === 'super_admin').map(u => (
              <div key={u.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-sm">
                <div>
                  <span className="text-sm text-white">{u.full_name || u.email}</span>
                  <span className="text-[10px] text-muted ml-2">{u.email}</span>
                  <span className="text-[9px] ml-2 px-1.5 py-0.5 rounded-sm"
                    style={{ background: u.role === 'super_admin' ? 'rgba(232,148,26,0.15)' : 'rgba(59,130,246,0.15)', color: u.role === 'super_admin' ? '#E8941A' : '#60A5FA' }}>
                    {u.role}
                  </span>
                </div>
                <select value={u.admin_role_id || ''} onChange={e => assignRole(u.id, e.target.value || null)}
                  className="text-xs bg-white/5 text-white border border-white/10 rounded-sm px-2 py-1 focus:outline-none">
                  <option value="">Aucun rôle</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            ))}
            {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length === 0 && (
              <p className="text-xs text-muted py-4 text-center">Aucun administrateur</p>
            )}
          </div>
        </MasterCard>
      </div>
    </AppLayout>
  )
}
