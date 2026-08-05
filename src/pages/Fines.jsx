import { useMemo, useState } from 'react'
import { PlusCircle, Search, Trash2, Pencil, Receipt } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatCurrency, formatDate } from '../utils/format'
import StatusPill from '../components/StatusPill'
import EmptyState from '../components/EmptyState'
import Sheet from '../components/Sheet'
import FineForm from '../features/fines/FineForm'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Fines() {
  const { members, fines, deleteFine, updateFine } = useData()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [sheet, setSheet] = useState(null) // { mode: 'add'|'edit', fine }
  const [confirmId, setConfirmId] = useState(null)

  const rows = useMemo(() => {
    return fines
      .filter((f) => (filter === 'all' ? true : f.status === filter))
      .map((f) => ({ ...f, member: members.find((m) => m.id === f.memberId) }))
      .filter((f) => (f.member?.name || '').toLowerCase().includes(q.toLowerCase()) || f.reason.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [fines, members, q, filter])

  const totals = useMemo(() => ({
    total: fines.reduce((s, f) => s + f.amount, 0),
    collected: fines.filter((f) => f.status === 'paid').reduce((s, f) => s + f.amount, 0),
    pending: fines.filter((f) => f.status !== 'paid').reduce((s, f) => s + f.amount, 0),
  }), [fines])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="card !p-3"><p className="text-[11px] text-ink-400 font-semibold uppercase">Total</p><p className="font-display font-bold text-sm mt-1 text-ink-900 dark:text-white">{formatCurrency(totals.total)}</p></div>
        <div className="card !p-3"><p className="text-[11px] text-ink-400 font-semibold uppercase">Collected</p><p className="font-display font-bold text-sm mt-1 text-emerald-600">{formatCurrency(totals.collected)}</p></div>
        <div className="card !p-3"><p className="text-[11px] text-ink-400 font-semibold uppercase">Pending</p><p className="font-display font-bold text-sm mt-1 text-rose-600">{formatCurrency(totals.pending)}</p></div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-cloud-100 dark:bg-white/5 rounded-2xl px-3.5 py-3 flex-1">
          <Search size={17} className="text-ink-400 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search member or reason" className="bg-transparent outline-none text-sm w-full" />
        </div>
        <button onClick={() => setSheet({ mode: 'add' })} className="btn-primary px-4 flex items-center gap-2 shrink-0">
          <PlusCircle size={17} /> <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'unpaid', 'paid'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-cloud-100 dark:bg-white/5 text-ink-600 dark:text-cloud-200'}`}>{f}</button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Receipt} title="No fines recorded" message="Add a fine to keep track of late arrivals or rule breaks." />
      ) : (
        <div className="space-y-2.5">
          {rows.map((f) => (
            <div key={f.id} className="card flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-ink-900 dark:text-white truncate">{f.member?.name || 'Unknown member'}</p>
                <p className="text-xs text-ink-400 truncate">{f.reason} · {formatDate(f.date)}</p>
              </div>
              <span className="font-display font-bold text-sm text-ink-900 dark:text-white shrink-0">{formatCurrency(f.amount)}</span>
              <button onClick={() => updateFine(f.id, { status: f.status === 'paid' ? 'unpaid' : 'paid', datePaid: f.status === 'paid' ? '' : new Date().toISOString().slice(0,10) })} className="shrink-0">
                <StatusPill status={f.status} />
              </button>
              <button onClick={() => setSheet({ mode: 'edit', fine: f })} className="p-2 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10 shrink-0"><Pencil size={15} className="text-ink-400" /></button>
              <button onClick={() => setConfirmId(f.id)} className="p-2 rounded-full hover:bg-rose-500/10 shrink-0"><Trash2 size={15} className="text-rose-500" /></button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.mode === 'edit' ? 'Edit Fine' : 'Add Fine'}>
        <FineForm fine={sheet?.fine} onDone={() => setSheet(null)} />
      </Sheet>
      <ConfirmDialog open={!!confirmId} title="Delete this fine?" message="This action cannot be undone from here, but a quick restore is available right after deleting."
        onCancel={() => setConfirmId(null)} onConfirm={async () => { await deleteFine(confirmId); setConfirmId(null) }} />
    </div>
  )
}
