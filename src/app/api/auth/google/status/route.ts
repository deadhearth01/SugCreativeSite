import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/auth/google/status - Check if user has connected Google account
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('google_access_token, google_refresh_token, google_token_expires_at')
      .eq('id', user.id)
      .single()

    const hasToken = !!profile?.google_access_token
    const hasRefreshToken = !!profile?.google_refresh_token
    const expiresAt = profile?.google_token_expires_at 
      ? new Date(profile.google_token_expires_at) 
      : null
    const isExpired = !expiresAt || expiresAt <= new Date()

    return NextResponse.json({
      connected: hasToken,
      hasRefreshToken,
      isExpired: hasToken && isExpired,
      canCreateMeetings: hasToken && (!isExpired || hasRefreshToken),
    })
  } catch (error) {
    console.error('Google status check error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}

/**
 * DELETE /api/auth/google/status - Disconnect Google account
 */
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        google_access_token: null,
        google_refresh_token: null,
        google_token_expires_at: null,
      })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Google disconnect error:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
