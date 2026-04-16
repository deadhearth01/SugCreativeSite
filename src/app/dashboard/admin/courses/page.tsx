'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Edit, Trash2, Loader2, X,
  ExternalLink, Calendar, Tag, Layers, IndianRupee,
} from 'lucide-react'
import { PageHeader, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Course = {
  id: string
  title: string
  slug?: string
  category: string
  price: number
  offer_price?: number
  original_price?: number
  status: string
  lessons: number
  duration?: string
  duration_text?: string
  description?: string
  start_date?: string
  end_date?: string
  batch_start_date?: string
  enrollment_limit?: number
  tech_stack?: string[]
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

function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${
        type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
      }`}
    >
      {message}
      <button onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  )
}

const categoryLabel = (v: string) =>
  CATEGORIES.find((c) => c.value === v)?.label || v

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'business_solutions',
    price: '',
    offer_price: '',
    original_price: '',
    lessons: '',
    duration: '',
    status: 'draft',
    start_date: '',
    end_date: '',
    batch_start_date: '',
    enrollment_limit: '',
    tech_stack: '',
  })

  const showToast = (message: string, type: 'success' | 'error') =>
    setToast({ message, type })

  const loadCourses = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('courses')
      .select('*, enrollments(count)')
      .order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      categoryLabel(c.category).toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditCourse(null)
    setForm({
      title: '',
      description: '',
      category: 'business_solutions',
      price: '',
      offer_price: '',
      original_price: '',
      lessons: '',
      duration: '',
      status: 'draft',
      start_date: '',
      end_date: '',
      batch_start_date: '',
      enrollment_limit: '',
      tech_stack: '',
    })
    setShowModal(true)
  }

  const openEdit = (course: Course) => {
    setEditCourse(course)
    setForm({
      title: course.title,
      description: course.description || '',
      category: course.category,
      price: String(course.price ?? ''),
      offer_price: course.offer_price ? String(course.offer_price) : '',
      original_price: course.original_price ? String(course.original_price) : '',
      lessons: String(course.lessons ?? ''),
      duration: course.duration || '',
      status: course.status,
      start_date: course.start_date || '',
      end_date: course.end_date || '',
      batch_start_date: course.batch_start_date || '',
      enrollment_limit: course.enrollment_limit
        ? String(course.enrollment_limit)
        : '',
      tech_stack: (course.tech_stack || []).join(', '),
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.category) {
      showToast('Title and category are required', 'error')
      return
    }
    setSaving(true)
    try {
      const techArr = form.tech_stack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || null,
        category: form.category,
        price: parseFloat(form.price) || 0,
        offer_price: form.offer_price ? parseFloat(form.offer_price) : null,
        original_price: form.original_price
          ? parseFloat(form.original_price)
          : null,
        lessons: parseInt(form.lessons) || 0,
        duration: form.duration || null,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        batch_start_date: form.batch_start_date || null,
        enrollment_limit: form.enrollment_limit
          ? parseInt(form.enrollment_limit)
          : null,
        tech_stack: techArr.length > 0 ? techArr : null,
      }
      const url = editCourse
        ? `/api/courses/${editCourse.id}`
        : '/api/courses'
      const method = editCourse ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const { error } = await res.json()
        showToast(error || 'Failed to save', 'error')
        return
      }
      showToast(
        editCourse ? 'Course updated' : 'Course created',
        'success'
      )
      setShowModal(false)
      loadCourses()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Course deleted', 'success')
      setCourses((prev) => prev.filter((c) => c.id !== id))
    } else showToast('Failed to delete', 'error')
  }

  const enrollmentCount = (course: Course) => {
    const e = course.enrollments?.[0]
    return (e as unknown as { count: number })?.count ?? 0
  }

  const displayPrice = (course: Course) => {
    const effective = course.offer_price ?? course.price
    return effective
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2
          size={28}
          className="animate-spin text-[#1A9AB5]"
        />
      </div>
    )

  return (
    <div>
      <PageHeader
        title="Course Management"
        description="Create, edit, and manage all training courses"
        action={
          <button
            onClick={openCreate}
            className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-md"
          >
            <Plus size={16} /> New Course
          </button>
        }
      />

      {/* Search bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-md">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
          />
          <input
            type="text"
            placeholder="Search courses by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
          />
        </div>
      </div>

      {/* Course list */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-12 text-center">
          <p className="text-sm text-foreground/40">
            {courses.length === 0
              ? 'No courses yet. Create your first course.'
              : 'No courses match the search.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-5">
                {/* Top row: title + actions */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-primary truncate">
                        {c.title}
                      </h3>
                      {c.slug && (
                        <Link
                          href={`/courses/${c.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-[#1A9AB5] hover:text-[#35C8E0] font-medium transition-colors shrink-0"
                        >
                          <ExternalLink size={12} />
                          View Public Page
                        </Link>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-xs text-foreground/50 mt-1 line-clamp-1">
                        {c.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-2 rounded-xl text-foreground/40 hover:text-primary hover:bg-primary/5 transition-colors"
                      title="Edit course"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 rounded-xl text-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete course"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Info chips row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category */}
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-foreground/70 px-2.5 py-1 rounded-full font-medium">
                    <Layers size={11} />
                    {categoryLabel(c.category)}
                  </span>

                  {/* Status */}
                  <StatusBadge status={c.status} />

                  {/* Price */}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-[#35C8E0]/10 px-2.5 py-1 rounded-full">
                    <IndianRupee size={11} />
                    {Number(displayPrice(c)).toLocaleString('en-IN')}
                    {c.original_price != null &&
                      c.original_price > (c.offer_price ?? c.price) && (
                        <span className="text-foreground/30 line-through ml-1 font-normal">
                          {Number(c.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                  </span>

                  {/* Students */}
                  <span className="inline-flex items-center gap-1 text-xs text-foreground/50 px-2.5 py-1 rounded-full bg-gray-50">
                    {enrollmentCount(c)} student{enrollmentCount(c) !== 1 ? 's' : ''}
                  </span>

                  {/* Batch start date */}
                  {c.batch_start_date && (
                    <span className="inline-flex items-center gap-1 text-xs text-foreground/50 px-2.5 py-1 rounded-full bg-gray-50">
                      <Calendar size={11} />
                      Batch:{' '}
                      {new Date(c.batch_start_date).toLocaleDateString(
                        'en-IN',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </span>
                  )}

                  {/* Tech stack */}
                  {c.tech_stack && c.tech_stack.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-foreground/50 px-2.5 py-1 rounded-full bg-gray-50">
                      <Tag size={11} />
                      {c.tech_stack.slice(0, 3).join(', ')}
                      {c.tech_stack.length > 3 &&
                        ` +${c.tech_stack.length - 3}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-primary">
                {editCourse ? 'Edit Course' : 'New Course'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-foreground/40" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                  placeholder="Course title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] resize-none transition-all"
                  rows={3}
                />
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price / Offer Price / Original Price */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Price
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Offer Price
                  </label>
                  <input
                    type="number"
                    value={form.offer_price}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        offer_price: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                    min="0"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Original Price
                  </label>
                  <input
                    type="number"
                    value={form.original_price}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        original_price: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                    min="0"
                    placeholder="MRP / strikethrough"
                  />
                </div>
              </div>

              {/* Lessons / Duration / Max Students */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Lessons
                  </label>
                  <input
                    type="number"
                    value={form.lessons}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lessons: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, duration: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                    placeholder="e.g. 3 months"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Max Students
                  </label>
                  <input
                    type="number"
                    value={form.enrollment_limit}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        enrollment_limit: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                    min="0"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              {/* Dates: Start / End / Batch Start */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        start_date: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        end_date: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Batch Start
                  </label>
                  <input
                    type="date"
                    value={form.batch_start_date}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        batch_start_date: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                  Tech Stack
                </label>
                <input
                  type="text"
                  value={form.tech_stack}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tech_stack: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                  placeholder="React, Node.js, PostgreSQL (comma-separated)"
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-foreground/60 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md"
              >
                {saving
                  ? 'Saving...'
                  : editCourse
                    ? 'Update Course'
                    : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
