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
