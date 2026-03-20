'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderKanban, Receipt, Video, BarChart3, ArrowUpRight, Loader2 } from 'lucide-react'
import { StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Project = {
  id: string
  title: string
  category: string | null
  status: string
  created_at: string
  deadline: string | null
}

type Payment = {
  id: string
  invoice_number: string | null
  amount: number
  payment_type: string | null
  status: string
  created_at: string
}

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

      const { data: projects } = await supabase
        .from('projects')
        .select('id, title, category, status, created_at, deadline')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
      if (projects) {
        setProjectCount(projects.length)
        setRecentProjects(projects.slice(0, 5))
      }

      const { data: payments } = await supabase
        .from('payments')
        .select('id, invoice_number, amount, payment_type, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (payments) {
        const pending = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + (p.amount || 0), 0)
        setPendingAmount(pending)
        setRecentPayments(payments.slice(0, 5))
      }

      const { count } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .eq('status', 'open')
      setOpenTickets(count || 0)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-navy to-teal p-6 rounded-xl text-white">
        <h2 className="text-xl font-heading font-bold">Welcome back{userName ? `, ${userName}` : ''}!</h2>
        <p className="text-white/70 text-sm mt-1">Track your projects and manage payments seamlessly.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={String(projectCount)} icon={FolderKanban} color="navy" />
        <StatCard label="Pending Payments" value={`₹${pendingAmount.toLocaleString('en-IN')}`} icon={Receipt} color="teal" />
        <StatCard label="Open Tickets" value={String(openTickets)} icon={BarChart3} color="sky" />
        <StatCard label="Sections" value="4" icon={Video} color="mint" />
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
        <DashboardPanel title="Recent Projects" action={<Link href="/dashboard/client/projects" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          {recentProjects.length === 0
            ? <p className="text-sm text-foreground/50 py-4 text-center">No projects yet.</p>
            : <DashboardTable
                headers={['Project', 'Status', 'Deadline']}
                rows={recentProjects.map((p) => [
                  <span key="t" className="font-medium text-primary">{p.title}</span>,
                  <StatusBadge key="s" status={p.status} />,
                  <span key="d" className="text-foreground/50 text-xs">{p.deadline ? new Date(p.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>,
                ])}
              />
          }
        </DashboardPanel>
        <DashboardPanel title="Recent Payments" action={<Link href="/dashboard/client/payments" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
          {recentPayments.length === 0
            ? <p className="text-sm text-foreground/50 py-4 text-center">No payments yet.</p>
            : <DashboardTable
                headers={['Invoice', 'Amount', 'Status']}
                rows={recentPayments.map((p) => [
                  <span key="i" className="font-mono text-xs text-foreground/60">{p.invoice_number || '—'}</span>,
                  <span key="a" className="font-semibold text-primary">₹{p.amount?.toLocaleString('en-IN') || 0}</span>,
                  <StatusBadge key="s" status={p.status} />,
                ])}
              />
          }
        </DashboardPanel>
      </div>
    </div>
  )
}
