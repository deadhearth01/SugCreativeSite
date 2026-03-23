'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { FileText, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Report = {
  id: string
  title: string
  report_type: string | null
  feedback: string | null
  created_at: string
  project: { title: string } | null
}

export default function ClientReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('reports')
        .select('id, title, report_type, feedback, created_at, project:project_id(title)')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false })

      if (data) setReports(data as unknown as Report[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>

  return (
    <div>
      <PageHeader title="Reports" description="Project reports and performance metrics" />

      {reports.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-foreground/50 text-sm">No reports found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#35C8E0]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-[#1A9AB5]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary text-sm">{report.title}</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">
                      {new Date(report.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {report.report_type && ` · ${report.report_type}`}
                      {report.project && ` · ${report.project.title}`}
                    </p>
                    {report.feedback && (
                      <p className="text-xs text-foreground/60 mt-1 italic">{report.feedback}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
