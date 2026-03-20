import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — List tickets
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    let query = supabase
      .from('tickets')
      .select(`
        *,
        created_by_profile:created_by(full_name, email, role),
        assigned_to_profile:assigned_to(full_name, email)
      `)
      .order('created_at', { ascending: false })

    // Non-admins and non-employees only see their own tickets
    if (!['admin', 'employee'].includes(profile?.role || '')) {
      query = query.eq('created_by', user.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/tickets error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create ticket (any authenticated user)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { subject, description, priority } = body

    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        subject,
        description,
        priority: priority || 'medium',
        status: 'open',
        created_by: user.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/tickets error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
