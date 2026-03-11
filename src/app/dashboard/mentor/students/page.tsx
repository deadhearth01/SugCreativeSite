'use client'

import { PageHeader, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'

const students = [
  { name: 'Arjun Mehta', course: 'Business Strategy Masterclass', progress: 75, lastActive: '2 hours ago', status: 'Active' },
  { name: 'Sneha Patel', course: 'Digital Marketing Essentials', progress: 30, lastActive: '1 day ago', status: 'Active' },
  { name: 'Karan Joshi', course: 'Resume Building Bootcamp', progress: 45, lastActive: '3 hours ago', status: 'Active' },
  { name: 'Meera Nair', course: 'Business Strategy Masterclass', progress: 90, lastActive: '5 hours ago', status: 'Active' },
  { name: 'Rahul Verma', course: 'Startup Foundation Program', progress: 15, lastActive: '2 days ago', status: 'Active' },
  { name: 'Priya Sharma', course: 'Digital Marketing Essentials', progress: 60, lastActive: '12 hours ago', status: 'Active' },
  { name: 'Vikash Kumar', course: 'Interview Preparation Pro', progress: 0, lastActive: '1 week ago', status: 'Inactive' },
  { name: 'Deepika Rao', course: 'Leadership & Management', progress: 100, lastActive: '3 days ago', status: 'Completed' },
]

export default function MentorStudentsPage() {
  return (
    <div>
      <PageHeader title="My Students" description="Students currently under your mentorship" />

      <div className="bg-white border border-border rounded-xl">
        <DashboardTable
          headers={['Student', 'Course', 'Progress', 'Last Active', 'Status']}
          rows={students.map((s) => [
            <span key="n" className="font-medium text-primary">{s.name}</span>,
            <span key="c" className="text-foreground/60 text-sm">{s.course}</span>,
            <div key="p" className="flex items-center gap-2 min-w-[120px]">
              <div className="flex-1 h-2 bg-off-white">
                <div className="h-full bg-primary-bright rounded-full" style={{ width: `${s.progress}%` }} />
              </div>
              <span className="text-xs font-semibold text-primary">{s.progress}%</span>
            </div>,
            <span key="a" className="text-foreground/50 text-xs">{s.lastActive}</span>,
            <StatusBadge key="s" status={s.status} />,
          ])}
        />
      </div>
    </div>
  )
}
