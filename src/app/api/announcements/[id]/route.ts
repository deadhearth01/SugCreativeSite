import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ALL_ROLES = ['admin', 'student', 'client', 'mentor', 'employee', 'intern']

// PATCH — Update announcement (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await req.json()
    // Expand 'all' in target_roles to avoid invalid enum value
    if (body.target_roles) {
      if (body.target_roles.includes('all') || body.target_roles.length === 0) {
        body.target_roles = ALL_ROLES
      } else {
        body.target_roles = body.target_roles.filter((r: string) => ALL_ROLES.includes(r))
        if (body.target_roles.length === 0) body.target_roles = ALL_ROLES
      }
    }

    const { data, error } = await supabase
      .from('announcements')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('PATCH /api/announcements/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — Delete announcement (admin only)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/announcements/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
