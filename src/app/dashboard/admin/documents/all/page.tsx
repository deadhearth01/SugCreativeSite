'use client'

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Admin — View All Documents (management view).                        ║
// ║                                                                       ║
// ║  Lists every generated certificate & offer letter, grouped by type    ║
// ║  with search + counts. Per-row actions: Send (resend email),          ║
// ║  Download (DocumentPreview → html2canvas → jsPDF), Edit (inline modal  ║
// ║  with a live preview → PATCH), and Delete.                            ║
// ║                                                                       ║
// ║  Note: PATCH/DELETE are keyed by the row UUID (`id`); the resend       ║
// ║  email path is keyed by the public `document_id`.                     ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Award, FileText, Search, Loader2, Send, Download, Pencil,
  Trash2, CheckCircle2, XCircle, FolderOpen, RefreshCw,
} from 'lucide-react'
import DocumentPreview, { type DocumentPreviewData } from '@/components/documents/DocumentPreview'
import DocumentEditModal, { type DocRow } from '@/components/documents/DocumentEditModal'

type Toast = { kind: 'success' | 'error'; msg: string } | null
type Tab = 'certificate' | 'offer_letter'

const STATUS_STYLE: Record<string, string> = {
  issued: 'bg-[#82C93D]/15 text-[#4d7a24] border-[#82C93D]/40',
  draft: 'bg-foreground/10 text-foreground/60 border-foreground/20',
  revoked: 'bg-red-50 text-red-600 border-red-200',
}

function rowToPreview(d: DocRow): DocumentPreviewData {
  const fields = d.fields || {}
  return {
    type: d.type,
    subType: d.sub_type || undefined,
    title: d.title,
    recipientName: d.recipient_name,
    body: d.body || '',
    quote: fields.quote,
    fields,
    signatureData: null,
    signatureName: d.signature_name || '',
    signatureTitle: d.signature_title || '',
    issuedOn: d.issued_on || undefined,
    documentId: d.document_id,
  }
}

