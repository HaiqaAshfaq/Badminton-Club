import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DesktopSidebar, MobileSidebar, BottomNav } from './Sidebar'
import Topbar from './Topbar'
import Toasts from './Toasts'

const TITLES = {
  '/': 'Dashboard',
  '/months': 'Monthly Records',
  '/members': 'Members',
  '/payments': 'Monthly Payments',
  '/fines': 'Fine Management',
  '/expenses': 'Expenses',
  '/reports': 'Reports',
  '/statistics': 'Statistics',
  '/settings': 'Settings',
  '/backup': 'Backup & Restore',
  '/help': 'Help & Instructions',
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const title = pathname.startsWith('/members/') ? 'Member Profile' : (TITLES[pathname] || 'Makki Town')

  return (
    <div className="flex min-h-screen app-shell">
      <DesktopSidebar />
      <MobileSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0">
        <Topbar onMenu={() => setOpen(true)} title={title} />
        <main className="px-4 lg:px-6 py-5 pb-24 lg:pb-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <Toasts />
    </div>
  )
}
