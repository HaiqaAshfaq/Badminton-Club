import { uid, } from '../utils/format'
import { currentMonthId } from '../utils/month'

// Members transcribed from the club's existing Excel sheet
export const SEED_MEMBERS_RAW = [
  ['Ashfaq Ghuman', 5000],
  ['Naeem Asghar', 5000],
  ['Irshad Hussain', 2000],
  ['Qaiser Shahzad', 2000],
  ['Naseer Khan', 3000],
  ['Altaf Hussain', 5000],
  ['Sanaullah', 5000],
  ['Shakeel Ahmad', 5000],
  ['Hammad SB', 5000],
  ['Irfan SB', 2000],
  ['Rizwan SB', 5000],
]

export function buildSeedMembers() {
  const today = new Date().toISOString().slice(0, 10)
  return SEED_MEMBERS_RAW.map(([name, fee]) => ({
    id: uid('mem'),
    name,
    joiningDate: today,
    defaultFee: fee,
    phone: '',
    notes: '',
    status: 'active',
    createdAt: Date.now(),
  }))
}

export function buildSeedMonthAndPayments(members) {
  const monthId = currentMonthId()
  const month = {
    id: monthId,
    createdAt: Date.now(),
  }
  const payments = members.map((m) => ({
    id: uid('pay'),
    monthId,
    memberId: m.id,
    defaultFee: m.defaultFee,
    amountPaid: 0,
    status: 'unpaid',
    updatedAt: Date.now(),
  }))
  return { month, payments }
}
