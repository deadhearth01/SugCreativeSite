'use client'

import { Plus, Pin, Clock } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'

const announcements = [
  {
    title: 'New Career Guidance Program Launching July 1st',
    content: 'We are excited to announce a comprehensive career guidance program designed for fresh graduates. The program includes resume building, mock interviews, and industry mentorship.',
    date: 'Jun 15, 2025',
    author: 'Admin',
    pinned: true,
  },
  {
    title: 'Office Closed — Independence Day',
    content: 'The office will remain closed on August 15, 2025. All scheduled sessions and workshops will be rescheduled accordingly.',
    date: 'Jun 12, 2025',
    author: 'Admin',
    pinned: true,
  },
  {
    title: 'Quarterly Performance Reviews',
    content: 'All employees and interns are requested to complete their self-assessment forms before June 30th. Mentor evaluations due by July 5th.',
    date: 'Jun 10, 2025',
    author: 'Admin',
    pinned: false,
  },
  {
    title: 'Startup Pitch Competition — Registrations Open',
    content: 'Register your startup for the annual SUG Creative Startup Pitch Competition. Top 3 winners will receive funding support and mentorship.',
    date: 'Jun 08, 2025',
    author: 'Admin',
    pinned: false,
  },
  {
    title: 'System Maintenance — June 20',
    content: 'Scheduled system maintenance on June 20th from 2:00 AM to 6:00 AM. Dashboard may be temporarily unavailable.',
    date: 'Jun 05, 2025',
    author: 'Admin',
    pinned: false,
  },
]

export default function AnnouncementsPage() {
  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Broadcast updates to all users"
        action={
          <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            New Announcement
          </button>
        }
      />

      <div className="space-y-4">
        {announcements.map((ann, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {ann.pinned && (
                    <span className="flex items-center gap-1 text-primary-bright text-xs font-semibold">
                      <Pin size={12} />
                      Pinned
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-foreground/40 text-xs">
                    <Clock size={12} />
                    {ann.date}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-bold text-primary mb-2">{ann.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{ann.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
