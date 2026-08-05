export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-cloud-100 dark:bg-white/5 grid place-items-center mb-4">
          <Icon size={26} className="text-ink-400" />
        </div>
      )}
      <p className="font-display font-bold text-ink-900 dark:text-white">{title}</p>
      {message && <p className="text-sm text-ink-400 mt-1 max-w-xs">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
