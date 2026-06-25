'use client'

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  DocumentPreview — the single renderer for certificates & offer       ║
// ║  letters. Used by the admin generator (live, editable preview) AND    ║
// ║  the public /verify page (read-only). Whatever you change here shows  ║
// ║  up in both places, which is exactly what we want.                    ║
// ║                                                                       ║
// ║  Pure presentational: it takes a `DocumentPreviewData` object and     ║
// ║  draws. No data fetching, no state. The parent owns the `previewRef`  ║
// ║  (forwarded onto the root node) so PDF export can snapshot it.        ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { forwardRef } from 'react'
import Image from 'next/image'
import { fillTemplate, type DocumentType } from '@/lib/documents'

export interface DocumentPreviewData {
  type: DocumentType
  subType?: string
  title: string
  recipientName: string
  body: string
  quote?: string
  fields: Record<string, string>
  /** Drawn-signature dataURL (admin editor only; not exposed publicly). */
  signatureData?: string | null
  signatureName: string
  signatureTitle: string
  issuedOn?: string
  /** The public document id; null/undefined before the doc is saved. */
  documentId?: string | null
}

const ID_PLACEHOLDER = '— will be assigned on save —'

function formatDate(d?: string): string {
  if (!d) return ''
  const parsed = new Date(d)
  if (Number.isNaN(parsed.getTime())) return d
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

/** Build the {{var}} substitution map from recipient + fields. */
function buildVars(data: DocumentPreviewData): Record<string, string | undefined> {
  return {
    name: data.recipientName || '',
    role: data.fields.role_title || data.fields.role || '',
    joining_date: data.fields.joining_date ? formatDate(data.fields.joining_date) : '',
    salary: data.fields.salary || '',
    subject: data.fields.subject || '',
    ...data.fields,
  }
}

// ─── Signature block (shared by both layouts) ────────────────────────────────
function SignatureBlock({ data, dark }: { data: DocumentPreviewData; dark?: boolean }) {
  return (
    <div className="text-center">
      <div className="h-16 flex items-end justify-center mb-1">
        {data.signatureData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.signatureData}
            alt="Signature"
            className="max-h-16 max-w-[180px] object-contain"
          />
        ) : (
          <span className={`font-signature text-4xl leading-none ${dark ? 'text-primary-dark' : 'text-[#1A9AB5]'}`}>
            {data.signatureName || ' '}
          </span>
        )}
      </div>
      <div className="border-t-2 border-current/30 pt-1 min-w-[180px]">
        <p className="text-sm font-black text-foreground leading-tight">{data.signatureName}</p>
        <p className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wide">
          {data.signatureTitle}
        </p>
      </div>
    </div>
  )
}

// ─── SUG brand lockup ────────────────────────────────────────────────────────
function BrandLockup({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Image src="/sug-new-log.svg" alt="SUG Creative" width={size} height={size} className="flex-shrink-0" />
      <div className="leading-none">
        <p className="font-heading font-black text-[#1A9AB5] tracking-tight" style={{ fontSize: size * 0.42 }}>
          SUG CREATIVE
        </p>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#82C93D]">
          Innovate · Create · Grow
        </p>
      </div>
    </div>
  )
}

