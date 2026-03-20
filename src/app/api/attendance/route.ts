import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — List attendance records
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('user_id')

    let query = supabase
      .from('attendance')
      .select(`*, user:user_id(full_name, role)`)
      .order('date', { ascending: false })

    if (profile?.role === 'admin') {
      if (targetUserId) query = query.eq('user_id', targetUserId)
    } else {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/attendance error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Check in (create attendance record for today)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const today = new Date().toISOString().split('T')[0]

    // Check if already checked in today
    const { data: existing } = await supabase
      .from('attendance')
      .select('id, check_out')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already checked in today' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: user.id,
        date: today,
        check_in: new Date().toISOString(),
        status: body.status || 'present',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/attendance error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
