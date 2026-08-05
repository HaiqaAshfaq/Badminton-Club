import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { getAll, put, remove, getByIndex, exportAllData, importAllData, STORES } from '../db/db'
import { buildSeedMembers, buildSeedMonthAndPayments } from '../db/seed'
import { uid } from '../utils/format'
import { currentMonthId } from '../utils/month'

const DataContext = createContext(null)

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}

export function DataProvider({ children }) {
  const [members, setMembers] = useState([])
  const [months, setMonths] = useState([])
  const [payments, setPayments] = useState([])
  const [fines, setFines] = useState([])
  const [expenses, setExpenses] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saving' | 'saved'
  const [toasts, setToasts] = useState([])
  const [lastDeleted, setLastDeleted] = useState(null)
  const savingTimer = useRef(null)

  const flashSaving = useCallback(() => {
    setSaveStatus('saving')
    if (savingTimer.current) clearTimeout(savingTimer.current)
    savingTimer.current = setTimeout(() => setSaveStatus('saved'), 500)
  }, [])

  const pushToast = useCallback((message, type = 'success') => {
    const id = uid('toast')
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const logActivity = useCallback(async (text) => {
    const entry = { id: uid('act'), text, at: Date.now() }
    setActivity((a) => [entry, ...a].slice(0, 200))
    await put(STORES.activity, entry)
  }, [])

  const ensureCurrentMonth = useCallback(async (memberList, monthList, paymentList) => {
    const mid = currentMonthId()
    if (monthList.find((m) => m.id === mid)) return { months: monthList, payments: paymentList }
    const activeMembers = memberList.filter((m) => m.status === 'active')
    const newMonth = { id: mid, createdAt: Date.now() }
    const newPayments = activeMembers.map((m) => ({
      id: uid('pay'),
      monthId: mid,
      memberId: m.id,
      defaultFee: m.defaultFee,
      amountPaid: 0,
      status: 'unpaid',
      updatedAt: Date.now(),
    }))
    await put(STORES.months, newMonth)
    for (const p of newPayments) await put(STORES.payments, p)
    return { months: [...monthList, newMonth], payments: [...paymentList, ...newPayments] }
  }, [])

  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        let m = await getAll(STORES.members)
        let mo = await getAll(STORES.months)
        let pay = await getAll(STORES.payments)
        let fi = await getAll(STORES.fines)
        const ex = await getAll(STORES.expenses)
        const act = await getAll(STORES.activity)

        if (m.length === 0 && mo.length === 0) {
          m = buildSeedMembers()
          for (const mem of m) await put(STORES.members, mem)
          const seeded = buildSeedMonthAndPayments(m)
          await put(STORES.months, seeded.month)
          for (const p of seeded.payments) await put(STORES.payments, p)
          mo = [seeded.month]
          pay = seeded.payments
        } else {
          // Self-heal: earlier versions of the app deleted a member but left their
          // payments/fines behind, which kept inflating member counts and totals
          // in Reports. Prune anything still pointing at a member that's gone.
          const memberIds = new Set(m.map((mem) => mem.id))
          const orphanPayments = pay.filter((p) => !memberIds.has(p.memberId))
          const orphanFines = fi.filter((f) => !memberIds.has(f.memberId))
          if (orphanPayments.length || orphanFines.length) {
            for (const p of orphanPayments) await remove(STORES.payments, p.id)
            for (const f of orphanFines) await remove(STORES.fines, f.id)
            pay = pay.filter((p) => memberIds.has(p.memberId))
            fi = fi.filter((f) => memberIds.has(f.memberId))
          }

          const ensured = await ensureCurrentMonth(m, mo, pay)
          mo = ensured.months
          pay = ensured.payments
        }

        if (cancelled) return
        setMembers(m)
        setMonths(mo)
        setPayments(pay)
        setFines(fi)
        setExpenses(ex)
        setActivity(act.sort((a, b) => b.at - a.at))
      } catch (err) {
        // Never leave the app stuck on the loading screen — surface a real error instead.
        console.error('Failed to load club data:', err)
        if (!cancelled) setLoadError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [ensureCurrentMonth])

  // ---------- Members ----------
  const addMember = useCallback(async (data) => {
    flashSaving()
    const member = {
      id: uid('mem'),
      name: data.name,
      joiningDate: data.joiningDate || new Date().toISOString().slice(0, 10),
      defaultFee: Number(data.defaultFee) || 0,
      phone: data.phone || '',
      notes: data.notes || '',
      status: 'active',
      createdAt: Date.now(),
    }
    await put(STORES.members, member)
    setMembers((m) => [...m, member])

    const mid = currentMonthId()
    if (months.find((mo) => mo.id === mid)) {
      const payment = {
        id: uid('pay'), monthId: mid, memberId: member.id,
        defaultFee: member.defaultFee, amountPaid: 0, status: 'unpaid', updatedAt: Date.now(),
      }
      await put(STORES.payments, payment)
      setPayments((p) => [...p, payment])
    }
    logActivity(`Added member ${member.name}`)
    pushToast(`${member.name} added`)
    return member
  }, [months, flashSaving, logActivity, pushToast])

  const updateMember = useCallback(async (id, patch) => {
    flashSaving()
    setMembers((list) => {
      const updated = list.map((m) => (m.id === id ? { ...m, ...patch } : m))
      const changed = updated.find((m) => m.id === id)
      put(STORES.members, changed)
      return updated
    })
    logActivity(`Updated member details`)
  }, [flashSaving, logActivity])

  const deleteMember = useCallback(async (id) => {
    flashSaving()
    const target = members.find((m) => m.id === id)
    // Keep the member's own payments/fines so "Undo" can bring everything back together.
    const relatedPayments = await getByIndex(STORES.payments, 'byMember', id)
    const relatedFines = await getByIndex(STORES.fines, 'byMember', id)
    setLastDeleted({ type: 'member', data: target, relatedPayments, relatedFines })

    await remove(STORES.members, id)
    for (const p of relatedPayments) await remove(STORES.payments, p.id)
    for (const f of relatedFines) await remove(STORES.fines, f.id)

    setMembers((m) => m.filter((x) => x.id !== id))
    setPayments((p) => p.filter((x) => x.memberId !== id))
    setFines((f) => f.filter((x) => x.memberId !== id))
    logActivity(`Deleted member ${target?.name || ''}`)
    pushToast(`${target?.name || 'Member'} deleted`, 'danger')
  }, [members, flashSaving, logActivity, pushToast])

  // ---------- Payments ----------
  const upsertPayment = useCallback(async (monthId, memberId, patch) => {
    flashSaving()
    setPayments((list) => {
      const existing = list.find((p) => p.monthId === monthId && p.memberId === memberId)
      const member = members.find((m) => m.id === memberId)
      const base = existing || {
        id: uid('pay'), monthId, memberId,
        defaultFee: member?.defaultFee || 0, amountPaid: 0, status: 'unpaid', updatedAt: Date.now(),
      }
      // The fee always comes live from the member's current Monthly Fee, never
      // from whatever was passed in or stored before — so changing a member's
      // fee is instantly reflected here without editing old payment records.
      const fee = Number(member?.defaultFee) || 0
      const merged = { ...base, ...patch, defaultFee: fee, updatedAt: Date.now() }
      const paid = Number(merged.amountPaid) || 0
      merged.status = paid <= 0 ? 'unpaid' : paid >= fee ? 'paid' : 'partial'
      put(STORES.payments, merged)
      const others = list.filter((p) => !(p.monthId === monthId && p.memberId === memberId))
      return [...others, merged]
    })
  }, [members, flashSaving])

  // ---------- Last month carry-over ----------
  // Club-level: add last month's leftover balance into this month's total budget.
  const setCarriedForward = useCallback(async (monthId, amount) => {
    flashSaving()
    const value = Number(amount) || 0
    setMonths((list) => {
      const existing = list.find((m) => m.id === monthId)
      const base = existing || { id: monthId, createdAt: Date.now() }
      const updated = { ...base, carriedForward: value }
      put(STORES.months, updated)
      const others = list.filter((m) => m.id !== monthId)
      return [...others, updated]
    })
    logActivity(value > 0 ? `Added Rs ${value} carried forward from last month to this month's total` : `Cleared last month's carried-forward amount`)
    pushToast(value > 0 ? "Last month's balance added to this month" : 'Carried-forward amount cleared')
  }, [flashSaving, logActivity, pushToast])

  // Member-level: record what a member still owed from last month, kept
  // separate from this month's own fee so it never changes this month's
  // paid/partial/unpaid status — purely a carried-over note.
  const setPendingFromLastMonth = useCallback(async (monthId, memberId, amount) => {
    flashSaving()
    const value = Number(amount) || 0
    setPayments((list) => {
      const existing = list.find((p) => p.monthId === monthId && p.memberId === memberId)
      const member = members.find((m) => m.id === memberId)
      const base = existing || {
        id: uid('pay'), monthId, memberId,
        defaultFee: member?.defaultFee || 0, amountPaid: 0, status: 'unpaid', updatedAt: Date.now(),
      }
      const merged = { ...base, pendingFromLastMonth: value, updatedAt: Date.now() }
      put(STORES.payments, merged)
      const others = list.filter((p) => !(p.monthId === monthId && p.memberId === memberId))
      return [...others, merged]
    })
    const member = members.find((m) => m.id === memberId)
    logActivity(`Recorded last month's pending amount for ${member?.name || 'a member'}`)
  }, [members, flashSaving, logActivity])

  // ---------- Fines ----------
  const addFine = useCallback(async (data) => {
    flashSaving()
    const fine = {
      id: uid('fine'),
      memberId: data.memberId,
      reason: data.reason,
      amount: Number(data.amount) || 0,
      date: data.date || new Date().toISOString().slice(0, 10),
      status: data.status || 'unpaid',
      datePaid: data.status === 'paid' ? (data.datePaid || new Date().toISOString().slice(0, 10)) : '',
      notes: data.notes || '',
      createdAt: Date.now(),
    }
    await put(STORES.fines, fine)
    setFines((f) => [...f, fine])
    const member = members.find((m) => m.id === data.memberId)
    logActivity(`Fine of Rs ${fine.amount} added for ${member?.name || 'member'}`)
    pushToast('Fine added')
    return fine
  }, [members, flashSaving, logActivity, pushToast])

  const updateFine = useCallback(async (id, patch) => {
    flashSaving()
    setFines((list) => {
      const updated = list.map((f) => (f.id === id ? { ...f, ...patch } : f))
      put(STORES.fines, updated.find((f) => f.id === id))
      return updated
    })
  }, [flashSaving])

  const deleteFine = useCallback(async (id) => {
    flashSaving()
    const target = fines.find((f) => f.id === id)
    setLastDeleted({ type: 'fine', data: target })
    await remove(STORES.fines, id)
    setFines((f) => f.filter((x) => x.id !== id))
    pushToast('Fine deleted', 'danger')
  }, [fines, flashSaving, pushToast])

  // ---------- Expenses ----------
  const addExpense = useCallback(async (data) => {
    flashSaving()
    const monthId = (data.date || new Date().toISOString().slice(0, 10)).slice(0, 7)
    const expense = {
      id: uid('exp'),
      monthId,
      title: data.title,
      amount: Number(data.amount) || 0,
      date: data.date || new Date().toISOString().slice(0, 10),
      description: data.description || '',
      createdAt: Date.now(),
    }
    await put(STORES.expenses, expense)
    setExpenses((e) => [...e, expense])
    logActivity(`Expense "${expense.title}" of Rs ${expense.amount} recorded`)
    pushToast('Expense added')
    return expense
  }, [flashSaving, logActivity, pushToast])

  const updateExpense = useCallback(async (id, patch) => {
    flashSaving()
    setExpenses((list) => {
      const updated = list.map((e) => (e.id === id ? { ...e, ...patch, monthId: (patch.date || e.date).slice(0, 7) } : e))
      put(STORES.expenses, updated.find((e) => e.id === id))
      return updated
    })
  }, [flashSaving])

  const deleteExpense = useCallback(async (id) => {
    flashSaving()
    const target = expenses.find((e) => e.id === id)
    setLastDeleted({ type: 'expense', data: target })
    await remove(STORES.expenses, id)
    setExpenses((e) => e.filter((x) => x.id !== id))
    pushToast('Expense deleted', 'danger')
  }, [expenses, flashSaving, pushToast])

  // ---------- Undo ----------
  const undoLastDelete = useCallback(async () => {
    if (!lastDeleted) return
    flashSaving()
    const { type, data } = lastDeleted
    if (!data) return
    if (type === 'member') {
      await put(STORES.members, data)
      setMembers((m) => [...m, data])
      const { relatedPayments, relatedFines } = lastDeleted
      if (relatedPayments?.length) {
        for (const p of relatedPayments) await put(STORES.payments, p)
        setPayments((list) => [...list, ...relatedPayments])
      }
      if (relatedFines?.length) {
        for (const f of relatedFines) await put(STORES.fines, f)
        setFines((list) => [...list, ...relatedFines])
      }
    }
    if (type === 'fine') { await put(STORES.fines, data); setFines((f) => [...f, data]) }
    if (type === 'expense') { await put(STORES.expenses, data); setExpenses((e) => [...e, data]) }
    setLastDeleted(null)
    pushToast('Restored')
  }, [lastDeleted, flashSaving, pushToast])

  // ---------- Backup ----------
  const exportBackup = useCallback(async () => {
    return exportAllData()
  }, [])

  const importBackup = useCallback(async (data) => {
    await importAllData(data)
    const m = await getAll(STORES.members)
    const mo = await getAll(STORES.months)
    const pay = await getAll(STORES.payments)
    const fi = await getAll(STORES.fines)
    const ex = await getAll(STORES.expenses)
    setMembers(m); setMonths(mo); setPayments(pay); setFines(fi); setExpenses(ex)
    pushToast('Backup restored')
  }, [pushToast])

  const value = useMemo(() => ({
    loading, loadError, members, months, payments, fines, expenses, activity,
    saveStatus, toasts, lastDeleted,
    addMember, updateMember, deleteMember,
    upsertPayment, setCarriedForward, setPendingFromLastMonth,
    addFine, updateFine, deleteFine,
    addExpense, updateExpense, deleteExpense,
    undoLastDelete, exportBackup, importBackup, pushToast,
  }), [loading, loadError, members, months, payments, fines, expenses, activity, saveStatus, toasts, lastDeleted,
    addMember, updateMember, deleteMember, upsertPayment, setCarriedForward, setPendingFromLastMonth,
    addFine, updateFine, deleteFine,
    addExpense, updateExpense, deleteExpense, undoLastDelete, exportBackup, importBackup, pushToast])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
