'use client'

import Link from 'next/link'
import { ClipboardList, FileText, Calendar, BookOpen, Clock, ArrowUpRight } from 'lucide-react'
import { StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'

const tasks = [
  ['Research competitor analysis', 'Medium', <StatusBadge key="1" status="In Progress" />, 'Jun 20'],
  ['Draft blog post — Startup Tips', 'Low', <StatusBadge key="2" status="Pending" />, 'Jun 22'],
  ['Organize client feedback forms', 'High', <StatusBadge key="3" status="Completed" />, 'Jun 15'],
]

const learning = [
  { title: 'Introduction to Business Strategy', progress: 80 },
  { title: 'Effective Communication', progress: 55 },
]

export default function InternDashboard() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-navy to-teal p-6 rounded-xl text-white">
        <h2 className="text-xl font-heading font-bold">Welcome back, Intern!</h2>
        <p className="text-white/70 text-sm mt-1">Keep up the great work! You have 2 tasks due this week.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Tasks" value="5" change="2 pending" icon={ClipboardList} color="navy" />
        <StatCard label="Reports Submitted" value="3" icon={FileText} color="teal" />
        <StatCard label="Attendance" value="92%" icon={Clock} color="mint" />
        <StatCard label="Courses In Progress" value="2" icon={BookOpen} color="sky" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Tasks', href: '/dashboard/intern/tasks', icon: ClipboardList },
          { label: 'Reports', href: '/dashboard/intern/reports', icon: FileText },
          { label: 'Calendar', href: '/dashboard/intern/calendar', icon: Calendar },
          { label: 'Learning', href: '/dashboard/intern/learning', icon: BookOpen },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-bright hover:shadow-sm transition-all group">
            <a.icon size={18} className="text-primary-bright" />
            <span className="text-sm font-medium text-primary">{a.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-foreground/30 group-hover:text-primary-bright transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="My Tasks" action={<Link href="/dashboard/intern/tasks" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          <DashboardTable headers={['Task', 'Priority', 'Status', 'Due']} rows={tasks} />
        </DashboardPanel>

        <DashboardPanel title="Learning Progress">
          <div className="space-y-4">
            {learning.map((l, i) => (
              <div key={i} className="p-3 border border-border/50">
                <p className="text-sm font-medium text-primary mb-2">{l.title}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-off-white"><div className="h-full bg-primary-bright rounded-full" style={{ width: `${l.progress}%` }} /></div>
                  <span className="text-xs font-semibold text-primary">{l.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </div>
  )
}
