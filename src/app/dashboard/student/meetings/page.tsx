'use client'

import { useEffect, useState } from 'react'
import { PageHeader, StatusBadge, StatCard } from '@/components/dashboard/DashboardUI'
import { Video, Calendar, Clock, ExternalLink, Copy, Check, VideoOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Meeting = {
  id: string
  title: string
  scheduled_at: string
  meet_link: string | null
  status: string
  organizer: { full_name: string } | null
  meeting_participants: { user_id: string; status: string }[]
}

type FilterTab = 'upcoming' | 'past' | 'all'

export default function StudentMeetingsPage() {
  const [loading, setLoading] = useState(true)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tab, setTab] = useState<FilterTab>('upcoming')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeetings = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: meetingsData } = await supabase
        .from('meetings')
        .select('id, title, scheduled_at, meet_link, status, organizer:organizer_id(full_name), meeting_participants(user_id, status)')
        .order('scheduled_at')

      if (meetingsData) {
        // Filter to only meetings where this user is a participant
        const userMeetings = (meetingsData as Meeting[]).filter((m) =>
          m.meeting_participants?.some((p) => p.user_id === user.id)
        )
        setMeetings(userMeetings)
      }
      setLoading(false)
    }
    fetchMeetings()
  }, [])

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const now = new Date()

  const filteredMeetings = meetings.filter((m) => {
    const meetDate = new Date(m.scheduled_at)
    if (tab === 'upcoming') return meetDate >= now
    if (tab === 'past') return meetDate < now
    return true
  })

  const upcomingCount = meetings.filter((m) => new Date(m.scheduled_at) >= now).length
  const pastCount = meetings.filter((m) => new Date(m.scheduled_at) < now).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-primary-bright" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Meetings"
        description="Your scheduled and past 1-on-1 sessions"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Meetings" value={meetings.length} icon={Calendar} color="navy" />
        <StatCard label="Upcoming" value={upcomingCount} change="Scheduled" icon={Video} color="teal" />
        <StatCard label="Completed" value={pastCount} icon={Check} color="mint" />
      </div>

      {/* Filter Tabs */}
      <div className="flex border border-border rounded-lg overflow-hidden mb-6 w-fit">
        {(['upcoming', 'past', 'all'] as FilterTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-primary text-white' : 'hover:bg-off-white text-foreground/60'}`}
          >
            {t === 'upcoming' ? `Upcoming (${upcomingCount})` : t === 'past' ? `Past (${pastCount})` : `All (${meetings.length})`}
          </button>
        ))}
      </div>

      {filteredMeetings.length === 0 ? (
        <p className="text-sm text-foreground/40 py-8 text-center">No {tab} meetings found</p>
      ) : (
        <div className="space-y-4">
          {filteredMeetings.map((m) => {
            const isUpcoming = new Date(m.scheduled_at) >= now
            const organizer = m.organizer as { full_name: string } | null
            return (
              <div key={m.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${isUpcoming ? 'bg-primary-bright/10 text-primary-bright' : 'bg-gray-100 text-gray-400'}`}>
                      {isUpcoming ? <Video size={20} /> : <VideoOff size={20} />}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-primary">{m.title}</h3>
                      {organizer && (
                        <p className="text-sm text-foreground/50">with {organizer.full_name}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground/50">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(m.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(m.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <StatusBadge status={m.status || (isUpcoming ? 'scheduled' : 'completed')} />
                    {m.meet_link && isUpcoming && (
                      <>
                        <button
                          onClick={() => copyLink(m.meet_link!, m.id)}
                          className="p-2 rounded-lg border border-border hover:bg-off-white text-foreground/50 hover:text-primary transition-colors"
                          title="Copy Meet link"
                        >
                          {copied === m.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                        <a
                          href={m.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors"
                        >
                          <ExternalLink size={14} /> Join Meet
                        </a>
                      </>
                    )}
                  </div>
                </div>
                {m.meet_link && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-foreground/40 font-mono">{m.meet_link}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
