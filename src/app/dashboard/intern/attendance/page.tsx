'use client'

import { useEffect, useState } from 'react'
import { PageHeader, DashboardTable, StatusBadge, StatCard } from '@/components/dashboard/DashboardUI'
import { Clock, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'

type AttendanceRecord = {
  id: string
  date: string
  check_in: string | null
  check_out: string | null
  hours_worked: number | null
  status: string | null
}

type Toast = { message: string; type: 'success' | 'error' }

function ToastNotif({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function formatHours(hours: number | null): string {
  if (!hours || hours <= 0) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

function getRecordStatus(record: AttendanceRecord): string {
  if (record.status) return record.status
  if (record.hours_worked && record.hours_worked > 0) return 'Present'
  if (record.check_in && !record.check_out) return 'Active'
  if (!record.check_in) return 'Absent'
  return 'Present'
}

export default function InternAttendancePage() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const fetchAttendance = async () => {
    const res = await fetch('/api/attendance')
    if (res.ok) {
      const data = await res.json()
      const list: AttendanceRecord[] = data.attendance || data || []
      setRecords(list)
      const today = new Date().toISOString().split('T')[0]
      const todayRec = list.find((r) => r.date?.startsWith(today)) || null
      setTodayRecord(todayRec)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  const handleCheckIn = async () => {
    setActionLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ check_in: new Date().toISOString(), date: today }),
      })
      if (res.ok) {
        showToast('Checked in successfully!', 'success')
        await fetchAttendance()
      } else {
        const { error } = await res.json()
        showToast(error || 'Failed to check in.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!todayRecord) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/attendance/${todayRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ check_out: new Date().toISOString() }),
      })
      if (res.ok) {
        showToast('Checked out successfully!', 'success')
        await fetchAttendance()
      } else {
        const { error } = await res.json()
        showToast(error || 'Failed to check out.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  const presentDays = records.filter((r) => r.check_in).length
  const lateCount = records.filter((r) => {
    const status = getRecordStatus(r)
    return status.toLowerCase() === 'late'
  }).length
  const totalDays = records.length
  const absentDays = records.filter((r) => !r.check_in).length
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  const hasCheckedIn = !!todayRecord?.check_in
  const hasCheckedOut = !!todayRecord?.check_out

  const tableRows = records.map((r) => {
    const status = getRecordStatus(r)
    return [
      <span key="d" className="font-medium text-primary text-sm">
        {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>,
      <span key="ci" className="text-foreground/60">{formatTime(r.check_in)}</span>,
      <span key="co" className="text-foreground/60">{formatTime(r.check_out)}</span>,
      <span key="h" className="text-foreground/60">{formatHours(r.hours_worked)}</span>,
      <StatusBadge key="s" status={status} />,
    ]
  })

  return (
    <div>
      {toast && <ToastNotif message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Attendance"
        description="Your attendance log"
        action={
          <div className="flex items-center gap-3">
            {!hasCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Check In
              </button>
            ) : !hasCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="bg-teal text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                Check Out
              </button>
            ) : (
              <span className="text-sm text-foreground/50 font-medium">Done for today</span>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Present Days" value={presentDays} icon={CheckCircle} color="mint" />
        <StatCard label="Late" value={lateCount} icon={Clock} color="sky" />
        <StatCard label="Absent" value={absentDays} icon={AlertCircle} color="navy" />
        <StatCard label="Attendance Rate" value={`${attendanceRate}%`} icon={Clock} color="teal" />
      </div>

      <div className="bg-white border border-border rounded-xl">
        {tableRows.length > 0 ? (
          <DashboardTable
            headers={['Date', 'Check In', 'Check Out', 'Hours', 'Status']}
            rows={tableRows}
          />
        ) : (
          <p className="text-sm text-foreground/40 py-12 text-center">No attendance records found</p>
        )}
      </div>
    </div>
  )
}
