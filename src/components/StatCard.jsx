const TONES = {
  blue: 'from-blue-600 to-blue-500',
  green: 'from-emerald-600 to-emerald-500',
  rose: 'from-rose-500 to-rose-400',
  amber: 'from-amber-500 to-amber-400',
  navy: 'from-navy-800 to-navy-700',
}

export default function StatCard({ label, value, icon: Icon, tone = 'blue', sub }) {
  return (
    <div className="card relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${TONES[tone]} opacity-10`} />
      <div className="flex items-center justify-between mb-3 relative">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</span>
        {Icon && (
          <div className={`h-9 w-9 rounded-xl grid place-items-center bg-gradient-to-br ${TONES[tone]} text-white shadow-sm shrink-0`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className="font-display font-extrabold text-2xl text-ink-900 dark:text-white leading-none relative">{value}</p>
      {sub && <p className="text-xs text-ink-400 mt-2 relative">{sub}</p>}
    </div>
  )
}
