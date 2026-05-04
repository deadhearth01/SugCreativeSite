import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — list updates for a project (visible to admin/employee + the client owner)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('project_updates')
      .select('id, title, body, progress_at_post, status_at_post, created_at, author:author_id(full_name, username, role)')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/projects/[id]/updates error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — create an update (admin/employee only). Optionally also bumps project progress/status.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!['admin', 'employee'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Admin or employee only' }, { status: 403 })
    }

    const body = await req.json()
    const { title, body: text, progress, status } = body
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Update body is required' }, { status: 400 })
    }

    // Sync the project itself if progress/status were provided
    const projectPatch: Record<string, unknown> = {}
    if (typeof progress === 'number') projectPatch.progress_percent = progress
    if (typeof status === 'string') projectPatch.status = status
    if (Object.keys(projectPatch).length > 0) {
      projectPatch.updated_at = new Date().toISOString()
      await supabase.from('projects').update(projectPatch).eq('id', id)
    }

    const { data, error } = await supabase
      .from('project_updates')
      .insert({
        project_id: id,
        author_id: user.id,
        title: title || null,
        body: text,
        progress_at_post: typeof progress === 'number' ? progress : null,
        status_at_post: status || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/projects/[id]/updates error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
