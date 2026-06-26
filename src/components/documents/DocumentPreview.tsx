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

// Recipient-name font size (in cqw — % of certificate width) by name length,
// so long names shrink instead of overflowing.
function nameCqw(name: string): string {
  const n = (name || '').trim().length
  if (n <= 16) return '6.5cqw'
  if (n <= 26) return '5.5cqw'
  if (n <= 36) return '4.5cqw'
  if (n <= 48) return '3.6cqw'
  return '3cqw'
}

// ─── Certificate (landscape) ─────────────────────────────────────────────────
// Sized entirely in container-query units (cqw = 1% of the certificate's own
// width), so it scales proportionally at ANY size — the small live preview and
// the full-resolution PDF look identical. Three zones: title block pinned at
// the top (with the logo, so the title can never overlap it), recipient block
// centered, signature/ID pinned at the bottom.
function CertificateLayout({ data }: { data: DocumentPreviewData }) {
  const body = fillTemplate(data.body, buildVars(data))
  return (
    <div className="@container relative aspect-[1.414/1] w-full bg-white overflow-hidden border-[3px] border-[#1A9AB5]">
      {/* Decorative background flourish */}
      <Image
        src="/illustrations/certificate-background-flourish.png"
        alt=""
        fill
        aria-hidden
        className="object-cover opacity-[0.07] pointer-events-none select-none"
      />

      {/* Green inner frame — clips everything (watermark + content) so nothing
          ever crosses the green border. */}
      <div className="absolute inset-[1.4cqw] border border-[#82C93D]/50 overflow-hidden">
        {/* Faint watermark, contained */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-heading font-black text-[#1A9AB5]/[0.05] text-[24cqw] leading-none tracking-tighter">
            SUG
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col px-[7cqw] py-[5cqw] text-center">
          {/* TOP: logo + title (never overlap — same flow column) */}
          <div className="shrink-0 flex flex-col items-center gap-[2cqw]">
            <div className="flex items-center gap-[1.5cqw]">
              <Image src="/sug-new-log.svg" alt="SUG Creative" width={48} height={48} aria-hidden className="w-[6cqw] h-[6cqw]" />
              <div className="leading-none text-left">
                <p className="font-heading font-black text-[#1A9AB5] tracking-tight text-[2.4cqw]">SUG CREATIVE</p>
                <p className="font-bold uppercase tracking-[0.2em] text-[#82C93D] text-[1.1cqw]">Innovate · Create · Grow</p>
              </div>
            </div>
            <h1 className="font-heading font-black text-primary-dark uppercase tracking-tight text-[5cqw] leading-[1.05]">
              {data.title}
            </h1>
            <div className="h-[0.5cqw] w-[14cqw] bg-[#82C93D]" />
          </div>

          {/* MIDDLE: recipient is the centered hero */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden gap-[1.5cqw]">
            <p className="font-bold uppercase tracking-[0.22em] text-foreground/50 text-[1.7cqw]">
              This certificate is awarded in recognition of
            </p>
            <p className="font-heading font-black leading-[1.05] text-foreground px-[2cqw]" style={{ fontSize: nameCqw(data.recipientName) }}>
              {data.recipientName || 'Recipient Name'}
            </p>
            <div className="h-px w-[35cqw] bg-foreground/15" />
            <p className="max-w-[80cqw] leading-relaxed text-foreground/75 text-[2.3cqw]">
              {body}
            </p>
            {data.quote && (
              <p className="max-w-[76cqw] italic text-[#1A9AB5] text-[2.1cqw]">
                {data.quote}
              </p>
            )}
          </div>

          {/* FOOTER: id (left) + signature (right), pinned to the bottom */}
          <div className="shrink-0 w-full flex items-end justify-between gap-[4cqw]">
            <div className="text-left">
              <p className="font-bold uppercase tracking-widest text-foreground/40 text-[1.3cqw]">Certification ID</p>
              <p className="font-mono font-bold text-primary-dark break-all text-[1.6cqw] max-w-[40cqw]">
                {data.documentId || ID_PLACEHOLDER}
              </p>
              {data.issuedOn && (
                <p className="text-foreground/40 text-[1.3cqw] mt-[0.5cqw]">Issued {formatDate(data.issuedOn)}</p>
              )}
            </div>
            <div className="text-center">
              <div className="h-[7cqw] flex items-end justify-center">
                {data.signatureData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.signatureData} alt="Signature" className="max-h-[7cqw] max-w-[24cqw] object-contain" />
                ) : (
                  <span className="font-signature text-[#1A9AB5] text-[5.5cqw] leading-none">{data.signatureName || ' '}</span>
                )}
              </div>
              <div className="border-t-2 border-foreground/30 pt-[0.8cqw] min-w-[24cqw]">
                <p className="font-black text-foreground leading-tight text-[1.8cqw]">{data.signatureName}</p>
                <p className="font-semibold text-foreground/60 uppercase tracking-wide text-[1.3cqw]">{data.signatureTitle}</p>
              </div>
            </div>
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
