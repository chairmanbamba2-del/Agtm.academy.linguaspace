import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn, authErrorMessage } from '../lib/auth'
import Navbar from '../components/layout/Navbar'
import MasterCard from '../components/ui/MasterCard'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn({ email: form.email, password: form.password })
      navigate('/dashboard')
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
            <p className="section-label justify-center flex">Connexion</p>
            <h1 className="font-serif text-3xl text-white">Bon retour sur <em className="text-gold">LINGUA SPACE</em></h1>
          </div>

          <MasterCard variant="content" padding="lg">
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase block mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={update('email')}
                  placeholder="vous@exemple.com"
                  className="w-full bg-dark border border-white/10 text-white px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/20" />
              </div>

              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase block mb-1.5">Mot de passe</label>
                <input type="password" required value={form.password} onChange={update('password')}
                  placeholder="••••••••"
                  className="w-full bg-dark border border-white/10 text-white px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/20" />
              </div>

              <div className="flex justify-end">
                <Link to="/reset-password" className="text-xs text-muted hover:text-gold transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full justify-center text-center disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Connexion...' : 'Se connecter →'}
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="text-gold hover:text-gold-lt transition-colors">Créer un compte</Link>
            </p>
          </MasterCard>
        </div>
      </div>
    </div>
  )
}
