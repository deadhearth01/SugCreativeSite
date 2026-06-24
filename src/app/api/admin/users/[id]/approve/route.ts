import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/client'
import { signupApprovedEmail } from '@/lib/email/templates'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

// POST — Approve a pending signup request: set status active + email the user.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const adminClient = createAdminClient()

    const { data: updated, error } = await adminClient
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', id)
      .select('email, full_name')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Approval email (best-effort; never fails the approval).
    try {
      if (updated?.email) {
        const tpl = signupApprovedEmail({ name: updated.full_name ?? undefined, email: updated.email })
        await sendEmail({ to: updated.email, subject: tpl.subject, html: tpl.html, text: tpl.text })
      }
    } catch (mailErr) {
      console.error('approve: email error (non-fatal):', mailErr)
    }

    return NextResponse.json({ data: updated })
  } catch (err) {
    console.error('POST /api/admin/users/[id]/approve error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
