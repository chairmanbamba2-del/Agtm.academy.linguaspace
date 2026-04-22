// ============================================================
// Finance.jsx — Tableau de bord financier admin
// Accessible uniquement via service role (admin)
// Route : /admin/finance
// ============================================================
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatNumber } from '../../lib/utils'
import AppLayout from '../../components/layout/AppLayout'

const CATEGORIES = {
  abonnement_uni:        'Abo. UNI',
  abonnement_all_access: 'Abo. ALL ACCESS',
  certificat:            'Certificat',
  test_niveau:           'Test de niveau',
  repassage:             'Repassage',
  infrastructure:        'Infrastructure',
  api_claude:            'API Claude',
  marketing:             'Marketing',
  salaires:              'Salaires',
}

const PAY_LABELS = {
  orange_money: '🟠 Orange Money',
  wave:         '🔵 Wave',
  mtn:          '🟡 MTN MoMo',
  card:         '💳 Carte',
  flutterwave:  '🌍 Flutterwave',
}

export default function Finance() {
  const [summary, setSummary]         = useState([])
  const [transactions, setTransactions] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [activeTab, setActiveTab]     = useState('overview')
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState({ direction: 'all', type: 'all', month: '' })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [summRes, transRes, subRes] = await Promise.all([
      supabase.from('lingua_financial_summary').select('*').limit(12),
      supabase.from('lingua_transactions').select('*, lingua_users(full_name, email)').order('transaction_date', { ascending: false }).limit(50),
      supabase.from('lingua_active_subscribers').select('*').limit(100),
    ])
    setSummary(summRes.data || [])
    setTransactions(transRes.data || [])
    setSubscribers(subRes.data || [])
    setLoading(false)
  }

  // Calculs du mois en cours
  const currentMonth = summary[0] || {}
  const prevMonth    = summary[1] || {}
  const incomeDelta  = prevMonth.total_income
    ? Math.round(((currentMonth.total_income - prevMonth.total_income) / prevMonth.total_income) * 100)
    : 0

  // Filtrage des transactions
  const filtered = transactions.filter(t => {
    if (filter.direction !== 'all' && t.direction !== filter.direction) return false
    if (filter.type !== 'all' && t.type !== filter.type) return false
    return true
  })

  async function exportCSV() {
    const headers = ['Date','Reçu','Utilisateur','Type','Catégorie','Méthode','Montant','Direction','Statut']
    const rows = transactions.map(t => [
      new Date(t.transaction_date).toLocaleDateString('fr-FR'),
      t.receipt_number || '',
      t.lingua_users?.full_name || '',
      t.type, t.category || '',
      t.payment_method || '',
      t.amount_fcfa,
      t.direction,
      t.status,
    ])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `lingua-finance-${new Date().toISOString().slice(0,7)}.csv`
    a.click()
  }

  const TABS = [
    { id: 'overview',      label: '📊 Vue d\'ensemble' },
    { id: 'transactions',  label: '💳 Transactions' },
    { id: 'subscribers',   label: '👥 Abonnés' },
  ]

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-1">Administration</div>
          <h1 className="font-serif text-3xl text-white">Finance & <em className="text-gold italic">Comptabilité</em></h1>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gold text-dark text-sm font-semibold rounded-sm hover:bg-gold-lt transition-all">
          ⬇ Exporter CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: '💵', val: `${formatNumber(currentMonth.total_income)} FCFA`, label: 'Recettes du mois', delta: incomeDelta, pos: true },
          { icon: '📤', val: `${formatNumber(currentMonth.total_expenses)} FCFA`, label: 'Dépenses du mois', delta: null },
          { icon: '✨', val: `${formatNumber(currentMonth.net_result)} FCFA`, label: 'Résultat net', delta: currentMonth.margin_pct ? `${currentMonth.margin_pct}%` : null },
          { icon: '👥', val: subscribers.length, label: 'Abonnés actifs', delta: `+${currentMonth.new_subscriptions || 0} ce mois` },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="font-serif text-xl text-gold">{s.val}</div>
            <div className="text-xs text-muted mt-1 font-mono tracking-wider uppercase">{s.label}</div>
            {s.delta && <div className={`text-xs mt-1 ${s.pos && incomeDelta >= 0 ? 'text-green-400' : 'text-muted'}`}>{typeof s.delta === 'number' ? `${s.delta >= 0 ? '↑' : '↓'} ${Math.abs(s.delta)}% vs mois précédent` : s.delta}</div>}
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-white/8 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
              ${activeTab === t.id ? 'border-gold text-gold' : 'border-transparent text-muted hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-10 text-gold font-mono text-xs tracking-widest animate-pulse">CHARGEMENT...</div>}

      {/* Tab : Vue d'ensemble */}
      {!loading && activeTab === 'overview' && (
        <div>
          {/* Graphique mensuel simulé */}
          <div className="card p-5 mb-6">
            <h3 className="font-serif text-lg text-white mb-4">Évolution mensuelle (FCFA)</h3>
            <div className="flex items-end gap-2 h-32">
              {summary.slice(0, 6).reverse().map((m, i) => {
                const maxIncome = Math.max(...summary.map(s => s.total_income || 0))
                const h = maxIncome > 0 ? Math.round(((m.total_income || 0) / maxIncome) * 100) : 10
                const label = new Date(m.month).toLocaleDateString('fr-FR', { month: 'short' })
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="font-mono text-[9px] text-gold">{formatNumber(m.total_income)}</div>
                    <div className="w-full rounded-t" style={{ height: `${h}%`, background: i === 5 ? '#F5B942' : '#E8941A', opacity: 0.6 + i * 0.08 }} />
                    <div className="font-mono text-[9px] text-muted">{label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Répartition par type */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Abonnements UNI',       val: transactions.filter(t => t.category === 'abonnement_uni' && t.direction === 'income').reduce((s,t) => s + t.amount_fcfa, 0) },
              { label: 'Abonnements ALL ACCESS', val: transactions.filter(t => t.category === 'abonnement_all_access' && t.direction === 'income').reduce((s,t) => s + t.amount_fcfa, 0) },
              { label: 'Certificats',            val: transactions.filter(t => t.category === 'certificat' && t.direction === 'income').reduce((s,t) => s + t.amount_fcfa, 0) },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <div className="font-serif text-xl text-gold">{formatNumber(s.val)}</div>
                <div className="text-xs text-muted font-mono tracking-wider uppercase mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab : Transactions */}
      {!loading && activeTab === 'transactions' && (
        <div>
          {/* Filtres */}
          <div className="flex gap-3 mb-4">
            <select value={filter.direction} onChange={e => setFilter(f => ({ ...f, direction: e.target.value }))}
              className="bg-card border border-[#1E3A5F] text-white text-sm px-3 py-2 rounded">
              <option value="all">Toutes directions</option>
              <option value="income">Recettes</option>
              <option value="expense">Dépenses</option>
            </select>
            <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
              className="bg-card border border-[#1E3A5F] text-white text-sm px-3 py-2 rounded">
              <option value="all">Tous types</option>
              <option value="subscription">Abonnements</option>
              <option value="certificate">Certificats</option>
              <option value="test">Tests</option>
            </select>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: 'rgba(27,79,138,0.12)' }}>
                  {['N° Reçu','Date','Utilisateur','Type','Méthode','Montant','Statut',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-mono tracking-widest text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-white/4 hover:bg-white/2">
                    <td className="px-4 py-3 font-mono text-xs text-gold">{t.receipt_number || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDate(t.transaction_date)}</td>
                    <td className="px-4 py-3 text-sm text-white">{t.lingua_users?.full_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded border"
                            style={{ background: 'rgba(232,148,26,0.1)', borderColor: 'rgba(232,148,26,0.3)', color: '#E8941A' }}>
                        {CATEGORIES[t.category] || t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{PAY_LABELS[t.payment_method] || t.payment_method || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-serif text-lg ${t.direction === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.direction === 'income' ? '+' : '−'}{formatNumber(t.amount_fcfa)} FCFA
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded border
                        ${t.status === 'confirmed' ? 'bg-green-900/30 border-green-500/30 text-green-400' :
                          t.status === 'failed' ? 'bg-red-900/30 border-red-500/30 text-red-400' :
                          'bg-yellow-900/30 border-yellow-500/30 text-yellow-400'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.receipt_pdf_url && (
                        <a href={t.receipt_pdf_url} target="_blank" rel="noreferrer"
                          className="text-xs text-gold hover:text-gold-lt transition-colors">
                          Reçu →
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab : Abonnés */}
      {!loading && activeTab === 'subscribers' && (
        <div className="card overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgba(27,79,138,0.12)' }}>
                {['Nom','Email','Forfait','Langue','Méthode','Démarré','Expire','XP','Certifs',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-mono tracking-widest text-muted uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id} className="border-b border-white/4 hover:bg-white/2">
                  <td className="px-4 py-3 text-sm font-medium text-white">{s.full_name}</td>
                  <td className="px-4 py-3 text-xs text-muted">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded border
                      ${s.plan_type === 'all_access' ? 'bg-blue/20 border-blue/40 text-blue-300' : 'bg-gold/15 border-gold/30 text-gold'}`}>
                      {s.plan_type === 'all_access' ? 'ALL ACCESS' : 'UNI'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white">{s.selected_language?.toUpperCase() || '4 langues'}</td>
                  <td className="px-4 py-3 text-xs text-muted">{PAY_LABELS[s.payment_method] || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(s.started_at)}</td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(s.expires_at)}</td>
                  <td className="px-4 py-3 text-xs text-gold">{formatNumber(s.total_xp)}</td>
                  <td className="px-4 py-3 text-xs text-white">{s.certificates_count}</td>
                  <td className="px-4 py-3 text-xs text-gold hover:text-gold-lt cursor-pointer">Détail →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  )
}