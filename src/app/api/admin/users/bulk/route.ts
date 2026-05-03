import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

const VALID_ROLES = ['admin', 'student', 'client', 'mentor', 'employee', 'intern']

function generatePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const nums = '23456789'
  const special = '@#$%&*!'
  const all = upper + lower + nums + special
  let pw = ''
  pw += upper[Math.floor(Math.random() * upper.length)]
  pw += lower[Math.floor(Math.random() * lower.length)]
  pw += nums[Math.floor(Math.random() * nums.length)]
  pw += special[Math.floor(Math.random() * special.length)]
  for (let i = 4; i < 14; i++) pw += all[Math.floor(Math.random() * all.length)]
  return pw.split('').sort(() => Math.random() - 0.5).join('')
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY not set' }, { status: 500 })
    }

    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { emails, role, tags } = await req.json()

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'emails array is required' }, { status: 400 })
    }
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const created: { email: string; password: string }[] = []
    const failed: { email: string; error: string }[] = []

    for (const raw of emails) {
      const email = String(raw).toLowerCase().trim()
      if (!email || !email.includes('@')) {
        failed.push({ email: raw, error: 'Invalid email' })
        continue
      }

      const password = generatePassword()
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: '', role },
      })

      if (authError || !authData.user) {
        failed.push({ email, error: authError?.message || 'Unknown error' })
        continue
      }

      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          full_name: null,
          role,
          tags: tags || [],
        }, { onConflict: 'id' })

      if (profileError) {
        failed.push({ email, error: profileError.message })
        continue
      }

      created.push({ email, password })
    }

    return NextResponse.json({ created, failed })
  } catch (err) {
    console.error('POST /api/admin/users/bulk error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
