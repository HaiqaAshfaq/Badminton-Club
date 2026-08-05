import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, ChevronRight, Users } from 'lucide-react'
import { useData } from '../context/DataContext'
import StatusPill from '../components/StatusPill'
import EmptyState from '../components/EmptyState'
import Sheet from '../components/Sheet'
import MemberForm from '../features/members/MemberForm'
import { formatCurrency } from '../utils/format'

export default function Members() {
  const { members } = useData()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('active')
  const [addOpen, setAddOpen] = useState(false)
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    return members
      .filter((m) => (filter === 'all' ? true : m.status === filter))
      .filter((m) => m.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [members, q, filter])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-cloud-100 dark:bg-white/5 rounded-2xl px-3.5 py-3 flex-1">
          <Search size={17} className="text-ink-400 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search members" className="bg-transparent outline-none text-sm w-full" />
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary px-4 flex items-center gap-2 shrink-0">
          <UserPlus size={17} /> <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      <div className="flex gap-2">
        {['active', 'inactive', 'all'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-cloud-100 dark:bg-white/5 text-ink-600 dark:text-cloud-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No members found" message="Try a different search or add a new member." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((m) => (
            <button key={m.id} onClick={() => navigate(`/members/${m.id}`)} className="card text-left flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white grid place-items-center font-display font-bold shrink-0">
                {m.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-ink-900 dark:text-white truncate">{m.name}</p>
                <p className="text-xs text-ink-400">{formatCurrency(m.defaultFee)}/mo</p>
              </div>
              <StatusPill status={m.status} />
              <ChevronRight size={16} className="text-ink-400 shrink-0" />
            </button>
          ))}
        </div>
      )}

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add Member">
        <MemberForm onDone={() => setAddOpen(false)} />
      </Sheet>
    </div>
  )
}
