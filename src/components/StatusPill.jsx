export default function StatusPill({ status }) {
  const map = {
    paid: 'bg-emerald-500/10 text-emerald-600',
    partial: 'bg-amber-500/10 text-amber-600',
    unpaid: 'bg-rose-500/10 text-rose-600',
    active: 'bg-emerald-500/10 text-emerald-600',
    inactive: 'bg-ink-400/10 text-ink-400',
  }
  const label = { paid: 'Paid', partial: 'Partially Paid', unpaid: 'Not Paid', active: 'Active', inactive: 'Inactive' }[status] || status
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${map[status] || 'bg-cloud-100 text-ink-600'}`}>{label}</span>
}
