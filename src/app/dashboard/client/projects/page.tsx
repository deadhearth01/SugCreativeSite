'use client'

import { PageHeader, DashboardPanel, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Calendar, Users, Clock } from 'lucide-react'

const projects = [
  {
    name: 'Brand Strategy Consulting',
    category: 'Business Solutions',
    status: 'In Progress',
    progress: 60,
    team: ['Vikram S.', 'Anita D.'],
    deadline: 'Jul 15, 2025',
    description: 'Comprehensive brand strategy including market analysis, positioning, and go-to-market plan.',
  },
  {
    name: 'Digital Marketing Campaign',
    category: 'Edu Tech',
    status: 'Active',
    progress: 25,
    team: ['Priya S.', 'Rahul V.'],
    deadline: 'Aug 01, 2025',
    description: 'Multi-channel digital marketing campaign for educational platform launch.',
  },
  {
    name: 'Website Redesign',
    category: 'Business Solutions',
    status: 'Completed',
    progress: 100,
    team: ['Sneha P.', 'Karan J.'],
    deadline: 'May 30, 2025',
    description: 'Complete redesign of corporate website with modern UI/UX.',
  },
]

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader title="Projects" description="Track the progress of all your active projects" />

      <div className="space-y-6">
        {projects.map((project, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-6 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-heading font-bold text-primary">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <span className="text-xs bg-off-white px-2 py-1 rounded-md font-medium text-foreground/60">{project.category}</span>
              </div>
            </div>

            <p className="text-sm text-foreground/60 mb-4">{project.description}</p>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground/50">Progress</span>
                <span className="font-semibold text-primary">{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-off-white rounded-full">
                <div className="h-full bg-primary-bright rounded-full transition-all" style={{ width: `${project.progress}%` }} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/50">
              <span className="flex items-center gap-1"><Calendar size={12} /> {project.deadline}</span>
              <span className="flex items-center gap-1"><Users size={12} /> {project.team.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
