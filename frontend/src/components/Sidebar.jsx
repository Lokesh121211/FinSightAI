import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Receipt, PlusCircle, Brain,
  TrendingUp, User, LogOut, Wallet, DollarSign, X
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/add-expense', icon: PlusCircle, label: 'Add Expense' },
  { to: '/income', icon: DollarSign, label: 'Income & Savings' },
  { to: '/ai-insights', icon: Brain, label: 'AI Insights' },
  { to: '/predictions', icon: TrendingUp, label: 'Predictions' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <aside className="w-64 h-screen bg-white border-r-2 border-yellow-200 flex flex-col shadow-lg">

      {/* Gold top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>

      {/* Logo + Close Button */}
      <div className="p-5 border-b border-yellow-100 flex items-center justify-between">
        <motion.div className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-md">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg leading-none">FinSight</h1>
            <p className="text-yellow-600 text-xs font-semibold">AI Finance</p>
          </div>
        </motion.div>

        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }, index) => (
          <motion.div key={to}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}>
            <NavLink
              to={to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-300 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-yellow-600' : 'text-gray-400'} />
                  {label}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-yellow-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-yellow-50 rounded-xl">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 text-sm font-semibold truncate">{user?.full_name}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}