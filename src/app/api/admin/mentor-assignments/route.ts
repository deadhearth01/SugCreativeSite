import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

// GET — list all assignments with mentor + mentee profile data
export async function GET() {
  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mentor_assignments')
    .select(`
      id, mentor_id, mentee_id, assigned_at, notes,
      mentor:mentor_id(id, full_name, email, avatar_url, role),
      mentee:mentee_id(id, full_name, username, email, avatar_url, role)
    `)
    .order('assigned_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST — assign a mentee to a mentor
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mentor_id, mentee_id, notes } = await req.json()
  if (!mentor_id || !mentee_id) {
    return NextResponse.json({ error: 'mentor_id and mentee_id are required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Validate roles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, role')
    .in('id', [mentor_id, mentee_id])

  const mentor = profiles?.find(p => p.id === mentor_id)
  const mentee = profiles?.find(p => p.id === mentee_id)

  if (!mentor || mentor.role !== 'mentor') {
    return NextResponse.json({ error: 'Mentor must have role=mentor' }, { status: 400 })
  }
  if (!mentee || !['intern', 'student'].includes(mentee.role)) {
    return NextResponse.json({ error: 'Mentee must be an intern or student' }, { status: 400 })
  }

  // Upsert: unique constraint on mentee_id ensures one active mentor per mentee
  const { data, error } = await supabase
    .from('mentor_assignments')
    .upsert(
      { mentor_id, mentee_id, assigned_by: admin.id, notes: notes || null },
      { onConflict: 'mentee_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

// DELETE — unassign by ?id=<assignment_id>  OR  ?mentee_id=<mentee_id>
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const menteeId = searchParams.get('mentee_id')

  if (!id && !menteeId) {
    return NextResponse.json({ error: 'id or mentee_id is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const query = supabase.from('mentor_assignments').delete()
  const { error } = id ? await query.eq('id', id) : await query.eq('mentee_id', menteeId!)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
