'use client'

import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, Plus, Loader2, X, CheckSquare, Square, Clock, AlertTriangle, CheckCircle2, Calendar, User } from 'lucide-react'
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

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-md text-sm font-bold text-white border border-border rounded-xl ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [assignableUsers, setAssignableUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')

  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' })

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setCurrentUserId(user.id)
    setForm(f => ({ ...f, assigned_to: user.id }))

    const [tasksRes, profileRes, usersRes] = await Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase.from('profiles').select('id, full_name, email, role').in('role', ['intern', 'student']).order('full_name'),
    ])

    setTasks(tasksRes.data || [])
    setCurrentUserName(profileRes.data?.full_name || 'You')
    setAssignableUsers(usersRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: 'Todo', icon: <Clock size={14} /> },
    { key: 'in_progress', label: 'In Progress', icon: <AlertTriangle size={14} /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircle2 size={14} /> },
  ]

  const filtered = tasks.filter(t => t.status === activeTab)

  const handleCheckbox = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      showToast(newStatus === 'completed' ? 'Task completed!' : 'Task reopened', 'success')
      fetchData()
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) { showToast('Status updated', 'success'); fetchData() }
  }

  const handleSave = async () => {
    if (!form.title) { showToast('Title required', 'error'); return }
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
        showToast('Task created', 'success')
        setShowModal(false)
        setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: currentUserId })
        fetchData()
      } else {
        const { error } = await res.json()
        showToast(error || 'Failed to create', 'error')
      }
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#35C8E0]" /></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#35C8E0] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-[#1A9AB5] rounded-lg shadow-sm mb-3">
            <ClipboardList size={12} />
            Tasks
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A9AB5] uppercase tracking-tight leading-none">My Tasks</h1>
          <p className="text-sm text-foreground/50 font-semibold mt-1">Your tasks and assignments</p>
        </div>
        <button onClick={() => { setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: currentUserId }); setShowModal(true) }}
          className="flex items-center gap-2 bg-[#1A9AB5] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#158da5] transition-colors flex-shrink-0">
          <Plus size={15} /> New Task
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {tabs.map(tab => {
          const count = tasks.filter(t => t.status === tab.key).length
          return (
            <div key={tab.key} className="bg-white border border-border rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                {tab.icon}
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{tab.label}</span>
              </div>
              <div className="text-2xl font-black text-[#1A9AB5]">{count}</div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest border rounded-lg transition-all ${
              activeTab === tab.key ? 'bg-[#1A9AB5] text-white border-[#1A9AB5] shadow-sm' : 'bg-white border-border text-foreground/50 hover:border-[#1A9AB5]'
            }`}>
            {tab.icon} {tab.label} ({tasks.filter(t => t.status === tab.key).length})
          </button>
        ))}
      </div>

      {/* Task Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl shadow-sm p-12 text-center">
          <p className="text-sm text-foreground/40 font-semibold">No tasks in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <div key={task.id} className="bg-white border border-border rounded-xl shadow-sm p-5">
              <div className="flex items-start gap-4">
                <button onClick={() => handleCheckbox(task)} className="mt-0.5 flex-shrink-0">
                  {task.status === 'completed'
                    ? <CheckSquare size={20} className="text-emerald-600" />
                    : <Square size={20} className="text-foreground/30 hover:text-[#1A9AB5]" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className={`font-bold text-[#1A9AB5] ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>{task.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 font-black uppercase tracking-wide border ${priorityColors[task.priority] || priorityColors.medium}`}>{task.priority}</span>
                  </div>
                  {task.description && <p className="text-xs text-foreground/50 mb-2">{task.description}</p>}
                  <div className="flex items-center gap-4 text-[10px] text-foreground/40 font-semibold">
                    {task.due_date && (
                      <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    )}
                    {task.assigned_to_profile && task.assigned_to !== currentUserId && (
                      <span className="flex items-center gap-1"><User size={10} /> Assigned to: {task.assigned_to_profile.full_name}</span>
                    )}
                    {task.assigned_by_profile && task.assigned_by !== currentUserId && (
                      <span className="text-purple-600 font-bold">Assigned by: {task.assigned_by_profile.full_name}</span>
                    )}
                  </div>
                </div>
                {task.status !== 'completed' && (
                  <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                    className="text-xs border border-border rounded-lg px-2 py-1.5 font-semibold focus:outline-none focus:border-[#35C8E0] bg-white flex-shrink-0">
                    <option value="pending">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Done</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#1A9AB5] rounded-t-2xl">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]" placeholder="Task title" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0] resize-none" rows={3} placeholder="Optional details..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Assign To</label>
                <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]">
                  <option value={currentUserId}>Myself ({currentUserName})</option>
                  {assignableUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest border border-border rounded-lg text-foreground/60 hover:border-[#1A9AB5]">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold bg-[#1A9AB5] text-white rounded-lg hover:bg-[#158da5] disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
