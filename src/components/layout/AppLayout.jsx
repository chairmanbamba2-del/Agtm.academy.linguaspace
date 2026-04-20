import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <Sidebar />
      <main className="md:ml-60 pt-20 px-4 md:px-8 pb-10 min-h-screen">
        {children}
      </main>
    </div>
  )
}
