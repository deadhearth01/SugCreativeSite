import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// Company-wide payroll defaults (PF %, tax %, professional tax, etc.) — admin only.
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

export async function GET() {
  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const client = createAdminClient()
  const { data, error } = await client.from('payroll_settings').select('*').eq('id', true).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

const FIELDS = ['company_name', 'pf_percent', 'tax_percent', 'professional_tax', 'pf_account_no', 'tax_account_no', 'extra'] as const

export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of FIELDS) if (body[k] !== undefined) updates[k] = body[k]

  const client = createAdminClient()
  const { data, error } = await client
    .from('payroll_settings')
    .update(updates)
    .eq('id', true)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
