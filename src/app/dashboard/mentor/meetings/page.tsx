'use client'

import { useState, useEffect } from 'react'
import { Video, Calendar, Clock, ExternalLink, Users, Plus, X, Loader2 } from 'lucide-react'
import { PageHeader, DashboardPanel, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Meeting = {
  id: string
  title: string
  description?: string
  meeting_type: string
  meeting_link?: string
  scheduled_at: string
  duration: number
  status: string
  notes?: string
  organizer: { full_name: string } | null
  meeting_participants: { user_id: string; status: string }[]
}

type Profile = { id: string; full_name: string; email: string }

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}
    </div>
  )
}

export default function MentorMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming')
  const [showCreate, setShowCreate] = useState(false)
  const [students, setStudents] = useState<Profile[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', meeting_type: 'mentoring',
    meeting_link: '', scheduled_at: '', duration: '60',
    participant_ids: [] as string[], notes: '',
  })

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [meetingsRes, studentsRes] = await Promise.all([
      supabase.from('meetings').select(`*, organizer:organizer_id(full_name), meeting_participants(user_id, status)`)
        .or(`organizer_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: true }),
      supabase.from('profiles').select('id, full_name, email').eq('role', 'student').eq('status', 'active'),
    ])
    setMeetings(meetingsRes.data || [])
    setStudents(studentsRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const filtered = meetings.filter(m => {
    const isPast = new Date(m.scheduled_at) < new Date()
    if (filter === 'upcoming') return !isPast && m.status !== 'cancelled'
    if (filter === 'completed') return isPast || m.status === 'completed'
    return true
  })

  const handleCreate = async () => {
    if (!form.title || !form.scheduled_at) {
      setToast({ message: 'Title and scheduled time are required', type: 'error' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duration: parseInt(form.duration) }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        setToast({ message: error || 'Failed to create meeting', type: 'error' })
        return
      }
      setToast({ message: 'Meeting scheduled successfully', type: 'success' })
      setShowCreate(false)
      loadData()
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this meeting?')) return
    const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setToast({ message: 'Meeting cancelled', type: 'success' })
      loadData()
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        description="Schedule and manage your mentoring meetings"
        action={
          <button onClick={() => setShowCreate(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} /> Schedule Meeting
          </button>
        }
      />

      {/* Filter */}
      <div className="flex gap-2">
        {(['upcoming', 'all', 'completed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/60 hover:border-[#35C8E0]'}`}>
            {f === 'upcoming' ? 'Upcoming' : f === 'completed' ? 'Past' : 'All'}
          </button>
        ))}
      </div>

      <DashboardPanel title={`Meetings (${filtered.length})`}>
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Video size={32} className="text-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-foreground/40">No meetings found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(m => (
              <div key={m.id} className="border border-border rounded-xl p-4 hover:border-[#35C8E0]/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-primary">{m.title}</h3>
                      <StatusBadge status={m.status} />
                      <span className="text-xs bg-off-white px-2 py-0.5 rounded-md font-medium capitalize">{m.meeting_type}</span>
                    </div>
                    {m.description && <p className="text-sm text-foreground/60 mt-1">{m.description}</p>}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-xs text-foreground/50">
                        <Calendar size={13} /> {formatDateTime(m.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-foreground/50">
                        <Clock size={13} /> {m.duration} min
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-foreground/50">
                        <Users size={13} /> {m.meeting_participants?.length || 0} participants
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.meeting_link && m.status !== 'cancelled' && (
                      <a href={m.meeting_link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-bright text-white text-xs font-semibold rounded-lg hover:bg-primary-bright/90 transition-colors">
                        <ExternalLink size={12} /> Join
                      </a>
                    )}
                    {m.status !== 'cancelled' && new Date(m.scheduled_at) > new Date() && (
                      <button onClick={() => handleCancel(m.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">Schedule Meeting</h2>
              <button onClick={() => setShowCreate(false)}><X size={20} className="text-foreground/40" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" placeholder="e.g. Weekly Check-in" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0] resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Date & Time *</label>
                  <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Duration (min)</label>
                  <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" min="15" step="15" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Google Meet Link</label>
                <input type="url" value={form.meeting_link} onChange={e => setForm(f => ({ ...f, meeting_link: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" placeholder="https://meet.google.com/..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Invite Students</label>
                <select multiple value={form.participant_ids} onChange={e => setForm(f => ({ ...f, participant_ids: Array.from(e.target.selectedOptions, o => o.value) }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0] h-24">
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}
                </select>
                <p className="text-xs text-foreground/40 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground/60 hover:bg-off-white transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
