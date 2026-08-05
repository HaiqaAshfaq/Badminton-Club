import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarDays, Wallet, Receipt, FileBarChart, PieChart, Settings, DatabaseBackup, HelpCircle, X, PiggyBank } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/months', label: 'Monthly Records', icon: CalendarDays },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/payments', label: 'Monthly Payments', icon: Wallet },
  { to: '/fines', label: 'Fines', icon: Receipt },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/last-month-balance', label: 'Last Month Balance', icon: PiggyBank },
  { to: '/statistics', label: 'Statistics', icon: PieChart },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/backup', label: 'Backup & Restore', icon: DatabaseBackup },
  { to: '/help', label: 'Help & Instructions', icon: HelpCircle },
]

function Brand() {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 grid place-items-center shadow-lg shadow-blue-600/20">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <circle cx="12" cy="7" r="5" fill="white" fillOpacity="0.95" />
          <path d="M12 12 L7 22 M12 12 L12 22 M12 12 L17 22" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="font-display font-extrabold leading-tight text-[15px] text-ink-900 dark:text-white">Makki Town</p>
        <p className="text-xs text-ink-400 -mt-0.5">Badminton Club</p>
      </div>
    </div>
  )
}

export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-cloud-200 dark:border-white/5 bg-white dark:bg-navy-900">
      <Brand />
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/25'
                  : 'text-ink-600 dark:text-cloud-200 hover:bg-cloud-100 dark:hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-[11px] text-ink-400 border-t border-cloud-200 dark:border-white/5">
        Works fully offline · data stays on this device
      </div>
    </aside>
  )
}

export function MobileSidebar({ open, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.aside
        initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-navy-900 flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between pr-3">
          <Brand />
          <button onClick={onClose} className="p-2 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'text-ink-600 dark:text-cloud-200 hover:bg-cloud-100 dark:hover:bg-white/5'
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
      </motion.aside>
    </div>
  )
}

export function BottomNav() {
  const items = NAV.slice(0, 5)
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-navy-900 border-t border-cloud-200 dark:border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10.5px] font-medium ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-ink-400'
              }`
            }
          >
            <Icon size={20} />
            <span className="leading-none">{label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
