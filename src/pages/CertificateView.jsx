// ============================================================
// CertificateView.jsx — Visualisation & téléchargement PDF
// ============================================================
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { supabase } from '../lib/supabase'
import { LANGUAGES } from '../lib/constants'
import { formatDate } from '../lib/utils'

const LEVEL_LABELS = { A1:'Découverte', A2:'Élémentaire', B1:'Intermédiaire', B2:'Avancé', C1:'Autonome', C2:'Maîtrise' }
const CATEGORY_LABELS = {
  culture_arabe: 'Culture arabe',
  connaissance_monde_arabe: 'Connaissance du monde arabe',
  ramadan: 'Ramadan & pratiques',
  art_cuisine: 'Art, cuisine & patrimoine',
  histoire_geo: 'Histoire & géographie',
  famille_societe: 'Famille & société',
}
const RUBRIC_LABELS = {
  monde_arabe: 'Connaissance du monde arabe',
  ramadan: 'Ramadan & pratiques',
  art_cuisine: 'Art, cuisine & patrimoine',
  histoire_geo: 'Histoire & géographie',
  famille: 'Famille & société',
}

export default function CertificateView() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const user       = useUserStore(s => s.user)
  const [cert, setCert]     = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id || !user) return
    supabase.from('lingua_certificates').select('*').eq('id', id).eq('user_id', user.id).single()
      .then(({ data }) => setCert(data))
  }, [id, user])

  async function copyVerifyLink() {
    const url = `${window.location.origin}/verify/${cert.verification_code}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!cert) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64 text-gold font-mono text-xs tracking-widest animate-pulse">CHARGEMENT...</div>
    </AppLayout>
  )

  const lang = LANGUAGES[cert.language]

  return (
    <AppLayout>
      <div className="flex items-center gap-2 text-xs text-muted mb-6">
        <button onClick={() => navigate('/certification')} className="hover:text-white">Certifications</button>
        <span>/</span>
        <span className="text-white">Certificat {cert.certificate_number}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar actions */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-serif text-lg text-white mb-4">Actions</h3>
            <div className="space-y-2">
              <a href={cert.pdf_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 w-full py-2.5 px-4 bg-gold text-dark text-sm font-semibold rounded-sm hover:bg-gold-lt transition-all">
                ⬇ Télécharger PDF
              </a>
              <button onClick={copyVerifyLink}
                className="flex items-center gap-2 w-full py-2.5 px-4 border border-white/20 text-white text-sm rounded-sm hover:border-white/40 transition-all">
                {copied ? '✓ Lien copié !' : '🔗 Copier le lien de vérification'}
              </button>
              <a href={`https://wa.me/?text=Voici mon certificat de niveau ${cert.level_certified} en ${lang?.name} : ${window.location.origin}/verify/${cert.verification_code}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 w-full py-2.5 px-4 border border-green-500/30 text-green-400 text-sm rounded-sm hover:border-green-500/60 transition-all">
                📱 Partager sur WhatsApp
              </a>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-mono text-[10px] tracking-widest text-muted uppercase mb-3">Détails du certificat</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Numéro</span>
                <span className="font-mono text-xs text-gold">{cert.certificate_number}</span>
              </div>
              {cert.category && (
                <div className="flex justify-between">
                  <span className="text-muted">Catégorie</span>
                  <span className="text-xs text-white">{CATEGORY_LABELS[cert.category] || cert.category}</span>
                </div>
              )}
              {cert.native_language && (
                <div className="flex justify-between">
                  <span className="text-muted">Langue maternelle</span>
                  <span className="text-xs text-white">{LANGUAGES[cert.native_language]?.flag} {LANGUAGES[cert.native_language]?.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Code vérif.</span>
                <span className="font-mono text-sm text-gold font-bold">{cert.verification_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Émis le</span>
                <span className="text-white text-xs">{formatDate(cert.issued_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Valide jusqu'à</span>
                <span className="text-white text-xs">{formatDate(cert.valid_until)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Statut</span>
                <span className={`text-xs font-mono ${cert.is_valid ? 'text-green-400' : 'text-red-400'}`}>
                  {cert.is_valid ? '✓ Valide' : '✗ Expiré'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu du certificat */}
        <div className="md:col-span-2">
          <div className="rounded overflow-hidden" style={{
            background: 'linear-gradient(135deg, #0D2D52 0%, #1B4F8A 60%, #0D2D52 100%)',
            border: '2px solid #E8941A',
            padding: '2.5rem',
            textAlign: 'center',
            position: 'relative',
          }}>
            {/* Watermark */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%) rotate(-25deg)', fontFamily:'Georgia,serif', fontSize:'7rem', fontWeight:700, color:'rgba(255,255,255,0.025)', pointerEvents:'none', whiteSpace:'nowrap' }}>
              LINGUA
            </div>

            <div className="font-mono text-[9px] tracking-[0.35em] text-white/40 uppercase mb-1">AGTM Digital Academy · Abidjan, Côte d'Ivoire</div>
            <div className="font-serif text-base font-light tracking-[0.3em] text-gold-lt uppercase mb-4">Certificat Officiel de Niveau Linguistique</div>

            <div className="w-16 h-px mx-auto mb-4" style={{ background: 'linear-gradient(90deg, transparent, #E8941A, transparent)' }} />

            <div className="text-xs text-white/50 font-mono mb-1">Ce document certifie que</div>
            <div className="font-serif text-2xl font-semibold text-white tracking-wider mb-1">{cert.recipient_name.toUpperCase()}</div>
            <div className="text-xs text-white/50 mb-2">a obtenu le niveau</div>

            <div className="inline-block font-serif text-5xl font-bold text-gold border-2 border-gold px-6 py-1 my-2 tracking-wider">
              {cert.level_certified}
            </div>

            <div className="text-xs text-white/50 font-mono tracking-wider mb-1 mt-2">
              {LEVEL_LABELS[cert.level_certified]} · {lang?.name.toUpperCase()}
            </div>

            {/* Scores */}
            {cert.rubric_scores ? (
              <div className="grid grid-cols-3 gap-2 my-4">
                {Object.entries(cert.rubric_scores).map(([key, val]) => (
                  <div key={key} style={{ background:'rgba(0,0,0,0.25)', padding:'.75rem', borderRadius:2 }}>
                    <div className="font-serif text-lg text-[#F5B942]">{val}%</div>
                    <div className="font-mono text-[8px] text-white/40 uppercase tracking-wider mt-0.5">{RUBRIC_LABELS[key] || key}</div>
                  </div>
                ))}
                <div style={{ background:'rgba(0,0,0,0.25)', padding:'.75rem', borderRadius:2, border:'1.5px solid rgba(232,148,26,0.4)' }}>
                  <div className="font-serif text-lg text-gold">{cert.score_global}%</div>
                  <div className="font-mono text-[8px] text-white/40 uppercase tracking-wider mt-0.5">Score global</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 my-4">
                {[
                  { label: 'Comp. orale',   val: cert.score_listening },
                  { label: 'Comp. écrite',  val: cert.score_reading },
                  { label: 'Grammaire',     val: cert.score_grammar },
                  { label: 'Score global',  val: cert.score_global, highlight: true },
                ].map(s => (
                  <div key={s.label} style={{ background:'rgba(0,0,0,0.25)', padding:'.75rem', borderRadius:2, border: s.highlight ? '1.5px solid rgba(232,148,26,0.4)' : 'none' }}>
                    <div className="font-serif text-lg" style={{ color: s.highlight ? '#E8941A' : '#F5B942' }}>{s.val}%</div>
                    <div className="font-mono text-[8px] text-white/40 uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="font-serif text-sm italic text-white/50 mb-4">
              Score global de <strong className="text-gold-lt">{cert.score_global}%</strong> — Niveau <strong>{cert.level_certified}</strong> validé
              {cert.category && <span className="block text-xs text-white/40 mt-1">Catégorie : {CATEGORY_LABELS[cert.category] || cert.category}</span>}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end pt-4" style={{ borderTop:'1px solid rgba(232,148,26,0.25)' }}>
              <div className="text-left">
                <div className="w-24 h-px bg-white/20 mb-1" />
                <div className="font-serif text-sm text-white">Chairman Bamba</div>
                <div className="font-mono text-[8px] text-white/40 uppercase tracking-wider">Directeur — AGTM Digital Academy</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white flex items-center justify-center text-dark text-xs font-mono mx-auto mb-1">QR</div>
                <div className="font-mono text-[8px] text-white/30">verify/{cert.verification_code}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] text-gold">{cert.certificate_number}</div>
                <div className="font-mono text-[8px] text-white/30 leading-relaxed">
                  Émis le {formatDate(cert.issued_at)}<br/>
                  Valide jusqu'au {formatDate(cert.valid_until)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}