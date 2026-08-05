import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Printer, Download, Search as SearchIcon, ChevronLeft, ChevronRight, Wallet, TrendingDown, TrendingUp, Receipt } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatCurrency, formatDate } from '../utils/format'
import { monthLabel, currentMonthId, compareMonthIds, shiftMonthId } from '../utils/month'
import { buildMonthSummary } from '../utils/finance'
import StatusPill from '../components/StatusPill'

const REPORT_TYPES = ['Monthly Report', 'Yearly Report', 'Member Report', 'Fine Report', 'Expense Report']

function toCSV(rows, headers) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [headers.map(([, label]) => esc(label)).join(','), ...rows.map((r) => headers.map(([key, , fmt]) => esc(fmt ? fmt(r[key]) : r[key])).join(','))].join('\n')
}

function download(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const { members, months, payments, fines, expenses, activity } = useData()
  const [params] = useSearchParams()
  const [type, setType] = useState('Monthly Report')
  const [monthId, setMonthId] = useState(params.get('month') || currentMonthId())
  const [q, setQ] = useState(params.get('search') || '')

  const monthOptions = useMemo(() => {
    const ids = new Set(months.map((m) => m.id))
    ids.add(monthId)
    return [...ids].sort((a, b) => compareMonthIds(b, a))
  }, [months, monthId])

  const searchResults = useMemo(() => {
    if (!q.trim()) return null
    const query = q.toLowerCase()
    const memberHits = members.filter((m) => m.name.toLowerCase().includes(query))
    const expenseHits = expenses.filter((e) => e.title.toLowerCase().includes(query) || (e.description || '').toLowerCase().includes(query))
    const fineHits = fines.filter((f) => f.reason.toLowerCase().includes(query))
    const monthHits = months.filter((m) => monthLabel(m.id).toLowerCase().includes(query))
    return { memberHits, expenseHits, fineHits, monthHits }
  }, [q, members, expenses, fines, months])

  const summary = useMemo(
    () => buildMonthSummary(monthId, { members, payments, fines, expenses, activity, months }),
    [monthId, members, payments, fines, expenses, activity, months]
  )

  const yearlyData = useMemo(() => {
    const year = monthId.slice(0, 4)
    const yearMonthIds = [...new Set([...months.map((m) => m.id), ...payments.map((p) => p.monthId), ...expenses.map((e) => e.monthId)])]
      .filter((id) => id.startsWith(year)).sort(compareMonthIds)
    const byMonth = yearMonthIds.map((id) => buildMonthSummary(id, { members, payments, fines, expenses, activity, months }))
    const totals = byMonth.reduce((acc, m) => ({
      contributionsReceived: acc.contributionsReceived + m.totals.contributionsReceived,
      fineCollected: acc.fineCollected + m.totals.fineCollected,
      totalExpenses: acc.totalExpenses + m.totals.totalExpenses,
      totalIncome: acc.totalIncome + m.totals.totalIncome,
      remainingBudget: acc.remainingBudget + m.totals.remainingBudget,
    }), { contributionsReceived: 0, fineCollected: 0, totalExpenses: 0, totalIncome: 0, remainingBudget: 0 })
    return { year, byMonth, totals }
  }, [monthId, months, members, payments, fines, expenses, activity])

  const fineReportRows = useMemo(
    () => fines.map((f) => ({ ...f, name: members.find((m) => m.id === f.memberId)?.name || '—', remaining: f.status === 'paid' ? 0 : f.amount })),
    [fines, members]
  )

  function exportCSV() {
    const stamp = monthId
    if (type === 'Member Report') {
      return download('members.csv', toCSV(members, [['name', 'Name'], ['defaultFee', 'Monthly Fee', formatCurrency], ['status', 'Status'], ['joiningDate', 'Joined', formatDate], ['phone', 'Phone']]), 'text/csv')
    }
    if (type === 'Fine Report') {
      return download('fines.csv', toCSV(fineReportRows, [['name', 'Member'], ['reason', 'Reason'], ['amount', 'Amount', formatCurrency], ['status', 'Status'], ['remaining', 'Remaining', formatCurrency], ['date', 'Date Issued', formatDate], ['datePaid', 'Date Paid', formatDate], ['notes', 'Notes']]), 'text/csv')
    }
    if (type === 'Expense Report') {
      return download('expenses.csv', toCSV(expenses, [['title', 'Expense'], ['amount', 'Amount', formatCurrency], ['date', 'Date', formatDate], ['description', 'Description']]), 'text/csv')
    }
    if (type === 'Yearly Report') {
      return download(`yearly-report-${yearlyData.year}.csv`, toCSV(yearlyData.byMonth.map((m) => ({ month: monthLabel(m.monthId), ...m.totals })), [['month', 'Month'], ['contributionsReceived', 'Collected', formatCurrency], ['fineCollected', 'Fines Collected', formatCurrency], ['totalExpenses', 'Expenses', formatCurrency], ['carriedForward', "Last Month's Budget Added", formatCurrency], ['remainingBudget', 'Balance', formatCurrency]]), 'text/csv')
    }
    // Monthly Report — export everything, section by section
    const parts = []
    parts.push(`Monthly Report — ${monthLabel(monthId)}`)
    parts.push('')
    parts.push('MEMBER PAYMENTS')
    parts.push(toCSV(summary.payments, [['memberName', 'Member'], ['expectedFee', 'Expected Monthly Fee', formatCurrency], ['amountPaid', 'Paid', formatCurrency], ['remaining', 'Remaining', formatCurrency], ['status', 'Status'], ['pendingFromLastMonth', 'Last Month Pending', formatCurrency], ['fineStatus', 'Fine Status'], ['fineAmount', 'Fine Amount', formatCurrency], ['fineReason', 'Fine Reason']]))
    parts.push('')
    parts.push('FINES')
    parts.push(toCSV(summary.fines, [['memberName', 'Member'], ['reason', 'Reason'], ['amount', 'Amount', formatCurrency], ['status', 'Status'], ['remaining', 'Remaining', formatCurrency], ['date', 'Date Issued', formatDate], ['datePaid', 'Date Paid', formatDate], ['notes', 'Notes']]))
    parts.push('')
    parts.push('EXPENSES')
    parts.push(toCSV(summary.expenses, [['title', 'Expense'], ['amount', 'Amount', formatCurrency], ['date', 'Date', formatDate], ['description', 'Description']]))
    parts.push('')
    parts.push('FINANCIAL SUMMARY')
    parts.push(toCSV([summary.totals], [['expectedContributions', 'Expected Contributions', formatCurrency], ['contributionsReceived', 'Contributions Received', formatCurrency], ['fineTotal', 'Total Fines', formatCurrency], ['fineCollected', 'Fines Collected', formatCurrency], ['finePending', 'Fines Pending', formatCurrency], ['carriedForward', "Last Month's Budget Added", formatCurrency], ['totalIncome', 'Total Income', formatCurrency], ['totalExpenses', 'Total Expenses', formatCurrency], ['remainingBudget', 'Remaining Budget', formatCurrency], ['totalPendingFromLastMonth', 'Total Last Month Pending', formatCurrency]]))
    download(`monthly-report-${stamp}.csv`, parts.join('\n'), 'text/csv')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-cloud-100 dark:bg-white/5 rounded-2xl px-3.5 py-3 print:hidden">
        <SearchIcon size={17} className="text-ink-400 shrink-0" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search — member, month, expense, fine..." className="bg-transparent outline-none text-sm w-full" />
      </div>

      {searchResults ? (
        <div className="space-y-4 print:hidden">
          <ResultGroup title="Members" items={searchResults.memberHits.map((m) => `${m.name} · ${formatCurrency(m.defaultFee)}/mo`)} />
          <ResultGroup title="Months" items={searchResults.monthHits.map((m) => monthLabel(m.id))} />
          <ResultGroup title="Fines" items={searchResults.fineHits.map((f) => `${f.reason} · ${formatCurrency(f.amount)}`)} />
          <ResultGroup title="Expenses" items={searchResults.expenseHits.map((e) => `${e.title} · ${formatCurrency(e.amount)}`)} />
          {!searchResults.memberHits.length && !searchResults.monthHits.length && !searchResults.fineHits.length && !searchResults.expenseHits.length && (
            <p className="text-sm text-ink-400 text-center py-8">No matches found.</p>
          )}
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 print:hidden">
            {REPORT_TYPES.map((t) => (
              <button key={t} onClick={() => setType(t)} className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${type === t ? 'bg-blue-600 text-white' : 'bg-cloud-100 dark:bg-white/5 text-ink-600 dark:text-cloud-200'}`}>{t}</button>
            ))}
          </div>

          {(type === 'Monthly Report' || type === 'Yearly Report') && (
            <div className="card flex items-center justify-between print:hidden">
              <button onClick={() => setMonthId((m) => shiftMonthId(m, type === 'Yearly Report' ? -12 : -1))} className="p-2 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10">
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <p className="font-display font-bold text-ink-900 dark:text-white">{type === 'Yearly Report' ? yearlyData.year : monthLabel(monthId)}</p>
                <select value={monthId} onChange={(e) => setMonthId(e.target.value)} className="text-xs text-ink-400 bg-transparent outline-none text-center">
                  {monthOptions.map((id) => <option key={id} value={id}>{monthLabel(id)}</option>)}
                </select>
              </div>
              <button onClick={() => setMonthId((m) => shiftMonthId(m, type === 'Yearly Report' ? 12 : 1))} className="p-2 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10">
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <div className="flex gap-2 print:hidden">
            <button onClick={() => window.print()} className="btn-secondary flex-1 flex items-center justify-center gap-2"><Printer size={16} /> Print</button>
            <button onClick={exportCSV} className="btn-primary flex-1 flex items-center justify-center gap-2"><Download size={16} /> Export CSV</button>
          </div>

          {type === 'Monthly Report' && <MonthlyReport summary={summary} monthId={monthId} />}
          {type === 'Yearly Report' && <YearlyReport data={yearlyData} />}
          {type === 'Member Report' && (
            <div className="card">
              <h3 className="font-display font-bold text-ink-900 dark:text-white mb-3">Member Report</h3>
              <Table
                rows={members}
                cols={[['name', 'Name'], ['defaultFee', 'Monthly Fee', formatCurrency], ['status', 'Status'], ['joiningDate', 'Joined', formatDate], ['phone', 'Phone']]}
              />
            </div>
          )}
          {type === 'Fine Report' && (
            <div className="card">
              <h3 className="font-display font-bold text-ink-900 dark:text-white mb-3">Fine Report — All Fines</h3>
              <Table
                rows={fineReportRows}
                cols={[['name', 'Member'], ['reason', 'Reason'], ['amount', 'Amount', formatCurrency], ['status', 'Status', (v) => <StatusPill status={v} />], ['remaining', 'Remaining', formatCurrency], ['date', 'Date Issued', formatDate], ['datePaid', 'Date Paid', formatDate], ['notes', 'Notes']]}
              />
            </div>
          )}
          {type === 'Expense Report' && (
            <div className="card">
              <h3 className="font-display font-bold text-ink-900 dark:text-white mb-3">Expense Report — All Expenses</h3>
              <Table rows={expenses} cols={[['title', 'Expense'], ['amount', 'Amount', formatCurrency], ['date', 'Date', formatDate], ['description', 'Description']]} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MonthlyReport({ summary, monthId }) {
  const t = summary.totals
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryTile label="Contributions Received" value={formatCurrency(t.contributionsReceived)} tone="green" icon={Wallet} />
        <SummaryTile label="Fines Collected" value={formatCurrency(t.fineCollected)} sub={`${formatCurrency(t.finePending)} pending`} tone="amber" icon={Receipt} />
        <SummaryTile label="Remaining Budget From Last Month" value={formatCurrency(t.carriedForward)} tone={t.carriedForward > 0 ? 'green' : 'blue'} icon={Wallet} />
        <SummaryTile label="Total Income" value={formatCurrency(t.totalIncome)} tone="green" icon={TrendingUp} />
        <SummaryTile label="Total Expenses" value={formatCurrency(t.totalExpenses)} tone="rose" icon={TrendingDown} />
        <SummaryTile label="Remaining Budget" value={formatCurrency(t.remainingBudget)} tone={t.remainingBudget >= 0 ? 'green' : 'rose'} icon={t.remainingBudget >= 0 ? TrendingUp : TrendingDown} />
        <SummaryTile label="Members Paid / Total" value={`${t.paidCount} / ${t.memberCount}`} sub={`${t.partialCount} partial · ${t.unpaidCount} not paid`} tone="blue" icon={Wallet} />
      </div>

      <div className="card">
        <h3 className="font-display font-bold text-ink-900 dark:text-white mb-1">Member Payments</h3>
        <p className="text-xs text-ink-400 mb-3">Every active member's expected fee, amount paid, remaining balance, last month's pending amount, and any fine for {monthLabel(monthId)}.</p>
        {summary.payments.length === 0 ? <p className="text-sm text-ink-400 py-3 text-center">No payment records for this month.</p> : (
          <Table
            rows={summary.payments}
            cols={[
              ['memberName', 'Member'],
              ['expectedFee', 'Expected Monthly Fee', formatCurrency],
              ['amountPaid', 'Paid', formatCurrency],
              ['remaining', 'Remaining', formatCurrency],
              ['status', 'Status', (v) => <StatusPill status={v} />],
              ['pendingFromLastMonth', 'Last Month Pending', (v) => v ? formatCurrency(v) : '—'],
              ['fineStatus', 'Fine', (v) => v === 'none' ? <span className="text-ink-400">No Fine</span> : <StatusPill status={v} />],
              ['fineAmount', 'Fine Amount', (v) => v ? formatCurrency(v) : '—'],
              ['fineReason', 'Fine Reason'],
            ]}
          />
        )}
      </div>

      <div className="card">
        <h3 className="font-display font-bold text-ink-900 dark:text-white mb-1">Fine Details</h3>
        <p className="text-xs text-ink-400 mb-3">Every fine issued this month — reason, amount, status, and notes. Nothing is hidden.</p>
        {summary.fines.length === 0 ? <p className="text-sm text-ink-400 py-3 text-center">No fines issued this month.</p> : (
          <Table
            rows={summary.fines}
            cols={[
              ['memberName', 'Member'],
              ['reason', 'Reason'],
              ['amount', 'Fine Amount', formatCurrency],
              ['status', 'Status', (v) => <StatusPill status={v} />],
              ['remaining', 'Remaining', formatCurrency],
              ['date', 'Date Issued', formatDate],
              ['datePaid', 'Date Paid', (v) => v ? formatDate(v) : '—'],
              ['notes', 'Notes', (v) => v || '—'],
            ]}
          />
        )}
      </div>

      <div className="card">
        <h3 className="font-display font-bold text-ink-900 dark:text-white mb-1">Expenses</h3>
        <p className="text-xs text-ink-400 mb-3">Every expense recorded this month, just like the Excel sheet.</p>
        {summary.expenses.length === 0 ? <p className="text-sm text-ink-400 py-3 text-center">No expenses recorded this month.</p> : (
          <Table
            rows={summary.expenses}
            cols={[['title', 'Expense'], ['amount', 'Amount', formatCurrency], ['date', 'Date', formatDate], ['description', 'Description', (v) => v || '—']]}
          />
        )}
      </div>

      <div className="card">
        <h3 className="font-display font-bold text-ink-900 dark:text-white mb-1">Financial Summary</h3>
        <dl className="grid grid-cols-2 gap-y-2.5 text-sm mt-3">
          <SummaryRow label="Monthly Contributions Received" value={formatCurrency(t.contributionsReceived)} />
          <SummaryRow label="Total Fine Amount" value={formatCurrency(t.fineTotal)} />
          <SummaryRow label="Total Fine Collected" value={formatCurrency(t.fineCollected)} />
          <SummaryRow label="Pending Fines" value={formatCurrency(t.finePending)} />
          <SummaryRow label="Remaining Budget From Last Month" value={formatCurrency(t.carriedForward)} tone={t.carriedForward > 0 ? 'green' : undefined} />
          <SummaryRow label="Total Pending From Last Month" value={formatCurrency(t.totalPendingFromLastMonth)} tone={t.totalPendingFromLastMonth > 0 ? 'rose' : undefined} />
          <SummaryRow label="Total Income" value={formatCurrency(t.totalIncome)} bold />
          <SummaryRow label="Total Expenses" value={formatCurrency(t.totalExpenses)} bold />
          <SummaryRow label="Remaining Budget" value={formatCurrency(t.remainingBudget)} bold tone={t.remainingBudget >= 0 ? 'green' : 'rose'} />
        </dl>
      </div>
    </div>
  )
}

function YearlyReport({ data }) {
  const totals = data.totals
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryTile label="Contributions Received" value={formatCurrency(totals.contributionsReceived)} tone="green" icon={Wallet} />
        <SummaryTile label="Fines Collected" value={formatCurrency(totals.fineCollected)} tone="amber" icon={Receipt} />
        <SummaryTile label="Total Income" value={formatCurrency(totals.totalIncome)} tone="green" icon={TrendingUp} />
        <SummaryTile label="Total Expenses" value={formatCurrency(totals.totalExpenses)} tone="rose" icon={TrendingDown} />
        <SummaryTile label="Net Balance" value={formatCurrency(totals.remainingBudget)} tone={totals.remainingBudget >= 0 ? 'green' : 'rose'} icon={totals.remainingBudget >= 0 ? TrendingUp : TrendingDown} />
      </div>
      <div className="card">
        <h3 className="font-display font-bold text-ink-900 dark:text-white mb-3">Month by Month — {data.year}</h3>
        {data.byMonth.length === 0 ? <p className="text-sm text-ink-400 py-3 text-center">No records for {data.year} yet.</p> : (
          <Table
            rows={data.byMonth.map((m) => ({ month: monthLabel(m.monthId), ...m.totals }))}
            cols={[
              ['month', 'Month'],
              ['contributionsReceived', 'Collected', formatCurrency],
              ['fineCollected', 'Fines Collected', formatCurrency],
              ['totalExpenses', 'Expenses', formatCurrency],
              ['carriedForward', 'Remaining Budget From Last Month', formatCurrency],
              ['remainingBudget', 'Balance', formatCurrency],
            ]}
          />
        )}
      </div>
    </div>
  )
}


function SummaryTile({ label, value, sub, tone, icon: Icon }) {
  const tones = { blue: 'text-blue-600 bg-blue-600/10', green: 'text-emerald-600 bg-emerald-500/10', rose: 'text-rose-600 bg-rose-500/10', amber: 'text-amber-600 bg-amber-500/10' }
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</span>
        {Icon && <div className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 ${tones[tone]}`}><Icon size={14} /></div>}
      </div>
      <p className="font-display font-extrabold text-lg text-ink-900 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-[11px] text-ink-400 mt-1.5">{sub}</p>}
    </div>
  )
}

function SummaryRow({ label, value, bold, tone }) {
  const toneClass = tone === 'green' ? 'text-emerald-600' : tone === 'rose' ? 'text-rose-600' : 'text-ink-900 dark:text-white'
  return (
    <>
      <dt className="text-ink-600 dark:text-cloud-200 col-span-1">{label}</dt>
      <dd className={`text-right ${bold ? 'font-display font-bold' : ''} ${toneClass}`}>{value}</dd>
    </>
  )
}

function ResultGroup({ title, items }) {
  if (!items.length) return null
  return (
    <div className="card">
      <p className="text-xs font-semibold uppercase text-ink-400 mb-2">{title}</p>
      <ul className="space-y-1.5 text-sm text-ink-900 dark:text-white">
        {items.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </div>
  )
}

function Table({ rows, cols }) {
  if (!rows || rows.length === 0) return <p className="text-sm text-ink-400 py-3 text-center">No data</p>
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="report-table">
        <thead>
          <tr>
            {cols.map(([key, label]) => <th key={key}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i}>
              {cols.map(([key, label, fmt]) => (
                <td key={key} data-label={label}>{fmt ? fmt(r[key]) : (r[key] ?? '—')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
