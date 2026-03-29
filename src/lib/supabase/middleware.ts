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

  // If user is not authenticated and trying to access setup-profile, redirect to login
  if (!user && request.nextUrl.pathname === '/setup-profile') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // For authenticated users accessing dashboard or setup-profile
  if (user) {
    // Fetch the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', user.id)
      .single()

    const actualRole = profile?.role
    const hasUsername = !!profile?.username

    // If user doesn't have a username and is trying to access dashboard, redirect to setup
    if (!hasUsername && request.nextUrl.pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/setup-profile'
      return NextResponse.redirect(url)
    }

    // If user has username and is on setup-profile, redirect to dashboard
    if (hasUsername && request.nextUrl.pathname === '/setup-profile') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${actualRole || 'student'}`
      return NextResponse.redirect(url)
    }

    // Role-based access control: ensure user only accesses their own dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      const pathParts = request.nextUrl.pathname.split('/')
      const urlRole = pathParts[2] // /dashboard/[role]/...

      if (urlRole && VALID_ROLES.includes(urlRole)) {
        // If role doesn't match, redirect to their correct dashboard
        if (actualRole && actualRole !== urlRole) {
          const url = request.nextUrl.clone()
          url.pathname = `/dashboard/${actualRole}`
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}
