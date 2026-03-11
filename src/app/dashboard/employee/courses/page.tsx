'use client'

import { PageHeader } from '@/components/dashboard/DashboardUI'
import { BookOpen, Play, Award } from 'lucide-react'

const courses = [
  { title: 'Advanced Communication Skills', progress: 60, lessons: 12, status: 'In Progress' },
  { title: 'Team Leadership Fundamentals', progress: 100, lessons: 8, status: 'Completed' },
  { title: 'Customer Service Excellence', progress: 15, lessons: 10, status: 'In Progress' },
]

export default function EmployeeCoursesPage() {
  return (
    <div>
      <PageHeader title="Courses" description="Internal training courses assigned to you" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <BookOpen size={18} className="text-primary-bright" />
              <span className={`text-xs font-semibold px-2 py-1 ${c.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-sky/20 text-primary-bright'}`}>{c.status}</span>
            </div>
            <h3 className="font-heading font-bold text-primary mb-2">{c.title}</h3>
            <p className="text-xs text-foreground/50 mb-3">{c.lessons} lessons</p>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1"><span className="text-foreground/50">Progress</span><span className="font-semibold text-primary">{c.progress}%</span></div>
              <div className="w-full h-2 bg-off-white rounded-full"><div className="h-full bg-primary-bright rounded-full" style={{ width: `${c.progress}%` }} /></div>
            </div>
            <button className="w-full bg-primary text-white py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              {c.progress === 100 ? <><Award size={14} /> View Certificate</> : <><Play size={14} /> Continue</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
