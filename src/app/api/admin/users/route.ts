import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return user
}

// POST — Create a new user
export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local' }, { status: 500 })
    }

    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { email, password, full_name, role, phone, tags } = body

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Create auth user — trigger auto-creates profile
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    })

    if (authError) {
      console.error('Supabase createUser error:', authError)
      // If trigger failed, the auth user wasn't created. Return clear error.
      const msg = authError.message.includes('Database error')
        ? 'Failed to create user. A profile with this email may already exist — check for duplicates.'
        : authError.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    // Update profile with extra fields the trigger doesn't set
    if (authData.user) {
      // Upsert profile in case trigger didn't fire or partially failed
      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          full_name,
          role,
          phone: phone || null,
          tags: tags || [],
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('Profile upsert error:', profileError)
      }
    }

    return NextResponse.json({ user: authData.user })
  } catch (err) {
    console.error('POST /api/admin/users error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
