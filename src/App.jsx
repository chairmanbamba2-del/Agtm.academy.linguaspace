// ============================================================
// App.jsx — VERSION MISE À JOUR v2
// Ajoute les routes : Certification, LevelTest, Certificate,
// Verify (public), Receipts, Admin
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useUserStore } from './store/userStore'
import { supabase } from './lib/supabase'
import ToastProvider from './components/ui/Toast'
import InstallPWA from './components/ui/InstallPWA'
import { useProfile } from './hooks/useAuth'
import Spinner from './components/ui/Spinner'

// ── Pages existantes ────────────────────────────────────────
import Landing      from './pages/Landing'
import Signup       from './pages/Signup'
import Login        from './pages/Login'
import Subscribe    from './pages/Subscribe'
import Onboarding   from './pages/Onboarding'
import Dashboard    from './pages/Dashboard'
import Corner       from './pages/Corner'
import Modules      from './pages/Modules'
import Module       from './pages/Module'
import Assistant    from './pages/Assistant'
import PlacementTest from './pages/PlacementTest'
import Progress     from './pages/Progress'
import Leaderboard  from './pages/Leaderboard'
import Settings     from './pages/Settings'

// ── NOUVELLES pages v2 ──────────────────────────────────────
import Certification     from './pages/Certification'
import LevelTest         from './pages/LevelTest'
import CertificateView   from './pages/CertificateView'
import CertificateVerify from './pages/CertificateVerify'
import Receipts          from './pages/Receipts'
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminUsers        from './pages/admin/Users'
import Finance           from './pages/admin/Finance'
import Marketing         from './pages/admin/Marketing'

// ─── Guards ─────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const user    = useUserStore(s => s.user)
  const loading = useUserStore(s => s.loading)
  const { loading: profileLoading } = useProfile()
  if (loading || profileLoading) return (
    <div className="flex items-center justify-center h-screen bg-dark">
      <Spinner size="lg" label="Chargement..." />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const user    = useUserStore(s => s.user)
  const loading = useUserStore(s => s.loading)
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AdminRoute({ children }) {
  const user    = useUserStore(s => s.user)
  const loading = useUserStore(s => s.loading)
  const isAdmin = useUserStore(s => s.isAdmin)
  if (loading) return null
  return user && isAdmin ? children : <Navigate to="/" replace />
}

// ─── App ────────────────────────────────────────────────────
export default function App() {
  const { setUser, setLoading } = useUserStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <ToastProvider>
      <BrowserRouter>
        <InstallPWA />
        <Routes>
          {/* ── Publiques ── */}
          <Route path="/"                  element={<Landing />} />
          <Route path="/signup"            element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/login"             element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/subscribe"         element={<Subscribe />} />
          {/* Page publique de vérification — sans authentification */}
          <Route path="/verify/:code"      element={<CertificateVerify />} />
          <Route path="/verify"            element={<CertificateVerify />} />

          {/* ── Privées ── */}
          <Route path="/onboarding"           element={<PrivateRoute><Onboarding /></PrivateRoute>} />
          <Route path="/dashboard"            element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/corner/:lang"         element={<PrivateRoute><Corner /></PrivateRoute>} />
          <Route path="/modules/:lang"        element={<PrivateRoute><Modules /></PrivateRoute>} />
          <Route path="/module/:lang/:id"     element={<PrivateRoute><Module /></PrivateRoute>} />
          <Route path="/assistant"            element={<PrivateRoute><Assistant /></PrivateRoute>} />
          <Route path="/placement/:lang"      element={<PrivateRoute><PlacementTest /></PrivateRoute>} />
          <Route path="/progress"             element={<PrivateRoute><Progress /></PrivateRoute>} />
          <Route path="/leaderboard"          element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/settings"             element={<PrivateRoute><Settings /></PrivateRoute>} />

          {/* ── NOUVELLES ROUTES v2 ── */}
          <Route path="/certification"        element={<PrivateRoute><Certification /></PrivateRoute>} />
          <Route path="/level-test/:lang"     element={<PrivateRoute><LevelTest /></PrivateRoute>} />
          <Route path="/certificate/:id"      element={<PrivateRoute><CertificateView /></PrivateRoute>} />
          <Route path="/receipts"             element={<PrivateRoute><Receipts /></PrivateRoute>} />

          {/* ── Admin ── */}
          <Route path="/admin"                element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users"          element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/finance"        element={<AdminRoute><Finance /></AdminRoute>} />
          <Route path="/admin/marketing"      element={<AdminRoute><Marketing /></AdminRoute>} />

          {/* ── Fallback ── */}
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}