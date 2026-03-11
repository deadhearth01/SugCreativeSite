'use client'

import { PageHeader, DashboardTable, StatCard } from '@/components/dashboard/DashboardUI'
import { CreditCard, TrendingUp, Calendar } from 'lucide-react'

const earnings = [
  { month: 'June 2025', sessions: 12, amount: '₹24,000', status: 'Pending' },
  { month: 'May 2025', sessions: 15, amount: '₹30,000', status: 'Paid' },
  { month: 'April 2025', sessions: 10, amount: '₹20,000', status: 'Paid' },
  { month: 'March 2025', sessions: 13, amount: '₹26,000', status: 'Paid' },
]

export default function MentorEarningsPage() {
  return (
    <div>
      <PageHeader title="Earnings" description="Track your mentoring income" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Earnings" value="₹1.0L" icon={CreditCard} color="navy" />
        <StatCard label="This Month" value="₹24,000" change="+₹4K" trend="up" icon={TrendingUp} color="teal" />
        <StatCard label="Sessions (MTD)" value="12" icon={Calendar} color="sky" />
      </div>

      <div className="bg-white border border-border rounded-xl">
        <DashboardTable headers={['Month', 'Sessions', 'Amount', 'Status']} rows={earnings.map((e) => [
          <span key="m" className="font-medium text-primary">{e.month}</span>,
          <span key="s" className="text-foreground/60">{e.sessions}</span>,
          <span key="a" className="font-semibold text-primary">{e.amount}</span>,
          <span key="st" className={`text-xs font-semibold px-2 py-1 ${e.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{e.status}</span>,
        ])} />
      </div>
    </div>
  )
}
