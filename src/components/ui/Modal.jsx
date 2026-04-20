import { useEffect } from 'react'

/**
 * Modal — fenêtre modale universelle
 *
 * Usage :
 *   <Modal open={open} onClose={() => setOpen(false)} title="Confirmation">
 *     <p>Contenu</p>
 *   </Modal>
 */
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  // Fermer avec Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Bloquer le scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`relative w-full ${sizes[size]} bg-card border border-[#1E3A5F] rounded-sm shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          {title && (
            <h3 className="font-serif text-lg text-white">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-muted hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
