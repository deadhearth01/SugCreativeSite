import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// GET — List all courses (public for active, auth required for all statuses)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const slug = searchParams.get('slug')
    const isPublic = searchParams.get('public') === 'true'
    
    // For non-public requests, require auth
    if (!isPublic) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If fetching single course by slug
    if (slug) {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single()
      
      if (error || !data) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }
      
      return NextResponse.json({ course: data })
    }

    let query = supabase
      .from('courses')
      .select(`
        *,
        profiles:instructor_id(full_name),
        enrollments(count)
      `)
      .order('created_at', { ascending: false })

    // Public requests only get active courses
    if (isPublic) {
      query = query.eq('status', 'active')
    } else if (status) {
      query = query.eq('status', status)
    }
    
    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)
    if (featured === 'true') query = query.eq('is_featured', true)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/courses error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create a new course (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await req.json()
    const { title, description, category, price, duration, lessons, thumbnail, syllabus, start_date, end_date, enrollment_limit } = body

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        category,
        price: price || 0,
        duration,
        lessons: lessons || 0,
        thumbnail,
        syllabus,
        start_date,
        end_date,
        enrollment_limit,
        instructor_id: user.id,
        status: 'draft',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/courses error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
