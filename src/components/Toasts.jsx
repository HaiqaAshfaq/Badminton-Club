import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function Toasts() {
  const { toasts } = useData()
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className="glass rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2.5 text-sm font-medium text-ink-900 dark:text-white"
          >
            {t.type === 'danger' ? <XCircle size={18} className="text-rose-500 shrink-0" /> : <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
