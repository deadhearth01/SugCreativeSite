'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Plus, Loader2, X, Search, Edit, Trash2, TrendingUp, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Profile = { id: string; full_name: string; email: string; role: string }
type Project = {
  id: string
  title: string
  description: string | null
  status: string
  progress_percent: number
  budget: number | null
  start_date: string | null
  end_date: string | null
  created_at: string
  client_id: string
  client: { full_name: string; email: string } | null
  comments: string | null
}

const PROJECT_STATUSES = ['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled']

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-md text-sm font-bold text-white border border-border rounded-xl ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

const statusColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  review: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  on_hold: 'bg-orange-100 text-orange-700 border-orange-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export default function ClientManagementPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [form, setForm] = useState({
    title: '', description: '', client_id: '', budget: '', start_date: '', end_date: '', comments: '',
  })

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const loadData = async () => {
    const [projRes, clientsRes] = await Promise.all([
      fetch('/api/projects').then(r => r.json()),
      createClient().from('profiles').select('id, full_name, email, role').eq('role', 'client').order('full_name'),
    ])
    setProjects((projRes.data || []) as Project[])
    setClients(clientsRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.client?.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: projects.length,
    active: projects.filter(p => ['in_progress', 'review'].includes(p.status)).length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((s, p) => s + (Number(p.budget) || 0), 0),
  }

  const openCreate = () => {
    setEditProject(null)
    setForm({ title: '', description: '', client_id: '', budget: '', start_date: '', end_date: '', comments: '' })
    setShowModal(true)
  }

  const openEdit = (proj: Project) => {
    setEditProject(proj)
    setForm({
      title: proj.title,
      description: proj.description || '',
      client_id: proj.client_id,
      budget: proj.budget ? String(proj.budget) : '',
      start_date: proj.start_date || '',
      end_date: proj.end_date || '',
      comments: proj.comments || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.client_id) { showToast('Title and client required', 'error'); return }
    setSaving(true)
    try {
      const payload = { ...form, budget: form.budget ? parseFloat(form.budget) : null, start_date: form.start_date || null, end_date: form.end_date || null, description: form.description || null, comments: form.comments || null }
      const url = editProject ? `/api/projects/${editProject.id}` : '/api/projects'
      const method = editProject ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const { error } = await res.json(); showToast(error || 'Failed', 'error'); return }
      showToast(editProject ? 'Project updated' : 'Project created', 'success')
      setShowModal(false)
      loadData()
    } finally { setSaving(false) }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    if (res.ok) { showToast(`Status: ${status.replace('_', ' ')}`, 'success'); loadData() }
  }

  const handleProgressUpdate = async (id: string, progress: number) => {
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ progress_percent: progress }),
    })
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete project?')) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (res.ok) { showToast('Deleted', 'success'); setProjects(prev => prev.filter(p => p.id !== id)) }
  }

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#35C8E0]" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#35C8E0] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-[#1A9AB5] rounded-lg shadow-sm mb-3">
            <Briefcase size={12} /> Clients
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A9AB5] uppercase tracking-tight leading-none">Client Management</h1>
          <p className="text-sm text-foreground/50 font-semibold mt-1">Manage client projects, status, and budgets</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#1A9AB5] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#158da5] transition-colors flex-shrink-0">
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: stats.total, color: 'bg-[#35C8E0]' },
          { label: 'Active', value: stats.active, color: 'bg-amber-500' },
          { label: 'Completed', value: stats.completed, color: 'bg-emerald-600' },
          { label: 'Total Budget', value: fmt(stats.totalBudget), color: 'bg-purple-600' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-border rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 ${card.color} border border-border rounded-xl flex items-center justify-center shadow-sm`}>
                <Briefcase size={15} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{card.label}</span>
            </div>
            <div className="text-2xl font-black text-[#1A9AB5]">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-xl shadow-md p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input type="text" placeholder="Search projects or clients..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm font-semibold focus:outline-none focus:border-[#35C8E0]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...PROJECT_STATUSES].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border rounded-lg transition-all ${
                filterStatus === s ? 'bg-[#1A9AB5] text-white border-[#1A9AB5] shadow-sm' : 'bg-white border-border text-foreground/50 hover:border-[#1A9AB5]'
              }`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl shadow-sm p-12 text-center">
          <p className="text-sm text-foreground/40 font-semibold">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(proj => (
            <div key={proj.id} className="bg-white border border-border rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-black text-[#1A9AB5] text-lg">{proj.title}</h3>
                  <p className="text-xs text-foreground/50 font-semibold">{proj.client?.full_name} · {proj.client?.email}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(proj)} className="text-foreground/30 hover:text-[#35C8E0] p-1"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(proj.id)} className="text-foreground/30 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                </div>
              </div>

              {proj.description && <p className="text-xs text-foreground/50 mb-3">{proj.description}</p>}

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border ${statusColors[proj.status] || statusColors.planning}`}>
                  {proj.status.replace('_', ' ')}
                </span>
                {proj.budget && (
                  <span className="text-[10px] px-2 py-1 font-black uppercase tracking-wide border bg-gray-50 text-gray-600 border-gray-200">
                    {fmt(Number(proj.budget))}
                  </span>
                )}
                {proj.start_date && (
                  <span className="text-[10px] text-foreground/40 font-semibold">
                    {new Date(proj.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    {proj.end_date && ` — ${new Date(proj.end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Progress</span>
                  <span className="text-xs font-black text-[#1A9AB5]">{proj.progress_percent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 border border-black/10">
                  <div className="h-full bg-[#1A9AB5] transition-all" style={{ width: `${proj.progress_percent}%` }} />
                </div>
                <input type="range" min="0" max="100" step="5" value={proj.progress_percent}
                  onChange={e => handleProgressUpdate(proj.id, Number(e.target.value))}
                  className="w-full mt-1 accent-[#1A9AB5] h-1" />
              </div>

              {/* Status quick actions */}
              <div className="flex gap-1 flex-wrap">
                <select value={proj.status} onChange={e => handleStatusUpdate(proj.id, e.target.value)}
                  className="text-xs border border-border rounded-lg px-2 py-1.5 font-semibold focus:outline-none focus:border-[#35C8E0] bg-white">
                  {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>

              {proj.comments && (
                <div className="mt-3 pt-3 border-t-2 border-black/5">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Notes</span>
                  <p className="text-xs text-foreground/60 mt-1">{proj.comments}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#1A9AB5] rounded-t-2xl">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">{editProject ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Project Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]" placeholder="Project name" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Client *</label>
                <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]">
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0] resize-none" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Budget (₹)</label>
                  <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]" min="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Start</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">End</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Notes/Comments</label>
                <textarea value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0] resize-none" rows={2} placeholder="Internal notes..." />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest border border-border rounded-lg text-foreground/60 hover:border-[#1A9AB5]">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold bg-[#1A9AB5] text-white rounded-lg hover:bg-[#158da5] disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
                {editProject ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
