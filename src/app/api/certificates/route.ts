import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — List student's certificates
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    let query = supabase
      .from('certificates')
      .select(`
        *,
        course:course_id(title, category),
        student:student_id(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (profile?.role !== 'admin') {
      query = query.eq('student_id', user.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/certificates error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
