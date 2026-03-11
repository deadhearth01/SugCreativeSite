'use client'

import { CreditCard, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { PageHeader, StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'

const transactions = [
  { id: 'TXN-2025-001', user: 'Arjun Mehta', amount: '₹4,999', date: 'Jun 15, 2025', type: 'Course', status: 'Paid' },
  { id: 'TXN-2025-002', user: 'Priya Sharma', amount: '₹15,000', date: 'Jun 14, 2025', type: 'Consulting', status: 'Paid' },
  { id: 'TXN-2025-003', user: 'Meera Nair', amount: '₹7,999', date: 'Jun 13, 2025', type: 'Course', status: 'Pending' },
  { id: 'TXN-2025-004', user: 'Karan Joshi', amount: '₹1,999', date: 'Jun 12, 2025', type: 'Course', status: 'Paid' },
  { id: 'TXN-2025-005', user: 'Rahul Verma', amount: '₹3,499', date: 'Jun 11, 2025', type: 'Course', status: 'Cancelled' },
  { id: 'TXN-2025-006', user: 'Sneha Patel', amount: '₹25,000', date: 'Jun 10, 2025', type: 'Project', status: 'Paid' },
]

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader title="Payments" description="Track all transactions & revenue" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value="₹24.5L" change="+22% vs last month" trend="up" icon={CreditCard} color="navy" />
        <StatCard label="This Month" value="₹8.4L" change="+18%" trend="up" icon={TrendingUp} color="teal" />
        <StatCard label="Pending" value="₹1.2L" change="3 transactions" icon={ArrowDownRight} color="sky" />
        <StatCard label="Refunds" value="₹35K" change="-12%" trend="down" icon={ArrowUpRight} color="mint" />
      </div>

      <DashboardPanel title="Recent Transactions">
        <DashboardTable
          headers={['Transaction ID', 'User', 'Amount', 'Date', 'Type', 'Status']}
          rows={transactions.map((t) => [
            <span key="i" className="font-mono text-xs text-foreground/60">{t.id}</span>,
            <span key="u" className="font-medium text-primary">{t.user}</span>,
            <span key="a" className="font-semibold text-primary">{t.amount}</span>,
            <span key="d" className="text-foreground/60 text-xs">{t.date}</span>,
            <span key="t" className="text-xs bg-off-white px-2 py-1 rounded-md font-medium">{t.type}</span>,
            <StatusBadge key="s" status={t.status} />,
          ])}
        />
      </DashboardPanel>
    </div>
  )
}
