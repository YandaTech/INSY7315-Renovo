import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Phone,
  BarChart2,
  Headphones,
  CreditCard,
  User,
  Users,
  ScrollText,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { isAdmin, useSession } from '../lib/auth'
import { announceLeadCreated, LogCallContext } from '../lib/logCall'
import LogCallModal from '../components/LogCallModal'
import { preloadPages } from '../routes/pages'

const navItems = [
  { label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard'  },
  { label: 'Statistics', icon: BarChart2,       path: '/statistics' },
  { label: 'Pricing',    icon: CreditCard,      path: '/pricing'    },
  { label: 'Demo call',  icon: Headphones,      path: '/demo-call'  },
]

// Only admins see these (the routes and the API refuse staff as well)
const adminNavItems = [
  { label: 'Staff',      icon: Users,           path: '/staff'      },
  { label: 'Audit log',  icon: ScrollText,      path: '/audit'      },
]

function NavButton({ label, icon: Icon, active, onClick }: {
  label: string
  icon: typeof User
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left w-full ${
        active
          ? 'bg-sea-100 text-sea-900'
          : 'text-sea-800/80 hover:bg-sea-50 hover:text-sea-900'
      }`}
    >
      <Icon size={18} className={active ? 'text-sea-700' : 'text-sea-500'} />
      {label}
    </button>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logCallOpen, setLogCallOpen] = useState(false)
  const { user, logout } = useSession()

  const openLogCall = useCallback(() => {
    setMenuOpen(false)
    setLogCallOpen(true)
  }, [])
  const closeLogCall = useCallback(() => setLogCallOpen(false), [])
  const logCallContext = useMemo(() => ({ openLogCall }), [openLogCall])

  // Fetch the other pages' chunks once this page has rendered
  useEffect(() => {
    const timer = window.setTimeout(preloadPages, 1000)
    return () => window.clearTimeout(timer)
  }, [])

  function go(path: string) {
    setMenuOpen(false)
    navigate(path)
  }

  async function logOut() {
    // Clears the session cookie on the server; back to login either way
    try {
      await logout()
    } catch {
      // offline or server down: the local session is already cleared
    }
    go('/login')
  }

  const logo = (
    <button
      type="button"
      className="flex items-center gap-2.5 px-2"
      onClick={() => go('/dashboard')}
    >
      <img src="/renovologo.png" alt="" width={36} height={36} className="w-9 h-9 object-contain" />
      <span className="font-bold text-ink tracking-tight">Renovo Cape</span>
    </button>
  )

  const sidebar = (
    <>
      <div className="mb-8 hidden lg:block">{logo}</div>

      <button
        type="button"
        onClick={openLogCall}
        className="mb-4 flex items-center justify-center gap-2 rounded-md bg-brand-500 px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
      >
        <Phone size={16} /> Log a call
      </button>

      <nav aria-label="Main" className="flex flex-col gap-1 flex-1">
        {[...navItems, ...(isAdmin(user) ? adminNavItems : [])].map(item => (
          <NavButton
            key={item.path}
            label={item.label}
            icon={item.icon}
            active={location.pathname === item.path}
            onClick={() => go(item.path)}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-sea-100 pt-4">
        <NavButton
          label="Profile"
          icon={User}
          active={location.pathname === '/profile'}
          onClick={() => go('/profile')}
        />
        <NavButton label="Log Out" icon={LogOut} onClick={logOut} />
      </div>
    </>
  )

  return (
    <LogCallContext.Provider value={logCallContext}>
    <div className="flex h-screen overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-sea-100 py-6 px-4">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-sea-900/30"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-white py-6 px-4 shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-sea-100 px-4 py-3">
          {logo}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="p-2 rounded-lg text-sea-700 hover:bg-sea-50"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {logCallOpen && (
        <LogCallModal
          onClose={closeLogCall}
          onSaved={() => {
            closeLogCall()
            announceLeadCreated()
          }}
        />
      )}
    </div>
    </LogCallContext.Provider>
  )
}
