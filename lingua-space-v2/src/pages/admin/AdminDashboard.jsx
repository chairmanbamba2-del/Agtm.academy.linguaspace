// ============================================================
// AdminDashboard.jsx — Hub admin LINGUA SPACE
// Route protégée : /admin
// ============================================================
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { supabase } from '../../lib/supabase'
import { formatNumber } from '../../lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [subsRes, testsRes, certsRes, transRes] = await Promise.all([
        supabase.from('lingua_active_subscribers').select('*', { count: 'exact', head: true }),
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
    { title: 'Finance & Comptabilité', desc: 'Recettes, dépenses, reçus, exports CSV', icon: '💰', link: '/admin/finance', color: 'green' },
    { title: 'Certifications',         desc: 'Tests, certificats délivrés, statistiques', icon: '🎓', link: '/admin/certifications', color: 'gold' },
    { title: 'Gestion abonnés',        desc: 'Abonnements actifs, résiliations, historique', icon: '👥', link: '/admin/subscribers', color: 'blue' },
    { title: 'Rapport hebdomadaire',   desc: 'Déclencher le rapport email aux abonnés', icon: '📧', link: '/admin/reports', color: 'purple' },
  ]

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

      {/* Modules admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODULES.map(m => (
          <Link key={m.link} to={m.link}
            className="card p-6 hover:border-gold/30 transition-all group flex items-start gap-4">
            <div className="text-3xl">{m.icon}</div>
            <div className="flex-1">
              <div className="font-serif text-lg text-white group-hover:text-gold transition-colors mb-1">{m.title}</div>
              <div className="text-sm text-muted">{m.desc}</div>
            </div>
            <div className="text-muted group-hover:text-gold transition-colors">→</div>
          </Link>
        ))}
      </div>
    </AppLayout>
  )
}
