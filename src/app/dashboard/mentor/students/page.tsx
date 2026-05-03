'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { UserCheck, Loader2, GraduationCap, Briefcase, Calendar, MessageSquarePlus, X } from 'lucide-react'

type Mentee = {
  id: string
  full_name: string | null
  username: string | null
  email: string
  avatar_url: string | null
  role: string
  status?: string
}

type Assignment = {
  id: string
  assigned_at: string
  notes: string | null
  mentee: Mentee | null
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}
    </div>
  )
}

export default function MentorStudentsPage() {
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filter, setFilter] = useState<'all' | 'intern' | 'student'>('all')
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteMessage, setNoteMessage] = useState('')
  const [sendingNote, setSendingNote] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mentor/mentees')
      const result = await res.json()
      if (!res.ok) {
        setToast({ message: result.error || 'Failed to load assigned mentees', type: 'error' })
        setAssignments([])
      } else {
        const rows = (result.data || []).map((row: Assignment & { mentee: Mentee | Mentee[] | null }) => ({
          ...row,
          mentee: Array.isArray(row.mentee) ? row.mentee[0] || null : row.mentee,
        }))
        setAssignments(rows)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openNoteModal = (mentee: Mentee) => {
    setSelectedMentee(mentee)
    setNoteTitle('')
    setNoteMessage('')
  }

  const sendNote = async () => {
    if (!selectedMentee || !noteMessage.trim()) {
      setToast({ message: 'Write a note before sending', type: 'error' })
      return
    }
    setSendingNote(true)
    try {
      const res = await fetch('/api/mentor/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentee_id: selectedMentee.id,
          title: noteTitle,
          message: noteMessage,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setToast({ message: result.error || 'Failed to send note', type: 'error' })
        return
      }
      setToast({ message: 'Mentor note sent', type: 'success' })
      setSelectedMentee(null)
      setNoteTitle('')
      setNoteMessage('')
    } finally {
      setSendingNote(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>

  const visibleAssignments = assignments.filter(a => a.mentee)
  const counts = {
    all: visibleAssignments.length,
    intern: visibleAssignments.filter(a => a.mentee?.role === 'intern').length,
    student: visibleAssignments.filter(a => a.mentee?.role === 'student').length,
  }
  const filtered = filter === 'all' ? visibleAssignments : visibleAssignments.filter(a => a.mentee?.role === filter)

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <button
                  onClick={() => openNoteModal(m)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#1A9AB5] px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#15809A] transition-colors"
                >
                  <MessageSquarePlus size={14} />
                  Send Mentor Note
                </button>
              </div>
            )
          })}
        </div>
      )}

      {selectedMentee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="text-lg font-heading font-bold text-primary">Send Mentor Note</h2>
                <p className="text-xs text-foreground/50 mt-1">
                  To {selectedMentee.full_name || selectedMentee.email}
                </p>
              </div>
              <button onClick={() => setSelectedMentee(null)} className="rounded-lg p-1.5 text-foreground/40 hover:bg-off-white hover:text-primary">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-1.5">Title</label>
                <input
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                  placeholder="Optional note title"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-1.5">Message</label>
                <textarea
                  value={noteMessage}
                  onChange={e => setNoteMessage(e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                  placeholder="Share feedback, next steps, reminders, or encouragement..."
                />
              </div>
            </div>
            <div className="flex gap-3 border-t border-border px-6 py-5">
              <button
                onClick={() => setSelectedMentee(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground/60 hover:bg-off-white"
              >
                Cancel
              </button>
              <button
                onClick={sendNote}
                disabled={sendingNote}
                className="flex-1 rounded-lg bg-[#1A9AB5] py-2.5 text-sm font-semibold text-white hover:bg-[#15809A] disabled:opacity-60"
              >
                {sendingNote ? 'Sending...' : 'Send Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
