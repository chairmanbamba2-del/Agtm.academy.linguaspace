// ============================================================
// App.jsx — VERSION MISE À JOUR v2
// Ajoute les routes : Certification, LevelTest, Certificate,
// Verify (public), Receipts, Admin
// ============================================================
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useUserStore } from './store/userStore'
import { supabase } from './lib/supabase'
import { useProfile } from './hooks/useAuth'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import ToastProvider from './components/ui/Toast'
import InstallPWA from './components/ui/InstallPWA'
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
import CultureTest       from './pages/CultureTest'
import LanguageLab       from './pages/LanguageLab'
import QuranReader       from './components/ui/QuranReader'
import CertificateView   from './pages/CertificateView'
import CertificateVerify from './pages/CertificateVerify'
import Receipts          from './pages/Receipts'
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminUsers        from './pages/admin/Users'
import Finance           from './pages/admin/Finance'
import Marketing         from './pages/admin/Marketing'
import AdminSubscribers  from './pages/admin/Subscribers'
import AIPermissions     from './pages/admin/AIPermissions'
import AdminDocs         from './pages/admin/AdminDocs'
import AdminCertifications from './pages/admin/Certifications'
import AdminRoles         from './pages/admin/AdminRoles'
import AdminInbox         from './pages/admin/AdminInbox'
import Messenger          from './pages/Messenger'

// ─── Guards ─────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const user    = useUserStore(s => s.user)
  const loading = useUserStore(s => s.loading)
  if (loading) return (
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
  const { loading: profileLoading } = useProfile()
  
  if (loading || profileLoading) return (
    <div className="flex items-center justify-center h-screen bg-dark">
      <Spinner size="lg" label="Chargement du profil admin..." />
    </div>
  )
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
    <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <BrowserRouter>
        <InstallPWAWrapper />
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
          <Route path="/culture-test"         element={<PrivateRoute><CultureTest /></PrivateRoute>} />
          <Route path="/certificate/:id"      element={<PrivateRoute><CertificateView /></PrivateRoute>} />
          <Route path="/receipts"             element={<PrivateRoute><Receipts /></PrivateRoute>} />
          <Route path="/messenger"           element={<PrivateRoute><Messenger /></PrivateRoute>} />
          <Route path="/lab/:lang"           element={<PrivateRoute><LanguageLab /></PrivateRoute>} />
          <Route path="/quran"              element={<PrivateRoute><div className="p-6 max-w-4xl mx-auto"><QuranReader /></div></PrivateRoute>} />

          {/* ── Admin ── */}
          <Route path="/admin"                element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users"          element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/finance"        element={<AdminRoute><Finance /></AdminRoute>} />
          <Route path="/admin/marketing"      element={<AdminRoute><Marketing /></AdminRoute>} />
          <Route path="/admin/subscribers"    element={<AdminRoute><AdminSubscribers /></AdminRoute>} />
          <Route path="/admin/ai-permissions" element={<AdminRoute><AIPermissions /></AdminRoute>} />
          <Route path="/admin/docs"           element={<AdminRoute><AdminDocs /></AdminRoute>} />
          <Route path="/admin/certifications" element={<AdminRoute><AdminCertifications /></AdminRoute>} />
          <Route path="/admin/admin-roles"   element={<AdminRoute><AdminRoles /></AdminRoute>} />
          <Route path="/admin/inbox"         element={<AdminRoute><AdminInbox /></AdminRoute>} />

          {/* ── Fallback ── */}
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
    </QueryClientProvider>
  )
}

function InstallPWAWrapper() {
  const location = useLocation()
  const showOn = ['/', '/dashboard']
  if (!showOn.includes(location.pathname)) return null
  return <InstallPWA />
}