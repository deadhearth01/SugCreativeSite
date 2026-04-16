import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — List tasks (role-based visibility)
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_profile:assigned_to(full_name, email, role),
        assigned_by_profile:assigned_by(full_name)
      `)
      .order('created_at', { ascending: false })

    if (profile?.role === 'admin') {
      // Admin sees all tasks — no filter
    } else if (profile?.role === 'employee') {
      // Employee sees: tasks assigned to them + tasks they created + tasks assigned to interns/students
      // We fetch all and filter server-side since Supabase doesn't support complex OR with joins easily
      // Alternatively use .or() filter
      query = query.or(`assigned_to.eq.${user.id},assigned_by.eq.${user.id}`)
    } else {
      // Everyone else sees only tasks assigned to them
      query = query.eq('assigned_to', user.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // For employees, also include tasks assigned to interns/students (even if not created by them)
    if (profile?.role === 'employee') {
      const { data: internStudentTasks } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_profile:assigned_to(full_name, email, role),
          assigned_by_profile:assigned_by(full_name)
        `)
        .in('assigned_to_profile.role', ['intern', 'student'])
        .order('created_at', { ascending: false })

      // Merge without duplicates
      const existingIds = new Set((data || []).map((t: { id: string }) => t.id))
      const additional = (internStudentTasks || []).filter((t: { id: string }) => !existingIds.has(t.id))
      const merged = [...(data || []), ...additional]
      return NextResponse.json({ data: merged })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/tasks error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create task (role-based assignment)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role

    const body = await req.json()
    const { title, description, priority, assigned_to, due_date } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Default assigned_to to self if not provided
    const targetUserId = assigned_to || user.id

    // Role-based assignment validation
    if (role === 'admin') {
      // Admin can assign to anyone — no restriction
    } else if (role === 'employee') {
      // Employee can assign to self, or to interns/students
      if (targetUserId !== user.id) {
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', targetUserId)
          .single()
        if (!targetProfile || !['intern', 'student'].includes(targetProfile.role)) {
          return NextResponse.json({ error: 'Employees can only assign tasks to themselves, interns, or students' }, { status: 403 })
        }
      }
    } else {
      // Everyone else can only assign to self
      if (targetUserId !== user.id) {
        return NextResponse.json({ error: 'You can only create tasks for yourself' }, { status: 403 })
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        priority: priority || 'medium',
        status: 'pending',
        assigned_to: targetUserId,
        assigned_by: user.id,
        due_date,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/tasks error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
