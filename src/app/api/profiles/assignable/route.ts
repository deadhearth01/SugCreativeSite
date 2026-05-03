import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// What each caller-role is allowed to assign to (mirrors the rules in /api/tasks)
const ALLOWED_TARGETS: Record<string, string[]> = {
  admin: ['admin', 'mentor', 'employee', 'intern', 'student', 'client'],
  mentor: ['employee', 'intern', 'student'],
  employee: ['intern', 'student'],
  // intern/student/client get an empty list — they can only assign to self
  intern: [],
  student: [],
  client: [],
}

const ALL_ROLES = ['admin', 'mentor', 'employee', 'intern', 'student', 'client']

/**
 * GET /api/profiles/assignable?roles=intern,student
 *
 * Returns id, full_name, username, role, avatar_url for users matching the
 * requested roles, **filtered down to what the caller is permitted to assign
 * tasks/meetings to**. Bypasses profile-RLS via the service-role client and
 * exposes only safe columns — no email, phone, or address.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const callerRole = profile?.role
    if (!callerRole) return NextResponse.json({ error: 'Profile not found' }, { status: 403 })

    const requested = (req.nextUrl.searchParams.get('roles') || '')
      .split(',')
      .map(r => r.trim())
      .filter(r => ALL_ROLES.includes(r))

    const allowed = ALLOWED_TARGETS[callerRole] || []
    const rolesToFetch = requested.length > 0
      ? requested.filter(r => allowed.includes(r))
      : allowed

    if (rolesToFetch.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Service-role client bypasses RLS; we hand-pick safe columns.
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('profiles')
      .select('id, full_name, username, role, avatar_url')
      .in('role', rolesToFetch)
      .order('full_name', { nullsFirst: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('GET /api/profiles/assignable error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
