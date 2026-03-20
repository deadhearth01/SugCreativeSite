'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, FileText, Calendar, BookOpen, Clock, ArrowUpRight, Loader2 } from 'lucide-react'
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

type LearningMaterial = {
  id: string
  title: string
  material_type: string | null
}

type LearningProgress = {
  material_id: string
  completed_at: string | null
}

export default function InternDashboard() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Intern')
  const [pendingTasksCount, setPendingTasksCount] = useState(0)
  const [reportsCount, setReportsCount] = useState(0)
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [progress, setProgress] = useState<LearningProgress[]>([])

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
      if (profile) setUserName(profile.full_name || 'Intern')

      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

      const [tasksRes, reportsRes, attendanceRes, materialsRes, progressRes] = await Promise.all([
        supabase
          .from('tasks')
          .select('id, title, priority, status, due_date, created_at')
          .eq('assigned_to', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('submitted_by', user.id),
        supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('date', firstOfMonth),
        supabase
          .from('learning_materials')
          .select('id, title, material_type')
          .limit(3),
        supabase
          .from('learning_progress')
          .select('material_id, completed_at')
          .eq('user_id', user.id),
      ])

      const allTasks = (tasksRes.data as Task[]) || []
      setRecentTasks(allTasks)
      setPendingTasksCount(allTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length)
      setReportsCount(reportsRes.count || 0)
      setAttendanceCount(attendanceRes.count || 0)
      setMaterials((materialsRes.data as LearningMaterial[]) || [])
      setProgress((progressRes.data as LearningProgress[]) || [])

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

  const completedMaterialIds = new Set(progress.map((p) => p.material_id))

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
          {' '}Keep up the great work!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Tasks" value={pendingTasksCount} icon={ClipboardList} color="navy" />
        <StatCard label="Reports Submitted" value={reportsCount} icon={FileText} color="teal" />
        <StatCard label="Days Attended (Month)" value={attendanceCount} icon={Clock} color="mint" />
        <StatCard label="Learning Materials" value={materials.length} icon={BookOpen} color="sky" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Tasks', href: '/dashboard/intern/tasks', icon: ClipboardList },
          { label: 'Reports', href: '/dashboard/intern/reports', icon: FileText },
          { label: 'Calendar', href: '/dashboard/intern/calendar', icon: Calendar },
          { label: 'Learning', href: '/dashboard/intern/learning', icon: BookOpen },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-bright hover:shadow-sm transition-all group">
            <a.icon size={18} className="text-primary-bright" />
            <span className="text-sm font-medium text-primary">{a.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-foreground/30 group-hover:text-primary-bright transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="My Tasks" action={<Link href="/dashboard/intern/tasks" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          {taskRows.length > 0 ? (
            <DashboardTable headers={['Task', 'Priority', 'Status', 'Due']} rows={taskRows} />
          ) : (
            <p className="text-sm text-foreground/40 py-8 text-center">No tasks assigned</p>
          )}
        </DashboardPanel>

        <DashboardPanel title="Learning Progress" action={<Link href="/dashboard/intern/learning" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          {materials.length > 0 ? (
            <div className="space-y-4">
              {materials.map((m) => {
                const isCompleted = completedMaterialIds.has(m.id)
                const progressPct = isCompleted ? 100 : 0
                return (
                  <div key={m.id} className="p-3 border border-border/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-primary">{m.title}</p>
                      {m.material_type && (
                        <span className="text-xs text-foreground/40">{m.material_type}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-off-white rounded-full">
                        <div className="h-full bg-primary-bright rounded-full" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-primary">{progressPct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-foreground/40 py-8 text-center">No learning materials</p>
          )}
        </DashboardPanel>
      </div>
    </div>
  )
}
