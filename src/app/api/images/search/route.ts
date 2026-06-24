import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Free image search for the course editor (admin only).
//
// Uses the Unsplash API. Set UNSPLASH_ACCESS_KEY in the environment. Returns a
// normalized list of { id, thumb, full, alt, credit } so the editor can embed
// an image with attribution. Degrades gracefully (clear message) when the key
// is not configured.
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const key = process.env.UNSPLASH_ACCESS_KEY
    if (!key) {
      return NextResponse.json(
        { error: 'Image search is not configured. Add UNSPLASH_ACCESS_KEY to your environment.', data: [] },
        { status: 200 }
      )
    }

    const { searchParams } = new URL(req.url)
    const query = (searchParams.get('q') || '').trim()
    const page = searchParams.get('page') || '1'
    if (!query) return NextResponse.json({ data: [] })

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=24&page=${page}&orientation=landscape`
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
      // Cache results briefly to stay within Unsplash rate limits.
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('Unsplash error:', res.status, text)
      return NextResponse.json({ error: 'Image search failed', data: [] }, { status: 200 })
    }

    const json = await res.json()
    const data = (json.results || []).map((p: {
      id: string
      urls: { small: string; regular: string }
      alt_description: string | null
      user: { name: string; links: { html: string } }
    }) => ({
      id: p.id,
      thumb: p.urls.small,
      full: p.urls.regular,
      alt: p.alt_description || query,
      credit: p.user?.name || 'Unsplash',
      creditUrl: p.user?.links?.html || 'https://unsplash.com',
    }))

    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/images/search error:', err)
    return NextResponse.json({ error: 'Internal server error', data: [] }, { status: 500 })
  }
}
