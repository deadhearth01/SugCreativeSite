'use client'

import { PageHeader, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'

const tickets = [
  { id: '#E-301', subject: 'Student cannot access course material', from: 'Arjun Mehta', status: 'Open', created: 'Jun 15, 2025' },
  { id: '#E-298', subject: 'Payment gateway error reported', from: 'Meera Nair', status: 'In Progress', created: 'Jun 13, 2025' },
  { id: '#E-295', subject: 'Certificate template issue', from: 'Sneha Patel', status: 'Resolved', created: 'Jun 10, 2025' },
]

export default function EmployeeTicketsPage() {
  return (
    <div>
      <PageHeader title="Support Tickets" description="Tickets assigned to you for resolution" />
      <div className="bg-white border border-border rounded-xl">
        <DashboardTable headers={['ID', 'Subject', 'From', 'Status', 'Created']} rows={tickets.map((t) => [
          <span key="i" className="font-mono text-xs text-foreground/60">{t.id}</span>,
          <span key="s" className="font-medium text-primary text-sm">{t.subject}</span>,
          <span key="f" className="text-foreground/60">{t.from}</span>,
          <StatusBadge key="st" status={t.status} />,
          <span key="c" className="text-foreground/50 text-xs">{t.created}</span>,
        ])} />
      </div>
    </div>
  )
}
