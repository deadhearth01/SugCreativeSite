'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { UserCheck, Loader2, GraduationCap, Briefcase, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Mentee = {
  id: string
  full_name: string | null
  username: string | null
  email: string
  avatar_url: string | null
  role: string
}

type Assignment = {
  id: string
  assigned_at: string
  notes: string | null
  mentee: Mentee | null
}

export default function MentorStudentsPage() {
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filter, setFilter] = useState<'all' | 'intern' | 'student'>('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('mentor_assignments')
        .select(`
          id, assigned_at, notes,
          mentee:mentee_id(id, full_name, username, email, avatar_url, role)
        `)
        .eq('mentor_id', user.id)
        .order('assigned_at', { ascending: false })

      setAssignments((data as unknown as Assignment[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>

  const counts = {
    all: assignments.length,
    intern: assignments.filter(a => a.mentee?.role === 'intern').length,
    student: assignments.filter(a => a.mentee?.role === 'student').length,
  }
  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.mentee?.role === filter)

  const initials = (name: string | null, email: string) => {
    const base = (name && name.trim()) || email
    return base.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div>
      <PageHeader
        title="Assigned Students"
        description="Interns and students mapped to you by the admin"
        action={
          <div className="text-xs text-foreground/60 font-semibold">
            {counts.all} total · {counts.intern} interns · {counts.student} students
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5">
        {(['all', 'intern', 'student'] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-colors ${
              filter === key
                ? 'bg-[#1A9AB5] text-white border-[#1A9AB5]'
                : 'bg-white text-foreground/60 border-border hover:border-[#1A9AB5]'
            }`}
          >
            {key === 'all' ? 'All' : key + 's'} ({counts[key]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-border rounded-2xl p-16 text-center">
          <UserCheck size={48} className="mx-auto text-foreground/15 mb-3" />
          <p className="text-foreground/50 text-sm font-semibold">
            {assignments.length === 0
              ? 'No students assigned yet. Admin will map students and interns to you.'
              : 'No matches for this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => {
            if (!a.mentee) return null
            const m = a.mentee
            const RoleIcon = m.role === 'intern' ? Briefcase : GraduationCap
            const roleColor = m.role === 'intern' ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'
            return (
              <div key={a.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-md hover:border-[#1A9AB5] transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#82C93D]/15 text-[#5B8E2A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {m.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold">{initials(m.full_name, m.email)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-bold text-primary truncate">
                      {m.full_name || <span className="italic text-foreground/40">No name yet</span>}
                    </h3>
                    {m.username ? (
                      <p className="text-[11px] font-mono font-semibold text-[#5B8E2A] truncate">@{m.username}</p>
                    ) : (
                      <p className="text-[11px] italic text-amber-600 truncate">@username not set</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md flex-shrink-0 ${roleColor}`}>
                    <RoleIcon size={9} />
                    {m.role}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-foreground/60">
                  <p className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    <span>Assigned {new Date(a.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </p>
                </div>
                {a.notes && (
                  <div className="mt-3 pt-3 border-t border-border text-xs text-foreground/60 italic">
                    {a.notes}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
