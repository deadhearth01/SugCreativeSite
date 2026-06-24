import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendBatchEmails } from '@/lib/email/client'
import { announcementEmail } from '@/lib/email/templates'

const ALL_ROLES = ['admin', 'student', 'client', 'mentor', 'employee', 'intern']

// GET — List announcements visible to the user's role
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const userRole = profile?.role || 'student'

    const { data, error } = await supabase
      .from('announcements')
      .select(`*, author:created_by(full_name)`)
      .or(`target_roles.cs.{${userRole}},target_roles.cs.{all}`)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/announcements error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create announcement (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await req.json()
    const { title, content, is_pinned, target_roles } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Expand 'all' — user_role[] enum doesn't accept literal 'all'
    let resolvedRoles: string[]
    if (!target_roles || target_roles.length === 0 || target_roles.includes('all')) {
      resolvedRoles = ALL_ROLES
    } else {
      resolvedRoles = target_roles.filter((r: string) => ALL_ROLES.includes(r))
      if (resolvedRoles.length === 0) resolvedRoles = ALL_ROLES
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        is_pinned: is_pinned || false,
        target_roles: resolvedRoles,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Email the targeted recipients (best-effort; never fails the request).
    try {
      const admin = createAdminClient()
      const { data: recipients } = await admin
        .from('profiles')
        .select('email, full_name')
        .in('role', resolvedRoles)
        .eq('status', 'active')

      const valid = (recipients || []).filter((r) => r.email)
      if (valid.length > 0) {
        const emails = valid.map((r) => {
          const tpl = announcementEmail({ title, content, recipientName: r.full_name })
          return { to: r.email as string, subject: tpl.subject, html: tpl.html, text: tpl.text }
        })
        await sendBatchEmails(emails)
      }
    } catch (mailErr) {
      console.error('POST /api/announcements email error (non-fatal):', mailErr)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/announcements error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
