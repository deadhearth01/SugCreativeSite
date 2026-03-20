'use client'

import { useEffect, useState } from 'react'
import { PageHeader, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Calendar, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Project = {
  id: string
  title: string
  description: string | null
  category: string | null
  status: string
  progress_percent: number | null
  start_date: string | null
  deadline: string | null
  budget: number | null
  created_at: string
}

const STATUS_FILTERS = ['all', 'planning', 'in_progress', 'review', 'completed'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
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

      if (data) setProjects(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div>
      <PageHeader title="Projects" description="Track the progress of all your active projects" />

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === s ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/60 hover:border-primary-bright hover:text-primary'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-foreground/50 text-sm">No projects found{filter !== 'all' ? ` with status "${filter.replace('_', ' ')}"` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((project) => (
            <div key={project.id} className="bg-white border border-border rounded-xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-heading font-bold text-primary">{project.title}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  {project.category && (
                    <span className="text-xs bg-off-white px-2 py-1 rounded-md font-medium text-foreground/60">{project.category}</span>
                  )}
                  {project.budget != null && (
                    <span className="ml-2 text-xs bg-off-white px-2 py-1 rounded-md font-medium text-foreground/60">Budget: ₹{project.budget.toLocaleString('en-IN')}</span>
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
                <div className="w-full h-2 bg-off-white rounded-full">
                  <div className="h-full bg-primary-bright rounded-full transition-all" style={{ width: `${project.progress_percent ?? 0}%` }} />
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
