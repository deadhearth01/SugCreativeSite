/**
 * Google Meet API Integration
 * Provides methods to create and manage Google Meet spaces
 */

const GOOGLE_MEET_API_URL = 'https://meet.googleapis.com/v2'
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'

interface GoogleTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

interface MeetSpace {
  name: string
  meetingUri: string
  meetingCode: string
  config?: {
    accessType?: 'TRUSTED' | 'OPEN' | 'RESTRICTED'
    entryPointAccess?: 'ALL' | 'CREATOR_APP_ONLY'
  }
}

interface CreateMeetingResult {
  success: boolean
  meetingLink?: string
  meetingCode?: string
  spaceName?: string
  error?: string
}

// Store tokens in memory (in production, use secure storage per user)
let cachedTokens: GoogleTokens | null = null
let tokenExpiresAt: number = 0

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  const tokens = await response.json()
  cachedTokens = tokens
  tokenExpiresAt = Date.now() + tokens.expires_in * 1000

  return tokens
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const tokens = await response.json()
  cachedTokens = { ...tokens, refresh_token: refreshToken }
  tokenExpiresAt = Date.now() + tokens.expires_in * 1000

  return cachedTokens
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(refreshToken?: string): Promise<string | null> {
  if (cachedTokens && Date.now() < tokenExpiresAt - 60000) {
    return cachedTokens.access_token
  }

  if (refreshToken || cachedTokens?.refresh_token) {
    const tokens = await refreshAccessToken(refreshToken || cachedTokens!.refresh_token!)
    return tokens.access_token
  }

  return null
}

/**
 * Create a Google Meet space
 */
export async function createMeetSpace(accessToken: string): Promise<CreateMeetingResult> {
  try {
    const response = await fetch(`${GOOGLE_MEET_API_URL}/spaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          accessType: 'TRUSTED',
          entryPointAccess: 'ALL',
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Google Meet API error:', error)
      return {
        success: false,
        error: `Failed to create Meet space: ${response.status}`,
      }
    }

    const space: MeetSpace = await response.json()
    
    return {
      success: true,
      meetingLink: space.meetingUri,
      meetingCode: space.meetingCode,
      spaceName: space.name,
    }
  } catch (error) {
    console.error('Error creating Meet space:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get Meet space details
 */
export async function getMeetSpace(accessToken: string, spaceName: string): Promise<MeetSpace | null> {
  try {
    const response = await fetch(`${GOOGLE_MEET_API_URL}/${spaceName}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to get Meet space:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting Meet space:', error)
    return null
  }
}

/**
 * Generate Google OAuth URL for Meet API authorization
 */
export function getGoogleAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/meetings.space.created',
      'https://www.googleapis.com/auth/meetings.space.readonly',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })

  if (state) {
    params.set('state', state)
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Generate a simple meet link without API (fallback)
 * This creates a link that will prompt users to create an instant meeting
 */
export function generateInstantMeetLink(): string {
  // Google Meet instant meeting link
  return 'https://meet.google.com/new'
}

/**
 * Validate a Google Meet link
 */
export function isValidMeetLink(link: string): boolean {
  const meetPattern = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/i
  return meetPattern.test(link)
}
