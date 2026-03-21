'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, LifeBuoy, Calendar, Clock, ArrowUpRight, BookOpen, Megaphone, Loader2 } from 'lucide-react'
import { StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Task = {
  id: string
  title: string
  priority: string
  status: string
  due_date: string | null
  created_at: string
}

type Announcement = {
  id: string
  title: string
  created_at: string
  author: { full_name: string } | null
}

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Employee')
  const [pendingTasksCount, setPendingTasksCount] = useState(0)
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null)
  const [openTicketsCount, setOpenTicketsCount] = useState(0)
  const [enrolledCoursesCount, setEnrolledCoursesCount] = useState(0)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (profile) setUserName(profile.full_name || 'Employee')

      // Tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, priority, status, due_date, created_at')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      const allTasks = (tasks as unknown as Task[]) || []
      setRecentTasks(allTasks)
      setPendingTasksCount(allTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length)

      // Today's attendance
      const today = new Date().toISOString().split('T')[0]
      const { data: attendance } = await supabase
        .from('attendance')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()
      setAttendanceStatus(attendance?.status || null)

      // Open tickets
      const { count: ticketCount } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .in('status', ['open', 'in_progress'])
      setOpenTicketsCount(ticketCount || 0)

      // Enrolled courses
      const { count: courseCount } = await supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', user.id)
      setEnrolledCoursesCount(courseCount || 0)

      // Announcements
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('id, title, created_at, author:created_by(full_name)')
        .or('target_roles.cs.{employee},target_roles.cs.{all}')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(4)
      setAnnouncements((announcementsData as unknown as Announcement[]) || [])

      setLoading(false)
    }
    fetchData()
  }, [])

  const priorityStyles: Record<string, string> = {
    urgent: 'text-red-600 font-semibold',
    high: 'text-orange-500 font-semibold',
    medium: 'text-yellow-600 font-semibold',
    low: 'text-foreground/50',
  }

  const taskRows = recentTasks.map((t) => [
    <span key="t" className="font-medium text-primary text-sm">{t.title}</span>,
    <span key="p" className={`text-xs ${priorityStyles[t.priority?.toLowerCase()] || 'text-foreground/50'}`}>{t.priority}</span>,
    <StatusBadge key="s" status={t.status} />,
    <span key="d" className="text-foreground/50 text-xs">{t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>,
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
      <div className="bg-gradient-to-r from-navy to-teal p-6 rounded-xl text-white">
        <h2 className="text-xl font-heading font-bold">Welcome back, {userName}!</h2>
        <p className="text-white/70 text-sm mt-1">
          {pendingTasksCount > 0
            ? `You have ${pendingTasksCount} task${pendingTasksCount === 1 ? '' : 's'} pending.`
            : 'All tasks are up to date.'}
          {attendanceStatus === null ? ' Remember to check in today.' : ` Today's attendance: ${attendanceStatus}.`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Tasks" value={pendingTasksCount} icon={ClipboardList} color="navy" />
        <StatCard label="Open Tickets" value={openTicketsCount} icon={LifeBuoy} color="teal" />
        <StatCard label="Today" value={attendanceStatus ? attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1) : 'Not checked in'} icon={Clock} color="mint" />
        <StatCard label="Enrolled Courses" value={enrolledCoursesCount} icon={BookOpen} color="sky" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Tasks', href: '/dashboard/employee/tasks', icon: ClipboardList },
          { label: 'Tickets', href: '/dashboard/employee/tickets', icon: LifeBuoy },
          { label: 'Calendar', href: '/dashboard/employee/calendar', icon: Calendar },
          { label: 'Attendance', href: '/dashboard/employee/attendance', icon: Clock },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-bright hover:shadow-sm transition-all group">
            <a.icon size={18} className="text-primary-bright" />
            <span className="text-sm font-medium text-primary">{a.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-foreground/30 group-hover:text-primary-bright transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="My Tasks" action={<Link href="/dashboard/employee/tasks" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          {taskRows.length > 0 ? (
            <DashboardTable headers={['Task', 'Priority', 'Status', 'Due']} rows={taskRows} />
          ) : (
            <p className="text-sm text-foreground/40 py-8 text-center">No tasks assigned</p>
          )}
        </DashboardPanel>

        <DashboardPanel title="Announcements" action={<Link href="/dashboard/employee/announcements" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          {announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 border border-border/50 hover:bg-off-white/50 transition-colors">
                  <Megaphone size={16} className="text-primary-bright flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary">{a.title}</p>
                    <p className="text-xs text-foreground/50">
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/40 py-8 text-center">No announcements</p>
          )}
        </DashboardPanel>
      </div>
    </div>
  )
}
