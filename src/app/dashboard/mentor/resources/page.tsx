'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { Plus, BookOpen, FileText, Video, Link2, Trash2, X, Loader2, Globe, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Resource = {
  id: string
  title: string
  description: string | null
  resource_type: string
  is_public: boolean
  created_at: string
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  document: FileText,
  video: Video,
  link: Link2,
  template: BookOpen,
}

export default function MentorResourcesPage() {
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState<Resource[]>([])
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ title: '', description: '', resource_type: 'document', is_public: false })

  const loadResources = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('mentor_resources')
      .select('id, title, description, resource_type, is_public, created_at')
      .eq('mentor_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setResources(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadResources() }, [loadResources])

  const handleCreate = async () => {
    if (!form.title.trim()) { setToast({ message: 'Title is required', type: 'error' }); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/mentor/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setToast({ message: 'Resource created', type: 'success' })
        setShowModal(false)
        setForm({ title: '', description: '', resource_type: 'document', is_public: false })
        loadResources()
      } else {
        const { error } = await res.json()
        setToast({ message: error || 'Failed to create resource', type: 'error' })
      }
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return
    const res = await fetch(`/api/mentor/resources/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setToast({ message: 'Resource deleted', type: 'success' })
      setResources(prev => prev.filter(r => r.id !== id))
    } else {
      setToast({ message: 'Failed to delete resource', type: 'error' })
    }
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div>
      <PageHeader
        title="Resources"
        description="Materials and resources you've created for your students"
        action={
          <button onClick={() => setShowModal(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} /> Add Resource
          </button>
        }
      />

      {resources.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <BookOpen size={40} className="mx-auto text-foreground/20 mb-3" />
          <p className="text-foreground/50 text-sm">No resources yet. Create your first resource.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => {
            const Icon = TYPE_ICONS[r.resource_type] || FileText
            return (
              <div key={r.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary-bright/10 rounded-lg flex items-center justify-center">
                    <Icon size={18} className="text-primary-bright" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${r.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {r.is_public ? <Globe size={10} /> : <Lock size={10} />}
                      {r.is_public ? 'Public' : 'Private'}
                    </span>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-primary text-sm mb-1">{r.title}</h3>
                {r.description && <p className="text-xs text-foreground/50 mb-2 line-clamp-2">{r.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-off-white px-2 py-0.5 rounded font-medium text-foreground/60 capitalize">{r.resource_type}</span>
                  <span className="text-xs text-foreground/40">{new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-heading font-bold text-primary">New Resource</h3>
                <p className="text-xs text-foreground/50 mt-0.5">Add a resource for your students</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright"
                  placeholder="Resource title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright resize-none"
                  rows={3}
                  placeholder="Brief description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Resource Type</label>
                <select
                  value={form.resource_type}
                  onChange={e => setForm({ ...form, resource_type: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright bg-white"
                >
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                  <option value="template">Template</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-primary">Make Public</p>
                  <p className="text-xs text-foreground/50">Allow all students to see this resource</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={e => setForm({ ...form, is_public: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-checked:bg-primary-bright rounded-full peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={submitting} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Create Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
