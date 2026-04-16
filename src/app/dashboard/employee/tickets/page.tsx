'use client'

import { useEffect, useState } from 'react'
import { LifeBuoy, Plus, X, MessageSquare, Loader2, Send, Search, Clock, CheckCircle, AlertCircle, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type TicketReply = {
  id: string
  message: string
  created_at: string
  user_id: string
  author?: { full_name: string; role: string } | null
}

type Ticket = {
  id: string
  ticket_number: string | null
  subject: string
  description: string
  status: string
  priority: string
  created_at: string
  created_by: string
  assigned_to: string | null
  created_by_profile: { full_name: string; role: string } | null
  assigned_to_profile: { full_name: string } | null
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm font-bold text-white border-2 border-black ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function EmployeeTicketsPage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<TicketReply[]>([])
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' })

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const fetchTickets = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    const { data } = await supabase
      .from('tickets')
      .select('*, created_by_profile:created_by(full_name, role), assigned_to_profile:assigned_to(full_name)')
      .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
      .order('created_at', { ascending: false })

    setTickets((data as unknown as Ticket[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchTickets() }, [])

  const fetchReplies = async (ticketId: string) => {
    setRepliesLoading(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/replies`)
      if (res.ok) {
        const json = await res.json()
        setReplies((json.data as TicketReply[]) || [])
      } else setReplies([])
    } catch { setReplies([]) }
    setRepliesLoading(false)
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
        showToast('Ticket created', 'success')
        setShowCreateModal(false)
        setForm({ subject: '', description: '', priority: 'medium' })
        await fetchTickets()
      } else showToast('Failed to create ticket', 'error')
    } catch { showToast('Error occurred', 'error') }
    finally { setCreating(false) }
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
      } else showToast('Failed to send reply', 'error')
    } catch { showToast('Error occurred', 'error') }
    finally { setSubmittingReply(false) }
  }

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      showToast(`Ticket marked as ${newStatus.replace('_', ' ')}`, 'success')
      await fetchTickets()
      if (selectedTicket?.id === ticketId) setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null)
    } else showToast('Failed to update status', 'error')
  }

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: tickets.length,
    assigned: tickets.filter(t => t.assigned_to === userId && t.created_by !== userId).length,
    myTickets: tickets.filter(t => t.created_by === userId).length,
    open: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
  }

  const priorityBadge = (p: string) => {
    const styles: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-gray-100 text-gray-600 border-gray-200',
    }
    return styles[p] || styles.low
  }

  const statusBadgeStyle = (s: string) => {
    const styles: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
      resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      closed: 'bg-gray-100 text-gray-600 border-gray-200',
    }
    return styles[s] || styles.open
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#35C8E0]" /></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#35C8E0] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-[#1A9AB5] shadow-[2px_2px_0px_rgba(0,0,0,0.7)] mb-3">
            <LifeBuoy size={12} />
            Support
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A9AB5] uppercase tracking-tight leading-none">Support Tickets</h1>
          <p className="text-sm text-foreground/50 font-semibold mt-1">Your tickets and assigned support requests</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#1A9AB5] text-white text-xs font-black uppercase tracking-widest px-5 py-3 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex-shrink-0"
        >
          <Plus size={15} />
          New Ticket
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: LifeBuoy, color: 'bg-[#35C8E0]' },
          { label: 'Assigned to Me', value: stats.assigned, icon: UserPlus, color: 'bg-purple-600' },
          { label: 'My Tickets', value: stats.myTickets, icon: MessageSquare, color: 'bg-[#1A9AB5]' },
          { label: 'Active', value: stats.open, icon: AlertCircle, color: 'bg-amber-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 ${card.color} border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)]`}>
                <card.icon size={15} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{card.label}</span>
            </div>
            <div className="text-2xl font-black text-[#1A9AB5]">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border-2 border-black/15 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all capitalize ${
                filterStatus === s
                  ? 'bg-[#1A9AB5] text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)]'
                  : 'bg-white border-black/20 text-foreground/50 hover:border-black'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
        <div className="px-5 py-4 border-b-2 border-black bg-[#1A9AB5]">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Tickets <span className="text-white/40">({filtered.length})</span>
          </h2>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-foreground/40 py-12 text-center font-semibold">No tickets found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black bg-[#F4F6FA]">
                  {['Subject', 'Priority', 'Status', 'From', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const isAssigned = t.assigned_to === userId && t.created_by !== userId
                  return (
                    <tr
                      key={t.id}
                      className={`border-b border-black/8 hover:bg-[#F4F6FA] cursor-pointer ${i % 2 === 0 ? '' : 'bg-[#FAFBFC]'}`}
                      onClick={() => { setSelectedTicket(t); fetchReplies(t.id) }}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1A9AB5]">{t.subject}</div>
                        {isAssigned && (
                          <div className="text-[10px] text-purple-600 font-black uppercase tracking-wide mt-0.5">
                            Assigned by: {t.created_by_profile?.full_name || 'Admin'}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border ${priorityBadge(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border ${statusBadgeStyle(t.status)}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-foreground/60 font-semibold">
                        {t.created_by_profile?.full_name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-foreground/50 text-xs font-semibold whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        {isAssigned && (t.status === 'open' || t.status === 'in_progress') && (
                          <div className="flex gap-1">
                            {t.status === 'open' && (
                              <button onClick={() => handleStatusUpdate(t.id, 'in_progress')} className="text-[10px] px-2 py-1 bg-amber-500 text-white font-black uppercase tracking-wide border border-amber-700">
                                Progress
                              </button>
                            )}
                            <button onClick={() => handleStatusUpdate(t.id, 'resolved')} className="text-[10px] px-2 py-1 bg-emerald-600 text-white font-black uppercase tracking-wide border border-emerald-800">
                              Resolve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#1A9AB5]">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">New Support Ticket</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Subject *</label>
                <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full border-2 border-black/20 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]" placeholder="Brief summary" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border-2 border-black/20 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0] resize-none" rows={4} placeholder="Describe your issue..." />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map(p => (
                    <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                      className={`py-2 text-xs font-black uppercase tracking-widest border-2 transition-all capitalize ${
                        form.priority === p
                          ? p === 'high' ? 'bg-red-600 text-white border-red-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]'
                          : p === 'medium' ? 'bg-amber-500 text-white border-amber-700 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]'
                          : 'bg-gray-500 text-white border-gray-700 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]'
                          : 'border-black/20 text-foreground/50 hover:border-black'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest border-2 border-black/20 text-foreground/60 hover:border-black">Cancel</button>
              <button onClick={handleCreateTicket} disabled={creating} className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest bg-[#1A9AB5] text-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between px-6 py-4 border-b-2 border-black bg-[#1A9AB5] flex-shrink-0">
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-widest text-white truncate">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 font-black uppercase tracking-wide border ${statusBadgeStyle(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 font-black uppercase tracking-wide border ${priorityBadge(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                  {selectedTicket.assigned_to === userId && selectedTicket.created_by !== userId && (
                    <span className="text-[10px] text-white/60 font-bold">Assigned by admin</span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-white/60 hover:text-white ml-4 flex-shrink-0"><X size={18} /></button>
            </div>

            <div className="px-6 py-4 border-b-2 border-black/10 bg-[#F4F6FA] flex-shrink-0">
              <p className="text-sm text-foreground/70 font-medium">{selectedTicket.description}</p>
              {selectedTicket.assigned_to === userId && (selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                <div className="flex gap-2 mt-3">
                  {selectedTicket.status === 'open' && (
                    <button onClick={() => handleStatusUpdate(selectedTicket.id, 'in_progress')} className="text-[10px] px-3 py-1.5 bg-amber-500 text-white font-black uppercase tracking-wide border border-amber-700">In Progress</button>
                  )}
                  <button onClick={() => handleStatusUpdate(selectedTicket.id, 'resolved')} className="text-[10px] px-3 py-1.5 bg-emerald-600 text-white font-black uppercase tracking-wide border border-emerald-800">Resolve</button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {repliesLoading ? (
                <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-[#1A9AB5]" /></div>
              ) : replies.length === 0 ? (
                <p className="text-xs text-foreground/40 text-center py-4">No replies yet</p>
              ) : (
                replies.map(r => {
                  const isStaff = r.author?.role === 'admin' || r.author?.role === 'employee'
                  return (
                    <div key={r.id} className={`flex gap-2 ${isStaff ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 bg-[#35C8E0]/20 border border-[#35C8E0]/30 flex items-center justify-center text-xs font-bold text-[#1A9AB5] shrink-0">
                        {r.author?.full_name?.[0] || '?'}
                      </div>
                      <div className={`max-w-[75%] px-3 py-2 ${isStaff ? 'bg-[#1A9AB5] text-white border-2 border-[#1A9AB5]' : 'bg-[#F4F6FA] border-2 border-black/10'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isStaff ? 'text-white/60' : 'text-foreground/40'}`}>
                          {r.author?.full_name}
                        </p>
                        <p className="text-sm">{r.message}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="px-6 py-4 border-t-2 border-black flex-shrink-0">
              <div className="flex gap-2">
                <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddReply()}
                  className="flex-1 border-2 border-black/15 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]" placeholder="Type a reply..." />
                <button onClick={handleAddReply} disabled={submittingReply || !replyText.trim()}
                  className="px-4 py-2.5 bg-[#1A9AB5] text-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] disabled:opacity-50">
                  {submittingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
