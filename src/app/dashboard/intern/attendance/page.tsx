'use client'

import { PageHeader, DashboardTable, StatusBadge, StatCard } from '@/components/dashboard/DashboardUI'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

const attendance = [
  { date: 'Jun 16, 2025', checkIn: '9:10 AM', checkOut: '5:30 PM', hours: '8h 20m', status: 'Present' },
  { date: 'Jun 15, 2025', checkIn: '—', checkOut: '—', hours: '—', status: 'Absent' },
  { date: 'Jun 14, 2025', checkIn: '9:00 AM', checkOut: '5:45 PM', hours: '8h 45m', status: 'Present' },
  { date: 'Jun 13, 2025', checkIn: '9:15 AM', checkOut: '5:30 PM', hours: '8h 15m', status: 'Late' },
  { date: 'Jun 12, 2025', checkIn: '8:55 AM', checkOut: '5:30 PM', hours: '8h 35m', status: 'Present' },
]

export default function InternAttendancePage() {
  return (
    <div>
      <PageHeader title="Attendance" description="Your attendance log" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Present" value="18" icon={CheckCircle} color="mint" />
        <StatCard label="Absent" value="2" icon={AlertCircle} color="sky" />
        <StatCard label="Attendance Rate" value="92%" icon={Clock} color="navy" />
      </div>
      <div className="bg-white border border-border rounded-xl">
        <DashboardTable headers={['Date', 'Check In', 'Check Out', 'Hours', 'Status']} rows={attendance.map((a) => [
          <span key="d" className="font-medium text-primary text-sm">{a.date}</span>,
          <span key="ci" className="text-foreground/60">{a.checkIn}</span>,
          <span key="co" className="text-foreground/60">{a.checkOut}</span>,
          <span key="h" className="text-foreground/60">{a.hours}</span>,
          <StatusBadge key="s" status={a.status} />,
        ])} />
      </div>
    </div>
  )
}
