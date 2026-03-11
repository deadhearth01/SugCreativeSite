'use client'

import { PageHeader, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'

const tasks = [
  { task: 'Update course content — Business Strategy', priority: 'High', status: 'In Progress', due: 'Jun 20, 2025', assigned: 'Jun 10' },
  { task: 'Review student submissions (batch 12)', priority: 'Medium', status: 'Pending', due: 'Jun 18, 2025', assigned: 'Jun 12' },
  { task: 'Prepare workshop materials — Resume Building', priority: 'Low', status: 'Completed', due: 'Jun 15, 2025', assigned: 'Jun 08' },
  { task: 'Create assessment for Digital Marketing course', priority: 'High', status: 'Pending', due: 'Jun 22, 2025', assigned: 'Jun 14' },
  { task: 'Coordinate with mentors for July schedule', priority: 'Medium', status: 'In Progress', due: 'Jun 25, 2025', assigned: 'Jun 15' },
]

const priorityStyles: Record<string, string> = {
  High: 'text-red-600 font-semibold', Medium: 'text-yellow-600 font-semibold', Low: 'text-foreground/50',
}

export default function EmployeeTasksPage() {
  return (
    <div>
      <PageHeader title="My Tasks" description="Your assigned tasks and deadlines" />
      <div className="bg-white border border-border rounded-xl">
        <DashboardTable headers={['Task', 'Priority', 'Status', 'Due Date', 'Assigned']} rows={tasks.map((t) => [
          <span key="t" className="font-medium text-primary text-sm">{t.task}</span>,
          <span key="p" className={`text-xs ${priorityStyles[t.priority]}`}>{t.priority}</span>,
          <StatusBadge key="s" status={t.status} />,
          <span key="d" className="text-foreground/50 text-xs">{t.due}</span>,
          <span key="a" className="text-foreground/40 text-xs">{t.assigned}</span>,
        ])} />
      </div>
    </div>
  )
}
