'use client'

import Link from 'next/link'
import { UserCheck, Video, Calendar, CreditCard, ArrowUpRight, Clock, Star } from 'lucide-react'
import { StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'

const students = [
  ['Arjun Mehta', 'Business Strategy', '75%', <StatusBadge key="1" status="Active" />],
  ['Sneha Patel', 'Digital Marketing', '30%', <StatusBadge key="2" status="Active" />],
  ['Karan Joshi', 'Resume Building', '45%', <StatusBadge key="3" status="Active" />],
]

const sessions = [
  ['Career Counseling', 'Arjun Mehta', 'Jun 18, 2:00 PM', <StatusBadge key="1" status="Scheduled" />],
  ['Mock Interview', 'Sneha Patel', 'Jun 22, 11:00 AM', <StatusBadge key="2" status="Scheduled" />],
]

export default function MentorDashboard() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-navy to-teal p-6 rounded-xl text-white">
        <h2 className="text-xl font-heading font-bold">Welcome back, Mentor!</h2>
        <p className="text-white/70 text-sm mt-1">You have 2 upcoming sessions this week.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Students" value="8" change="+2 this month" trend="up" icon={UserCheck} color="navy" />
        <StatCard label="Sessions This Month" value="12" icon={Video} color="teal" />
        <StatCard label="Avg. Rating" value="4.8" icon={Star} color="mint" />
        <StatCard label="Earnings (MTD)" value="₹24,000" change="+₹6K" trend="up" icon={CreditCard} color="sky" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Students', href: '/dashboard/mentor/students', icon: UserCheck },
          { label: 'Sessions', href: '/dashboard/mentor/sessions', icon: Video },
          { label: 'Calendar', href: '/dashboard/mentor/calendar', icon: Calendar },
          { label: 'Earnings', href: '/dashboard/mentor/earnings', icon: CreditCard },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-bright hover:shadow-sm transition-all group">
            <a.icon size={18} className="text-primary-bright" />
            <span className="text-sm font-medium text-primary">{a.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-foreground/30 group-hover:text-primary-bright transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="My Students" action={<Link href="/dashboard/mentor/students" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          <DashboardTable headers={['Student', 'Course', 'Progress', 'Status']} rows={students} />
        </DashboardPanel>
        <DashboardPanel title="Upcoming Sessions" action={<Link href="/dashboard/mentor/sessions" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          <DashboardTable headers={['Session', 'Student', 'Date & Time', 'Status']} rows={sessions} />
        </DashboardPanel>
      </div>
    </div>
  )
}
