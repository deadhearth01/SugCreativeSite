'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, Edit, Loader2, X, ArrowUpRight } from 'lucide-react'
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

const CATEGORIES = ['marketing', 'operations', 'salaries', 'infrastructure', 'tools', 'events', 'other']
const categoryLabel = (c: string) => c.charAt(0).toUpperCase() + c.slice(1)

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm font-bold text-white border-2 border-black ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
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

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#045184]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#045184] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-[#022A4A] shadow-[2px_2px_0px_rgba(0,0,0,0.7)] mb-3">
            <Wallet size={12} />
            Finance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#022A4A] uppercase tracking-tight leading-none">Budget &amp; Finances</h1>
          <p className="text-sm text-foreground/50 font-semibold mt-1">Track company income, expenses, and net balance</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#022A4A] text-white text-xs font-black uppercase tracking-widest px-5 py-3 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex-shrink-0"
        >
          <Plus size={15} />
          Add Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-foreground/60">Total Income</span>
          </div>
          <div className="text-3xl font-black text-emerald-600">{fmt(totalIncome)}</div>
          <div className="text-xs font-semibold text-foreground/40 mt-1">{entries.filter(e => e.is_income).length} entries</div>
        </div>
        <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <TrendingDown size={16} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-foreground/60">Total Expenses</span>
          </div>
          <div className="text-3xl font-black text-red-600">{fmt(totalExpense)}</div>
          <div className="text-xs font-semibold text-foreground/40 mt-1">{entries.filter(e => !e.is_income).length} entries</div>
        </div>
        <div className={`bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)] p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)] ${netBalance >= 0 ? 'bg-[#045184]' : 'bg-orange-500'}`}>
              <Wallet size={16} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-foreground/60">Net Balance</span>
          </div>
          <div className={`text-3xl font-black ${netBalance >= 0 ? 'text-[#045184]' : 'text-orange-600'}`}>
            {netBalance < 0 ? '-' : ''}{fmt(Math.abs(netBalance))}
          </div>
          <div className="text-xs font-semibold text-foreground/40 mt-1">{netBalance < 0 ? 'Deficit' : 'Surplus'}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'income', 'expense'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all ${
              filter === f
                ? 'bg-[#022A4A] text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)]'
                : 'bg-white border-black/20 text-foreground/60 hover:border-black hover:shadow-[2px_2px_0px_rgba(0,0,0,0.5)]'
            }`}
          >
            {f === 'all' ? 'All Entries' : f === 'income' ? 'Income' : 'Expenses'}
          </button>
        ))}
      </div>

      {/* Entries Table */}
      <div className="bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#022A4A]">
            {filter === 'all' ? 'All' : filter === 'income' ? 'Income' : 'Expense'} Entries
            <span className="ml-2 text-foreground/40">({filtered.length})</span>
          </h2>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-foreground/40 py-12 text-center font-semibold">No entries found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black bg-[#F4F6FA]">
                  {['Date', 'Title', 'Category', 'Type', 'Amount', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <tr key={entry.id} className={`border-b border-black/8 hover:bg-[#F4F6FA] ${i % 2 === 0 ? '' : 'bg-[#FAFBFC]'}`}>
                    <td className="py-3 px-4 text-xs text-foreground/50 font-semibold whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#022A4A]">{entry.title}</div>
                      {entry.description && <div className="text-xs text-foreground/40 mt-0.5 truncate max-w-48">{entry.description}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-[#022A4A]/8 text-[#022A4A] px-2 py-1 font-black uppercase tracking-wide border border-[#022A4A]/20">
                        {categoryLabel(entry.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-wide border-2 ${entry.is_income ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-red-50 text-red-700 border-red-300'}`}>
                        {entry.is_income ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-black text-base ${entry.is_income ? 'text-emerald-600' : 'text-red-600'}`}>
                      {entry.is_income ? '+' : '-'}{fmt(Number(entry.amount))}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(entry)} className="text-foreground/30 hover:text-[#045184] transition-colors p-1 hover:bg-[#045184]/10">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="text-foreground/30 hover:text-red-500 transition-colors p-1 hover:bg-red-50">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#022A4A]">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">{editEntry ? 'Edit Entry' : 'Add Budget Entry'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border-2 border-black/20 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#045184] focus:shadow-[3px_3px_0px_rgba(4,81,132,0.3)]"
                  placeholder="e.g. Google Ads Campaign"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Amount (₹) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full border-2 border-black/20 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#045184]"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border-2 border-black/20 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#045184]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border-2 border-black/20 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#045184]"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ val: false, label: 'Expense' }, { val: true, label: 'Income' }].map(opt => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, is_income: opt.val }))}
                      className={`py-2.5 text-xs font-black uppercase tracking-widest border-2 transition-all ${
                        form.is_income === opt.val
                          ? opt.val
                            ? 'bg-emerald-600 text-white border-emerald-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]'
                            : 'bg-red-600 text-white border-red-800 shadow-[2px_2px_0px_rgba(0,0,0,0.7)]'
                          : 'border-black/20 text-foreground/50 hover:border-black'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-widest">Notes</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border-2 border-black/20 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#045184] resize-none"
                  rows={2}
                  placeholder="Optional notes..."
                />
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
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest bg-[#022A4A] text-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
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