function formatDate(d?: string | null): string {
  if (!d) return '—'
  const parsed = new Date(d)
  if (Number.isNaN(parsed.getTime())) return d
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AllDocumentsPage() {
  const [rows, setRows] = useState<DocRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('certificate')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<DocRow | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<DocRow | null>(null)
  const [toast, setToast] = useState<Toast>(null)

  // Offscreen render target for PDF export.
  const exportRef = useRef<HTMLDivElement>(null)
  const [exportData, setExportData] = useState<DocumentPreviewData | null>(null)

  const showToast = (t: Toast) => {
    setToast(t)
    if (t) setTimeout(() => setToast(null), 5000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [certRes, offerRes] = await Promise.all([
        fetch('/api/documents?type=certificate'),
        fetch('/api/documents?type=offer_letter'),
      ])
      if (!certRes.ok || !offerRes.ok) throw new Error('Failed to load documents.')
      const certJson = await certRes.json()
      const offerJson = await offerRes.json()
      const all = [...(certJson.data || []), ...(offerJson.data || [])] as DocRow[]
      all.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      setRows(all)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load documents.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const certCount = useMemo(() => rows.filter(r => r.type === 'certificate').length, [rows])
  const offerCount = useMemo(() => rows.filter(r => r.type === 'offer_letter').length, [rows])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows
      .filter(r => r.type === tab)
      .filter(r => {
        if (!q) return true
        return (
          (r.recipient_name || '').toLowerCase().includes(q) ||
          (r.document_id || '').toLowerCase().includes(q) ||
          (r.title || '').toLowerCase().includes(q)
        )
      })
  }, [rows, tab, search])

  // ─── Send (resend email) ───────────────────────────────────────────────────
  const handleSend = async (row: DocRow) => {
    if (!row.recipient_email) {
      showToast({ kind: 'error', msg: 'This document has no recipient email on file.' })
      return
    }
    setBusyId(row.id)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resend: true, document_id: row.document_id }),
      })
      const json = await res.json()
      if (!res.ok) showToast({ kind: 'error', msg: json.error || 'Failed to send email.' })
      else showToast({ kind: 'success', msg: `Emailed to ${row.recipient_email}.` })
    } catch {
      showToast({ kind: 'error', msg: 'Failed to send email.' })
    }
    setBusyId(null)
  }

  // ─── Download (offscreen render → PDF) ─────────────────────────────────────
  const handleDownload = async (row: DocRow) => {
    setBusyId(row.id)
    try {
      setExportData(rowToPreview(row))
      // Wait for the offscreen preview to render.
      await new Promise(res => setTimeout(res, 120))
      const node = exportRef.current
      if (!node) throw new Error('Render failed.')

      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false })
      const img = canvas.toDataURL('image/png')
      const orientation = row.type === 'certificate' ? 'landscape' : 'portrait'
      const pdf = new jsPDF({ orientation, unit: 'px', format: [canvas.width, canvas.height] })
      pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height)
      const safeName = (row.recipient_name || 'recipient').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      pdf.save(`${row.type}-${safeName}-${row.document_id}.pdf`)
      showToast({ kind: 'success', msg: `Downloaded ${row.document_id}.` })
    } catch (e) {
      console.error(e)
      showToast({ kind: 'error', msg: 'PDF export failed.' })
    } finally {
      setExportData(null)
      setBusyId(null)
    }
  }

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (row: DocRow) => {
    setBusyId(row.id)
    try {
      const res = await fetch(`/api/documents/${row.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        showToast({ kind: 'error', msg: json.error || 'Failed to delete.' })
      } else {
        setRows(prev => prev.filter(r => r.id !== row.id))
        showToast({ kind: 'success', msg: 'Document deleted.' })
      }
    } catch {
      showToast({ kind: 'error', msg: 'Failed to delete.' })
    }
    setBusyId(null)
    setConfirmDelete(null)
  }

  // ─── Save edits (PATCH) ────────────────────────────────────────────────────
  const handleSaved = (updated: DocRow) => {
    setRows(prev => prev.map(r => (r.id === updated.id ? { ...r, ...updated } : r)))
    setEditing(null)
    showToast({ kind: 'success', msg: 'Document updated.' })
  }

  const activeCount = tab === 'certificate' ? certCount : offerCount

  return (
    <div className="max-w-[1500px] mx-auto pb-24">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href="/dashboard/admin/documents"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/50 hover:text-[#1A9AB5] transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Document Studio
          </Link>
          <h1 className="font-heading font-black text-2xl text-primary-dark uppercase tracking-tight flex items-center gap-2">
            <FolderOpen className="text-[#82C93D]" /> All Documents
          </h1>
          <p className="text-sm text-foreground/55 font-medium mt-0.5">
            Manage every generated certificate &amp; offer letter — send, download, edit, or delete.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-foreground/15 text-foreground/70 text-sm font-black hover:border-[#1A9AB5] hover:text-[#1A9AB5] transition-colors disabled:opacity-50 self-start"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs + counts */}
      <div className="inline-flex p-1 rounded-2xl bg-white border border-black/5 shadow-sm mb-5">
        {([
          { v: 'certificate', label: 'Certificates', icon: Award, count: certCount },
          { v: 'offer_letter', label: 'Offer Letters', icon: FileText, count: offerCount },
        ] as const).map(t => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              tab === t.v ? 'bg-[#1A9AB5] text-white shadow' : 'text-foreground/50 hover:text-foreground/80'
            }`}
          >
            <t.icon size={16} /> {t.label}
            <span className={`ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-black ${
              tab === t.v ? 'bg-white/25 text-white' : 'bg-foreground/10 text-foreground/50'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by recipient name, title, or document ID…"
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border-[1.5px] border-black/10 text-sm font-medium bg-white outline-none focus:border-[#35C8E0] focus:ring-[3px] focus:ring-[#35C8E0]/15 transition"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-foreground/50">
          <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
          <p className="mt-3 text-sm font-semibold">Loading documents…</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border-2 border-red-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 mb-3">
            <XCircle size={24} className="text-red-500" />
          </div>
          <h2 className="font-heading font-black text-lg text-red-600">{error}</h2>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A9AB5] text-white text-sm font-black hover:bg-primary-dark transition-colors"
          >
            <RefreshCw size={15} /> Try Again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-foreground/5 mb-3">
            {tab === 'certificate' ? <Award size={26} className="text-foreground/30" /> : <FileText size={26} className="text-foreground/30" />}
          </div>
          <h2 className="font-heading font-black text-lg text-foreground/60">
            {search.trim()
              ? 'No documents match your search'
              : tab === 'certificate' ? 'No certificates yet' : 'No offer letters yet'}
          </h2>
          {!search.trim() && activeCount === 0 && (
            <p className="text-sm text-foreground/45 mt-2">
              Generate one in the{' '}
              <Link href="/dashboard/admin/documents" className="text-[#1A9AB5] font-bold hover:underline">Document Studio</Link>.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map(row => (
            <div
              key={row.id}
              className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
            >
              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-black text-base text-primary-dark truncate">{row.title}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${STATUS_STYLE[row.status] || STATUS_STYLE.draft}`}>
                    {row.status || 'draft'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-1 truncate">
                  {row.recipient_name || 'Unnamed recipient'}
                  {row.recipient_email && (
                    <span className="text-foreground/45 font-medium"> · {row.recipient_email}</span>
                  )}
                </p>
                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1.5 text-[11px]">
                  <span className="font-mono font-bold text-[#5B8E2A] break-all">{row.document_id}</span>
                  <span className="text-foreground/45">Issued {formatDate(row.issued_on)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap flex-shrink-0">
                <button
                  onClick={() => handleSend(row)}
                  disabled={busyId === row.id || !row.recipient_email}
                  title={row.recipient_email ? 'Email this document to the recipient' : 'No recipient email on file'}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#82C93D]/12 text-[#4d7a24] text-xs font-black hover:bg-[#82C93D]/22 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {busyId === row.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
                </button>
                <button
                  onClick={() => handleDownload(row)}
                  disabled={busyId === row.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#35C8E0]/15 text-[#1A9AB5] text-xs font-black hover:bg-[#35C8E0]/25 transition-colors disabled:opacity-40"
                >
                  {busyId === row.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download
                </button>
                <button
                  onClick={() => setEditing(row)}
                  disabled={busyId === row.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground/5 text-foreground/70 text-xs font-black hover:bg-foreground/10 transition-colors disabled:opacity-40"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(row)}
                  disabled={busyId === row.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-black hover:bg-red-100 transition-colors disabled:opacity-40"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <DocumentEditModal
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
          onError={msg => showToast({ kind: 'error', msg })}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[125] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 mb-3">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-heading font-black text-lg text-foreground">Delete this document?</h3>
            <p className="text-sm text-foreground/60 mt-1.5">
              <strong>{confirmDelete.title}</strong> for {confirmDelete.recipient_name || 'this recipient'}{' '}
              (<span className="font-mono text-xs">{confirmDelete.document_id}</span>) will be permanently removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white border-2 border-foreground/15 text-foreground/70 text-sm font-black hover:border-foreground/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={busyId === confirmDelete.id}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {busyId === confirmDelete.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offscreen export render — kept out of the visual flow but renderable. */}
      <div aria-hidden className="fixed -left-[9999px] top-0 pointer-events-none" style={{ width: exportData?.type === 'offer_letter' ? 794 : 1123 }}>
        {exportData && <DocumentPreview ref={exportRef} data={exportData} />}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[130] max-w-sm flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold ${
          toast.kind === 'success' ? 'bg-[#1A9AB5] text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.kind === 'success' ? <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" /> : <XCircle size={18} className="flex-shrink-0 mt-0.5" />}
          <span className="break-words">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
