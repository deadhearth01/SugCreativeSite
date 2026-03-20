'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, CalendarDays } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type CalendarEvent = {
  id: string
  title: string
  description: string | null
  start_at: string
  end_at: string | null
  event_type: string | null
  target_roles: string[] | null
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const eventColors = [
  'bg-primary-bright',
  'bg-primary',
  'bg-teal-500',
  'bg-sky-500',
  'bg-mint',
]

function colorForEvent(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return eventColors[Math.abs(hash) % eventColors.length]
}

export default function InternCalendarPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .or('target_roles.cs.{intern},target_roles.cs.{all}')
        .order('start_at')
      setEvents((data as CalendarEvent[]) || [])
      setLoading(false)
    }
    fetchEvents()
  }, [])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const eventsForDay = (day: number) => {
    return events.filter((e) => {
      const d = new Date(e.start_at)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const upcomingEvents = events.filter((e) => new Date(e.start_at) >= today)

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-primary-bright" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Calendar" description="Your schedule and important dates" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <button onClick={prevMonth} className="text-foreground/40 hover:text-primary transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-heading font-bold text-primary">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={nextMonth} className="text-foreground/40 hover:text-primary transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {days.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-foreground/50 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                const dayEvents = day ? eventsForDay(day) : []
                const isToday = day !== null && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
                return (
                  <div
                    key={i}
                    className={`min-h-[70px] p-2 border border-border/50 text-sm ${isToday ? 'bg-primary-bright/5 border-primary-bright' : day ? 'hover:bg-off-white/50' : 'bg-off-white/30'}`}
                  >
                    {day && (
                      <>
                        <span className={`text-xs font-medium ${isToday ? 'text-primary-bright font-bold' : 'text-foreground/60'}`}>
                          {day}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              className={`px-1 py-0.5 text-[10px] text-white font-medium truncate rounded ${colorForEvent(e.id)}`}
                              title={e.title}
                            >
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-foreground/50">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="font-heading font-bold text-primary mb-4">Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <CalendarDays size={36} className="text-foreground/20" />
              <p className="text-sm text-foreground/40 text-center">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 8).map((e) => {
                const eventDate = new Date(e.start_at)
                return (
                  <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-off-white/50 transition-colors">
                    <div className={`w-2 h-full min-h-[36px] rounded-full flex-shrink-0 ${colorForEvent(e.id)}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{e.title}</p>
                      <p className="text-xs text-foreground/50 mt-0.5">
                        {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' · '}
                        {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {e.event_type && (
                        <span className="inline-block mt-1 text-[10px] bg-off-white px-2 py-0.5 rounded text-foreground/60 font-medium">
                          {e.event_type}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
              {upcomingEvents.length > 8 && (
                <p className="text-xs text-foreground/40 text-center">+{upcomingEvents.length - 8} more events</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
