import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/lib/google-meet'

/**
 * GET /api/auth/google - Redirect to Google OAuth for Meet authorization
 * Accepts ?origin= query param from client for accurate redirect URI
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Determine the correct origin:
    // 1. Prefer explicit origin from client (window.location.origin)
    // 2. Fall back to x-forwarded headers (for reverse proxies)
    // 3. Fall back to req.nextUrl.origin
    const clientOrigin = req.nextUrl.searchParams.get('origin')
    const forwardedProto = req.headers.get('x-forwarded-proto') || 'https'
    const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host')
    const origin = clientOrigin
      || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null)
      || req.nextUrl.origin

    const redirectUri = `${origin}/api/auth/google/callback`

    // State includes user ID and origin for verification in callback
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      origin,
    })).toString('base64')

    const authUrl = getGoogleAuthUrl(redirectUri, state)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Failed to initiate Google auth' }, { status: 500 })
  }
}
