import { Moon, Sun, Info, ShieldCheck } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { dark, toggle } = useTheme()
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4 max-w-lg">
      <div className="card flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-ink-900 dark:text-white">Appearance</p>
          <p className="text-xs text-ink-400 mt-0.5">Switch between light and dark mode</p>
        </div>
        <button onClick={toggle} className="h-11 w-11 rounded-2xl bg-cloud-100 dark:bg-white/5 grid place-items-center">
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>

      <div className="card">
        <p className="font-semibold text-sm text-ink-900 dark:text-white">Today</p>
        <p className="text-xs text-ink-400 mt-0.5">{today}</p>
      </div>

      <div className="card flex items-start gap-3">
        <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm text-ink-900 dark:text-white">Private & Offline</p>
          <p className="text-xs text-ink-400 mt-0.5">All club data is stored only on this device using IndexedDB. Nothing is sent to a server. Use Backup & Restore to move data to another phone or computer.</p>
        </div>
      </div>

      <div className="card flex items-start gap-3">
        <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm text-ink-900 dark:text-white">About</p>
          <p className="text-xs text-ink-400 mt-0.5">Makki Town Badminton Club Management System — built to replace manual Excel tracking with an easy, mobile-first finance app.</p>
        </div>
      </div>
    </div>
  )
}
