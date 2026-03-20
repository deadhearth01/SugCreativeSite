'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { BookOpen, ExternalLink, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type LearningMaterial = {
  id: string
  title: string
  description: string | null
  content: string | null
  material_type: string | null
  file_url: string | null
  created_by: string | null
  created_at: string
}

type LearningProgress = {
  id: string
  user_id: string
  material_id: string
  completed_at: string | null
  created_at: string
}

export default function InternLearningPage() {
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [progress, setProgress] = useState<LearningProgress[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [materialsRes, progressRes] = await Promise.all([
        supabase
          .from('learning_materials')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id),
      ])

      setMaterials((materialsRes.data as LearningMaterial[]) || [])
      setProgress((progressRes.data as LearningProgress[]) || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const completedIds = new Set(progress.map((p) => p.material_id))

  const materialTypeLabel: Record<string, string> = {
    pdf: 'PDF',
    video: 'Video',
    article: 'Article',
    document: 'Document',
    link: 'Link',
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
      <PageHeader title="Learning" description="Resources and materials for your development" />

      {materials.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <BookOpen size={40} className="text-foreground/20" />
          <p className="text-sm text-foreground/40 text-center">No learning materials available</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-foreground/60">{materials.length} material{materials.length !== 1 ? 's' : ''}</span>
            <span className="text-foreground/30">·</span>
            <span className="text-sm text-foreground/60">{completedIds.size} completed</span>
          </div>

          <div className="space-y-3">
            {materials.map((m) => {
              const isCompleted = completedIds.has(m.id)
              const typeLabel = m.material_type ? (materialTypeLabel[m.material_type.toLowerCase()] || m.material_type) : null
              return (
                <div
                  key={m.id}
                  className={`bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow ${isCompleted ? 'border-green-200' : 'border-border'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${isCompleted ? 'bg-green-50' : 'bg-off-white'}`}>
                        {isCompleted ? (
                          <CheckCircle size={18} className="text-green-600" />
                        ) : (
                          <BookOpen size={18} className="text-primary-bright" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-primary">{m.title}</h3>
                        {m.description && (
                          <p className="text-xs text-foreground/50 mt-0.5 line-clamp-2">{m.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {typeLabel && (
                            <span className="text-xs bg-off-white px-2 py-0.5 rounded font-medium text-foreground/60">{typeLabel}</span>
                          )}
                          {isCompleted && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">Completed</span>
                          )}
                          <span className="text-xs text-foreground/40">
                            {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {m.file_url && (
                      <a
                        href={m.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-off-white transition-colors group"
                        title="Open resource"
                      >
                        <ExternalLink size={16} className="text-foreground/30 group-hover:text-primary-bright transition-colors" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
