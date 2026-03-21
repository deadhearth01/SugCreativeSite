'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Video, X, Calendar, Clock, ExternalLink, Copy, Check, VideoOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Meeting = {
  id: string
  title: string
  description: string | null
  scheduled_at: string
  duration_minutes: number | null
  meeting_link: string | null
  status: string
  organizer: { full_name: string } | null
}

type Tab = 'upcoming' | 'past' | 'all'

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function ClientMeetingsPage() {
  const [loading, setLoading] = useState(true)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tab, setTab] = useState<Tab>('upcoming')
  const [copied, setCopied] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const loadMeetings = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get meetings where user is a participant
    const { data: participations } = await supabase
      .from('meeting_participants')
      .select('meeting_id')
      .eq('user_id', user.id)

    if (!participations || participations.length === 0) {
      setLoading(false)
      return
    }

    const meetingIds = participations.map(p => p.meeting_id)

    const { data } = await supabase
      .from('meetings')
      .select('id, title, description, scheduled_at, duration_minutes, meeting_link, status, organizer:organizer_id(full_name)')
      .in('id', meetingIds)
      .order('scheduled_at', { ascending: true })

    if (data) setMeetings(data as unknown as Meeting[])
    setLoading(false)
  }, [])

  useEffect(() => { loadMeetings() }, [loadMeetings])

  const now = new Date()
  const filtered = meetings.filter(m => {
    const d = new Date(m.scheduled_at)
    if (tab === 'upcoming') return d >= now
    if (tab === 'past') return d < now
    return true
  })

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
    setToast({ message: 'Link copied!', type: 'success' })
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div>
      <PageHeader title="Meetings" description="View your scheduled sessions and meetings" />

      <div className="flex gap-2 mb-6">
        {(['upcoming', 'past', 'all'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/60 hover:border-primary-bright hover:text-primary'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-foreground/50 text-sm">No {tab !== 'all' ? tab : ''} meetings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((m) => {
            const scheduledDate = new Date(m.scheduled_at)
            const isPast = scheduledDate < now
            const isScheduled = m.status === 'scheduled' || m.status === 'Scheduled'
            return (
              <div key={m.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${!isPast ? 'bg-primary-bright/10 text-primary-bright' : 'bg-gray-100 text-gray-400'}`}>
                      {!isPast ? <Video size={20} /> : <VideoOff size={20} />}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-primary">{m.title}</h3>
                      {m.organizer && <p className="text-sm text-foreground/50">with {m.organizer.full_name}</p>}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground/50">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {scheduledDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          {m.duration_minutes && ` · ${m.duration_minutes} min`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <StatusBadge status={m.status} />
                    {m.meeting_link && !isPast && (
                      <>
                        <button
                          onClick={() => copyLink(m.meeting_link!, m.id)}
                          className="p-2 rounded-lg border border-border hover:bg-off-white text-foreground/50 hover:text-primary transition-colors"
                          title="Copy Meet link"
                        >
                          {copied === m.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                        <a
                          href={m.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors"
                        >
                          <ExternalLink size={14} /> Join
                        </a>
                      </>
                    )}
                  </div>
                </div>
                {m.meeting_link && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-foreground/40 font-mono truncate">{m.meeting_link}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
