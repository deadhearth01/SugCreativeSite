'use client'

import { useState, useEffect } from 'react'
import { CreditCard, TrendingUp, ArrowDownRight, Loader2, Plus, X, Search } from 'lucide-react'
import { PageHeader, StatCard, DashboardPanel, StatusBadge } from '@/components/dashboard/DashboardUI'
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
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
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
    setPayments(paymentsRes.data || [])
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
    if (!form.user_id || !form.amount || !form.payment_type) { setToast({ message: 'User, amount, and type are required', type: 'error' }); return }
    setSaving(true)
    try {
      const res = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }) })
      if (!res.ok) { const { error } = await res.json(); setToast({ message: error || 'Failed', type: 'error' }); return }
      setToast({ message: 'Payment record created', type: 'success' })
      setShowModal(false)
      loadData()
    } finally { setSaving(false) }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await fetch(`/api/payments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) { setToast({ message: `Payment marked as ${status}`, type: 'success' }); loadData() }
    else setToast({ message: 'Failed to update', type: 'error' })
  }

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track all transactions & revenue"
        action={
          <button onClick={() => setShowModal(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} /> Add Payment
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmt(totalRevenue)} change="All time paid" trend="up" icon={CreditCard} color="navy" />
        <StatCard label="Pending" value={fmt(pendingAmount)} change={`${pending.length} transactions`} icon={ArrowDownRight} color="sky" />
        <StatCard label="Refunded" value={fmt(refunded)} icon={TrendingUp} color="mint" />
        <StatCard label="Total Transactions" value={String(payments.length)} icon={CreditCard} color="teal" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input type="text" placeholder="Search by user or invoice..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary-bright" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'paid', 'failed', 'refunded'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filterStatus === s ? 'bg-primary text-white' : 'bg-off-white text-foreground/60 hover:text-primary'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <DashboardPanel title={`Transactions (${filtered.length})`}>
        {filtered.length === 0 ? (
          <p className="text-sm text-foreground/40 py-8 text-center">No transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Invoice', 'User', 'Type', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-foreground/50 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-off-white/50">
                    <td className="py-3 px-4 font-mono text-xs text-foreground/60">{p.invoice_number || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-primary">{p.user?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-foreground/40">{p.user?.email}</div>
                    </td>
                    <td className="py-3 px-4"><span className="text-xs bg-off-white px-2 py-1 rounded-md font-medium">{typeLabel(p.payment_type)}</span></td>
                    <td className="py-3 px-4 font-semibold text-primary">{fmt(Number(p.amount))}</td>
                    <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-4 text-foreground/50 text-xs">{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="py-3 px-4">
                      {p.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleStatusUpdate(p.id, 'paid')} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-semibold hover:bg-emerald-200 transition-colors">Mark Paid</button>
                          <button onClick={() => handleStatusUpdate(p.id, 'failed')} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-semibold hover:bg-red-200 transition-colors">Fail</button>
                        </div>
                      )}
                      {p.status === 'paid' && (
                        <button onClick={() => handleStatusUpdate(p.id, 'refunded')} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded font-semibold hover:bg-orange-200 transition-colors">Refund</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardPanel>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">Add Payment Record</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-foreground/40" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">User *</label>
                <select value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright">
                  <option value="">Select user...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" min="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Type *</label>
                  <select value={form.payment_type} onChange={e => setForm(f => ({ ...f, payment_type: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright">
                    {PAYMENT_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" placeholder="Optional description" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Initial Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground/60 hover:bg-off-white transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
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
