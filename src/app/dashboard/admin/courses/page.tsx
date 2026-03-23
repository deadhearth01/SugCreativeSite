'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Loader2, X } from 'lucide-react'
import { PageHeader, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Course = {
  id: string
  title: string
  category: string
  price: number
  status: string
  lessons: number
  duration?: string
  description?: string
  start_date?: string
  end_date?: string
  enrollment_limit?: number
  enrollments?: { count: number }[]
}

const CATEGORIES = [
  { value: 'business_solutions', label: 'Business Solutions' },
  { value: 'career_guidance', label: 'Career Guidance' },
  { value: 'startup_hub', label: 'Startup Hub' },
  { value: 'edu_tech', label: 'Edu Tech' },
  { value: 'young_compete', label: 'Young Compete' },
]
const STATUSES = ['draft', 'active', 'archived', 'upcoming']

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

const categoryLabel = (v: string) => CATEGORIES.find(c => c.value === v)?.label || v

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'business_solutions', price: '', lessons: '', duration: '', status: 'draft', start_date: '', end_date: '', enrollment_limit: '' })

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const loadCourses = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('courses')
      .select('*, enrollments(count)')
      .order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  useEffect(() => { loadCourses() }, [])

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    categoryLabel(c.category).toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditCourse(null)
    setForm({ title: '', description: '', category: 'business_solutions', price: '', lessons: '', duration: '', status: 'draft', start_date: '', end_date: '', enrollment_limit: '' })
    setShowModal(true)
  }

  const openEdit = (course: Course) => {
    setEditCourse(course)
    setForm({
      title: course.title,
      description: course.description || '',
      category: course.category,
      price: String(course.price),
      lessons: String(course.lessons),
      duration: course.duration || '',
      status: course.status,
      start_date: course.start_date || '',
      end_date: course.end_date || '',
      enrollment_limit: course.enrollment_limit ? String(course.enrollment_limit) : '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.category) { showToast('Title and category are required', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        category: form.category,
        price: parseFloat(form.price) || 0,
        lessons: parseInt(form.lessons) || 0,
        duration: form.duration || null,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        enrollment_limit: form.enrollment_limit ? parseInt(form.enrollment_limit) : null,
      }
      const url = editCourse ? `/api/courses/${editCourse.id}` : '/api/courses'
      const method = editCourse ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const { error } = await res.json(); showToast(error || 'Failed to save', 'error'); return }
      showToast(editCourse ? 'Course updated' : 'Course created', 'success')
      setShowModal(false)
      loadCourses()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    if (res.ok) { showToast('Course deleted', 'success'); setCourses(prev => prev.filter(c => c.id !== id)) }
    else showToast('Failed to delete', 'error')
  }

  const enrollmentCount = (course: Course) => {
    const e = course.enrollments?.[0]
    return (e as unknown as { count: number })?.count ?? 0
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>

  return (
    <div>
      <PageHeader
        title="Course Management"
        description="Create, edit, and manage all training courses"
        action={
          <button onClick={openCreate} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} /> New Course
          </button>
        }
      />

      <div className="bg-white border border-border rounded-xl p-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-[#35C8E0]" />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl">
        {filtered.length === 0 ? (
          <p className="text-sm text-foreground/40 py-12 text-center">{courses.length === 0 ? 'No courses yet. Create your first course.' : 'No courses match the search.'}</p>
        ) : (
          <DashboardTable
            headers={['Course', 'Category', 'Students', 'Price', 'Status', 'Actions']}
            rows={filtered.map(c => [
              <span key="t" className="font-medium text-primary">{c.title}</span>,
              <span key="c" className="text-xs bg-off-white px-2 py-1 rounded-md font-medium">{categoryLabel(c.category)}</span>,
              <span key="s" className="text-foreground/60">{enrollmentCount(c)}</span>,
              <span key="p" className="font-semibold text-primary">₹{Number(c.price).toLocaleString('en-IN')}</span>,
              <StatusBadge key="st" status={c.status} />,
              <div key="a" className="flex items-center gap-2">
                <button onClick={() => openEdit(c)} className="text-foreground/40 hover:text-primary transition-colors"><Edit size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="text-foreground/40 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>,
            ])}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">{editCourse ? 'Edit Course' : 'New Course'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-foreground/40" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" placeholder="Course title" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0] resize-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]">
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Price (₹)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" min="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Lessons</label>
                  <input type="number" value={form.lessons} onChange={e => setForm(f => ({ ...f, lessons: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" min="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Max Students</label>
                  <input type="number" value={form.enrollment_limit} onChange={e => setForm(f => ({ ...f, enrollment_limit: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" min="0" placeholder="Unlimited" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground/60 hover:bg-off-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : (editCourse ? 'Update Course' : 'Create Course')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
