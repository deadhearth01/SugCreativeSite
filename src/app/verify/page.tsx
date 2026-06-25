'use client'

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Public document verification page (/verify?id=…).                    ║
// ║                                                                       ║
// ║  Anyone can confirm a SUG Creative certificate / offer letter is      ║
// ║  genuine. Reads ?id= from the URL (auto-verifies) and also offers a   ║
// ║  manual input box. Renders the SAME <DocumentPreview/> the admin       ║
// ║  studio uses, read-only, behind a green "Verified" badge.             ║
// ║                                                                       ║
// ║  The verify API intentionally omits the drawn signature image, so the ║
// ║  preview falls back to the cursive signer-name rendering here.        ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ShieldCheck, Search, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DocumentPreview, { type DocumentPreviewData } from '@/components/documents/DocumentPreview'

function mapVerifyData(d: Record<string, unknown>): DocumentPreviewData {
  const fields = (d.fields as Record<string, string>) || {}
  return {
    type: d.type as DocumentPreviewData['type'],
    subType: d.sub_type as string | undefined,
    title: d.title as string,
    recipientName: d.recipient_name as string,
    body: (d.body as string) || '',
    quote: fields.quote,
    fields,
    signatureData: null,
    signatureName: (d.signature_name as string) || '',
    signatureTitle: (d.signature_title as string) || '',
    issuedOn: d.issued_on as string | undefined,
    documentId: d.document_id as string,
  }
}

function VerifyInner() {
  const params = useSearchParams()
  const initialId = params.get('id') || ''

  const [id, setId] = useState(initialId)
  const [state, setState] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle')
  const [data, setData] = useState<DocumentPreviewData | null>(null)

  const runVerify = useCallback(async (docId: string) => {
    const trimmed = docId.trim()
    if (!trimmed) return
    setState('loading')
    setData(null)
    try {
      const res = await fetch(`/api/documents/verify?id=${encodeURIComponent(trimmed)}`)
      const json = await res.json()
      if (json.valid && json.data) {
        setData(mapVerifyData(json.data))
        setState('valid')
      } else {
        setState('invalid')
      }
    } catch {
      setState('invalid')
    }
  }, [])

  // Auto-verify when an id is present in the URL. The async fetch defers all
  // state updates past the first `await`, so the effect body does no
  // synchronous setState.
  useEffect(() => {
    if (!initialId.trim()) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/documents/verify?id=${encodeURIComponent(initialId.trim())}`)
        const json = await res.json()
        if (cancelled) return
        if (json.valid && json.data) {
          setData(mapVerifyData(json.data))
          setState('valid')
        } else {
          setState('invalid')
        }
      } catch {
        if (!cancelled) setState('invalid')
      }
    })()
    return () => { cancelled = true }
  }, [initialId])

  return (
    <main className="min-h-screen bg-[#F3F4F6]">
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#35C8E0]/15 mb-3">
              <ShieldCheck size={26} className="text-[#1A9AB5]" />
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-primary-dark tracking-tight">
              Document Verification
            </h1>
            <p className="text-foreground/55 font-medium mt-2 max-w-lg mx-auto">
              Confirm the authenticity of a SUG Creative certificate or offer letter by entering its document ID.
            </p>
          </div>

          {/* Search box */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                value={id}
                onChange={e => setId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runVerify(id)}
                placeholder="Enter document ID, e.g. SUGCE2026…"
                className="w-full pl-10 pr-3 py-3 rounded-xl border-[1.5px] border-black/10 text-sm font-medium bg-white outline-none focus:border-[#35C8E0] focus:ring-[3px] focus:ring-[#35C8E0]/15 transition"
              />
            </div>
            <button
              onClick={() => runVerify(id)}
              disabled={state === 'loading' || !id.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1A9AB5] text-white text-sm font-black hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              Verify
            </button>
          </div>

          {/* Results */}
          {state === 'invalid' && (
            <div className="mt-8 bg-white rounded-2xl border-2 border-red-200 p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-3">
                <XCircle size={28} className="text-red-500" />
              </div>
              <h2 className="font-heading font-black text-xl text-red-600">No valid document found for this ID</h2>
              <p className="text-foreground/55 mt-2 text-sm">
                Please double-check the ID and try again. Genuine SUG Creative documents carry an ID beginning with <strong>SUG</strong>.
              </p>
            </div>
          )}

          {state === 'valid' && data && (
            <div className="mt-8">
              {/* Verified badge + key details */}
              <div className="bg-[#82C93D]/12 border-2 border-[#82C93D]/40 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#82C93D] text-white text-xs font-black uppercase tracking-wide">
                    <CheckCircle2 size={14} /> Verified ✓
                  </span>
                  <span className="text-sm font-semibold text-[#4d7a24]">Authentic SUG Creative document</span>
                </div>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <Detail label="Recipient" value={data.recipientName} />
                  <Detail label="Document" value={data.title} />
                  <Detail label="Issued" value={data.issuedOn ? new Date(data.issuedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'} />
                  <Detail label="Document ID" value={data.documentId || '—'} mono />
                </dl>
              </div>

              {/* Read-only rendered document */}
              <div className="bg-foreground/5 rounded-2xl p-4 sm:p-6 overflow-auto">
                <div className={data.type === 'certificate' ? 'w-full' : 'max-w-md mx-auto'}>
                  <DocumentPreview data={data} />
                </div>
              </div>
            </div>
          )}

          {state === 'idle' && !initialId && (
            <p className="text-center text-xs text-foreground/40 mt-6">
              Tip: links in SUG Creative document emails open this page with the ID pre-filled.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] font-black uppercase tracking-widest text-[#4d7a24]/70">{label}</dt>
      <dd className={`font-semibold text-foreground break-words ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </main>
    }>
      <VerifyInner />
    </Suspense>
  )
}
