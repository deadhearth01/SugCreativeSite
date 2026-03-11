'use client'

import { PageHeader, DashboardPanel, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Play, Clock, Award, BookOpen } from 'lucide-react'

const courses = [
  {
    title: 'Business Strategy Masterclass',
    instructor: 'Vikram Singh',
    progress: 75,
    lessons: 24,
    completed: 18,
    status: 'In Progress',
    category: 'Business Solutions',
  },
  {
    title: 'Resume Building Bootcamp',
    instructor: 'Anita Desai',
    progress: 100,
    lessons: 12,
    completed: 12,
    status: 'Completed',
    category: 'Career Guidance',
  },
  {
    title: 'Digital Marketing Essentials',
    instructor: 'Priya Sharma',
    progress: 30,
    lessons: 20,
    completed: 6,
    status: 'In Progress',
    category: 'Edu Tech',
  },
]

export default function StudentCoursesPage() {
  return (
    <div>
      <PageHeader title="Training Courses" description="Your enrolled courses and learning progress" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <div key={i} className="bg-white border border-border rounded-xl hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-off-white px-2 py-1 rounded-md font-medium text-foreground/60">
                  {course.category}
                </span>
                <StatusBadge status={course.status} />
              </div>
              <h3 className="text-lg font-heading font-bold text-primary mb-1">{course.title}</h3>
              <p className="text-sm text-foreground/50 mb-4">by {course.instructor}</p>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground/60">{course.completed}/{course.lessons} lessons</span>
                  <span className="font-semibold text-primary">{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-off-white rounded-full">
                  <div
                    className="h-full bg-primary-bright rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-foreground/50 mb-4">
                <span className="flex items-center gap-1"><BookOpen size={12} /> {course.lessons} lessons</span>
                <span className="flex items-center gap-1"><Clock size={12} /> ~{Math.ceil(course.lessons * 0.5)}h</span>
              </div>

              <button className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                {course.progress === 100 ? (
                  <><Award size={14} /> View Certificate</>
                ) : (
                  <><Play size={14} /> Continue Learning</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
