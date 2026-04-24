import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { supabase } from '../lib/supabase'
import { initPayment } from '../lib/ai'
import Navbar from '../components/layout/Navbar'
import MasterCard from '../components/ui/MasterCard'
import { LANGUAGES, PLANS, PAYMENT_METHODS } from '../lib/constants'
import { ALL_LANGUAGES } from '../lib/pricing'

export default function Subscribe() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const user = useUserStore(s => s.user)

  const langsParam = params.get('langs')
  const priceParam = params.get('price')
  const isConfigFlow = !!langsParam

  const [step, setStep]         = useState(isConfigFlow ? 3 : 1)
  const [basePlan, setBasePlan] = useState(isConfigFlow ? 'a_la_carte' : 'uni')
  const [period, setPeriod]     = useState('monthly')
  const [plan, setPlan]         = useState(params.get('plan') || null)
  const [selectedLang, setLang] = useState(null)
  const [payMethod, setPayMethod] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const selectedLangs = isConfigFlow
    ? langsParam.split(',').map(l => l.trim()).filter(Boolean)
    : []
  const totalPrice = isConfigFlow
    ? (priceParam ? parseInt(priceParam) : 15000)
    : 0

  function getPlanId() {
    return `${basePlan}_${period}`
  }

  function getPlan() {
    return PLANS[getPlanId()]
  }

  async function handlePayment() {
    if (!user) return navigate('/login')
    if (!payMethod) return setError('Choisissez un mode de paiement.')
    setLoading(true)
    setError('')

    try {
      const insertData = isConfigFlow
        ? {
            user_id: user.id,
            plan_type: 'a_la_carte',
            selected_language: langsParam,
            status: 'pending',
            payment_method: payMethod,
            amount_fcfa: totalPrice,
            duration_months: 1,
          }
        : {
            user_id: user.id,
            plan_type: getPlanId(),
            selected_language: basePlan === 'uni' ? selectedLang : null,
            status: 'pending',
            payment_method: payMethod,
            amount_fcfa: getPlan().price,
            duration_months: period === 'trimestrial' ? 3 : 1,
          }

      await supabase.from('lingua_subscriptions').insert(insertData)

      const payment = await initPayment({
        userId: user.id,
        planType: isConfigFlow ? 'a_la_carte' : getPlanId(),
        selectedLanguage: isConfigFlow ? langsParam : selectedLang,
        paymentMethod: payMethod,
      })

      if (payment?.data?.payment_url) {
        window.location.href = payment.data.payment_url
      } else {
        throw new Error("Impossible d'initier le paiement.")
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const isUniSelected = basePlan === 'uni' || basePlan === 'a_la_carte'

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">

        {/* Stepper (masqué en mode config) */}
        {!isConfigFlow && (
          <div className="flex items-center gap-2 mb-10">
            {[1,2,3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${step >= s ? 'bg-gold text-dark' : 'bg-card text-muted border border-white/10'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`h-px w-12 transition-colors ${step > s ? 'bg-gold' : 'bg-white/10'}`} />}
              </div>
            ))}
            <span className="ml-2 text-xs text-muted font-mono">
              {step === 1 ? 'Choisir un forfait' : step === 2 ? 'Langue' : 'Paiement'}
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* STEP 1 : Choix du forfait (uniquement en mode normal) */}
        {step === 1 && !isConfigFlow && (
          <div>
            <h2 className="font-serif text-2xl text-white mb-2">Choisissez votre forfait</h2>
            <p className="text-muted text-sm mb-8">Sans engagement. Résiliation en 1 clic.</p>

            <div className="flex gap-2 mb-6">
              <button onClick={() => setPeriod('monthly')}
                className={`px-5 py-2 rounded-sm text-sm font-medium transition-all ${period === 'monthly' ? 'bg-gold text-dark' : 'bg-white/5 text-muted hover:bg-white/10'}`}>
                Mensuel
              </button>
              <button onClick={() => setPeriod('trimestrial')}
                className={`px-5 py-2 rounded-sm text-sm font-medium transition-all ${period === 'trimestrial' ? 'bg-gold text-dark' : 'bg-white/5 text-muted hover:bg-white/10'}`}>
                Trimestriel <span className="text-[9px] opacity-80 ml-1">-17%</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['uni', 'all_access'].map(base => {
                const p = PLANS[`${base}_${period}`]
                if (!p) return null
                const monthlyPrice = period === 'trimestrial' ? Math.round(p.price / 3) : p.price
                return (
                  <MasterCard key={p.id} onClick={() => { setBasePlan(base); setPlan(p.id); setStep(base === 'uni' ? 2 : 3) }}
                    variant="content" padding="lg" interactive={true}
                    className={`text-left hover:border-gold/30 relative ${plan === p.id ? 'border-gold/50' : ''}`}>
                    {p.badge && (
                      <span className="absolute -top-2.5 right-3 text-[9px] px-2 py-0.5 bg-gold text-dark font-bold rounded-sm">{p.badge}</span>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                          {base === 'uni' ? 'LINGUA UNI' : 'ALL ACCESS'}
                        </p>
                        <h3 className="font-serif text-lg text-white mt-0.5">{period === 'monthly' ? 'Mensuel' : 'Trimestriel'}</h3>
                      </div>
                      <div className="text-right">
                        <span className="font-serif text-3xl text-gold">{p.price.toLocaleString()}</span>
                        <span className="text-muted text-xs block">FCFA/{period === 'monthly' ? 'mois' : '3 mois'}</span>
                        {period === 'trimestrial' && (
                          <span className="text-[9px] text-green">Soit {monthlyPrice.toLocaleString()} FCFA/mois</span>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {p.features.slice(0, 4).map(f => (
                        <li key={f} className="text-xs text-white/70 flex items-center gap-2">
                          <span className="text-gold">✦</span>{f}
                        </li>
                      ))}
                    </ul>
                  </MasterCard>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2 : Choix de la langue (UNI seulement) */}
        {step === 2 && !isConfigFlow && (
          <div>
            <h2 className="font-serif text-2xl text-white mb-2">Choisissez votre langue</h2>
            <p className="text-muted text-sm mb-8">Forfait UNI — 1 langue à maîtriser.</p>
            <div className="grid grid-cols-2 gap-3">
               {Object.values(LANGUAGES).map(l => (
                <MasterCard key={l.code} onClick={() => { setLang(l.code); setStep(3) }}
                  variant="corner" padding="lg" interactive={true}
                  className={`text-center hover:border-gold/30 ${selectedLang === l.code ? 'border-gold/50' : ''}`}>
                  <div className="text-4xl mb-2">{l.flag}</div>
                  <div className="font-serif text-white text-lg">{l.name}</div>
                  <div className="text-muted text-xs mt-1">{l.corner}</div>
                </MasterCard>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-6 text-sm text-muted hover:text-white transition-colors">
              ← Retour
            </button>
          </div>
        )}

        {/* STEP 3 : Paiement */}
        {step === 3 && (
          <div>
            <h2 className="font-serif text-2xl text-white mb-2">Mode de paiement</h2>

            {/* Résumé du forfait */}
            {isConfigFlow ? (
              <MasterCard variant="content" padding="md" className="mb-6">
                <p className="text-xs text-muted mb-2">Votre forfait sur mesure</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedLangs.map(code => {
                    const l = ALL_LANGUAGES.find(x => x.code === code)
                    return (
                      <span key={code} className="px-2 py-1 bg-dark border border-bdr rounded-sm text-sm flex items-center gap-1">
                        {l?.flag} {l?.name}
                      </span>
                    )
                  })}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-bdr">
                  <div>
                    <span className="text-sm text-white/70">{selectedLangs.length} langue{selectedLangs.length > 1 ? 's' : ''} · 100 modules/langue</span>
                  </div>
                  <span className="font-serif text-xl text-gold">{totalPrice.toLocaleString()} FCFA/mois</span>
                </div>
              </MasterCard>
            ) : (
              <MasterCard variant="content" padding="md" className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted">Votre forfait</p>
                  <p className="font-serif text-lg text-gold">{getPlan()?.name}</p>
                  {selectedLang && <p className="text-xs text-white/60">{LANGUAGES[selectedLang]?.flag} {LANGUAGES[selectedLang]?.name}</p>}
                </div>
                <span className="font-serif text-2xl text-gold">{getPlan()?.price.toLocaleString()} FCFA</span>
              </MasterCard>
            )}

            {/* Modes de paiement */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {PAYMENT_METHODS.map(m => (
                <MasterCard key={m.id} onClick={() => setPayMethod(m.id)}
                  variant="action" padding="md" interactive={true}
                  className={`text-center hover:border-gold/30 ${payMethod === m.id ? 'border-gold/50 bg-gold/5' : ''}`}>
                  <div className="text-2xl mb-1">{m.emoji}</div>
                  <div className="text-sm text-white">{m.label}</div>
                </MasterCard>
              ))}
            </div>

            {/* Bouton de paiement */}
            <button onClick={handlePayment} disabled={loading || !payMethod}
              className="btn-gold w-full text-center disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? 'Redirection vers le paiement...'
                : `Payer ${isConfigFlow ? totalPrice.toLocaleString() : getPlan()?.price.toLocaleString()} FCFA →`}
            </button>

            <button onClick={() => isConfigFlow ? navigate('/') : setStep(isUniSelected ? 2 : 1)}
              className="mt-4 text-sm text-muted hover:text-white transition-colors block">
              ← Retour
            </button>

            <p className="text-center text-xs text-muted mt-6">🔒 Paiement sécurisé par CinetPay</p>
          </div>
        )}
      </div>
    </div>
  )
}
