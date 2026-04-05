import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Get all replies for a ticket
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('ticket_replies')
      .select(`*, author:user_id(full_name, role, avatar_url)`)
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/tickets/[id]/replies error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Add reply to ticket
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ticketId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, is_internal } = await req.json()
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    const { data, error } = await supabase
      .from('ticket_replies')
      .insert({
        ticket_id: ticketId,
        user_id: user.id,
        message,
      })
      .select(`*, author:user_id(full_name, role)`)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update ticket status to in_progress if it was open and responder is admin/employee
    if (['admin', 'employee'].includes(profile?.role || '')) {
      await supabase
        .from('tickets')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', ticketId)
        .eq('status', 'open')
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/tickets/[id]/replies error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
