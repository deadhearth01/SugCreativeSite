'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { useCalendarEvents, eventColor } from '@/lib/useCalendarEvents'
import CalendarSidePanel from '@/components/dashboard/CalendarSidePanel'

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function StudentCalendarPage() {
  const { events, loading, error } = useCalendarEvents()
  const [currentMonth, setCurrentMonth] = useState(new Date())

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
      const d = new Date(e.start_time)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }


  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="SUG Calendar" description="Your schedule and upcoming events" />

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Could not load calendar events</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
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
                    className={`min-h-[70px] p-2 border border-border/50 text-sm ${isToday ? 'bg-primary-bright/5 border-[#35C8E0]' : day ? 'hover:bg-off-white/50' : 'bg-off-white/30'}`}
                  >
                    {day && (
                      <>
                        <span className={`text-xs font-medium ${isToday ? 'text-[#1A9AB5] font-bold' : 'text-foreground/60'}`}>
                          {day}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              className="px-1.5 py-0.5 text-[10px] text-white font-semibold truncate rounded"
                              style={{ backgroundColor: eventColor(e) }}
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

        <CalendarSidePanel events={events} />
      </div>
    </div>
  )
}
