'use client'

import { PageHeader, DashboardPanel } from '@/components/dashboard/DashboardUI'
import { BarChart3, TrendingUp, FileText } from 'lucide-react'

const reports = [
  { title: 'Brand Strategy — Phase 1 Report', date: 'Jun 10, 2025', type: 'Progress Report' },
  { title: 'Website Redesign — Final Deliverables', date: 'May 30, 2025', type: 'Completion Report' },
  { title: 'Marketing Campaign — Performance Metrics', date: 'May 15, 2025', type: 'Analytics Report' },
]

export default function ClientReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Project reports and performance metrics" />

      <div className="space-y-4">
        {reports.map((report, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-bright/10 flex items-center justify-center"><FileText size={18} className="text-primary-bright" /></div>
              <div>
                <h3 className="font-medium text-primary text-sm">{report.title}</h3>
                <p className="text-xs text-foreground/50">{report.date} · {report.type}</p>
              </div>
            </div>
            <button className="text-xs text-primary-bright font-semibold hover:underline">Download</button>
          </div>
        ))}
      </div>
    </div>
  )
}
