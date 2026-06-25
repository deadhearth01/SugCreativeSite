'use client'

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Admin — Certificate & Offer Letter generator.                        ║
// ║                                                                       ║
// ║  Left: editable form. Right: live <DocumentPreview/> (same component  ║
// ║  the public /verify page uses). Top bar switches generator type and   ║
// ║  exposes a verify panel.                                              ║
// ║                                                                       ║
// ║  Save flow: the public document_id only exists AFTER the row is       ║
// ║  inserted, so Download and Send-to-Mail both call saveDocument()      ║
// ║  first (reusing an already-saved row if the form is unchanged) and    ║
// ║  then export / email using the returned id.                          ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Award, FileText, PenLine, Download, Send, Save, ShieldCheck, Search,
  Loader2, CheckCircle2, XCircle, Users, UserPlus, X, Copy, Check, FolderOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  CERTIFICATE_SUBTYPES, getDocumentDefault, type DocumentType, type CertificateSubType,
} from '@/lib/documents'
import DocumentPreview, { type DocumentPreviewData } from '@/components/documents/DocumentPreview'
import SignaturePad from '@/components/documents/SignaturePad'

type ProfileLite = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  display_id: string | null
  role: string | null
}

type Toast = { kind: 'success' | 'error'; msg: string } | null

const DEFAULT_SIGNER = 'Mathala Sreenivas'
const SIGNER_TITLE = {
  certificate: 'Founder & Managing Director',
  offer_letter: 'Founder & C.E.O',
}

