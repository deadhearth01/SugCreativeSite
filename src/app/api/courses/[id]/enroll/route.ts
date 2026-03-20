import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST — Enroll in a course (students only)
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!['student', 'employee', 'intern'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Only students, employees, and interns can enroll' }, { status: 403 })
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 409 })
    }

    // Check enrollment limit
    const { data: course } = await supabase
      .from('courses')
      .select('enrollment_limit, status')
      .eq('id', courseId)
      .single()

    if (!course || course.status === 'archived') {
      return NextResponse.json({ error: 'Course not available for enrollment' }, { status: 400 })
    }

    if (course.enrollment_limit) {
      const { count } = await supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .eq('status', 'active')

      if ((count || 0) >= course.enrollment_limit) {
        return NextResponse.json({ error: 'Course is full' }, { status: 400 })
      }
    }

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: user.id,
        course_id: courseId,
        status: 'active',
        progress_percent: 0,
        lessons_completed: 0,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/courses/[id]/enroll error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — Unenroll from a course
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'dropped' })
      .eq('student_id', user.id)
      .eq('course_id', courseId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/courses/[id]/enroll error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
