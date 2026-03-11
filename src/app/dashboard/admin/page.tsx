'use client'

import { useState, useEffect, ReactNode } from 'react'
import {
  Users,
  BookOpen,
  CreditCard,
  LifeBuoy,
  Calendar,
  Video,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

type Stats = {
  totalUsers: number
  activeCourses: number
  revenue: number
  openTickets: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeCourses: 0, revenue: 0, openTickets: 0 })
  const [recentUsers, setRecentUsers] = useState<ReactNode[][]>([])
  const [recentTickets, setRecentTickets] = useState<ReactNode[][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      // Fetch stats in parallel
      const [usersRes, coursesRes, paymentsRes, ticketsRes, recentUsersRes, recentTicketsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('payments').select('amount').eq('status', 'paid'),
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('profiles').select('full_name, role, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('tickets').select('id, subject, priority, status').order('created_at', { ascending: false }).limit(5),
      ])

      const totalRevenue = (paymentsRes.data || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

      setStats({
        totalUsers: usersRes.count || 0,
        activeCourses: coursesRes.count || 0,
        revenue: totalRevenue,
        openTickets: ticketsRes.count || 0,
      })

      setRecentUsers(
        (recentUsersRes.data || []).map((u, i) => [
          u.full_name,
          u.role?.charAt(0).toUpperCase() + u.role?.slice(1),
          timeAgo(u.created_at),
          <StatusBadge key={i} status={u.status || 'active'} />,
        ])
      )

      setRecentTickets(
        (recentTicketsRes.data || []).map((t, i) => [
          `#${String(t.id).slice(0, 6)}`,
          t.subject,
          t.priority?.charAt(0).toUpperCase() + t.priority?.slice(1),
          <StatusBadge key={i} status={t.status || 'open'} />,
        ])
      )

      setLoading(false)
    }
    load()
  }, [])

  const formatRevenue = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-primary-bright" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} change="All registered" trend="up" icon={Users} color="navy" />
        <StatCard label="Active Courses" value={String(stats.activeCourses)} change="Currently active" trend="up" icon={BookOpen} color="teal" />
        <StatCard label="Revenue" value={formatRevenue(stats.revenue)} change="Total paid" trend="up" icon={CreditCard} color="mint" />
        <StatCard label="Open Tickets" value={String(stats.openTickets)} change="Need attention" trend={stats.openTickets > 0 ? 'up' : 'down'} icon={LifeBuoy} color="sky" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Add User', href: '/dashboard/admin/users', icon: Users },
          { label: 'Meetings', href: '/dashboard/admin/meetings', icon: Video },
          { label: 'New Course', href: '/dashboard/admin/courses', icon: BookOpen },
          { label: 'View Calendar', href: '/dashboard/admin/calendar', icon: Calendar },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-bright hover:shadow-sm transition-all group"
          >
            <action.icon size={18} className="text-primary-bright" />
            <span className="text-sm font-medium text-primary">{action.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-foreground/30 group-hover:text-primary-bright transition-colors" />
          </Link>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel
          title="Recent Registrations"
          action={
            <Link href="/dashboard/admin/users" className="text-xs text-primary-bright font-semibold hover:underline">
              View All
            </Link>
          }
        >
          {recentUsers.length > 0 ? (
            <DashboardTable headers={['Name', 'Role', 'Joined', 'Status']} rows={recentUsers} />
          ) : (
            <p className="text-sm text-foreground/40 py-8 text-center">No users yet</p>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Support Tickets"
          action={
            <Link href="/dashboard/admin/tickets" className="text-xs text-primary-bright font-semibold hover:underline">
              View All
            </Link>
          }
        >
          {recentTickets.length > 0 ? (
            <DashboardTable headers={['ID', 'Subject', 'Priority', 'Status']} rows={recentTickets} />
          ) : (
            <p className="text-sm text-foreground/40 py-8 text-center">No tickets yet</p>
          )}
        </DashboardPanel>
      </div>
    </div>
  )
}