// ─── Certificate (landscape) ─────────────────────────────────────────────────
function CertificateLayout({ data }: { data: DocumentPreviewData }) {
  const body = fillTemplate(data.body, buildVars(data))
  return (
    <div className="relative aspect-[1.414/1] w-full bg-white overflow-hidden border-[3px] border-[#1A9AB5]">
      {/* Inner hairline frame */}
      <div className="absolute inset-2 border border-[#82C93D]/50 pointer-events-none" />

      {/* Geometric accent shapes (left edge) */}
      <div className="absolute -left-16 -top-16 w-44 h-44 rotate-45 bg-[#35C8E0]/15 pointer-events-none" />
      <div className="absolute -left-10 top-1/3 w-24 h-24 rounded-full bg-[#82C93D]/15 pointer-events-none" />
      <div className="absolute -right-14 -bottom-14 w-40 h-40 rotate-12 bg-[#1A9AB5]/10 pointer-events-none" />

      {/* Faint watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-heading font-black text-[#1A9AB5]/[0.05] text-[22vw] leading-none tracking-tighter">
          SUG
        </span>
      </div>

      <div className="relative h-full flex flex-col items-center px-[6%] py-[4%] text-center">
        {/* Header */}
        <div className="w-full flex items-center justify-center">
          <BrandLockup size={34} />
        </div>

        {/* Title banner */}
        <h1 className="mt-[3%] font-heading font-black text-primary-dark uppercase tracking-tight text-[clamp(1.4rem,4.2vw,2.6rem)] leading-none">
          {data.title}
        </h1>
        <div className="mt-2 h-1 w-24 bg-[#82C93D]" />

        <p className="mt-[3%] text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-foreground/50">
          This certificate is awarded in recognition of
        </p>

        {/* Recipient */}
        <p className="mt-[1.5%] font-heading font-black text-[clamp(1.6rem,5vw,3rem)] leading-none text-foreground">
          {data.recipientName || 'Recipient Name'}
        </p>
        <div className="mt-2 h-px w-2/5 bg-foreground/15" />

        {/* Body */}
        <p className="mt-[2.5%] max-w-[80%] text-[clamp(0.7rem,1.6vw,0.95rem)] leading-relaxed text-foreground/75">
          {body}
        </p>

        {/* Quote */}
        {data.quote && (
          <p className="mt-[2%] max-w-[75%] italic text-[clamp(0.7rem,1.5vw,0.9rem)] text-[#1A9AB5]">
            {data.quote}
          </p>
        )}

        {/* Footer: id left, signature right */}
        <div className="mt-auto w-full flex items-end justify-between pt-[2%]">
          <div className="text-left">
            <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">
              Certification ID
            </p>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-primary-dark break-all max-w-[160px]">
              {data.documentId || ID_PLACEHOLDER}
            </p>
            {data.issuedOn && (
              <p className="text-[9px] text-foreground/40 mt-0.5">Issued {formatDate(data.issuedOn)}</p>
            )}
          </div>
          <SignatureBlock data={data} dark />
        </div>
      </div>
    </div>
  )
}

// ─── Offer letter (portrait) ─────────────────────────────────────────────────
function OfferLetterLayout({ data }: { data: DocumentPreviewData }) {
  const vars = buildVars(data)
  const body = fillTemplate(data.body, vars)
  const subject = data.fields.subject || `Offer of ${data.fields.role_title || data.fields.role || 'Engagement'}`

  return (
    <div className="relative aspect-[1/1.414] w-full bg-white overflow-hidden border border-foreground/10 shadow-sm">
      {/* Full-page watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-heading font-black text-[#1A9AB5]/[0.04] text-[30vw] leading-none -rotate-12 tracking-tighter">
          SUG
        </span>
      </div>
      {/* Top accent bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#35C8E0] via-[#1A9AB5] to-[#82C93D]" />

      <div className="relative h-full flex flex-col px-[8%] py-[6%]">
        {/* Header: logo left, date right */}
        <div className="flex items-start justify-between">
          <BrandLockup size={30} />
          <p className="text-[10px] sm:text-xs font-semibold text-foreground/60">
            {data.issuedOn ? formatDate(data.issuedOn) : formatDate(new Date().toISOString().slice(0, 10))}
          </p>
        </div>

        {/* Subject */}
        <p className="mt-[6%] text-[clamp(0.75rem,1.8vw,1rem)] font-black text-primary-dark">
          Subject: {subject}
        </p>

        {/* Salutation + body */}
        <p className="mt-[4%] text-[clamp(0.7rem,1.6vw,0.9rem)] font-semibold text-foreground">
          Dear {data.recipientName || 'Candidate'},
        </p>
        <div className="mt-2 text-[clamp(0.68rem,1.5vw,0.85rem)] leading-relaxed text-foreground/80 whitespace-pre-line flex-1 overflow-hidden">
          {body}
        </div>

        {/* Signature */}
        <div className="mt-[4%] flex justify-end">
          <SignatureBlock data={data} />
        </div>

        {/* Footer id */}
        <div className="mt-[3%] pt-2 border-t border-foreground/10 flex items-center justify-between">
          <p className="text-[9px] font-mono font-bold text-foreground/50 break-all">
            OFFER LETTER ID: {data.documentId || ID_PLACEHOLDER}
          </p>
          <p className="text-[8px] uppercase tracking-widest text-foreground/30">SUG Creative</p>
        </div>
      </div>
    </div>
  )
}

// ─── Public renderer ─────────────────────────────────────────────────────────
const DocumentPreview = forwardRef<HTMLDivElement, { data: DocumentPreviewData; className?: string }>(
  function DocumentPreview({ data, className }, ref) {
    return (
      <div ref={ref} className={className}>
        {data.type === 'certificate' ? (
          <CertificateLayout data={data} />
        ) : (
          <OfferLetterLayout data={data} />
        )}
      </div>
    )
  }
)

export default DocumentPreview
