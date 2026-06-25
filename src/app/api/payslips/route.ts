import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/client'
import { payslipEmail } from '@/lib/email/templates'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

async function getRole(): Promise<{ id: string; role: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return { id: user.id, role: profile?.role || '' }
}

// GET — admin: all payslips (optional ?recipient_id, ?month, ?year). Non-admin: own.
export async function GET(req: NextRequest) {
  const me = await getRole()
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)

  const client = createAdminClient()
  let query = client.from('payslips').select('*').order('period_year', { ascending: false }).order('period_month', { ascending: false })

  if (me.role !== 'admin') {
    query = query.eq('recipient_id', me.id)
  } else {
    const rid = searchParams.get('recipient_id')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    if (rid) query = query.eq('recipient_id', rid)
    if (month) query = query.eq('period_month', Number(month))
    if (year) query = query.eq('period_year', Number(year))
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST — generate/create a payslip (admin only). Computes deductions from the
// company defaults unless explicit earnings/deductions are supplied.
export async function POST(req: NextRequest) {
  try {
    const me = await getRole()
    if (!me || me.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await req.json()
    const { recipient_id, period_month, period_year, earnings, deductions, notes, tags, send_email } = body

    if (!recipient_id || !period_month || !period_year) {
      return NextResponse.json({ error: 'recipient_id, period_month, period_year are required' }, { status: 400 })
    }

    const client = createAdminClient()
    const { data: profile } = await client
      .from('profiles')
      .select('full_name, email, display_id, monthly_pay, pay_type')
      .eq('id', recipient_id)
      .single()
    if (!profile) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

    const { data: settings } = await client.from('payroll_settings').select('*').eq('id', true).single()

    // Earnings: use supplied, else default to the profile's monthly_pay as "basic".
    const earn: Record<string, number> = earnings && Object.keys(earnings).length
      ? earnings
      : { basic: Number(profile.monthly_pay) || 0 }
    const gross = Object.values(earn).reduce((s, v) => s + (Number(v) || 0), 0)

    // Deductions: use supplied, else compute from settings.
    let ded: Record<string, number>
    if (deductions && Object.keys(deductions).length) {
      ded = deductions
    } else {
      const pf = settings ? (gross * Number(settings.pf_percent || 0)) / 100 : 0
      const tax = settings ? (gross * Number(settings.tax_percent || 0)) / 100 : 0
      const ptax = settings ? Number(settings.professional_tax || 0) : 0
      ded = {}
      if (pf) ded.pf = Math.round(pf)
      if (tax) ded.tax = Math.round(tax)
      if (ptax) ded.professional_tax = ptax
    }
    const totalDed = Object.values(ded).reduce((s, v) => s + (Number(v) || 0), 0)
    const net = gross - totalDed

    const payType = profile.pay_type || 'salary'
    const mm = String(period_month).padStart(2, '0')
    const payslipNo = `PS-${period_year}-${mm}-${profile.display_id || recipient_id.slice(0, 8)}`

    const { data, error } = await client
      .from('payslips')
      .upsert({
        payslip_no: payslipNo,
        recipient_id,
        recipient_name: profile.full_name || 'Employee',
        recipient_email: profile.email || null,
        display_id: profile.display_id || null,
        pay_type: payType,
        period_month,
        period_year,
        earnings: earn,
        deductions: ded,
        gross,
        total_deductions: totalDed,
        net,
        notes: notes || null,
        tags: tags || [],
        status: 'issued',
        created_by: me.id,
      }, { onConflict: 'recipient_id,period_month,period_year' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (send_email && profile.email) {
      try {
        const tpl = payslipEmail({
          recipientName: profile.full_name || 'Employee',
          payType,
          periodLabel: `${MONTHS[period_month - 1]} ${period_year}`,
          net: `₹${net.toLocaleString('en-IN')}`,
          payslipNo,
          downloadUrl: SITE_URL ? `${SITE_URL}/dashboard` : undefined,
        })
        await sendEmail({ to: profile.email, subject: tpl.subject, html: tpl.html, text: tpl.text })
      } catch (mailErr) {
        console.error('payslip email error (non-fatal):', mailErr)
      }
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/payslips error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
