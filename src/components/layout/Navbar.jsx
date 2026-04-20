import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useUserStore } from '../../store/userStore'
import { useSignOut } from '../../hooks/useAuth'
import { LANGUAGES } from '../../lib/constants'

export default function Navbar() {
  const location = useLocation()
  const user = useUserStore(s => s.user)
  const subscription = useUserStore(s => s.subscription)
  const [menuOpen, setMenuOpen] = useState(false)
  const signOut = useSignOut()

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
         style={{ background: 'rgba(8,15,26,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(232,148,26,0.12)' }}>

      {/* Logo */}
      <Link to={user ? '/dashboard' : '/'} className="flex flex-col leading-none">
        <span className="font-mono text-[9px] tracking-[0.25em] text-muted uppercase">AGTM Digital Academy</span>
        <span className="font-serif text-xl text-gold">LINGUA SPACE</span>
      </Link>

      {/* Desktop nav */}
      {user && (
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-white' : 'text-muted hover:text-white'}`}>
            Dashboard
          </Link>
          <Link to="/assistant" className={`text-sm font-medium transition-colors ${isActive('/assistant') ? 'text-white' : 'text-muted hover:text-white'}`}>
            IA Coach
          </Link>
          <Link to="/progress" className={`text-sm font-medium transition-colors ${isActive('/progress') ? 'text-white' : 'text-muted hover:text-white'}`}>
            Progression
          </Link>
          {!subscription && (
            <Link to="/subscribe" className="btn-gold text-xs py-2 px-4">S'abonner</Link>
          )}
          <button onClick={signOut} className="text-sm text-muted hover:text-white transition-colors">
            Déconnexion
          </button>
        </div>
      )}

      {!user && (
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login"  className="text-sm text-muted hover:text-white transition-colors">Connexion</Link>
          <Link to="/signup" className="btn-gold text-xs py-2 px-4">Commencer</Link>
        </div>
      )}

      {/* Mobile hamburger */}
      <button className="md:hidden text-white text-xl" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-dark border-t border-card py-4 flex flex-col gap-4 px-6 md:hidden">
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-white">Dashboard</Link>
              <Link to="/assistant" onClick={() => setMenuOpen(false)} className="text-sm text-white">IA Coach</Link>
              <Link to="/progress"  onClick={() => setMenuOpen(false)} className="text-sm text-white">Progression</Link>
              <Link to="/settings"  onClick={() => setMenuOpen(false)} className="text-sm text-white">Paramètres</Link>
              <button onClick={() => { setMenuOpen(false); signOut() }} className="text-sm text-muted text-left">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login"  onClick={() => setMenuOpen(false)} className="text-sm text-white">Connexion</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn-gold text-center text-xs py-2">Commencer</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
