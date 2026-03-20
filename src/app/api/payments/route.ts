import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — List payments
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    let query = supabase
      .from('payments')
      .select(`*, user:user_id(full_name, email, role)`)
      .order('created_at', { ascending: false })

    // Non-admins only see their own payments
    if (profile?.role !== 'admin') {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/payments error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create payment record (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await req.json()
    const { user_id, amount, payment_type, description, status } = body

    if (!user_id || !amount || !payment_type) {
      return NextResponse.json({ error: 'user_id, amount, and payment_type are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id,
        amount,
        payment_type,
        description,
        status: status || 'pending',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/payments error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
