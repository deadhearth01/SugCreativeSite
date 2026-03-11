'use client'

import { ReactNode } from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

/* ─── Stat Card ─── */
export function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color = 'teal',
}: {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
  icon: LucideIcon
  color?: 'teal' | 'navy' | 'mint' | 'sage' | 'sky'
}) {
  const colorMap = {
    teal: 'bg-primary-bright/10 text-primary-bright',
    navy: 'bg-primary/10 text-primary',
    mint: 'bg-mint/30 text-primary',
    sage: 'bg-sage/30 text-primary',
    sky: 'bg-sky/20 text-primary-bright',
  }

  return (
    <div className="bg-white border border-border p-6 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground/60 font-medium">{label}</p>
          <p className="text-3xl font-heading font-bold text-primary mt-1">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp size={14} className="text-green-600" />
              ) : trend === 'down' ? (
                <TrendingDown size={14} className="text-red-500" />
              ) : null}
              <span
                className={`text-xs font-medium ${
                  trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-foreground/50'
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

/* ─── Dashboard Panel ─── */
export function DashboardPanel({
  title,
  action,
  children,
  className = '',
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white border border-border rounded-xl ${className}`}>
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h3 className="font-heading font-bold text-primary">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

/* ─── Table ─── */
export function DashboardTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-off-white/50">
              {row.map((cell, j) => (
                <td key={j} className="py-3 px-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Status Badge ─── */
export function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-sky/20 text-primary-bright',
    'in progress': 'bg-sky/20 text-primary-bright',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
    inactive: 'bg-gray-100 text-gray-600',
    scheduled: 'bg-primary-bright/10 text-primary-bright',
    draft: 'bg-gray-100 text-gray-600',
    open: 'bg-sky/20 text-primary-bright',
    closed: 'bg-gray-100 text-gray-600',
    resolved: 'bg-green-100 text-green-700',
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wide rounded-md ${
        statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  )
}

/* ─── Empty State ─── */
export function EmptyState({ message, icon: Icon }: { message: string; icon: LucideIcon }) {
  return (
    <div className="text-center py-12">
      <Icon size={40} className="mx-auto text-foreground/20 mb-3" />
      <p className="text-foreground/50 text-sm">{message}</p>
    </div>
  )
}

/* ─── Page Header ─── */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-primary">{title}</h1>
        {description && <p className="text-foreground/60 text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
