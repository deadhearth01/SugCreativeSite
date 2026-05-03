import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function verifyMentor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'mentor') return null
  return user
}

export async function GET() {
  try {
    const mentor = await verifyMentor()
    if (!mentor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('mentor_assignments')
      .select(`
        id,
        mentor_id,
        mentee_id,
        assigned_at,
        notes,
        mentee:mentee_id(id, full_name, username, email, avatar_url, role, status)
      `)
      .eq('mentor_id', mentor.id)
      .order('assigned_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('GET /api/mentor/mentees error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
