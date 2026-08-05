import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { useData } from '../context/DataContext'
import { monthLabel, compareMonthIds } from '../utils/month'
import { formatCurrency } from '../utils/format'
import EmptyState from '../components/EmptyState'

export default function MonthlyRecords() {
  const { months, payments, expenses } = useData()
  const navigate = useNavigate()

  const rows = useMemo(() => {
    return [...months]
      .sort((a, b) => compareMonthIds(b.id, a.id))
      .map((m) => {
        const monthPayments = payments.filter((p) => p.monthId === m.id)
        const collection = monthPayments.reduce((s, p) => s + (Number(p.amountPaid) || 0), 0)
        const monthExpenses = expenses.filter((e) => e.monthId === m.id).reduce((s, e) => s + e.amount, 0)
        const carriedForward = Number(m.carriedForward) || 0
        return { ...m, collection, expenses: monthExpenses, carriedForward, balance: collection + carriedForward - monthExpenses, memberCount: monthPayments.length }
      })
  }, [months, payments, expenses])

  if (rows.length === 0) return <EmptyState icon={CalendarDays} title="No monthly records yet" />

  return (
    <div className="space-y-2.5">
      {rows.map((m) => (
        <button key={m.id} onClick={() => navigate(`/payments?month=${m.id}`)} className="card w-full flex items-center gap-3 text-left">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white grid place-items-center shrink-0">
            <CalendarDays size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-ink-900 dark:text-white">{monthLabel(m.id)}</p>
            <p className="text-xs text-ink-400">{m.memberCount} members · Collected {formatCurrency(m.collection)}</p>
          </div>
          <span className={`font-display font-bold text-sm shrink-0 ${m.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(m.balance)}</span>
          <ChevronRight size={16} className="text-ink-400 shrink-0" />
        </button>
      ))}
    </div>
  )
}
