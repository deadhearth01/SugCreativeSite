import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — List tasks
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_profile:assigned_to(full_name, email, role),
        assigned_by_profile:assigned_by(full_name)
      `)
      .order('created_at', { ascending: false })

    // Non-admins only see tasks assigned to them
    if (profile?.role !== 'admin') {
      query = query.eq('assigned_to', user.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/tasks error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create task (admin only assigns tasks)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await req.json()
    const { title, description, priority, assigned_to, due_date } = body

    if (!title || !assigned_to) {
      return NextResponse.json({ error: 'Title and assigned_to are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        priority: priority || 'medium',
        status: 'pending',
        assigned_to,
        assigned_by: user.id,
        due_date,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/tasks error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
