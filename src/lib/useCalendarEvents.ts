'use client'

import { useEffect, useState } from 'react'

export type CalendarEvent = {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  all_day?: boolean | null
  event_type: string | null
  color?: string | null
  target_roles: string[] | null
}

/**
 * Loads the calendar events visible to the signed-in user.
 *
 * Reads through /api/calendar so the role filter is resolved from the
 * server-side session rather than the browser client. Any failure is returned
 * as `error` instead of being swallowed — an empty calendar and a broken
 * calendar look identical otherwise, which makes visibility bugs invisible.
 */
/** Fallback palette used only when an event has no colour stored. */
const FALLBACK_COLORS = ['#35C8E0', '#82C93D', '#8B5CF6', '#F59E0B', '#0A2472']

/**
 * Resolve an event's chip colour to a concrete hex value.
 *
 * Applied as an inline style rather than a Tailwind class: the previous
 * implementation hashed each event id onto a class-name palette that included
 * a malformed entry ('bg-[#E0F2F8]0'), so some events rendered white-on-white
 * and looked missing from the grid entirely.
 */
export function eventColor(e: { id: string; color?: string | null }): string {
  if (e.color && /^#[0-9a-f]{3,8}$/i.test(e.color)) return e.color
  let hash = 0
  for (let i = 0; i < e.id.length; i++) hash = e.id.charCodeAt(i) + ((hash << 5) - hash)
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
}

/** Split events into upcoming (today onward) and past, each sorted sensibly. */
export function splitByTime(events: CalendarEvent[]) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const upcoming: CalendarEvent[] = []
  const past: CalendarEvent[] = []
  for (const e of events) {
    // An event counts as still running until its end time passes.
    const ends = new Date(e.end_time || e.start_time)
    if (ends >= startOfToday) upcoming.push(e)
    else past.push(e)
  }
  upcoming.sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))
  past.sort((a, b) => +new Date(b.start_time) - +new Date(a.start_time)) // newest first
  return { upcoming, past }
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        // no-store: the response is per-user and must never come from the
        // browser's HTTP cache.
        const res = await fetch('/api/calendar', { cache: 'no-store' })
        const text = await res.text()

        let json: { data?: CalendarEvent[]; error?: string } = {}
        try {
          json = JSON.parse(text)
        } catch {
          throw new Error(
            res.status === 401
              ? 'Your session expired. Please sign in again.'
              : `Unexpected response from server (HTTP ${res.status}).`
          )
        }

        if (!res.ok) {
          throw new Error(
            res.status === 401
              ? 'Your session expired. Please sign in again.'
              : json.error || `Could not load events (HTTP ${res.status}).`
          )
        }

        if (!cancelled) {
          setEvents(json.data ?? [])
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setEvents([])
          setError(err instanceof Error ? err.message : 'Could not load events.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { events, loading, error }
}
