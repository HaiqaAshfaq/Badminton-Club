import { useMemo, useState } from 'react'
import { PlusCircle, Search, Trash2, Pencil, Wallet } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatCurrency, formatDate } from '../utils/format'
import EmptyState from '../components/EmptyState'
import Sheet from '../components/Sheet'
import ExpenseForm from '../features/expenses/ExpenseForm'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Expenses() {
  const { expenses, deleteExpense } = useData()
  const [q, setQ] = useState('')
  const [sheet, setSheet] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const rows = useMemo(() => expenses
    .filter((e) => e.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [expenses, q])

  const total = rows.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-ink-400">Total Expenses</p>
          <p className="font-display font-extrabold text-xl text-rose-600 mt-1">{formatCurrency(total)}</p>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-rose-500/10 grid place-items-center"><Wallet className="text-rose-500" size={20} /></div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-cloud-100 dark:bg-white/5 rounded-2xl px-3.5 py-3 flex-1">
          <Search size={17} className="text-ink-400 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search expenses" className="bg-transparent outline-none text-sm w-full" />
        </div>
        <button onClick={() => setSheet({ mode: 'add' })} className="btn-primary px-4 flex items-center gap-2 shrink-0">
          <PlusCircle size={17} /> <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No expenses yet" message="Record club expenses like shuttle, lights, or refreshments." />
      ) : (
        <div className="space-y-2.5">
          {rows.map((e) => (
            <div key={e.id} className="card flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-ink-900 dark:text-white truncate">{e.title}</p>
                <p className="text-xs text-ink-400 truncate">{formatDate(e.date)}{e.description ? ` · ${e.description}` : ''}</p>
              </div>
              <span className="font-display font-bold text-sm text-rose-600 shrink-0">-{formatCurrency(e.amount)}</span>
              <button onClick={() => setSheet({ mode: 'edit', expense: e })} className="p-2 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10 shrink-0"><Pencil size={15} className="text-ink-400" /></button>
              <button onClick={() => setConfirmId(e.id)} className="p-2 rounded-full hover:bg-rose-500/10 shrink-0"><Trash2 size={15} className="text-rose-500" /></button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.mode === 'edit' ? 'Edit Expense' : 'Add Expense'}>
        <ExpenseForm expense={sheet?.expense} onDone={() => setSheet(null)} />
      </Sheet>
      <ConfirmDialog open={!!confirmId} title="Delete this expense?" message="This will remove the expense from the monthly totals."
        onCancel={() => setConfirmId(null)} onConfirm={async () => { await deleteExpense(confirmId); setConfirmId(null) }} />
    </div>
  )
}
