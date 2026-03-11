'use client'

import Link from 'next/link'
import { ClipboardList, LifeBuoy, Calendar, Megaphone, Clock, ArrowUpRight, BookOpen } from 'lucide-react'
import { StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'

const tasks = [
  ['Update course content — Business Strategy', 'High', <StatusBadge key="1" status="In Progress" />, 'Jun 20'],
  ['Review student submissions', 'Medium', <StatusBadge key="2" status="Pending" />, 'Jun 18'],
  ['Prepare workshop materials', 'Low', <StatusBadge key="3" status="Completed" />, 'Jun 15'],
]

const announcements = [
  { title: 'Quarterly Review Meeting', date: 'Jun 20, 3:00 PM' },
  { title: 'New Course Launch — Public Speaking', date: 'Jul 01' },
]

export default function EmployeeDashboard() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-navy to-teal p-6 rounded-xl text-white">
        <h2 className="text-xl font-heading font-bold">Welcome back, Employee!</h2>
        <p className="text-white/70 text-sm mt-1">You have 2 tasks pending and 1 ticket assigned.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Tasks" value="5" change="2 pending" icon={ClipboardList} color="navy" />
        <StatCard label="Assigned Tickets" value="3" icon={LifeBuoy} color="teal" />
        <StatCard label="Attendance" value="95%" change="This month" icon={Clock} color="mint" />
        <StatCard label="Courses Managed" value="4" icon={BookOpen} color="sky" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Tasks', href: '/dashboard/employee/tasks', icon: ClipboardList },
          { label: 'Tickets', href: '/dashboard/employee/tickets', icon: LifeBuoy },
          { label: 'Calendar', href: '/dashboard/employee/calendar', icon: Calendar },
          { label: 'Attendance', href: '/dashboard/employee/attendance', icon: Clock },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-bright hover:shadow-sm transition-all group">
            <a.icon size={18} className="text-primary-bright" />
            <span className="text-sm font-medium text-primary">{a.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-foreground/30 group-hover:text-primary-bright transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="My Tasks" action={<Link href="/dashboard/employee/tasks" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          <DashboardTable headers={['Task', 'Priority', 'Status', 'Due']} rows={tasks} />
        </DashboardPanel>

        <DashboardPanel title="Announcements">
          <div className="space-y-3">
            {announcements.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-border/50 hover:bg-off-white/50 transition-colors">
                <Megaphone size={16} className="text-primary-bright flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary">{a.title}</p>
                  <p className="text-xs text-foreground/50">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </div>
  )
}
