'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { UserCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Student = {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  created_at: string
  sessionCount: number
}

export default function MentorStudentsPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('mentor_sessions')
        .select('student_id, student:student_id(id, full_name, email, avatar_url, created_at)')
        .eq('mentor_id', user.id)

      if (data) {
        // Deduplicate by student_id and count sessions
        const map = new Map<string, Student>()
        for (const row of data) {
          const s = row.student as unknown as { id: string; full_name: string; email: string; avatar_url: string | null; created_at: string } | null
          if (!s) continue
          if (map.has(s.id)) {
            map.get(s.id)!.sessionCount++
          } else {
            map.set(s.id, { ...s, sessionCount: 1 })
          }
        }
        setStudents(Array.from(map.values()))
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div>
      <PageHeader title="My Students" description="Students who have had sessions with you" />

      {students.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <UserCheck size={40} className="mx-auto text-foreground/20 mb-3" />
          <p className="text-foreground/50 text-sm">No students found. Sessions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div key={student.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary">{student.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-primary truncate">{student.full_name}</h3>
                  <p className="text-xs text-foreground/50 truncate">{student.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-foreground/60">
                <span className="bg-primary-bright/10 text-primary-bright px-2.5 py-1 rounded-md font-semibold">
                  {student.sessionCount} {student.sessionCount === 1 ? 'session' : 'sessions'}
                </span>
                <span>Joined {new Date(student.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
