'use client'

import { useState } from 'react'
import { PageHeader, StatusBadge, StatCard } from '@/components/dashboard/DashboardUI'
import { Plus, Video, X, Calendar, Clock, ExternalLink, Copy, Check, VideoOff } from 'lucide-react'

type Meeting = {
  id: string
  session: string
  mentor: string
  date: string
  time: string
  duration: string
  status: string
  meetLink: string | null
}

const initialMeetings: Meeting[] = [
  { id: '1', session: 'Career Counseling', mentor: 'Vikram Singh', date: 'Jun 18, 2025', time: '2:00 PM', duration: '45 min', status: 'Scheduled', meetLink: 'https://meet.google.com/abc-defg-hij' },
  { id: '2', session: 'Mock Interview', mentor: 'Anita Desai', date: 'Jun 22, 2025', time: '11:00 AM', duration: '60 min', status: 'Scheduled', meetLink: 'https://meet.google.com/xyz-uvwx-rst' },
  { id: '3', session: 'Resume Review', mentor: 'Priya Sharma', date: 'Jun 10, 2025', time: '3:00 PM', duration: '30 min', status: 'Completed', meetLink: 'https://meet.google.com/old-meet-lnk' },
  { id: '4', session: 'Business Plan Discussion', mentor: 'Vikram Singh', date: 'Jun 05, 2025', time: '4:00 PM', duration: '60 min', status: 'Completed', meetLink: null },
]

function generateMeetCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const seg = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`
}

export default function StudentMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [showBookModal, setShowBookModal] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({ session: '', mentor: '', date: '', time: '', duration: '30 min' })

  const handleBook = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      session: form.session,
      mentor: form.mentor,
      date: new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: form.time,
      duration: form.duration,
      status: 'Scheduled',
      meetLink: generateMeetCode(),
    }
    setMeetings([newMeeting, ...meetings])
    setShowBookModal(false)
    setForm({ session: '', mentor: '', date: '', time: '', duration: '30 min' })
  }

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const scheduled = meetings.filter(m => m.status === 'Scheduled').length
  const completed = meetings.filter(m => m.status === 'Completed').length

  return (
    <div>
      <PageHeader
        title="Meetings"
        description="Schedule and manage your 1-on-1 sessions via Google Meet"
        action={
          <button onClick={() => setShowBookModal(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} /> Book Meeting
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Meetings" value={meetings.length} icon={Calendar} color="navy" />
        <StatCard label="Upcoming" value={scheduled} change="Scheduled" icon={Video} color="teal" />
        <StatCard label="Completed" value={completed} icon={Check} color="mint" />
      </div>

      <div className="space-y-4">
        {meetings.map((m) => (
          <div key={m.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${m.status === 'Scheduled' ? 'bg-primary-bright/10 text-primary-bright' : 'bg-gray-100 text-gray-400'}`}>
                  {m.status === 'Scheduled' ? <Video size={20} /> : <VideoOff size={20} />}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-primary">{m.session}</h3>
                  <p className="text-sm text-foreground/50">with {m.mentor}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground/50">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {m.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {m.time} · {m.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:flex-shrink-0">
                <StatusBadge status={m.status} />
                {m.meetLink && m.status === 'Scheduled' && (
                  <>
                    <button onClick={() => copyLink(m.meetLink!, m.id)} className="p-2 rounded-lg border border-border hover:bg-off-white text-foreground/50 hover:text-primary transition-colors" title="Copy Meet link">
                      {copied === m.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                    <a href={m.meetLink} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors">
                      <ExternalLink size={14} /> Join Meet
                    </a>
                  </>
                )}
              </div>
            </div>
            {m.meetLink && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-foreground/40 font-mono">{m.meetLink}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Book Meeting Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-heading font-bold text-primary">Book a Meeting</h3>
                <p className="text-xs text-foreground/50 mt-0.5">A Google Meet link will be auto-generated</p>
              </div>
              <button onClick={() => setShowBookModal(false)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Session Type</label>
                <input type="text" value={form.session} onChange={e => setForm({ ...form, session: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" placeholder="e.g. Career Counseling" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Mentor</label>
                <select value={form.mentor} onChange={e => setForm({ ...form, mentor: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright bg-white">
                  <option value="">Select mentor</option>
                  <option value="Vikram Singh">Vikram Singh</option>
                  <option value="Anita Desai">Anita Desai</option>
                  <option value="Priya Sharma">Priya Sharma</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Duration</label>
                <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright bg-white">
                  <option value="15 min">15 minutes</option>
                  <option value="30 min">30 minutes</option>
                  <option value="45 min">45 minutes</option>
                  <option value="60 min">60 minutes</option>
                </select>
              </div>
              <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                <Video size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Google Meet</p>
                  <p className="text-xs text-green-600">A unique Meet link will be generated automatically when you book this session.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowBookModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
              <button onClick={handleBook} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Video size={14} /> Book & Generate Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
