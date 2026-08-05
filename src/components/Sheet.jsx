import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function Sheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full sm:max-w-md bg-white dark:bg-navy-900 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-white dark:bg-navy-900 flex items-center justify-between px-5 py-4 border-b border-cloud-100 dark:border-white/10 rounded-t-3xl">
              <h3 className="font-display font-bold text-base text-ink-900 dark:text-white">{title}</h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cloud-100 dark:hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 pb-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
