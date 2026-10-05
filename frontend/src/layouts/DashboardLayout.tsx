import { type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Phone,
  BarChart2,
  CreditCard,
  User,
  LogOut
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard'  },
  { label: 'Log Call',   icon: Phone,            path: '/log-call'   },
  { label: 'Statistics', icon: BarChart2,         path: '/statistics' },
  { label: 'Pricing',    icon: CreditCard,        path: '/pricing'    },
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
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left w-full ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Bottom nav */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 text-left w-full"
          >
            <User size={16} />
            Profile
          </button>
          <button
  onClick={() => {
    localStorage.removeItem('token')
    navigate('/login')
  }}
  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 text-left w-full"
>
  <LogOut size={16} />
  Log Out
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