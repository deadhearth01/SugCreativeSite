'use client'

import { PageHeader, DashboardTable, StatusBadge, StatCard } from '@/components/dashboard/DashboardUI'
import { CreditCard, Receipt, ArrowDownRight } from 'lucide-react'

const invoices = [
  { id: 'INV-2025-034', project: 'Website Redesign', amount: '₹25,000', date: 'Jun 01, 2025', status: 'Paid' },
  { id: 'INV-2025-041', project: 'Brand Strategy', amount: '₹15,000', date: 'Jun 15, 2025', status: 'Pending' },
  { id: 'INV-2025-028', project: 'Website Redesign', amount: '₹50,000', date: 'May 15, 2025', status: 'Paid' },
  { id: 'INV-2025-019', project: 'Marketing Campaign', amount: '₹30,000', date: 'May 01, 2025', status: 'Paid' },
]

export default function ClientPaymentsPage() {
  return (
    <div>
      <PageHeader title="Invoices & Payments" description="View and manage your invoices" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Paid" value="₹1.05L" icon={CreditCard} color="navy" />
        <StatCard label="Pending" value="₹15,000" icon={Receipt} color="sky" />
        <StatCard label="This Month" value="₹40,000" change="+₹15K" trend="up" icon={ArrowDownRight} color="teal" />
      </div>

      <div className="bg-white border border-border rounded-xl">
        <DashboardTable headers={['Invoice', 'Project', 'Amount', 'Date', 'Status']} rows={invoices.map((inv) => [
          <span key="i" className="font-mono text-xs text-foreground/60">{inv.id}</span>,
          <span key="p" className="font-medium text-primary">{inv.project}</span>,
          <span key="a" className="font-semibold text-primary">{inv.amount}</span>,
          <span key="d" className="text-foreground/50 text-xs">{inv.date}</span>,
          <StatusBadge key="s" status={inv.status} />,
        ])} />
      </div>
    </div>
  )
}
