'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, FileText, Calendar, BookOpen, Clock, ArrowUpRight, Loader2, CheckCircle2 } from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Task = { id: string; title: string; priority: string; status: string; due_date: string | null; created_at: string }
type LearningMaterial = { id: string; title: string; material_type: string | null }
type LearningProgress = { material_id: string; completed_at: string | null }

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
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (profile) setUserName(profile.full_name || 'Intern')
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const [tasksRes, reportsRes, attendanceRes, materialsRes, progressRes] = await Promise.all([
        supabase.from('tasks').select('id, title, priority, status, due_date, created_at').eq('assigned_to', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('submitted_by', user.id),
        supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('date', firstOfMonth),
        supabase.from('learning_materials').select('id, title, material_type').limit(3),
        supabase.from('learning_progress').select('material_id, completed_at').eq('user_id', user.id),
      ])
      const allTasks = (tasksRes.data as unknown as Task[]) || []
      setRecentTasks(allTasks)
      setPendingTasksCount(allTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length)
      setReportsCount(reportsRes.count || 0)
      setAttendanceCount(attendanceRes.count || 0)
      setMaterials((materialsRes.data as unknown as LearningMaterial[]) || [])
      setProgress((progressRes.data as unknown as LearningProgress[]) || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const completedMaterialIds = new Set(progress.map(p => p.material_id))

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#045184]" /></div>

  return (
    <div className="space-y-6">
      <div className="bg-[#022A4A] border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-6">
        <div className="inline-flex items-center gap-2 bg-[#045184] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] mb-3">Intern Portal</div>
        <h2 className="text-xl font-black text-white">Welcome back, {userName}!</h2>
        <p className="text-white/60 text-sm font-semibold mt-1">
          {pendingTasksCount > 0 ? `You have ${pendingTasksCount} task${pendingTasksCount === 1 ? '' : 's'} pending.` : 'All tasks are up to date.'} Keep up the great work!
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Tasks', value: String(pendingTasksCount), icon: ClipboardList, color: pendingTasksCount > 0 ? 'bg-amber-500' : 'bg-emerald-600' },
          { label: 'Reports Submitted', value: String(reportsCount), icon: FileText, color: 'bg-[#045184]' },
          { label: 'Days Attended', value: String(attendanceCount), icon: Clock, color: 'bg-emerald-600' },
          { label: 'Learning Materials', value: String(materials.length), icon: BookOpen, color: 'bg-purple-600' },
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
          { label: 'My Tasks', href: '/dashboard/intern/tasks', icon: ClipboardList },
          { label: 'Reports', href: '/dashboard/intern/reports', icon: FileText },
          { label: 'Calendar', href: '/dashboard/intern/calendar', icon: Calendar },
          { label: 'Learning', href: '/dashboard/intern/learning', icon: BookOpen },
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
            <Link href="/dashboard/intern/tasks" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1">View All <ArrowUpRight size={12} /></Link>
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
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Learning Progress</h3>
            <Link href="/dashboard/intern/learning" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1">View All <ArrowUpRight size={12} /></Link>
          </div>
          {materials.length === 0 ? <p className="text-sm text-foreground/40 py-8 text-center font-semibold">No learning materials</p> : (
            <div className="p-4 space-y-3">
              {materials.map((m) => {
                const isCompleted = completedMaterialIds.has(m.id)
                return (
                  <div key={m.id} className={`p-4 border-2 ${isCompleted ? 'border-emerald-400 bg-emerald-50' : 'border-black/15'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isCompleted && <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />}
                        <p className="text-sm font-bold text-[#022A4A]">{m.title}</p>
                      </div>
                      {m.material_type && <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wide">{m.material_type}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#F4F6FA] border border-black/10">
                        <div className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-[#045184]'} transition-all`} style={{ width: isCompleted ? '100%' : '0%' }} />
                      </div>
                      <span className={`text-xs font-black ${isCompleted ? 'text-emerald-600' : 'text-foreground/40'}`}>{isCompleted ? '100%' : '0%'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
