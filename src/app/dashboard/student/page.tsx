'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, FileText, Video, Calendar, Award, ArrowUpRight, Clock, Loader2 } from 'lucide-react'
import { StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type EnrolledCourse = {
  id: string
  progress: number
  status: string
  courses: { title: string; total_lessons?: number } | null
}

type UpcomingMeeting = {
  id: string
  title: string
  scheduled_at: string
  meet_link: string | null
  status: string
  organizer: { full_name: string } | null
}

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

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, hours_studied')
        .eq('id', user.id)
        .single()
      if (profile) {
        setUserName(profile.full_name || 'Student')
        setHoursStudied(profile.hours_studied || 0)
      }

      // Fetch enrolled courses
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id, progress, status, courses(title, total_lessons)')
        .eq('student_id', user.id)
        .eq('status', 'active')
        .limit(5)
      setEnrolledCourses((enrollments as EnrolledCourse[]) || [])

      // Fetch upcoming meetings
      const now = new Date().toISOString()
      const { data: meetingsData } = await supabase
        .from('meetings')
        .select('id, title, scheduled_at, meet_link, status, organizer:organizer_id(full_name)')
        .gte('scheduled_at', now)
        .order('scheduled_at')
        .limit(5)

      if (meetingsData) {
        // Filter to meetings where student is a participant
        const meetingIds = meetingsData.map((m: { id: string }) => m.id)
        const { data: participantRows } = await supabase
          .from('meeting_participants')
          .select('meeting_id')
          .eq('user_id', user.id)
          .in('meeting_id', meetingIds)
        const participantSet = new Set((participantRows || []).map((p: { meeting_id: string }) => p.meeting_id))
        setUpcomingMeetings((meetingsData as UpcomingMeeting[]).filter((m) => participantSet.has(m.id)))
      }

      // Fetch certificate count
      const { count } = await supabase
        .from('certificates')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', user.id)
      setCertCount(count || 0)

      setLoading(false)
    }
    fetchData()
  }, [])

  const completedCount = enrolledCourses.filter((e) => e.status === 'completed').length

  const courseRows = enrolledCourses.map((e) => [
    <span key="title" className="font-medium text-primary">{e.courses?.title || '—'}</span>,
    <span key="prog">{e.progress ?? 0}%</span>,
    <StatusBadge key="status" status={e.status} />,
    <span key="rem" className="text-foreground/50 text-xs">
      {e.progress === 100 ? 'Certificate ready' : `${Math.max(0, (e.courses?.total_lessons || 0) - Math.round(((e.progress || 0) / 100) * (e.courses?.total_lessons || 0)))} lessons left`}
    </span>,
  ])

  const meetingRows = upcomingMeetings.map((m) => [
    <span key="title" className="font-medium text-primary">{m.title}</span>,
    <span key="org" className="text-foreground/60">{(m.organizer as { full_name: string } | null)?.full_name || '—'}</span>,
    <span key="date" className="text-foreground/60 text-xs">{new Date(m.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>,
    <StatusBadge key="status" status={m.status || 'Scheduled'} />,
  ])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-primary-bright" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-navy to-teal p-6 rounded-xl text-white">
        <h2 className="text-xl font-heading font-bold">Welcome back, {userName}!</h2>
        <p className="text-white/70 text-sm mt-1">
          Continue your learning journey.
          {enrolledCourses.length > 0
            ? ` You have ${enrolledCourses.filter((e) => e.status !== 'completed').length} course(s) in progress.`
            : ' Enroll in a course to get started.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Enrolled Courses" value={enrolledCourses.length} icon={GraduationCap} color="navy" />
        <StatCard label="Completed" value={completedCount} change={enrolledCourses.length > 0 ? `${Math.round((completedCount / enrolledCourses.length) * 100)}% completion rate` : undefined} icon={Award} color="teal" />
        <StatCard label="Upcoming Meetings" value={upcomingMeetings.length} icon={Video} color="sky" />
        <StatCard label="Hours Studied" value={hoursStudied} icon={Clock} color="mint" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Courses', href: '/dashboard/student/courses', icon: GraduationCap },
          { label: 'Resume Builder', href: '/dashboard/student/resume', icon: FileText },
          { label: 'Book Meeting', href: '/dashboard/student/meetings', icon: Video },
          { label: 'Calendar', href: '/dashboard/student/calendar', icon: Calendar },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-bright hover:shadow-sm transition-all group"
          >
            <a.icon size={18} className="text-primary-bright" />
            <span className="text-sm font-medium text-primary">{a.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-foreground/30 group-hover:text-primary-bright transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel
          title="My Courses"
          action={<Link href="/dashboard/student/courses" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}
        >
          {courseRows.length > 0 ? (
            <DashboardTable
              headers={['Course', 'Progress', 'Status', 'Remaining']}
              rows={courseRows}
            />
          ) : (
            <p className="text-sm text-foreground/40 py-8 text-center">No enrolled courses yet</p>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Upcoming Meetings"
          action={<Link href="/dashboard/student/meetings" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}
        >
          {meetingRows.length > 0 ? (
            <DashboardTable
              headers={['Session', 'Mentor', 'Date & Time', 'Status']}
              rows={meetingRows}
            />
          ) : (
            <p className="text-sm text-foreground/40 py-8 text-center">No upcoming meetings</p>
          )}
        </DashboardPanel>
      </div>
    </div>
  )
}
