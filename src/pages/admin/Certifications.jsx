import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { supabase } from '../../lib/supabase'
import { AI_PROVIDERS } from '../../lib/ai-config'
import { formatDate } from '../../lib/utils'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const LANGUAGES = [
  { code: 'en', label: 'Anglais', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Espagnol', flag: '🇪🇸' },
  { code: 'de', label: 'Allemand', flag: '🇩🇪' },
  { code: 'ar', label: 'Arabe', flag: '🕌' },
]
const CATEGORIES = [
  { value: '', label: '— Standard —' },
  { value: 'langue', label: '🌐 Langue générale' },
  { value: 'culture_arabe', label: '🕌 Culture arabe' },
  { value: 'connaissance_monde_arabe', label: '🌍 Connaissance du monde arabe' },
  { value: 'ramadan', label: '☪️ Ramadan & pratiques' },
  { value: 'art_cuisine', label: '🎨 Art, cuisine & patrimoine' },
  { value: 'histoire_geo', label: '📜 Histoire & géographie' },
  { value: 'famille_societe', label: '👨‍👩‍👧‍👦 Famille & société' },
]

export default function AdminCertifications() {
  const navigate = useNavigate()
  const [certs, setCerts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [mode, setMode] = useState('list')

  const [form, setForm] = useState({
    user_id: '',
    language: 'en',
    category: '',
    level: 'A1',
    score_listening: 75,
    score_reading: 75,
    score_grammar: 75,
    score_writing: 75,
    recipient_name: '',
    native_language: '',
  })

  useEffect(() => {
    loadCerts()
    loadUsers()
  }, [page])

  async function loadCerts() {
    try {
      const { data, error } = await supabase
        .from('lingua_certificates')
        .select('*, lingua_users(email, full_name)')
        .order('created_at', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1)
      if (error && !error.message?.includes('range')) throw error
      setCerts(data || [])
    } catch (err) {
      if (!err.message?.includes('range')) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    try {
      const { data } = await supabase
        .from('lingua_users')
        .select('id, email, full_name')
        .order('created_at', { ascending: false })
        .limit(200)
      setUsers(data || [])
    } catch (e) {
      console.warn(e.message)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId)
    setForm(prev => ({
      ...prev,
      user_id: userId,
      recipient_name: user?.full_name || user?.email || '',
    }))
  }

  const calcGlobal = () => {
    const { score_listening, score_reading, score_grammar, score_writing } = form
    return Math.round(
      parseInt(score_listening) * 0.35 +
      parseInt(score_reading) * 0.30 +
      parseInt(score_grammar) * 0.25 +
      parseInt(score_writing) * 0.10
    )
  }

  const [aiLoading, setAiLoading] = useState(false)

  const handleAIEvaluate = async (provider = 'deepseek') => {
    const user = users.find(u => u.id === form.user_id)
    const langLabel = LANGUAGES.find(l => l.code === form.language)?.label || form.language
    setAiLoading(true)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${supabaseUrl}/functions/v1/lingua-ai-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          provider,
          model: provider === 'deepseek' ? 'deepseek-chat' : 'claude-sonnet-4-5',
          sessionType: 'research',
          messages: [{
            role: 'user',
            content: `Tu es un expert en certification linguistique. Un administrateur prépare un certificat de langue.

Étudiant: ${user?.full_name || 'Inconnu'}
Langue: ${langLabel} (${form.language})
Niveau visé: ${form.level}

Génère des scores réalistes (0-100) pour les 4 compétences, au format JSON uniquement, sans texte additionnel:
{
  "score_listening": nombre,
  "score_reading": nombre,
  "score_grammar": nombre,
  "score_writing": nombre,
  "justification": "courte explication"
}`
          }]
        })
      })
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || data.content || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const scores = JSON.parse(jsonMatch[0])
        setForm(prev => ({
          ...prev,
          score_listening: scores.score_listening || prev.score_listening,
          score_reading: scores.score_reading || prev.score_reading,
          score_grammar: scores.score_grammar || prev.score_grammar,
          score_writing: scores.score_writing || prev.score_writing,
        }))
      }
    } catch (err) {
      alert('Erreur IA: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!form.user_id) { alert('Sélectionnez un utilisateur'); return }
    try {
      const globalScore = calcGlobal()
      const verifyCode = Math.random().toString(36).substring(2, 10).toUpperCase()

      const insertData = {
        user_id: form.user_id,
        language: form.language,
        recipient_name: form.recipient_name || users.find(u => u.id === form.user_id)?.full_name,
        level_certified: form.level,
        score_global: globalScore,
        score_listening: parseInt(form.score_listening),
        score_reading: parseInt(form.score_reading),
        score_grammar: parseInt(form.score_grammar),
        score_writing: parseInt(form.score_writing),
        is_valid: true,
        verification_code: verifyCode,
        certificate_number: `ADMIN-${form.language.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        valid_until: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      }
      if (form.category) insertData.category = form.category
      if (form.native_language) insertData.native_language = form.native_language
      if (form.category) {
        insertData.rubric_scores = {
          listening: parseInt(form.score_listening),
          reading: parseInt(form.score_reading),
          grammar: parseInt(form.score_grammar),
          writing: parseInt(form.score_writing),
        }
      }

      const { data: cert, error } = await supabase
        .from('lingua_certificates')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      alert(`Certificat créé ! Code vérification: ${verifyCode}`)
      setMode('list')
      loadCerts()
    } catch (err) {
      alert('Erreur: ' + err.message)
    }
  }

  const handleDelete = async (certId) => {
    if (!confirm('Supprimer ce certificat définitivement ?')) return
    try {
      const { error } = await supabase.from('lingua_certificates').delete().eq('id', certId)
      if (error) throw error
      loadCerts()
    } catch (err) {
      alert('Erreur: ' + err.message)
    }
  }

  return (
    <AppLayout>
      <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-1">Administration</div>
      <h1 className="font-serif text-3xl text-white mb-2">Gestion des <em className="text-gold italic">Certificats</em></h1>
      <p className="text-muted mb-8">Créez, visualisez et gérez les certificats LINGUA SPACE.</p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode('list')}
          className={`px-5 py-2 rounded-sm text-sm font-medium transition-colors ${mode === 'list' ? 'bg-gold text-dark' : 'bg-white/5 text-muted hover:bg-white/10'}`}
        >
          📋 Liste des certificats
        </button>
        <button
          onClick={() => setMode('create')}
          className={`px-5 py-2 rounded-sm text-sm font-medium transition-colors ${mode === 'create' ? 'bg-gold text-dark' : 'bg-white/5 text-muted hover:bg-white/10'}`}
        >
          + Créer un certificat
        </button>
      </div>

      {error && (
        <div className="card p-5 mb-6 border-red/30 bg-red/5 text-red">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {mode === 'create' && (
        <div className="card p-6">
          <h2 className="text-xl text-white font-serif mb-6">Simuler un certificat</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Utilisateur */}
            <div>
              <label className="block text-sm text-muted mb-2">Utilisateur *</label>
              <select
                name="user_id"
                value={form.user_id}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="input w-full"
              >
                <option value="">Sélectionner un utilisateur</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.email} — {u.full_name || '—'}</option>
                ))}
              </select>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm text-muted mb-2">Nom du bénéficiaire</label>
              <input
                name="recipient_name"
                value={form.recipient_name}
                onChange={handleFormChange}
                className="input w-full"
                placeholder="Nom complet"
              />
            </div>

            {/* Langue */}
            <div>
              <label className="block text-sm text-muted mb-2">Langue</label>
              <select name="language" value={form.language} onChange={handleFormChange} className="input w-full">
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>

            {/* Niveau */}
            <div>
              <label className="block text-sm text-muted mb-2">Niveau certifié</label>
              <select name="level" value={form.level} onChange={handleFormChange} className="input w-full">
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm text-muted mb-2">Catégorie (optionnelle)</label>
              <select name="category" value={form.category} onChange={handleFormChange} className="input w-full">
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Langue maternelle */}
            <div>
              <label className="block text-sm text-muted mb-2">Langue maternelle (optionnelle)</label>
              <select name="native_language" value={form.native_language} onChange={handleFormChange} className="input w-full">
                <option value="">— Non spécifiée —</option>
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>

            {/* Scores */}
            <div>
              <label className="block text-sm text-muted mb-2">Score Compréhension orale (0-100)</label>
              <input type="number" min="0" max="100" name="score_listening" value={form.score_listening} onChange={handleFormChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Score Compréhension écrite (0-100)</label>
              <input type="number" min="0" max="100" name="score_reading" value={form.score_reading} onChange={handleFormChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Score Grammaire/Vocabulaire (0-100)</label>
              <input type="number" min="0" max="100" name="score_grammar" value={form.score_grammar} onChange={handleFormChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Score Expression (0-100)</label>
              <input type="number" min="0" max="100" name="score_writing" value={form.score_writing} onChange={handleFormChange} className="input w-full" />
            </div>
          </div>

          {/* IA Evaluation */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => handleAIEvaluate('deepseek')}
              disabled={aiLoading}
              className="btn bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-40 flex items-center gap-2"
            >
              {aiLoading ? '⏳' : '🤖'} Évaluer avec DeepSeek
            </button>
            <button
              onClick={() => handleAIEvaluate('anthropic')}
              disabled={aiLoading}
              className="btn bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-40 flex items-center gap-2"
            >
              {aiLoading ? '⏳' : '🧠'} Évaluer avec Claude
            </button>
            <span className="text-xs text-muted self-center">
              {aiLoading ? 'Génération des scores...' : 'Génère automatiquement des scores réalistes'}
            </span>
          </div>

          {/* Aperçu score global */}
          <div className="mt-6 p-4 rounded-sm" style={{ background: 'rgba(232,148,26,0.08)', border: '1px solid rgba(232,148,26,0.15)' }}>
            <div className="text-sm text-muted mb-1">Score global calculé (pondéré) :</div>
            <div className="text-2xl font-bold text-gold">{calcGlobal()} / 100</div>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={handleGenerate} className="btn bg-gold text-dark font-semibold px-8">
              🎓 Générer le certificat
            </button>
            <button onClick={() => setMode('list')} className="btn bg-white/5 text-muted hover:bg-white/10">
              Annuler
            </button>
          </div>
        </div>
      )}

      {mode === 'list' && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted text-xs font-mono tracking-wider border-b border-white/10">
                  <th className="pb-3 px-2">Bénéficiaire</th>
                  <th className="pb-3 px-2">Langue</th>
                  <th className="pb-3 px-2">Niveau</th>
                  <th className="pb-3 px-2">Catégorie</th>
                  <th className="pb-3 px-2">Score</th>
                  <th className="pb-3 px-2">Code</th>
                  <th className="pb-3 px-2">Créé le</th>
                  <th className="pb-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certs.length === 0 ? (
                  <tr><td colSpan="8" className="py-12 text-center text-muted">Aucun certificat trouvé</td></tr>
                ) : certs.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="py-4 px-2">
                      <div className="font-medium text-white">{c.recipient_name}</div>
                      <div className="text-xs text-muted">{c.lingua_users?.email}</div>
                    </td>
                    <td className="py-4 px-2 text-white">{c.language.toUpperCase()}</td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono ${
                        c.level_certified >= 'B2' ? 'bg-green/20 text-green' :
                        c.level_certified >= 'A2' ? 'bg-gold/20 text-gold' :
                        'bg-blue/20 text-blue'
                      }`}>{c.level_certified}</span>
                    </td>
                    <td className="py-4 px-2">
                      {c.category ? (
                        <span className="text-xs text-white/60">{CATEGORIES.find(cat => cat.value === c.category)?.label?.replace(/^[^\s]+\s/, '') || c.category}</span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="py-4 px-2 text-white">{c.score_global}%</td>
                    <td className="py-4 px-2">
                      <span className="font-mono text-xs text-muted">{c.verification_code}</span>
                    </td>
                    <td className="py-4 px-2 text-sm text-muted">
                      {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/certificate/${c.id}`)}
                          className="text-xs px-3 py-1 bg-blue/20 hover:bg-blue/30 text-blue rounded-sm transition-colors"
                        >
                          👁️ Voir
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-xs px-3 py-1 bg-red/20 hover:bg-red/30 text-red rounded-sm transition-colors"
                        >
                          🗑️ Suppr.
                        </button>
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
            <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-sm">
              Suivant →
            </button>
          </div>
        </>
      )}
    </AppLayout>
  )
}
