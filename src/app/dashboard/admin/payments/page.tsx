'use client'

import { useState, useEffect } from 'react'
import { CreditCard, TrendingUp, ArrowDownRight, Loader2, Plus, X, Search, ArrowUpRight } from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Payment = {
  id: string
  invoice_number: string
  amount: number
  payment_type: string
  status: string
  description?: string
  paid_at?: string
  created_at: string
  user: { full_name: string; email: string; role: string } | null
}

type Profile = { id: string; full_name: string; email: string; role: string }

const PAYMENT_TYPES = ['course_fee', 'consultation_fee', 'project_fee', 'subscription', 'other']
const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm font-bold text-white border-2 border-black ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ user_id: '', amount: '', payment_type: 'course_fee', description: '', status: 'pending' })

  const loadData = async () => {
    const supabase = createClient()
    const [paymentsRes, usersRes] = await Promise.all([
      supabase.from('payments').select('*, user:user_id(full_name, email, role)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email, role').order('full_name'),
    ])
    setPayments((paymentsRes.data || []) as unknown as Payment[])
    setUsers(usersRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const filtered = payments.filter(p => {
    const matchSearch = !search || p.user?.full_name.toLowerCase().includes(search.toLowerCase()) || p.invoice_number?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)
  const pending = payments.filter(p => p.status === 'pending')
  const pendingAmount = pending.reduce((s, p) => s + Number(p.amount), 0)
  const refunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + Number(p.amount), 0)

  const handleCreate = async () => {
    if (!form.user_id || !form.amount || !form.payment_type) {
      setToast({ message: 'User, amount, and type are required', type: 'error' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        setToast({ message: error || 'Failed', type: 'error' })
        return
      }
      setToast({ message: 'Payment record created', type: 'success' })
      setShowModal(false)
      setForm({ user_id: '', amount: '', payment_type: 'course_fee', description: '', status: 'pending' })
      loadData()
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await fetch(`/api/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setToast({ message: `Payment marked as ${status}`, type: 'success' })
      loadData()
    } else {
      setToast({ message: 'Failed to update', type: 'error' })
    }
  }

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`

  const statusColors: Record<string, string> = {
    all: 'bg-[#1A9AB5] text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)]',
    pending: 'bg-amber-500 text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)]',
    paid: 'bg-emerald-600 text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)]',
    failed: 'bg-red-600 text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)]',
    refunded: 'bg-purple-600 text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)]',
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={28} className="animate-spin text-[#35C8E0]" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#35C8E0] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-[#1A9AB5] shadow-[2px_2px_0px_rgba(0,0,0,0.7)] mb-3">
            <CreditCard size={12} />
            Transactions
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A9AB5] uppercase tracking-tight leading-none">Payments</h1>
          <p className="text-sm text-foreground/50 font-semibold mt-1">Track all transactions &amp; revenue</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1A9AB5] text-white text-xs font-black uppercase tracking-widest px-5 py-3 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex-shrink-0"
        >
          <Plus size={15} />
          Add Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue), sub: 'All time paid', icon: CreditCard, color: 'bg-[#35C8E0]' },
          { label: 'Pending', value: fmt(pendingAmount), sub: `${pending.length} transactions`, icon: ArrowDownRight, color: 'bg-amber-500' },
          { label: 'Refunded', value: fmt(refunded), sub: 'Total refunds', icon: TrendingUp, color: 'bg-purple-600' },
          { label: 'All Transactions', value: String(payments.length), sub: 'Total records', icon: CreditCard, color: 'bg-[#1A9AB5]' },
        ].map((card) => (
          <div key={card.label} className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 ${card.color} border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)]`}>
                <card.icon size={15} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50 leading-tight">{card.label}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#1A9AB5]">{card.value}</div>
            <div className="text-xs font-semibold text-foreground/40 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by user or invoice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border-2 border-black/15 text-sm font-semibold focus:outline-none focus:border-[#35C8E0] focus:shadow-[3px_3px_0px_rgba(53,200,224,0.2)]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'paid', 'failed', 'refunded'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all capitalize ${
                filterStatus === s
                  ? statusColors[s]
                  : 'bg-white border-black/20 text-foreground/50 hover:border-black hover:shadow-[2px_2px_0px_rgba(0,0,0,0.5)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
        <div className="px-5 py-4 border-b-2 border-black bg-[#1A9AB5]">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Transactions <span className="text-white/40">({filtered.length})</span>
          </h2>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-foreground/40 py-12 text-center font-semibold">No transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black bg-[#F4F6FA]">
                  {['Invoice', 'User', 'Type', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={`border-b border-black/8 hover:bg-[#F4F6FA] ${i % 2 === 0 ? '' : 'bg-[#FAFBFC]'}`}>
                    <td className="py-3 px-4 font-mono text-xs text-foreground/50 font-semibold">{p.invoice_number || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1A9AB5]">{p.user?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-foreground/40">{p.user?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-[#1A9AB5]/8 text-[#1A9AB5] px-2 py-1 font-black uppercase tracking-wide border border-[#1A9AB5]/20 whitespace-nowrap">
                        {typeLabel(p.payment_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-[#1A9AB5] whitespace-nowrap">{fmt(Number(p.amount))}</td>
                    <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-4 text-foreground/50 text-xs font-semibold whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusUpdate(p.id, 'paid')}
                            className="text-[10px] px-2 py-1 bg-emerald-600 text-white font-black uppercase tracking-wide hover:bg-emerald-700 transition-colors border border-emerald-800"
                          >
                            Paid
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(p.id, 'failed')}
                            className="text-[10px] px-2 py-1 bg-red-600 text-white font-black uppercase tracking-wide hover:bg-red-700 transition-colors border border-red-800"
                          >
                            Fail
                          </button>
                        </div>
                      )}
                      {p.status === 'paid' && (
                        <button
                          onClick={() => handleStatusUpdate(p.id, 'refunded')}
                          className="text-[10px] px-2 py-1 bg-purple-600 text-white font-black uppercase tracking-wide hover:bg-purple-700 transition-colors border border-purple-800"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#1A9AB5]">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Add Payment Record</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">User *</label>
                <select
                  value={form.user_id}
                  onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                  className="w-full border-2 border-black/20 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]"
                >
                  <option value="">Select user...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Amount (₹) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full border-2 border-black/20 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Type *</label>
                  <select
                    value={form.payment_type}
                    onChange={e => setForm(f => ({ ...f, payment_type: e.target.value }))}
                    className="w-full border-2 border-black/20 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]"
                  >
                    {PAYMENT_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border-2 border-black/20 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#35C8E0]"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Initial Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ val: 'pending', label: 'Pending' }, { val: 'paid', label: 'Paid' }].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: opt.val }))}
                      className={`py-2.5 text-xs font-black uppercase tracking-widest border-2 transition-all ${
                        form.status === opt.val
                          ? opt.val === 'paid'
                            ? 'bg-emerald-600 text-white border-emerald-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]'
                            : 'bg-amber-500 text-white border-amber-700 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]'
                          : 'border-black/20 text-foreground/50 hover:border-black'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest border-2 border-black/20 text-foreground/60 hover:border-black transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest bg-[#1A9AB5] text-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
                {saving ? 'Creating...' : 'Create Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
