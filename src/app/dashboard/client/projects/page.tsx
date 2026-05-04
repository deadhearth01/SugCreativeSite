'use client'

import { useEffect, useState } from 'react'
import { PageHeader, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Calendar, Loader2, MessageSquare, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Project = {
  id: string
  title: string
  description: string | null
  status: string
  progress_percent: number | null
  start_date: string | null
  deadline: string | null
  budget: number | null
  created_at: string
}

type ProjectUpdate = {
  id: string
  title: string | null
  body: string
  progress_at_post: number | null
  status_at_post: string | null
  created_at: string
  author: { full_name: string | null; username: string | null; role: string } | null
}

const STATUS_FILTERS = ['all', 'planning', 'in_progress', 'review', 'completed'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [updates, setUpdates] = useState<Record<string, ProjectUpdate[]>>({})
  const [filter, setFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      const projectList = data || []
      setProjects(projectList)

      // Fetch updates for each project in parallel
      if (projectList.length > 0) {
        const results = await Promise.all(
          projectList.map(p =>
            fetch(`/api/projects/${p.id}/updates`)
              .then(r => r.json())
              .then(j => [p.id, j.data || []] as const)
              .catch(() => [p.id, []] as const)
          )
        )
        const map: Record<string, ProjectUpdate[]> = {}
        for (const [id, list] of results) map[id] = list
        setUpdates(map)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>

  return (
    <div>
      <PageHeader title="My Projects" description="Live status, progress, and updates from your project team" />

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === s ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/60 hover:border-[#35C8E0] hover:text-primary'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <p className="text-foreground/50 text-sm">No projects found{filter !== 'all' ? ` with status "${filter.replace('_', ' ')}"` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((project) => {
            const projectUpdates = updates[project.id] || []
            return (
              <div key={project.id} className="bg-white border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-heading font-bold text-primary">{project.title}</h3>
                      <StatusBadge status={project.status} />
                    </div>
                    {project.budget != null && (
                      <span className="text-xs bg-off-white px-2 py-1 rounded-md font-medium text-foreground/60">Budget: ₹{project.budget.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-foreground/60 mb-4">{project.description}</p>
                )}

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground/50">Progress</span>
                    <span className="font-semibold text-primary">{project.progress_percent ?? 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-off-white rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1A9AB5] to-[#82C93D] rounded-full transition-all" style={{ width: `${project.progress_percent ?? 0}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/50">
                  {project.start_date && (
                    <span className="flex items-center gap-1"><Calendar size={12} /> Start: {new Date(project.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  )}
                  {project.deadline && (
                    <span className="flex items-center gap-1"><Calendar size={12} /> Due: {new Date(project.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>

                {/* Live updates from admin */}
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={14} className="text-[#1A9AB5]" />
                    <h4 className="text-xs font-black text-[#1A9AB5] uppercase tracking-widest">Project Updates</h4>
                    {projectUpdates.length > 0 && (
                      <span className="text-[10px] bg-[#82C93D]/15 text-[#5B8E2A] px-1.5 py-0.5 rounded-full font-bold">
                        {projectUpdates.length}
                      </span>
                    )}
                  </div>

                  {projectUpdates.length === 0 ? (
                    <p className="text-xs text-foreground/40 italic">No updates yet. Your team will post progress notes here.</p>
                  ) : (
                    <ol className="space-y-3">
                      {projectUpdates.map((u, idx) => (
                        <li key={u.id} className="relative pl-5">
                          {/* Timeline dot */}
                          <span className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-[#82C93D] ring-4 ring-[#82C93D]/20' : 'bg-[#1A9AB5]/40'}`} />
                          {/* Timeline line */}
                          {idx < projectUpdates.length - 1 && (
                            <span className="absolute left-[5px] top-4 bottom-[-12px] w-px bg-border" />
                          )}
                          <div className="bg-off-white/60 border border-border rounded-xl p-3">
                            {u.title && (
                              <p className="text-sm font-bold text-foreground/90 mb-0.5 flex items-center gap-1.5">
                                {idx === 0 && <Sparkles size={11} className="text-[#82C93D]" />}
                                {u.title}
                              </p>
                            )}
                            <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">{u.body}</p>
                            <div className="flex items-center gap-2 mt-2 text-[11px] text-foreground/40">
                              <Calendar size={10} />
                              <span>{new Date(u.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              {u.author && (
                                <span className="ml-auto font-semibold">
                                  by {u.author.full_name || (u.author.username ? `@${u.author.username}` : u.author.role)}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
