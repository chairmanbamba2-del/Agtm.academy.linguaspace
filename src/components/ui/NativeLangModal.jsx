import { useState } from 'react'
import { useUserStore } from '../../store/userStore'
import { updateNativeLanguage } from '../../lib/supabase'
import MasterCard from './MasterCard'

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', desc: 'Par défaut pour les apprenants francophones' },
  { code: 'en', label: 'English',  flag: '🇬🇧', desc: 'For English-speaking learners' },
  { code: 'es', label: 'Español',  flag: '🇪🇸', desc: 'Para estudiantes hispanohablantes' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪', desc: 'Für deutschsprachige Lernende' },
  { code: 'ar', label: 'العربية',   flag: '🇸🇦', desc: 'للناطقين بالعربية' },
]

export default function NativeLangModal({ onClose }) {
  const user = useUserStore(s => s.user)
  const setNativeLanguage = useUserStore(s => s.setNativeLanguage)
  const [saving, setSaving] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  async function handleSelect(code) {
    if (!user) return
    if (dontShowAgain) {
      sessionStorage.setItem('lingua_native_lang_dismissed', 'true')
    }
    setSaving(true)
    await updateNativeLanguage(user.id, code)
    setNativeLanguage(code)
    setSaving(false)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <MasterCard variant="content" padding="md" className="w-full max-w-lg"
        style={{ animation: 'card-appear 0.35s ease-out forwards' }}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🌍</div>
          <h2 className="font-serif text-xl text-white mb-1">
            Quelle est votre langue maternelle ?
          </h2>
          <p className="text-sm text-muted">
            Cette information permet au coach IA de vous enseigner en mode bilingue pour un apprentissage accéléré.
          </p>
        </div>

        <div className="space-y-2.5">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => handleSelect(l.code)} disabled={saving}
              className="w-full flex items-center gap-4 px-5 py-3.5 rounded-card transition-all duration-250 hover:scale-[1.01] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
              <span className="text-2xl">{l.flag}</span>
              <div className="text-left">
                <div className="text-white font-medium text-sm">{l.label}</div>
                <div className="text-muted text-xs">{l.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-3xs text-muted mt-4">
          Vous pourrez modifier ce choix à tout moment dans les paramètres.
        </p>

        <label className="flex items-center justify-center gap-2 mt-3 cursor-pointer">
          <input type="checkbox" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-gold"
            style={{ accentColor: '#E8941A' }} />
          <span className="text-3xs text-muted">Ne plus afficher cette fenêtre</span>
        </label>
      </MasterCard>
    </div>
  )
}
