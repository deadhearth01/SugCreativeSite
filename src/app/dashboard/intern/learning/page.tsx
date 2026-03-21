'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { BookOpen, ExternalLink, Loader2, GraduationCap, FileText, Link as LinkIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type EnrolledCourse = {
  id: string
  progress_percentage: number | null
  enrolled_at: string
  courses: {
    id: string
    title: string
    description: string | null
    category: string | null
    thumbnail_url: string | null
    total_lessons: number | null
  } | null
}

type MentorResource = {
  id: string
  title: string
  description: string | null
  resource_type: string
  file_url: string | null
  created_at: string
  mentor?: { full_name: string } | null
}

const resourceTypeIcon: Record<string, React.ReactNode> = {
  pdf: <FileText size={16} className="text-red-500" />,
  video: <BookOpen size={16} className="text-blue-500" />,
  article: <FileText size={16} className="text-green-600" />,
  link: <LinkIcon size={16} className="text-primary-bright" />,
  document: <FileText size={16} className="text-foreground/50" />,
}

export default function InternLearningPage() {
  const [loading, setLoading] = useState(true)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [resources, setResources] = useState<MentorResource[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [enrollmentsRes, resourcesRes] = await Promise.all([
        supabase
          .from('enrollments')
          .select('id, progress_percentage, enrolled_at, courses(id, title, description, category, thumbnail_url, total_lessons)')
          .eq('student_id', user.id)
          .order('enrolled_at', { ascending: false }),
        fetch('/api/mentor/resources'),
      ])

      setEnrolledCourses((enrollmentsRes.data as unknown as EnrolledCourse[]) || [])

      if (resourcesRes.ok) {
        const json = await resourcesRes.json()
        setResources((json.data as unknown as MentorResource[]) || [])
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-primary-bright" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Learning" description="Your enrolled courses and mentor resources" />

      {/* Enrolled Courses Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-primary text-lg flex items-center gap-2">
            <GraduationCap size={20} className="text-primary-bright" />
            My Courses
          </h2>
          <span className="text-sm text-foreground/50">{enrolledCourses.length} enrolled</span>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 bg-white border border-border rounded-xl">
            <GraduationCap size={40} className="text-foreground/20" />
            <p className="text-sm text-foreground/40 text-center">No courses enrolled yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((enrollment) => {
              const course = enrollment.courses
              if (!course) return null
              const progress = enrollment.progress_percentage ?? 0
              return (
                <div key={enrollment.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                  {course.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-primary-bright/10 flex items-center justify-center">
                      <GraduationCap size={32} className="text-primary-bright/50" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-primary text-sm line-clamp-2">{course.title}</h3>
                    {course.category && (
                      <span className="inline-block mt-1 text-xs bg-off-white px-2 py-0.5 rounded font-medium text-foreground/60">
                        {course.category}
                      </span>
                    )}
                    {course.description && (
                      <p className="text-xs text-foreground/50 mt-1.5 line-clamp-2">{course.description}</p>
                    )}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground/50">Progress</span>
                        <span className="text-xs font-semibold text-primary">{progress}%</span>
                      </div>
                      <div className="h-2 bg-off-white rounded-full">
                        <div
                          className="h-full bg-primary-bright rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    {course.total_lessons && (
                      <p className="text-xs text-foreground/40 mt-2">{course.total_lessons} lessons</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Mentor Resources Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-primary text-lg flex items-center gap-2">
            <BookOpen size={20} className="text-primary-bright" />
            Mentor Resources
          </h2>
          <span className="text-sm text-foreground/50">{resources.length} available</span>
        </div>

        {resources.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 bg-white border border-border rounded-xl">
            <BookOpen size={40} className="text-foreground/20" />
            <p className="text-sm text-foreground/40 text-center">No resources shared yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => {
              const icon = resourceTypeIcon[resource.resource_type?.toLowerCase()] || <FileText size={16} className="text-foreground/50" />
              const mentor = resource.mentor as { full_name: string } | null
              return (
                <div key={resource.id} className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 bg-off-white rounded-lg flex-shrink-0">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-primary text-sm">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-xs text-foreground/50 mt-0.5 line-clamp-2">{resource.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs bg-off-white px-2 py-0.5 rounded font-medium text-foreground/60 capitalize">
                            {resource.resource_type}
                          </span>
                          {mentor && (
                            <span className="text-xs text-foreground/40">by {mentor.full_name}</span>
                          )}
                          <span className="text-xs text-foreground/40">
                            {new Date(resource.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {resource.file_url && (
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-off-white transition-colors group"
                        title="Open resource"
                      >
                        <ExternalLink size={16} className="text-foreground/30 group-hover:text-primary-bright transition-colors" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
