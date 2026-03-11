'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'

const events = [
  { date: 15, title: 'Business Strategy Workshop', time: '10:00 AM', color: 'bg-primary-bright' },
  { date: 18, title: 'Startup Pitch Day', time: '2:00 PM', color: 'bg-primary' },
  { date: 20, title: 'Resume Building Session', time: '11:00 AM', color: 'bg-primary-bright' },
  { date: 22, title: 'Mentor Meet', time: '4:00 PM', color: 'bg-mint' },
  { date: 25, title: 'Career Fair', time: '9:00 AM', color: 'bg-sky' },
  { date: 28, title: 'Team Review', time: '3:00 PM', color: 'bg-sage' },
]

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [currentMonth] = useState(new Date())
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <PageHeader
        title="SUG Calendar"
        description="View all events, workshops, and deadlines"
        action={
          <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            Add Event
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <button className="text-foreground/40 hover:text-primary"><ChevronLeft size={20} /></button>
            <h3 className="font-heading font-bold text-primary">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button className="text-foreground/40 hover:text-primary"><ChevronRight size={20} /></button>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {days.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-foreground/50 py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                const event = events.find((e) => e.date === day)
                return (
                  <div
                    key={i}
                    className={`min-h-[80px] p-2 rounded-lg border border-border/50 text-sm ${
                      day === today ? 'bg-primary-bright/5 border-primary-bright' : day ? 'hover:bg-off-white/50' : ''
                    } ${!day ? 'bg-off-white/30' : ''}`}
                  >
                    {day && (
                      <>
                        <span className={`text-xs font-medium ${day === today ? 'text-primary-bright font-bold' : 'text-foreground/60'}`}>
                          {day}
                        </span>
                        {event && (
                          <div className={`mt-1 px-1.5 py-0.5 rounded text-[10px] text-white font-medium truncate ${event.color}`}>
                            {event.title}
                          </div>
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
        <div className="bg-white border border-border rounded-xl">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-bold text-primary">Upcoming Events</h3>
          </div>
          <div className="p-5 space-y-4">
            {events.map((event, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-1 h-12 ${event.color} flex-shrink-0`} />
                <div>
                  <p className="text-sm font-medium text-primary">{event.title}</p>
                  <p className="text-xs text-foreground/50">
                    {currentMonth.toLocaleString('default', { month: 'short' })} {event.date} · {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
