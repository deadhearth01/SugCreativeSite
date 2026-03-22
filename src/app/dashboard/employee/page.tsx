'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, LifeBuoy, Calendar, Clock, ArrowUpRight, BookOpen, Megaphone, Loader2 } from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Task = { id: string; title: string; priority: string; status: string; due_date: string | null }
type Announcement = { id: string; title: string; created_at: string; author: { full_name: string } | null }

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
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (profile) setUserName(profile.full_name || 'Employee')
      const { data: tasks } = await supabase.from('tasks').select('id, title, priority, status, due_date').eq('assigned_to', user.id).order('created_at', { ascending: false }).limit(5)
      const allTasks = (tasks as unknown as Task[]) || []
      setRecentTasks(allTasks)
      setPendingTasksCount(allTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length)
      const today = new Date().toISOString().split('T')[0]
      const { data: attendance } = await supabase.from('attendance').select('id, status').eq('user_id', user.id).eq('date', today).maybeSingle()
      setAttendanceStatus(attendance?.status || null)
      const { count: ticketCount } = await supabase.from('tickets').select('id', { count: 'exact', head: true }).or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`).in('status', ['open', 'in_progress'])
      setOpenTicketsCount(ticketCount || 0)
      const { count: courseCount } = await supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('student_id', user.id)
      setEnrolledCoursesCount(courseCount || 0)
      const { data: announcementsData } = await supabase.from('announcements').select('id, title, created_at, author:created_by(full_name)').or('target_roles.cs.{employee},target_roles.cs.{all}').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(4)
      setAnnouncements((announcementsData as unknown as Announcement[]) || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#045184]" /></div>

  return (
    <div className="space-y-6">
      <div className="bg-[#022A4A] border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-6">
        <div className="inline-flex items-center gap-2 bg-[#045184] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] mb-3">Employee Portal</div>
        <h2 className="text-xl font-black text-white">Welcome back, {userName}!</h2>
        <p className="text-white/60 text-sm font-semibold mt-1">
          {pendingTasksCount > 0 ? `${pendingTasksCount} task${pendingTasksCount === 1 ? '' : 's'} pending.` : 'All tasks are up to date.'}
          {attendanceStatus === null ? ' Remember to check in today.' : ` Today: ${attendanceStatus}.`}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Tasks', value: String(pendingTasksCount), icon: ClipboardList, color: pendingTasksCount > 0 ? 'bg-amber-500' : 'bg-emerald-600' },
          { label: 'Open Tickets', value: String(openTicketsCount), icon: LifeBuoy, color: openTicketsCount > 0 ? 'bg-red-600' : 'bg-gray-500' },
          { label: "Today's Status", value: attendanceStatus ? attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1) : 'Not In', icon: Clock, color: attendanceStatus ? 'bg-emerald-600' : 'bg-amber-500' },
          { label: 'Enrolled Courses', value: String(enrolledCoursesCount), icon: BookOpen, color: 'bg-[#045184]' },
        ].map((card) => (
          <div key={card.label} className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 ${card.color} border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)]`}><card.icon size={16} className="text-white" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50 leading-tight">{card.label}</span>
            </div>
            <div className="text-2xl font-black text-[#022A4A]">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Tasks', href: '/dashboard/employee/tasks', icon: ClipboardList },
          { label: 'Tickets', href: '/dashboard/employee/tickets', icon: LifeBuoy },
          { label: 'Calendar', href: '/dashboard/employee/calendar', icon: Calendar },
          { label: 'Attendance', href: '/dashboard/employee/attendance', icon: Clock },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] p-4 flex items-center gap-3 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
            <div className="w-8 h-8 bg-[#022A4A] border border-black flex items-center justify-center flex-shrink-0"><a.icon size={15} className="text-white" /></div>
            <span className="text-xs font-black uppercase tracking-wide text-[#022A4A]">{a.label}</span>
            <ArrowUpRight size={13} className="ml-auto text-foreground/30 group-hover:text-[#045184] transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-[#022A4A]">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">My Tasks</h3>
            <Link href="/dashboard/employee/tasks" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1">View All <ArrowUpRight size={12} /></Link>
          </div>
          {recentTasks.length === 0 ? <p className="text-sm text-foreground/40 py-8 text-center font-semibold">No tasks assigned</p> : (
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F4F6FA] border-b-2 border-black">{['Task', 'Priority', 'Status', 'Due'].map(h => <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest">{h}</th>)}</tr></thead>
              <tbody>{recentTasks.map((t, i) => (
                <tr key={i} className="border-b border-black/8 hover:bg-[#F4F6FA]">
                  <td className="py-3 px-4 font-bold text-[#022A4A] text-xs">{t.title}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border-2 ${t.priority === 'urgent' ? 'bg-red-100 text-red-700 border-red-400' : t.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-400' : t.priority === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-400' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>{t.priority}</span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                  <td className="py-3 px-4 text-xs text-foreground/50">{t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>

        <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-[#022A4A]">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Announcements</h3>
            <Link href="/dashboard/employee/announcements" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1">View All <ArrowUpRight size={12} /></Link>
          </div>
          {announcements.length === 0 ? <p className="text-sm text-foreground/40 py-8 text-center font-semibold">No announcements</p> : (
            <div className="divide-y divide-black/8">
              {announcements.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-4 hover:bg-[#F4F6FA] transition-colors">
                  <div className="w-8 h-8 bg-[#045184] border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                    <Megaphone size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#022A4A]">{a.title}</p>
                    <p className="text-xs text-foreground/50 font-semibold mt-0.5">
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
