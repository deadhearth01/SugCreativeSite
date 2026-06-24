'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Edit, Trash2, Loader2, X,
  ExternalLink, Calendar, Tag, Layers, IndianRupee,
  Star, ImageIcon, Clock,
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
  display_order?: number
  is_featured?: boolean
  tags?: string[]
  thumbnail_url?: string
  color_theme?: string
  tech_stack?: string[]
  enrollments?: { count: number }[]
}

type UnsplashImage = {
  id: string
  thumb: string
  full: string
  alt: string
  credit: string
  creditUrl: string
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
    display_order: '',
    tech_stack: '',
    thumbnail: '',
    is_featured: false,
    tags: [] as string[],
  })

  // Tags input — chip entry + debounced auto-suggest from /api/course-tags
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const tagDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Image search picker (Unsplash via /api/images/search)
  const [imageQuery, setImageQuery] = useState('')
  const [imageResults, setImageResults] = useState<UnsplashImage[]>([])
  const [imageSearching, setImageSearching] = useState(false)
  const [imageError, setImageError] = useState('')

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

  const resetImageAndTagState = () => {
    setTagInput('')
    setTagSuggestions([])
    setShowTagSuggestions(false)
    setImageQuery('')
    setImageResults([])
    setImageError('')
  }

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
      display_order: '',
      tech_stack: '',
      thumbnail: '',
      is_featured: false,
      tags: [],
    })
    resetImageAndTagState()
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
      display_order:
        course.display_order != null ? String(course.display_order) : '',
      tech_stack: (course.tech_stack || []).join(', '),
      thumbnail: course.thumbnail_url || '',
      is_featured: !!course.is_featured,
      tags: course.tags || [],
    })
    resetImageAndTagState()
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
        display_order: form.display_order ? parseInt(form.display_order) : 0,
        tech_stack: techArr.length > 0 ? techArr : null,
        tags: form.tags,
        thumbnail: form.thumbnail || null,
        is_featured: form.is_featured,
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

  // ── Tags ────────────────────────────────────────────────────────────
  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '').trim()
    if (!tag) return
    setForm((f) =>
      f.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
        ? f
        : { ...f, tags: [...f.tags, tag] }
    )
    setTagInput('')
    setTagSuggestions([])
    setShowTagSuggestions(false)
  }

  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))

  const onTagInputChange = (value: string) => {
    // Adding via comma — split immediately.
    if (value.includes(',')) {
      value.split(',').forEach((part) => part.trim() && addTag(part))
      return
    }
    setTagInput(value)
    if (tagDebounce.current) clearTimeout(tagDebounce.current)
    const q = value.trim()
    if (!q) {
      setTagSuggestions([])
      setShowTagSuggestions(false)
      return
    }
    tagDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/course-tags?q=${encodeURIComponent(q)}`)
        const json = await res.json()
        const suggestions: string[] = (json.data || []).filter(
          (t: string) => !form.tags.some((ex) => ex.toLowerCase() === t.toLowerCase())
        )
        setTagSuggestions(suggestions)
        setShowTagSuggestions(suggestions.length > 0)
      } catch {
        setTagSuggestions([])
        setShowTagSuggestions(false)
      }
    }, 250)
  }

  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (tagInput.trim()) addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      removeTag(form.tags[form.tags.length - 1])
    }
  }

  // ── Image search (Unsplash) ─────────────────────────────────────────
  const searchImages = async () => {
    const q = imageQuery.trim()
    if (!q) return
    setImageSearching(true)
    setImageError('')
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      if (json.error) {
        setImageError(json.error)
        setImageResults([])
      } else {
        setImageResults(json.data || [])
        if ((json.data || []).length === 0) setImageError('No images found.')
      }
    } catch {
      setImageError('Image search failed. Please try again.')
      setImageResults([])
    } finally {
      setImageSearching(false)
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
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-lg max-h-[90vh] overflow-y-auto">
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
            <div className="grid lg:grid-cols-2 gap-6 p-6">
              {/* ── FORM COLUMN ── */}
              <div className="space-y-4">
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

              {/* Tags (chips + auto-suggest) */}
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                  Tags
                </label>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-[#35C8E0]/10 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500 transition-colors"
                          aria-label={`Remove ${tag}`}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => onTagInputChange(e.target.value)}
                    onKeyDown={onTagKeyDown}
                    onFocus={() =>
                      setShowTagSuggestions(tagSuggestions.length > 0)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowTagSuggestions(false), 150)
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                    placeholder="Type a tag, press Enter or comma to add"
                  />
                  {showTagSuggestions && tagSuggestions.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                      {tagSuggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            addTag(s)
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#35C8E0]/10 transition-colors flex items-center gap-2"
                        >
                          <Tag size={12} className="text-foreground/40" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail: manual URL + image search picker */}
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={form.thumbnail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, thumbnail: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                  placeholder="https://… or use search below"
                />
                <div className="mt-2 flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
                    />
                    <input
                      type="text"
                      value={imageQuery}
                      onChange={(e) => setImageQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          searchImages()
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                      placeholder="Search free images (Unsplash)…"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={searchImages}
                    disabled={imageSearching || !imageQuery.trim()}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                  >
                    {imageSearching ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Search size={14} />
                    )}
                    Search
                  </button>
                </div>
                {imageError && (
                  <p className="text-xs text-red-500 mt-2">{imageError}</p>
                )}
                {imageResults.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto p-0.5">
                    {imageResults.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, thumbnail: img.full }))
                        }
                        title={`${img.alt} — ${img.credit}`}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          form.thumbnail === img.full
                            ? 'border-[#35C8E0] ring-2 ring-[#35C8E0]/30'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.thumb}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Display Order + Featured */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        display_order: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-foreground/40 mt-1">
                    Lower = earlier on homepage / listing
                  </p>
                </div>
                <label className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        is_featured: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded accent-[#1A9AB5]"
                  />
                  <span className="text-sm font-semibold text-foreground/70 flex items-center gap-1.5">
                    <Star size={14} className="text-amber-500" />
                    Featured on homepage
                  </span>
                </label>
              </div>
              </div>

              {/* ── LIVE PREVIEW COLUMN ── */}
              <div className="lg:sticky lg:top-0 lg:self-start">
                <p className="text-xs font-semibold text-foreground/60 mb-2 uppercase tracking-wide">
                  Live Preview
                </p>
                <div className="rounded-2xl border-2 border-primary-dark/80 overflow-hidden bg-white shadow-[6px_6px_0px_rgba(0,0,0,0.12)]">
                  {/* Thumbnail / banner */}
                  <div className="relative aspect-video bg-gradient-to-br from-[#35C8E0]/30 to-[#1A9AB5]/40">
                    {form.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.thumbnail}
                        alt={form.title || 'Course thumbnail'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/70">
                        <ImageIcon size={40} />
                      </div>
                    )}
                    {form.is_featured && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <Star size={11} className="fill-white" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-[#35C8E0]/10 px-2.5 py-1 rounded-full mb-3">
                      <Layers size={11} />
                      {categoryLabel(form.category)}
                    </span>
                    <h3 className="text-lg font-black text-primary-dark leading-tight mb-2">
                      {form.title || 'Course title'}
                    </h3>
                    {form.description && (
                      <p className="text-sm text-foreground/60 leading-relaxed mb-3 line-clamp-3">
                        {form.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center text-xl font-black text-primary-dark">
                        <IndianRupee size={16} />
                        {Number(
                          (form.offer_price ? parseFloat(form.offer_price) : 0) ||
                            parseFloat(form.price) ||
                            0
                        ).toLocaleString('en-IN')}
                      </span>
                      {form.original_price &&
                        parseFloat(form.original_price) >
                          (parseFloat(form.offer_price) ||
                            parseFloat(form.price) ||
                            0) && (
                          <span className="text-sm text-foreground/40 line-through">
                            ₹
                            {Number(
                              parseFloat(form.original_price)
                            ).toLocaleString('en-IN')}
                          </span>
                        )}
                    </div>

                    {/* Duration */}
                    {form.duration && (
                      <span className="inline-flex items-center gap-1 text-xs text-foreground/60 bg-gray-100 px-2.5 py-1 rounded-full mb-3">
                        <Clock size={11} />
                        {form.duration}
                      </span>
                    )}

                    {/* Tags */}
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {form.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-semibold text-foreground/70 bg-gray-100 px-2.5 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-foreground/40 mt-2 text-center">
                  Approximate preview of the public course card.
                </p>
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
