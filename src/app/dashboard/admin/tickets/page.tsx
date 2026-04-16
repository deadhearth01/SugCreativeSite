'use client'

import { useState, useEffect } from 'react'
import { LifeBuoy, AlertCircle, CheckCircle, Clock, Loader2, X, MessageSquare, Search, UserPlus, ArrowUpRight, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Profile = { id: string; full_name: string; email: string; role: string }

type Ticket = {
  id: string
  ticket_number: string
  subject: string
  description: string
  priority: string
  status: string
  created_at: string
  created_by_profile: { full_name: string; email: string; role: string } | null
  assigned_to: string | null
  assigned_to_profile: { full_name: string; email: string } | null
}

type Reply = {
  id: string
  message: string
  created_at: string
  author: { full_name: string; role: string } | null
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm font-bold text-white border-2 border-black ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [employees, setEmployees] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyMessage, setReplyMessage] = useState('')
  const [replying, setReplying] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const loadData = async () => {
    const supabase = createClient()
    const [ticketsRes, employeesRes] = await Promise.all([
      supabase
        .from('tickets')
        .select('*, created_by_profile:created_by(full_name, email, role), assigned_to_profile:assigned_to(full_name, email)')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('role', ['admin', 'employee'])
        .order('full_name'),
    ])
    setTickets((ticketsRes.data || []) as unknown as Ticket[])
    setEmployees(employeesRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const loadReplies = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/replies`)
      if (res.ok) {
        const json = await res.json()
        setReplies(json.data || [])
      } else {
        setReplies([])
      }
    } catch {
      setReplies([])
    }
  }

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setReplyMessage('')
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
      showToast('Reply sent', 'success')
      await loadReplies(selectedTicket.id)
    } else {
      showToast('Failed to send reply', 'error')
    }
    setReplying(false)
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      showToast(`Ticket marked as ${status.replace('_', ' ')}`, 'success')
      if (selectedTicket?.id === id) setSelectedTicket(t => t ? { ...t, status } : null)
      loadData()
    } else {
      showToast('Failed to update status', 'error')
    }
  }

  const handleAssign = async (ticketId: string, assignTo: string | null) => {
    setAssigningId(ticketId)
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_to: assignTo }),
    })
    if (res.ok) {
      const assignedName = assignTo ? employees.find(e => e.id === assignTo)?.full_name : 'Unassigned'
      showToast(`Ticket assigned to ${assignedName}`, 'success')
      loadData()
    } else {
      showToast('Failed to assign ticket', 'error')
    }
    setAssigningId(null)
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
    resolved: tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
    unassigned: tickets.filter(t => !t.assigned_to && t.status !== 'closed' && t.status !== 'resolved').length,
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

  const statusBadge = (s: string) => {
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
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A9AB5] uppercase tracking-tight leading-none">Support & Tickets</h1>
          <p className="text-sm text-foreground/50 font-semibold mt-1">Manage all support tickets, assign to team members</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: LifeBuoy, color: 'bg-[#35C8E0]' },
          { label: 'Open', value: stats.open, icon: AlertCircle, color: 'bg-blue-500' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'bg-amber-500' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-emerald-600' },
          { label: 'Unassigned', value: stats.unassigned, icon: UserPlus, color: stats.unassigned > 0 ? 'bg-red-500' : 'bg-gray-500' },
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
            placeholder="Search by subject or user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border-2 border-black/15 text-sm font-semibold focus:outline-none focus:border-[#35C8E0] focus:shadow-[3px_3px_0px_rgba(53,200,224,0.2)]"
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
                  : 'bg-white border-black/20 text-foreground/50 hover:border-black hover:shadow-[2px_2px_0px_rgba(0,0,0,0.5)]'
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
                  {['#', 'Subject', 'From', 'Priority', 'Status', 'Assigned To', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id} className={`border-b border-black/8 hover:bg-[#F4F6FA] cursor-pointer ${i % 2 === 0 ? '' : 'bg-[#FAFBFC]'}`} onClick={() => openTicket(t)}>
                    <td className="py-3 px-4 font-mono text-xs text-foreground/50 font-semibold">{t.ticket_number || `#${t.id.slice(0, 6)}`}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1A9AB5] truncate max-w-48">{t.subject}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground/70 text-xs">{t.created_by_profile?.full_name || 'Unknown'}</div>
                      <div className="text-[10px] text-foreground/40 capitalize">{t.created_by_profile?.role}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border ${priorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border ${statusBadge(t.status)}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={t.assigned_to || ''}
                        onChange={e => handleAssign(t.id, e.target.value || null)}
                        disabled={assigningId === t.id}
                        className="text-xs border-2 border-black/15 px-2 py-1.5 font-semibold focus:outline-none focus:border-[#35C8E0] disabled:opacity-50 bg-white w-full max-w-32"
                      >
                        <option value="">Unassigned</option>
                        {employees.map(e => (
                          <option key={e.id} value={e.id}>{e.full_name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-foreground/50 text-xs font-semibold whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {t.status === 'open' && (
                          <button onClick={() => handleStatusUpdate(t.id, 'in_progress')} className="text-[10px] px-2 py-1 bg-amber-500 text-white font-black uppercase tracking-wide hover:bg-amber-600 transition-colors border border-amber-700">
                            Progress
                          </button>
                        )}
                        {(t.status === 'open' || t.status === 'in_progress') && (
                          <button onClick={() => handleStatusUpdate(t.id, 'resolved')} className="text-[10px] px-2 py-1 bg-emerald-600 text-white font-black uppercase tracking-wide hover:bg-emerald-700 transition-colors border border-emerald-800">
                            Resolve
                          </button>
                        )}
                        {t.status !== 'closed' && (
                          <button onClick={() => handleStatusUpdate(t.id, 'closed')} className="text-[10px] px-2 py-1 bg-gray-500 text-white font-black uppercase tracking-wide hover:bg-gray-600 transition-colors border border-gray-700">
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b-2 border-black bg-[#1A9AB5] flex-shrink-0">
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-widest text-white truncate">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 font-black uppercase tracking-wide border ${statusBadge(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 font-black uppercase tracking-wide border ${priorityBadge(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className="text-[10px] text-white/60 font-bold">
                    From: {selectedTicket.created_by_profile?.full_name} ({selectedTicket.created_by_profile?.role})
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-white/60 hover:text-white ml-4 flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <div className="px-6 py-4 border-b-2 border-black/10 bg-[#F4F6FA] flex-shrink-0">
              <p className="text-sm text-foreground/70 font-medium">{selectedTicket.description}</p>
              <div className="flex items-center gap-3 mt-3">
                {/* Status update buttons */}
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedTicket.id, 'resolved')}
                    className="text-[10px] px-3 py-1.5 bg-emerald-600 text-white font-black uppercase tracking-wide border border-emerald-800 hover:bg-emerald-700"
                  >
                    Mark Resolved
                  </button>
                )}
                {selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedTicket.id, 'closed')}
                    className="text-[10px] px-3 py-1.5 bg-gray-500 text-white font-black uppercase tracking-wide border border-gray-700 hover:bg-gray-600"
                  >
                    Close Ticket
                  </button>
                )}
                {/* Assign dropdown */}
                <select
                  value={selectedTicket.assigned_to || ''}
                  onChange={e => {
                    handleAssign(selectedTicket.id, e.target.value || null)
                    setSelectedTicket(prev => prev ? { ...prev, assigned_to: e.target.value || null } : null)
                  }}
                  className="text-xs border-2 border-black/15 px-2 py-1.5 font-semibold focus:outline-none focus:border-[#35C8E0] bg-white"
                >
                  <option value="">Assign to...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.full_name} ({e.role})</option>
                  ))}
                </select>
              </div>
              {selectedTicket.assigned_to_profile && (
                <div className="mt-2 text-xs text-foreground/50 font-semibold">
                  Assigned to: <span className="text-[#1A9AB5] font-bold">{selectedTicket.assigned_to_profile.full_name}</span>
                </div>
              )}
            </div>

            {/* Replies */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {replies.length === 0 ? (
                <p className="text-xs text-foreground/40 text-center py-4">No replies yet</p>
              ) : (
                replies.map(r => (
                  <div key={r.id} className={`flex gap-2 ${r.author?.role === 'admin' || r.author?.role === 'employee' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-7 h-7 bg-[#35C8E0]/20 border border-[#35C8E0]/30 flex items-center justify-center text-xs font-bold text-[#1A9AB5] shrink-0">
                      {r.author?.full_name?.[0] || '?'}
                    </div>
                    <div className={`max-w-[75%] px-3 py-2 ${r.author?.role === 'admin' || r.author?.role === 'employee' ? 'bg-[#1A9AB5] text-white border-2 border-[#1A9AB5]' : 'bg-[#F4F6FA] border-2 border-black/10'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${r.author?.role === 'admin' || r.author?.role === 'employee' ? 'text-white/60' : 'text-foreground/40'}`}>
                        {r.author?.full_name} ({r.author?.role})
                      </p>
                      <p className="text-sm">{r.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply input */}
            <div className="px-6 py-4 border-t-2 border-black flex-shrink-0">
              <div className="flex gap-2">
                <input
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply()}
                  className="flex-1 border-2 border-black/15 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0] focus:shadow-[3px_3px_0px_rgba(53,200,224,0.2)]"
                  placeholder="Type a reply..."
                />
                <button
                  onClick={handleReply}
                  disabled={replying || !replyMessage.trim()}
                  className="px-4 py-2.5 bg-[#1A9AB5] text-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50"
                >
                  {replying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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
