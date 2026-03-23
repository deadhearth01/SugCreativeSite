'use client'

import { useEffect, useState } from 'react'
import { PageHeader, DashboardPanel, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Play, Clock, Award, BookOpen, Search, Loader2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Enrollment = {
  id: string
  status: string
  progress: number
  course_id: string
  courses: {
    id: string
    title: string
    category: string
    total_lessons: number
    instructor_name?: string
  } | null
}

type Course = {
  id: string
  title: string
  category: string
  total_lessons: number
  instructor_name?: string
  description?: string
}

export default function StudentCoursesPage() {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [tab, setTab] = useState<'enrolled' | 'browse'>('enrolled')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Fetch enrolled courses
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('id, status, progress, course_id, courses(id, title, category, total_lessons, instructor_name)')
        .eq('student_id', user.id)
      setEnrollments((enrollData as unknown as Enrollment[]) || [])

      // Fetch all available courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, category, total_lessons, instructor_name, description')
        .eq('status', 'published')
      setAvailableCourses((coursesData as unknown as Course[]) || [])

      setLoading(false)
    }
    fetchData()
  }, [])

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id))

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId)
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' })
      if (res.ok) {
        // Re-fetch enrollments
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('id, status, progress, course_id, courses(id, title, category, total_lessons, instructor_name)')
          .eq('student_id', user.id)
        setEnrollments((enrollData as unknown as Enrollment[]) || [])
        setTab('enrolled')
      }
    } finally {
      setEnrollingId(null)
    }
  }

  const filteredEnrollments = enrollments.filter((e) =>
    e.courses?.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.courses?.category?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredAvailable = availableCourses
    .filter((c) => !enrolledCourseIds.has(c.id))
    .filter((c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
    )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Training Courses" description="Your enrolled courses and learning progress" />

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
          />
        </div>
        <div className="flex border border-border rounded-lg overflow-hidden">
          {(['enrolled', 'browse'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-primary text-white' : 'hover:bg-off-white text-foreground/60'}`}
            >
              {t === 'enrolled' ? `My Courses (${enrollments.length})` : `Browse (${availableCourses.filter(c => !enrolledCourseIds.has(c.id)).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Enrolled Courses Tab */}
      {tab === 'enrolled' && (
        <>
          {filteredEnrollments.length === 0 ? (
            <p className="text-sm text-foreground/40 py-8 text-center">No enrolled courses found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrollments.map((enrollment) => {
                const course = enrollment.courses
                if (!course) return null
                const progress = enrollment.progress ?? 0
                const completed = Math.round((progress / 100) * (course.total_lessons || 0))
                return (
                  <div key={enrollment.id} className="bg-white border border-border rounded-xl hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs bg-off-white px-2 py-1 rounded-md font-medium text-foreground/60">
                          {course.category}
                        </span>
                        <StatusBadge status={enrollment.status} />
                      </div>
                      <h3 className="text-lg font-heading font-bold text-primary mb-1">{course.title}</h3>
                      {course.instructor_name && (
                        <p className="text-sm text-foreground/50 mb-4">by {course.instructor_name}</p>
                      )}

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground/60">{completed}/{course.total_lessons || 0} lessons</span>
                          <span className="font-semibold text-primary">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-off-white rounded-full">
                          <div
                            className="h-full bg-primary-bright rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-foreground/50 mb-4">
                        <span className="flex items-center gap-1"><BookOpen size={12} /> {course.total_lessons || 0} lessons</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> ~{Math.ceil((course.total_lessons || 0) * 0.5)}h</span>
                      </div>

                      <button className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                        {progress === 100 ? (
                          <><Award size={14} /> View Certificate</>
                        ) : (
                          <><Play size={14} /> Continue Learning</>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Browse Tab */}
      {tab === 'browse' && (
        <>
          {filteredAvailable.length === 0 ? (
            <p className="text-sm text-foreground/40 py-8 text-center">No available courses found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailable.map((course) => (
                <div key={course.id} className="bg-white border border-border rounded-xl hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-off-white px-2 py-1 rounded-md font-medium text-foreground/60">
                        {course.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-heading font-bold text-primary mb-1">{course.title}</h3>
                    {course.instructor_name && (
                      <p className="text-sm text-foreground/50 mb-2">by {course.instructor_name}</p>
                    )}
                    {course.description && (
                      <p className="text-xs text-foreground/50 mb-4 line-clamp-2">{course.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-foreground/50 mb-4">
                      <span className="flex items-center gap-1"><BookOpen size={12} /> {course.total_lessons || 0} lessons</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> ~{Math.ceil((course.total_lessons || 0) * 0.5)}h</span>
                    </div>

                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                      className="w-full bg-primary-bright text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-bright/90 transition-colors disabled:opacity-60"
                    >
                      {enrollingId === course.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <><Plus size={14} /> Enroll Now</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
