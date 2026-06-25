import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/client'
import { documentEmail } from '@/lib/email/templates'
import { generateDocumentId, type DocumentType } from '@/lib/documents'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

// GET — List documents (admin only)
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const client = createAdminClient()
  let query = client.from('documents').select('*').order('created_at', { ascending: false })
  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST — Create + (optionally) email a document (admin only)
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Resend path: email an already-issued document without creating a new row.
    if (body.resend && body.document_id) {
      const client = createAdminClient()
      const { data: doc, error: fetchErr } = await client
        .from('documents')
        .select('document_id, type, title, recipient_name, recipient_email')
        .eq('document_id', body.document_id)
        .single()
      if (fetchErr || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      if (!doc.recipient_email) {
        return NextResponse.json({ error: 'This document has no recipient email on file.' }, { status: 400 })
      }
      try {
        const tpl = documentEmail({
          recipientName: doc.recipient_name,
          docType: doc.type as 'certificate' | 'offer_letter',
          docTitle: doc.title,
          documentId: doc.document_id,
          verifyUrl: SITE_URL ? `${SITE_URL}/verify?id=${doc.document_id}` : undefined,
        })
        await sendEmail({ to: doc.recipient_email, subject: tpl.subject, html: tpl.html, text: tpl.text })
      } catch (mailErr) {
        console.error('documents resend: email error:', mailErr)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 502 })
      }
      return NextResponse.json({ data: { document_id: doc.document_id }, resent: true })
    }

    const {
      type,
      sub_type,
      title,
      recipient_profile_id,
      recipient_name,
      recipient_email,
      recipient_phone,
      body: docBody,
      fields,
      signature_data,
      signature_name,
      signature_title,
      issued_on,
      send_email,
    } = body as Record<string, unknown>

    if (!type || !title || !recipient_name) {
      return NextResponse.json({ error: 'type, title, and recipient_name are required' }, { status: 400 })
    }

    const documentId = generateDocumentId(type as DocumentType, sub_type as string | undefined)
    const client = createAdminClient()

    const { data, error } = await client
      .from('documents')
      .insert({
        document_id: documentId,
        type,
        sub_type: sub_type || null,
        title,
        recipient_profile_id: recipient_profile_id || null,
        recipient_name,
        recipient_email: recipient_email || null,
        recipient_phone: recipient_phone || null,
        body: docBody || null,
        fields: fields || {},
        signature_data: signature_data || null,
        signature_name: signature_name || null,
        signature_title: signature_title || null,
        issued_on: issued_on || new Date().toISOString().slice(0, 10),
        status: 'issued',
        created_by: admin.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Optional delivery email (best-effort).
    if (send_email && recipient_email) {
      try {
        const tpl = documentEmail({
          recipientName: recipient_name as string,
          docType: type as 'certificate' | 'offer_letter',
          docTitle: title as string,
          documentId,
          verifyUrl: SITE_URL ? `${SITE_URL}/verify?id=${documentId}` : undefined,
        })
        await sendEmail({
          to: recipient_email as string,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        })
      } catch (mailErr) {
        console.error('documents: email error (non-fatal):', mailErr)
      }
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/documents error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
