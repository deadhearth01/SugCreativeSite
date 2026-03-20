'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader, DashboardTable, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Plus, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Ticket = {
  id: string
  ticket_number: string | null
  subject: string
  status: string
  priority: string | null
  created_at: string
  ticket_replies: { count: number }[]
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function ClientTicketsPage() {
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' })

  const loadTickets = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tickets')
      .select('id, ticket_number, subject, status, priority, created_at, ticket_replies(count)')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (data) setTickets(data as Ticket[])
    setLoading(false)
  }, [])

  useEffect(() => { loadTickets() }, [loadTickets])

  const handleSubmit = async () => {
    if (!form.subject.trim()) { setToast({ message: 'Subject is required', type: 'error' }); return }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('tickets').insert({
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        created_by: user.id,
        status: 'open',
      })

      if (error) {
        setToast({ message: error.message || 'Failed to create ticket', type: 'error' })
      } else {
        setToast({ message: 'Ticket created successfully', type: 'success' })
        setShowModal(false)
        setForm({ subject: '', description: '', priority: 'medium' })
        loadTickets()
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div>
      <PageHeader
        title="Support & Tickets"
        description="Get help with your projects or billing"
        action={
          <button onClick={() => setShowModal(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} /> New Ticket
          </button>
        }
      />

      <div className="bg-white border border-border rounded-xl">
        {tickets.length === 0 ? (
          <p className="text-sm text-foreground/50 py-10 text-center">No tickets yet. Create one if you need help.</p>
        ) : (
          <DashboardTable
            headers={['Ticket #', 'Subject', 'Priority', 'Replies', 'Status', 'Created']}
            rows={tickets.map((t) => [
              <span key="id" className="font-mono text-xs text-foreground/60">{t.ticket_number || `#${t.id.slice(0, 6)}`}</span>,
              <span key="s" className="font-medium text-primary">{t.subject}</span>,
              <span key="p" className={`text-xs font-semibold px-2 py-1 rounded capitalize ${t.priority === 'high' ? 'bg-red-100 text-red-700' : t.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{t.priority || '—'}</span>,
              <span key="r" className="text-foreground/60 text-xs">{t.ticket_replies?.[0]?.count ?? 0}</span>,
              <StatusBadge key="st" status={t.status} />,
              <span key="c" className="text-foreground/50 text-xs">{new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>,
            ])}
          />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-heading font-bold text-primary">New Support Ticket</h3>
                <p className="text-xs text-foreground/50 mt-0.5">Describe your issue and our team will assist you</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Subject *</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright"
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright resize-none"
                  rows={4}
                  placeholder="Provide more details about your issue..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
