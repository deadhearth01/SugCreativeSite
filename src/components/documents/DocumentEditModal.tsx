'use client'

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  DocumentEditModal — inline editor for an existing document.          ║
// ║                                                                       ║
// ║  Edits the editable fields (title, recipient, signer, status, body,   ║
// ║  issued_on, and certificate quote via fields.quote) alongside a live  ║
// ║  <DocumentPreview/>. Save PATCHes /api/documents/[id] (keyed by the    ║
// ║  row UUID) and hands the merged row back to the parent.               ║
// ║                                                                       ║
// ║  Scroll note: the dashboard disables Lenis on /dashboard routes, so    ║
// ║  the body uses native overflow-y-auto/overscroll-contain.             ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState, useMemo } from 'react'
import { X, Save, Loader2, Pencil } from 'lucide-react'
import DocumentPreview, { type DocumentPreviewData } from '@/components/documents/DocumentPreview'
import { CERTIFICATE_SUBTYPES, type DocumentType, type CertificateSubType } from '@/lib/documents'

export type DocRow = {
  id: string
  document_id: string
  type: DocumentType
  sub_type: string | null
  title: string
  recipient_profile_id: string | null
  recipient_name: string
  recipient_email: string | null
  recipient_phone: string | null
  body: string | null
  fields: Record<string, string> | null
  signature_data: string | null
  signature_name: string | null
  signature_title: string | null
  issued_on: string | null
  status: string
  created_at: string | null
}

const STATUS_OPTIONS = ['issued', 'draft', 'revoked'] as const

