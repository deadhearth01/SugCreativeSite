import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/client'
import { enquiryAckEmail, enquiryAdminEmail } from '@/lib/email/templates'

// GET — List all site queries (admin only)
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { data, error } = await supabase
      .from('site_queries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/site-queries error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Submit a new site query (public, no auth needed)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message, service, source } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('site_queries')
      .insert({
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        service: service || null,
        source: source || 'contact_page',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Fire-and-forget notifications: acknowledge the submitter + alert admin.
    // Never block or fail the request on email errors (helpers are no-op safe).
    try {
      const ack = enquiryAckEmail({ name, subject })
      await sendEmail({ to: email, subject: ack.subject, html: ack.html, text: ack.text })

      const adminEmail = process.env.ADMIN_NOTIFY_EMAIL
      if (adminEmail) {
        const note = enquiryAdminEmail({ name, email, phone, subject, message })
        await sendEmail({ to: adminEmail, subject: note.subject, html: note.html, text: note.text, replyTo: email })
      }
    } catch (mailErr) {
      console.error('POST /api/site-queries email error (non-fatal):', mailErr)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/site-queries error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
