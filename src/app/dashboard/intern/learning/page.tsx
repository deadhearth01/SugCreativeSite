'use client'

import { PageHeader } from '@/components/dashboard/DashboardUI'
import { BookOpen, Play, ExternalLink } from 'lucide-react'

const courses = [
  { title: 'Introduction to Business Strategy', progress: 80, lessons: 10, category: 'Business' },
  { title: 'Effective Communication', progress: 55, lessons: 8, category: 'Soft Skills' },
  { title: 'Microsoft Office Essentials', progress: 100, lessons: 12, category: 'Technical' },
]

const resources = [
  { title: 'Intern Handbook', type: 'PDF' },
  { title: 'Company Policies & Guidelines', type: 'Document' },
  { title: 'Workplace Etiquette Guide', type: 'Video' },
]

export default function InternLearningPage() {
  return (
    <div>
      <PageHeader title="Learning" description="Courses and resources for your development" />

      <h3 className="font-heading font-bold text-primary mb-4">My Courses</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {courses.map((c, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs bg-off-white px-2 py-1 rounded-md font-medium text-foreground/60">{c.category}</span>
              <span className={`text-xs font-semibold ${c.progress === 100 ? 'text-green-600' : 'text-primary-bright'}`}>{c.progress}%</span>
            </div>
            <h3 className="font-heading font-bold text-primary mb-2 text-sm">{c.title}</h3>
            <p className="text-xs text-foreground/50 mb-3">{c.lessons} lessons</p>
            <div className="w-full h-2 bg-off-white mb-4"><div className="h-full bg-primary-bright rounded-full" style={{ width: `${c.progress}%` }} /></div>
            <button className="w-full bg-primary text-white py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              <Play size={14} /> {c.progress === 100 ? 'Review' : 'Continue'}
            </button>
          </div>
        ))}
      </div>

      <h3 className="font-heading font-bold text-primary mb-4">Resources</h3>
      <div className="space-y-3">
        {resources.map((r, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer group">
            <div className="flex items-center gap-3">
              <BookOpen size={16} className="text-primary-bright" />
              <div>
                <p className="text-sm font-medium text-primary">{r.title}</p>
                <p className="text-xs text-foreground/40">{r.type}</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-foreground/20 group-hover:text-primary-bright transition-colors" />
          </div>
        ))}
      </div>
    </div>
  )
}
