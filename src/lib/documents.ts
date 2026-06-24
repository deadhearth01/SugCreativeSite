// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Documents — shared types, ID generation, and default content.       ║
// ║                                                                       ║
// ║  Used by the admin generator UI and the document API. The public      ║
// ║  document_id mirrors the style of the printed templates, e.g.         ║
// ║  SUGYCGC2025CE02RD05 (certificate) / SUGNFSIN05HR12RH24 (offer).      ║
// ╚══════════════════════════════════════════════════════════════════════╝

export type DocumentType = 'certificate' | 'offer_letter'

export type CertificateSubType =
  | 'appreciation'
  | 'completion'
  | 'internship'
  | 'excellence'

export interface DocumentDefault {
  /** Heading shown on the document, e.g. "Certificate of Completion". */
  title: string
  /** Default editable body copy. May contain {{name}} placeholder. */
  body: string
  /** Optional short quote/tagline (certificates). */
  quote?: string
}

// ─── Certificate defaults ───────────────────────────────────────────────────
export const CERTIFICATE_DEFAULTS: Record<CertificateSubType, DocumentDefault> = {
  appreciation: {
    title: 'Certificate of Appreciation',
    body:
      'This certificate is awarded in recognition of {{name}} for outstanding contribution, dedication, and commitment demonstrated during their association with SUG Creative.',
    quote: '“Gratitude turns effort into excellence.”',
  },
  completion: {
    title: 'Certificate of Completion',
    body:
      'This is to certify that {{name}} has successfully completed the program at SUG Creative, fulfilling all requirements with diligence and skill.',
    quote: '“Every finish line is the start of a new journey.”',
  },
  internship: {
    title: 'Certificate of Internship',
    body:
      'This is to certify that {{name}} has successfully completed an internship at SUG Creative, contributing to live projects and gaining hands-on, industry-relevant experience.',
    quote: '“Experience is the bridge from learning to leadership.”',
  },
  excellence: {
    title: 'Certificate of Excellence',
    body:
      'This certificate is awarded in recognition of {{name}} for demonstrating exceptional performance and impact.',
    quote: '“True excellence is achieved when extraordinary effort delivers exceptional impact.”',
  },
}

// ─── Offer letter default ───────────────────────────────────────────────────
export const OFFER_LETTER_DEFAULT: DocumentDefault = {
  title: 'Letter of Offer',
  body:
    'Dear {{name}},\n\n' +
    'We are delighted to offer you the position of {{role}} at SUG Creative, commencing on {{joining_date}}. ' +
    'During your tenure you will work on live projects, gain hands-on experience with relevant technologies, and contribute to the organization\'s goals and initiatives.\n\n' +
    'Tenure:\n' +
    'Your engagement will begin on {{joining_date}}. Based on business requirements and performance, the tenure may be extended at the discretion of the company.\n\n' +
    'Work Schedule and Leave Policy:\n' +
    'You will be eligible for leaves and holidays in accordance with SUG Creative\'s company policies. Any planned leave must be communicated in advance and approved by your reporting manager.\n\n' +
    'We look forward to your valuable contributions and a successful journey with us.',
}

/** Default content for any (type, subType) combination. */
export function getDocumentDefault(type: DocumentType, subType?: string): DocumentDefault {
  if (type === 'offer_letter') return OFFER_LETTER_DEFAULT
  const key = (subType as CertificateSubType) || 'completion'
  return CERTIFICATE_DEFAULTS[key] || CERTIFICATE_DEFAULTS.completion
}

// ─── Document ID generation ─────────────────────────────────────────────────
// Style mirrors the printed templates: an all-caps token string prefixed SUG.
const SUBTYPE_CODE: Record<string, string> = {
  appreciation: 'CA',
  completion: 'CC',
  internship: 'CI',
  excellence: 'CE',
  offer: 'OL',
}

// Crypto-strong random tail. Document ids gate the public verification
// endpoint, so they must be unguessable — use a CSPRNG (Web Crypto, available
// in both Node 18+ and the browser), not Math.random(). 12 chars over a
// 33-symbol alphabet ≈ 60 bits of entropy; combined with the SUG/type/year
// prefix this makes ids effectively non-enumerable.
function randSegment(len: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789' // no I/O for legibility
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  let s = ''
  for (let i = 0; i < len; i++) s += chars[bytes[i] % chars.length]
  return s
}

/**
 * Build a public document id, e.g.:
 *   certificate(excellence) → SUGCE2026 + 12 random → "SUGCE2026K7Q2RD4M8XPA"
 *   offer_letter            → SUGOL2026 + 12 random → "SUGOL2026H4R12XQ7N3KP"
 * The CSPRNG tail keeps ids unguessable for verification.
 */
export function generateDocumentId(type: DocumentType, subType?: string): string {
  const year = new Date().getFullYear()
  const code =
    type === 'offer_letter' ? SUBTYPE_CODE.offer : SUBTYPE_CODE[subType || 'completion'] || 'CC'
  return `SUG${code}${year}${randSegment(12)}`
}

/** Apply {{name}}, {{role}}, {{joining_date}} etc. to a body string. */
export function fillTemplate(body: string, vars: Record<string, string | undefined>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
}

export const CERTIFICATE_SUBTYPES: { value: CertificateSubType; label: string }[] = [
  { value: 'appreciation', label: 'Certificate of Appreciation' },
  { value: 'completion', label: 'Certificate of Completion' },
  { value: 'internship', label: 'Certificate of Internship' },
  { value: 'excellence', label: 'Certificate of Excellence' },
]
