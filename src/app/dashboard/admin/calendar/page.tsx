'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Loader2, X, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type CalendarEvent = {
  id: string
  title: string
  description?: string
  event_type: string
  start_time: string
  end_time?: string
  all_day: boolean
  location?: string
  color?: string
  target_roles: string[]
}

const EVENT_TYPES = ['meeting', 'deadline', 'holiday', 'workshop', 'exam', 'general']
const ROLE_OPTIONS = ['all', 'student', 'client', 'mentor', 'employee', 'intern', 'admin']
const EVENT_COLORS = ['#0A2472', '#0D56B8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'general',
    start_time: '', end_time: '', all_day: false,
    location: '', color: '#0A2472', target_roles: ['all'],
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const loadEvents = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('calendar_events').select('*').order('start_time', { ascending: true })
    setEvents(data || [])
    setLoading(false)
  }

  useEffect(() => { loadEvents() }, [])

  const eventsForDay = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.start_time)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const upcomingEvents = events.filter(e => new Date(e.start_time) >= today).slice(0, 8)

  const handleSave = async () => {
    if (!form.title || !form.start_time) { setToast({ message: 'Title and start time are required', type: 'error' }); return }
    setSaving(true)
    try {
      const res = await fetch('/api/calendar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const { error } = await res.json(); setToast({ message: error || 'Failed', type: 'error' }); return }
      setToast({ message: 'Event created', type: 'success' })
      setShowModal(false)
      loadEvents()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return
    const res = await fetch(`/api/calendar/${id}`, { method: 'DELETE' })
    if (res.ok) { setToast({ message: 'Event deleted', type: 'success' }); setEvents(prev => prev.filter(e => e.id !== id)) }
    else setToast({ message: 'Failed to delete', type: 'error' })
  }

  const toggleRole = (role: string) => {
    if (role === 'all') { setForm(f => ({ ...f, target_roles: ['all'] })); return }
    setForm(f => {
      const curr = f.target_roles.filter(r => r !== 'all')
      return { ...f, target_roles: curr.includes(role) ? curr.filter(r => r !== role) : [...curr, role] }
    })
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div>
      <PageHeader
        title="SUG Calendar"
        description="Manage events, workshops, and deadlines for all roles"
        action={
          <button onClick={() => setShowModal(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} /> Add Event
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))} className="text-foreground/40 hover:text-primary p-1 rounded-lg hover:bg-off-white transition-colors"><ChevronLeft size={20} /></button>
            <h3 className="font-heading font-bold text-primary">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))} className="text-foreground/40 hover:text-primary p-1 rounded-lg hover:bg-off-white transition-colors"><ChevronRight size={20} /></button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-foreground/50 py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                const dayEvents = day ? eventsForDay(day) : []
                const isToday = day !== null && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
                return (
                  <div key={i} className={`min-h-[70px] p-1.5 rounded-lg border text-sm ${isToday ? 'bg-primary-bright/5 border-primary-bright' : day ? 'border-border/50 hover:bg-off-white/50' : 'border-transparent bg-off-white/30'}`}>
                    {day && (
                      <>
                        <span className={`text-xs font-medium block mb-1 ${isToday ? 'text-primary-bright font-bold' : 'text-foreground/60'}`}>{day}</span>
                        {dayEvents.slice(0, 2).map(e => (
                          <div key={e.id} className="text-[10px] text-white font-medium px-1 py-0.5 rounded truncate mb-0.5" style={{ backgroundColor: e.color || '#0A2472' }}>
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <div className="text-[10px] text-foreground/40">+{dayEvents.length - 2} more</div>}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-bold text-primary">Upcoming Events</h3>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-foreground/40 text-center py-8">No upcoming events</p>
            ) : (
              upcomingEvents.map(e => (
                <div key={e.id} className="flex gap-3 items-start group">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: e.color || '#0A2472' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{e.title}</p>
                    <p className="text-xs text-foreground/50">{new Date(e.start_time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    <div className="flex gap-1 mt-0.5">
                      {(e.target_roles || []).slice(0, 2).map(r => (
                        <span key={r} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded capitalize font-medium">{r}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(e.id)} className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-red-500 transition-all shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">Add Event</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-foreground/40" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Type</label>
                  <select value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright">
                    {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {EVENT_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? 'border-primary scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Start Time *</label>
                  <input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">End Time</label>
                  <input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Location</label>
                <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" placeholder="Optional location" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-2 uppercase tracking-wide">Visible To</label>
                <div className="flex gap-2 flex-wrap">
                  {ROLE_OPTIONS.map(r => (
                    <button key={r} type="button" onClick={() => toggleRole(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-colors ${form.target_roles.includes(r) ? 'bg-primary text-white border-primary' : 'border-border text-foreground/60 hover:border-primary'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground/60 hover:bg-off-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? 'Creating...' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
