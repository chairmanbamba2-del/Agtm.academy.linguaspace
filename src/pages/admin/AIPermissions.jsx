// ============================================================
// AIPermissions.jsx — Gestion des permissions IA admin LINGUA SPACE
// Route protégée : /admin/ai-permissions
// ============================================================
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { supabase } from '../../lib/supabase'
import { AI_PROVIDERS } from '../../lib/ai-config'
import { formatNumber } from '../../lib/utils'

export default function AIPermissions() {
  const [activeTab, setActiveTab] = useState('permissions')
  const [permissions, setPermissions] = useState([])
  const [globalSettings, setGlobalSettings] = useState({})
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form states
  const [form, setForm] = useState({
    user_id: '',
    plan_type: '',
    ai_provider: 'anthropic',
    ai_model: 'claude-sonnet-4-5',
    is_allowed: true,
    max_tokens_per_day: 10000,
    priority: 10,
    is_default: false,
  })

  // Load data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    setLoading(true)
    await Promise.all([
      loadPermissions().catch(e => console.warn('loadPermissions:', e.message)),
      loadGlobalSettings().catch(e => console.warn('loadGlobalSettings:', e.message)),
      loadUsers().catch(e => console.warn('loadUsers:', e.message)),
    ])
    setLoading(false)
  }

  async function loadPermissions() {
    const { data, error } = await supabase
      .from('lingua_ai_permissions_view')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { setError(error.message); return }
    setPermissions(data || [])
  }

  async function loadGlobalSettings() {
    const { data, error } = await supabase
      .from('lingua_ai_global_settings')
      .select('*')
      .order('setting_key')
    if (error) { setError(error.message); return }
    
    const settings = {}
    data.forEach(s => {
      settings[s.setting_key] = s.setting_value
    })
    setGlobalSettings(settings)
  }

  async function loadUsers() {
    const { data, error } = await supabase
      .from('lingua_users')
      .select('id, email, full_name, role')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) { setError(error.message); return }
    setUsers(data || [])
  }

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle provider change - update model list
  const handleProviderChange = (e) => {
    const provider = e.target.value
    const providerConfig = AI_PROVIDERS[provider]
    const defaultModel = providerConfig?.defaultModel || providerConfig?.models[0]?.id
    
    setForm(prev => ({
      ...prev,
      ai_provider: provider,
      ai_model: defaultModel || ''
    }))
  }

  // Submit permission
  const handleSubmitPermission = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('lingua_ai_permissions')
        .upsert({
          user_id: form.user_id || null,
          plan_type: form.plan_type || null,
          ai_provider: form.ai_provider,
          ai_model: form.ai_model,
          is_allowed: form.is_allowed,
          max_tokens_per_day: parseInt(form.max_tokens_per_day),
          priority: parseInt(form.priority),
          is_default: form.is_default,
        }, {
          onConflict: 'user_id,plan_type,ai_provider,ai_model'
        })
      
      if (error) throw error
      
      alert('Permission enregistrée')
      setForm({
        user_id: '',
        plan_type: '',
        ai_provider: 'anthropic',
        ai_model: 'claude-sonnet-4-5',
        is_allowed: true,
        max_tokens_per_day: 10000,
        priority: 10,
        is_default: false,
      })
      loadPermissions()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  // Delete permission
  const handleDeletePermission = async (id) => {
    if (!confirm('Supprimer cette permission ?')) return
    try {
      const { error } = await supabase
        .from('lingua_ai_permissions')
        .delete()
        .eq('id', id)
      if (error) throw error
      loadPermissions()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  // Update global setting
  const handleUpdateGlobalSetting = async (key, value) => {
    try {
      const { error } = await supabase
        .from('lingua_ai_global_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString(),
        })
      if (error) throw error
      loadGlobalSettings()
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  // Get available models for selected provider
  const getModelsForProvider = (provider) => {
    return AI_PROVIDERS[provider]?.models || []
  }

  // Format permission type
  const getPermissionType = (perm) => {
    if (perm.user_id && !perm.plan_type) return 'Utilisateur spécifique'
    if (!perm.user_id && perm.plan_type) return 'Plan spécifique'
    if (perm.user_id && perm.plan_type) return 'Utilisateur + Plan'
    return 'Général'
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-400">Chargement des permissions IA...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Gestion des Permissions IA</h1>
          <p className="text-gray-400 mt-2">
            Contrôlez l'accès aux modèles IA (Anthropic, Groq, DeepSeek) par utilisateur ou plan
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['permissions', 'global', 'stats'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                  }
                `}
              >
                {tab === 'permissions' && 'Permissions'}
                {tab === 'global' && 'Paramètres globaux'}
                {tab === 'stats' && 'Statistiques'}
              </button>
            ))}
          </nav>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'permissions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Form */}
            <div className="lg:col-span-1">
              <div className="bg-dark-800 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Ajouter/Modifier une permission
                </h2>
                
                <form onSubmit={handleSubmitPermission}>
                  {/* User selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Utilisateur (optionnel)
                    </label>
                    <select
                      name="user_id"
                      value={form.user_id}
                      onChange={handleFormChange}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="">-- Aucun (appliquer au plan) --</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.email} ({user.full_name})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Laisser vide pour appliquer à un plan entier
                    </p>
                  </div>

                  {/* Plan type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Plan (optionnel)
                    </label>
                    <select
                      name="plan_type"
                      value={form.plan_type}
                      onChange={handleFormChange}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="">-- Aucun (appliquer à l'utilisateur) --</option>
                      <option value="uni">UNI (1 langue)</option>
                      <option value="all_access">All Access</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Laisser vide pour appliquer à un utilisateur spécifique
                    </p>
                  </div>

                  {/* Provider */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fournisseur IA
                    </label>
                    <select
                      name="ai_provider"
                      value={form.ai_provider}
                      onChange={handleProviderChange}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      required
                    >
                      {Object.entries(AI_PROVIDERS).map(([id, provider]) => (
                        <option key={id} value={id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Modèle IA
                    </label>
                    <select
                      name="ai_model"
                      value={form.ai_model}
                      onChange={handleFormChange}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      required
                    >
                      {getModelsForProvider(form.ai_provider).map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Settings */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="is_allowed"
                        checked={form.is_allowed}
                        onChange={handleFormChange}
                        className="rounded border-gray-700 bg-dark-700 text-primary"
                      />
                      <span className="text-sm text-gray-300">Accès autorisé</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Décocher pour bloquer l'accès à ce modèle
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={form.is_default}
                        onChange={handleFormChange}
                        className="rounded border-gray-700 bg-dark-700 text-primary"
                      />
                      <span className="text-sm text-gray-300">Modèle par défaut</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Ce modèle sera utilisé par défaut pour cet utilisateur/plan
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Limite quotidienne de tokens
                    </label>
                    <input
                      type="number"
                      name="max_tokens_per_day"
                      value={form.max_tokens_per_day}
                      onChange={handleFormChange}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priorité (plus bas = prioritaire)
                    </label>
                    <input
                      type="number"
                      name="priority"
                      value={form.priority}
                      onChange={handleFormChange}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      min="1"
                      max="100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-3 px-4 rounded-lg transition"
                  >
                    Enregistrer la permission
                  </button>
                </form>
              </div>
            </div>

            {/* Right column: List */}
            <div className="lg:col-span-2">
              <div className="bg-dark-800 rounded-xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Permissions existantes
                  </h2>
                  <button
                    onClick={loadPermissions}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Actualiser
                  </button>
                </div>

                {permissions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Aucune permission configurée</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Ajoutez des permissions pour contrôler l'accès aux modèles IA
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Utilisateur/Plan</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Modèle</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Limite</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Statut</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {permissions.map(perm => (
                          <tr key={perm.id} className="border-b border-gray-800/50 hover:bg-dark-700/50">
                            <td className="py-3 px-4">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-dark-700 text-gray-300">
                                {getPermissionType(perm)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {perm.user_email ? (
                                <div>
                                  <p className="text-white">{perm.user_email}</p>
                                  <p className="text-xs text-gray-500">{perm.user_name}</p>
                                </div>
                              ) : (
                                <span className="text-white">{perm.plan_type?.startsWith('uni') ? 'UNI' : 'All Access'}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-white">
                                  {AI_PROVIDERS[perm.ai_provider]?.name || perm.ai_provider}
                                </p>
                                <p className="text-xs text-gray-500">{perm.ai_model}</p>
                                {perm.is_default && (
                                  <span className="text-xs text-primary mt-1 inline-block">★ Par défaut</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-white">
                                {formatNumber(perm.max_tokens_per_day)}/jour
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${perm.is_allowed ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                                {perm.is_allowed ? 'Autorisé' : 'Bloqué'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleDeletePermission(perm.id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Settings Tab */}
        {activeTab === 'global' && (
          <div className="bg-dark-800 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-6">
              Paramètres globaux IA
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Modèles par défaut</h3>
                
                {[
                  { key: 'default_provider', label: 'Fournisseur par défaut', type: 'select', options: Object.keys(AI_PROVIDERS) },
                  { key: 'default_model', label: 'Modèle par défaut', type: 'text' },
                  { key: 'free_talk_provider', label: 'Fournisseur Free Talk', type: 'select', options: Object.keys(AI_PROVIDERS) },
                  { key: 'free_talk_model', label: 'Modèle Free Talk', type: 'text' },
                  { key: 'business_provider', label: 'Fournisseur Business', type: 'select', options: Object.keys(AI_PROVIDERS) },
                  { key: 'business_model', label: 'Modèle Business', type: 'text' },
                  { key: 'grammar_provider', label: 'Fournisseur Grammar', type: 'select', options: Object.keys(AI_PROVIDERS) },
                  { key: 'grammar_model', label: 'Modèle Grammar', type: 'text' },
                  { key: 'research_provider', label: 'Fournisseur Research', type: 'select', options: Object.keys(AI_PROVIDERS) },
                  { key: 'research_model', label: 'Modèle Research', type: 'text' },
                ].map(setting => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">{setting.label}</label>
                    <div className="w-48">
                      {setting.type === 'select' ? (
                        <select
                          value={globalSettings[setting.key] || ''}
                          onChange={(e) => handleUpdateGlobalSetting(setting.key, e.target.value)}
                          className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm"
                        >
                          {setting.options.map(opt => (
                            <option key={opt} value={opt}>{AI_PROVIDERS[opt]?.name || opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={globalSettings[setting.key] || ''}
                          onChange={(e) => handleUpdateGlobalSetting(setting.key, e.target.value)}
                          className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Limits & Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Limites et fonctionnalités</h3>
                
                {[
                  { key: 'max_tokens_free', label: 'Limite tokens (Free)', type: 'number', suffix: ' tokens/jour' },
                  { key: 'max_tokens_premium', label: 'Limite tokens (Premium)', type: 'number', suffix: ' tokens/jour' },
                  { key: 'enable_web_search', label: 'Recherche web activée', type: 'checkbox' },
                  { key: 'web_search_provider', label: 'Fournisseur recherche web', type: 'select', options: ['tavily', 'brave'] },
                ].map(setting => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">{setting.label}</label>
                    <div className="w-48">
                      {setting.type === 'checkbox' ? (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={globalSettings[setting.key] === 'true'}
                            onChange={(e) => handleUpdateGlobalSetting(setting.key, e.target.checked.toString())}
                            className="rounded border-gray-700 bg-dark-700 text-primary"
                          />
                          <span className="ml-2 text-xs text-gray-400">
                            {globalSettings[setting.key] === 'true' ? 'Activé' : 'Désactivé'}
                          </span>
                        </label>
                      ) : setting.type === 'select' ? (
                        <select
                          value={globalSettings[setting.key] || ''}
                          onChange={(e) => handleUpdateGlobalSetting(setting.key, e.target.value)}
                          className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm"
                        >
                          {setting.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center">
                          <input
                            type={setting.type}
                            value={globalSettings[setting.key] || ''}
                            onChange={(e) => handleUpdateGlobalSetting(setting.key, e.target.value)}
                            className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm"
                          />
                          {setting.suffix && (
                            <span className="ml-2 text-xs text-gray-400">{setting.suffix}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-6 mt-6 border-t border-gray-800">
                  <h3 className="text-lg font-medium text-white mb-4">Informations système</h3>
                  <div className="text-sm text-gray-400 space-y-2">
                    <p>• Les paramètres globaux s'appliquent à tous les utilisateurs</p>
                    <p>• Les permissions spécifiques écrasent les paramètres globaux</p>
                    <p>• Priorité : Utilisateur &gt; Plan &gt; Global</p>
                    <p>• Les limites de tokens sont appliquées quotidiennement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="bg-dark-800 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-6">
              Statistiques d'utilisation IA
            </h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Utilisation par modèle (7 derniers jours)</h3>
              <div className="text-center py-12 text-gray-500">
                <p>Les statistiques détaillées seront disponibles prochainement</p>
                <p className="text-sm mt-2">Suivi des tokens, coûts, et performance des modèles</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-dark-700 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Sessions aujourd'hui</h4>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Tokens utilisés (jour)</h4>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Modèle le plus utilisé</h4>
                <p className="text-3xl font-bold text-white">-</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}