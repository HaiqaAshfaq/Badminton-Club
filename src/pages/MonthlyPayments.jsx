import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useData } from '../context/DataContext'
import { currentMonthId, monthLabel, shiftMonthId } from '../utils/month'
import { formatCurrency } from '../utils/format'
import { paymentStatus } from '../utils/finance'
import StatusPill from '../components/StatusPill'
import EmptyState from '../components/EmptyState'

export default function MonthlyPayments() {
  const { members, payments, upsertPayment } = useData()
  const [params, setParams] = useSearchParams()
  const [mid, setMid] = useState(params.get('month') || currentMonthId())
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)

  useEffect(() => { setParams(mid === currentMonthId() ? {} : { month: mid }) }, [mid]) // eslint-disable-line

  const rows = useMemo(() => {
    const monthPayments = payments.filter((p) => p.monthId === mid)
    return members
      .filter((m) => monthPayments.some((p) => p.memberId === m.id) || m.status === 'active')
      .map((m) => {
        const p = monthPayments.find((x) => x.memberId === m.id)
        // Fee always comes live from the member's current Monthly Fee, not the
        // payment record's stored snapshot — so editing a member's fee updates
        // this page immediately, even for a payment already recorded.
        const fee = Number(m.defaultFee) || 0
        const amountPaid = Number(p?.amountPaid) || 0
        return {
          member: m,
          payment: p
            ? { ...p, defaultFee: fee, status: paymentStatus(fee, amountPaid) }
            : { memberId: m.id, monthId: mid, defaultFee: fee, amountPaid: 0, status: 'unpaid', pendingFromLastMonth: 0 },
        }
      })
      .filter((r) => r.member.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.member.name.localeCompare(b.member.name))
  }, [members, payments, mid, q])

  const totals = rows.reduce((acc, r) => {
    acc.fee += Number(r.payment.defaultFee) || 0
    acc.paid += Number(r.payment.amountPaid) || 0
    return acc
  }, { fee: 0, paid: 0 })

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <button onClick={() => setMid((m) => shiftMonthId(m, -1))} className="p-2 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="font-display font-bold text-ink-900 dark:text-white">{monthLabel(mid)}</p>
          <p className="text-xs text-ink-400">{formatCurrency(totals.paid)} of {formatCurrency(totals.fee)} collected</p>
        </div>
        <button onClick={() => setMid((m) => shiftMonthId(m, 1))} className="p-2 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 bg-cloud-100 dark:bg-white/5 rounded-2xl px-3.5 py-3">
        <Search size={17} className="text-ink-400 shrink-0" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search member" className="bg-transparent outline-none text-sm w-full" />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No members for this month" message="Add active members to start recording payments." />
      ) : (
        <div className="space-y-2.5">
          {rows.map(({ member, payment }) => {
            const remaining = Math.max(0, (Number(payment.defaultFee) || 0) - (Number(payment.amountPaid) || 0))
            const isEditing = editing === member.id
            return (
              <div key={member.id} className="card">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white grid place-items-center font-display font-bold shrink-0 text-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-ink-900 dark:text-white truncate">{member.name}</p>
                      <p className="text-xs text-ink-400">Fee {formatCurrency(payment.defaultFee)}</p>
                    </div>
                  </div>
                  <StatusPill status={payment.status} />
                </div>

                {Number(payment.pendingFromLastMonth) > 0 && (
                  <p className="text-xs text-rose-600 mt-2">Also owes {formatCurrency(payment.pendingFromLastMonth)} pending from last month</p>
                )}

                {isEditing ? (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number" inputMode="numeric" autoFocus defaultValue={payment.amountPaid}
                      onBlur={(e) => { upsertPayment(mid, member.id, { amountPaid: Number(e.target.value) || 0 }); setEditing(null) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                      className="input flex-1"
                    />
                    <button onClick={() => { upsertPayment(mid, member.id, { amountPaid: payment.defaultFee }); setEditing(null) }} className="btn-secondary px-3 py-3.5 text-xs whitespace-nowrap">Mark Full</button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(member.id)} className="mt-3 w-full flex items-center justify-between bg-cloud-100 dark:bg-white/5 rounded-2xl px-4 py-3 text-left">
                    <span className="text-sm text-ink-600 dark:text-cloud-200">Paid: <b className="text-ink-900 dark:text-white">{formatCurrency(payment.amountPaid)}</b></span>
                    <span className="text-sm text-ink-400">Remaining {formatCurrency(remaining)}</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
