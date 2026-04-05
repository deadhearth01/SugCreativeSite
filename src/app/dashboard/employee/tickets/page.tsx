'use client'

import { useEffect, useState } from 'react'
import { PageHeader, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Plus, X, ChevronRight, MessageSquare, Loader2, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type TicketReply = {
  id: string
  message: string
  created_at: string
  user_id: string
  author?: { full_name: string } | null
}

type Ticket = {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  created_at: string
  created_by: string
  assigned_to: string | null
  created_by_profile: { full_name: string } | null
  ticket_replies: { count: number }[]
}

type Toast = { message: string; type: 'success' | 'error' }
type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed'

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function EmployeeTicketsPage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<TicketReply[]>([])
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' })

  const showToastMsg = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const fetchTickets = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    const { data } = await supabase
      .from('tickets')
      .select('*, created_by_profile:created_by(full_name), ticket_replies(count)')
      .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
      .order('created_at', { ascending: false })

    setTickets((data as unknown as Ticket[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchTickets() }, [])

  const fetchReplies = async (ticketId: string) => {
    setRepliesLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('ticket_replies')
      .select('id, message, created_at, user_id, author:user_id(full_name)')
      .eq('ticket_id', ticketId)
      .order('created_at')
    setReplies((data as unknown as TicketReply[]) || [])
    setRepliesLoading(false)
  }

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    fetchReplies(ticket.id)
  }

  const handleCreateTicket = async () => {
    if (!form.subject.trim() || !form.description.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        showToastMsg('Ticket created successfully!', 'success')
        setShowCreateModal(false)
        setForm({ subject: '', description: '', priority: 'medium' })
        await fetchTickets()
      } else {
        showToastMsg('Failed to create ticket.', 'error')
      }
    } catch {
      showToastMsg('An error occurred.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleAddReply = async () => {
    if (!replyText.trim() || !selectedTicket) return
    setSubmittingReply(true)
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() }),
      })
      if (res.ok) {
        setReplyText('')
        await fetchReplies(selectedTicket.id)
      } else {
        showToastMsg('Failed to send reply.', 'error')
      }
    } catch {
      showToastMsg('An error occurred.', 'error')
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        showToastMsg('Status updated!', 'success')
        await fetchTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket((prev) => prev ? { ...prev, status: newStatus } : null)
        }
      } else {
        showToastMsg('Failed to update status.', 'error')
      }
    } catch {
      showToastMsg('An error occurred.', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const filteredTickets = tickets.filter((t) =>
    statusFilter === 'all' ? true : t.status === statusFilter
  )

  const statusTabs: StatusFilter[] = ['all', 'open', 'in_progress', 'resolved', 'closed']

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Support Tickets"
        description="Tickets you created or are assigned to resolve"
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> New Ticket
          </button>
        }
      />

      <div className="flex border border-border rounded-lg overflow-hidden mb-6 w-fit flex-wrap">
        {statusTabs.map((t) => {
          const count = t === 'all' ? tickets.length : tickets.filter((tk) => tk.status === t).length
          return (
            <button
              key={t}
              onClick={() => setStatusFilter(t)}
              className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${statusFilter === t ? 'bg-primary text-white' : 'hover:bg-off-white text-foreground/60'}`}
            >
              {t.replace('_', ' ')} ({count})
            </button>
          )
        })}
      </div>

      {filteredTickets.length === 0 ? (
        <p className="text-sm text-foreground/40 py-8 text-center">No tickets found</p>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const replyCount = ticket.ticket_replies?.[0]?.count ?? 0
            const isAssigned = ticket.assigned_to === userId && ticket.created_by !== userId
            return (
              <div
                key={ticket.id}
                onClick={() => handleOpenTicket(ticket)}
                className="bg-white border border-border rounded-xl p-5 hover:shadow-sm hover:border-[#35C8E0]/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <MessageSquare size={18} className="text-[#1A9AB5] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h3 className="font-medium text-primary truncate">{ticket.subject}</h3>
                      <p className="text-xs text-foreground/50 mt-0.5 line-clamp-1">{ticket.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-foreground/40">
                          {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${ticket.priority === 'high' || ticket.priority === 'urgent' ? 'bg-red-50 text-red-600' : ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                          {ticket.priority}
                        </span>
                        {isAssigned && (
                          <span className="text-xs px-2 py-0.5 rounded font-medium bg-[#35C8E0]/20 text-primary">assigned to you</span>
                        )}
                        {replyCount > 0 && (
                          <span className="text-xs text-foreground/40">{replyCount} repl{replyCount === 1 ? 'y' : 'ies'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={ticket.status} />
                    <ChevronRight size={16} className="text-foreground/30" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-heading font-bold text-primary">New Support Ticket</h3>
                <p className="text-xs text-foreground/50 mt-0.5">Describe your issue and we&apos;ll get back to you</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-off-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief summary of your issue"
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={creating || !form.subject.trim() || !form.description.trim()}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <div className="min-w-0">
                <h3 className="text-lg font-heading font-bold text-primary truncate">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge status={selectedTicket.status} />
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${selectedTicket.priority === 'high' || selectedTicket.priority === 'urgent' ? 'bg-red-50 text-red-600' : selectedTicket.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                    {selectedTicket.priority} priority
                  </span>
                  {selectedTicket.assigned_to === userId && (
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                      disabled={updatingStatus}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs border border-border rounded px-2 py-1 bg-white focus:outline-none focus:border-[#35C8E0] disabled:opacity-60"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1 rounded-lg hover:bg-off-white transition-colors flex-shrink-0 ml-4">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="bg-off-white rounded-lg p-4">
                <p className="text-xs text-foreground/50 mb-1">Original message</p>
                <p className="text-sm text-primary">{selectedTicket.description}</p>
              </div>

              {repliesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-[#1A9AB5]" />
                </div>
              ) : replies.length === 0 ? (
                <p className="text-sm text-foreground/40 py-4 text-center">No replies yet</p>
              ) : (
                <div className="space-y-3">
                  {replies.map((reply) => {
                    const author = reply.author as { full_name: string } | null
                    return (
                      <div key={reply.id} className="bg-white border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-primary">{author?.full_name || 'Support Team'}</span>
                          <span className="text-xs text-foreground/40">
                            {new Date(reply.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/70">{reply.message}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex-shrink-0">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddReply()}
                  placeholder="Type your reply..."
                  className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                />
                <button
                  onClick={handleAddReply}
                  disabled={submittingReply || !replyText.trim()}
                  className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {submittingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
