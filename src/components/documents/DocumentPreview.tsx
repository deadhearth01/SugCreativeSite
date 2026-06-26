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
import DOMPurify from 'dompurify'
import { fillTemplate, type DocumentType } from '@/lib/documents'

// The offer-letter body may be rich HTML (Quill). Sanitize before rendering
// since the public /verify page displays it. Falls back to plain text (with
// line breaks preserved) for legacy plain-text bodies.
function isHtml(s: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(s)
}
function sanitize(html: string): string {
  if (typeof window === 'undefined') return html // SSR: client re-renders sanitized
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'a', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  })
}

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

// Auto-fit: pick name/body/quote sizes from the recipient-name length so long
// names (which wrap to multiple lines) never overflow into the signature area.
// Deterministic tiers — same result in the live preview and the PDF snapshot.
function fitSizes(name: string) {
  const n = (name || '').trim().length
  if (n <= 16) return { name: 'clamp(1.7rem,5vw,3rem)', body: 'clamp(0.72rem,1.6vw,0.95rem)', quote: 'clamp(0.72rem,1.5vw,0.9rem)', gap: '2.5%' }
  if (n <= 24) return { name: 'clamp(1.5rem,4.3vw,2.5rem)', body: 'clamp(0.7rem,1.55vw,0.9rem)', quote: 'clamp(0.7rem,1.45vw,0.85rem)', gap: '2.2%' }
  if (n <= 32) return { name: 'clamp(1.25rem,3.7vw,2.05rem)', body: 'clamp(0.66rem,1.45vw,0.85rem)', quote: 'clamp(0.66rem,1.35vw,0.8rem)', gap: '1.8%' }
  if (n <= 42) return { name: 'clamp(1.05rem,3vw,1.7rem)', body: 'clamp(0.62rem,1.35vw,0.8rem)', quote: 'clamp(0.62rem,1.25vw,0.76rem)', gap: '1.5%' }
  return { name: 'clamp(0.9rem,2.5vw,1.4rem)', body: 'clamp(0.58rem,1.25vw,0.74rem)', quote: 'clamp(0.58rem,1.15vw,0.72rem)', gap: '1.2%' }
}

// ─── Certificate (landscape) ─────────────────────────────────────────────────
function CertificateLayout({ data }: { data: DocumentPreviewData }) {
  const body = fillTemplate(data.body, buildVars(data))
  const sz = fitSizes(data.recipientName)
  return (
    <div className="relative aspect-[1.414/1] w-full bg-white overflow-hidden border-[3px] border-[#1A9AB5]">
      {/* Decorative background flourish (behind everything, full bleed) */}
      <Image
        src="/illustrations/certificate-background-flourish.png"
        alt=""
        fill
        aria-hidden
        className="object-cover opacity-[0.07] pointer-events-none select-none"
      />

      {/* Green inner frame — a real clipping container. The watermark AND all
          content live inside it, so nothing ever crosses the green border. */}
      <div className="absolute inset-2 border border-[#82C93D]/50 overflow-hidden">
        {/* Faint watermark — clipped to the green frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-heading font-black text-[#1A9AB5]/[0.05] text-[40%] leading-none tracking-tighter" style={{ fontSize: '12rem' }}>
            SUG
          </span>
        </div>

        {/* 3-zone layout: header (top) / content (clipping middle) / footer (bottom).
            Footer is pinned, so the signature can never be pushed off; long
            content is constrained to the middle zone and clipped inside the frame. */}
        <div className="absolute inset-0 flex flex-col px-[6%] py-[4.5%] text-center">
        {/* Header zone */}
        <div className="shrink-0 flex items-center justify-center">
          <BrandLockup size={30} />
        </div>

        {/* Middle zone — flexes to fill, vertically centered, clips overflow */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden">
          <h1 className="font-heading font-black text-primary-dark uppercase tracking-tight text-[clamp(1.3rem,4vw,2.4rem)] leading-[1.05]">
            {data.title}
          </h1>
          <div className="mt-2 h-1 w-20 bg-[#82C93D]" />

          <p className="mt-[2.5%] text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-foreground/50">
            This certificate is awarded in recognition of
          </p>

          {/* Recipient — size scales down with name length */}
          <p
            className="mt-[1%] font-heading font-black leading-[1.05] text-foreground px-[2%]"
            style={{ fontSize: sz.name }}
          >
            {data.recipientName || 'Recipient Name'}
          </p>
          <div className="mt-2 h-px w-2/5 bg-foreground/15" />

          {/* Body */}
          <p className="max-w-[84%] leading-relaxed text-foreground/75" style={{ marginTop: sz.gap, fontSize: sz.body }}>
            {body}
          </p>

          {/* Quote */}
          {data.quote && (
            <p className="max-w-[80%] italic text-[#1A9AB5]" style={{ marginTop: sz.gap, fontSize: sz.quote }}>
              {data.quote}
            </p>
          )}
        </div>

        {/* Footer zone — always pinned at the bottom */}
        <div className="shrink-0 w-full flex items-end justify-between pt-[2%]">
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

      {/* 3-zone: header (top) / body (flexible, clips) / signature+footer (bottom). */}
      <div className="absolute inset-0 flex flex-col px-[8%] py-[6%]">
        {/* Header: logo left, date right */}
        <div className="shrink-0 flex items-start justify-between">
          <BrandLockup size={28} />
          <p className="text-[10px] sm:text-xs font-semibold text-foreground/60">
            {data.issuedOn ? formatDate(data.issuedOn) : formatDate(new Date().toISOString().slice(0, 10))}
          </p>
        </div>

        {/* Body zone — flexes + clips so it never pushes the signature off */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {/* Subject */}
          <p className="mt-[5%] text-[clamp(0.75rem,1.8vw,1rem)] font-black text-primary-dark shrink-0">
            Subject: {subject}
          </p>

          {/* Salutation + body */}
          <p className="mt-[4%] text-[clamp(0.7rem,1.6vw,0.9rem)] font-semibold text-foreground shrink-0">
            Dear {data.recipientName || 'Candidate'},
          </p>
          {isHtml(body) ? (
            <div
              className="mt-2 text-[clamp(0.68rem,1.5vw,0.85rem)] leading-relaxed text-foreground/80 doc-richtext"
              dangerouslySetInnerHTML={{ __html: sanitize(body) }}
            />
          ) : (
            <div className="mt-2 text-[clamp(0.68rem,1.5vw,0.85rem)] leading-relaxed text-foreground/80 whitespace-pre-line">
              {body}
            </div>
          )}
        </div>

        {/* Signature + footer — pinned at the bottom */}
        <div className="shrink-0">
          <div className="flex justify-end">
            <SignatureBlock data={data} />
          </div>
          <div className="mt-[3%] pt-2 border-t border-foreground/10 flex items-center justify-between">
            <p className="text-[9px] font-mono font-bold text-foreground/50 break-all">
              OFFER LETTER ID: {data.documentId || ID_PLACEHOLDER}
            </p>
            <p className="text-[8px] uppercase tracking-widest text-foreground/30">SUG Creative</p>
          </div>
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
