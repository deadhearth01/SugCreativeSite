'use client'

import { useEffect, useState } from 'react'
import { PageHeader, StatCard } from '@/components/dashboard/DashboardUI'
import { Video, VideoOff, Calendar, Clock, ExternalLink, Copy, Check, Users, Star, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Session = {
  id: string
  session_type: string | null
  duration_minutes: number | null
  amount: number | null
  status: string
  rating: number | null
  feedback: string | null
  created_at: string
  student: { full_name: string; email: string } | null
  meeting: { title: string; scheduled_at: string; meeting_link: string | null } | null
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  )
}

export default function MentorSessionsPage() {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('mentor_sessions')
        .select('id, session_type, duration_minutes, amount, status, rating, feedback, created_at, student:student_id(full_name, email), meeting:meeting_id(title, scheduled_at, meeting_link)')
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setSessions(data as Session[])
      setLoading(false)
    }
    load()
  }, [])

  const scheduled = sessions.filter(s => s.status === 'scheduled' || s.status === 'Scheduled').length
  const completed = sessions.filter(s => s.status === 'completed' || s.status === 'Completed').length

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div>
      <PageHeader title="Sessions" description="Your mentoring sessions with students" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Sessions" value={sessions.length} icon={Users} color="navy" />
        <StatCard label="Upcoming" value={scheduled} icon={Video} color="teal" />
        <StatCard label="Completed" value={completed} icon={Check} color="mint" />
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-foreground/50 text-sm">No sessions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => {
            const isUpcoming = s.status === 'scheduled' || s.status === 'Scheduled'
            const meetLink = s.meeting?.meeting_link
            return (
              <div key={s.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${isUpcoming ? 'bg-primary-bright/10 text-primary-bright' : 'bg-gray-100 text-gray-400'}`}>
                      {isUpcoming ? <Video size={20} /> : <VideoOff size={20} />}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-primary">{s.session_type || s.meeting?.title || 'Session'}</h3>
                      <p className="text-sm text-foreground/50">with {s.student?.full_name || '—'}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground/50">
                        {s.meeting?.scheduled_at && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(s.meeting.scheduled_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        {s.duration_minutes && (
                          <span className="flex items-center gap-1"><Clock size={12} /> {s.duration_minutes} min</span>
                        )}
                        {s.amount != null && (
                          <span className="font-semibold text-primary">₹{s.amount.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      {s.rating != null && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <StarRating rating={s.rating} />
                          <span className="text-xs text-foreground/50">{s.rating}/5</span>
                        </div>
                      )}
                      {s.feedback && (
                        <p className="text-xs text-foreground/60 mt-1 italic max-w-sm truncate">{s.feedback}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wide rounded-md ${isUpcoming ? 'bg-primary-bright/10 text-primary-bright' : 'bg-green-100 text-green-700'}`}>
                      {s.status}
                    </span>
                    {meetLink && isUpcoming && (
                      <>
                        <button
                          onClick={() => copyLink(meetLink, s.id)}
                          className="p-2 rounded-lg border border-border hover:bg-off-white text-foreground/50 hover:text-primary transition-colors"
                          title="Copy Meet link"
                        >
                          {copied === s.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                        <a
                          href={meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors"
                        >
                          <ExternalLink size={14} /> Start
                        </a>
                      </>
                    )}
                  </div>
                </div>
                {meetLink && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-foreground/40 font-mono truncate">{meetLink}</p>
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
