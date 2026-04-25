'use client'

import { useState, useEffect } from 'react'
import { MessageSquareMore, Loader2, X, Search, Trash2, Mail, Phone, Globe, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Query = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  service: string | null
  source: string
  status: string
  created_at: string
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-md text-sm font-bold text-white border border-border rounded-xl ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function SiteQueriesPage() {
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const loadQueries = async () => {
    try {
      const res = await fetch('/api/site-queries')
      if (res.ok) {
        const { data } = await res.json()
        setQueries(data || [])
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { loadQueries() }, [])

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await fetch(`/api/site-queries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      showToast(`Marked as ${status}`, 'success')
      loadQueries()
      if (selectedQuery?.id === id) setSelectedQuery(prev => prev ? { ...prev, status } : null)
    } else {
      showToast('Failed to update', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this query?')) return
    const res = await fetch(`/api/site-queries/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Deleted', 'success')
      setQueries(prev => prev.filter(q => q.id !== id))
      if (selectedQuery?.id === id) setSelectedQuery(null)
    } else {
      showToast('Failed to delete', 'error')
    }
  }

  const filtered = queries.filter(q => {
    const matchSearch = !search || q.name.toLowerCase().includes(search.toLowerCase()) || q.email.toLowerCase().includes(search.toLowerCase()) || q.subject?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || q.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: queries.length,
    new: queries.filter(q => q.status === 'new').length,
    contacted: queries.filter(q => q.status === 'contacted').length,
    closed: queries.filter(q => q.status === 'closed').length,
  }

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      contacted: 'bg-amber-100 text-amber-700 border-amber-200',
      closed: 'bg-gray-100 text-gray-600 border-gray-200',
    }
    return styles[s] || styles.new
  }

  const sourceBadge = (s: string) => s === 'footer_newsletter' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-[#1A9AB5]/10 text-[#1A9AB5] border-[#1A9AB5]/20'

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#35C8E0]" /></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-[#35C8E0] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-[#1A9AB5] rounded-lg shadow-sm mb-3">
          <MessageSquareMore size={12} />
          Leads
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A9AB5] uppercase tracking-tight leading-none">Site Queries</h1>
        <p className="text-sm text-foreground/50 font-semibold mt-1">Contact form submissions &amp; newsletter signups</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-[#35C8E0]' },
          { label: 'New', value: stats.new, color: stats.new > 0 ? 'bg-blue-500' : 'bg-gray-400' },
          { label: 'Contacted', value: stats.contacted, color: 'bg-amber-500' },
          { label: 'Closed', value: stats.closed, color: 'bg-gray-500' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-border rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 ${card.color} border border-border rounded-xl flex items-center justify-center shadow-sm`}>
                <MessageSquareMore size={15} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{card.label}</span>
            </div>
            <div className="text-2xl font-black text-[#1A9AB5]">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-xl shadow-md p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input type="text" placeholder="Search by name, email, subject..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm font-semibold focus:outline-none focus:border-[#35C8E0]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'new', 'contacted', 'closed'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border rounded-lg transition-all capitalize ${
                filterStatus === s ? 'bg-[#1A9AB5] text-white border-[#1A9AB5] shadow-sm' : 'bg-white border-border text-foreground/50 hover:border-[#1A9AB5]'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-border bg-[#1A9AB5] rounded-t-2xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Queries <span className="text-white/40">({filtered.length})</span>
          </h2>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-foreground/40 py-12 text-center font-semibold">No queries found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#F4F6FA]">
                  {['Date', 'Name', 'Email', 'Phone', 'Source', 'Subject', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => (
                  <tr key={q.id} className={`border-b border-black/8 hover:bg-[#F4F6FA] cursor-pointer ${i % 2 === 0 ? '' : 'bg-[#FAFBFC]'}`} onClick={() => setSelectedQuery(q)}>
                    <td className="py-3 px-4 text-xs text-foreground/50 font-semibold whitespace-nowrap">
                      {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1A9AB5]">{q.name}</td>
                    <td className="py-3 px-4 text-xs text-foreground/60">{q.email}</td>
                    <td className="py-3 px-4 text-xs text-foreground/50">{q.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border ${sourceBadge(q.source)}`}>
                        {q.source === 'footer_newsletter' ? 'Newsletter' : 'Contact'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-foreground/60 truncate max-w-32">{q.subject || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border ${statusBadge(q.status)}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {q.status === 'new' && (
                          <button onClick={() => handleStatusUpdate(q.id, 'contacted')} className="text-[10px] px-2 py-1 bg-amber-500 text-white font-black uppercase tracking-wide border border-amber-700">
                            Contacted
                          </button>
                        )}
                        {q.status !== 'closed' && (
                          <button onClick={() => handleStatusUpdate(q.id, 'closed')} className="text-[10px] px-2 py-1 bg-gray-500 text-white font-black uppercase tracking-wide border border-gray-700">
                            Close
                          </button>
                        )}
                        <button onClick={() => handleDelete(q.id)} className="text-foreground/30 hover:text-red-500 p-1 hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#1A9AB5] rounded-t-2xl">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Query Details</h2>
              <button onClick={() => setSelectedQuery(null)} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1A9AB5] border border-border rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                  {selectedQuery.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-black text-[#1A9AB5] text-lg">{selectedQuery.name}</div>
                  <div className="flex items-center gap-3 text-xs text-foreground/50">
                    <span className="flex items-center gap-1"><Mail size={10} /> {selectedQuery.email}</span>
                    {selectedQuery.phone && <span className="flex items-center gap-1"><Phone size={10} /> {selectedQuery.phone}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border ${statusBadge(selectedQuery.status)}`}>{selectedQuery.status}</span>
                <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border ${sourceBadge(selectedQuery.source)}`}>
                  {selectedQuery.source === 'footer_newsletter' ? 'Newsletter' : 'Contact Form'}
                </span>
                {selectedQuery.service && (
                  <span className="text-[10px] px-2 py-1 font-black uppercase tracking-wide border bg-emerald-50 text-emerald-700 border-emerald-200">{selectedQuery.service}</span>
                )}
              </div>
              {selectedQuery.subject && (
                <div>
                  <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Subject</label>
                  <p className="text-sm font-bold text-foreground/80 mt-1">{selectedQuery.subject}</p>
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Message</label>
                <p className="text-sm text-foreground/70 mt-1 leading-relaxed bg-[#F4F6FA] border border-border rounded-xl/10 p-4">{selectedQuery.message}</p>
              </div>
              <div className="text-xs text-foreground/40 font-semibold">
                Received {new Date(selectedQuery.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              {selectedQuery.status === 'new' && (
                <button onClick={() => handleStatusUpdate(selectedQuery.id, 'contacted')}
                  className="flex-1 py-2.5 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                  Mark Contacted
                </button>
              )}
              {selectedQuery.status !== 'closed' && (
                <button onClick={() => handleStatusUpdate(selectedQuery.id, 'closed')}
                  className="flex-1 py-2.5 text-sm font-semibold bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                  Close
                </button>
              )}
              <a href={`mailto:${selectedQuery.email}`}
                className="flex-1 py-2.5 text-sm font-semibold bg-[#1A9AB5] text-white rounded-lg hover:bg-[#158da5] text-center flex items-center justify-center gap-2">
                <Mail size={12} /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
