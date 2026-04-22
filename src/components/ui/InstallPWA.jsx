import { useState, useEffect } from 'react'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Vérifier si déjà installé via localStorage
    const installed = localStorage.getItem('pwa_installed')
    if (installed) {
      setIsInstalled(true)
      setShowInstall(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem('pwa_installed', 'true')
      setShowInstall(false)
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }

  if (isInstalled || !showInstall) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-slide-up">
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-sm shadow-2xl"
        style={{
          background: 'rgba(8,15,26,0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(232,148,26,0.2)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #E8941A, #F5B942)', color: '#080F1A' }}>
            LS
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-white text-sm font-medium">Installer Lingua Space</span>
            <span className="text-muted text-[10px]">Application rapide, accessible hors-ligne</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="text-[11px] font-semibold tracking-widest uppercase px-4 py-2 rounded-sm transition-all duration-250 hover:-translate-y-px"
            style={{
              background: 'linear-gradient(135deg, #E8941A, #F5B942)',
              color: '#080F1A',
              boxShadow: '0 4px 16px rgba(232,148,26,0.3)',
            }}
          >
            Installer
          </button>
          <button
            onClick={() => setShowInstall(false)}
            className="text-muted hover:text-white transition-colors text-lg leading-none px-2"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}