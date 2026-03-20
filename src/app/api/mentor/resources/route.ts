import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — List mentor resources
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    let query = supabase
      .from('mentor_resources')
      .select(`*, mentor:mentor_id(full_name)`)
      .order('created_at', { ascending: false })

    if (profile?.role === 'mentor') {
      query = query.eq('mentor_id', user.id)
    } else if (profile?.role !== 'admin') {
      // Students and others only see public resources
      query = query.eq('is_public', true)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/mentor/resources error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create resource (mentor only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!['admin', 'mentor'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Only mentors can create resources' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, file_url, resource_type, is_public } = body

    if (!title || !resource_type) {
      return NextResponse.json({ error: 'Title and resource_type are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('mentor_resources')
      .insert({
        mentor_id: user.id,
        title,
        description,
        file_url,
        resource_type,
        is_public: is_public ?? false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/mentor/resources error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
