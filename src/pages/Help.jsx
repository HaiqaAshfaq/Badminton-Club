import { useState } from 'react'
import {
  Info, UserPlus, Wallet, Receipt, PlusCircle, FileBarChart, DatabaseBackup,
  HelpCircle, ChevronDown, ShieldCheck,
} from 'lucide-react'

const SECTIONS = [
  {
    icon: Info,
    title: 'About the Application',
    body: [
      'This app replaces the club\'s Excel sheet for tracking members, monthly fees, fines, and expenses.',
      'Every month is tracked separately, so recording this month\'s payments never changes last month\'s records.',
      'All your data is saved automatically on this device the moment you make a change — there is no "Save" button to remember.',
    ],
  },
  {
    icon: UserPlus,
    title: 'How to Add a Member',
    body: [
      '1. Open Members from the sidebar (or the menu button on mobile).',
      '2. Tap the Add button in the top right.',
      '3. Enter the member\'s name and their monthly fee (e.g. 2000). Each member can have a different fee — it\'s how much they\'re expected to pay every month, and you can change it any time from their profile.',
      '4. Optionally add a phone number, joining date, or notes.',
      '5. Tap Add Member. They will now appear in every month going forward.',
    ],
  },
  {
    icon: Wallet,
    title: 'How to Record Monthly Payments',
    body: [
      '1. Open Monthly Payments from the sidebar.',
      '2. Use the arrows at the top to move between months, or find a member with the search box.',
      '3. Tap a member\'s card to enter how much they paid.',
      '4. Tap "Mark Full" to record the full expected fee in one tap, or type a custom amount for a partial payment.',
      '5. The status (Paid / Partially Paid / Not Paid) and the remaining amount are calculated for you automatically.',
    ],
  },
  {
    icon: Receipt,
    title: 'How to Add a Fine',
    body: [
      '1. Open Fines from the sidebar.',
      '2. Tap Add and choose the member from the searchable list — just start typing their name.',
      '3. Enter the reason for the fine (e.g. "Came 20 minutes late") and the amount.',
      '4. Mark the fine as Paid or Unpaid. You can change this later with a single tap from the Fines list.',
      '5. Add any extra notes if needed, then tap Add Fine. There is no limit to how many fines a member can have.',
    ],
  },
  {
    icon: PlusCircle,
    title: 'How to Add an Expense',
    body: [
      '1. Open Expenses from the sidebar.',
      '2. Tap Add, then pick a common expense (Guard Salary, Shuttle, Tea, etc.) or type your own.',
      '3. Enter the amount, date, and an optional description.',
      '4. Tap Add Expense. It is automatically counted in that month\'s report and financial summary.',
    ],
  },
  {
    icon: FileBarChart,
    title: 'Reports',
    body: [
      'Open Reports from the sidebar to see a complete monthly report — every member\'s payment, every fine, every expense, and the full financial summary for that month, just like the old Excel sheet.',
      'Use the arrows to move between months, or switch to Yearly, Member, Fine, or Expense reports using the tabs at the top.',
      'Tap Print to print or save a PDF of the current report. Tap Export CSV to download the data as a spreadsheet file you can open in Excel.',
      'Use the search box at the top of Reports to instantly find a member, month, fine, or expense across the entire club history.',
    ],
  },
  {
    icon: DatabaseBackup,
    title: 'Backup & Restore',
    body: [
      'Open Backup & Restore from the sidebar.',
      'Tap Export Backup to save every member, month, payment, fine, and expense into a single file. Keep this file safe (e.g. email it to yourself or save it to Google Drive).',
      'To move your data to another phone or computer, open this app there, go to Backup & Restore, tap Choose Backup File, and select the file you exported. Confirm to restore — this replaces all data currently on that device.',
    ],
  },
]

const FAQ = [
  { q: 'Is my data sent to the internet?', a: 'No. Everything is stored only on this device using your browser\'s IndexedDB storage. Nothing is uploaded anywhere unless you manually export and share a backup file.' },
  { q: 'What happens if I close the app without saving?', a: 'Every change is saved automatically the instant you make it — there is nothing to lose by closing the app.' },
  { q: 'Can I edit a payment after I\'ve recorded it?', a: 'Yes. Go to Monthly Payments, find the member for the correct month, and tap their payment to update it.' },
  { q: 'What does "Monthly Fee" mean?', a: 'It\'s how much a specific member is expected to pay each month — different members can have different fees. If you change it from their profile, every report and the Monthly Payments page update to the new amount immediately, including past months.' },
  { q: 'Will editing this month change last month\'s numbers?', a: 'No. Every month\'s payments and expenses are stored completely separately, so editing the current month never affects previous months.' },
  { q: 'How do I get my club data onto a new phone?', a: 'Use Backup & Restore: export a backup file on the old phone, then import that same file on the new one.' },
  { q: 'Can I recover something I deleted by mistake?', a: 'Right after deleting a member, fine, or expense, a "Restore Last Deleted Item" option appears on the Backup & Restore page — use it right away for a quick undo.' },
]

export default function Help() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="card flex items-start gap-3">
        <div className="h-11 w-11 rounded-2xl bg-blue-600/10 grid place-items-center shrink-0">
          <HelpCircle size={22} className="text-blue-600" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-ink-900 dark:text-white">Help & Instructions</h2>
          <p className="text-sm text-ink-400 mt-1">Everything you need to run the club's finances — no technical knowledge required.</p>
        </div>
      </div>

      {SECTIONS.map((s) => (
        <div key={s.title} className="card">
          <div className="flex items-center gap-2.5 mb-3">
            <s.icon size={18} className="text-blue-600 shrink-0" />
            <h3 className="font-display font-bold text-ink-900 dark:text-white">{s.title}</h3>
          </div>
          <div className="space-y-2">
            {s.body.map((line, i) => (
              <p key={i} className="text-sm text-ink-600 dark:text-cloud-200 leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      ))}

      <div className="card flex items-start gap-3">
        <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-sm text-ink-600 dark:text-cloud-200">
          <b className="text-ink-900 dark:text-white">Private & offline by design.</b> All club data stays on this device. Use Backup & Restore regularly so you never lose it.
        </p>
      </div>

      <div>
        <h3 className="font-display font-bold text-ink-900 dark:text-white mb-3">Frequently Asked Questions</h3>
        <div className="space-y-2.5">
          {FAQ.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 text-left">
        <span className="font-semibold text-sm text-ink-900 dark:text-white">{q}</span>
        <ChevronDown size={18} className={`text-ink-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-sm text-ink-600 dark:text-cloud-200 mt-2.5 leading-relaxed">{a}</p>}
    </div>
  )
}
