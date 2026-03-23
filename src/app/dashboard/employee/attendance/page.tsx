'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader, DashboardTable, StatusBadge, StatCard, DashboardPanel } from '@/components/dashboard/DashboardUI'
import { Clock, CheckCircle, AlertCircle, Loader2, X, LogIn, LogOut } from 'lucide-react'

type AttendanceRecord = {
  id: string
  date: string
  check_in: string | null
  check_out: string | null
  hours_worked: number | null
  status: string | null
}

type ToastState = { message: string; type: 'success' | 'error' }

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

function formatTime(ts: string | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function formatHours(hours: number | null): string {
  if (!hours) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

function getStatus(a: AttendanceRecord): string {
  if (a.hours_worked != null) return 'Present'
  if (a.check_in && !a.check_out) return 'Active'
  return 'Absent'
}

export default function EmployeeAttendancePage() {
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const todayStr = new Date().toISOString().split('T')[0]

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance')
      if (res.ok) {
        const data = await res.json()
        setAttendance(data)
      }
    } catch {
      // silently fail on fetch error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAttendance() }, [fetchAttendance])

  const todayRecord = attendance.find((a) => a.date === todayStr) || null

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ check_in: new Date().toISOString(), date: new Date().toISOString().split('T')[0] }),
      })
      if (res.ok) {
        showToast('Checked in successfully!', 'success')
        await fetchAttendance()
      } else {
        showToast('Failed to check in.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    if (!todayRecord) return
    setCheckingOut(true)
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
        showToast('Failed to check out.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
    } finally {
      setCheckingOut(false)
    }
  }

  // Stat calculations
  const presentDays = attendance.filter((a) => a.check_in).length
  const lateDays = attendance.filter((a) => a.status === 'late').length
  const total = attendance.length
  const attendanceRate = total > 0 ? Math.round((presentDays / total) * 100) : 0

  const attendanceRows = attendance.map((a) => [
    <span key="d" className="font-medium text-primary text-sm">
      {new Date(a.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>,
    <span key="ci" className="text-foreground/60 text-sm">{formatTime(a.check_in)}</span>,
    <span key="co" className="text-foreground/60 text-sm">{formatTime(a.check_out)}</span>,
    <span key="h" className="text-foreground/60 text-sm">{formatHours(a.hours_worked)}</span>,
    <StatusBadge key="s" status={getStatus(a)} />,
  ])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader title="Attendance" description="Track your daily attendance" />

      {/* Today's Check-in/out Card */}
      <DashboardPanel title={`Today — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}`}>
        {todayRecord ? (
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-xs text-foreground/50">Check-in</p>
              <p className="text-sm font-semibold text-primary">{formatTime(todayRecord.check_in)}</p>
            </div>
            {todayRecord.check_out ? (
              <div>
                <p className="text-xs text-foreground/50">Check-out</p>
                <p className="text-sm font-semibold text-primary">{formatTime(todayRecord.check_out)}</p>
              </div>
            ) : (
              <button
                onClick={handleCheckOut}
                disabled={checkingOut}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {checkingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                Check Out
              </button>
            )}
            <StatusBadge status={getStatus(todayRecord)} />
          </div>
        ) : (
          <div>
            <p className="text-sm text-foreground/50 mb-3">You have not checked in today.</p>
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {checkingIn ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
              Check In
            </button>
          </div>
        )}
      </DashboardPanel>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 mt-6">
        <StatCard label="Present Days" value={presentDays} icon={CheckCircle} color="mint" />
        <StatCard label="Late Days" value={lateDays} icon={AlertCircle} color="sky" />
        <StatCard label="Attendance Rate" value={`${attendanceRate}%`} icon={Clock} color="navy" />
      </div>

      {/* History Table */}
      <div className="bg-white border border-border rounded-xl">
        {attendanceRows.length > 0 ? (
          <DashboardTable
            headers={['Date', 'Check In', 'Check Out', 'Hours Worked', 'Status']}
            rows={attendanceRows}
          />
        ) : (
          <p className="text-sm text-foreground/40 py-12 text-center">No attendance records found</p>
        )}
      </div>
    </div>
  )
}
