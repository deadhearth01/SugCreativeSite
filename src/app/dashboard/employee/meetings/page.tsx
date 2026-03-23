'use client'

import { useState, useEffect } from 'react'
import { Video, Calendar, Clock, ExternalLink, Users, Loader2 } from 'lucide-react'
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
  organizer: { full_name: string } | null
  meeting_participants: { user_id: string; status: string }[]
}

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function EmployeeMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'all' | 'past'>('upcoming')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get meetings where employee is a participant or organizer
      const { data } = await supabase
        .from('meetings')
        .select(`
          *,
          organizer:organizer_id(full_name),
          meeting_participants(user_id, status)
        `)
        .order('scheduled_at', { ascending: true })

      // Filter to meetings the user is involved in
      const userMeetings = (data || []).filter(m =>
        m.organizer_id === user.id ||
        (m.meeting_participants || []).some((p: { user_id: string }) => p.user_id === user.id)
      )

      setMeetings(userMeetings)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = meetings.filter(m => {
    const isPast = new Date(m.scheduled_at) < new Date()
    if (filter === 'upcoming') return !isPast && m.status !== 'cancelled'
    if (filter === 'past') return isPast || m.status === 'completed'
    return true
  })

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" description="View your scheduled meetings and standups" />

      <div className="flex gap-2">
        {(['upcoming', 'all', 'past'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/60 hover:border-[#35C8E0]'}`}>
            {f === 'upcoming' ? 'Upcoming' : f === 'past' ? 'Past' : 'All'}
          </button>
        ))}
      </div>

      <DashboardPanel title={`Meetings (${filtered.length})`}>
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Video size={32} className="text-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-foreground/40">No meetings found</p>
            <p className="text-xs text-foreground/30 mt-1">Admin will schedule meetings and invite you</p>
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
                        <Users size={13} /> Organized by {m.organizer?.full_name || 'Admin'}
                      </span>
                    </div>
                  </div>
                  {m.meeting_link && m.status !== 'cancelled' && (
                    <a href={m.meeting_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-bright text-white text-xs font-semibold rounded-lg hover:bg-primary-bright/90 transition-colors shrink-0">
                      <ExternalLink size={12} /> Join
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>
    </div>
  )
}
