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
    } else if (profile?.role === 'mentor' || profile?.role === 'employee') {
      // Mentor/employee sees: tasks assigned to them + tasks they created
      // (Tasks for lower roles they manage are merged below.)
      query = query.or(`assigned_to.eq.${user.id},assigned_by.eq.${user.id}`)
    } else {
      // Everyone else sees only tasks assigned to them
      query = query.eq('assigned_to', user.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // For mentor/employee, also include tasks assigned to lower roles they manage
    if (profile?.role === 'mentor' || profile?.role === 'employee') {
      const lowerRoles = profile.role === 'mentor'
        ? ['employee', 'intern', 'student']
        : ['intern', 'student']

      const { data: lowerIds } = await supabase
        .from('profiles')
        .select('id')
        .in('role', lowerRoles)

      const ids = (lowerIds || []).map((p: { id: string }) => p.id)
      if (ids.length > 0) {
        const { data: lowerTasks } = await supabase
          .from('tasks')
          .select(`
            *,
            assigned_to_profile:assigned_to(full_name, email, role),
            assigned_by_profile:assigned_by(full_name)
          `)
          .in('assigned_to', ids)
          .order('created_at', { ascending: false })

        const existingIds = new Set((data || []).map((t: { id: string }) => t.id))
        const additional = (lowerTasks || []).filter((t: { id: string }) => !existingIds.has(t.id))
        const merged = [...(data || []), ...additional]
        return NextResponse.json({ data: merged })
      }
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

    // Role-based assignment validation (real-company hierarchy)
    // admin → anyone; mentor → employee/intern/student; employee → intern/student;
    // intern/student/client → self only
    const allowedTargetsByRole: Record<string, string[]> = {
      mentor: ['employee', 'intern', 'student'],
      employee: ['intern', 'student'],
    }

    if (role === 'admin') {
      // no restriction
    } else if (role === 'mentor' || role === 'employee') {
      if (targetUserId !== user.id) {
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', targetUserId)
          .single()
        const allowed = allowedTargetsByRole[role]
        if (!targetProfile || !allowed.includes(targetProfile.role)) {
          return NextResponse.json({ error: `${role}s can only assign tasks to themselves or to: ${allowed.join(', ')}` }, { status: 403 })
        }
      }
    } else {
      // intern, student, client → self only
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
