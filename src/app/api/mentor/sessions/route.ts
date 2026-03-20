import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — List mentor sessions
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    let query = supabase
      .from('mentor_sessions')
      .select(`
        *,
        mentor:mentor_id(full_name, email),
        student:student_id(full_name, email),
        meeting:meeting_id(title, scheduled_at, meeting_link)
      `)
      .order('created_at', { ascending: false })

    if (profile?.role === 'mentor') {
      query = query.eq('mentor_id', user.id)
    } else if (profile?.role === 'student') {
      query = query.eq('student_id', user.id)
    }
    // Admin sees all

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/mentor/sessions error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create mentor session (mentor or admin)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!['admin', 'mentor'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Only admin and mentors can create sessions' }, { status: 403 })
    }

    const body = await req.json()
    const { student_id, meeting_id, duration, amount } = body

    if (!student_id) {
      return NextResponse.json({ error: 'student_id is required' }, { status: 400 })
    }

    const mentorId = profile?.role === 'mentor' ? user.id : body.mentor_id

    const { data, error } = await supabase
      .from('mentor_sessions')
      .insert({
        mentor_id: mentorId,
        student_id,
        meeting_id: meeting_id || null,
        duration: duration || 60,
        amount: amount || 0,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/mentor/sessions error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
