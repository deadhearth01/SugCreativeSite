'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, Views, type View, type SlotInfo, type EventProps } from 'react-big-calendar'
import withDragAndDrop, { type EventInteractionArgs, type withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay, add } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { Plus, Loader2, X, Trash2, Edit, MapPin, Users, Clock, Calendar as CalendarIcon, GripVertical } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

// Import styles
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import '@/styles/big-calendar.css'

// Date-fns localizer for react-big-calendar
const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
})

type CalendarEvent = {
  id: string
  title: string
  description?: string
  event_type: string
  start_time: string
  end_time?: string
  all_day: boolean
  location?: string
  color?: string
  target_roles: string[]
  created_by?: string
}

type BigCalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: CalendarEvent
}

// Create the DnD-enabled Calendar with proper typing
const DnDCalendar = withDragAndDrop<BigCalendarEvent>(Calendar)

const EVENT_TYPES = [
  { value: 'meeting', label: 'Meeting', color: '#82C93D' },
  { value: 'deadline', label: 'Deadline', color: '#EF4444' },
  { value: 'holiday', label: 'Holiday', color: '#10B981' },
  { value: 'workshop', label: 'Workshop', color: '#8B5CF6' },
  { value: 'exam', label: 'Exam', color: '#F59E0B' },
  { value: 'general', label: 'General', color: '#35C8E0' },
]

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'admin', label: 'Admin' },
  { value: 'student', label: 'Students' },
  { value: 'client', label: 'Clients' },
  { value: 'mentor', label: 'Mentors' },
  { value: 'employee', label: 'Employees' },
  { value: 'intern', label: 'Interns' },
]

