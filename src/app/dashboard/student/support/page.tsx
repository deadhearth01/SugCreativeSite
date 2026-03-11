'use client'

import { PageHeader, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Plus } from 'lucide-react'

const tickets = [
  { id: '#T-201', subject: 'Cannot download certificate', status: 'Open', created: 'Jun 14, 2025' },
  { id: '#T-198', subject: 'Video not loading in Lesson 8', status: 'Resolved', created: 'Jun 10, 2025' },
]

export default function StudentSupportPage() {
  return (
    <div>
      <PageHeader
        title="Support"
        description="Get help with your account or courses"
        action={
          <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            New Ticket
          </button>
        }
      />
      <div className="bg-white border border-border rounded-xl">
        <DashboardTable headers={['ID', 'Subject', 'Status', 'Created']} rows={tickets.map((t) => [
          <span key="i" className="font-mono text-xs text-foreground/60">{t.id}</span>,
          <span key="s" className="font-medium text-primary">{t.subject}</span>,
          <StatusBadge key="st" status={t.status} />,
          <span key="c" className="text-foreground/50 text-xs">{t.created}</span>,
        ])} />
      </div>
    </div>
  )
}
