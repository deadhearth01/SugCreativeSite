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

    // Validate role is a valid enum value
    const validRoles = ['admin', 'student', 'client', 'mentor', 'employee', 'intern']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Step 1: Check if email exists in auth.users (use filter for reliability)
    const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000, // Increase limit to catch more users
    })

    if (listError) {
      console.error('Error listing users:', listError)
    }

    const existingAuthUser = listData?.users?.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    )

    if (existingAuthUser) {
      // Check if there's a valid profile for this auth user
      const { data: matchingProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', existingAuthUser.id)
        .single()

      if (matchingProfile) {
        // Fully valid user exists
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 })
      }

      // Orphaned auth user (no profile) — delete it
      console.log('Deleting orphaned auth user:', existingAuthUser.id)
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(existingAuthUser.id)
      if (deleteAuthError) {
        console.error('Failed to delete orphaned auth user:', deleteAuthError)
        return NextResponse.json({ error: 'Failed to clean up existing user data. Please try again.' }, { status: 500 })
      }
      // Wait a moment for deletion to propagate
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Step 2: Force delete any orphaned profile with this email (case-insensitive)
    // This handles edge cases where profile exists without auth user
    const { data: orphanedProfiles } = await adminClient
      .from('profiles')
      .select('id')
      .ilike('email', email)

    if (orphanedProfiles && orphanedProfiles.length > 0) {
      console.log('Found orphaned profiles to delete:', orphanedProfiles)
      for (const p of orphanedProfiles) {
        await adminClient.from('profiles').delete().eq('id', p.id)
      }
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Step 3: Create auth user
    // Ensure metadata values are valid and sanitized
    const sanitizedEmail = email.toLowerCase().trim()
    const sanitizedMetadata = {
      full_name: (full_name || '').trim() || 'User',
      role: validRoles.includes(role) ? role : 'student'
    }

    console.log('Creating user:', sanitizedEmail, 'with metadata:', sanitizedMetadata)

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: sanitizedEmail,
      password,
      email_confirm: true,
      user_metadata: sanitizedMetadata,
    })

    if (authError) {
      console.error('Supabase createUser error:', JSON.stringify(authError, null, 2))

      if (authError.message?.includes('Database error')) {
        return NextResponse.json({
          error: 'Database trigger error. Please run the SQL fix in Supabase Dashboard > SQL Editor.',
          details: authError.message,
          sqlFile: 'fix-trigger-email-conflict.sql',
          quickFix: `Go to your Supabase Dashboard > SQL Editor and run the contents of fix-trigger-email-conflict.sql`
        }, { status: 400 })
      }
      if (authError.message?.includes('already been registered')) {
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
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
