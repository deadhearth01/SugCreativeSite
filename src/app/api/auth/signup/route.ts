import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// POST — Public signup request.
//
// New flow: create the auth user WITHOUT sending a Supabase verification email
// (email_confirm: true pre-confirms the address), then mark the profile
// `status = 'pending'`. The account appears in the admin "Signup Requests"
// queue and cannot log in until an admin approves it (see the login page's
// pending check and the approve route).
export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is not set.' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { email, password, full_name } = body

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Pre-confirm the email so Supabase does NOT send a verification link.
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'student' },
    })

    if (authError) {
      // Surface a friendly message for the common duplicate case.
      const msg = /already|exists|registered/i.test(authError.message)
        ? 'An account with this email already exists.'
        : authError.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const userId = authData.user?.id
    if (userId) {
      // Mark pending (the handle_new_user trigger creates the row as active).
      const { error: profileError } = await admin
        .from('profiles')
        .update({ status: 'pending', full_name })
        .eq('id', userId)
      if (profileError) {
        console.error('signup: failed to set pending status:', profileError.message)
      }
    }

    return NextResponse.json(
      {
        message:
          'Your signup request has been submitted. An admin will review it, and you will receive an email once approved.',
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/auth/signup error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
