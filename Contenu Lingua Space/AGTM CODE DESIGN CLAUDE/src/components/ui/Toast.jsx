import { useState, useEffect, createContext, useContext, useCallback } from 'react'

// ─── Context ────────────────────────────────────────────────
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id))

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id}
            onClick={() => remove(t.id)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-sm text-sm cursor-pointer
              shadow-2xl border backdrop-blur-sm max-w-sm
              animate-[fadeUp_0.3s_ease]
              ${t.type === 'success' ? 'bg-green-900/80 border-green-500/40 text-green-300'
                : t.type === 'error'   ? 'bg-red-900/80 border-red-500/40 text-red-300'
                : t.type === 'warning' ? 'bg-yellow-900/80 border-yellow-500/40 text-yellow-300'
                : 'bg-card border-blue/40 text-white'}
            `}
          >
            <span>
              {t.type === 'success' ? '✓'
                : t.type === 'error'   ? '✕'
                : t.type === 'warning' ? '⚠'
                : 'ℹ'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Hook pour utiliser les toasts
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export default ToastProvider
