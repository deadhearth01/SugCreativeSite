'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, Edit, Loader2, X } from 'lucide-react'
import { PageHeader, DashboardPanel, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type BudgetEntry = {
  id: string
  title: string
  amount: number
  category: string
  is_income: boolean
  date: string
  description?: string
  created_at: string
}

const CATEGORIES = [
  'marketing', 'operations', 'salaries', 'infrastructure', 'tools', 'events', 'other',
]

const categoryLabel = (c: string) => c.charAt(0).toUpperCase() + c.slice(1)

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function BudgetPage() {
  const [entries, setEntries] = useState<BudgetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState<BudgetEntry | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'operations',
    is_income: false,
    date: new Date().toISOString().split('T')[0],
    description: '',
  })

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const loadEntries = async () => {
    const res = await fetch('/api/budget')
    const { data } = await res.json()
    setEntries(data || [])
    setLoading(false)
  }

  useEffect(() => { loadEntries() }, [])

  const filtered = entries.filter(e => {
    if (filter === 'income') return e.is_income
    if (filter === 'expense') return !e.is_income
    return true
  })

  const totalIncome = entries.filter(e => e.is_income).reduce((s, e) => s + Number(e.amount), 0)
  const totalExpense = entries.filter(e => !e.is_income).reduce((s, e) => s + Number(e.amount), 0)
  const netBalance = totalIncome - totalExpense

  const openCreate = () => {
    setEditEntry(null)
    setForm({ title: '', amount: '', category: 'operations', is_income: false, date: new Date().toISOString().split('T')[0], description: '' })
    setShowModal(true)
  }

  const openEdit = (entry: BudgetEntry) => {
    setEditEntry(entry)
    setForm({
      title: entry.title,
      amount: String(entry.amount),
      category: entry.category,
      is_income: entry.is_income,
      date: entry.date,
      description: entry.description || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.amount || !form.date) {
      showToast('Please fill all required fields', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      const url = editEntry ? `/api/budget/${editEntry.id}` : '/api/budget'
      const method = editEntry ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const { error } = await res.json()
        showToast(error || 'Failed to save', 'error')
        return
      }
      showToast(editEntry ? 'Entry updated' : 'Entry added', 'success')
      setShowModal(false)
      loadEntries()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    const res = await fetch(`/api/budget/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Entry deleted', 'success')
      setEntries(prev => prev.filter(e => e.id !== id))
    } else {
      showToast('Failed to delete', 'error')
    }
  }

  const formatCurrency = (v: number) => `₹${v.toLocaleString('en-IN')}`

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-primary-bright" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget & Finances"
        description="Track company income, expenses, and net balance"
        action={
          <button
            onClick={openCreate}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add Entry
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Total Income</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-red-600" />
            <span className="text-sm font-semibold text-red-700">Total Expenses</span>
          </div>
          <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpense)}</div>
        </div>
        <div className={`${netBalance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-xl p-5`}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} className={netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'} />
            <span className={`text-sm font-semibold ${netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Balance</span>
          </div>
          <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{formatCurrency(Math.abs(netBalance))} {netBalance < 0 ? '(deficit)' : ''}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'income', 'expense'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/60 hover:border-primary-bright'}`}
          >
            {f === 'all' ? 'All Entries' : f === 'income' ? 'Income' : 'Expenses'}
          </button>
        ))}
      </div>

      {/* Entries Table */}
      <DashboardPanel title={`${filter === 'all' ? 'All' : filter === 'income' ? 'Income' : 'Expense'} Entries (${filtered.length})`}>
        {filtered.length === 0 ? (
          <p className="text-sm text-foreground/40 py-8 text-center">No entries found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Date', 'Title', 'Category', 'Type', 'Amount', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-foreground/50 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-off-white/50">
                    <td className="py-3 px-4 text-foreground/60">{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="py-3 px-4 font-medium text-primary">{entry.title}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-off-white px-2 py-1 rounded-md font-medium">{categoryLabel(entry.category)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={entry.is_income ? 'Income' : 'Expense'} />
                    </td>
                    <td className={`py-3 px-4 font-semibold ${entry.is_income ? 'text-emerald-600' : 'text-red-600'}`}>
                      {entry.is_income ? '+' : '-'}{formatCurrency(Number(entry.amount))}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(entry)} className="text-foreground/40 hover:text-primary transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(entry.id)} className="text-foreground/40 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardPanel>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">{editEntry ? 'Edit Entry' : 'Add Budget Entry'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-foreground/40" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright"
                  placeholder="e.g. Google Ads Campaign"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Amount (₹) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Type</label>
                <div className="flex gap-3">
                  {[{ val: false, label: 'Expense' }, { val: true, label: 'Income' }].map(opt => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, is_income: opt.val }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${form.is_income === opt.val ? (opt.val ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-red-100 border-red-500 text-red-700') : 'border-border text-foreground/60 hover:border-primary'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Notes</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-bright resize-none"
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground/60 hover:bg-off-white transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : (editEntry ? 'Update' : 'Add Entry')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
