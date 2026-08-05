import { useMemo, useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'

export default function MemberSelect({ members, value, onChange, placeholder = 'Select member' }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const filtered = useMemo(() => {
    const list = members.filter((m) => m.status === 'active')
    if (!q.trim()) return list
    return list.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()))
  }, [members, q])

  const selected = members.find((m) => m.id === value)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-2xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3.5 text-sm text-left"
      >
        <span className={selected ? 'text-ink-900 dark:text-white font-medium' : 'text-ink-400'}>
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown size={18} className="text-ink-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-40 mt-2 w-full bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-cloud-200 dark:border-white/10 overflow-hidden">
          <div className="flex items-center gap-2 px-3.5 py-3 border-b border-cloud-100 dark:border-white/10">
            <Search size={16} className="text-ink-400 shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search members..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && <p className="px-4 py-4 text-sm text-ink-400">No members found</p>}
            {filtered.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false); setQ('') }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-cloud-100 dark:hover:bg-white/5 text-left"
              >
                <span className="text-ink-900 dark:text-white">{m.name}</span>
                {value === m.id && <Check size={16} className="text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
