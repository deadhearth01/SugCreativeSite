import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH — Check out or update attendance
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const body = await req.json()

    // Verify ownership or admin
    if (profile?.role !== 'admin') {
      const { data: record } = await supabase.from('attendance').select('user_id, check_in').eq('id', id).single()
      if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 })
      if (record.user_id !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      // Calculate hours worked for check-out
      const checkOut = new Date().toISOString()
      const checkIn = new Date(record.check_in)
      const hoursWorked = parseFloat(((new Date(checkOut).getTime() - checkIn.getTime()) / 3600000).toFixed(2))

      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_out: checkOut,
          hours_worked: hoursWorked,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    // Admin can update any field
    const { data, error } = await supabase
      .from('attendance')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('PATCH /api/attendance/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
