'use client'

import { useState, useEffect } from 'react'
import { Users, BookOpen, CreditCard, LifeBuoy, Calendar, Video, ArrowUpRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return days < 30 ? `${days}d ago` : new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

type Stats = { totalUsers: number; activeCourses: number; revenue: number; openTickets: number }
type RecentUser = { full_name: string; role: string; status: string; created_at: string }
type RecentTicket = { id: string; subject: string; priority: string; status: string }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeCourses: 0, revenue: 0, openTickets: 0 })
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [usersRes, coursesRes, paymentsRes, ticketsRes, recentUsersRes, recentTicketsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('payments').select('amount').eq('status', 'paid'),
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('profiles').select('full_name, role, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('tickets').select('id, subject, priority, status').order('created_at', { ascending: false }).limit(5),
      ])
      const totalRevenue = (paymentsRes.data || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
      setStats({ totalUsers: usersRes.count || 0, activeCourses: coursesRes.count || 0, revenue: totalRevenue, openTickets: ticketsRes.count || 0 })
      setRecentUsers((recentUsersRes.data || []) as RecentUser[])
      setRecentTickets((recentTicketsRes.data || []) as RecentTicket[])
      setLoading(false)
    }
    load()
  }, [])

  const fmt = (amount: number) => amount >= 100000 ? `₹${(amount / 100000).toFixed(1)}L` : amount >= 1000 ? `₹${(amount / 1000).toFixed(1)}K` : `₹${amount}`

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#35C8E0]" /></div>

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-[#1A9AB5] border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-6">
        <div className="inline-flex items-center gap-2 bg-[#35C8E0] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] mb-3">
          Admin Portal
        </div>
        <h2 className="text-xl font-black text-white">Admin Overview</h2>
        <p className="text-white/60 text-sm font-semibold mt-1">{stats.openTickets > 0 ? `${stats.openTickets} open ticket${stats.openTickets > 1 ? 's' : ''} need attention.` : 'All systems running smoothly.'}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'bg-[#35C8E0]' },
          { label: 'Active Courses', value: String(stats.activeCourses), icon: BookOpen, color: 'bg-emerald-600' },
          { label: 'Revenue', value: fmt(stats.revenue), icon: CreditCard, color: 'bg-purple-600' },
          { label: 'Open Tickets', value: String(stats.openTickets), icon: LifeBuoy, color: stats.openTickets > 0 ? 'bg-red-600' : 'bg-gray-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 ${card.color} border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)]`}>
                <card.icon size={16} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{card.label}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1A9AB5]">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Users', href: '/dashboard/admin/users', icon: Users },
          { label: 'Meetings', href: '/dashboard/admin/meetings', icon: Video },
          { label: 'Courses', href: '/dashboard/admin/courses', icon: BookOpen },
          { label: 'Calendar', href: '/dashboard/admin/calendar', icon: Calendar },
        ].map((action) => (
          <Link key={action.label} href={action.href}
            className="bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] p-4 flex items-center gap-3 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
          >
            <div className="w-8 h-8 bg-[#1A9AB5] border border-black flex items-center justify-center flex-shrink-0">
              <action.icon size={15} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-wide text-[#1A9AB5]">{action.label}</span>
            <ArrowUpRight size={13} className="ml-auto text-foreground/30 group-hover:text-[#35C8E0] transition-colors" />
          </Link>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-[#1A9AB5]">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Recent Registrations</h3>
            <Link href="/dashboard/admin/users" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-foreground/40 py-8 text-center font-semibold">No users yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F4F6FA] border-b-2 border-black">
                {['Name', 'Role', 'Joined', 'Status'].map(h => <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest">{h}</th>)}
              </tr></thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={i} className="border-b border-black/8 hover:bg-[#F4F6FA]">
                    <td className="py-3 px-4 font-bold text-[#1A9AB5] text-xs">{u.full_name}</td>
                    <td className="py-3 px-4 text-xs font-semibold capitalize text-foreground/60">{u.role}</td>
                    <td className="py-3 px-4 text-xs text-foreground/50">{timeAgo(u.created_at)}</td>
                    <td className="py-3 px-4"><StatusBadge status={u.status || 'active'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Tickets */}
        <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-[#1A9AB5]">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Support Tickets</h3>
            <Link href="/dashboard/admin/tickets" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          {recentTickets.length === 0 ? (
            <p className="text-sm text-foreground/40 py-8 text-center font-semibold">No tickets yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F4F6FA] border-b-2 border-black">
                {['Subject', 'Priority', 'Status'].map(h => <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest">{h}</th>)}
              </tr></thead>
              <tbody>
                {recentTickets.map((t, i) => (
                  <tr key={i} className="border-b border-black/8 hover:bg-[#F4F6FA]">
                    <td className="py-3 px-4 font-bold text-[#1A9AB5] text-xs truncate max-w-40">{t.subject}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border-2 ${t.priority === 'urgent' ? 'bg-red-100 text-red-700 border-red-400' : t.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-400' : t.priority === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-400' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
