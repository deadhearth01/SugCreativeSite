'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ClipboardList, Loader2, X, ArrowUpRight, CheckSquare, Square, Calendar, User, AlertTriangle, Clock, CheckCircle2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Profile = { id: string; full_name: string; email: string; role: string }
type Task = {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  due_date: string | null
  created_at: string
  assigned_to: string
  assigned_by: string
  assigned_to_profile: { full_name: string; email: string; role: string } | null
  assigned_by_profile: { full_name: string } | null
}

type TabKey = 'pending' | 'in_progress' | 'completed'

const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  urgent: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-md text-sm font-bold text-white border border-border rounded-xl ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
  })

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks')
    const { data } = await res.json()
    setTasks(data || [])
    setLoading(false)
  }, [])

  const fetchUsers = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
      setForm(f => ({ ...f, assigned_to: user.id }))
    }
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .order('full_name')
    setUsers(data || [])
  }, [])

  useEffect(() => { fetchTasks(); fetchUsers() }, [fetchTasks, fetchUsers])

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: 'Todo', icon: <Clock size={14} /> },
    { key: 'in_progress', label: 'In Progress', icon: <AlertTriangle size={14} /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircle2 size={14} /> },
  ]

  const filtered = tasks.filter(t => t.status === activeTab)

  const handleCheckbox = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        showToast(newStatus === 'completed' ? 'Task completed!' : 'Task reopened', 'success')
        fetchTasks()
      } else showToast('Failed to update task', 'error')
    } catch { showToast('An error occurred', 'error') }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        showToast('Status updated!', 'success')
        fetchTasks()
      } else showToast('Failed to update', 'error')
    } catch { showToast('An error occurred', 'error') }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Task deleted', 'success')
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } else showToast('Failed to delete', 'error')
  }

  const openCreate = () => {
    setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: currentUserId })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title) { showToast('Title is required', 'error'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          priority: form.priority,
          due_date: form.due_date || null,
          assigned_to: form.assigned_to || currentUserId,
        }),
      })
      if (res.ok) {
        showToast('Task created!', 'success')
        setShowModal(false)
        fetchTasks()
      } else {
        const { error } = await res.json()
        showToast(error || 'Failed to create task', 'error')
      }
    } finally { setSaving(false) }
  }

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isOverdue = (task: Task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#35C8E0]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#35C8E0] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-[#1A9AB5] rounded-lg shadow-sm mb-3">
            <ClipboardList size={12} />
            Task Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A9AB5] uppercase tracking-tight leading-none">Tasks</h1>
          <p className="text-sm text-foreground/50 font-semibold mt-1">Manage and assign tasks across all team members</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1A9AB5] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#158da5] transition-colors flex-shrink-0"
        >
          <Plus size={15} />
          Create Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#35C8E0] border border-border rounded-xl flex items-center justify-center shadow-sm">
              <Clock size={16} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-foreground/60">Todo</span>
          </div>
          <div className="text-3xl font-black text-[#35C8E0]">{tasks.filter(t => t.status === 'pending').length}</div>
        </div>
        <div className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-500 border border-border rounded-xl flex items-center justify-center shadow-sm">
              <AlertTriangle size={16} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-foreground/60">In Progress</span>
          </div>
          <div className="text-3xl font-black text-orange-500">{tasks.filter(t => t.status === 'in_progress').length}</div>
        </div>
        <div className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#82C93D] border border-border rounded-xl flex items-center justify-center shadow-sm">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-foreground/60">Completed</span>
          </div>
          <div className="text-3xl font-black text-[#82C93D]">{tasks.filter(t => t.status === 'completed').length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest border rounded-lg transition-all ${
              activeTab === tab.key
                ? 'bg-[#1A9AB5] text-white border-[#1A9AB5] shadow-sm'
                : 'bg-white border-border text-foreground/60 hover:border-[#1A9AB5] hover:shadow-sm'
            }`}
          >
            {tab.icon}
            {tab.label} ({tasks.filter(t => t.status === tab.key).length})
          </button>
        ))}
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-xl shadow-sm p-12 text-center">
            <p className="text-sm text-foreground/40 font-semibold">No tasks in this category</p>
          </div>
        ) : (
          filtered.map(task => {
            const pStyle = priorityColors[task.priority?.toLowerCase()] || priorityColors.medium
            return (
              <div key={task.id} className="bg-white border border-border rounded-xl shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button onClick={() => handleCheckbox(task)} className="mt-0.5 flex-shrink-0 text-foreground/30 hover:text-[#82C93D] transition-colors">
                    {task.status === 'completed' ? <CheckSquare size={20} className="text-[#82C93D]" /> : <Square size={20} />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className={`font-bold text-[#1A9AB5] ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-foreground/50 mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border rounded-md ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                          {task.priority}
                        </span>
                        <button onClick={() => handleDelete(task.id)} className="text-foreground/30 hover:text-red-500 transition-colors p-1 hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {task.due_date && (
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${isOverdue(task) ? 'text-red-500' : 'text-foreground/40'}`}>
                          <Calendar size={12} />
                          {formatDate(task.due_date)}
                          {isOverdue(task) && <span className="text-[10px] font-black uppercase ml-1">Overdue</span>}
                        </span>
                      )}
                      {task.assigned_to_profile && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground/40">
                          <User size={12} />
                          {task.assigned_to_profile.full_name}
                          <span className="text-[10px] bg-[#1A9AB5]/8 text-[#1A9AB5] px-1.5 py-0.5 font-black uppercase tracking-wide border border-[#1A9AB5]/20">
                            {task.assigned_to_profile.role}
                          </span>
                        </span>
                      )}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-[10px] font-black uppercase tracking-widest border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#35C8E0]"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Assigned by */}
                    {task.assigned_by_profile && (
                      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-3">
                        Assigned by: {task.assigned_by_profile.full_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#1A9AB5] rounded-t-2xl">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Create Task</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]"
                  placeholder="e.g. Review client proposal"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#35C8E0] resize-none"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Assign To</label>
                <select
                  value={form.assigned_to}
                  onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]"
                >
                  <option value={currentUserId}>Myself</option>
                  {users.filter(u => u.id !== currentUserId).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest border border-border rounded-lg text-foreground/60 hover:border-[#1A9AB5] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest bg-[#1A9AB5] text-white rounded-lg hover:bg-[#158da5] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
                {saving ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
