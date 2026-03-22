'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderKanban, Receipt, Video, BarChart3, ArrowUpRight, Loader2 } from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Project = { id: string; title: string; category: string | null; status: string; created_at: string; deadline: string | null }
type Payment = { id: string; invoice_number: string | null; amount: number; payment_type: string | null; status: string; created_at: string }

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [projectCount, setProjectCount] = useState(0)
  const [pendingAmount, setPendingAmount] = useState(0)
  const [openTickets, setOpenTickets] = useState(0)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (profile) setUserName(profile.full_name || '')
      const { data: projects } = await supabase.from('projects').select('id, title, category, status, created_at, deadline').eq('client_id', user.id).order('created_at', { ascending: false })
      if (projects) { setProjectCount(projects.length); setRecentProjects(projects.slice(0, 5)) }
      const { data: payments } = await supabase.from('payments').select('id, invoice_number, amount, payment_type, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
      if (payments) { setPendingAmount(payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + (p.amount || 0), 0)); setRecentPayments(payments.slice(0, 5)) }
      const { count } = await supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('created_by', user.id).eq('status', 'open')
      setOpenTickets(count || 0)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#045184]" /></div>

  return (
    <div className="space-y-6">
      <div className="bg-[#022A4A] border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-6">
        <div className="inline-flex items-center gap-2 bg-[#045184] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] mb-3">Client Portal</div>
        <h2 className="text-xl font-black text-white">Welcome back{userName ? `, ${userName}` : ''}!</h2>
        <p className="text-white/60 text-sm font-semibold mt-1">Track your projects and manage payments seamlessly.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: String(projectCount), icon: FolderKanban, color: 'bg-[#045184]' },
          { label: 'Pending Payments', value: `₹${pendingAmount.toLocaleString('en-IN')}`, icon: Receipt, color: 'bg-amber-500' },
          { label: 'Open Tickets', value: String(openTickets), icon: BarChart3, color: openTickets > 0 ? 'bg-red-600' : 'bg-gray-500' },
          { label: 'Quick Links', value: '4', icon: Video, color: 'bg-emerald-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 ${card.color} border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)]`}>
                <card.icon size={16} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50 leading-tight">{card.label}</span>
            </div>
            <div className="text-2xl font-black text-[#022A4A]">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Projects', href: '/dashboard/client/projects', icon: FolderKanban },
          { label: 'Payments', href: '/dashboard/client/payments', icon: Receipt },
          { label: 'Meetings', href: '/dashboard/client/meetings', icon: Video },
          { label: 'Reports', href: '/dashboard/client/reports', icon: BarChart3 },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] p-4 flex items-center gap-3 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
            <div className="w-8 h-8 bg-[#022A4A] border border-black flex items-center justify-center flex-shrink-0"><a.icon size={15} className="text-white" /></div>
            <span className="text-xs font-black uppercase tracking-wide text-[#022A4A]">{a.label}</span>
            <ArrowUpRight size={13} className="ml-auto text-foreground/30 group-hover:text-[#045184] transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-[#022A4A]">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Recent Projects</h3>
            <Link href="/dashboard/client/projects" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1">View All <ArrowUpRight size={12} /></Link>
          </div>
          {recentProjects.length === 0 ? <p className="text-sm text-foreground/50 py-8 text-center font-semibold">No projects yet.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F4F6FA] border-b-2 border-black">{['Project', 'Status', 'Deadline'].map(h => <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest">{h}</th>)}</tr></thead>
              <tbody>{recentProjects.map((p, i) => (
                <tr key={i} className="border-b border-black/8 hover:bg-[#F4F6FA]">
                  <td className="py-3 px-4 font-bold text-[#022A4A] text-xs">{p.title}</td>
                  <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                  <td className="py-3 px-4 text-xs text-foreground/50">{p.deadline ? new Date(p.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-[#022A4A]">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Recent Payments</h3>
            <Link href="/dashboard/client/payments" className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1">View All <ArrowUpRight size={12} /></Link>
          </div>
          {recentPayments.length === 0 ? <p className="text-sm text-foreground/50 py-8 text-center font-semibold">No payments yet.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F4F6FA] border-b-2 border-black">{['Invoice', 'Amount', 'Status'].map(h => <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest">{h}</th>)}</tr></thead>
              <tbody>{recentPayments.map((p, i) => (
                <tr key={i} className="border-b border-black/8 hover:bg-[#F4F6FA]">
                  <td className="py-3 px-4 font-mono text-xs text-foreground/50">{p.invoice_number || '—'}</td>
                  <td className="py-3 px-4 font-black text-[#022A4A] text-sm">₹{p.amount?.toLocaleString('en-IN') || 0}</td>
                  <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
