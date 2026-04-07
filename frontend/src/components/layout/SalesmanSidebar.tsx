import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Store, Users, LogOut, Briefcase, CreditCard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/salesman', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/salesman/shops', label: 'Shops', icon: Store, end: false },
  { to: '/salesman/customers', label: 'Customers', icon: Users, end: false },
  { to: '/salesman/billing', label: 'Billing', icon: CreditCard, end: false },
]

export default function SalesmanSidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-orange-600">
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">Smoke Rewards</p>
          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold bg-orange-600 text-white leading-none">
            Salesman
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        {user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-xs text-orange-400 font-medium">Salesman</span>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
