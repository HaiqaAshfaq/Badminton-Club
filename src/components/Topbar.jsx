import { Menu, Moon, Sun, Search } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Topbar({ onMenu, title }) {
  const { dark, toggle } = useTheme()
  const { saveStatus } = useData()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  function onSearch(e) {
    e.preventDefault()
    if (q.trim()) navigate(`/reports?search=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className="sticky top-0 z-30 bg-cloud-50 dark:bg-navy-950 border-b border-cloud-200 dark:border-white/5">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
        <button onClick={onMenu} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10">
          <Menu size={22} />
        </button>
        <h1 className="font-display font-bold text-lg lg:text-xl text-ink-900 dark:text-white truncate">{title}</h1>

        <form onSubmit={onSearch} className="hidden md:flex items-center gap-2 ml-6 flex-1 max-w-sm bg-cloud-100 dark:bg-white/5 rounded-full px-3.5 py-2">
          <Search size={16} className="text-ink-400" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search member, month, expense..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-ink-400"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            {saveStatus === 'saving' ? 'Saving...' : 'All changes saved'}
          </div>
          <button onClick={toggle} className="p-2.5 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10 text-ink-600 dark:text-cloud-200">
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </div>
    </header>
  )
}
