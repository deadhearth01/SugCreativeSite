import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    const { title, description, meeting_type, meeting_link, scheduled_at, duration, duration_minutes, participant_ids, notes } = body

    if (!title || !scheduled_at) {
      return NextResponse.json({ error: 'Title and scheduled time are required' }, { status: 400 })
    }

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title,
        description,
        meeting_type: meeting_type || 'general',
        organizer_id: user.id,
        meeting_link,
        scheduled_at,
        duration_minutes: duration_minutes || duration || 60,
        status: 'scheduled',
        notes,
      })
      .select()
      .single()

    if (meetingError) return NextResponse.json({ error: meetingError.message }, { status: 500 })

    // Add participants
    if (participant_ids && participant_ids.length > 0) {
      const participants = participant_ids.map((uid: string) => ({
        meeting_id: meeting.id,
        user_id: uid,
        status: 'invited',
      }))
      // Also add organizer
      participants.push({ meeting_id: meeting.id, user_id: user.id, status: 'accepted' })

      await supabase.from('meeting_participants').insert(participants)
    }

    return NextResponse.json({ data: meeting }, { status: 201 })
  } catch (err) {
    console.error('POST /api/meetings error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
