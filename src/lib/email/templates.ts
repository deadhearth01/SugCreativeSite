// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Email templates — branded HTML for SUG Creative transactional mail. ║
// ║                                                                       ║
// ║  Plain template functions returning { subject, html }. Kept simple    ║
// ║  (inline styles, table-free) so they render across mail clients. The  ║
// ║  brand palette mirrors the site: teal #35C8E0 / dark #1A9AB5 /        ║
// ║  green #82C93D.                                                        ║
// ╚══════════════════════════════════════════════════════════════════════╝

const BRAND = {
  teal: '#35C8E0',
  dark: '#1A9AB5',
  green: '#82C93D',
  ink: '#0f172a',
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sugcreative.com'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

/** Shared chrome: header band + footer, content injected in the middle. */
function layout(opts: { heading: string; accent?: string; bodyHtml: string }): string {
  const accent = opts.accent || BRAND.green
  return `
  <div style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <div style="background:#ffffff;border:2px solid ${BRAND.ink};border-radius:18px;overflow:hidden;box-shadow:6px 6px 0 ${accent};">
        <div style="background:${BRAND.dark};padding:24px 28px;">
          <div style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:0.5px;">SUG Creative</div>
        </div>
        <div style="padding:28px;">
          <h1 style="margin:0 0 16px;color:${BRAND.ink};font-size:22px;font-weight:800;line-height:1.25;">${opts.heading}</h1>
          ${opts.bodyHtml}
        </div>
        <div style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.6;">
          You're receiving this because you have an account or enquiry with SUG Creative.<br/>
          <a href="${SITE_URL}" style="color:${BRAND.dark};text-decoration:none;font-weight:700;">${SITE_URL.replace(/^https?:\/\//, '')}</a>
        </div>
      </div>
    </div>
  </div>`
}

function button(label: string, href: string, color = BRAND.dark): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;font-weight:800;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:12px;border:2px solid ${BRAND.ink};">${label}</a>`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ─── Announcement ───────────────────────────────────────────────────────────
export function announcementEmail(opts: {
  title: string
  content: string
  recipientName?: string
}): RenderedEmail {
  const greeting = opts.recipientName ? `Hi ${esc(opts.recipientName)},` : 'Hello,'
  const bodyHtml = `
    <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">A new announcement has been posted:</p>
    <div style="background:#f8fafc;border-left:4px solid ${BRAND.green};border-radius:8px;padding:16px 18px;margin:0 0 20px;">
      <div style="font-weight:800;color:${BRAND.ink};font-size:16px;margin-bottom:6px;">${esc(opts.title)}</div>
      <div style="color:#475569;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(opts.content)}</div>
    </div>
    <p style="margin:0;">${button('Open Dashboard', `${SITE_URL}/dashboard`)}</p>`
  return {
    subject: `📢 ${opts.title}`,
    html: layout({ heading: 'New Announcement', bodyHtml }),
    text: `${greeting}\n\nNew announcement: ${opts.title}\n\n${opts.content}\n\nOpen your dashboard: ${SITE_URL}/dashboard`,
  }
}

// ─── Enrollment confirmation ────────────────────────────────────────────────
export function enrollmentEmail(opts: {
  studentName?: string
  courseTitle: string
}): RenderedEmail {
  const greeting = opts.studentName ? `Hi ${esc(opts.studentName)},` : 'Hello,'
  const bodyHtml = `
    <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
      🎉 You're enrolled in <strong style="color:${BRAND.ink};">${esc(opts.courseTitle)}</strong>. We're excited to have you on board!
    </p>
    <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
      Head to your dashboard to access your course materials, schedule, and updates.
    </p>
    <p style="margin:0;">${button('Go to My Courses', `${SITE_URL}/dashboard`, BRAND.green)}</p>`
  return {
    subject: `✅ Enrolled: ${opts.courseTitle}`,
    html: layout({ heading: 'Enrollment Confirmed', accent: BRAND.green, bodyHtml }),
    text: `${greeting}\n\nYou're enrolled in ${opts.courseTitle}. Visit ${SITE_URL}/dashboard to get started.`,
  }
}

// ─── Site enquiry acknowledgement (to the person who submitted) ──────────────
export function enquiryAckEmail(opts: {
  name: string
  subject?: string
}): RenderedEmail {
  const bodyHtml = `
    <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.6;">Hi ${esc(opts.name)},</p>
    <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
      Thanks for reaching out to SUG Creative${opts.subject ? ` about <strong>${esc(opts.subject)}</strong>` : ''}.
      We've received your message and a member of our team will get back to you shortly.
    </p>
    <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">In the meantime, feel free to explore our programs and services.</p>
    <p style="margin:0;">${button('Explore SUG Creative', SITE_URL)}</p>`
  return {
    subject: `We received your message — SUG Creative`,
    html: layout({ heading: 'Thanks for getting in touch!', bodyHtml }),
    text: `Hi ${opts.name},\n\nThanks for reaching out to SUG Creative. We've received your message and will get back to you shortly.`,
  }
}

// ─── Admin notification of a new site enquiry ───────────────────────────────
export function enquiryAdminEmail(opts: {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}): RenderedEmail {
  const row = (label: string, val?: string) =>
    val ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:13px;">${label}</td><td style="padding:4px 0;color:${BRAND.ink};font-size:13px;font-weight:600;">${esc(val)}</td></tr>` : ''
  const bodyHtml = `
    <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">A new enquiry was submitted on the website:</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
      ${row('Name', opts.name)}
      ${row('Email', opts.email)}
      ${row('Phone', opts.phone)}
      ${row('Subject', opts.subject)}
    </table>
    <div style="background:#f8fafc;border-left:4px solid ${BRAND.teal};border-radius:8px;padding:16px 18px;color:#475569;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(opts.message)}</div>`
  return {
    subject: `New enquiry from ${opts.name}`,
    html: layout({ heading: 'New Website Enquiry', accent: BRAND.teal, bodyHtml }),
    text: `New enquiry\nName: ${opts.name}\nEmail: ${opts.email}\nPhone: ${opts.phone || '-'}\nSubject: ${opts.subject || '-'}\n\n${opts.message}`,
  }
}

// ─── Signup approved ────────────────────────────────────────────────────────
export function signupApprovedEmail(opts: {
  name?: string
  email: string
}): RenderedEmail {
  const greeting = opts.name ? `Hi ${esc(opts.name)},` : 'Hello,'
  const bodyHtml = `
    <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
      🎉 Great news — your access request has been <strong style="color:${BRAND.ink};">approved</strong>.
      You can now sign in with your email and password.
    </p>
    <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
      Account email: <strong style="color:${BRAND.ink};">${esc(opts.email)}</strong>
    </p>
    <p style="margin:0;">${button('Log In', `${SITE_URL}/login`, BRAND.green)}</p>`
  return {
    subject: `✅ Your SUG Creative access is approved`,
    html: layout({ heading: 'You\'re approved!', accent: BRAND.green, bodyHtml }),
    text: `${greeting}\n\nYour access request has been approved. Sign in at ${SITE_URL}/login with your email (${opts.email}) and password.`,
  }
}

// ─── Document delivery (certificate / offer letter) ─────────────────────────
export function documentEmail(opts: {
  recipientName: string
  docType: 'certificate' | 'offer_letter'
  docTitle: string
  documentId: string
  downloadUrl?: string
  verifyUrl?: string
}): RenderedEmail {
  const isCert = opts.docType === 'certificate'
  const heading = isCert ? 'Congratulations! 🎉' : 'Your Offer Letter 🎉'
  const lead = isCert
    ? `Congratulations, ${esc(opts.recipientName)}! Please find your <strong>${esc(opts.docTitle)}</strong> below.`
    : `Welcome aboard, ${esc(opts.recipientName)}! We're delighted to share your <strong>${esc(opts.docTitle)}</strong>.`
  const actions = [
    opts.downloadUrl ? button('Download Document', opts.downloadUrl, BRAND.green) : '',
    opts.verifyUrl ? `&nbsp;&nbsp;${button('Verify', opts.verifyUrl, BRAND.dark)}` : '',
  ].join('')
  const bodyHtml = `
    <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">${lead}</p>
    <div style="background:#f8fafc;border:1px dashed ${BRAND.dark};border-radius:8px;padding:12px 16px;margin:0 0 20px;color:#475569;font-size:13px;">
      Document ID: <strong style="color:${BRAND.ink};font-family:monospace;">${esc(opts.documentId)}</strong>
    </div>
    ${actions ? `<p style="margin:0;">${actions}</p>` : ''}`
  return {
    subject: isCert ? `🏆 Your ${opts.docTitle}` : `📄 Your ${opts.docTitle} from SUG Creative`,
    html: layout({ heading, accent: BRAND.green, bodyHtml }),
    text: `${lead.replace(/<[^>]+>/g, '')}\n\nDocument ID: ${opts.documentId}${opts.downloadUrl ? `\nDownload: ${opts.downloadUrl}` : ''}${opts.verifyUrl ? `\nVerify: ${opts.verifyUrl}` : ''}`,
  }
}
