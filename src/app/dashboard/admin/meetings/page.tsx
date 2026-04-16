'use client'

import { useState, useEffect } from 'react'
import {
  Video, Plus, X, Search, Filter, Copy, Check, ExternalLink,
  Calendar, Clock, Users, Loader2, Trash2, CheckCircle, XCircle, RefreshCw
} from 'lucide-react'
import { PageHeader, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Meeting = {
  id: string
  title: string
  description: string | null
  meeting_type: string
  meeting_link: string | null
  scheduled_at: string
  duration_minutes: number
  status: string
  organizer_id: string
  created_at: string
  organizer?: { full_name: string }
  participant_count?: number
}

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
}

function generateMeetLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const seg = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [checkingGoogle, setCheckingGoogle] = useState(true)

  const [form, setForm] = useState({
    title: '',
    description: '',
    meeting_type: 'general',
    meeting_link: '',
    scheduled_at: '',
    duration_minutes: 30,
    participant_ids: [] as string[],
    create_google_meet: true, // Default to creating Google Meet
  })

  // Check Google connection status
  useEffect(() => {
    const checkGoogleStatus = async () => {
      try {
        const res = await fetch('/api/auth/google/status')
        const data = await res.json()
        setGoogleConnected(data.canCreateMeetings || false)
      } catch {
        setGoogleConnected(false)
      }
      setCheckingGoogle(false)
    }
    checkGoogleStatus()
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const loadMeetings = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    const [meetingsRes, profilesRes] = await Promise.all([
      supabase
        .from('meetings')
        .select('*, organizer:profiles!meetings_organizer_id_fkey(full_name)')
        .order('scheduled_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email, role').order('full_name'),
    ])

    if (meetingsRes.data) {
      // Get participant counts
      const meetingIds = meetingsRes.data.map(m => m.id)
      const { data: participants } = await supabase
        .from('meeting_participants')
        .select('meeting_id')
        .in('meeting_id', meetingIds.length > 0 ? meetingIds : ['none'])

      const countMap: Record<string, number> = {}
      ;(participants || []).forEach(p => {
        countMap[p.meeting_id] = (countMap[p.meeting_id] || 0) + 1
      })

      setMeetings(meetingsRes.data.map(m => ({
        ...m,
        participant_count: countMap[m.id] || 0,
      })))
    }

    if (profilesRes.data) setProfiles(profilesRes.data)
    setLoading(false)
  }

  useEffect(() => { loadMeetings() }, [])

  const filtered = meetings.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.title.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || m.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleCreateMeeting = async () => {
    if (!form.title || !form.scheduled_at) {
      setToast({ type: 'error', message: 'Title and date/time are required' })
      return
    }
    if (!currentUserId) return

    setActionLoading(true)

    try {
      // Use API route to create meeting with Google Meet support
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          meeting_type: form.meeting_type,
          meeting_link: form.meeting_link || null,
          scheduled_at: new Date(form.scheduled_at).toISOString(),
          duration_minutes: form.duration_minutes,
          participant_ids: form.participant_ids,
          create_google_meet: form.create_google_meet && googleConnected,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.needsGoogleAuth) {
          setToast({ type: 'error', message: 'Please connect your Google account first' })
        } else {
          setToast({ type: 'error', message: result.error || 'Failed to create meeting' })
        }
        setActionLoading(false)
        return
      }

      const meetingTitle = result.data?.title || form.title
      const googleMeetCreated = result.googleMeetCreated

      setToast({ 
        type: 'success', 
        message: `Meeting "${meetingTitle}" created${googleMeetCreated ? ' with Google Meet' : ''}` 
      })
      setShowCreateModal(false)
      setForm({
        title: '', description: '', meeting_type: 'general',
        meeting_link: '', scheduled_at: '', duration_minutes: 30, 
        participant_ids: [], create_google_meet: true,
      })
      await loadMeetings()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to create meeting' })
    }
    setActionLoading(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('meetings').update({ status }).eq('id', id)
    if (error) {
      setToast({ type: 'error', message: error.message })
    } else {
      setToast({ type: 'success', message: `Meeting marked as ${status}` })
      await loadMeetings()
    }
  }

  const handleDeleteMeeting = async (id: string) => {
    setActionLoading(true)
    const supabase = createClient()
    // Delete participants first, then meeting
    await supabase.from('meeting_participants').delete().eq('meeting_id', id)
    const { error } = await supabase.from('meetings').delete().eq('id', id)
    if (error) {
      setToast({ type: 'error', message: error.message })
    } else {
      setToast({ type: 'success', message: 'Meeting deleted' })
      setShowDeleteConfirm(null)
      await loadMeetings()
    }
    setActionLoading(false)
  }

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleParticipant = (id: string) => {
    setForm(f => ({
      ...f,
      participant_ids: f.participant_ids.includes(id)
        ? f.participant_ids.filter(p => p !== id)
        : [...f.participant_ids, id],
    }))
  }

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  }

  const upcomingCount = meetings.filter(m => m.status === 'scheduled').length
  const completedCount = meetings.filter(m => m.status === 'completed').length
  const cancelledCount = meetings.filter(m => m.status === 'cancelled').length

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      <PageHeader
        title="Meetings"
        description="Schedule and manage Google Meet sessions with participants"
        action={
          <div className="flex items-center gap-2">
            <button onClick={loadMeetings} className="p-2.5 rounded-lg border border-border hover:bg-off-white transition-colors" title="Refresh">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            {!googleConnected && !checkingGoogle && (
              <a
                href="/api/auth/google"
                onClick={(e) => { e.preventDefault(); window.location.href = `/api/auth/google?origin=${encodeURIComponent(window.location.origin)}`; }}
                className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connect Google Meet
              </a>
            )}
            <button
              onClick={() => {
                setShowCreateModal(true)
                setForm({ title: '', description: '', meeting_type: 'general', meeting_link: '', scheduled_at: '', duration_minutes: 30, participant_ids: [], create_google_meet: googleConnected })
              }}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              New Meeting
            </button>
          </div>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', count: meetings.length, onClick: () => setFilterStatus('all') },
          { label: 'Upcoming', count: upcomingCount, onClick: () => setFilterStatus('scheduled') },
          { label: 'Completed', count: completedCount, onClick: () => setFilterStatus('completed') },
          { label: 'Cancelled', count: cancelledCount, onClick: () => setFilterStatus('cancelled') },
        ].map(s => (
          <button
            key={s.label}
            onClick={s.onClick}
            className={`p-3 rounded-xl border text-center transition-all ${
              (filterStatus === 'all' && s.label === 'Total') ||
              filterStatus === s.label.toLowerCase()
                ? 'bg-primary text-white border-primary'
                : 'bg-white border-border hover:border-[#35C8E0]'
            }`}
          >
            <div className={`text-xl font-bold ${
              (filterStatus === 'all' && s.label === 'Total') || filterStatus === s.label.toLowerCase()
                ? 'text-white' : 'text-primary'
            }`}>{s.count}</div>
            <div className={`text-xs font-medium ${
              (filterStatus === 'all' && s.label === 'Total') || filterStatus === s.label.toLowerCase()
                ? 'text-white/80' : 'text-foreground/50'
            }`}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-[#35C8E0]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-foreground/40" />
          {['all', 'scheduled', 'in_progress', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                filterStatus === status ? 'bg-primary text-white' : 'bg-off-white text-foreground/60 hover:text-primary'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-border">
            <Loader2 size={24} className="animate-spin text-[#1A9AB5]" />
            <span className="ml-2 text-sm text-foreground/50">Loading meetings...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-foreground/50 text-sm bg-white rounded-xl border border-border">
            {meetings.length === 0 ? 'No meetings yet. Create your first meeting above.' : 'No meetings match the current filters.'}
          </div>
        ) : (
          filtered.map(m => (
            <div key={m.id} className="bg-white border border-border rounded-xl p-5 hover:border-[#35C8E0]/30 transition-all">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#35C8E0]/20 flex items-center justify-center flex-shrink-0">
                      <Video size={18} className="text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-primary truncate">{m.title}</h3>
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${statusColors[m.status] || 'bg-gray-100 text-gray-600'}`}>
                          {m.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-medium bg-[#35C8E0]/10 text-primary px-2 py-0.5 rounded-md capitalize">
                          {m.meeting_type}
                        </span>
                      </div>
                      {m.description && (
                        <p className="text-xs text-foreground/50 mt-1 line-clamp-1">{m.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-foreground/50">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(m.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {formatTime(m.scheduled_at)} &middot; {m.duration_minutes}min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {m.participant_count} participant{m.participant_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {m.organizer && (
                        <p className="text-[10px] text-foreground/40 mt-1">Organized by {m.organizer.full_name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  {m.meeting_link && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyLink(m.meeting_link!, m.id)}
                        className="p-2 rounded-lg border border-border hover:bg-off-white transition-colors text-foreground/50 hover:text-primary"
                        title="Copy link"
                      >
                        {copiedId === m.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                      <a
                        href={m.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                        title="Open Meet"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {m.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(m.id, 'in_progress')}
                          className="p-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                          title="Start"
                        >
                          <Video size={14} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(m.id, 'cancelled')}
                          className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          title="Cancel"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                    {m.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(m.id, 'completed')}
                        className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Mark Complete"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(m.id)}
                      className="p-2 rounded-lg border border-border text-foreground/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Create Meeting Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-heading font-bold text-primary">New Meeting</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" placeholder="Meeting title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] resize-none" placeholder="Optional description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Type</label>
                  <select value={form.meeting_type} onChange={e => setForm({ ...form, meeting_type: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] bg-white">
                    <option value="general">General</option>
                    <option value="mentoring">Mentoring</option>
                    <option value="interview">Interview</option>
                    <option value="review">Review</option>
                    <option value="standup">Standup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Duration (minutes)</label>
                  <input type="number" min={5} max={480} value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Scheduled Date & Time *</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" />
              </div>
              
              {/* Google Meet Integration */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Video size={18} className="text-[#35C8E0]" />
                    <span className="font-medium text-sm">Google Meet</span>
                  </div>
                  {googleConnected ? (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <Check size={12} /> Connected
                    </span>
                  ) : (
                    <a
                      href="/api/auth/google"
                      onClick={(e) => { e.preventDefault(); window.location.href = `/api/auth/google?origin=${encodeURIComponent(window.location.origin)}`; }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Connect Account
                    </a>
                  )}
                </div>
                
                {googleConnected && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.create_google_meet}
                      onChange={e => setForm({ ...form, create_google_meet: e.target.checked, meeting_link: e.target.checked ? '' : form.meeting_link })}
                      className="w-4 h-4 text-[#35C8E0] border-gray-300 rounded focus:ring-[#35C8E0]"
                    />
                    <span className="text-sm text-foreground/70">
                      Auto-generate Google Meet link
                    </span>
                  </label>
                )}
                
                {(!googleConnected || !form.create_google_meet) && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-foreground/60 mb-1">
                      {googleConnected ? 'Or enter a custom meeting link:' : 'Enter meeting link manually:'}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={form.meeting_link} 
                        onChange={e => setForm({ ...form, meeting_link: e.target.value })} 
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0] font-mono text-xs" 
                      />
                      <button
                        onClick={() => setForm({ ...form, meeting_link: generateMeetLink() })}
                        className="px-3 py-2 rounded-lg border border-border hover:bg-white text-foreground/60 hover:text-primary transition-colors text-sm"
                        title="Generate placeholder link"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-foreground/50 mt-1">
                      Note: Placeholder links won&apos;t create actual meetings
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">
                  Participants ({form.participant_ids.length} selected)
                </label>
                <div className="border border-border rounded-lg max-h-40 overflow-y-auto">
                  {profiles.filter(p => p.id !== currentUserId).map(p => (
                    <button
                      key={p.id}
                      onClick={() => toggleParticipant(p.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-off-white transition-colors text-sm border-b border-border/50 last:border-0 ${
                        form.participant_ids.includes(p.id) ? 'bg-[#35C8E0]/10' : ''
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                        form.participant_ids.includes(p.id) ? 'bg-primary border-primary' : 'border-border'
                      }`}>
                        {form.participant_ids.includes(p.id) && <Check size={12} className="text-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-primary truncate text-xs">{p.full_name}</p>
                        <p className="text-[10px] text-foreground/40">{p.email} &middot; {p.role}</p>
                      </div>
                    </button>
                  ))}
                  {profiles.filter(p => p.id !== currentUserId).length === 0 && (
                    <p className="px-4 py-3 text-xs text-foreground/40">No other users to invite</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
              <button
                onClick={handleCreateMeeting}
                disabled={actionLoading}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Create Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ─── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-xl">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-heading font-bold text-primary mb-2">Delete Meeting?</h3>
              <p className="text-sm text-foreground/60">This will permanently remove this meeting and all participant records.</p>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
              <button
                onClick={() => handleDeleteMeeting(showDeleteConfirm)}
                disabled={actionLoading}
                className="flex-1 bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
