'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Plus, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Report = {
  id: string
  title: string
  report_type: string
  content: string
  status: string
  feedback: string | null
  created_at: string
  project: { title: string } | null
}

type Toast = { message: string; type: 'success' | 'error' }

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function InternReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [form, setForm] = useState({
    title: '',
    report_type: 'intern_weekly',
    content: '',
  })

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const fetchReports = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('reports')
      .select('*, project:project_id(title)')
      .eq('submitted_by', user.id)
      .order('created_at', { ascending: false })

    setReports((data as unknown as Report[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        showToast('Report submitted successfully!', 'success')
        setShowModal(false)
        setForm({ title: '', report_type: 'intern_weekly', content: '' })
        await fetchReports()
      } else {
        showToast('Failed to submit report.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const reportRows = reports.map((r) => [
    <div key="info">
      <p className="font-medium text-primary text-sm">{r.title}</p>
      {r.project && <p className="text-xs text-foreground/40 mt-0.5">{(r.project as { title: string }).title}</p>}
    </div>,
    <span key="type" className="text-xs bg-off-white px-2 py-1 rounded font-medium text-foreground/60 capitalize">
      {r.report_type.replace(/_/g, ' ')}
    </span>,
    <span key="date" className="text-foreground/50 text-xs">
      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>,
    <StatusBadge key="st" status={r.status} />,
    <span key="f" className="text-foreground/60 text-sm">{r.feedback || '—'}</span>,
  ])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-primary-bright" />
      </div>
    )
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Reports"
        description="Submit your weekly and final internship reports"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> New Report
          </button>
        }
      />

      <div className="bg-white border border-border rounded-xl">
        {reportRows.length > 0 ? (
          <DashboardTable headers={['Report', 'Type', 'Submitted', 'Status', 'Feedback']} rows={reportRows} />
        ) : (
          <p className="text-sm text-foreground/40 py-12 text-center">No reports submitted yet</p>
        )}
      </div>

      {/* Submit Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-heading font-bold text-primary">Submit Report</h3>
                <p className="text-xs text-foreground/50 mt-0.5">Share your progress with your mentor</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-off-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Week 3 — Content Creation"
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Report Type</label>
                <select
                  value={form.report_type}
                  onChange={(e) => setForm({ ...form, report_type: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright bg-white"
                >
                  <option value="intern_weekly">Weekly Report</option>
                  <option value="intern_final">Final Report</option>
                  <option value="task_report">Task Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Content</label>
                <textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Describe what you worked on, your learnings, and any challenges..."
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.title.trim() || !form.content.trim()}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
