import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { INTERNSHIPS_SECTIONS } from '@/lib/pageContent'

const ALLOWED: Record<string, readonly string[]> = {
  internships: INTERNSHIPS_SECTIONS,
}

// GET /api/page-content?page=internships — public read of stored sections.
export async function GET(req: NextRequest) {
  try {
    const page = new URL(req.url).searchParams.get('page')
    if (!page || !ALLOWED[page]) {
      return NextResponse.json({ error: 'Unknown page' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('page_content')
      .select('section, data')
      .eq('page', page)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/page-content error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/page-content — admin-only bulk save of one page's sections.
// Body: { page: string, sections: { [section: string]: object } }
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await req.json()
    const page: string = body?.page
    const sections: Record<string, unknown> = body?.sections ?? {}

    const allowed = ALLOWED[page]
    if (!allowed) return NextResponse.json({ error: 'Unknown page' }, { status: 400 })

    // Only persist known sections — an unexpected key is a bug or an attack,
    // never something we want to write.
    const rows = Object.entries(sections)
      .filter(([section]) => allowed.includes(section))
      .map(([section, data]) => ({
        page,
        section,
        data,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }))

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid sections supplied' }, { status: 400 })
    }

    const { error } = await supabase
      .from('page_content')
      .upsert(rows, { onConflict: 'page,section' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Push the edit to the live public page immediately.
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/internships')

    return NextResponse.json({ success: true, saved: rows.length })
  } catch (err) {
    console.error('PUT /api/page-content error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
