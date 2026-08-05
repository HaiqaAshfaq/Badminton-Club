export const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function monthId(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

export function currentMonthId() {
  const now = new Date()
  return monthId(now.getFullYear(), now.getMonth())
}

export function monthLabel(id) {
  const [y, m] = id.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${y}`
}

export function shiftMonthId(id, delta) {
  const [y, m] = id.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return monthId(d.getFullYear(), d.getMonth())
}

export function compareMonthIds(a, b) {
  return a.localeCompare(b)
}
