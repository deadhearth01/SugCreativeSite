import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/lib/google-meet'

/**
 * GET /api/auth/google - Redirect to Google OAuth for Meet authorization
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build redirect URI
    const origin = req.nextUrl.origin
    const redirectUri = `${origin}/api/auth/google/callback`

    // State includes user ID for verification in callback
    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64')

    const authUrl = getGoogleAuthUrl(redirectUri, state)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Failed to initiate Google auth' }, { status: 500 })
  }
}
