'use client'

import { useState } from 'react'
import { PageHeader, StatusBadge, StatCard } from '@/components/dashboard/DashboardUI'
import { Plus, Video, X, Calendar, Clock, ExternalLink, Copy, Check, VideoOff, Users } from 'lucide-react'

type Session = {
  id: string
  type: string
  student: string
  date: string
  time: string
  duration: string
  status: string
  meetLink: string | null
}

const initialSessions: Session[] = [
  { id: '1', type: 'Career Counseling', student: 'Arjun Mehta', date: 'Jun 18, 2025', time: '2:00 PM', duration: '45 min', status: 'Scheduled', meetLink: 'https://meet.google.com/mtr-arjn-ses' },
  { id: '2', type: 'Mock Interview', student: 'Sneha Patel', date: 'Jun 22, 2025', time: '11:00 AM', duration: '60 min', status: 'Scheduled', meetLink: 'https://meet.google.com/mck-intv-snp' },
  { id: '3', type: 'Progress Review', student: 'Karan Joshi', date: 'Jun 25, 2025', time: '3:00 PM', duration: '30 min', status: 'Scheduled', meetLink: 'https://meet.google.com/prg-rvew-krn' },
  { id: '4', type: 'Career Counseling', student: 'Meera Nair', date: 'Jun 14, 2025', time: '10:00 AM', duration: '45 min', status: 'Completed', meetLink: 'https://meet.google.com/old-meet-mra' },
  { id: '5', type: 'Resume Review', student: 'Rahul Verma', date: 'Jun 12, 2025', time: '4:00 PM', duration: '30 min', status: 'Completed', meetLink: null },
]

function generateMeetCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const seg = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`
}

export default function MentorSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({ type: '', student: '', date: '', time: '', duration: '45 min' })

  const handleCreate = () => {
    const s: Session = {
      id: Date.now().toString(),
      type: form.type,
      student: form.student,
      date: new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: form.time,
      duration: form.duration,
      status: 'Scheduled',
      meetLink: generateMeetCode(),
    }
    setSessions([s, ...sessions])
    setShowModal(false)
    setForm({ type: '', student: '', date: '', time: '', duration: '45 min' })
  }

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const scheduled = sessions.filter(s => s.status === 'Scheduled').length
  const completed = sessions.filter(s => s.status === 'Completed').length

  return (
    <div>
      <PageHeader
        title="Sessions"
        description="Manage your mentoring sessions with Google Meet integration"
        action={
          <button onClick={() => setShowModal(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus size={16} /> Create Session
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Sessions" value={sessions.length} icon={Users} color="navy" />
        <StatCard label="Upcoming" value={scheduled} change="Scheduled" icon={Video} color="teal" />
        <StatCard label="Completed" value={completed} icon={Check} color="mint" />
      </div>

      <div className="space-y-4">
        {sessions.map((s) => (
          <div key={s.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${s.status === 'Scheduled' ? 'bg-primary-bright/10 text-primary-bright' : 'bg-gray-100 text-gray-400'}`}>
                  {s.status === 'Scheduled' ? <Video size={20} /> : <VideoOff size={20} />}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-primary">{s.type}</h3>
                  <p className="text-sm text-foreground/50">with {s.student}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground/50">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {s.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {s.time} · {s.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:flex-shrink-0">
                <StatusBadge status={s.status} />
                {s.meetLink && s.status === 'Scheduled' && (
                  <>
                    <button onClick={() => copyLink(s.meetLink!, s.id)} className="p-2 rounded-lg border border-border hover:bg-off-white text-foreground/50 hover:text-primary transition-colors" title="Copy Meet link">
                      {copied === s.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                    <a href={s.meetLink} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors">
                      <ExternalLink size={14} /> Start Meet
                    </a>
                  </>
                )}
              </div>
            </div>
            {s.meetLink && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-foreground/40 font-mono">{s.meetLink}</p>
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
                <h3 className="text-lg font-heading font-bold text-primary">Create Session</h3>
                <p className="text-xs text-foreground/50 mt-0.5">A Google Meet link will be auto-generated</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Session Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright bg-white">
                  <option value="">Select type</option>
                  <option value="Career Counseling">Career Counseling</option>
                  <option value="Mock Interview">Mock Interview</option>
                  <option value="Resume Review">Resume Review</option>
                  <option value="Progress Review">Progress Review</option>
                  <option value="Business Plan Discussion">Business Plan Discussion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Student</label>
                <select value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright bg-white">
                  <option value="">Select student</option>
                  <option value="Arjun Mehta">Arjun Mehta</option>
                  <option value="Sneha Patel">Sneha Patel</option>
                  <option value="Karan Joshi">Karan Joshi</option>
                  <option value="Meera Nair">Meera Nair</option>
                  <option value="Rahul Verma">Rahul Verma</option>
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
                  <option value="30 min">30 minutes</option>
                  <option value="45 min">45 minutes</option>
                  <option value="60 min">60 minutes</option>
                </select>
              </div>
              <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                <Video size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Google Meet</p>
                  <p className="text-xs text-green-600">A unique Meet link will be auto-generated and shared with the student.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
              <button onClick={handleCreate} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Video size={14} /> Create & Generate Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
