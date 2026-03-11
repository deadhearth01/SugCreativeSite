import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return user
}

// PATCH — Update user (auth fields + profile)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local' }, { status: 500 })
  }

  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { full_name, email, role, phone, tags, password, status } = body

  const adminClient = createAdminClient()

  // Update auth user if email or password changed
  const authUpdates: Record<string, unknown> = {}
  if (email) authUpdates.email = email
  if (password) authUpdates.password = password
  if (full_name || role) {
    authUpdates.user_metadata = {
      ...(full_name && { full_name }),
      ...(role && { role }),
    }
  }

  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await adminClient.auth.admin.updateUserById(id, authUpdates)
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
  }

  // Update profile
  const profileUpdates: Record<string, unknown> = {}
  if (full_name !== undefined) profileUpdates.full_name = full_name
  if (email !== undefined) profileUpdates.email = email
  if (role !== undefined) profileUpdates.role = role
  if (phone !== undefined) profileUpdates.phone = phone || null
  if (tags !== undefined) profileUpdates.tags = tags
  if (status !== undefined) profileUpdates.status = status

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await adminClient
      .from('profiles')
      .update(profileUpdates)
      .eq('id', id)
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }
  }

  return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/admin/users/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — Delete user (cascades to profile via FK)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local' }, { status: 500 })
  }

  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Prevent self-deletion
  if (id === admin.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.deleteUser(id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/users/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
