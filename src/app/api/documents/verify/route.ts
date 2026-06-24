import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// GET — Public document verification by document_id.
//
// Unauthenticated. Returns a SAFE subset (no signature image, no internal ids)
// so anyone can confirm a certificate / offer letter is genuine and view it.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = (searchParams.get('id') || '').trim()
    if (!id) return NextResponse.json({ error: 'Missing document id', valid: false }, { status: 400 })

    const client = createAdminClient()
    const { data, error } = await client
      .from('documents')
      .select('document_id, type, sub_type, title, recipient_name, body, fields, signature_name, signature_title, issued_on, status')
      .eq('document_id', id)
      .maybeSingle()

    if (error) {
      console.error('verify error:', error.message)
      return NextResponse.json({ error: 'Verification failed', valid: false }, { status: 500 })
    }
    if (!data || data.status === 'revoked') {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({ valid: true, data })
  } catch (err) {
    console.error('GET /api/documents/verify error:', err)
    return NextResponse.json({ error: 'Internal server error', valid: false }, { status: 500 })
  }
}
