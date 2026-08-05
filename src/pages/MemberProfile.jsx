import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Calendar, Wallet, Receipt, Pencil, Trash2, Power } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatCurrency, formatDate } from '../utils/format'
import { monthLabel } from '../utils/month'
import { paymentStatus } from '../utils/finance'
import StatusPill from '../components/StatusPill'
import Sheet from '../components/Sheet'
import MemberForm from '../features/members/MemberForm'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'

export default function MemberProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { members, payments, fines, updateMember, deleteMember } = useData()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const member = members.find((m) => m.id === id)
  const memberPayments = useMemo(() => payments.filter((p) => p.memberId === id).sort((a, b) => b.monthId.localeCompare(a.monthId)), [payments, id])
  const memberFines = useMemo(() => fines.filter((f) => f.memberId === id).sort((a, b) => b.date.localeCompare(a.date)), [fines, id])

  const totals = useMemo(() => {
    const fee = Number(member?.defaultFee) || 0
    const totalContrib = memberPayments.reduce((s, p) => s + (Number(p.amountPaid) || 0), 0)
    const pendingAmount = memberPayments.reduce((s, p) => s + Math.max(0, fee - (Number(p.amountPaid) || 0)), 0)
    const totalFines = memberFines.reduce((s, f) => s + f.amount, 0)
    const pendingFines = memberFines.filter((f) => f.status !== 'paid').reduce((s, f) => s + f.amount, 0)
    return { totalContrib, pendingAmount, totalFines, pendingFines }
  }, [memberPayments, memberFines, member])

  if (!member) {
    return <EmptyState title="Member not found" message="This member may have been removed." action={<button onClick={() => navigate('/members')} className="btn-primary px-5">Back to Members</button>} />
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/members')} className="flex items-center gap-1.5 text-sm font-medium text-ink-600 dark:text-cloud-200">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card flex items-start gap-4">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white grid place-items-center font-display font-extrabold text-xl shrink-0">
          {member.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display font-extrabold text-xl text-ink-900 dark:text-white">{member.name}</h2>
            <StatusPill status={member.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-ink-400">
            <span className="flex items-center gap-1"><Calendar size={13} /> Joined {formatDate(member.joiningDate)}</span>
            {member.phone && <span className="flex items-center gap-1"><Phone size={13} /> {member.phone}</span>}
            <span className="flex items-center gap-1"><Wallet size={13} /> {formatCurrency(member.defaultFee)}/mo</span>
          </div>
          {member.notes && <p className="text-sm text-ink-600 dark:text-cloud-200 mt-2">{member.notes}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setEditOpen(true)} className="btn-secondary flex-1 flex items-center justify-center gap-2"><Pencil size={16} /> Edit</button>
        <button onClick={() => updateMember(member.id, { status: member.status === 'active' ? 'inactive' : 'active' })} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <Power size={16} /> {member.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
        </button>
        <button onClick={() => setConfirmOpen(true)} className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500"><Trash2 size={18} /></button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Total Contributions" value={formatCurrency(totals.totalContrib)} tone="green" />
        <MiniStat label="Pending Amount" value={formatCurrency(totals.pendingAmount)} tone="amber" />
        <MiniStat label="Total Fines" value={formatCurrency(totals.totalFines)} tone="navy" />
        <MiniStat label="Pending Fines" value={formatCurrency(totals.pendingFines)} tone="rose" />
      </div>

      <div className="card">
        <h3 className="font-display font-bold text-ink-900 dark:text-white mb-3 flex items-center gap-2"><Wallet size={17} /> Payment History</h3>
        {memberPayments.length === 0 ? <p className="text-sm text-ink-400 py-4 text-center">No payment records yet.</p> : (
          <ul className="divide-y divide-cloud-100 dark:divide-white/5">
            {memberPayments.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-ink-900 dark:text-white">{monthLabel(p.monthId)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ink-600 dark:text-cloud-200">{formatCurrency(p.amountPaid)} / {formatCurrency(member.defaultFee)}</span>
                  <StatusPill status={paymentStatus(member.defaultFee, p.amountPaid)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3 className="font-display font-bold text-ink-900 dark:text-white mb-3 flex items-center gap-2"><Receipt size={17} /> Fine History</h3>
        {memberFines.length === 0 ? <p className="text-sm text-ink-400 py-4 text-center">No fines recorded.</p> : (
          <ul className="divide-y divide-cloud-100 dark:divide-white/5">
            {memberFines.map((f) => (
              <li key={f.id} className="py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 dark:text-white truncate">{f.reason}</p>
                  <p className="text-xs text-ink-400">{formatDate(f.date)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-ink-900 dark:text-white">{formatCurrency(f.amount)}</span>
                  <StatusPill status={f.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit Member">
        <MemberForm member={member} onDone={() => setEditOpen(false)} />
      </Sheet>
      <ConfirmDialog
        open={confirmOpen} title="Delete this member?"
        message="This permanently removes the member along with their payment and fine history. This can be undone right after with the Undo option."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => { await deleteMember(member.id); setConfirmOpen(false); navigate('/members') }}
      />
    </div>
  )
}

function MiniStat({ label, value, tone }) {
  const tones = { green: 'text-emerald-600', amber: 'text-amber-600', rose: 'text-rose-600', navy: 'text-blue-600' }
  return (
    <div className="card">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`font-display font-extrabold text-lg mt-1 ${tones[tone]}`}>{value}</p>
    </div>
  )
}
