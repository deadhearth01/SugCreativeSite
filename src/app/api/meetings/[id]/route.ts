import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH — Update meeting (organizer or admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    // Check if user is organizer or admin
    const { data: meeting } = await supabase.from('meetings').select('organizer_id').eq('id', id).single()
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

    if (profile?.role !== 'admin' && meeting.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Only the organizer or admin can update this meeting' }, { status: 403 })
    }

    const body = await req.json()
    const { data, error } = await supabase
      .from('meetings')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('PATCH /api/meetings/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — Cancel/delete meeting (organizer or admin)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const { data: meeting } = await supabase.from('meetings').select('organizer_id').eq('id', id).single()

    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    if (profile?.role !== 'admin' && meeting.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Only the organizer or admin can cancel this meeting' }, { status: 403 })
    }

    // Soft delete — mark as cancelled
    const { error } = await supabase.from('meetings').update({ status: 'cancelled' }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/meetings/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
