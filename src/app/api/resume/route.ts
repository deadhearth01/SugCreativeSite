import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Get student's resume
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('student_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || null })
  } catch (err) {
    console.error('GET /api/resume error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT — Upsert resume data
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { template, personal_info, education, experience, skills, projects, certifications } = body

    const { data, error } = await supabase
      .from('resumes')
      .upsert(
        {
          student_id: user.id,
          template: template || 'classic',
          personal_info,
          education,
          experience,
          skills,
          projects,
          certifications,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'student_id' }
      )
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('PUT /api/resume error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
