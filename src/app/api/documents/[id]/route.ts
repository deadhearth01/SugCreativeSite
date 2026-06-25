import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// Admin CRUD for a single document, keyed by the row UUID (`id`).
// Listing/creation/resend live in ../route.ts; public verify in ../verify.

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

const EDITABLE = [
  'title', 'sub_type', 'recipient_profile_id', 'recipient_name', 'recipient_email',
  'recipient_phone', 'body', 'fields', 'signature_data', 'signature_name',
  'signature_title', 'issued_on', 'status',
] as const

// PATCH — edit an existing document (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const updates: Record<string, unknown> = {}
    for (const k of EDITABLE) if (body[k] !== undefined) updates[k] = body[k]
    updates.updated_at = new Date().toISOString()

    const client = createAdminClient()
    const { data, error } = await client
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('PATCH /api/documents/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — remove a document (admin only)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const client = createAdminClient()
    const { error } = await client.from('documents').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/documents/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
