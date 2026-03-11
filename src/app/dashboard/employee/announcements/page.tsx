'use client'

import { PageHeader } from '@/components/dashboard/DashboardUI'
import { Pin, Clock } from 'lucide-react'

const announcements = [
  { title: 'Quarterly Performance Reviews Due June 30', content: 'Complete self-assessments before the deadline.', date: 'Jun 10, 2025', pinned: true },
  { title: 'Office Closed — Independence Day', content: 'The office is closed on August 15, 2025.', date: 'Jun 12, 2025', pinned: true },
  { title: 'New Course Launch — Public Speaking Workshop', content: 'Registrations open for the upcoming workshop.', date: 'Jun 08, 2025', pinned: false },
  { title: 'System Maintenance Notice', content: 'Scheduled maintenance on June 20 from 2-6 AM.', date: 'Jun 05, 2025', pinned: false },
]

export default function EmployeeAnnouncementsPage() {
  return (
    <div>
      <PageHeader title="Announcements" description="Company-wide updates and notices" />
      <div className="space-y-4">
        {announcements.map((a, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              {a.pinned && <span className="flex items-center gap-1 text-primary-bright text-xs font-semibold"><Pin size={12} /> Pinned</span>}
              <span className="flex items-center gap-1 text-foreground/40 text-xs"><Clock size={12} /> {a.date}</span>
            </div>
            <h3 className="font-heading font-bold text-primary mb-1">{a.title}</h3>
            <p className="text-sm text-foreground/60">{a.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
