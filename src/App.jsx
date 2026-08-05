import { HashRouter, Routes, Route } from 'react-router-dom'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { DataProvider, useData } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import MemberProfile from './pages/MemberProfile'
import MonthlyPayments from './pages/MonthlyPayments'
import MonthlyRecords from './pages/MonthlyRecords'
import Fines from './pages/Fines'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import LastMonthBalance from './pages/LastMonthBalance'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import BackupRestore from './pages/BackupRestore'
import Help from './pages/Help'

function AppRoutes() {
  const { loading, loadError } = useData()

  if (loadError) {
    return (
      <div className="min-h-screen grid place-items-center app-shell px-6">
        <div className="card max-w-sm w-full text-center">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 grid place-items-center mx-auto mb-3">
            <AlertTriangle size={24} className="text-rose-500" />
          </div>
          <h2 className="font-display font-bold text-lg text-ink-900 dark:text-white">Couldn't load your data</h2>
          <p className="text-sm text-ink-400 mt-1.5">
            Your club data is stored safely on this device. Reloading the page usually fixes this.
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
            <RefreshCw size={16} /> Reload App
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center app-shell">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 grid place-items-center animate-pulse">
            <span className="text-white font-display font-extrabold text-lg">MT</span>
          </div>
          <p className="text-sm text-ink-400">Loading your club data...</p>
        </div>
      </div>
    )
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/months" element={<MonthlyRecords />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/:id" element={<MemberProfile />} />
        <Route path="/payments" element={<MonthlyPayments />} />
        <Route path="/fines" element={<Fines />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/last-month-balance" element={<LastMonthBalance />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/backup" element={<BackupRestore />} />
        <Route path="/help" element={<Help />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DataProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
