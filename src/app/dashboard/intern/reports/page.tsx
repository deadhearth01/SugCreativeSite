'use client'

import { PageHeader, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Plus } from 'lucide-react'

const reports = [
  { title: 'Week 1 — Onboarding & Orientation', submitted: 'Jun 07, 2025', status: 'Reviewed', feedback: 'Good start!' },
  { title: 'Week 2 — Research & Analysis', submitted: 'Jun 14, 2025', status: 'Reviewed', feedback: 'Nice insights' },
  { title: 'Week 3 — Content Creation', submitted: 'Jun 21, 2025', status: 'Pending', feedback: '—' },
]

export default function InternReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Submit your weekly internship reports"
        action={
          <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            New Report
          </button>
        }
      />
      <div className="bg-white border border-border rounded-xl">
        <DashboardTable headers={['Report', 'Submitted', 'Status', 'Feedback']} rows={reports.map((r) => [
          <span key="t" className="font-medium text-primary text-sm">{r.title}</span>,
          <span key="s" className="text-foreground/50 text-xs">{r.submitted}</span>,
          <StatusBadge key="st" status={r.status === 'Reviewed' ? 'Completed' : r.status} />,
          <span key="f" className="text-foreground/60 text-sm">{r.feedback}</span>,
        ])} />
      </div>
    </div>
  )
}
