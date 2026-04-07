import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Store,
  Users,
  UserCog,
  LogOut,
  Shield,
  CreditCard,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/tenants', label: 'Shops', icon: Store, end: false },
  { to: '/admin/customers', label: 'Customers', icon: Users, end: false },
  { to: '/admin/users', label: 'Users', icon: UserCog, end: false },
  { to: '/admin/billing', label: 'Billing', icon: CreditCard, end: false },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-red-600">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">Smoke Rewards</p>
          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold bg-red-600 text-white leading-none">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-700">
        {user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-xs text-red-400 font-medium">
              Super Admin
            </span>
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
