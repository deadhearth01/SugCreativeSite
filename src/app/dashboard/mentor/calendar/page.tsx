'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type CalendarEvent = {
  id: string
  title: string
  start_time: string
  color?: string
  target_roles: string[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MentorCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('calendar_events')
        .select('id, title, start_time, color, target_roles')
        .or('target_roles.cs.{mentor},target_roles.cs.{all}')
        .order('start_time', { ascending: true })

      if (data) setEvents(data)
      setLoading(false)
    }
    load()
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const eventsForDay = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.start_time)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const upcomingEvents = events.filter(e => new Date(e.start_time) >= today).slice(0, 8)

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div>
      <PageHeader title="Calendar" description="Your mentoring schedule and events" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <button
              onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}
              className="text-foreground/40 hover:text-primary p-1 rounded-lg hover:bg-off-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-heading font-bold text-primary">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}
              className="text-foreground/40 hover:text-primary p-1 rounded-lg hover:bg-off-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => (
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
                    className={`min-h-[70px] p-1.5 rounded-lg border text-sm ${isToday ? 'bg-primary-bright/5 border-primary-bright' : day ? 'border-border/50 hover:bg-off-white/50' : 'border-transparent bg-off-white/30'}`}
                  >
                    {day && (
                      <>
                        <span className={`text-xs font-medium block mb-1 ${isToday ? 'text-primary-bright font-bold' : 'text-foreground/60'}`}>{day}</span>
                        {dayEvents.slice(0, 2).map(e => (
                          <div
                            key={e.id}
                            className="text-[10px] text-white font-medium px-1 py-0.5 rounded truncate mb-0.5"
                            style={{ backgroundColor: e.color || '#0A2472' }}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-foreground/40">+{dayEvents.length - 2} more</div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-bold text-primary">Upcoming Events</h3>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-foreground/40 text-center py-8">No upcoming events</p>
            ) : (
              upcomingEvents.map(e => (
                <div key={e.id} className="flex gap-3 items-start">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: e.color || '#0A2472' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{e.title}</p>
                    <p className="text-xs text-foreground/50">
                      {new Date(e.start_time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
