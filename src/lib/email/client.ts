// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Email client — thin wrapper around Resend.                          ║
// ║                                                                       ║
// ║  Server-side only. Resilient by design: if RESEND_API_KEY is not     ║
// ║  configured the helpers log a warning and return { skipped: true }    ║
// ║  instead of throwing, so callers (announcements, enrollment, etc.)    ║
// ║  never break a request just because email isn't set up yet.           ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM || 'SUG Creative <onboarding@resend.dev>'

// Lazily construct so a missing key doesn't crash module load.
const resend = apiKey ? new Resend(apiKey) : null

export type SendResult =
  | { ok: true; id: string | null }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; error: string }

export interface SendEmailInput {
  to: string | string[]
  subject: string
  html: string
  /** Optional plain-text fallback. */
  text?: string
  replyTo?: string
}

/** Send a single email. Never throws — returns a typed result. */
export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', input.to)
    return { ok: false, skipped: true, reason: 'RESEND_API_KEY not configured' }
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    })
    if (error) {
      console.error('[email] send error:', error)
      return { ok: false, skipped: false, error: error.message }
    }
    return { ok: true, id: data?.id ?? null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown email error'
    console.error('[email] send threw:', msg)
    return { ok: false, skipped: false, error: msg }
  }
}

export interface BatchEmail {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

/**
 * Send many emails in one call (Resend batch API, max 100 per call).
 * Chunks automatically. Returns per-chunk results; never throws.
 */
export async function sendBatchEmails(emails: BatchEmail[]): Promise<SendResult[]> {
  if (emails.length === 0) return []
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping batch of ${emails.length}`)
    return [{ ok: false, skipped: true, reason: 'RESEND_API_KEY not configured' }]
  }

  const results: SendResult[] = []
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100)
    try {
      const { data, error } = await resend.batch.send(
        chunk.map((e) => ({
          from: FROM,
          to: Array.isArray(e.to) ? e.to : [e.to],
          subject: e.subject,
          html: e.html,
          ...(e.text ? { text: e.text } : {}),
        }))
      )
      if (error) {
        console.error('[email] batch error:', error)
        results.push({ ok: false, skipped: false, error: error.message })
      } else {
        results.push({ ok: true, id: data?.data?.[0]?.id ?? null })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown batch email error'
      console.error('[email] batch threw:', msg)
      results.push({ ok: false, skipped: false, error: msg })
    }
  }
  return results
}

/** True when email sending is configured (used by callers to short-circuit). */
export function isEmailConfigured(): boolean {
  return resend !== null
}
