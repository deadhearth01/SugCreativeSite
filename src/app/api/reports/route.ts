import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — List reports
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    let query = supabase
      .from('reports')
      .select(`
        *,
        submitter:submitted_by(full_name, email, role),
        project:project_id(title)
      `)
      .order('created_at', { ascending: false })

    // Non-admins see their own reports only
    if (!['admin', 'mentor'].includes(profile?.role || '')) {
      query = query.eq('submitted_by', user.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/reports error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Submit report (intern, client)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, report_type, content, project_id } = body

    if (!title || !report_type || !content) {
      return NextResponse.json({ error: 'Title, report_type, and content are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        title,
        report_type,
        content,
        project_id: project_id || null,
        submitted_by: user.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/reports error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
