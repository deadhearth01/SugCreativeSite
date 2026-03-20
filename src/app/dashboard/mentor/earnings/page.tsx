'use client'

import { useEffect, useState } from 'react'
import { PageHeader, DashboardTable, StatCard } from '@/components/dashboard/DashboardUI'
import { CreditCard, TrendingUp, Calendar, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Session = {
  id: string
  amount: number | null
  created_at: string
  student: { full_name: string } | null
}

type MonthGroup = {
  month: string
  sessions: number
  amount: number
}

export default function MentorEarningsPage() {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('mentor_sessions')
        .select('id, amount, created_at, student:student_id(full_name)')
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setSessions(data as Session[])
      setLoading(false)
    }
    load()
  }, [])

  const totalEarnings = sessions.reduce((acc, s) => acc + (s.amount || 0), 0)

  const now = new Date()
  const thisMonthEarnings = sessions
    .filter(s => {
      const d = new Date(s.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((acc, s) => acc + (s.amount || 0), 0)

  const thisMonthSessions = sessions.filter(s => {
    const d = new Date(s.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Group by month
  const monthMap = new Map<string, MonthGroup>()
  for (const s of sessions) {
    const d = new Date(s.created_at)
    const key = d.toLocaleString('default', { month: 'long', year: 'numeric' })
    if (monthMap.has(key)) {
      const g = monthMap.get(key)!
      g.sessions++
      g.amount += s.amount || 0
    } else {
      monthMap.set(key, { month: key, sessions: 1, amount: s.amount || 0 })
    }
  }
  const monthGroups = Array.from(monthMap.values())

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div>
      <PageHeader title="Earnings" description="Track your mentoring income" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN')}`} icon={CreditCard} color="navy" />
        <StatCard label="This Month" value={`₹${thisMonthEarnings.toLocaleString('en-IN')}`} icon={TrendingUp} color="teal" />
        <StatCard label="Sessions (MTD)" value={String(thisMonthSessions)} icon={Calendar} color="sky" />
      </div>

      <div className="bg-white border border-border rounded-xl mb-6">
        <div className="p-5 border-b border-border">
          <h3 className="font-heading font-bold text-primary">Monthly Breakdown</h3>
        </div>
        {monthGroups.length === 0 ? (
          <p className="text-sm text-foreground/50 py-10 text-center">No earnings data found.</p>
        ) : (
          <DashboardTable
            headers={['Month', 'Sessions', 'Amount']}
            rows={monthGroups.map((g) => [
              <span key="m" className="font-medium text-primary">{g.month}</span>,
              <span key="s" className="text-foreground/60">{g.sessions}</span>,
              <span key="a" className="font-semibold text-primary">₹{g.amount.toLocaleString('en-IN')}</span>,
            ])}
          />
        )}
      </div>

      <div className="bg-white border border-border rounded-xl">
        <div className="p-5 border-b border-border">
          <h3 className="font-heading font-bold text-primary">Session Details</h3>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-foreground/50 py-10 text-center">No sessions found.</p>
        ) : (
          <DashboardTable
            headers={['Student', 'Date', 'Amount']}
            rows={sessions.map((s) => [
              <span key="st" className="font-medium text-primary">{s.student?.full_name || '—'}</span>,
              <span key="da" className="text-foreground/50 text-xs">{new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>,
              <span key="am" className="font-semibold text-primary">{s.amount != null ? `₹${s.amount.toLocaleString('en-IN')}` : '—'}</span>,
            ])}
          />
        )}
      </div>
    </div>
  )
}
