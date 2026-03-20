'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserCheck, Video, Calendar, CreditCard, ArrowUpRight, Star, Loader2 } from 'lucide-react'
import { StatCard, DashboardPanel, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type RawSession = {
  id: string
  session_type: string | null
  amount: number | null
  status: string
  created_at: string
  rating?: number | null
  student_id?: string
  student: { full_name: string; email: string } | null
  meeting: { title: string; scheduled_at: string } | null
}

type Session = {
  id: string
  session_type: string | null
  amount: number | null
  status: string
  created_at: string
  student: { full_name: string; email: string } | null
  meeting: { title: string; scheduled_at: string } | null
}

export default function MentorDashboard() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)
  const [uniqueStudents, setUniqueStudents] = useState(0)
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [recentSessions, setRecentSessions] = useState<Session[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (profile) setUserName(profile.full_name || '')

      const { data: sessions } = await supabase
        .from('mentor_sessions')
        .select('id, session_type, amount, status, created_at, rating, student:student_id(full_name, email), meeting:meeting_id(title, scheduled_at)')
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false })

      if (sessions) {
        const rawSessions = sessions as RawSession[]
        const earnings = rawSessions.reduce((acc: number, s: RawSession) => acc + (s.amount || 0), 0)
        setTotalEarnings(earnings)
        setTotalSessions(rawSessions.length)

        const studentIds = new Set(rawSessions.map((s: RawSession) => s.student_id).filter(Boolean))
        setUniqueStudents(studentIds.size)

        const rated = rawSessions.filter((s: RawSession) => s.rating != null)
        if (rated.length > 0) {
          const avg = rated.reduce((acc: number, s: RawSession) => acc + (s.rating || 0), 0) / rated.length
          setAvgRating(Math.round(avg * 10) / 10)
        }

        setRecentSessions(rawSessions.slice(0, 5) as Session[])
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-navy to-teal p-6 rounded-xl text-white">
        <h2 className="text-xl font-heading font-bold">Welcome back{userName ? `, ${userName}` : ''}!</h2>
        <p className="text-white/70 text-sm mt-1">You have {totalSessions} total sessions. Keep up the great work!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={String(uniqueStudents)} icon={UserCheck} color="navy" />
        <StatCard label="Total Sessions" value={String(totalSessions)} icon={Video} color="teal" />
        <StatCard label="Avg. Rating" value={avgRating != null ? String(avgRating) : '—'} icon={Star} color="mint" />
        <StatCard label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN')}`} icon={CreditCard} color="sky" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Students', href: '/dashboard/mentor/students', icon: UserCheck },
          { label: 'Sessions', href: '/dashboard/mentor/sessions', icon: Video },
          { label: 'Calendar', href: '/dashboard/mentor/calendar', icon: Calendar },
          { label: 'Earnings', href: '/dashboard/mentor/earnings', icon: CreditCard },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary-bright hover:shadow-sm transition-all group">
            <a.icon size={18} className="text-primary-bright" />
            <span className="text-sm font-medium text-primary">{a.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-foreground/30 group-hover:text-primary-bright transition-colors" />
          </Link>
        ))}
      </div>

      <DashboardPanel title="Recent Sessions" action={<Link href="/dashboard/mentor/sessions" className="text-xs text-primary-bright font-semibold hover:underline">View All</Link>}>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-foreground/50 py-4 text-center">No sessions yet.</p>
        ) : (
          <DashboardTable
            headers={['Student', 'Type', 'Amount', 'Status', 'Date']}
            rows={recentSessions.map((s: Session) => [
              <span key="st" className="font-medium text-primary">{s.student?.full_name || '—'}</span>,
              <span key="ty" className="text-foreground/60 text-xs capitalize">{s.session_type || '—'}</span>,
              <span key="am" className="font-semibold text-primary">{s.amount != null ? `₹${s.amount.toLocaleString('en-IN')}` : '—'}</span>,
              <StatusBadge key="ss" status={s.status} />,
              <span key="da" className="text-foreground/50 text-xs">{new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>,
            ])}
          />
        )}
      </DashboardPanel>
    </div>
  )
}
