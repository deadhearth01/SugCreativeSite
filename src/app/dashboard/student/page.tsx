'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, FileText, Video, Calendar, Award, ArrowUpRight, Clock, Loader2 } from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type EnrolledCourse = { id: string; progress: number; status: string; courses: { title: string; total_lessons?: number } | null }
type UpcomingMeeting = { id: string; title: string; scheduled_at: string; meet_link: string | null; status: string; organizer: { full_name: string } | null }

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([])
  const [certCount, setCertCount] = useState(0)
  const [hoursStudied, setHoursStudied] = useState(0)
  const [userName, setUserName] = useState('Student')

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('full_name, hours_studied').eq('id', user.id).single()
      if (profile) { setUserName(profile.full_name || 'Student'); setHoursStudied(profile.hours_studied || 0) }
      const { data: enrollments } = await supabase.from('enrollments').select('id, progress, status, courses(title, total_lessons)').eq('student_id', user.id).eq('status', 'active').limit(5)
      setEnrolledCourses((enrollments as unknown as EnrolledCourse[]) || [])
      const now = new Date().toISOString()
      const { data: meetingsData } = await supabase.from('meetings').select('id, title, scheduled_at, meet_link, status, organizer:organizer_id(full_name)').gte('scheduled_at', now).order('scheduled_at').limit(5)
      if (meetingsData) {
        const meetingIds = meetingsData.map((m: { id: string }) => m.id)
        const { data: participantRows } = await supabase.from('meeting_participants').select('meeting_id').eq('user_id', user.id).in('meeting_id', meetingIds)
        const participantSet = new Set((participantRows || []).map((p: { meeting_id: string }) => p.meeting_id))
        setUpcomingMeetings((meetingsData as unknown as UpcomingMeeting[]).filter(m => participantSet.has(m.id)))
      }
      const { count } = await supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('student_id', user.id)
      setCertCount(count || 0)
      setLoading(false)
    }
    fetchData()
  }, [])

  const completedCount = enrolledCourses.filter(e => e.status === 'completed').length

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#35C8E0]" /></div>

  return (
    <div className="space-y-6">
      <div className="bg-[#1A9AB5] border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-6">
        <div className="inline-flex items-center gap-2 bg-[#35C8E0] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] mb-3">Student Portal</div>
        <h2 className="text-xl font-black text-white">Welcome back, {userName}!</h2>
        <p className="text-white/60 text-sm font-semibold mt-1">
          {enrolledCourses.length > 0 ? `${enrolledCourses.filter(e => e.status !== 'completed').length} course(s) in progress. Keep learning!` : 'Enroll in a course to get started.'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enrolled Courses', value: String(enrolledCourses.length), icon: GraduationCap, color: 'bg-[#35C8E0]' },
          { label: 'Completed', value: String(completedCount), icon: Award, color: 'bg-emerald-600' },
          { label: 'Upcoming Meetings', value: String(upcomingMeetings.length), icon: Video, color: 'bg-purple-600' },
          { label: 'Hours Studied', value: String(hoursStudied), icon: Clock, color: 'bg-amber-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 ${card.color} border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)]`}><card.icon size={16} className="text-white" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50 leading-tight">{card.label}</span>
            </div>
            <div className="text-2xl font-black text-[#1A9AB5]">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Courses', href: '/dashboard/student/courses', icon: GraduationCap },
          { label: 'Resume Builder', href: '/dashboard/student/resume', icon: FileText },
          { label: 'Book Meeting', href: '/dashboard/student/meetings', icon: Video },
          { label: 'Calendar', href: '/dashboard/student/calendar', icon: Calendar },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] p-4 flex items-center gap-3 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
            <div className="w-8 h-8 bg-[#1A9AB5] border border-black flex items-center justify-center flex-shrink-0"><a.icon size={15} className="text-white" /></div>
            <span className="text-xs font-black uppercase tracking-wide text-[#1A9AB5]">{a.label}</span>
            <ArrowUpRight size={13} className="ml-auto text-foreground/30 group-hover:text-[#35C8E0] transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-[#1A9AB5]">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">My Courses</h3>
            <Link href="/dashboard/student/courses" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1">View All <ArrowUpRight size={12} /></Link>
          </div>
          {enrolledCourses.length === 0 ? <p className="text-sm text-foreground/40 py-8 text-center font-semibold">No enrolled courses yet</p> : (
            <div className="divide-y divide-black/8">
              {enrolledCourses.map((e, i) => (
                <div key={i} className="p-4 hover:bg-[#F4F6FA] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-[#1A9AB5] truncate max-w-48">{e.courses?.title || '—'}</p>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#F4F6FA] border border-black/10">
                      <div className="h-full bg-[#35C8E0] transition-all" style={{ width: `${e.progress ?? 0}%` }} />
                    </div>
                    <span className="text-xs font-black text-[#35C8E0]">{e.progress ?? 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-[#1A9AB5]">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Upcoming Meetings</h3>
            <Link href="/dashboard/student/meetings" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1">View All <ArrowUpRight size={12} /></Link>
          </div>
          {upcomingMeetings.length === 0 ? <p className="text-sm text-foreground/40 py-8 text-center font-semibold">No upcoming meetings</p> : (
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F4F6FA] border-b-2 border-black">{['Session', 'Mentor', 'Date & Time', 'Status'].map(h => <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest">{h}</th>)}</tr></thead>
              <tbody>{upcomingMeetings.map((m, i) => (
                <tr key={i} className="border-b border-black/8 hover:bg-[#F4F6FA]">
                  <td className="py-3 px-4 font-bold text-[#1A9AB5] text-xs">{m.title}</td>
                  <td className="py-3 px-4 text-xs text-foreground/60">{(m.organizer as { full_name: string } | null)?.full_name || '—'}</td>
                  <td className="py-3 px-4 text-xs text-foreground/50">{new Date(m.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="py-3 px-4"><StatusBadge status={m.status || 'Scheduled'} /></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
