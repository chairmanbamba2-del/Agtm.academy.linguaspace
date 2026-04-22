// ============================================================
// AppLayout.jsx — DESIGN ELITE v2
// Structure principale : Navbar fixe + Sidebar fixe + main
// Logique métier : INCHANGÉE (children pass-through)
// ============================================================
import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark relative overflow-x-hidden">

      {/* ── Arrière-plan texturé global ─────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(232,148,26,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,148,26,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Halo lumineux en coin ───────────────────────────── */}
      <div
        className="fixed top-0 left-0 w-[600px] h-[400px] pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(27,79,138,0.18) 0%, transparent 70%)',
        }}
      />
      <div
        className="fixed bottom-0 right-0 w-[500px] h-[350px] pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at bottom right, rgba(232,148,26,0.08) 0%, transparent 70%)',
        }}
      />

      {/* ── Navbar ──────────────────────────────────────────── */}
      <Navbar onMenuToggle={() => setSidebarOpen(v => !v)} />

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Overlay mobile ──────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-overlay bg-dark/70 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      {/* ── Contenu principal ───────────────────────────────── */}
      <main
        className={[
          // Décalage dynamique selon sidebar
          'relative z-10',
          'md:ml-[240px]',
          // Hauteur navbar
          'pt-[64px]',
          // Padding interne
          'px-4 md:px-8 lg:px-10',
          'pb-12',
          'min-h-screen',
          // Animation d'entrée
          'animate-card-appear',
        ].join(' ')}
      >
        {/* Zone scrollable avec max-width pour grands écrans */}
        <div className="max-w-[1280px] mx-auto w-full pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
