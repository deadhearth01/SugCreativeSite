import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const VALID_ROLES = ['admin', 'student', 'client', 'mentor', 'employee', 'intern']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based access control: ensure user only accesses their own dashboard
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const pathParts = request.nextUrl.pathname.split('/')
    const urlRole = pathParts[2] // /dashboard/[role]/...

    if (urlRole && VALID_ROLES.includes(urlRole)) {
      // Fetch the user's actual role from DB
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const actualRole = profile?.role

      // If role doesn't match, redirect to their correct dashboard
      if (actualRole && actualRole !== urlRole) {
        const url = request.nextUrl.clone()
        url.pathname = `/dashboard/${actualRole}`
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
