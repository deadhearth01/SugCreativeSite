'use client'

import { useState } from 'react'
import { PageHeader, StatusBadge } from '@/components/dashboard/DashboardUI'
import { Plus, Video, X, Calendar, Clock, ExternalLink, Copy, Check, VideoOff } from 'lucide-react'

type Meeting = {
  id: string
  session: string
  with: string
  date: string
  time: string
  duration: string
  status: string
  meetLink: string | null
}

const initialMeetings: Meeting[] = [
  { id: '1', session: 'Project Review — Brand Strategy', with: 'Vikram Singh', date: 'Jun 20, 2025', time: '3:00 PM', duration: '45 min', status: 'Scheduled', meetLink: 'https://meet.google.com/prj-revw-brd' },
  { id: '2', session: 'Kickoff — Digital Marketing', with: 'Priya Sharma', date: 'Jun 12, 2025', time: '10:00 AM', duration: '60 min', status: 'Completed', meetLink: 'https://meet.google.com/mkt-kick-off' },
]

function generateMeetCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const seg = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`
}

export default function ClientMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({ session: '', with: '', date: '', time: '', duration: '45 min' })

  const handleRequest = () => {
    const m: Meeting = {
      id: Date.now().toString(),
      session: form.session,
      with: form.with,
      date: new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: form.time,
      duration: form.duration,
      status: 'Scheduled',
      meetLink: generateMeetCode(),
    }
    setMeetings([m, ...meetings])
    setShowModal(false)
    setForm({ session: '', with: '', date: '', time: '', duration: '45 min' })
  }

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <PageHeader title="Meetings" description="Schedule sessions with your project team via Google Meet" action={
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"><Plus size={16} /> Request Meeting</button>
      } />

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
                  <p className="text-sm text-foreground/50">with {m.with}</p>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-heading font-bold text-primary">Request Meeting</h3>
                <p className="text-xs text-foreground/50 mt-0.5">A Google Meet link will be auto-generated</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Session Topic</label>
                <input type="text" value={form.session} onChange={e => setForm({ ...form, session: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" placeholder="e.g. Project Review — Brand Strategy" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">With (Team Member)</label>
                <input type="text" value={form.with} onChange={e => setForm({ ...form, with: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" placeholder="e.g. Vikram Singh" />
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
                  <option value="30 min">30 minutes</option>
                  <option value="45 min">45 minutes</option>
                  <option value="60 min">60 minutes</option>
                  <option value="90 min">90 minutes</option>
                </select>
              </div>
              <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                <Video size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Google Meet</p>
                  <p className="text-xs text-green-600">A unique Meet link will be generated automatically.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
              <button onClick={handleRequest} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Video size={14} /> Book & Generate Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
