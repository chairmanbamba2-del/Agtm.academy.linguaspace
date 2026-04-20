import { useState, useRef } from 'react'
import { startListening } from '../../lib/ai'

/**
 * VoiceButton — bouton d'entrée vocale (Speech-to-Text)
 *
 * Usage :
 *   <VoiceButton language="en" onTranscript={(text) => sendMessage(text)} />
 */
export default function VoiceButton({ language = 'en', onTranscript, disabled = false }) {
  const [listening, setListening] = useState(false)
  const [error, setError]         = useState('')
  const recognitionRef            = useRef(null)

  function toggle() {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    setError('')
    setListening(true)

    recognitionRef.current = startListening(
      language,
      (transcript) => {
        setListening(false)
        onTranscript(transcript)
      },
      (err) => {
        setListening(false)
        setError(err)
        setTimeout(() => setError(''), 4000)
      }
    )

    // Sécurité : arrêt auto après 60s
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        setListening(false)
      }
    }, 60000)
  }

  const langLabels = { en: 'en anglais', fr: 'en français', es: 'en español', de: 'auf Deutsch' }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={toggle}
        disabled={disabled}
        title={listening ? 'Arrêter' : `Parler ${langLabels[language] || ''}`}
        className={`
          w-12 h-12 rounded flex items-center justify-center text-xl
          transition-all duration-200 border
          disabled:opacity-40 disabled:cursor-not-allowed
          ${listening
            ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse scale-110'
            : 'bg-card border-white/10 text-muted hover:text-white hover:border-white/30'
          }
        `}
      >
        {listening ? '⏹' : '🎙️'}
      </button>

      {error && (
        <p className="text-[10px] text-red-400 text-center max-w-[80px] leading-tight">{error}</p>
      )}
    </div>
  )
}