export default function DocumentEditModal({
  row,
  onClose,
  onSaved,
  onError,
}: {
  row: DocRow
  onClose: () => void
  onSaved: (updated: DocRow) => void
  onError: (msg: string) => void
}) {
  const isCert = row.type === 'certificate'

  const [title, setTitle] = useState(row.title || '')
  const [subType, setSubType] = useState<string>(row.sub_type || 'excellence')
  const [recipientName, setRecipientName] = useState(row.recipient_name || '')
  const [recipientEmail, setRecipientEmail] = useState(row.recipient_email || '')
  const [recipientPhone, setRecipientPhone] = useState(row.recipient_phone || '')
  const [body, setBody] = useState(row.body || '')
  const [quote, setQuote] = useState(row.fields?.quote || '')
  const [fields, setFields] = useState<Record<string, string>>(() => ({ ...(row.fields || {}) }))
  const [signatureName, setSignatureName] = useState(row.signature_name || '')
  const [signatureTitle, setSignatureTitle] = useState(row.signature_title || '')
  const [issuedOn, setIssuedOn] = useState(row.issued_on || '')
  const [status, setStatus] = useState(row.status || 'issued')
  const [saving, setSaving] = useState(false)

  const updateField = (k: string, v: string) =>
    setFields(prev => ({ ...prev, [k]: v }))

  const previewData: DocumentPreviewData = useMemo(() => ({
    type: row.type,
    subType: isCert ? subType : undefined,
    title,
    recipientName,
    body,
    quote: isCert ? quote : undefined,
    fields: { ...fields, quote },
    signatureData: null,
    signatureName,
    signatureTitle,
    issuedOn: issuedOn || undefined,
    documentId: row.document_id,
  }), [row.type, row.document_id, isCert, subType, title, recipientName, body, quote, fields, signatureName, signatureTitle, issuedOn])

  const handleSave = async () => {
    if (!recipientName.trim()) {
      onError('Recipient name is required.')
      return
    }
    setSaving(true)
    const payload = {
      title,
      sub_type: isCert ? subType : null,
      recipient_name: recipientName,
      recipient_email: recipientEmail || null,
      recipient_phone: recipientPhone || null,
      body,
      fields: { ...fields, quote },
      signature_name: signatureName,
      signature_title: signatureTitle,
      issued_on: issuedOn || null,
      status,
    }
    try {
      const res = await fetch(`/api/documents/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        onError(json.error || 'Failed to save changes.')
        setSaving(false)
        return
      }
      // Prefer the server row; fall back to a local merge.
      const updated: DocRow = json.data
        ? { ...row, ...json.data }
        : { ...row, ...payload, fields: { ...fields, quote } }
      onSaved(updated)
    } catch {
      onError('Failed to save changes.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[125] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl my-6 flex flex-col max-h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 flex-shrink-0">
          <h3 className="flex items-center gap-2 font-black text-primary-dark uppercase tracking-wide text-sm">
            <Pencil size={16} className="text-[#82C93D]" /> Edit Document
            <span className="font-mono text-[11px] text-foreground/40 normal-case tracking-normal">{row.document_id}</span>
          </h3>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground p-1" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto overscroll-contain grid lg:grid-cols-2 gap-6 p-5">
          {/* Form */}
          <div className="space-y-3">
            {isCert && (
              <Field label="Certificate Type">
                <select className="dinput" value={subType} onChange={e => setSubType(e.target.value as CertificateSubType)}>
                  {CERTIFICATE_SUBTYPES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Title">
              <input className="dinput" value={title} onChange={e => setTitle(e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Recipient Name">
                <input className="dinput" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
              </Field>
              <Field label="Status">
                <select className="dinput" value={status} onChange={e => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input type="email" className="dinput" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="name@email.com" />
              </Field>
              <Field label="Phone">
                <input className="dinput" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} placeholder="optional" />
              </Field>
            </div>

            <Field label="Body">
              <textarea
                className="dinput min-h-[120px] resize-y whitespace-pre-line"
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </Field>

            {isCert ? (
              <Field label="Quote">
                <input className="dinput" value={quote} onChange={e => setQuote(e.target.value)} />
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role / Position">
                  <input className="dinput" value={fields.role_title || ''} onChange={e => updateField('role_title', e.target.value)} placeholder="e.g. Frontend Intern" />
                </Field>
                <Field label="Joining Date">
                  <input type="date" className="dinput" value={fields.joining_date || ''} onChange={e => updateField('joining_date', e.target.value)} />
                </Field>
                <Field label="Salary / Stipend">
                  <input className="dinput" value={fields.salary || ''} onChange={e => updateField('salary', e.target.value)} placeholder="optional" />
                </Field>
                <Field label="Subject">
                  <input className="dinput" value={fields.subject || ''} onChange={e => updateField('subject', e.target.value)} placeholder="Offer of …" />
                </Field>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Signer Name">
                <input className="dinput" value={signatureName} onChange={e => setSignatureName(e.target.value)} />
              </Field>
              <Field label="Signer Title">
                <input className="dinput" value={signatureTitle} onChange={e => setSignatureTitle(e.target.value)} />
              </Field>
            </div>

            <Field label="Issued On">
              <input type="date" className="dinput" value={issuedOn ? issuedOn.slice(0, 10) : ''} onChange={e => setIssuedOn(e.target.value)} />
            </Field>
          </div>

          {/* Live preview */}
          <div className="lg:sticky lg:top-0 self-start">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Live Preview</p>
            <div className="bg-foreground/5 rounded-xl p-4 overflow-auto">
              <div className={isCert ? 'w-full' : 'max-w-xs mx-auto'}>
                <DocumentPreview data={previewData} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-black/5 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-white border-2 border-foreground/15 text-foreground/70 text-sm font-black hover:border-foreground/30 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A9AB5] text-white text-sm font-black hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
          </button>
        </div>
      </div>

      {/* Local input styling (scoped to this modal). */}
      <style jsx>{`
        :global(.dinput) {
          width: 100%;
          border: 1.5px solid rgba(0,0,0,0.1);
          border-radius: 0.75rem;
          padding: 0.55rem 0.8rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: #fff;
          color: var(--foreground);
          outline: none;
          transition: border-color .15s;
        }
        :global(.dinput:focus) { border-color: #35C8E0; box-shadow: 0 0 0 3px rgba(53,200,224,.15); }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[0.7rem] font-extrabold uppercase tracking-[0.05em] text-foreground/45 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
