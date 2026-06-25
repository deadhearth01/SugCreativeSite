'use client'

import { useMemo, useState } from 'react'
import { X, Loader2, GripVertical, Home, ImageIcon, Search, Check } from 'lucide-react'

export type OrderCourse = {
  id: string
  title: string
  category?: string
  thumbnail_url?: string
  display_order?: number
  is_featured?: boolean
}

const MAX_SLOTS = 4

function Thumb({ url, title }: { url?: string; title: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={title}
        className="w-full h-full object-cover"
      />
    )
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#35C8E0]/20 to-[#1A9AB5]/30 text-white/70">
      <ImageIcon size={18} />
    </div>
  )
}

/**
 * Homepage Order Management modal.
 *
 * The homepage shows exactly 4 featured courses ordered by `display_order`.
 * The admin drags courses from the "Available" list into the 4 ordered slots
 * (or reorders/removes within the slots). On save, the 4 chosen courses get
 * display_order 1..4 and is_featured=true; every other course gets
 * is_featured=false (its display_order is left untouched).
 */
// Compute the initial 4 slots from the courses' current featured + display_order.
function initialSlots(courses: OrderCourse[]): string[] {
  const featured = courses
    .filter((c) => c.is_featured && (c.display_order ?? 0) >= 1 && (c.display_order ?? 0) <= MAX_SLOTS)
    .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99))
    .map((c) => c.id)
  const extra = courses
    .filter((c) => c.is_featured && !featured.includes(c.id))
    .map((c) => c.id)
  return [...featured, ...extra].slice(0, MAX_SLOTS)
}

// Thin wrapper: mount the inner panel fresh each time the modal opens so its
// state initializes from the latest courses (lazy useState) — no effect needed.
export default function OrderManagerModal(props: {
  open: boolean
  courses: OrderCourse[]
  onClose: () => void
  onSaved: () => void
  onToast: (message: string, type: 'success' | 'error') => void
}) {
  if (!props.open) return null
  return <OrderManagerPanel {...props} />
}

