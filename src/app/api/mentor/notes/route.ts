import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getCurrentUserWithRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role) return null
  return { user, role: profile.role }
}

export async function GET() {
  try {
    const current = await getCurrentUserWithRole()
    if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const baseSelect = `
      id,
      mentor_id,
      mentee_id,
      title,
      message,
      created_at,
      read_at,
      mentor:mentor_id(id, full_name, email, avatar_url),
      mentee:mentee_id(id, full_name, username, email, avatar_url, role)
    `

    const query = adminClient
      .from('mentor_notes')
      .select(baseSelect)
      .order('created_at', { ascending: false })

    const { data, error } = current.role === 'mentor'
      ? await query.eq('mentor_id', current.user.id)
      : await query.eq('mentee_id', current.user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('GET /api/mentor/notes error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const current = await getCurrentUserWithRole()
    if (!current || current.role !== 'mentor') {
      return NextResponse.json({ error: 'Only mentors can send mentor notes' }, { status: 403 })
    }

    const { mentee_id, title, message } = await req.json()
    const cleanMessage = typeof message === 'string' ? message.trim() : ''
    const cleanTitle = typeof title === 'string' ? title.trim() : ''

    if (!mentee_id || !cleanMessage) {
      return NextResponse.json({ error: 'Mentee and message are required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: assignment, error: assignmentError } = await adminClient
      .from('mentor_assignments')
      .select('id')
      .eq('mentor_id', current.user.id)
      .eq('mentee_id', mentee_id)
      .maybeSingle()

    if (assignmentError) return NextResponse.json({ error: assignmentError.message }, { status: 500 })
    if (!assignment) {
      return NextResponse.json({ error: 'This mentee is not assigned to you' }, { status: 403 })
    }

    const { data, error } = await adminClient
      .from('mentor_notes')
      .insert({
        mentor_id: current.user.id,
        mentee_id,
        title: cleanTitle || null,
        message: cleanMessage,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/mentor/notes error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
