'use client'

import Link from 'next/link'
import { GraduationCap, FileText, Video, Calendar, Award, ArrowUpRight, BookOpen, Clock } from 'lucide-react'
import { StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'

const enrolledCourses = [
  ['Business Strategy Masterclass', '75%', <StatusBadge key="1" status="In Progress" />, '12 lessons left'],
  ['Resume Building Bootcamp', '100%', <StatusBadge key="2" status="Completed" />, 'Certificate ready'],
  ['Digital Marketing Essentials', '30%', <StatusBadge key="3" status="In Progress" />, '18 lessons left'],
]

const upcomingMeetings = [
  ['Career Counseling Session', 'Vikram Singh', 'Jun 18, 2:00 PM', <StatusBadge key="1" status="Scheduled" />],
  ['Mock Interview', 'Anita Desai', 'Jun 22, 11:00 AM', <StatusBadge key="2" status="Scheduled" />],
]

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-navy to-teal p-6 rounded-xl text-white">
        <h2 className="text-xl font-heading font-bold">Welcome back, Student!</h2>
        <p className="text-white/70 text-sm mt-1">Continue your learning journey. You have 2 courses in progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Enrolled Courses" value="3" icon={GraduationCap} color="navy" />
        <StatCard label="Completed" value="1" change="33% completion rate" icon={Award} color="teal" />
        <StatCard label="Upcoming Meetings" value="2" icon={Video} color="sky" />
        <StatCard label="Hours Studied" value="48" change="+6 this week" trend="up" icon={Clock} color="mint" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Courses', href: '/dashboard/student/courses', icon: GraduationCap },
          { label: 'Resume Builder', href: '/dashboard/student/resume', icon: FileText },
          { label: 'Book Meeting', href: '/dashboard/student/meetings', icon: Video },
          { label: 'Calendar', href: '/dashboard/student/calendar', icon: Calendar },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-bright hover:shadow-sm transition-all group"
          >
            <a.icon size={18} className="text-primary-bright" />
            <span className="text-sm font-medium text-primary">{a.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-foreground/30 group-hover:text-primary-bright transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel
          title="My Courses"
          action={<Link href="/dashboard/student/courses" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}
        >
          <DashboardTable
            headers={['Course', 'Progress', 'Status', 'Remaining']}
            rows={enrolledCourses}
          />
        </DashboardPanel>

        <DashboardPanel
          title="Upcoming Meetings"
          action={<Link href="/dashboard/student/meetings" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}
        >
          <DashboardTable
            headers={['Session', 'Mentor', 'Date & Time', 'Status']}
            rows={upcomingMeetings}
          />
        </DashboardPanel>
      </div>
    </div>
  )
}
