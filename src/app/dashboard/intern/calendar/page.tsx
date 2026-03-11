'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'

const events = [
  { date: 18, title: 'Team Standup', time: '9:30 AM', color: 'bg-primary-bright' },
  { date: 20, title: 'Quarterly Review', time: '3:00 PM', color: 'bg-primary' },
  { date: 25, title: 'Report Deadline', time: 'EOD', color: 'bg-mint' },
]

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function InternCalendarPage() {
  const [currentMonth] = useState(new Date())
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <PageHeader title="Calendar" description="Your schedule and important dates" />
      <div className="bg-white border border-border rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <button className="text-foreground/40 hover:text-primary"><ChevronLeft size={20} /></button>
          <h3 className="font-heading font-bold text-primary">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button className="text-foreground/40 hover:text-primary"><ChevronRight size={20} /></button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-7 gap-1 mb-2">{days.map((d) => <div key={d} className="text-center text-xs font-semibold text-foreground/50 py-2">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const event = events.find((e) => e.date === day)
              return (
                <div key={i} className={`min-h-[70px] p-2 border border-border/50 text-sm ${day === today ? 'bg-primary-bright/5 border-primary-bright' : day ? 'hover:bg-off-white/50' : 'bg-off-white/30'}`}>
                  {day && (
                    <>
                      <span className={`text-xs font-medium ${day === today ? 'text-primary-bright font-bold' : 'text-foreground/60'}`}>{day}</span>
                      {event && <div className={`mt-1 px-1 py-0.5 text-[10px] text-white font-medium truncate ${event.color}`}>{event.title}</div>}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
