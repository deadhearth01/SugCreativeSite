'use client'

import { useState } from 'react'
import { CalendarDays, ChevronDown, History } from 'lucide-react'
import { eventColor, splitByTime, type CalendarEvent } from '@/lib/useCalendarEvents'

function EventRow({ e, muted = false }: { e: CalendarEvent; muted?: boolean }) {
  const date = new Date(e.start_time)
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border border-border/50 transition-colors ${
        muted ? 'opacity-70 hover:opacity-100' : 'hover:bg-off-white/50'
      }`}
    >
      <div
        className="w-1.5 self-stretch min-h-[36px] rounded-full flex-shrink-0"
        style={{ backgroundColor: eventColor(e) }}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-primary truncate">{e.title}</p>
        <p className="text-xs text-foreground/50 mt-0.5">
          {date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          {!e.all_day && (
            <>
              {' · '}
              {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </>
          )}
          {e.all_day && ' · All day'}
        </p>
        {e.event_type && (
          <span className="inline-block mt-1 text-[10px] bg-off-white px-2 py-0.5 rounded text-foreground/60 font-medium">
            {e.event_type}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Upcoming events, plus a collapsed archive of events that have already
 * happened — so an event disappearing from the calendar doesn't mean losing
 * the record of it.
 */
export default function CalendarSidePanel({ events }: { events: CalendarEvent[] }) {
  const { upcoming, past } = splitByTime(events)
  const [showPast, setShowPast] = useState(false)

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="font-heading font-bold text-primary mb-4">Upcoming Events</h3>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-3">
          <CalendarDays size={36} className="text-foreground/20" />
          <p className="text-sm text-foreground/40 text-center">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.slice(0, 8).map((e) => (
            <EventRow key={e.id} e={e} />
          ))}
          {upcoming.length > 8 && (
            <p className="text-xs text-foreground/40 text-center">
              +{upcoming.length - 8} more events
            </p>
          )}
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            className="w-full flex items-center justify-between gap-2 text-left group"
            aria-expanded={showPast}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground/60 group-hover:text-primary transition-colors">
              <History size={15} />
              Past events
              <span className="text-[10px] font-bold bg-off-white text-foreground/50 px-1.5 py-0.5 rounded-full">
                {past.length}
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`text-foreground/40 transition-transform ${showPast ? 'rotate-180' : ''}`}
            />
          </button>

          {showPast && (
            <div className="space-y-3 mt-3 max-h-80 overflow-y-auto pr-1">
              {past.map((e) => (
                <EventRow key={e.id} e={e} muted />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
