import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signUp, authErrorMessage } from '../lib/auth'
import Navbar from '../components/layout/Navbar'
import MasterCard from '../components/ui/MasterCard'

export default function Signup() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const plan = params.get('plan') || ''

  const [form, setForm]     = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      return setError('Les mots de passe ne correspondent pas.')
    }
    if (form.password.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères.')
    }

    setLoading(true)
    try {
      await signUp({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone })
      // Rediriger vers abonnement ou onboarding
      navigate(plan ? `/subscribe?plan=${plan}` : '/subscribe')
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="section-label justify-center flex">Créer un compte</p>
            <h1 className="font-serif text-3xl text-white">Rejoignez <em className="text-gold">LINGUA SPACE</em></h1>
            <p className="text-muted text-sm mt-2">Aucune carte requise pour commencer</p>
          </div>

          <MasterCard variant="content" padding="lg">
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase block mb-1.5">Nom complet</label>
                <input type="text" required value={form.fullName} onChange={update('fullName')}
                  placeholder="Konan Yao"
                  className="w-full bg-dark border border-white/10 text-white px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/20" />
              </div>

              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase block mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={update('email')}
                  placeholder="vous@exemple.com"
                  className="w-full bg-dark border border-white/10 text-white px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/20" />
              </div>

              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase block mb-1.5">Téléphone <span className="text-white/30 normal-case">(pour Mobile Money)</span></label>
                <input type="tel" value={form.phone} onChange={update('phone')}
                  placeholder="+225 07 00 00 00 00"
                  className="w-full bg-dark border border-white/10 text-white px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/20" />
              </div>

              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase block mb-1.5">Mot de passe</label>
                <input type="password" required value={form.password} onChange={update('password')}
                  placeholder="Minimum 6 caractères"
                  className="w-full bg-dark border border-white/10 text-white px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/20" />
              </div>

              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase block mb-1.5">Confirmer le mot de passe</label>
                <input type="password" required value={form.confirm} onChange={update('confirm')}
                  placeholder="Répétez le mot de passe"
                  className="w-full bg-dark border border-white/10 text-white px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/20" />
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full justify-center text-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Création du compte...' : 'Créer mon compte →'}
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-gold hover:text-gold-lt transition-colors">Se connecter</Link>
            </p>
          </MasterCard>
        </div>
      </div>
    </div>
  )
}