const EVENT_COLORS = ['#35C8E0', '#82C93D', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899']

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<View>(Views.MONTH)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'general',
    start_time: '',
    end_time: '',
    all_day: false,
    location: '',
    color: '#35C8E0',
    target_roles: ['all'] as string[],
  })

  const loadEvents = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error loading events:', error)
      setToast({ message: 'Failed to load events', type: 'error' })
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadEvents() }, [loadEvents])

  // Convert events for react-big-calendar
  const calendarEvents: BigCalendarEvent[] = useMemo(() => {
    return events.map(event => {
      const start = new Date(event.start_time)
      let end = event.end_time ? new Date(event.end_time) : add(start, { hours: 1 })

      // For all-day events, ensure end is at least start + 1 day
      if (event.all_day && end <= start) {
        end = add(start, { days: 1 })
      }

      return {
        id: event.id,
        title: event.title,
        start,
        end,
        allDay: event.all_day,
        resource: event,
      }
    })
  }, [events])

  // Handle clicking on empty slot to create event
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    const { start, end, action } = slotInfo

    // Only respond to click or select actions
    if (action !== 'click' && action !== 'select' && action !== 'doubleClick') {
      return
    }

    setEditingEvent(null)
    setSelectedEvent(null)

    // Determine if it's an all-day slot based on the view and time
    const isAllDay = currentView === Views.MONTH ||
      (start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 0 && end.getMinutes() === 0)

    setForm({
      title: '',
      description: '',
      event_type: 'general',
      start_time: format(start, "yyyy-MM-dd'T'HH:mm"),
      end_time: format(end, "yyyy-MM-dd'T'HH:mm"),
      all_day: isAllDay,
      location: '',
      color: '#35C8E0',
      target_roles: ['all'],
    })
    setShowModal(true)
  }, [currentView])

  // Handle clicking on an existing event
  const handleSelectEvent = useCallback((event: BigCalendarEvent) => {
    setSelectedEvent(event.resource)
  }, [])

  // Handle drag and drop - move event to new time
  const handleEventDrop = useCallback(async ({ event, start, end, isAllDay }: EventInteractionArgs<BigCalendarEvent>) => {
    const originalEvent = event.resource

    // Optimistically update UI
    setEvents(prev => prev.map(e => {
      if (e.id === originalEvent.id) {
        return {
          ...e,
          start_time: (start as Date).toISOString(),
          end_time: (end as Date).toISOString(),
          all_day: isAllDay ?? e.all_day,
        }
      }
      return e
    }))

    // Update in database
    try {
      const res = await fetch(`/api/calendar/${originalEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: (start as Date).toISOString(),
          end_time: (end as Date).toISOString(),
          all_day: isAllDay ?? originalEvent.all_day,
        }),
      })

      if (!res.ok) {
        // Revert on error
        loadEvents()
        setToast({ message: 'Failed to move event', type: 'error' })
      } else {
        setToast({ message: 'Event moved', type: 'success' })
      }
    } catch {
      loadEvents()
      setToast({ message: 'Failed to move event', type: 'error' })
    }
  }, [loadEvents])

  // Handle resize - change event duration
  const handleEventResize = useCallback(async ({ event, start, end }: EventInteractionArgs<BigCalendarEvent>) => {
    const originalEvent = event.resource

    // Optimistically update UI
    setEvents(prev => prev.map(e => {
      if (e.id === originalEvent.id) {
        return {
          ...e,
          start_time: (start as Date).toISOString(),
          end_time: (end as Date).toISOString(),
        }
      }
      return e
    }))

    // Update in database
    try {
      const res = await fetch(`/api/calendar/${originalEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: (start as Date).toISOString(),
          end_time: (end as Date).toISOString(),
        }),
      })

      if (!res.ok) {
        loadEvents()
        setToast({ message: 'Failed to resize event', type: 'error' })
      } else {
        setToast({ message: 'Event updated', type: 'success' })
      }
    } catch {
      loadEvents()
      setToast({ message: 'Failed to resize event', type: 'error' })
    }
  }, [loadEvents])

  // Open edit modal for an event
  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event)
    setForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_time: format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"),
      end_time: event.end_time ? format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm") : '',
      all_day: event.all_day,
      location: event.location || '',
      color: event.color || '#35C8E0',
      target_roles: event.target_roles || ['all'],
    })
    setSelectedEvent(null)
    setShowModal(true)
  }

  // Save event (create or update)
  const handleSave = async () => {
    if (!form.title || !form.start_time) {
      setToast({ message: 'Title and start time are required', type: 'error' })
      return
    }
    setSaving(true)
    try {
      const endpoint = editingEvent ? `/api/calendar/${editingEvent.id}` : '/api/calendar'
      const method = editingEvent ? 'PATCH' : 'POST'

      // Prepare the data
      const eventData = {
        ...form,
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      if (!res.ok) {
        const { error } = await res.json()
        setToast({ message: error || 'Failed to save event', type: 'error' })
        return
      }

      setToast({ message: editingEvent ? 'Event updated' : 'Event created', type: 'success' })
      setShowModal(false)
      setEditingEvent(null)
      loadEvents()
    } finally {
      setSaving(false)
    }
  }

  // Delete an event
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    const res = await fetch(`/api/calendar/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setToast({ message: 'Event deleted', type: 'success' })
      setEvents(prev => prev.filter(e => e.id !== id))
      setSelectedEvent(null)
    } else {
      setToast({ message: 'Failed to delete event', type: 'error' })
    }
  }

  // Toggle role selection
  const toggleRole = (role: string) => {
    if (role === 'all') {
      setForm(f => ({ ...f, target_roles: ['all'] }))
      return
    }
    setForm(f => {
      const curr = f.target_roles.filter(r => r !== 'all')
      return {
        ...f,
        target_roles: curr.includes(role)
          ? curr.filter(r => r !== role)
          : [...curr, role],
      }
    })
  }

  // Custom event styling based on color
  const eventStyleGetter = useCallback((event: BigCalendarEvent) => {
    const color = event.resource.color || '#35C8E0'
    return {
      style: {
        backgroundColor: color,
        borderLeftColor: color,
        borderLeftWidth: '3px',
        borderLeftStyle: 'solid' as const,
        color: 'white',
      },
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="SUG Calendar"
        description="Manage events, workshops, and deadlines for all roles"
        action={
          <button
            onClick={() => {
              setEditingEvent(null)
              setForm({
                title: '',
                description: '',
                event_type: 'general',
                start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                end_time: format(add(new Date(), { hours: 1 }), "yyyy-MM-dd'T'HH:mm"),
                all_day: false,
                location: '',
                color: '#35C8E0',
                target_roles: ['all'],
              })
              setShowModal(true)
            }}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Add Event
          </button>
        }
      />

      {/* Instructions */}
      <div className="mb-4 p-4 bg-off-white border border-border rounded-lg flex items-center gap-3 text-sm text-foreground-secondary">
        <GripVertical size={16} className="text-primary flex-shrink-0" />
        <span>
          <strong>Tip:</strong> Click on any date/time to create an event. Drag events to move them. Drag event edges to resize.
        </span>
      </div>

      {/* Calendar */}
      <div className="bg-white border border-border rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 260px)', minHeight: '600px' }}>
        <DnDCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor={(event) => event.start}
          endAccessor={(event) => event.end}
          date={currentDate}
          view={currentView}
          onNavigate={setCurrentDate}
          onView={setCurrentView}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(event) => handleSelectEvent(event as BigCalendarEvent)}
          onEventDrop={handleEventDrop as (args: EventInteractionArgs<BigCalendarEvent>) => void}
          onEventResize={handleEventResize as (args: EventInteractionArgs<BigCalendarEvent>) => void}
          selectable
          resizable
          draggableAccessor={() => true}
          resizableAccessor={() => true}
          eventPropGetter={(event) => eventStyleGetter(event as BigCalendarEvent)}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.MONTH}
          popup
          showMultiDayTimes
          step={30}
          timeslots={2}
          min={new Date(0, 0, 0, 6, 0, 0)}
          max={new Date(0, 0, 0, 22, 0, 0)}
          components={{
            event: ({ event }: EventProps<BigCalendarEvent>) => (
              <div className="flex items-center gap-1 w-full overflow-hidden">
                <span className="truncate">{event.title}</span>
              </div>
            ),
          }}
          formats={{
            eventTimeRangeFormat: () => '',
            timeGutterFormat: (date: Date) => format(date, 'h a'),
            dayHeaderFormat: (date: Date) => format(date, 'EEEE, MMMM d'),
            dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
              `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`,
          }}
          messages={{
            today: 'Today',
            previous: '←',
            next: '→',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            agenda: 'Agenda',
            noEventsInRange: 'No events scheduled for this period.',
          }}
        />
      </div>

      {/* Event Detail Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEvent.color || '#35C8E0' }} />
                    <span className="text-xs font-semibold text-foreground/50 uppercase">
                      {EVENT_TYPES.find(t => t.value === selectedEvent.event_type)?.label || selectedEvent.event_type}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-primary">{selectedEvent.title}</h2>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-foreground/40 hover:text-foreground/60">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {selectedEvent.description && (
                <p className="text-sm text-foreground/70">{selectedEvent.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-foreground/40 flex-shrink-0" />
                  <span className="text-foreground/70">
                    {selectedEvent.all_day ? (
                      <>All day · {format(new Date(selectedEvent.start_time), 'EEEE, MMMM d, yyyy')}</>
                    ) : (
                      <>
                        {format(new Date(selectedEvent.start_time), 'EEEE, MMMM d, yyyy')}
                        <br />
                        {format(new Date(selectedEvent.start_time), 'h:mm a')}
                        {selectedEvent.end_time && (
                          <> – {format(new Date(selectedEvent.end_time), 'h:mm a')}</>
                        )}
                      </>
                    )}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-foreground/40 flex-shrink-0" />
                    <span className="text-foreground/70">{selectedEvent.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Users size={16} className="text-foreground/40 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {(selectedEvent.target_roles || ['all']).map(role => (
                      <span key={role} className="px-2 py-0.5 bg-[#35C8E0]/20 text-primary text-xs font-medium rounded-full capitalize">
                        {role === 'all' ? 'All Users' : role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <button
                onClick={() => openEditModal(selectedEvent)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground/70 hover:bg-off-white transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(selectedEvent.id)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#35C8E0]/20 flex items-center justify-center">
                  <CalendarIcon size={20} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-primary">
                  {editingEvent ? 'Edit Event' : 'Create Event'}
                </h2>
              </div>
              <button
                onClick={() => { setShowModal(false); setEditingEvent(null) }}
                className="w-8 h-8 rounded-lg hover:bg-off-white flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-foreground/40" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Enter event title"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                  placeholder="Add event description (optional)"
                />
              </div>

              {/* Type & Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Event Type
                  </label>
                  <select
                    value={form.event_type}
                    onChange={e => {
                      const type = EVENT_TYPES.find(t => t.value === e.target.value)
                      setForm(f => ({
                        ...f,
                        event_type: e.target.value,
                        color: type?.color || f.color
                      }))
                    }}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    {EVENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Color
                  </label>
                  <div className="flex gap-1.5 flex-wrap p-2 border border-border rounded-lg">
                    {EVENT_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          form.color === c ? 'border-foreground scale-110 ring-2 ring-offset-1 ring-foreground/20' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Date/Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Start *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                    End
                  </label>
                  <input
                    type="datetime-local"
                    value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* All Day Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:bg-off-white transition-colors">
                <input
                  type="checkbox"
                  checked={form.all_day}
                  onChange={e => setForm(f => ({ ...f, all_day: e.target.checked }))}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">All day event</span>
                  <p className="text-xs text-foreground/50">Event spans the entire day</p>
                </div>
              </label>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                  Location
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Add location or meeting link"
                  />
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-2 uppercase tracking-wide">
                  Visible To
                </label>
                <div className="flex gap-2 flex-wrap">
                  {ROLE_OPTIONS.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => toggleRole(r.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        form.target_roles.includes(r.value)
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'border-border text-foreground/60 hover:border-primary/50 hover:text-primary'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-foreground/40 mt-2">
                  Select which user roles can see this event
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border sticky bottom-0 bg-white">
              <button
                onClick={() => { setShowModal(false); setEditingEvent(null) }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground/60 hover:bg-off-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.start_time}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
