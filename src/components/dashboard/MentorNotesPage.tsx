'use client'

import { useEffect, useState } from 'react'
import { Calendar, Loader2, MessageSquareMore, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'

type NotePerson = {
  id: string
  full_name: string | null
  email: string
  avatar_url?: string | null
}

type MentorNote = {
  id: string
  title: string | null
  message: string
  created_at: string
  mentor: NotePerson | null
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MentorNotesPage({ roleLabel }: { roleLabel: string }) {
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<MentorNote[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/mentor/notes')
        const result = await res.json()
        if (!res.ok) {
          setError(result.error || 'Failed to load mentor notes')
          return
        }
        setNotes(result.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>
  }

  return (
    <div>
      <PageHeader
        title="Mentor Notes"
        description={`Feedback and next steps shared with your ${roleLabel.toLowerCase()} account`}
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-white px-6 py-16 text-center">
          <MessageSquareMore size={42} className="mx-auto mb-3 text-foreground/20" />
          <p className="text-sm font-semibold text-foreground/45">No mentor notes yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {notes.map(note => (
            <article key={note.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm hover:border-[#35C8E0]/70 transition-colors">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-[#1A9AB5]/12 text-[#1A9AB5] flex items-center justify-center shrink-0">
                  <MessageSquareMore size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-heading text-base font-bold text-primary">
                    {note.title || 'Mentor note'}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-foreground/45">
                    <span className="inline-flex items-center gap-1">
                      <UserRound size={12} />
                      {note.mentor?.full_name || note.mentor?.email || 'Mentor'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[#F4F6FA] p-4 text-sm leading-6 text-foreground/70">
                {note.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
