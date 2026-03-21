'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { Pin, Clock, ChevronDown, ChevronUp, Loader2, Megaphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Announcement = {
  id: string
  title: string
  content: string
  created_at: string
  is_pinned: boolean
  target_roles: string[] | null
  author: { full_name: string } | null
}

export default function EmployeeAnnouncementsPage() {
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('announcements')
        .select('*, author:created_by(full_name)')
        .or('target_roles.cs.{employee},target_roles.cs.{all}')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
      setAnnouncements((data as unknown as Announcement[]) || [])
      setLoading(false)
    }
    fetchAnnouncements()
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-primary-bright" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Announcements" description="Company-wide updates and notices" />

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <Megaphone size={40} className="text-foreground/20" />
          <p className="text-sm text-foreground/40 text-center">No announcements at this time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => {
            const isExpanded = expandedId === a.id
            const author = a.author as { full_name: string } | null
            return (
              <div key={a.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {a.is_pinned && (
                    <span className="flex items-center gap-1 text-primary-bright text-xs font-semibold">
                      <Pin size={12} /> Pinned
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-foreground/40 text-xs">
                    <Clock size={12} />
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {author && (
                    <span className="text-xs text-foreground/40">by {author.full_name}</span>
                  )}
                  {a.target_roles && a.target_roles.length > 0 && (
                    <span className="text-xs bg-off-white px-2 py-0.5 rounded text-foreground/50 font-medium">
                      {a.target_roles.join(', ')}
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-primary mb-2">{a.title}</h3>
                <p className={`text-sm text-foreground/60 ${isExpanded ? '' : 'line-clamp-2'}`}>{a.content}</p>
                {a.content && a.content.length > 150 && (
                  <button
                    onClick={() => toggleExpand(a.id)}
                    className="mt-2 text-xs text-primary-bright font-semibold flex items-center gap-1 hover:underline"
                  >
                    {isExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
