// Centralized, single-source-of-truth calculations.
// Every page (Dashboard, Reports, Statistics, Monthly Records, Member Profile)
// pulls numbers from these helpers so totals can never drift apart or disagree.

/** Paid / Partially Paid / Not Paid, purely derived from fee vs amount paid. */
export function paymentStatus(defaultFee, amountPaid) {
  const fee = Number(defaultFee) || 0
  const paid = Number(amountPaid) || 0
  if (paid <= 0) return 'unpaid'
  if (paid >= fee) return 'paid'
  return 'partial'
}

export function remainingAmount(defaultFee, amountPaid) {
  return Math.max(0, (Number(defaultFee) || 0) - (Number(amountPaid) || 0))
}

/** Build a complete, Excel-equivalent picture for a single month. */
export function buildMonthSummary(monthId, { members, payments, fines, expenses, activity, months }) {
  // Expected fee always comes live from the member's current Monthly Fee —
  // never a frozen snapshot — so editing a member's fee instantly updates
  // every report and the Monthly Payments page, past and present.
  const monthPayments = payments
    .filter((p) => p.monthId === monthId)
    .map((p) => {
      const member = members.find((m) => m.id === p.memberId)
      const fee = Number(member?.defaultFee) || 0
      const paid = Number(p.amountPaid) || 0
      return {
        ...p,
        member,
        memberName: member?.name || 'Unknown member',
        memberStatus: member?.status || 'inactive',
        expectedFee: fee,
        amountPaid: paid,
        remaining: remainingAmount(fee, paid),
        status: paymentStatus(fee, paid),
        // Manually recorded amount this member still owed from the previous
        // month (written on the Last Month Pending page). Kept separate from
        // this month's own fee/status so it never distorts this month's
        // paid/partial/unpaid calculation — it's purely informational carry-over.
        pendingFromLastMonth: Number(p.pendingFromLastMonth) || 0,
      }
    })
    .filter((p) => p.member)
    .sort((a, b) => a.memberName.localeCompare(b.memberName))

  // Fines are matched to a month by their date (YYYY-MM-DD -> YYYY-MM)
  const monthFines = fines
    .filter((f) => (f.date || '').slice(0, 7) === monthId)
    .map((f) => {
      const member = members.find((m) => m.id === f.memberId)
      return {
        ...f,
        member,
        memberName: member?.name || 'Unknown member',
        remaining: f.status === 'paid' ? 0 : Number(f.amount) || 0,
      }
    })
    .filter((f) => f.member)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  // Attach each member's fine(s) for this month directly onto their payment row,
  // so the Member Payments table can show fine status + reason inline.
  for (const p of monthPayments) {
    const memberFines = monthFines.filter((f) => f.memberId === p.memberId)
    if (memberFines.length === 0) {
      p.fineStatus = 'none'
      p.fineReason = '—'
      p.fineAmount = 0
    } else {
      const allPaid = memberFines.every((f) => f.status === 'paid')
      const anyPaid = memberFines.some((f) => f.status === 'paid')
      p.fineStatus = allPaid ? 'paid' : anyPaid ? 'partial' : 'unpaid'
      p.fineReason = memberFines.map((f) => f.reason).filter(Boolean).join(', ') || '—'
      p.fineAmount = memberFines.reduce((s, f) => s + (Number(f.amount) || 0), 0)
    }
  }

  const monthExpenses = expenses
    .filter((e) => e.monthId === monthId)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  const monthActivity = (activity || [])
    .filter((a) => new Date(a.at).toISOString().slice(0, 7) === monthId)
    .sort((a, b) => a.at - b.at)

  const contributionsReceived = monthPayments.reduce((s, p) => s + p.amountPaid, 0)
  const expectedContributions = monthPayments.reduce((s, p) => s + p.expectedFee, 0)
  const fineTotal = monthFines.reduce((s, f) => s + (Number(f.amount) || 0), 0)
  const fineCollected = monthFines.filter((f) => f.status === 'paid').reduce((s, f) => s + (Number(f.amount) || 0), 0)
  const finePending = fineTotal - fineCollected

  // Club-level amount carried forward from last month's leftover balance —
  // written on the Last Month Pending page once someone confirms it — folds
  // straight into this month's total income and remaining budget.
  const monthRecord = (months || []).find((m) => m.id === monthId)
  const carriedForward = Number(monthRecord?.carriedForward) || 0

  const totalIncome = contributionsReceived + fineCollected + carriedForward
  const totalExpenses = monthExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const remainingBudget = totalIncome - totalExpenses

  const totalPendingFromLastMonth = monthPayments.reduce((s, p) => s + p.pendingFromLastMonth, 0)

  const paidCount = monthPayments.filter((p) => p.status === 'paid').length
  const partialCount = monthPayments.filter((p) => p.status === 'partial').length
  const unpaidCount = monthPayments.filter((p) => p.status === 'unpaid').length

  return {
    monthId,
    monthRecord,
    payments: monthPayments,
    fines: monthFines,
    expenses: monthExpenses,
    activity: monthActivity,
    totals: {
      expectedContributions,
      contributionsReceived,
      fineTotal,
      fineCollected,
      finePending,
      carriedForward,
      totalPendingFromLastMonth,
      totalIncome,
      totalExpenses,
      remainingBudget,
      paidCount,
      partialCount,
      unpaidCount,
      memberCount: monthPayments.length,
    },
  }
}

export function activityLabelForDate(at) {
  const d = new Date(at)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
