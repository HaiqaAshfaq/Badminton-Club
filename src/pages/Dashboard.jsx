import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Wallet, Receipt, TrendingUp, TrendingDown, PlusCircle, UserPlus, ClipboardList, CheckCircle2, ArrowRight, PiggyBank } from 'lucide-react'
import { useData } from '../context/DataContext'
import StatCard from '../components/StatCard'
import Skeleton from '../components/Skeleton'
import { currentMonthId, monthLabel, shiftMonthId } from '../utils/month'
import { formatCurrency, formatDate } from '../utils/format'
import { buildMonthSummary } from '../utils/finance'
import Sheet from '../components/Sheet'
import MemberForm from '../features/members/MemberForm'
import FineForm from '../features/fines/FineForm'
import ExpenseForm from '../features/expenses/ExpenseForm'

export default function Dashboard() {
  const { loading, members, months, payments, fines, expenses, activity, setCarriedForward, pushToast } = useData()
  const navigate = useNavigate()
  const mid = currentMonthId()
  const prevMid = shiftMonthId(mid, -1)
  const [sheet, setSheet] = useState(null)

  const summary = useMemo(
    () => buildMonthSummary(mid, { members, payments, fines, expenses, activity, months }),
    [mid, members, payments, fines, expenses, activity, months]
  )

  const prevSummary = useMemo(
    () => buildMonthSummary(prevMid, { members, payments, fines, expenses, activity, months }),
    [prevMid, members, payments, fines, expenses, activity, months]
  )

  const activeMembers = useMemo(() => members.filter((m) => m.status === 'active').length, [members])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    )
  }

  const t = summary.totals
  const prevRemaining = prevSummary.totals.remainingBudget
  const alreadyCarried = t.carriedForward > 0

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-400">{monthLabel(mid)}</p>
        <h2 className="font-display font-extrabold text-2xl text-ink-900 dark:text-white">Welcome back 👋</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Members" value={activeMembers} icon={Users} tone="blue" />
        <StatCard label="Collected This Month" value={formatCurrency(t.contributionsReceived)} icon={Wallet} tone="green" sub={`of ${formatCurrency(t.expectedContributions)} expected`} />
        <StatCard label="Collected Fines" value={formatCurrency(t.fineCollected)} icon={Receipt} tone="green" />
        <StatCard label="Pending Fines" value={formatCurrency(t.finePending)} icon={Receipt} tone="amber" />
        <StatCard label="Total Expenses" value={formatCurrency(t.totalExpenses)} icon={TrendingDown} tone="rose" />
        <StatCard
          label="Remaining Balance"
          value={formatCurrency(t.remainingBudget)}
          icon={t.remainingBudget >= 0 ? TrendingUp : TrendingDown}
          tone={t.remainingBudget >= 0 ? 'green' : 'rose'}
          sub={alreadyCarried ? `includes ${formatCurrency(t.carriedForward)} from last month` : undefined}
        />
        <StatCard label="Fully Paid Members" value={t.paidCount} icon={CheckCircle2} tone="green" sub={`${t.memberCount} total this month`} />
        <StatCard label="Pending Payments" value={t.partialCount + t.unpaidCount} icon={ClipboardList} tone="amber" />
      </div>

      <div className="card">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white grid place-items-center shrink-0">
            <PiggyBank size={19} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-ink-900 dark:text-white">Last Month's Balance — {monthLabel(prevMid)}</p>
            <p className="text-xs text-ink-400">
              {prevRemaining > 0
                ? `Rs left over: ${formatCurrency(prevRemaining)}`
                : prevRemaining < 0
                  ? `Last month closed short by ${formatCurrency(Math.abs(prevRemaining))}`
                  : 'Nothing left over last month'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {prevRemaining > 0 && !alreadyCarried && (
            <button
              onClick={async () => { await setCarriedForward(mid, prevRemaining); pushToast(`${formatCurrency(prevRemaining)} added to this month's total`) }}
              className="btn-primary flex-1 text-sm"
            >
              Add {formatCurrency(prevRemaining)} to this month
            </button>
          )}
          {prevRemaining > 0 && alreadyCarried && (
            <button
              onClick={() => setCarriedForward(mid, 0)}
              className="btn-secondary flex-1 text-sm"
            >
              Remove carried-forward amount
            </button>
          )}
          <button onClick={() => navigate('/last-month-balance')} className="btn-secondary flex-1 text-sm">
            Member pending dues
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-ink-900 dark:text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction icon={UserPlus} label="Add Member" onClick={() => setSheet('member')} tone="blue" />
          <QuickAction icon={Receipt} label="Add Fine" onClick={() => setSheet('fine')} tone="amber" />
          <QuickAction icon={PlusCircle} label="Add Expense" onClick={() => setSheet('expense')} tone="rose" />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-ink-900 dark:text-white">Recent Activity</h3>
          <button onClick={() => navigate('/reports')} className="text-xs font-semibold text-blue-600 flex items-center gap-1">
            View all <ArrowRight size={13} />
          </button>
        </div>
        {activity.length === 0 ? (
          <p className="text-sm text-ink-400 py-6 text-center">No activity yet — start by adding a member or payment.</p>
        ) : (
          <ul className="divide-y divide-cloud-100 dark:divide-white/5">
            {activity.slice(0, 6).map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                <span className="text-sm text-ink-900 dark:text-cloud-100">{a.text}</span>
                <span className="text-xs text-ink-400 shrink-0">{formatDate(a.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet open={sheet === 'member'} onClose={() => setSheet(null)} title="Add Member">
        <MemberForm onDone={() => setSheet(null)} />
      </Sheet>
      <Sheet open={sheet === 'fine'} onClose={() => setSheet(null)} title="Add Fine">
        <FineForm onDone={() => setSheet(null)} />
      </Sheet>
      <Sheet open={sheet === 'expense'} onClose={() => setSheet(null)} title="Add Expense">
        <ExpenseForm onDone={() => setSheet(null)} />
      </Sheet>
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick, tone }) {
  const tones = { blue: 'from-blue-600 to-blue-500', amber: 'from-amber-500 to-amber-400', rose: 'from-rose-500 to-rose-400' }
  return (
    <button onClick={onClick} className="card flex flex-col items-center gap-2 active:scale-95 transition-transform">
      <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${tones[tone]} text-white grid place-items-center shadow-sm`}>
        <Icon size={20} />
      </div>
      <span className="text-xs font-semibold text-ink-900 dark:text-white text-center leading-tight">{label}</span>
    </button>
  )
}