export default function AdminDocumentsPage() {
  // ── Generator type ──
  const [type, setType] = useState<DocumentType>('certificate')
  const [subType, setSubType] = useState<CertificateSubType>('excellence')

  // ── Editable content ──
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [quote, setQuote] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({
    role_title: '', joining_date: '', salary: '', subject: '',
  })

  // ── Recipient ──
  const [recipientMode, setRecipientMode] = useState<'internal' | 'external'>('internal')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [recipientProfileId, setRecipientProfileId] = useState<string | null>(null)

  // Internal user search
  const [users, setUsers] = useState<ProfileLite[]>([])
  const [userQuery, setUserQuery] = useState('')
  const [userListOpen, setUserListOpen] = useState(false)
  const userBoxRef = useRef<HTMLDivElement>(null)

  // ── Signature ──
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [signatureName, setSignatureName] = useState(DEFAULT_SIGNER)
  const [signatureTitle, setSignatureTitle] = useState(SIGNER_TITLE.certificate)
  const [showSignaturePad, setShowSignaturePad] = useState(false)

  const [issuedOn] = useState(() => new Date().toISOString().slice(0, 10))

  // ── Save / saved row tracking ──
  const [savedId, setSavedId] = useState<string | null>(null)
  const lastSavedSnapshot = useRef<string>('')
  const [busy, setBusy] = useState<null | 'save' | 'download' | 'email'>(null)
  const [toast, setToast] = useState<Toast>(null)
  const [copied, setCopied] = useState(false)

  // ── Verify panel ──
  const [verifyOpen, setVerifyOpen] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)

  // ─── Load defaults when type / subtype changes ───────────────────────────
  const loadDefaults = useCallback((t: DocumentType, st: CertificateSubType) => {
    const def = getDocumentDefault(t, st)
    setTitle(def.title)
    setBody(def.body)
    setQuote(def.quote || '')
    setSignatureTitle(t === 'certificate' ? SIGNER_TITLE.certificate : SIGNER_TITLE.offer_letter)
  }, [])

  useEffect(() => { loadDefaults('certificate', 'excellence') }, [loadDefaults])

  const switchType = (t: DocumentType) => {
    setType(t)
    loadDefaults(t, subType)
    setSavedId(null) // invalidate prior save — different doc
  }
  const switchSubType = (st: CertificateSubType) => {
    setSubType(st)
    loadDefaults('certificate', st)
    setSavedId(null)
  }

  // ─── Load internal users (direct browser client, like the users page) ────
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('id, full_name, email, phone, display_id, role')
      .order('full_name', { ascending: true })
      .then(({ data }) => { if (data) setUsers(data as ProfileLite[]) })
  }, [])

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase()
    if (!q) return users.slice(0, 40)
    return users
      .filter(u =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.display_id || '').toLowerCase().includes(q))
      .slice(0, 40)
  }, [users, userQuery])

  const selectUser = (u: ProfileLite) => {
    setRecipientName(u.full_name || '')
    setRecipientEmail(u.email || '')
    setRecipientPhone(u.phone || '')
    setRecipientProfileId(u.id)
    setUserQuery(u.full_name || u.email || '')
    setUserListOpen(false)
    setSavedId(null)
  }

  // Close user dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userBoxRef.current && !userBoxRef.current.contains(e.target as Node)) setUserListOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // ─── Live preview data ───────────────────────────────────────────────────
  const previewData: DocumentPreviewData = useMemo(() => ({
    type,
    subType: type === 'certificate' ? subType : undefined,
    title,
    recipientName,
    body,
    quote: type === 'certificate' ? quote : undefined,
    fields,
    signatureData,
    signatureName,
    signatureTitle,
    issuedOn,
    documentId: savedId,
  }), [type, subType, title, recipientName, body, quote, fields, signatureData, signatureName, signatureTitle, issuedOn, savedId])

  // Snapshot used to decide whether a fresh save is needed.
  const snapshot = useMemo(() => JSON.stringify({
    type, subType, title, body, quote, fields, recipientName, recipientEmail,
    recipientPhone, recipientProfileId, signatureData, signatureName, signatureTitle,
  }), [type, subType, title, body, quote, fields, recipientName, recipientEmail, recipientPhone, recipientProfileId, signatureData, signatureName, signatureTitle])

  const showToast = (t: Toast) => {
    setToast(t)
    if (t) setTimeout(() => setToast(null), 6000)
  }

  // ─── Save (POST). Reuses last saved row if nothing changed. ──────────────
  const saveDocument = useCallback(async (sendEmail: boolean): Promise<{ id: string } | null> => {
    if (!recipientName.trim()) {
      showToast({ kind: 'error', msg: 'Recipient name is required.' })
      return null
    }
    // Reuse the existing row when nothing changed — never create duplicates.
    // (Emailing an already-saved doc goes through the resend path, not a re-POST.)
    if (savedId && snapshot === lastSavedSnapshot.current) {
      return { id: savedId }
    }
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        sub_type: type === 'certificate' ? subType : null,
        title,
        recipient_profile_id: recipientMode === 'internal' ? recipientProfileId : null,
        recipient_name: recipientName,
        recipient_email: recipientEmail || null,
        recipient_phone: recipientPhone || null,
        body,
        fields: { ...fields, quote },
        signature_data: signatureData,
        signature_name: signatureName,
        signature_title: signatureTitle,
        issued_on: issuedOn,
        send_email: sendEmail,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      showToast({ kind: 'error', msg: json.error || 'Failed to save document.' })
      return null
    }
    const id = json.data?.document_id as string
    setSavedId(id)
    lastSavedSnapshot.current = snapshot
    return { id }
  }, [recipientName, savedId, snapshot, type, subType, title, recipientMode, recipientProfileId, recipientEmail, recipientPhone, body, fields, quote, signatureData, signatureName, signatureTitle, issuedOn])

  // ─── Actions ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setBusy('save')
    const r = await saveDocument(false)
    if (r) showToast({ kind: 'success', msg: `Saved. Document ID: ${r.id}` })
    setBusy(null)
  }

  const handleDownload = async () => {
    setBusy('download')
    try {
      const r = await saveDocument(false)
      if (!r) { setBusy(null); return }
      // Wait a tick so the preview re-renders with the assigned id.
      await new Promise(res => setTimeout(res, 60))
      const node = previewRef.current
      if (!node) { setBusy(null); return }

      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false })
      const img = canvas.toDataURL('image/png')
      const orientation = type === 'certificate' ? 'landscape' : 'portrait'
      const pdf = new jsPDF({ orientation, unit: 'px', format: [canvas.width, canvas.height] })
      pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height)
      const safeName = (recipientName || 'recipient').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      pdf.save(`${type}-${safeName}-${r.id}.pdf`)
      showToast({ kind: 'success', msg: `Downloaded. Document ID: ${r.id}` })
    } catch (e) {
      console.error(e)
      showToast({ kind: 'error', msg: 'PDF export failed.' })
    }
    setBusy(null)
  }

  const handleSendEmail = async () => {
    if (!recipientEmail.trim()) {
      showToast({ kind: 'error', msg: 'A recipient email is required to send.' })
      return
    }
    setBusy('email')
    // Save once (reused if unchanged), then email that exact row — no duplicates.
    const r = await saveDocument(false)
    if (!r) { setBusy(null); return }
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resend: true, document_id: r.id }),
      })
      const json = await res.json()
      if (!res.ok) showToast({ kind: 'error', msg: json.error || 'Failed to send email.' })
      else showToast({ kind: 'success', msg: `Emailed to ${recipientEmail}. Document ID: ${r.id}` })
    } catch {
      showToast({ kind: 'error', msg: 'Failed to send email.' })
    }
    setBusy(null)
  }

  const copyId = () => {
    if (!savedId) return
    navigator.clipboard?.writeText(savedId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const updateField = (k: string, v: string) => {
    setFields(prev => ({ ...prev, [k]: v }))
    setSavedId(null)
  }

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1500px] mx-auto pb-24">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-primary-dark uppercase tracking-tight flex items-center gap-2">
            <Award className="text-[#82C93D]" /> Document Studio
          </h1>
          <p className="text-sm text-foreground/55 font-medium mt-0.5">
            Generate certificates &amp; offer letters, sign, export to PDF, and email.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start">
          <Link
            href="/dashboard/admin/documents/all"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#82C93D] text-white text-sm font-black hover:brightness-95 transition-all"
          >
            <FolderOpen size={16} /> View All Documents
          </Link>
          <button
            onClick={() => setVerifyOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-[#1A9AB5] text-[#1A9AB5] text-sm font-black hover:bg-[#1A9AB5] hover:text-white transition-colors"
          >
            <ShieldCheck size={16} /> Verify Document
          </button>
        </div>
      </div>

      {/* Generator segmented control */}
      <div className="inline-flex p-1 rounded-2xl bg-white border border-black/5 shadow-sm mb-6">
        {([
          { v: 'certificate', label: 'Certificate', icon: Award },
          { v: 'offer_letter', label: 'Offer Letter', icon: FileText },
        ] as const).map(t => (
          <button
            key={t.v}
            onClick={() => switchType(t.v)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              type === t.v ? 'bg-[#1A9AB5] text-white shadow' : 'text-foreground/50 hover:text-foreground/80'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ─── FORM COLUMN ─── */}
        <div className="space-y-5">
          {/* Content card */}
          <Section title="Content" icon={FileText}>
            {type === 'certificate' && (
              <Field label="Certificate Type">
                <select
                  value={subType}
                  onChange={e => switchSubType(e.target.value as CertificateSubType)}
                  className="input"
                >
                  {CERTIFICATE_SUBTYPES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Title">
              <input className="input" value={title} onChange={e => { setTitle(e.target.value); setSavedId(null) }} />
            </Field>

            <Field label="Body">
              <textarea
                className="input min-h-[120px] resize-y whitespace-pre-line"
                value={body}
                onChange={e => { setBody(e.target.value); setSavedId(null) }}
              />
              <p className="hint">Supports placeholders: <code>{'{{name}}'}</code>, <code>{'{{role}}'}</code>, <code>{'{{joining_date}}'}</code>.</p>
            </Field>

            {type === 'certificate' && (
              <Field label="Quote">
                <input className="input" value={quote} onChange={e => { setQuote(e.target.value); setSavedId(null) }} />
              </Field>
            )}

            {type === 'offer_letter' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role / Position">
                  <input className="input" value={fields.role_title} onChange={e => updateField('role_title', e.target.value)} placeholder="e.g. Frontend Intern" />
                </Field>
                <Field label="Joining Date">
                  <input type="date" className="input" value={fields.joining_date} onChange={e => updateField('joining_date', e.target.value)} />
                </Field>
                <Field label="Salary / Stipend">
                  <input className="input" value={fields.salary} onChange={e => updateField('salary', e.target.value)} placeholder="optional" />
                </Field>
                <Field label="Subject">
                  <input className="input" value={fields.subject} onChange={e => updateField('subject', e.target.value)} placeholder="Offer of …" />
                </Field>
              </div>
            )}
          </Section>

          {/* Recipient card */}
          <Section title="Recipient" icon={Users}>
            <div className="inline-flex p-1 rounded-xl bg-foreground/5 mb-4">
              {([
                { v: 'internal', label: 'Internal User', icon: Users },
                { v: 'external', label: 'External', icon: UserPlus },
              ] as const).map(m => (
                <button
                  key={m.v}
                  onClick={() => { setRecipientMode(m.v); setSavedId(null) }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    recipientMode === m.v ? 'bg-white text-[#1A9AB5] shadow-sm' : 'text-foreground/50'
                  }`}
                >
                  <m.icon size={13} /> {m.label}
                </button>
              ))}
            </div>

            {recipientMode === 'internal' ? (
              <div ref={userBoxRef} className="relative mb-3">
                <label className="lbl">Search Dashboard User</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    className="input pl-9"
                    value={userQuery}
                    onChange={e => { setUserQuery(e.target.value); setUserListOpen(true) }}
                    onFocus={() => setUserListOpen(true)}
                    placeholder="Name, email, or ID…"
                  />
                </div>
                {userListOpen && filteredUsers.length > 0 && (
                  <div data-lenis-prevent className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto overscroll-contain bg-white border border-black/10 rounded-xl shadow-lg">
                    {filteredUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => selectUser(u)}
                        className="w-full text-left px-3 py-2 hover:bg-[#35C8E0]/10 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{u.full_name || u.email || 'Unnamed'}</p>
                          <p className="text-[11px] text-foreground/50 truncate">{u.email}</p>
                        </div>
                        {u.display_id && <span className="text-[10px] font-mono text-[#5B8E2A] flex-shrink-0">{u.display_id}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3">
              <Field label="Recipient Name">
                <input className="input" value={recipientName} onChange={e => { setRecipientName(e.target.value); setRecipientProfileId(null); setSavedId(null) }} placeholder="Full name" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <input type="email" className="input" value={recipientEmail} onChange={e => { setRecipientEmail(e.target.value); setSavedId(null) }} placeholder="name@email.com" />
                </Field>
                <Field label="Phone">
                  <input className="input" value={recipientPhone} onChange={e => { setRecipientPhone(e.target.value); setSavedId(null) }} placeholder="optional" />
                </Field>
              </div>
            </div>
          </Section>

          {/* Signature card */}
          <Section title="Signature" icon={PenLine}>
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setShowSignaturePad(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#35C8E0]/15 text-[#1A9AB5] text-sm font-black hover:bg-[#35C8E0]/25 transition-colors"
              >
                <PenLine size={16} /> {signatureData ? 'Re-draw Signature' : 'Sign'}
              </button>
              {signatureData && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={signatureData} alt="Signature preview" className="h-10 border border-black/10 rounded-lg bg-white px-1" />
                  <button onClick={() => setSignatureData(null)} className="text-foreground/40 hover:text-red-500 p-1" aria-label="Remove signature">
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Signer Name">
                <input className="input" value={signatureName} onChange={e => { setSignatureName(e.target.value); setSavedId(null) }} />
              </Field>
              <Field label="Signer Title">
                <input className="input" value={signatureTitle} onChange={e => { setSignatureTitle(e.target.value); setSavedId(null) }} />
              </Field>
            </div>
            {!signatureData && (
              <p className="hint mt-1">No drawn signature — the preview shows the signer name in a cursive script.</p>
            )}
          </Section>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!!busy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-foreground/15 text-foreground/80 text-sm font-black hover:border-[#1A9AB5] hover:text-[#1A9AB5] transition-colors disabled:opacity-50"
            >
              {busy === 'save' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
            </button>
            <button
              onClick={handleDownload}
              disabled={!!busy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A9AB5] text-white text-sm font-black hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {busy === 'download' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download PDF
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!!busy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#82C93D] text-white text-sm font-black hover:brightness-95 transition-all disabled:opacity-50"
            >
              {busy === 'email' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send to Mail
            </button>
          </div>

          {savedId && (
            <div className="flex items-center gap-2 text-xs font-mono bg-[#82C93D]/10 border border-[#82C93D]/30 rounded-xl px-3 py-2">
              <CheckCircle2 size={14} className="text-[#5B8E2A] flex-shrink-0" />
              <span className="text-foreground/70 truncate">Document ID: <strong className="text-[#5B8E2A]">{savedId}</strong></span>
              <button onClick={copyId} className="ml-auto text-foreground/50 hover:text-[#1A9AB5] flex-shrink-0" aria-label="Copy ID">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* ─── PREVIEW COLUMN ─── */}
        <div className="lg:sticky lg:top-20 self-start">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest text-foreground/40">Live Preview</p>
            <span className="text-[10px] font-bold uppercase tracking-wide text-foreground/30">
              {type === 'certificate' ? 'Landscape' : 'Portrait · Letter'}
            </span>
          </div>
          <div className="bg-foreground/5 rounded-2xl p-4 sm:p-6 overflow-auto">
            <div className={type === 'certificate' ? 'w-full' : 'max-w-md mx-auto'}>
              <DocumentPreview ref={previewRef} data={previewData} />
            </div>
          </div>
        </div>
      </div>

      {/* Signature pad (draggable) */}
      {showSignaturePad && (
        <SignaturePad
          onInsert={(d) => { setSignatureData(d); setSavedId(null) }}
          onClose={() => setShowSignaturePad(false)}
        />
      )}

      {/* Verify modal */}
      {verifyOpen && <VerifyModal onClose={() => setVerifyOpen(false)} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[130] max-w-sm flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold ${
          toast.kind === 'success' ? 'bg-[#1A9AB5] text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.kind === 'success' ? <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" /> : <XCircle size={18} className="flex-shrink-0 mt-0.5" />}
          <span className="break-words">{toast.msg}</span>
        </div>
      )}

      {/* Local input styling */}
      <style jsx>{`
        :global(.input) {
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
        :global(.input:focus) { border-color: #35C8E0; box-shadow: 0 0 0 3px rgba(53,200,224,.15); }
        :global(.lbl) {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(0,0,0,0.45);
          margin-bottom: 0.3rem;
        }
        .hint { font-size: 0.7rem; color: rgba(0,0,0,0.4); margin-top: 0.3rem; }
        .hint :global(code) { background: rgba(0,0,0,0.05); padding: 0 4px; border-radius: 4px; font-size: 0.68rem; }
      `}</style>
    </div>
  )
}

// ─── Small layout helpers ────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
      <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-primary-dark mb-4">
        <Icon size={16} className="text-[#82C93D]" /> {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="lbl">{label}</label>
      {children}
    </div>
  )
}

// ─── Verify modal (reuses DocumentPreview read-only) ─────────────────────────
function VerifyModal({ onClose }: { onClose: () => void }) {
  const [id, setId] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle')
  const [data, setData] = useState<DocumentPreviewData | null>(null)

  const verify = async () => {
    if (!id.trim()) return
    setState('loading')
    setData(null) // clear any prior result so stale data can't flash
    try {
      const res = await fetch(`/api/documents/verify?id=${encodeURIComponent(id.trim())}`)
      const json = await res.json()
      if (json.valid && json.data) {
        const d = json.data
        setData({
          type: d.type,
          subType: d.sub_type,
          title: d.title,
          recipientName: d.recipient_name,
          body: d.body || '',
          quote: d.fields?.quote,
          fields: d.fields || {},
          signatureData: null,
          signatureName: d.signature_name || '',
          signatureTitle: d.signature_title || '',
          issuedOn: d.issued_on,
          documentId: d.document_id,
        })
        setState('valid')
      } else {
        setState('invalid')
        setData(null)
      }
    } catch {
      setState('invalid')
    }
  }

  return (
    <div className="fixed inset-0 z-[125] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <h3 className="flex items-center gap-2 font-black text-primary-dark uppercase tracking-wide text-sm">
            <ShieldCheck size={18} className="text-[#82C93D]" /> Verify Document
          </h3>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground p-1" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-5">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={id}
              onChange={e => setId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verify()}
              placeholder="Paste document ID, e.g. SUGCE2026…"
            />
            <button onClick={verify} disabled={state === 'loading'} className="px-4 py-2.5 rounded-xl bg-[#1A9AB5] text-white text-sm font-black hover:bg-primary-dark transition-colors disabled:opacity-50">
              {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
            </button>
          </div>

          {state === 'invalid' && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-semibold">
              <XCircle size={18} /> No valid document found for this ID.
            </div>
          )}

          {state === 'valid' && data && (
            <div className="mt-4">
              <div className="flex items-center gap-2 bg-[#82C93D]/15 border border-[#82C93D]/40 text-[#4d7a24] rounded-xl px-4 py-2.5 text-sm font-black mb-4">
                <CheckCircle2 size={18} /> Verified ✓ — authentic SUG Creative document
              </div>
              <div className="bg-foreground/5 rounded-xl p-4">
                <div className={data.type === 'certificate' ? 'w-full' : 'max-w-sm mx-auto'}>
                  <DocumentPreview data={data} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
