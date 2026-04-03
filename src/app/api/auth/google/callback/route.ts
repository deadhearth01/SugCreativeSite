import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/google-meet'

/**
 * GET /api/auth/google/callback - Handle Google OAuth callback
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard?error=google_auth_failed', req.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?error=no_code', req.url))
    }

    // Verify state
    let userId: string | null = null
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
        userId = decoded.userId
      } catch {
        console.error('Invalid state parameter')
      }
    }

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=not_authenticated', req.url))
    }

    // Verify state matches current user
    if (userId && userId !== user.id) {
      return NextResponse.redirect(new URL('/dashboard?error=state_mismatch', req.url))
    }

    // Exchange code for tokens
    const origin = req.nextUrl.origin
    const redirectUri = `${origin}/api/auth/google/callback`

    const tokens = await exchangeCodeForTokens(code, redirectUri)

    // Store tokens in database
    const { error: dbError } = await supabase.rpc('store_google_tokens', {
      p_user_id: user.id,
      p_access_token: tokens.access_token,
      p_refresh_token: tokens.refresh_token || null,
      p_expires_in: tokens.expires_in,
    })

    if (dbError) {
      console.error('Failed to store Google tokens:', dbError)
      // Fallback: store directly
      await supabase.from('profiles').update({
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token || null,
        google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      }).eq('id', user.id)
    }

    // Get profile role to redirect to correct dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const dashboardUrl = profile?.role 
      ? `/dashboard/${profile.role}/meetings?google_connected=true`
      : '/dashboard?google_connected=true'

    return NextResponse.redirect(new URL(dashboardUrl, req.url))
  } catch (error) {
    console.error('Google callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=callback_failed', req.url))
  }
}
