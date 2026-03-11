'use client'

import { PageHeader, DashboardTable, StatusBadge, StatCard } from '@/components/dashboard/DashboardUI'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

const attendance = [
  { date: 'Jun 16, 2025', checkIn: '9:05 AM', checkOut: '6:00 PM', hours: '8h 55m', status: 'Present' },
  { date: 'Jun 15, 2025', checkIn: '—', checkOut: '—', hours: '—', status: 'Absent' },
  { date: 'Jun 14, 2025', checkIn: '9:30 AM', checkOut: '6:15 PM', hours: '8h 45m', status: 'Late' },
  { date: 'Jun 13, 2025', checkIn: '8:55 AM', checkOut: '6:00 PM', hours: '9h 05m', status: 'Present' },
  { date: 'Jun 12, 2025', checkIn: '9:00 AM', checkOut: '6:10 PM', hours: '9h 10m', status: 'Present' },
  { date: 'Jun 11, 2025', checkIn: '9:02 AM', checkOut: '5:50 PM', hours: '8h 48m', status: 'Present' },
]

export default function EmployeeAttendancePage() {
  return (
    <div>
      <PageHeader title="Attendance" description="Your attendance records" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Present Days" value="19" icon={CheckCircle} color="mint" />
        <StatCard label="Absent" value="1" icon={AlertCircle} color="sky" />
        <StatCard label="Attendance Rate" value="95%" icon={Clock} color="navy" />
      </div>

      <div className="bg-white border border-border rounded-xl">
        <DashboardTable headers={['Date', 'Check In', 'Check Out', 'Hours', 'Status']} rows={attendance.map((a) => [
          <span key="d" className="font-medium text-primary text-sm">{a.date}</span>,
          <span key="ci" className="text-foreground/60 text-sm">{a.checkIn}</span>,
          <span key="co" className="text-foreground/60 text-sm">{a.checkOut}</span>,
          <span key="h" className="text-foreground/60 text-sm">{a.hours}</span>,
          <StatusBadge key="s" status={a.status} />,
        ])} />
      </div>
    </div>
  )
}
