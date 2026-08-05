import { useRef, useState } from 'react'
import { Upload, Download, RotateCcw } from 'lucide-react'
import { useData } from '../context/DataContext'
import ConfirmDialog from '../components/ConfirmDialog'

export default function BackupRestore() {
  const { exportBackup, importBackup, lastDeleted, undoLastDelete } = useData()
  const fileRef = useRef(null)
  const [pendingImport, setPendingImport] = useState(null)

  async function handleExport() {
    const data = await exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url; a.download = `makki-club-backup-${stamp}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        setPendingImport(data)
      } catch {
        alert('This file could not be read. Please select a valid backup JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="card">
        <p className="font-semibold text-sm text-ink-900 dark:text-white mb-1">Export Backup</p>
        <p className="text-xs text-ink-400 mb-4">Save every member, month, payment, fine, and expense into one file you can keep safe or move to another device.</p>
        <button onClick={handleExport} className="btn-primary w-full flex items-center justify-center gap-2"><Download size={17} /> Export Backup</button>
      </div>

      <div className="card">
        <p className="font-semibold text-sm text-ink-900 dark:text-white mb-1">Import Backup</p>
        <p className="text-xs text-ink-400 mb-4">Restoring will replace all current data on this device with the contents of the backup file.</p>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} className="btn-secondary w-full flex items-center justify-center gap-2"><Upload size={17} /> Choose Backup File</button>
      </div>

      {lastDeleted && (
        <div className="card flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-sm text-ink-900 dark:text-white">Restore Last Deleted Item</p>
            <p className="text-xs text-ink-400 mt-0.5">Undo the most recent delete.</p>
          </div>
          <button onClick={undoLastDelete} className="p-3 rounded-2xl bg-blue-600/10 text-blue-600 shrink-0"><RotateCcw size={18} /></button>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingImport}
        title="Replace all data?"
        message="This will overwrite everything currently on this device with the selected backup. This cannot be undone."
        confirmLabel="Restore Backup"
        onCancel={() => setPendingImport(null)}
        onConfirm={async () => { await importBackup(pendingImport); setPendingImport(null) }}
      />
    </div>
  )
}
