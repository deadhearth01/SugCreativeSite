'use client'

import { PageHeader } from '@/components/dashboard/DashboardUI'
import { BookOpen, FileText, Video, ExternalLink } from 'lucide-react'

const resources = [
  { title: 'Mentoring Best Practices Guide', type: 'PDF', icon: FileText, category: 'Guide' },
  { title: 'Effective Communication in Mentoring', type: 'Video', icon: Video, category: 'Training' },
  { title: 'Student Assessment Templates', type: 'Document', icon: FileText, category: 'Template' },
  { title: 'Career Counseling Framework', type: 'PDF', icon: BookOpen, category: 'Guide' },
  { title: 'Mock Interview Question Bank', type: 'Document', icon: FileText, category: 'Template' },
  { title: 'Feedback & Evaluation Forms', type: 'Document', icon: FileText, category: 'Template' },
]

export default function MentorResourcesPage() {
  return (
    <div>
      <PageHeader title="Resources" description="Materials to help you mentor effectively" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((r, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow group cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-primary-bright/10 flex items-center justify-center">
                <r.icon size={18} className="text-primary-bright" />
              </div>
              <ExternalLink size={14} className="text-foreground/20 group-hover:text-primary-bright transition-colors" />
            </div>
            <h3 className="font-medium text-primary text-sm mb-1">{r.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-off-white px-2 py-0.5 font-medium text-foreground/60">{r.type}</span>
              <span className="text-xs text-foreground/40">{r.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
