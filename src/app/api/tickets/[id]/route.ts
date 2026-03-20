import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Single ticket with replies
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        created_by_profile:created_by(full_name, email, role),
        assigned_to_profile:assigned_to(full_name, email),
        ticket_replies(*, author:author_id(full_name, role))
      `)
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/tickets/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH — Update ticket status/assignment (admin or employee)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const body = await req.json()

    // Only admin/employee can change status; ticket creator can close their own
    if (!['admin', 'employee'].includes(profile?.role || '')) {
      const { data: ticket } = await supabase.from('tickets').select('created_by').eq('id', id).single()
      if (ticket?.created_by !== user.id) {
        return NextResponse.json({ error: 'Unauthorized to update this ticket' }, { status: 403 })
      }
    }

    const { data, error } = await supabase
      .from('tickets')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('PATCH /api/tickets/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
