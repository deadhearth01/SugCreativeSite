'use client'

import { useState, useEffect } from 'react'
import { LifeBuoy, AlertCircle, CheckCircle, Clock, Loader2, X, MessageSquare, Search } from 'lucide-react'
import { PageHeader, StatCard, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Ticket = {
  id: string
  ticket_number: string
  subject: string
  description: string
  priority: string
  status: string
  created_at: string
  created_by_profile: { full_name: string; email: string; role: string } | null
  assigned_to_profile: { full_name: string } | null
}

type Reply = {
  id: string
  message: string
  created_at: string
  author: { full_name: string; role: string } | null
}

const priorityStyles: Record<string, string> = {
  urgent: 'text-red-600 font-bold',
  high: 'text-red-600 font-semibold',
  medium: 'text-yellow-600 font-semibold',
  low: 'text-foreground/50',
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyMessage, setReplyMessage] = useState('')
  const [replying, setReplying] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const loadTickets = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tickets')
      .select('*, created_by_profile:created_by(full_name, email, role), assigned_to_profile:assigned_to(full_name)')
      .order('created_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }

  useEffect(() => { loadTickets() }, [])

  const loadReplies = async (ticketId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('ticket_replies')
      .select('*, author:author_id(full_name, role)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    setReplies(data || [])
  }

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket)
    await loadReplies(ticket.id)
  }

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return
    setReplying(true)
    const res = await fetch(`/api/tickets/${selectedTicket.id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: replyMessage }),
    })
    if (res.ok) {
      setReplyMessage('')
      setToast({ message: 'Reply sent', type: 'success' })
      await loadReplies(selectedTicket.id)
      loadTickets()
    } else {
      setToast({ message: 'Failed to send reply', type: 'error' })
    }
    setReplying(false)
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await fetch(`/api/tickets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) {
      setToast({ message: `Ticket marked as ${status}`, type: 'success' })
      if (selectedTicket?.id === id) setSelectedTicket(t => t ? { ...t, status } : null)
      loadTickets()
    }
  }

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.created_by_profile?.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#1A9AB5]" /></div>

  return (
    <div className="space-y-6">
      <PageHeader title="Support & Tickets" description="Manage all support tickets from users" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={String(stats.total)} icon={LifeBuoy} color="navy" />
        <StatCard label="Open" value={String(stats.open)} change="Need attention" icon={AlertCircle} color="sky" />
        <StatCard label="In Progress" value={String(stats.inProgress)} icon={Clock} color="teal" />
        <StatCard label="Resolved" value={String(stats.resolved)} icon={CheckCircle} color="mint" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-[#35C8E0]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filterStatus === s ? 'bg-primary text-white' : 'bg-off-white text-foreground/60 hover:text-primary'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-primary">Tickets ({filtered.length})</h3>
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-foreground/40 py-8 text-center">No tickets found</p>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {filtered.map(t => (
                <button key={t.id} onClick={() => openTicket(t)} className={`w-full text-left p-4 hover:bg-off-white/50 transition-colors ${selectedTicket?.id === t.id ? 'bg-[#35C8E0]/10 border-l-2 border-[#35C8E0]' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-foreground/50">{t.ticket_number}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="font-medium text-primary text-sm truncate">{t.subject}</p>
                      <p className="text-xs text-foreground/50 mt-0.5">{t.created_by_profile?.full_name} · {new Date(t.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className={`text-xs capitalize ${priorityStyles[t.priority] || ''}`}>{t.priority}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-primary">{selectedTicket.subject}</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">From: {selectedTicket.created_by_profile?.full_name} ({selectedTicket.created_by_profile?.role})</p>
                  </div>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <p className="text-sm text-foreground/60 mt-3">{selectedTicket.description}</p>
                <div className="flex gap-2 mt-3">
                  {['in_progress', 'resolved', 'closed'].map(s => (
                    selectedTicket.status !== s && (
                      <button key={s} onClick={() => handleStatusUpdate(selectedTicket.id, s)}
                        className="text-xs px-2 py-1 rounded border border-border text-foreground/60 hover:border-[#35C8E0] hover:text-primary capitalize transition-colors">
                        Mark {s.replace('_', ' ')}
                      </button>
                    )
                  ))}
                </div>
              </div>

              <div className="flex-1 p-4 space-y-3 max-h-[350px] overflow-y-auto">
                {replies.length === 0 ? (
                  <p className="text-xs text-foreground/40 text-center py-4">No replies yet</p>
                ) : (
                  replies.map(r => (
                    <div key={r.id} className={`flex gap-2 ${r.author?.role === 'admin' || r.author?.role === 'employee' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-full bg-[#35C8E0]/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {r.author?.full_name?.[0] || '?'}
                      </div>
                      <div className={`max-w-[75%] ${r.author?.role === 'admin' || r.author?.role === 'employee' ? 'bg-primary text-white' : 'bg-off-white'} rounded-xl px-3 py-2`}>
                        <p className={`text-xs font-semibold mb-0.5 ${r.author?.role === 'admin' || r.author?.role === 'employee' ? 'text-white/80' : 'text-foreground/60'}`}>{r.author?.full_name}</p>
                        <p className="text-sm">{r.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input value={replyMessage} onChange={e => setReplyMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply()}
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" placeholder="Type a reply..." />
                  <button onClick={handleReply} disabled={replying || !replyMessage.trim()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    <MessageSquare size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-foreground/30 text-sm">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
