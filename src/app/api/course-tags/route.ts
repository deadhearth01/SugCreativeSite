import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Tag suggestions for the course editor.
// Returns the most-used tags (optionally filtered by a prefix query).
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()

    let query = supabase
      .from('course_tags')
      .select('tag, usage_count')
      .order('usage_count', { ascending: false })
      .limit(20)

    if (q) query = query.ilike('tag', `${q}%`)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message, data: [] }, { status: 200 })

    return NextResponse.json({ data: (data || []).map((r) => r.tag) })
  } catch (err) {
    console.error('GET /api/course-tags error:', err)
    return NextResponse.json({ error: 'Internal server error', data: [] }, { status: 500 })
  }
}
