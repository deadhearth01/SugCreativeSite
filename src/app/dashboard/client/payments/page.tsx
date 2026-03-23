'use client'

import { useEffect, useState } from 'react'
import { PageHeader, DashboardTable, StatusBadge, StatCard } from '@/components/dashboard/DashboardUI'
import { CreditCard, Receipt, ArrowDownRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Payment = {
  id: string
  invoice_number: string | null
  amount: number
  payment_type: string | null
  status: string
  created_at: string
}

const STATUS_FILTERS = ['all', 'paid', 'pending', 'overdue'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

export default function ClientPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setPayments(data)
      setLoading(false)
    }
    load()
  }, [])

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + (p.amount || 0), 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + (p.amount || 0), 0)
  const now = new Date()
  const thisMonth = payments.filter(p => {
    const d = new Date(p.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((acc, p) => acc + (p.amount || 0), 0)

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>

  return (
    <div>
      <PageHeader title="Invoices & Payments" description="View and manage your invoices" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Paid" value={`₹${totalPaid.toLocaleString('en-IN')}`} icon={CreditCard} color="navy" />
        <StatCard label="Pending" value={`₹${totalPending.toLocaleString('en-IN')}`} icon={Receipt} color="sky" />
        <StatCard label="This Month" value={`₹${thisMonth.toLocaleString('en-IN')}`} icon={ArrowDownRight} color="teal" />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === s ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/60 hover:border-[#35C8E0] hover:text-primary'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl">
        {filtered.length === 0 ? (
          <p className="text-sm text-foreground/50 py-10 text-center">No payments found.</p>
        ) : (
          <DashboardTable
            headers={['Invoice', 'Amount', 'Type', 'Date', 'Status']}
            rows={filtered.map((inv) => [
              <span key="i" className="font-mono text-xs text-foreground/60">{inv.invoice_number || '—'}</span>,
              <span key="a" className="font-semibold text-primary">₹{inv.amount?.toLocaleString('en-IN') || 0}</span>,
              <span key="t" className="text-foreground/60 text-xs capitalize">{inv.payment_type || '—'}</span>,
              <span key="d" className="text-foreground/50 text-xs">{new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>,
              <StatusBadge key="s" status={inv.status} />,
            ])}
          />
        )}
      </div>
    </div>
  )
}
