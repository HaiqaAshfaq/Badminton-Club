import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search, PiggyBank, Users2, Check } from 'lucide-react'
import { useData } from '../context/DataContext'
import { currentMonthId, monthLabel, shiftMonthId } from '../utils/month'
import { formatCurrency } from '../utils/format'
import { buildMonthSummary } from '../utils/finance'
import EmptyState from '../components/EmptyState'

export default function LastMonthBalance() {
  const { members, months, payments, fines, expenses, activity, setCarriedForward, setPendingFromLastMonth, pushToast } = useData()
  const [params, setParams] = useSearchParams()
  const [mid, setMid] = useState(params.get('month') || currentMonthId())
  const [q, setQ] = useState('')
  const [budgetInput, setBudgetInput] = useState('')
  const [editingMember, setEditingMember] = useState(null)

  useEffect(() => { setParams(mid === currentMonthId() ? {} : { month: mid }) }, [mid]) // eslint-disable-line

  const prevMid = shiftMonthId(mid, -1)

  const summary = useMemo(
    () => buildMonthSummary(mid, { members, payments, fines, expenses, activity, months }),
    [mid, members, payments, fines, expenses, activity, months]
  )

  const prevSummary = useMemo(
    () => buildMonthSummary(prevMid, { members, payments, fines, expenses, activity, months }),
    [prevMid, members, payments, fines, expenses, activity, months]
  )

  const prevActualRemaining = prevSummary.totals.remainingBudget
  const savedBudget = summary.totals.carriedForward

  useEffect(() => { setBudgetInput(savedBudget ? String(savedBudget) : '') }, [mid]) // eslint-disable-line

  const rows = useMemo(() => {
    const monthPayments = payments.filter((p) => p.monthId === mid)
    const prevPayments = payments.filter((p) => p.monthId === prevMid)
    return members
      .filter((m) => monthPayments.some((p) => p.memberId === m.id) || m.status === 'active')
      .map((m) => {
        const p = monthPayments.find((x) => x.memberId === m.id)
        // What this member's own payment record still shows as unpaid for
        // last month — a computed reference only, so you can see what to
        // write without it being filled in for you.
        const prevP = prevPayments.find((x) => x.memberId === m.id)
        const prevFee = Number(m.defaultFee) || 0
        const prevOwed = prevP ? Math.max(0, prevFee - (Number(prevP.amountPaid) || 0)) : 0
        return { member: m, pendingFromLastMonth: Number(p?.pendingFromLastMonth) || 0, prevOwed }
      })
      .filter((r) => r.member.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.member.name.localeCompare(b.member.name))
  }, [members, payments, mid, prevMid, q])

  const totalPending = rows.reduce((s, r) => s + r.pendingFromLastMonth, 0)

  function saveBudget() {
    setCarriedForward(mid, Number(budgetInput) || 0)
    pushToast("Remaining budget from last month saved")
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-extrabold text-xl text-ink-900 dark:text-white">Remaining Budget &amp; Pending Dues</h2>
        <p className="text-sm text-ink-400 mt-0.5">Write in whatever was left over or still owed from last month — it feeds straight into this month's total and the reports.</p>
      </div>

      <div className="card flex items-center justify-between">
        <button onClick={() => setMid((m) => shiftMonthId(m, -1))} className="p-2 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="font-display font-bold text-ink-900 dark:text-white">{monthLabel(mid)}</p>
          <p className="text-xs text-ink-400">Carrying over from {monthLabel(prevMid)}</p>
        </div>
        <button onClick={() => setMid((m) => shiftMonthId(m, 1))} className="p-2 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white grid place-items-center shrink-0">
            <PiggyBank size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm text-ink-900 dark:text-white">Remaining Budget From Last Month</p>
            <p className="text-xs text-ink-400">Enter the amount yourself — it's added into {monthLabel(mid)}'s total income and balance.</p>
          </div>
        </div>

        <div className={`rounded-2xl px-4 py-3 mb-3 text-sm flex items-center justify-between gap-3 ${prevActualRemaining >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
          <div>
            <p className="text-xs text-ink-400">{monthLabel(prevMid)} actually closed at</p>
            <p className={`font-display font-bold ${prevActualRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(prevActualRemaining)}</p>
          </div>
          {prevActualRemaining > 0 && (
            <button onClick={() => setBudgetInput(String(prevActualRemaining))} className="btn-secondary px-3 py-2 text-xs whitespace-nowrap">
              Use this amount
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number" inputMode="numeric" value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="0"
            className="input flex-1"
          />
          <button onClick={saveBudget} className="btn-primary px-4 py-3.5 text-sm flex items-center gap-1.5 whitespace-nowrap">
            <Check size={16} /> Save
          </button>
        </div>
        {savedBudget > 0 && (
          <p className="text-xs text-emerald-600 mt-2">{formatCurrency(savedBudget)} currently added to {monthLabel(mid)}'s total.</p>
        )}
      </div>

      <div className="flex items-center gap-2 bg-cloud-100 dark:bg-white/5 rounded-2xl px-3.5 py-3">
        <Search size={17} className="text-ink-400 shrink-0" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search member" className="bg-transparent outline-none text-sm w-full" />
      </div>

      <div className="card flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 text-white grid place-items-center shrink-0">
          <Users2 size={18} />
        </div>
        <div>
          <p className="font-semibold text-sm text-ink-900 dark:text-white">Pending Payments From Last Month</p>
          <p className="text-xs text-ink-400">Total written so far: {formatCurrency(totalPending)}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No members yet" message="Add active members first to record their pending dues." />
      ) : (
        <div className="space-y-2.5">
          {rows.map(({ member, pendingFromLastMonth, prevOwed }) => {
            const isEditing = editingMember === member.id
            return (
              <div key={member.id} className="card">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white grid place-items-center font-display font-bold shrink-0 text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-ink-900 dark:text-white truncate">{member.name}</p>
                    <p className="text-xs text-ink-400">Fee {formatCurrency(member.defaultFee)}/mo</p>
                  </div>
                </div>

                {prevOwed > 0 && (
                  <p className="text-xs text-ink-400 mt-2">
                    {monthLabel(prevMid)}'s payment record shows {formatCurrency(prevOwed)} left unpaid.{' '}
                    {!isEditing && (
                      <button onClick={() => { setPendingFromLastMonth(mid, member.id, prevOwed); }} className="text-blue-600 font-semibold">
                        Use this amount
                      </button>
                    )}
                  </p>
                )}

                {isEditing ? (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number" inputMode="numeric" autoFocus defaultValue={pendingFromLastMonth}
                      onBlur={(e) => { setPendingFromLastMonth(mid, member.id, Number(e.target.value) || 0); setEditingMember(null) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                      className="input flex-1"
                    />
                  </div>
                ) : (
                  <button onClick={() => setEditingMember(member.id)} className="mt-3 w-full flex items-center justify-between bg-cloud-100 dark:bg-white/5 rounded-2xl px-4 py-3 text-left">
                    <span className="text-sm text-ink-600 dark:text-cloud-200">Pending from last month</span>
                    <span className={`text-sm font-semibold ${pendingFromLastMonth > 0 ? 'text-rose-600' : 'text-ink-400'}`}>{formatCurrency(pendingFromLastMonth)}</span>
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
