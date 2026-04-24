// ============================================================
// AdminDashboard.jsx — Hub admin LINGUA SPACE
// Route protégée : /admin
// ============================================================
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/ui/Spinner'
import { formatNumber } from '../../lib/utils'
import { useProfile } from '../../hooks/useAuth'

const handleWeeklyReport = async () => {
  const supabase = (await import('../../lib/supabase')).supabase
  setReportMsg('Déclenchement du rapport hebdomadaire...')
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekly-report`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    })
    setReportMsg(res.ok ? '✅ Rapport hebdomadaire envoyé avec succès' : '⚠️ Erreur lors de l\'envoi du rapport')
  } catch {
    setReportMsg('⚠️ Impossible de contacter le serveur')
  }
  setTimeout(() => setReportMsg(''), 5000)
}

export default function AdminDashboard() {
  const { loading: profileLoading, error } = useProfile()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reportMsg, setReportMsg] = useState('')

  useEffect(() => {
    async function load() {
      const [subsRes, testsRes, certsRes, transRes] = await Promise.all([
        supabase.from('lingua_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('lingua_level_tests').select('*', { count: 'exact', head: true }),
        supabase.from('lingua_certificates').select('*', { count: 'exact', head: true }),
        supabase.from('lingua_transactions')
          .select('amount_fcfa, direction')
          .eq('status', 'confirmed')
          .eq('direction', 'income')
          .gte('transaction_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ])

      const monthlyIncome = (transRes.data || []).reduce((s, t) => s + t.amount_fcfa, 0)

      setStats({
        subscribers:    subsRes.count || 0,
        tests:          testsRes.count || 0,
        certificates:   certsRes.count || 0,
        monthlyIncome,
      })
      setLoading(false)
    }
    load()
  }, [])

  const MODULES = [
    { title: 'Gestion certificats',    desc: 'Créer, visualiser et gérer les certificats', icon: '🎓', link: '/admin/certifications', color: 'gold' },
    { title: 'Finance & Comptabilité', desc: 'Recettes, dépenses, reçus, exports CSV', icon: '💰', link: '/admin/finance', color: 'green' },
    { title: 'Gestion abonnés',        desc: 'Abonnements actifs, résiliations, historique', icon: '👥', link: '/admin/subscribers', color: 'blue' },
    { title: 'Permissions IA',         desc: 'Contrôle d\'accès aux modèles IA (Anthropic, Groq, DeepSeek)', icon: '🤖', link: '/admin/ai-permissions', color: 'purple' },
    { title: 'Gestion utilisateurs',   desc: 'Création, suspension, réactivation des comptes', icon: '👤', link: '/admin/users', color: 'gold' },
    { title: 'Documentation',          desc: 'Guides admin et présentation téléchargeables', icon: '📚', link: '/admin/docs', color: 'indigo' },
    { title: 'Marketing',              desc: 'Campagnes, promotions, communications', icon: '📢', link: '/admin/marketing', color: 'orange' },
    { title: 'Rapport hebdomadaire',   desc: 'Déclencher le rapport email aux abonnés', icon: '📧', link: '#', action: 'weeklyReport', color: 'cyan' },
  ]

  if (profileLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" label="Chargement du profil..." />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="card p-6 border-red-500">
          <div className="text-red-400 font-mono text-sm">Erreur de chargement du profil: {error}</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-1">Administration</div>
      <h1 className="font-serif text-3xl text-white mb-8">Tableau de bord <em className="text-gold italic">Admin</em></h1>

      {/* KPIs */}
      {!loading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '👥', val: stats.subscribers,                  label: 'Abonnés actifs' },
            { icon: '📝', val: stats.tests,                        label: 'Tests passés' },
            { icon: '🎓', val: stats.certificates,                 label: 'Certificats émis' },
            { icon: '💵', val: `${formatNumber(stats.monthlyIncome)} FCFA`, label: 'Recettes du mois' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-serif text-2xl text-gold">{s.val}</div>
              <div className="text-xs text-muted mt-1 font-mono tracking-wider uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Message rapport */}
      {reportMsg && (
        <div className="mb-4 px-4 py-3 rounded-sm text-sm"
          style={{ background: reportMsg.includes('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${reportMsg.includes('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: reportMsg.includes('✅') ? '#4ADE80' : '#F87171' }}>
          {reportMsg}
        </div>
      )}

      {/* Modules admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODULES.map((m, idx) => {
          if (m.action === 'weeklyReport') {
            return (
              <button key={idx} onClick={handleWeeklyReport}
                className="card p-6 hover:border-gold/30 transition-all group flex items-start gap-4 text-left">
                <div className="text-3xl">{m.icon}</div>
                <div className="flex-1">
                  <div className="font-serif text-lg text-white group-hover:text-gold transition-colors mb-1">{m.title}</div>
                  <div className="text-sm text-muted">{m.desc}</div>
                </div>
                <div className="text-muted group-hover:text-gold transition-colors">→</div>
              </button>
            )
          }
          return (
            <Link key={m.link} to={m.link}
              className="card p-6 hover:border-gold/30 transition-all group flex items-start gap-4">
              <div className="text-3xl">{m.icon}</div>
              <div className="flex-1">
                <div className="font-serif text-lg text-white group-hover:text-gold transition-colors mb-1">{m.title}</div>
                <div className="text-sm text-muted">{m.desc}</div>
              </div>
              <div className="text-muted group-hover:text-gold transition-colors">→</div>
            </Link>
          )
        })}
      </div>
    </AppLayout>
  )
}