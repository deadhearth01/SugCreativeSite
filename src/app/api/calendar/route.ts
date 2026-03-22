import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ALL_ROLES = ['admin', 'student', 'client', 'mentor', 'employee', 'intern']

// GET — List calendar events (filtered by user's role)
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const userRole = profile?.role || 'student'

    // Get events where target_roles contains the user's role
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`*, created_by_profile:created_by(full_name)`)
      .contains('target_roles', [userRole])
      .order('start_time', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/calendar error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create calendar event (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await req.json()
    const { title, description, event_type, start_time, end_time, all_day, location, color, target_roles } = body

    if (!title || !start_time) {
      return NextResponse.json({ error: 'Title and start time are required' }, { status: 400 })
    }

    // If target_roles is empty, not provided, or contains 'all', broadcast to all roles
    let resolvedRoles: string[]
    if (!target_roles || target_roles.length === 0 || target_roles.includes('all')) {
      resolvedRoles = ALL_ROLES
    } else {
      resolvedRoles = target_roles.filter((r: string) => ALL_ROLES.includes(r))
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title,
        description,
        event_type: event_type || 'general',
        start_time,
        end_time,
        all_day: all_day || false,
        location,
        color: color || '#0A2472',
        target_roles: resolvedRoles,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/calendar error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
