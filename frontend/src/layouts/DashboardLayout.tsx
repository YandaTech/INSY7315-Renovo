import { type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard',  icon: '⊞', path: '/dashboard'  },
  { label: 'Log Call',   icon: '📞', path: '/log-call'   },
  { label: 'Statistics', icon: '📊', path: '/statistics' },
  { label: 'Pricing',    icon: '💳', path: '/pricing'    },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-48 bg-[#1a237e] flex flex-col py-6 px-3 shrink-0">

        {/* Logo */}
        <div
          className="flex items-center gap-2 px-3 mb-8 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <img
            src="/renovologo.png"
            alt="Renovo Cape"
            className="w-8 h-8 object-contain"
          />
          <span className="text-white font-bold text-sm">
            Renovo Cape
          </span>
        </div>

        {/* Main nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left w-full ${
                location.pathname === item.path
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 text-left w-full"
          >
            👤 Profile
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 text-left w-full"
          >
            🚪 Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  )
}