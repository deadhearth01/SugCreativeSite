'use client'

import { useState, useEffect } from 'react'
import { Plus, Pin, Clock, Trash2, Edit, Loader2, X } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Announcement = {
  id: string
  title: string
  content: string
  is_pinned: boolean
  target_roles: string[]
  created_at: string
  author: { full_name: string } | null
}

const ALL_ROLES = ['all', 'admin', 'student', 'client', 'mentor', 'employee', 'intern']

function timeAgo(dt: string) {
  const diff = Date.now() - new Date(dt).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editAnn, setEditAnn] = useState<Announcement | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false, target_roles: ['all'] })

  const loadAnnouncements = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('announcements')
      .select('*, author:created_by(full_name)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
    setAnnouncements(data || [])
    setLoading(false)
  }

  useEffect(() => { loadAnnouncements() }, [])

  const openCreate = () => {
    setEditAnn(null)
    setForm({ title: '', content: '', is_pinned: false, target_roles: ['all'] })
    setShowModal(true)
  }

  const openEdit = (ann: Announcement) => {
    setEditAnn(ann)
    setForm({ title: ann.title, content: ann.content, is_pinned: ann.is_pinned, target_roles: ann.target_roles || ['all'] })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) { setToast({ message: 'Title and content are required', type: 'error' }); return }
    setSaving(true)
    try {
      const url = editAnn ? `/api/announcements/${editAnn.id}` : '/api/announcements'
      const method = editAnn ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const { error } = await res.json(); setToast({ message: error || 'Failed', type: 'error' }); return }
      setToast({ message: editAnn ? 'Updated' : 'Announcement posted', type: 'success' })
      setShowModal(false)
      loadAnnouncements()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    if (res.ok) { setToast({ message: 'Deleted', type: 'success' }); setAnnouncements(prev => prev.filter(a => a.id !== id)) }
    else setToast({ message: 'Failed to delete', type: 'error' })
  }

  const toggleRole = (role: string) => {
    if (role === 'all') {
      setForm(f => ({ ...f, target_roles: ['all'] }))
      return
    }
    setForm(f => {
      const current = f.target_roles.filter(r => r !== 'all')
      const has = current.includes(role)
      return { ...f, target_roles: has ? current.filter(r => r !== role) : [...current, role] }
    })
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Broadcast updates to your teams"
        action={
          <button onClick={openCreate} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} /> New Announcement
          </button>
        }
      />

      {announcements.length === 0 ? (
        <div className="text-center py-20 text-foreground/40 text-sm">No announcements yet. Create your first one.</div>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => (
            <div key={ann.id} className="bg-white border border-border rounded-xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {ann.is_pinned && (
                      <span className="flex items-center gap-1 text-[#1A9AB5] text-xs font-semibold">
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-foreground/40 text-xs">
                      <Clock size={12} /> {timeAgo(ann.created_at)}
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {(ann.target_roles || ['all']).map(r => (
                        <span key={r} className="text-xs bg-[#35C8E0]/20 text-primary px-2 py-0.5 rounded-md font-medium capitalize">{r}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-primary mb-2">{ann.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{ann.content}</p>
                  {ann.author && <p className="text-xs text-foreground/30 mt-2">By {ann.author.full_name}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(ann)} className="text-foreground/40 hover:text-primary transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(ann.id)} className="text-foreground/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">{editAnn ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-foreground/40" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0] resize-none" rows={5} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-2 uppercase tracking-wide">Target Audience</label>
                <div className="flex gap-2 flex-wrap">
                  {ALL_ROLES.map(r => (
                    <button key={r} type="button" onClick={() => toggleRole(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-colors ${form.target_roles.includes(r) ? 'bg-primary text-white border-primary' : 'border-border text-foreground/60 hover:border-primary'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-checked:bg-primary-bright rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
                <span className="text-sm font-medium text-primary">Pin this announcement</span>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground/60 hover:bg-off-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : (editAnn ? 'Update' : 'Publish')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