function OrderManagerPanel({
  courses,
  onClose,
  onSaved,
  onToast,
}: {
  courses: OrderCourse[]
  onClose: () => void
  onSaved: () => void
  onToast: (message: string, type: 'success' | 'error') => void
}) {
  // Ordered list of chosen course ids (max 4) — initialized from current state.
  const [slots, setSlots] = useState<string[]>(() => initialSlots(courses))
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [dragId, setDragId] = useState<string | null>(null)
  const [overSlot, setOverSlot] = useState<number | null>(null)

  const byId = useMemo(() => {
    const m = new Map<string, OrderCourse>()
    courses.forEach((c) => m.set(c.id, c))
    return m
  }, [courses])

  const available = courses
    .filter((c) => !slots.includes(c.id))
    .filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))

  const addToSlots = (id: string) => {
    setSlots((prev) => {
      if (prev.includes(id)) return prev
      if (prev.length >= MAX_SLOTS) return prev
      return [...prev, id]
    })
  }

  const removeFromSlots = (id: string) =>
    setSlots((prev) => prev.filter((s) => s !== id))

  // Drop onto a slot index — inserts the dragged course at that position.
  const dropOnSlot = (index: number) => {
    if (!dragId) return
    setSlots((prev) => {
      const without = prev.filter((s) => s !== dragId)
      const atCap = !prev.includes(dragId) && without.length >= MAX_SLOTS
      if (atCap) return prev
      const clamped = Math.min(index, without.length)
      return [...without.slice(0, clamped), dragId, ...without.slice(clamped)]
    })
    setDragId(null)
    setOverSlot(null)
  }

  // Drop onto the available list — removes from slots.
  const dropOnAvailable = () => {
    if (!dragId) return
    removeFromSlots(dragId)
    setDragId(null)
    setOverSlot(null)
  }

  const handleSave = async () => {
    setSaving(true)
    // Determine which courses changed so we only PATCH those.
    const updates: { id: string; display_order: number; is_featured: boolean }[] = []

    slots.forEach((id, idx) => {
      const c = byId.get(id)
      const order = idx + 1
      if (!c) return
      if (!c.is_featured || c.display_order !== order) {
        updates.push({ id, display_order: order, is_featured: true })
      }
    })

    courses.forEach((c) => {
      if (!slots.includes(c.id) && c.is_featured) {
        updates.push({ id: c.id, display_order: c.display_order ?? 0, is_featured: false })
      }
    })

    if (updates.length === 0) {
      onToast('No changes to save', 'success')
      setSaving(false)
      onClose()
      return
    }

    setProgress({ done: 0, total: updates.length })
    let failed = 0
    for (const u of updates) {
      try {
        const res = await fetch(`/api/courses/${u.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_order: u.display_order,
            is_featured: u.is_featured,
          }),
        })
        if (!res.ok) failed++
      } catch {
        failed++
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }))
    }

    setSaving(false)
    if (failed > 0) {
      onToast(`Saved with ${failed} error${failed > 1 ? 's' : ''}`, 'error')
    } else {
      onToast('Homepage order updated', 'success')
    }
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Homepage order management"
        className="bg-white rounded-2xl w-full max-w-4xl shadow-lg flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Home size={18} /> Homepage Order Management
            </h2>
            <p className="text-xs text-foreground/40 mt-0.5">
              Drag exactly {MAX_SLOTS} courses into the slots. They appear on the homepage in this order.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Close order management"
          >
            <X size={20} className="text-foreground/40" />
          </button>
        </div>

        {/* Body */}
        <div className="grid md:grid-cols-2 gap-5 p-5 overflow-y-auto overscroll-contain flex-1">
          {/* ── Homepage slots ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-wide">
                Homepage Slots
              </h3>
              <span
                className={`text-xs font-semibold ${
                  slots.length >= MAX_SLOTS ? 'text-emerald-600' : 'text-foreground/40'
                }`}
              >
                {slots.length}/{MAX_SLOTS}
              </span>
            </div>
            <div className="space-y-2">
              {Array.from({ length: MAX_SLOTS }).map((_, i) => {
                const id = slots[i]
                const c = id ? byId.get(id) : undefined
                return (
                  <div
                    key={i}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setOverSlot(i)
                    }}
                    onDragLeave={() => setOverSlot((s) => (s === i ? null : s))}
                    onDrop={(e) => {
                      e.preventDefault()
                      dropOnSlot(i)
                    }}
                    className={`flex items-center gap-3 rounded-xl border-2 p-2 transition-colors ${
                      overSlot === i
                        ? 'border-[#35C8E0] bg-[#35C8E0]/5'
                        : c
                          ? 'border-gray-200 bg-white'
                          : 'border-dashed border-gray-300 bg-gray-50'
                    }`}
                  >
                    <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {c ? (
                      <div
                        draggable
                        onDragStart={() => setDragId(c.id)}
                        onDragEnd={() => {
                          setDragId(null)
                          setOverSlot(null)
                        }}
                        className="flex items-center gap-2 flex-1 min-w-0 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical size={14} className="text-foreground/30 shrink-0" />
                        <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0">
                          <Thumb url={c.thumbnail_url} title={c.title} />
                        </div>
                        <span className="text-sm font-semibold text-foreground/80 truncate flex-1">
                          {c.title}
                        </span>
                        <button
                          onClick={() => removeFromSlots(c.id)}
                          className="p-1 rounded-lg text-foreground/30 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                          aria-label={`Remove ${c.title}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-foreground/40 flex-1">
                        Drag a course here
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Available courses ── */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              dropOnAvailable()
            }}
          >
            <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-wide mb-2">
              Available Courses
            </h3>
            <div className="relative mb-2">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses…"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
              />
            </div>
            {slots.length >= MAX_SLOTS && (
              <p className="text-[11px] text-amber-600 mb-2">
                All {MAX_SLOTS} slots are full. Remove one to add another.
              </p>
            )}
            <div className="space-y-1.5 max-h-72 overflow-y-auto overscroll-contain pr-1">
              {available.length === 0 ? (
                <p className="text-xs text-foreground/40 py-6 text-center">
                  No courses available.
                </p>
              ) : (
                available.map((c) => {
                  const full = slots.length >= MAX_SLOTS
                  return (
                    <div
                      key={c.id}
                      draggable={!full}
                      onDragStart={() => !full && setDragId(c.id)}
                      onDragEnd={() => {
                        setDragId(null)
                        setOverSlot(null)
                      }}
                      className={`flex items-center gap-2 rounded-xl border border-gray-200 p-2 transition-colors ${
                        full
                          ? 'opacity-50'
                          : 'cursor-grab active:cursor-grabbing hover:border-[#35C8E0] hover:bg-[#35C8E0]/5'
                      }`}
                    >
                      <GripVertical size={14} className="text-foreground/30 shrink-0" />
                      <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0">
                        <Thumb url={c.thumbnail_url} title={c.title} />
                      </div>
                      <span className="text-sm font-semibold text-foreground/80 truncate flex-1">
                        {c.title}
                      </span>
                      <button
                        onClick={() => addToSlots(c.id)}
                        disabled={full}
                        title={full ? `Limit of ${MAX_SLOTS} reached` : 'Add to homepage'}
                        className="p-1 rounded-lg text-foreground/30 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0 disabled:opacity-40 disabled:hover:bg-transparent"
                        aria-label={`Add ${c.title}`}
                      >
                        <Check size={15} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-5 border-t border-gray-200 shrink-0">
          {saving && progress.total > 0 && (
            <span className="text-xs text-foreground/50 flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin" />
              Saving {progress.done}/{progress.total}…
            </span>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-foreground/60 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md flex items-center gap-1.5"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Save Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
