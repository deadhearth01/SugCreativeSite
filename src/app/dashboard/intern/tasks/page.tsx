'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Task = {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  due_date: string | null
  created_at: string
  assigned_by_profile: { full_name: string } | null
}

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'
type Toast = { message: string; type: 'success' | 'error' }

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

const priorityStyles: Record<string, string> = {
  urgent: 'text-red-600 font-semibold',
  high: 'text-orange-500 font-semibold',
  medium: 'text-yellow-600 font-semibold',
  low: 'text-foreground/50',
}

const statusTabs: StatusFilter[] = ['all', 'pending', 'in_progress', 'completed', 'overdue']

export default function InternTasksPage() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const fetchTasks = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('tasks')
      .select('*, assigned_by_profile:assigned_by(full_name)')
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false })

    setTasks((data as unknown as Task[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    setUpdatingId(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        showToast('Task status updated!', 'success')
        await fetchTasks()
      } else {
        showToast('Failed to update status.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'overdue') {
      return t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    }
    return t.status === statusFilter
  })

  const taskRows = filteredTasks.map((t) => [
    <div key="info">
      <p className="font-medium text-primary text-sm">{t.title}</p>
      {t.description && <p className="text-xs text-foreground/50 mt-0.5 line-clamp-1">{t.description}</p>}
      {t.assigned_by_profile && (
        <p className="text-xs text-foreground/40 mt-0.5">Assigned by: {(t.assigned_by_profile as { full_name: string }).full_name}</p>
      )}
    </div>,
    <span key="p" className={`text-xs ${priorityStyles[t.priority?.toLowerCase()] || 'text-foreground/50'}`}>{t.priority}</span>,
    <StatusBadge key="s" status={t.status} />,
    <span key="d" className="text-foreground/50 text-xs">{t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>,
    <select
      key="action"
      value={t.status}
      onChange={(e) => handleStatusUpdate(t.id, e.target.value)}
      disabled={updatingId === t.id}
      className="text-xs border border-border rounded px-2 py-1 bg-white focus:outline-none focus:border-[#35C8E0] disabled:opacity-60"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>,
  ])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader title="My Tasks" description="Tasks assigned to you during your internship" />

      <div className="flex border border-border rounded-lg overflow-hidden mb-6 w-fit flex-wrap">
        {statusTabs.map((tab) => {
          const count = tab === 'all'
            ? tasks.length
            : tab === 'overdue'
            ? tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length
            : tasks.filter((t) => t.status === tab).length
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${statusFilter === tab ? 'bg-primary text-white' : 'hover:bg-off-white text-foreground/60'}`}
            >
              {tab.replace('_', ' ')} ({count})
            </button>
          )
        })}
      </div>

      <div className="bg-white border border-border rounded-xl">
        {taskRows.length > 0 ? (
          <DashboardTable headers={['Task', 'Priority', 'Status', 'Due Date', 'Action']} rows={taskRows} />
        ) : (
          <p className="text-sm text-foreground/40 py-12 text-center">No tasks found</p>
        )}
      </div>
    </div>
  )
}
