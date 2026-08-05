import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-end sm:place-items-center px-0 sm:px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40" onClick={onCancel} />
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full sm:max-w-sm bg-white dark:bg-navy-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
          >
            <div className="h-11 w-11 rounded-2xl bg-rose-500/10 grid place-items-center mb-3">
              <AlertTriangle size={22} className="text-rose-500" />
            </div>
            <h3 className="font-display font-bold text-lg text-ink-900 dark:text-white">{title}</h3>
            <p className="text-sm text-ink-600 dark:text-cloud-200 mt-1.5">{message}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-cloud-100 dark:bg-white/5 text-ink-900 dark:text-white">
                Cancel
              </button>
              <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-rose-500 text-white shadow-lg shadow-rose-500/25">
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
