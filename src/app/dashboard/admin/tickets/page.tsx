'use client'

import { PageHeader, DashboardTable, StatusBadge, StatCard } from '@/components/dashboard/DashboardUI'
import { LifeBuoy, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const tickets = [
  { id: '#1042', subject: 'Payment issue with Business Strategy course', user: 'Arjun Mehta', priority: 'High', status: 'Open', created: 'Jun 15, 2025' },
  { id: '#1041', subject: 'Certificate not generated after completion', user: 'Sneha Patel', priority: 'Medium', status: 'In Progress', created: 'Jun 14, 2025' },
  { id: '#1040', subject: 'Cannot access dashboard on Safari', user: 'Priya Sharma', priority: 'Low', status: 'Resolved', created: 'Jun 13, 2025' },
  { id: '#1039', subject: 'Request for refund — Career Guidance', user: 'Karan Joshi', priority: 'High', status: 'Open', created: 'Jun 12, 2025' },
  { id: '#1038', subject: 'Session recording link broken', user: 'Meera Nair', priority: 'Medium', status: 'In Progress', created: 'Jun 11, 2025' },
  { id: '#1037', subject: 'Profile update not saving', user: 'Vikram Singh', priority: 'Low', status: 'Closed', created: 'Jun 10, 2025' },
  { id: '#1036', subject: 'Need invoice for tax purposes', user: 'Rahul Verma', priority: 'Low', status: 'Resolved', created: 'Jun 09, 2025' },
]

const priorityStyles: Record<string, string> = {
  High: 'text-red-600 font-semibold',
  Medium: 'text-yellow-600 font-semibold',
  Low: 'text-foreground/50',
}

export default function TicketsPage() {
  return (
    <div>
      <PageHeader title="Support & Tickets" description="Manage all support tickets from users" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tickets" value="142" icon={LifeBuoy} color="navy" />
        <StatCard label="Open" value="12" change="Need attention" icon={AlertCircle} color="sky" />
        <StatCard label="In Progress" value="8" icon={Clock} color="teal" />
        <StatCard label="Resolved" value="122" change="This month: 34" icon={CheckCircle} color="mint" />
      </div>

      <div className="bg-white border border-border rounded-xl">
        <DashboardTable
          headers={['ID', 'Subject', 'User', 'Priority', 'Status', 'Created']}
          rows={tickets.map((t) => [
            <span key="i" className="font-mono text-xs text-foreground/60">{t.id}</span>,
            <span key="s" className="font-medium text-primary text-sm">{t.subject}</span>,
            <span key="u" className="text-foreground/60 text-sm">{t.user}</span>,
            <span key="p" className={`text-xs ${priorityStyles[t.priority]}`}>{t.priority}</span>,
            <StatusBadge key="st" status={t.status} />,
            <span key="c" className="text-foreground/50 text-xs">{t.created}</span>,
          ])}
        />
      </div>
    </div>
  )
}
