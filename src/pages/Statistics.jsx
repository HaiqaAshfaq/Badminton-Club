import { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { useData } from '../context/DataContext'
import { monthLabel, compareMonthIds } from '../utils/month'
import { formatCurrency } from '../utils/format'
import EmptyState from '../components/EmptyState'
import { PieChart as PieIcon } from 'lucide-react'

const COLORS = ['#2158C9', '#16B866', '#e8a628', '#e6493f', '#5c8fe8', '#3fd587']

export default function Statistics() {
  const { months, payments, expenses, fines, members } = useData()

  const monthly = useMemo(() => {
    return [...months].sort((a, b) => compareMonthIds(a.id, b.id)).map((m) => {
      const income = payments.filter((p) => p.monthId === m.id).reduce((s, p) => s + (Number(p.amountPaid) || 0), 0)
      const exp = expenses.filter((e) => e.monthId === m.id).reduce((s, e) => s + e.amount, 0)
      return { month: monthLabel(m.id).split(' ')[0].slice(0, 3), income, expenses: exp, balance: income - exp }
    })
  }, [months, payments, expenses])

  const fineStats = useMemo(() => ([
    { name: 'Collected', value: fines.filter((f) => f.status === 'paid').reduce((s, f) => s + f.amount, 0) },
    { name: 'Pending', value: fines.filter((f) => f.status !== 'paid').reduce((s, f) => s + f.amount, 0) },
  ]), [fines])

  const topContributors = useMemo(() => {
    return members.map((m) => ({
      name: m.name.split(' ')[0],
      total: payments.filter((p) => p.memberId === m.id).reduce((s, p) => s + (Number(p.amountPaid) || 0), 0),
    })).sort((a, b) => b.total - a.total).slice(0, 6)
  }, [members, payments])

  const expenseBreakdown = useMemo(() => {
    const map = {}
    for (const e of expenses) map[e.title] = (map[e.title] || 0) + e.amount
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8)
  }, [expenses])

  if (months.length === 0) return <EmptyState icon={PieIcon} title="Not enough data yet" message="Statistics will appear once you record payments and expenses." />

  return (
    <div className="space-y-5">
      <ChartCard title="Monthly Income vs Expenses">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16B866" stopOpacity={0.4} /><stop offset="100%" stopColor="#16B866" stopOpacity={0} /></linearGradient>
              <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e6493f" stopOpacity={0.4} /><stop offset="100%" stopColor="#e6493f" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e8f1" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Area type="monotone" dataKey="income" stroke="#16B866" fill="url(#inc)" strokeWidth={2} name="Income" />
            <Area type="monotone" dataKey="expenses" stroke="#e6493f" fill="url(#exp)" strokeWidth={2} name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly Balance">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e8f1" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Bar dataKey="balance" radius={[8, 8, 0, 0]}>
              {monthly.map((m, i) => <Cell key={i} fill={m.balance >= 0 ? '#16B866' : '#e6493f'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid sm:grid-cols-2 gap-5">
        <ChartCard title="Fine Collection">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={fineStats} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3}>
                {fineStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Contributors">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topContributors} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="total" radius={[0, 8, 8, 0]} fill="#2158C9" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Expense Breakdown">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={expenseBreakdown} dataKey="value" nameKey="name" outerRadius={90} label={(e) => e.name}>
              {expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(v)} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="card">
      <h3 className="font-display font-bold text-ink-900 dark:text-white mb-2">{title}</h3>
      {children}
    </div>
  )
}
