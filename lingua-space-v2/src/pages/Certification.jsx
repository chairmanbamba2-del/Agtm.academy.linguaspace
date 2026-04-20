import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { supabase } from '../lib/supabase'
import { LANGUAGES } from '../lib/constants'
import { formatDate } from '../lib/utils'

const CERT_PRICES = { test: 5000, retake: 3000, duplicate: 1000 }
const LEVEL_LABELS = { A1:'Découverte', A2:'Élémentaire', B1:'Intermédiaire', B2:'Avancé', C1:'Autonome', C2:'Maîtrise' }

export default function Certification() {
  useProfile()
  const navigate    = useNavigate()
  const user        = useUserStore(s => s.user)
  const { isActive } = useSubscription()

  const [certs, setCerts]   = useState([])
  const [tests, setTests]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const [certsRes, testsRes] = await Promise.all([
        supabase.from('lingua_certificates').select('*').eq('user_id', user.id).order('issued_at', { ascending: false }),
        supabase.from('lingua_level_tests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ])
      setCerts(certsRes.data || [])
      setTests(testsRes.data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const langColors = { en: '#C8102E', es: '#F1BF00', de: '#94A3B8', fr: '#4A7FBF' }

  return (
    <AppLayout>
      <div className="page-label">Espace Certification</div>
      <h1 className="font-serif text-3xl text-white mb-8">
        Mes <em className="text-gold italic">Certificats</em> de Niveau
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '🎓', val: certs.length,                             label: 'Certificats obtenus' },
          { icon: '📝', val: tests.filter(t => t.passed).length,       label: 'Tests réussis' },
          { icon: '⭐', val: certs[0]?.level_certified || '—',         label: 'Dernier niveau' },
          { icon: '💯', val: certs[0] ? `${certs[0].score_global}%` : '—', label: 'Meilleur score' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="font-serif text-2xl text-gold">{s.val}</div>
            <div className="text-xs text-muted mt-1 font-mono tracking-wider uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Certificats obtenus */}
      {certs.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E3A5F]">
            <h2 className="font-serif text-xl text-white">Certificats délivrés</h2>
            <span className="badge badge-green text-xs">{certs.filter(c => c.is_valid).length} valide(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue/10">
                  {['Langue','Niveau','Score global','Compréh. orale','Émis le','Statut',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-mono tracking-widest text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certs.map(cert => (
                  <tr key={cert.id} className="border-b border-white/4 hover:bg-white/2">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{LANGUAGES[cert.language]?.flag}</span>
                        <span className="text-sm text-white">{LANGUAGES[cert.language]?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-lg text-gold">{cert.level_certified}</span>
                      <div className="text-xs text-muted">{LEVEL_LABELS[cert.level_certified]}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-serif text-lg text-gold">{cert.score_global}%</div>
                      <div className="h-1 bg-dark rounded mt-1 w-16">
                        <div className="h-1 bg-gold rounded" style={{ width: `${cert.score_global}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white/80">{cert.score_listening}%</div>
                      <div className="h-1 bg-dark rounded mt-1 w-12">
                        <div className="h-1 bg-blue rounded" style={{ width: `${cert.score_listening}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDate(cert.issued_at)}</td>
                    <td className="px-4 py-3">
                      {cert.is_valid
                        ? <span className="badge badge-green">Valide</span>
                        : <span className="badge badge-red">Expiré</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/certificate/${cert.id}`)}
                        className="btn-outline text-xs py-1.5 px-3 border border-white/20 text-white hover:border-gold/50 transition-colors rounded-sm">
                        Voir PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Passer un nouveau test */}
      <div className="card p-6">
        <h3 className="font-serif text-xl text-white mb-1">Passer un test de niveau officiel</h3>
        <p className="text-muted text-sm mb-5 leading-relaxed">
          Le test évalue 4 compétences (Compréhension orale, Compréhension écrite, Grammaire, Expression) sur 45 minutes.
          Un certificat PDF officiel est délivré automatiquement si votre score est ≥ 60%.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {Object.values(LANGUAGES).map(l => {
            const hasCert = certs.some(c => c.language === l.code && c.is_valid)
            const lastTest = tests.find(t => t.language === l.code && t.status === 'completed')

            return (
              <div key={l.code}
                className="border border-[#1E3A5F] p-5 text-center hover:border-gold/40 transition-all cursor-pointer group"
                onClick={() => navigate(`/level-test/${l.code}`)}>
                <div className="text-4xl mb-2">{l.flag}</div>
                <div className="font-serif text-lg text-white mb-1">{l.name}</div>
                {hasCert && (
                  <div className="text-xs text-green-400 mb-2">✓ Certifié {certs.find(c => c.language === l.code)?.level_certified}</div>
                )}
                {lastTest && (
                  <div className="text-xs text-muted mb-2">Dernier : {lastTest.score_global}%</div>
                )}
                <div className="font-mono text-gold text-sm font-bold mb-3">
                  {hasCert ? `${CERT_PRICES.retake.toLocaleString()} FCFA` : `${CERT_PRICES.test.toLocaleString()} FCFA`}
                </div>
                <button className="w-full py-2 text-xs font-semibold bg-gold text-dark hover:bg-gold-lt transition-all rounded-sm">
                  {hasCert ? 'Repasser le test' : 'Commencer'}
                </button>
              </div>
            )
          })}
        </div>

        <div className="bg-gold/8 border border-gold/20 px-4 py-3 text-xs text-muted leading-relaxed">
          ℹ️ <strong className="text-white">4 compétences évaluées :</strong> Compréhension orale (35%) · Compréhension écrite (30%) · Grammaire &amp; Vocabulaire (25%) · Expression guidée (10%)
          &nbsp;·&nbsp; Durée : 45 minutes &nbsp;·&nbsp; Score minimum pour certification : 60%
        </div>
      </div>

      {/* Historique des tests */}
      {tests.length > 0 && (
        <div className="card mt-6">
          <div className="px-5 py-4 border-b border-[#1E3A5F]">
            <h3 className="font-serif text-lg text-white">Historique des tests</h3>
          </div>
          <div className="divide-y divide-white/4">
            {tests.map(test => (
              <div key={test.id} className="flex items-center gap-4 px-5 py-4">
                <span className="text-2xl">{LANGUAGES[test.language]?.flag}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{LANGUAGES[test.language]?.name}</div>
                  <div className="text-xs text-muted">{formatDate(test.completed_at || test.created_at)}</div>
                </div>
                <div className="text-right">
                  {test.score_global != null && (
                    <div className="font-serif text-lg text-gold">{test.score_global}%</div>
                  )}
                  <div className={`text-xs font-mono ${
                    test.status === 'completed' && test.passed ? 'text-green-400' :
                    test.status === 'failed' ? 'text-red-400' :
                    test.status === 'in_progress' ? 'text-gold' : 'text-muted'
                  }`}>
                    {test.status === 'completed' && test.passed ? '✓ Réussi' :
                     test.status === 'failed' ? '✗ Échoué' :
                     test.status === 'in_progress' ? '⏳ En cours' : test.status}
                  </div>
                </div>
                {test.status === 'completed' && test.passed && (
                  <button
                    onClick={() => navigate(`/certificate/${certs.find(c => c.test_id === test.id)?.id}`)}
                    className="text-xs text-gold hover:text-gold-lt transition-colors">
                    Voir certificat →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
