// ============================================================
// CertificateVerify.jsx — Page publique de vérification
// Accessible sans connexion : /verify/:code
// ============================================================
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LANGUAGES } from '../lib/constants'
import { formatDate } from '../lib/utils'

const LEVEL_LABELS = { A1:'Découverte', A2:'Élémentaire', B1:'Intermédiaire', B2:'Avancé', C1:'Autonome', C2:'Maîtrise' }

export default function CertificateVerify() {
  const { code }  = useParams()
  const [cert, setCert]     = useState(null)
  const [status, setStatus] = useState('loading') // loading | valid | invalid | expired | not_found
  const [search, setSearch] = useState(code || '')

  async function verify(verifyCode) {
    if (!verifyCode?.trim()) return
    setStatus('loading')
    setCert(null)
    const { data } = await supabase
      .from('lingua_certificates')
      .select('*')
      .eq('verification_code', verifyCode.trim().toUpperCase())
      .single()

    if (!data) { setStatus('not_found'); return }
    setCert(data)
    if (!data.is_valid) { setStatus('expired'); return }
    setStatus('valid')
  }

  useEffect(() => { if (code) verify(code) }, [code])

  const lang = cert ? LANGUAGES[cert.language] : null

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Navbar minimale */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5"
           style={{ background: 'rgba(8,15,26,0.9)', backdropFilter: 'blur(16px)' }}>
        <Link to="/" className="font-serif text-lg text-gold">LINGUA SPACE</Link>
        <span className="font-mono text-[10px] tracking-widest text-muted uppercase">Vérification de certificat</span>
        <Link to="/login" className="font-mono text-xs text-muted hover:text-white transition-colors">Se connecter</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔍</div>
            <h1 className="font-serif text-3xl text-white mb-2">Vérifier un certificat</h1>
            <p className="text-muted text-sm">Entrez le code de vérification figurant sur le certificat LINGUA SPACE.</p>
          </div>

          {/* Formulaire de recherche */}
          <div className="card p-6 mb-6">
            <div className="flex gap-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && verify(search)}
                placeholder="Ex: GHK4R92X"
                className="flex-1 bg-dark border border-white/10 text-white px-4 py-3 font-mono text-lg tracking-[.3em] text-center rounded focus:outline-none focus:border-gold/50"
                maxLength={8}
              />
              <button onClick={() => verify(search)}
                className="px-5 py-3 bg-gold text-dark font-semibold text-sm rounded-sm hover:bg-gold-lt transition-all">
                Vérifier
              </button>
            </div>
          </div>

          {/* Résultat */}
          {status === 'loading' && (
            <div className="card p-8 text-center text-muted font-mono text-xs tracking-widest animate-pulse">
              VÉRIFICATION EN COURS...
            </div>
          )}

          {status === 'not_found' && (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-3">❌</div>
              <div className="font-mono text-xs text-red-400 tracking-widest uppercase mb-2">Certificat introuvable</div>
              <p className="text-muted text-sm">Ce code de vérification ne correspond à aucun certificat LINGUA SPACE.</p>
            </div>
          )}

          {status === 'expired' && cert && (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-3">⏰</div>
              <div className="font-mono text-xs text-yellow-400 tracking-widest uppercase mb-2">Certificat expiré</div>
              <p className="text-muted text-sm">Ce certificat a expiré le {formatDate(cert.valid_until)}.</p>
            </div>
          )}

          {status === 'valid' && cert && (
            <div className="card overflow-hidden">
              {/* Banner vert */}
              <div className="bg-green-900/30 border-b border-green-500/30 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-xl">✅</div>
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-green-400 uppercase">Certificat authentique et valide</div>
                  <div className="text-white text-sm font-medium">Ce certificat LINGUA SPACE est vérifié et authentique.</div>
                </div>
              </div>

              <div className="p-6">
                {/* Titulaire */}
                <div className="text-center mb-6">
                  <div className="text-xs text-muted font-mono mb-1">Titulaire</div>
                  <div className="font-serif text-2xl text-white">{cert.recipient_name}</div>
                </div>

                {/* Infos principales */}
                <div className="bg-gold/8 border border-gold/20 p-5 rounded mb-5 text-center">
                  <div className="flex justify-center items-center gap-6">
                    <div>
                      <div className="text-xs text-muted font-mono uppercase tracking-wider mb-1">Langue</div>
                      <div className="text-base text-white">{lang?.flag} {lang?.name}</div>
                    </div>
                    <div className="h-12 w-px bg-white/10" />
                    <div>
                      <div className="text-xs text-muted font-mono uppercase tracking-wider mb-1">Niveau obtenu</div>
                      <div className="font-serif text-4xl text-gold leading-none">{cert.level_certified}</div>
                      <div className="text-xs text-gold-lt">{LEVEL_LABELS[cert.level_certified]}</div>
                    </div>
                    <div className="h-12 w-px bg-white/10" />
                    <div>
                      <div className="text-xs text-muted font-mono uppercase tracking-wider mb-1">Score global</div>
                      <div className="font-serif text-2xl text-gold">{cert.score_global}%</div>
                    </div>
                  </div>
                </div>

                {/* Scores détaillés */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Compréhension orale', val: cert.score_listening },
                    { label: 'Compréhension écrite', val: cert.score_reading },
                    { label: 'Grammaire', val: cert.score_grammar },
                  ].map(s => (
                    <div key={s.label} className="bg-dark rounded p-3 text-center">
                      <div className="font-serif text-xl text-gold-lt">{s.val}%</div>
                      <div className="font-mono text-[9px] text-muted uppercase tracking-wider mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Métadonnées */}
                <div className="flex justify-between text-xs text-muted border-t border-white/8 pt-4">
                  <div>N° {cert.certificate_number}</div>
                  <div>Émis le {formatDate(cert.issued_at)}</div>
                  <div>Valide jusqu'au {formatDate(cert.valid_until)}</div>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted/50 mt-6 font-mono">
            lingua.africaglobaltraining.com · AGTM Digital Academy
          </p>
        </div>
      </div>
    </div>
  )
}
