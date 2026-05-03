import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createMeetSpace, refreshAccessToken } from '@/lib/google-meet'

// GET — List meetings for the current user
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    let data, error

    if (profile?.role === 'admin') {
      // Admin sees all meetings
      ;({ data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          organizer:organizer_id(full_name, email),
          meeting_participants(user_id, status, profiles(full_name))
        `)
        .order('scheduled_at', { ascending: true }))
    } else {
      // Others see meetings they're a participant in or organizer of
      ;({ data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          organizer:organizer_id(full_name, email),
          meeting_participants!inner(user_id, status)
        `)
        .or(`organizer_id.eq.${user.id},meeting_participants.user_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: true }))
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/meetings error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper: Get valid Google access token for user
async function getGoogleAccessToken(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('google_access_token, google_refresh_token, google_token_expires_at')
    .eq('id', userId)
    .single()

  if (!profile?.google_access_token) {
    return null
  }

  // Check if token is expired
  const expiresAt = profile.google_token_expires_at ? new Date(profile.google_token_expires_at) : null
  const isExpired = !expiresAt || expiresAt <= new Date()

  if (isExpired && profile.google_refresh_token) {
    try {
      const tokens = await refreshAccessToken(profile.google_refresh_token)
      
      // Update tokens in database
      await supabase.from('profiles').update({
        google_access_token: tokens.access_token,
        google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      }).eq('id', userId)

      return tokens.access_token
    } catch {
      console.error('Failed to refresh Google token')
      return null
    }
  }

  return profile.google_access_token
}

// POST — Create a meeting (admin or mentor)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!['admin', 'mentor'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Only admin and mentors can create meetings' }, { status: 403 })
    }

    const body = await req.json()
    const { 
      title, 
      description, 
      meeting_type, 
      meeting_link, 
      scheduled_at, 
      duration, 
      duration_minutes, 
      participant_ids, 
      notes,
      create_google_meet = false // Flag to create Google Meet
    } = body

    if (!title || !scheduled_at) {
      return NextResponse.json({ error: 'Title and scheduled time are required' }, { status: 400 })
    }

    const requestedParticipants = Array.isArray(participant_ids)
      ? Array.from(new Set(participant_ids.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0)))
      : []

    if (profile?.role === 'mentor' && requestedParticipants.length > 0) {
      const { data: assignments, error: assignmentError } = await supabase
        .from('mentor_assignments')
        .select('mentee_id')
        .eq('mentor_id', user.id)

      if (assignmentError) return NextResponse.json({ error: assignmentError.message }, { status: 500 })

      const assignedIds = new Set((assignments || []).map(a => a.mentee_id))
      const hasUnassignedParticipant = requestedParticipants.some(id => !assignedIds.has(id))
      if (hasUnassignedParticipant) {
        return NextResponse.json({ error: 'Mentors can only invite assigned students and interns' }, { status: 403 })
      }
    }

    let finalMeetingLink = meeting_link
    let googleMeetSpaceName: string | null = null
    let googleMeetCode: string | null = null
    let isGoogleMeet = false

    // Create Google Meet if requested
    if (create_google_meet) {
      const accessToken = await getGoogleAccessToken(supabase, user.id)
      if (!accessToken) {
        return NextResponse.json({
          error: 'Connect your Google account before creating a Google Meet.',
          needsGoogleAuth: true,
        }, { status: 400 })
      }

      const meetResult = await createMeetSpace(accessToken)
      if (!meetResult.success || !meetResult.meetingLink) {
        return NextResponse.json({
          error: meetResult.error || 'Failed to create Google Meet space',
        }, { status: 502 })
      }

      finalMeetingLink = meetResult.meetingLink
      googleMeetSpaceName = meetResult.spaceName || null
      googleMeetCode = meetResult.meetingCode || null
      isGoogleMeet = true
    }

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title,
        description,
        meeting_type: meeting_type || 'general',
        organizer_id: user.id,
        meeting_link: finalMeetingLink,
        scheduled_at,
        duration_minutes: duration_minutes || duration || 60,
        status: 'scheduled',
        notes,
        is_google_meet: isGoogleMeet,
        google_meet_space_name: googleMeetSpaceName,
        google_meet_code: googleMeetCode,
      })
      .select()
      .single()

    if (meetingError) return NextResponse.json({ error: meetingError.message }, { status: 500 })

    // Add participants
    const allParticipantIds = Array.from(new Set([...requestedParticipants, user.id]))
    if (allParticipantIds.length > 0) {
      const participants = allParticipantIds.map((uid: string) => ({
        meeting_id: meeting.id,
        user_id: uid,
        status: uid === user.id ? 'accepted' : 'invited',
      }))

      const { error: participantsError } = await supabase.from('meeting_participants').insert(participants)
      if (participantsError) {
        await supabase.from('meetings').delete().eq('id', meeting.id)
        return NextResponse.json({ error: participantsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      data: meeting,
      googleMeetCreated: isGoogleMeet 
    }, { status: 201 })
  } catch (err) {
    console.error('POST /api/meetings error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
