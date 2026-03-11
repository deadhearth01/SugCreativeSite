'use client'

import Link from 'next/link'
import { FolderKanban, Receipt, Video, BarChart3, ArrowUpRight } from 'lucide-react'
import { StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'

const projects = [
  ['Brand Strategy Consulting', 'Business Solutions', <StatusBadge key="1" status="In Progress" />, 'Due Jul 15'],
  ['Digital Marketing Campaign', 'Edu Tech', <StatusBadge key="2" status="Active" />, 'Due Aug 01'],
  ['Website Redesign', 'Business Solutions', <StatusBadge key="3" status="Completed" />, 'Delivered'],
]

const invoices = [
  ['INV-2025-034', '₹25,000', 'Jun 01, 2025', <StatusBadge key="1" status="Paid" />],
  ['INV-2025-041', '₹15,000', 'Jun 15, 2025', <StatusBadge key="2" status="Pending" />],
]

export default function ClientDashboard() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-navy to-teal p-6 rounded-xl text-white">
        <h2 className="text-xl font-heading font-bold">Welcome back, Client!</h2>
        <p className="text-white/70 text-sm mt-1">Track your projects and manage payments seamlessly.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Projects" value="2" icon={FolderKanban} color="navy" />
        <StatCard label="Total Spent" value="₹1.2L" change="+₹40K this month" trend="up" icon={Receipt} color="teal" />
        <StatCard label="Upcoming Meetings" value="1" icon={Video} color="sky" />
        <StatCard label="Satisfaction Score" value="98%" icon={BarChart3} color="mint" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Projects', href: '/dashboard/client/projects', icon: FolderKanban },
          { label: 'Payments', href: '/dashboard/client/payments', icon: Receipt },
          { label: 'Meetings', href: '/dashboard/client/meetings', icon: Video },
          { label: 'Reports', href: '/dashboard/client/reports', icon: BarChart3 },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-bright hover:shadow-sm transition-all group">
            <a.icon size={18} className="text-primary-bright" />
            <span className="text-sm font-medium text-primary">{a.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-foreground/30 group-hover:text-primary-bright transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="Active Projects" action={<Link href="/dashboard/client/projects" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          <DashboardTable headers={['Project', 'Category', 'Status', 'Deadline']} rows={projects} />
        </DashboardPanel>
        <DashboardPanel title="Recent Invoices" action={<Link href="/dashboard/client/payments" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          <DashboardTable headers={['Invoice', 'Amount', 'Date', 'Status']} rows={invoices} />
        </DashboardPanel>
      </div>
    </div>
  )
}
