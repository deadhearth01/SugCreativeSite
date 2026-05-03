'use client'

import { useEffect, useMemo, useState } from 'react'
import { Video, Calendar, Clock, ExternalLink, Users, Plus, X, Loader2, Check, Search, RefreshCw, Copy } from 'lucide-react'
import { PageHeader, DashboardPanel, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Meeting = {
  id: string
  title: string
  description?: string | null
  meeting_type: string
  meeting_link?: string | null
  scheduled_at: string
  duration_minutes?: number | null
  status: string
  organizer_id: string
  organizer: { full_name: string | null } | null
  meeting_participants: { user_id: string; status: string }[]
}

type Mentee = {
  id: string
  full_name: string | null
  username: string | null
  email: string
  avatar_url: string | null
  role: string
}

type Assignment = {
  id: string
  mentee: Mentee | Mentee[] | null
}

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
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
  const [mentees, setMentees] = useState<Mentee[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming')
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [checkingGoogle, setCheckingGoogle] = useState(true)
  const [participantSearch, setParticipantSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    meeting_link: '',
    scheduled_at: '',
    duration_minutes: '60',
    participant_ids: [] as string[],
    create_google_meet: false,
  })

  const loadGoogleStatus = async () => {
    setCheckingGoogle(true)
    try {
      const res = await fetch('/api/auth/google/status')
      const data = await res.json()
      setGoogleConnected(data.canCreateMeetings || false)
    } catch {
      setGoogleConnected(false)
    } finally {
      setCheckingGoogle(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [meetingsRes, menteesRes] = await Promise.all([
        supabase
          .from('meetings')
          .select('*, organizer:organizer_id(full_name), meeting_participants(user_id, status)')
          .eq('organizer_id', user.id)
          .order('scheduled_at', { ascending: true }),
        fetch('/api/mentor/mentees').then(res => res.json()),
      ])

      setMeetings((meetingsRes.data as unknown as Meeting[]) || [])
      const assigned = ((menteesRes.data || []) as Assignment[])
        .map(row => Array.isArray(row.mentee) ? row.mentee[0] : row.mentee)
        .filter((m): m is Mentee => Boolean(m))
      setMentees(assigned)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoogleStatus()
    loadData()
  }, [])

  const filtered = meetings.filter(m => {
    const isPast = new Date(m.scheduled_at) < new Date()
    if (filter === 'upcoming') return !isPast && m.status !== 'cancelled'
    if (filter === 'completed') return isPast || m.status === 'completed'
    return true
  })

  const filteredMentees = useMemo(() => {
    const q = participantSearch.trim().toLowerCase()
    if (!q) return mentees
    return mentees.filter(m =>
      (m.full_name || '').toLowerCase().includes(q)
      || (m.username || '').toLowerCase().includes(q)
      || m.email.toLowerCase().includes(q)
    )
  }, [mentees, participantSearch])

  const menteeCounts = {
    all: mentees.length,
    interns: mentees.filter(m => m.role === 'intern').length,
    students: mentees.filter(m => m.role === 'student').length,
  }

  const openCreate = () => {
    setForm({
      title: '',
      description: '',
      meeting_link: '',
      scheduled_at: '',
      duration_minutes: '60',
      participant_ids: [],
      create_google_meet: googleConnected,
    })
    setParticipantSearch('')
    setShowCreate(true)
  }

  const toggleParticipant = (id: string) => {
    setForm(f => ({
      ...f,
      participant_ids: f.participant_ids.includes(id)
        ? f.participant_ids.filter(pid => pid !== id)
        : [...f.participant_ids, id],
    }))
  }

  const handleCreate = async () => {
    if (!form.title || !form.scheduled_at) {
      setToast({ message: 'Title and scheduled time are required', type: 'error' })
      return
    }
    if (form.participant_ids.length === 0) {
      setToast({ message: 'Select at least one assigned mentee', type: 'error' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          meeting_type: 'mentoring',
          meeting_link: form.meeting_link || null,
          scheduled_at: new Date(form.scheduled_at).toISOString(),
          duration_minutes: parseInt(form.duration_minutes, 10) || 60,
          participant_ids: form.participant_ids,
          create_google_meet: form.create_google_meet && googleConnected,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setToast({
          message: result.needsGoogleAuth ? 'Connect your Google account first' : result.error || 'Failed to create meeting',
          type: 'error',
        })
        return
      }
      setToast({ message: result.googleMeetCreated ? 'Google Meet scheduled' : 'Meeting scheduled', type: 'success' })
      setShowCreate(false)
      await loadData()
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

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        description="Create Google Meet sessions for your assigned interns and students"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={loadData} className="p-2.5 rounded-lg border border-border bg-white hover:bg-off-white transition-colors" title="Refresh">
              <RefreshCw size={16} />
            </button>
            {!googleConnected && !checkingGoogle && (
              <a
                href="/api/auth/google"
                onClick={(e) => { e.preventDefault(); window.location.href = `/api/auth/google?origin=${encodeURIComponent(window.location.origin)}` }}
                className="bg-white border border-border text-foreground/70 px-4 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 hover:border-[#35C8E0] transition-colors"
              >
                <GoogleMark />
                Connect Google
              </a>
            )}
            <button onClick={openCreate} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
              <Plus size={16} /> Schedule Meeting
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Assigned mentees', value: menteeCounts.all },
          { label: 'Interns', value: menteeCounts.interns },
          { label: 'Students', value: menteeCounts.students },
        ].map(item => (
          <div key={item.label} className="bg-white border border-border rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/45">{item.label}</p>
            <p className="text-2xl font-black text-[#1A9AB5] mt-1">{item.value}</p>
          </div>
        ))}
      </div>

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
                        <Clock size={13} /> {m.duration_minutes || 60} min
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-foreground/50">
                        <Users size={13} /> {Math.max((m.meeting_participants?.length || 1) - 1, 0)} invited
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.meeting_link && m.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => copyLink(m.meeting_link!, m.id)}
                          className="p-2 rounded-lg border border-border hover:bg-off-white text-foreground/50 hover:text-primary transition-colors"
                          title="Copy link"
                        >
                          {copiedId === m.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                        <a href={m.meeting_link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary-bright text-white text-xs font-semibold rounded-lg hover:bg-primary-bright/90 transition-colors">
                          <ExternalLink size={12} /> Join
                        </a>
                      </>
                    )}
                    {m.status !== 'cancelled' && new Date(m.scheduled_at) > new Date() && (
                      <button onClick={() => handleCancel(m.id)} className="px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>

      {showCreate && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-primary">Schedule Mentoring Meeting</h2>
                <p className="text-xs text-foreground/50 mt-1">Invite assigned interns and students only</p>
              </div>
              <button onClick={() => setShowCreate(false)}><X size={20} className="text-foreground/40" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" placeholder="e.g. Weekly Check-in" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Date & Time *</label>
                  <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Duration (min)</label>
                  <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" min="15" step="15" />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-off-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <GoogleMark />
                    <span className="text-sm font-bold text-primary">Google Meet</span>
                  </div>
                  {googleConnected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700"><Check size={12} /> Connected</span>
                  ) : (
                    <a href="/api/auth/google" onClick={(e) => { e.preventDefault(); window.location.href = `/api/auth/google?origin=${encodeURIComponent(window.location.origin)}` }} className="text-xs font-bold text-[#1A9AB5] hover:underline">
                      Connect account
                    </a>
                  )}
                </div>
                {googleConnected ? (
                  <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-foreground/70">
                    <input
                      type="checkbox"
                      checked={form.create_google_meet}
                      onChange={e => setForm(f => ({ ...f, create_google_meet: e.target.checked, meeting_link: e.target.checked ? '' : f.meeting_link }))}
                      className="h-4 w-4 rounded border-border"
                    />
                    Create Google Meet automatically
                  </label>
                ) : null}
                {(!googleConnected || !form.create_google_meet) && (
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Meeting link</label>
                    <input
                      type="url"
                      value={form.meeting_link}
                      onChange={e => setForm(f => ({ ...f, meeting_link: e.target.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wide">Invite mentees ({form.participant_ids.length})</label>
                  {form.participant_ids.length > 0 && (
                    <button onClick={() => setForm(f => ({ ...f, participant_ids: [] }))} className="text-xs font-semibold text-foreground/45 hover:text-red-500">Clear</button>
                  )}
                </div>
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" />
                  <input
                    value={participantSearch}
                    onChange={e => setParticipantSearch(e.target.value)}
                    className="w-full rounded-lg border border-border py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-[#35C8E0]"
                    placeholder="Search assigned mentees..."
                  />
                </div>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
                  {filteredMentees.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm font-semibold text-foreground/40">
                      {mentees.length === 0 ? 'No assigned mentees yet' : 'No mentees match your search'}
                    </p>
                  ) : (
                    filteredMentees.map(m => {
                      const checked = form.participant_ids.includes(m.id)
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleParticipant(m.id)}
                          className={`w-full flex items-center gap-3 border-b border-border/60 px-4 py-3 text-left last:border-0 hover:bg-off-white ${checked ? 'bg-[#35C8E0]/10' : 'bg-white'}`}
                        >
                          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${checked ? 'border-[#1A9AB5] bg-[#1A9AB5]' : 'border-border'}`}>
                            {checked && <Check size={12} className="text-white" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-primary">{m.full_name || m.email}</p>
                            <p className="text-xs text-foreground/45">{m.role} {m.username ? `- @${m.username}` : ''}</p>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
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
