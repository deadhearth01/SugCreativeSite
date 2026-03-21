'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { BookOpen, Play, Award, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Enrollment = {
  id: string
  student_id: string
  course_id: string
  progress: number | null
  enrolled_at: string
  course: {
    title: string
    category: string | null
    price: number | null
    status: string
  } | null
}

type Course = {
  id: string
  title: string
  category: string | null
  price: number | null
  status: string
  description: string | null
}

type Toast = { message: string; type: 'success' | 'error' }

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function EmployeeCoursesPage() {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [enrollmentsRes, coursesRes] = await Promise.all([
      supabase
        .from('enrollments')
        .select('*, course:course_id(title, category, price, status)')
        .eq('student_id', user.id),
      supabase
        .from('courses')
        .select('*')
        .eq('status', 'active'),
    ])

    const myEnrollments = (enrollmentsRes.data as unknown as Enrollment[]) || []
    const allCourses = (coursesRes.data as unknown as Course[]) || []
    const enrolledCourseIds = new Set(myEnrollments.map((e) => e.course_id))

    setEnrollments(myEnrollments)
    setAvailableCourses(allCourses.filter((c) => !enrolledCourseIds.has(c.id)))
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId)
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        showToast('Enrolled successfully!', 'success')
        await fetchData()
      } else {
        showToast('Failed to enroll.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
    } finally {
      setEnrollingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-primary-bright" />
      </div>
    )
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader title="Courses" description="Internal training courses and your enrollments" />

      {enrollments.length > 0 && (
        <>
          <h3 className="font-heading font-bold text-primary mb-4">My Enrolled Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {enrollments.map((e) => {
              const progress = e.progress ?? 0
              return (
                <div key={e.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <BookOpen size={18} className="text-primary-bright" />
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${progress === 100 ? 'bg-green-100 text-green-700' : 'bg-sky/20 text-primary-bright'}`}>
                      {progress === 100 ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-primary mb-2">{e.course?.title || 'Course'}</h3>
                  {e.course?.category && (
                    <p className="text-xs text-foreground/50 mb-3">{e.course.category}</p>
                  )}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground/50">Progress</span>
                      <span className="font-semibold text-primary">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-off-white rounded-full">
                      <div className="h-full bg-primary-bright rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <button className="w-full bg-primary text-white py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors rounded-lg">
                    {progress === 100 ? <><Award size={14} /> View Certificate</> : <><Play size={14} /> Continue</>}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {availableCourses.length > 0 && (
        <>
          <h3 className="font-heading font-bold text-primary mb-4">Available Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((c) => (
              <div key={c.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <BookOpen size={18} className="text-primary-bright" />
                  {c.category && (
                    <span className="text-xs bg-off-white px-2 py-1 rounded-md font-medium text-foreground/60">{c.category}</span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-primary mb-2">{c.title}</h3>
                {c.description && (
                  <p className="text-xs text-foreground/50 mb-4 line-clamp-2">{c.description}</p>
                )}
                <button
                  onClick={() => handleEnroll(c.id)}
                  disabled={enrollingId === c.id}
                  className="w-full bg-primary text-white py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors rounded-lg disabled:opacity-60"
                >
                  {enrollingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  Enroll
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {enrollments.length === 0 && availableCourses.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3">
          <BookOpen size={40} className="text-foreground/20" />
          <p className="text-sm text-foreground/40 text-center">No courses available</p>
        </div>
      )}
    </div>
  )
}
