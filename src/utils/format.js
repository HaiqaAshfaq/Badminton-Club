export function formatCurrency(n) {
  const num = Number(n) || 0
  return 'Rs ' + num.toLocaleString('en-PK', { maximumFractionDigits: 0 })
}

export function formatDate(d) {
  if (!d && d !== 0) return ''
  // Accepts a "YYYY-MM-DD" string, a numeric timestamp (e.g. Date.now()), or a Date object.
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(d) {
  if (!d && d !== 0) return ''
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function uid(prefix = 'id') {
  return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}
