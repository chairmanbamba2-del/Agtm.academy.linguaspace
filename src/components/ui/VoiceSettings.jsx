import { useState } from 'react'
import { getVoiceSettings, setVoiceSettings, stopSpeaking, speak } from '../../lib/ai'

const VOICE_OPTIONS = [
  { value: 'female', label: '👩 Voix féminine' },
  { value: 'male',   label: '👨 Voix masculine' },
]

const PROVIDER_OPTIONS = [
  { value: 'auto',     label: '🤖 Automatique (Haute qualité d\'abord)' },
  { value: 'elevenlabs', label: '🔊 ElevenLabs (HD)' },
  { value: 'browser',  label: '🖥️ Synthèse navigateur' },
]

export default function VoiceSettings({ onClose }) {
  const initial = getVoiceSettings()
  const [settings, setSettings] = useState({ ...initial })

  function update(key, value) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    setVoiceSettings({ [key]: value })
  }

  function testVoice() {
    stopSpeaking()
    speak('Bonjour ! Ceci est un test vocal. La qualité audio dépend de votre fournisseur.', 'fr')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0D1F3C] border border-white/10 rounded-sm w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-serif text-xl text-white">Paramètres vocaux</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-lg">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Fournisseur TTS */}
          <div>
            <label className="block text-sm text-muted mb-3">Synthèse vocale (TTS)</label>
            <div className="space-y-2">
              {PROVIDER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update('provider', opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-sm text-sm transition-all ${
                    settings.provider === opt.value
                      ? 'bg-gold/20 border border-gold/50 text-white'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genre de la voix */}
          <div>
            <label className="block text-sm text-muted mb-3">Genre de la voix</label>
            <div className="flex gap-2">
              {VOICE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update('voice', opt.value)}
                  className={`flex-1 px-4 py-3 rounded-sm text-sm transition-all ${
                    settings.voice === opt.value
                      ? 'bg-gold/20 border border-gold/50 text-white'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vitesse */}
          <div>
            <label className="block text-sm text-muted mb-2">
              Vitesse : <strong className="text-white">{settings.speed.toFixed(1)}x</strong>
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.speed}
              onChange={e => update('speed', parseFloat(e.target.value))}
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>🐢 Lent</span>
              <span>🐇 Rapide</span>
            </div>
          </div>

          {/* Test */}
          <button
            onClick={testVoice}
            className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-sm text-sm transition-all"
          >
            🔊 Tester la voix
          </button>

          {/* Info */}
          <div className="bg-gold/8 border border-gold/20 px-4 py-3 text-xs text-muted leading-relaxed">
            💡 <strong className="text-white">ElevenLabs</strong> offre la meilleure qualité audio.
            La <strong className="text-white">synthèse navigateur</strong> fonctionne hors-ligne.
            L'option <strong className="text-white">Automatique</strong> essaie ElevenLabs d'abord.
          </div>
        </div>
      </div>
    </div>
  )
}
