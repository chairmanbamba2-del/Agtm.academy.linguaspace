import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { supabase } from '../lib/supabase'
import { initPayment } from '../lib/ai'
import Navbar from '../components/layout/Navbar'
import MasterCard from '../components/ui/MasterCard'
import { LANGUAGES, PLANS, PAYMENT_METHODS } from '../lib/constants'

export default function Subscribe() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const user = useUserStore(s => s.user)

  const [step, setStep]         = useState(1) // 1=plan, 2=langue(si uni), 3=paiement
  const [plan, setPlan]         = useState(params.get('plan') || null)
  const [selectedLang, setLang] = useState(null)
  const [payMethod, setPayMethod] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handlePayment() {
    if (!user) return navigate('/login')
    if (!payMethod) return setError('Choisissez un mode de paiement.')
    setLoading(true)
    setError('')
    try {
      // Créer l'abonnement en statut "pending"
      await supabase.from('lingua_subscriptions').insert({
        user_id: user.id,
        plan_type: plan,
        selected_language: plan === 'uni' ? selectedLang : null,
        status: 'pending',
        payment_method: payMethod,
        amount_fcfa: PLANS[plan].price,
      })

      // Initier le paiement CinetPay
      const payment = await initPayment({
        userId: user.id,
        planType: plan,
        selectedLanguage: selectedLang,
        paymentMethod: payMethod,
      })

      // Rediriger vers la page CinetPay
      if (payment?.data?.payment_url) {
        window.location.href = payment.data.payment_url
      } else {
        throw new Error('Impossible d\'initier le paiement.')
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">

        {/* Stepper */}
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

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* STEP 1 : Choix du forfait */}
        {step === 1 && (
          <div>
            <h2 className="font-serif text-2xl text-white mb-2">Choisissez votre forfait</h2>
            <p className="text-muted text-sm mb-8">Sans engagement. Résiliation en 1 clic.</p>
            <div className="grid grid-cols-1 gap-4">
              {Object.values(PLANS).map(p => (
                 <MasterCard key={p.id} onClick={() => { setPlan(p.id); setStep(p.id === 'uni' ? 2 : 3) }}
                  variant="content" padding="lg" interactive={true}
                  className={`text-left hover:border-gold/30 ${plan === p.id ? 'border-gold/50' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">Forfait</p>
                      <h3 className="font-serif text-xl text-white mt-0.5">{p.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-3xl text-gold">{p.price.toLocaleString()}</span>
                      <span className="text-muted text-sm"> FCFA/mois</span>
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
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 : Choix de la langue (UNI seulement) */}
        {step === 2 && (
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
            <MasterCard variant="content" padding="md" className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted">Votre forfait</p>
                <p className="font-serif text-lg text-gold">{PLANS[plan]?.name}</p>
                {selectedLang && <p className="text-xs text-white/60">{LANGUAGES[selectedLang]?.flag} {LANGUAGES[selectedLang]?.name}</p>}
              </div>
              <span className="font-serif text-2xl text-gold">{PLANS[plan]?.price.toLocaleString()} FCFA</span>
            </MasterCard>

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

            <button onClick={handlePayment} disabled={loading || !payMethod}
              className="btn-gold w-full text-center disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Redirection vers le paiement...' : `Payer ${PLANS[plan]?.price.toLocaleString()} FCFA →`}
            </button>

            <button onClick={() => setStep(plan === 'uni' ? 2 : 1)} className="mt-4 text-sm text-muted hover:text-white transition-colors block">
              ← Retour
            </button>

            <p className="text-center text-xs text-muted mt-6">🔒 Paiement sécurisé par CinetPay</p>
          </div>
        )}
      </div>
    </div>
  )
}
