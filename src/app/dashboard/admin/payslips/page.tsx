'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Settings, X, Loader2, ReceiptText, Download, Mail, RefreshCw,
  Search, Filter, Users as UsersIcon, FileText, Tag, Plus, Check,
  Calendar, Building2, Wallet, AlertCircle, Sparkles,
} from 'lucide-react'
import { PageHeader, StatusBadge, EmptyState } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

// ─── Types ──────────────────────────────────────────────────────────────────
type PayType = 'salary' | 'stipend'

type PayProfile = {
  id: string
  display_id: string | null
  full_name: string | null
  email: string | null
  role: string
  monthly_pay: number | null
  pay_type: PayType | null
}

type Payslip = {
  id: string
  payslip_no: string
  recipient_id: string
  recipient_name: string
  recipient_email: string | null
  display_id: string | null
  pay_type: PayType
  period_month: number
  period_year: number
  earnings: Record<string, number>
  deductions: Record<string, number>
  gross: number
  total_deductions: number
  net: number
  currency: string
  notes: string | null
  tags: string[]
  status: string
  created_at: string
}

type PayrollSettings = {
  company_name: string
  pf_percent: number
  tax_percent: number
  professional_tax: number
  pf_account_no: string | null
  tax_account_no: string | null
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PAY_ROLES = ['employee', 'intern', 'student']

const inr = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const labelize = (k: string) =>
  k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// ─── Page ───────────────────────────────────────────────────────────────────
export default function PayslipsPage() {
  const now = new Date()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [people, setPeople] = useState<PayProfile[]>([])
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [settings, setSettings] = useState<PayrollSettings | null>(null)

  // Filters for the payslips list
  const [filterMonth, setFilterMonth] = useState<number | 0>(0) // 0 = all
  const [filterYear, setFilterYear] = useState<number | 0>(0)
  const [filterPerson, setFilterPerson] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Modals
  const [showSettings, setShowSettings] = useState(false)
  const [generateFor, setGenerateFor] = useState<PayProfile | null>(null)
  const [viewSlip, setViewSlip] = useState<Payslip | null>(null)
  const [bulkRunning, setBulkRunning] = useState(false)

  // ── Loaders ────────────────────────────────────────────────────────────────
  const loadPeople = useCallback(async () => {
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, display_id, full_name, email, role, monthly_pay, pay_type')
      .not('monthly_pay', 'is', null)
      .in('role', PAY_ROLES)
      .order('full_name', { ascending: true })
    if (err) throw new Error(err.message)
    setPeople((data as PayProfile[]) || [])
  }, [])

  const loadPayslips = useCallback(async () => {
    const res = await fetch('/api/payslips')
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to load payslips')
    setPayslips((json.data as Payslip[]) || [])
  }, [])

  const loadSettings = useCallback(async () => {
    const res = await fetch('/api/payroll/settings')
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to load settings')
    setSettings(json.data as PayrollSettings)
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([loadPeople(), loadPayslips(), loadSettings()])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payroll data')
    } finally {
      setLoading(false)
    }
  }, [loadPeople, loadPayslips, loadSettings])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // ── Generate (single) ────────────────────────────────────────────────────────
  const generatePayslip = async (
    profile: PayProfile,
    month: number,
    year: number,
    opts?: { notes?: string; tags?: string[]; send_email?: boolean },
  ): Promise<Payslip | null> => {
    const res = await fetch('/api/payslips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient_id: profile.id,
        period_month: month,
        period_year: year,
        notes: opts?.notes,
        tags: opts?.tags,
        send_email: opts?.send_email,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to generate payslip')
    return json.data as Payslip
  }

  // ── Bulk generate (this month) ──────────────────────────────────────────────
  const handleBulkGenerate = async () => {
    if (people.length === 0) return
    setBulkRunning(true)
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    let ok = 0
    let fail = 0
    for (const p of people) {
      try {
        await generatePayslip(p, month, year)
        ok++
      } catch {
        fail++
      }
    }
    try { await loadPayslips() } catch {}
    setBulkRunning(false)
    setToast({
      type: fail === 0 ? 'success' : 'error',
      message: `Generated ${ok} payslip${ok !== 1 ? 's' : ''} for ${MONTHS[month - 1]} ${year}${fail ? ` · ${fail} failed` : ''}`,
    })
  }

  // ── Re-send an existing payslip by email (re-POST same person/period) ────────
  const handleSendMail = async (slip: Payslip) => {
    const person = people.find((p) => p.id === slip.recipient_id) || {
      id: slip.recipient_id,
      display_id: slip.display_id,
      full_name: slip.recipient_name,
      email: slip.recipient_email,
      role: '',
      monthly_pay: null,
      pay_type: slip.pay_type,
    }
    try {
      await generatePayslip(person, slip.period_month, slip.period_year, {
        notes: slip.notes || undefined,
        tags: slip.tags,
        send_email: true,
      })
      await loadPayslips()
      setToast({ type: 'success', message: `Payslip emailed to ${slip.recipient_email || slip.recipient_name}` })
    } catch (e) {
      setToast({ type: 'error', message: e instanceof Error ? e.message : 'Failed to send email' })
    }
  }

  // ── Filtered list ────────────────────────────────────────────────────────────
  const years = Array.from(new Set(payslips.map((p) => p.period_year))).sort((a, b) => b - a)
  const filteredSlips = payslips.filter((p) => {
    if (filterMonth && p.period_month !== filterMonth) return false
    if (filterYear && p.period_year !== filterYear) return false
    if (filterPerson !== 'all' && p.recipient_id !== filterPerson) return false
    if (search) {
      const q = search.toLowerCase()
      const hit =
        p.recipient_name.toLowerCase().includes(q) ||
        (p.display_id || '').toLowerCase().includes(q) ||
        p.payslip_no.toLowerCase().includes(q)
      if (!hit) return false
    }
    return true
  })

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[70] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      <PageHeader
        title="Payslips & Payroll"
        description="Generate salary/stipend payslips, manage PF & tax defaults, and email payslips."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              className="p-2.5 rounded-lg border border-border hover:bg-off-white transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="border border-primary text-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/10 transition-colors"
            >
              <Settings size={16} />
              PF &amp; Tax Settings
            </button>
          </div>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={loadAll} className="text-xs font-semibold text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={26} className="animate-spin text-[#1A9AB5]" />
          <span className="ml-2 text-sm text-foreground/50">Loading payroll…</span>
        </div>
      ) : (
        <>
          {/* ═══ People with pay ═══ */}
          <div className="bg-white border border-border rounded-xl mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <UsersIcon size={18} className="text-primary" />
                <h3 className="font-heading font-bold text-primary">People with Pay</h3>
                <span className="text-[10px] font-bold bg-[#35C8E0]/20 text-primary px-2 py-0.5 rounded-full">
                  {people.length}
                </span>
              </div>
              <button
                onClick={handleBulkGenerate}
                disabled={bulkRunning || people.length === 0}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {bulkRunning ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                Generate for all ({MONTHS[now.getMonth()]})
              </button>
            </div>
            {people.length === 0 ? (
              <EmptyState
                message="No employees, interns or students have a monthly salary/stipend set yet. Add pay in User Management."
                icon={Wallet}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-off-white/50">
                      <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Person</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider hidden sm:table-cell">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Pay Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Monthly Pay</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-off-white/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#35C8E0]/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                              {((p.full_name || p.email || '?').split(/\s+/).map((n) => n[0]).join('').slice(0, 2) || '?').toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-primary truncate flex items-center gap-2">
                                {p.full_name || <span className="italic text-foreground/40">No name</span>}
                                {p.display_id && (
                                  <span className="text-[10px] font-mono font-bold text-[#1A9AB5] bg-[#35C8E0]/10 border border-[#35C8E0]/30 rounded px-1.5 py-0.5 shrink-0">
                                    {p.display_id}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-foreground/50 truncate">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className="text-xs font-semibold uppercase text-foreground/60 capitalize">{p.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-md ${
                            p.pay_type === 'stipend' ? 'bg-cyan-100 text-cyan-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {p.pay_type || 'salary'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-primary">{inr(p.monthly_pay || 0)}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setGenerateFor(p)}
                            className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
                          >
                            <ReceiptText size={13} />
                            Generate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ═══ Payslips list ═══ */}
          <div className="bg-white border border-border rounded-xl">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-primary" />
                <h3 className="font-heading font-bold text-primary">Generated Payslips</h3>
                <span className="text-[10px] font-bold bg-[#35C8E0]/20 text-primary px-2 py-0.5 rounded-full">
                  {payslips.length}
                </span>
              </div>
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="text"
                    placeholder="Search by name, ID or payslip no…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-[#35C8E0]"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter size={16} className="text-foreground/40" />
                  <select
                    value={filterPerson}
                    onChange={(e) => setFilterPerson(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0] bg-white"
                  >
                    <option value="all">All people</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                    ))}
                  </select>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(Number(e.target.value))}
                    className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0] bg-white"
                  >
                    <option value={0}>All months</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number(e.target.value))}
                    className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0] bg-white"
                  >
                    <option value={0}>All years</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredSlips.length === 0 ? (
              <EmptyState
                message={payslips.length === 0 ? 'No payslips generated yet. Use "Generate" above to create one.' : 'No payslips match the current filters.'}
                icon={ReceiptText}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-off-white/50">
                      <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Recipient</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Period</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider hidden md:table-cell">Gross</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider hidden md:table-cell">Deductions</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Net</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlips.map((s) => (
                      <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-off-white/50 transition-colors">
                        <td className="py-3 px-4">
                          <button onClick={() => setViewSlip(s)} className="text-left">
                            <p className="font-medium text-primary truncate flex items-center gap-2">
                              {s.recipient_name}
                              {s.display_id && (
                                <span className="text-[10px] font-mono font-bold text-[#1A9AB5] bg-[#35C8E0]/10 border border-[#35C8E0]/30 rounded px-1.5 py-0.5 shrink-0">
                                  {s.display_id}
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] font-mono text-foreground/50 truncate">{s.payslip_no}</p>
                          </button>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-foreground/70">
                          {MONTHS[s.period_month - 1]} {s.period_year}
                        </td>
                        <td className="py-3 px-4 text-right text-foreground/70 hidden md:table-cell">{inr(s.gross)}</td>
                        <td className="py-3 px-4 text-right text-red-600 hidden md:table-cell">−{inr(s.total_deductions)}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary">{inr(s.net)}</td>
                        <td className="py-3 px-4 hidden sm:table-cell"><StatusBadge status={s.status} /></td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewSlip(s)}
                              className="p-1.5 rounded-lg hover:bg-[#35C8E0]/20 text-foreground/50 hover:text-primary transition-colors"
                              title="View / Download"
                            >
                              <Download size={15} />
                            </button>
                            <button
                              onClick={() => handleSendMail(s)}
                              disabled={!s.recipient_email}
                              className="p-1.5 rounded-lg hover:bg-[#35C8E0]/20 text-foreground/50 hover:text-primary transition-colors disabled:opacity-30"
                              title={s.recipient_email ? 'Send to mail' : 'No email on file'}
                            >
                              <Mail size={15} />
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
        </>
      )}

      {/* ─── Modals ─── */}
      {showSettings && (
        <SettingsModal
          initial={settings}
          onClose={() => setShowSettings(false)}
          onSaved={(s) => { setSettings(s); setShowSettings(false); setToast({ type: 'success', message: 'Payroll settings saved' }) }}
          onError={(m) => setToast({ type: 'error', message: m })}
        />
      )}

      {generateFor && (
        <GenerateModal
          profile={generateFor}
          defaultMonth={now.getMonth() + 1}
          defaultYear={now.getFullYear()}
          onClose={() => setGenerateFor(null)}
          onGenerate={generatePayslip}
          onDone={async (slip, emailed) => {
            await loadPayslips()
            setGenerateFor(null)
            setViewSlip(slip)
            setToast({ type: 'success', message: emailed ? 'Payslip generated & emailed' : 'Payslip generated' })
          }}
          onError={(m) => setToast({ type: 'error', message: m })}
        />
      )}

      {viewSlip && settings && (
        <PayslipViewer slip={viewSlip} settings={settings} onClose={() => setViewSlip(null)} />
      )}
      {viewSlip && !settings && (
        <PayslipViewer
          slip={viewSlip}
          settings={{ company_name: 'SUG Creative', pf_percent: 0, tax_percent: 0, professional_tax: 0, pf_account_no: null, tax_account_no: null }}
          onClose={() => setViewSlip(null)}
        />
      )}
    </div>
  )
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({
  initial, onClose, onSaved, onError,
}: {
  initial: PayrollSettings | null
  onClose: () => void
  onSaved: (s: PayrollSettings) => void
  onError: (m: string) => void
}) {
  const [form, setForm] = useState<PayrollSettings>({
    company_name: initial?.company_name ?? 'SUG Creative',
    pf_percent: initial?.pf_percent ?? 0,
    tax_percent: initial?.tax_percent ?? 0,
    professional_tax: initial?.professional_tax ?? 0,
    pf_account_no: initial?.pf_account_no ?? '',
    tax_account_no: initial?.tax_account_no ?? '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/payroll/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.company_name,
          pf_percent: Number(form.pf_percent) || 0,
          tax_percent: Number(form.tax_percent) || 0,
          professional_tax: Number(form.professional_tax) || 0,
          pf_account_no: form.pf_account_no || null,
          tax_account_no: form.tax_account_no || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save settings')
      onSaved(json.data as PayrollSettings)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const numField = (label: string, key: 'pf_percent' | 'tax_percent' | 'professional_tax', suffix: string) => (
    <div>
      <label className="block text-sm font-medium text-foreground/70 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.01"
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value as unknown as number })}
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground/40">{suffix}</span>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            <h3 className="text-lg font-heading font-bold text-primary">PF &amp; Tax Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
          <div className="p-3 bg-[#35C8E0]/10 border border-[#35C8E0]/30 rounded-lg">
            <p className="text-xs text-foreground/70 leading-relaxed">
              These company-wide defaults drive auto-computed deductions: PF and tax are percentages of gross pay; professional tax is a flat amount.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">Company Name</label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {numField('PF', 'pf_percent', '%')}
            {numField('Tax (TDS)', 'tax_percent', '%')}
            {numField('Prof. Tax', 'professional_tax', '₹')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">PF Account No.</label>
              <input
                type="text"
                value={form.pf_account_no || ''}
                onChange={(e) => setForm({ ...form, pf_account_no: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] font-mono"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Tax Account No.</label>
              <input
                type="text"
                value={form.tax_account_no || ''}
                onChange={(e) => setForm({ ...form, tax_account_no: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] font-mono"
                placeholder="—"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Generate Modal (month/year + notes + tags) ──────────────────────────────
function GenerateModal({
  profile, defaultMonth, defaultYear, onClose, onGenerate, onDone, onError,
}: {
  profile: PayProfile
  defaultMonth: number
  defaultYear: number
  onClose: () => void
  onGenerate: (
    p: PayProfile,
    month: number,
    year: number,
    opts?: { notes?: string; tags?: string[]; send_email?: boolean },
  ) => Promise<Payslip | null>
  onDone: (slip: Payslip, emailed: boolean) => void
  onError: (m: string) => void
}) {
  const [month, setMonth] = useState(defaultMonth)
  const [year, setYear] = useState(defaultYear)
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [busy, setBusy] = useState(false)

  const years = Array.from({ length: 6 }, (_, i) => defaultYear - 4 + i)

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const run = async () => {
    setBusy(true)
    try {
      const slip = await onGenerate(profile, month, year, {
        notes: notes || undefined,
        tags,
        send_email: sendEmail,
      })
      if (slip) onDone(slip, sendEmail)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to generate payslip')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h3 className="text-lg font-heading font-bold text-primary">Generate Payslip</h3>
            <p className="text-xs text-foreground/50 mt-0.5">
              {profile.full_name || profile.email} · {profile.pay_type || 'salary'} · {inr(profile.monthly_pay || 0)}/mo
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
          <div className="p-3 bg-[#35C8E0]/10 border border-[#35C8E0]/30 rounded-lg flex items-start gap-2">
            <Calendar size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-foreground/70 leading-relaxed">
              Earnings and deductions are auto-computed from the monthly pay and the company PF/tax defaults.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Month</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] bg-white">
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Year</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] bg-white">
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
              placeholder="Optional note shown on the payslip"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                className="flex-1 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#35C8E0]"
                placeholder="Add a tag…"
              />
              <button type="button" onClick={addTag} className="px-3 py-2 rounded-lg border border-border hover:bg-off-white text-foreground/60 hover:text-primary transition-colors">
                <Plus size={15} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 bg-[#35C8E0]/20 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                    <Tag size={10} />
                    {t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="ml-0.5 hover:text-red-500"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-[#35C8E0]"
            />
            <span className="text-sm text-foreground/70 flex items-center gap-1.5">
              <Mail size={14} /> Email this payslip to {profile.email || 'the recipient'}
            </span>
          </label>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
          <button
            onClick={run}
            disabled={busy}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ReceiptText size={14} />}
            Generate Payslip
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Payslip Viewer + PDF ─────────────────────────────────────────────────────
function PayslipViewer({
  slip, settings, onClose,
}: {
  slip: Payslip
  settings: PayrollSettings
  onClose: () => void
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const earnings = Object.entries(slip.earnings || {})
  const deductions = Object.entries(slip.deductions || {})
  const periodLabel = `${MONTHS[slip.period_month - 1]} ${slip.period_year}`

  const handleDownload = async () => {
    if (!sheetRef.current) return
    setDownloading(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvas = await html2canvas(sheetRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW
      const imgH = (canvas.height * imgW) / canvas.width
      let position = 0
      let heightLeft = imgH
      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
      heightLeft -= pageH
      while (heightLeft > 0) {
        position -= pageH
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
        heightLeft -= pageH
      }
      pdf.save(`${slip.payslip_no}.pdf`)
    } catch (e) {
      console.error('PDF generation failed:', e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <ReceiptText size={18} className="text-primary" />
            <h3 className="text-lg font-heading font-bold text-primary">Payslip</h3>
            <span className="text-[11px] font-mono text-foreground/50">{slip.payslip_no}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              Download PDF
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-off-white"><X size={18} /></button>
          </div>
        </div>

        <div className="overflow-y-auto overscroll-contain flex-1 bg-off-white/40 p-4 sm:p-6">
          {/* Clean SUG-themed payslip sheet (rendered to PDF) */}
          <div ref={sheetRef} className="bg-white mx-auto" style={{ width: '210mm', maxWidth: '100%', padding: '14mm', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #1A9AB5', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A9AB5', letterSpacing: '-0.5px' }}>
                  {settings.company_name || 'SUG Creative'}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                  Payslip · {slip.pay_type === 'stipend' ? 'Stipend' : 'Salary'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Payslip No.</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>{slip.payslip_no}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>Pay Period</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{periodLabel}</div>
              </div>
            </div>

            {/* Employee */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Employee</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>{slip.recipient_name}</div>
                {slip.display_id && (
                  <div style={{ fontSize: '12px', color: '#1A9AB5', fontFamily: 'monospace', fontWeight: 700 }}>ID: {slip.display_id}</div>
                )}
                {slip.recipient_email && (
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{slip.recipient_email}</div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Status</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#5A9A28', textTransform: 'capitalize' }}>{slip.status}</div>
              </div>
            </div>

            {/* Earnings + Deductions */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '18px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1A9AB5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Earnings</div>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <tbody>
                    {earnings.length === 0 ? (
                      <tr><td style={{ padding: '6px 0', color: '#9ca3af' }}>—</td></tr>
                    ) : earnings.map(([k, v]) => (
                      <tr key={k} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '6px 0', color: '#374151' }}>{labelize(k)}</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#111827', fontWeight: 600 }}>{inr(v)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid #e5e7eb' }}>
                      <td style={{ padding: '8px 0', fontWeight: 700, color: '#111827' }}>Gross</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{inr(slip.gross)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Deductions</div>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <tbody>
                    {deductions.length === 0 ? (
                      <tr><td style={{ padding: '6px 0', color: '#9ca3af' }}>No deductions</td></tr>
                    ) : deductions.map(([k, v]) => (
                      <tr key={k} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '6px 0', color: '#374151' }}>{labelize(k)}</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#b91c1c', fontWeight: 600 }}>−{inr(v)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid #e5e7eb' }}>
                      <td style={{ padding: '8px 0', fontWeight: 700, color: '#111827' }}>Total Deductions</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#b91c1c' }}>−{inr(slip.total_deductions)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net pay */}
            <div style={{ background: '#1A9AB5', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ color: '#ffffff', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Net Pay</div>
              <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: 800 }}>{inr(slip.net)}</div>
            </div>

            {/* Notes + tags */}
            {(slip.notes || (slip.tags && slip.tags.length > 0)) && (
              <div style={{ marginBottom: '16px' }}>
                {slip.notes && (
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#374151' }}>Notes: </span>{slip.notes}
                  </div>
                )}
                {slip.tags && slip.tags.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#1A9AB5' }}>
                    {slip.tags.map((t) => `#${t}`).join('  ')}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
              <div>
                {settings.pf_account_no && <div>PF A/C: {settings.pf_account_no}</div>}
                {settings.tax_account_no && <div>Tax A/C: {settings.tax_account_no}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>This is a computer-generated payslip.</div>
                <div>{settings.company_name || 'SUG Creative'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-foreground/50">
            <Check size={14} className="text-green-500" />
            Net pay {inr(slip.net)} · {periodLabel}
          </div>
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Close</button>
        </div>
      </div>
    </div>
  )
}
