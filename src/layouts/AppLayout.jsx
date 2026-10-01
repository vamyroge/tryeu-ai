import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}