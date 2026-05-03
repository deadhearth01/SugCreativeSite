'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  UserCheck, Users, Search, Plus, X, Loader2, ChevronRight, Trash2,
  GraduationCap, Briefcase, UserPlus2, ArrowLeft, Check,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  full_name: string | null
  username: string | null
  email: string
  role: string
  avatar_url: string | null
}

type Assignment = {
  id: string
  mentor_id: string
  mentee_id: string
  assigned_at: string
  notes: string | null
  mentor: Profile | null
  mentee: Profile | null
}

const initials = (name: string | null, email: string) => {
  const base = (name && name.trim()) || email
  return base.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function Handle({ username, className = '' }: { username: string | null; className?: string }) {
  if (username) return <span className={`font-mono text-[#5B8E2A] ${className}`}>@{username}</span>
  return <span className={`italic text-amber-600 ${className}`}>@username not set</span>
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-md text-sm font-bold text-white rounded-xl ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function MentorMappingPage() {
  const [mentors, setMentors] = useState<Profile[]>([])
  const [mentees, setMentees] = useState<Profile[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerRole, setPickerRole] = useState<'all' | 'intern' | 'student'>('all')
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const load = async () => {
    setLoading(true)
    const supabase = createClient()

    const [mentorRes, menteeRes, assignRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, username, email, role, avatar_url')
        .eq('role', 'mentor')
        .order('full_name'),
      supabase
        .from('profiles')
        .select('id, full_name, username, email, role, avatar_url')
        .in('role', ['intern', 'student'])
        .order('full_name'),
      fetch('/api/admin/mentor-assignments').then(r => r.json()),
    ])

    setMentors(mentorRes.data || [])
    setMentees(menteeRes.data || [])
    setAssignments(assignRes.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Auto-select first mentor when mentors load and nothing selected
  useEffect(() => {
    if (!selectedMentorId && mentors.length > 0) setSelectedMentorId(mentors[0].id)
  }, [mentors, selectedMentorId])

  const menteeCountByMentor = useMemo(() => {
    const m = new Map<string, number>()
    for (const a of assignments) m.set(a.mentor_id, (m.get(a.mentor_id) || 0) + 1)
    return m
  }, [assignments])

  const selectedMentor = mentors.find(m => m.id === selectedMentorId) || null
  const assignedMentees = assignments.filter(a => a.mentor_id === selectedMentorId)
  const assignedMenteeIds = new Set(assignments.map(a => a.mentee_id))

  // List of mentees available to assign (not already assigned to anyone)
  const unassignedMentees = mentees.filter(m => !assignedMenteeIds.has(m.id))

  const filteredMentors = mentors.filter(m => {
    const q = search.toLowerCase()
    if (!q) return true
    return (m.full_name || '').toLowerCase().includes(q)
      || (m.username || '').toLowerCase().includes(q)
      || m.email.toLowerCase().includes(q)
  })

  const filteredPicker = unassignedMentees.filter(m => {
    if (pickerRole !== 'all' && m.role !== pickerRole) return false
    const q = pickerSearch.toLowerCase()
    if (!q) return true
    return (m.full_name || '').toLowerCase().includes(q)
      || (m.username || '').toLowerCase().includes(q)
      || m.email.toLowerCase().includes(q)
  })

  const togglePick = (id: string) => {
    setPickerSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleAssignBatch = async () => {
    if (!selectedMentorId || pickerSelected.size === 0) return
    setBusy(true)
    const ids = Array.from(pickerSelected)
    const results = await Promise.all(
      ids.map(menteeId =>
        fetch('/api/admin/mentor-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mentor_id: selectedMentorId, mentee_id: menteeId }),
        }).then(r => r.ok)
      )
    )
    const ok = results.filter(Boolean).length
    const fail = results.length - ok

    if (ok > 0) {
      showToast(
        fail === 0
          ? `${ok} mentee${ok > 1 ? 's' : ''} assigned`
          : `${ok} assigned, ${fail} failed`,
        fail === 0 ? 'success' : 'error'
      )
      await load()
    } else {
      showToast('Failed to assign mentees', 'error')
    }
    setPickerSelected(new Set())
    setShowPicker(false)
    setBusy(false)
  }

  const openPicker = () => {
    setPickerSelected(new Set())
    setPickerSearch('')
    setPickerRole('all')
    setShowPicker(true)
  }

  const handleUnassign = async (menteeId: string, menteeLabel: string) => {
    if (!confirm(`Remove ${menteeLabel} from this mentor?`)) return
    setBusy(true)
    const res = await fetch(`/api/admin/mentor-assignments?mentee_id=${menteeId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Mentee removed', 'success')
      await load()
    } else {
      const { error } = await res.json()
      showToast(error || 'Failed to remove', 'error')
    }
    setBusy(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary" /></div>
  }

  return (
    <div>
      <PageHeader
        title="Mentor Mapping"
        description="Assign interns and students to mentors. One mentor per mentee."
        action={
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-foreground/60 font-semibold">
              <UserCheck size={14} className="text-[#1A9AB5]" /> {mentors.length} mentors
            </div>
            <div className="flex items-center gap-1.5 text-foreground/60 font-semibold">
              <Users size={14} className="text-[#82C93D]" /> {assignments.length} mapped · {unassignedMentees.length} unmapped
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* ─── Mentor List ─────────────────────────────────────────── */}
        <aside className="bg-white border border-border rounded-2xl shadow-sm flex flex-col max-h-[calc(100vh-180px)] overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-2">Mentors</div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mentors..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-off-white border border-border rounded-lg focus:outline-none focus:border-[#35C8E0]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredMentors.length === 0 ? (
              <div className="p-8 text-center text-sm text-foreground/40">No mentors found</div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredMentors.map(m => {
                  const count = menteeCountByMentor.get(m.id) || 0
                  const active = m.id === selectedMentorId
                  return (
                    <li key={m.id}>
                      <button
                        onClick={() => setSelectedMentorId(m.id)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          active ? 'bg-[#35C8E0]/15 border-l-4 border-[#1A9AB5]' : 'hover:bg-off-white border-l-4 border-transparent'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${active ? 'bg-[#1A9AB5] text-white' : 'bg-[#35C8E0]/20 text-[#1A9AB5]'}`}>
                          {m.avatar_url ? (
                            <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold">{initials(m.full_name, m.email)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate ${active ? 'text-[#1A9AB5]' : 'text-foreground/80'}`}>
                            {m.full_name || <span className="italic text-foreground/50">No name yet</span>}
                          </p>
                          <p className="text-[11px] truncate"><Handle username={m.username} /></p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            count === 0 ? 'bg-foreground/10 text-foreground/50'
                            : active ? 'bg-[#1A9AB5] text-white'
                            : 'bg-[#82C93D]/20 text-[#5B8E2A]'
                          }`}>
                            {count} {count === 1 ? 'mentee' : 'mentees'}
                          </span>
                          {active && <ChevronRight size={14} className="text-[#1A9AB5]" />}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ─── Detail Panel ────────────────────────────────────────── */}
        <section className="bg-white border border-border rounded-2xl shadow-sm">
          {!selectedMentor ? (
            <div className="p-16 text-center">
              <UserCheck size={56} className="mx-auto text-foreground/15 mb-3" />
              <p className="text-foreground/40 text-sm font-semibold">Select a mentor to manage their mentees</p>
            </div>
          ) : (
            <>
              {/* Mentor header */}
              <div className="p-6 border-b border-border bg-gradient-to-r from-[#35C8E0]/15 to-[#82C93D]/10 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedMentorId(null)}
                    className="lg:hidden p-2 rounded-lg hover:bg-white/60 transition-colors"
                    title="Back"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-16 h-16 rounded-2xl bg-[#1A9AB5] text-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                    {selectedMentor.avatar_url ? (
                      <img src={selectedMentor.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-black">{initials(selectedMentor.full_name, selectedMentor.email)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-heading font-bold text-primary truncate">
                      {selectedMentor.full_name || <span className="italic text-foreground/50">Name not set</span>}
                    </h2>
                    <p className="text-xs truncate"><Handle username={selectedMentor.username} /></p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-green-100 text-green-700">Mentor</span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#1A9AB5]/15 text-[#1A9AB5]">
                        {assignedMentees.length} {assignedMentees.length === 1 ? 'mentee' : 'mentees'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openPicker()}
                    className="bg-[#1A9AB5] hover:bg-[#158da5] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors flex-shrink-0 shadow-sm"
                  >
                    <UserPlus2 size={15} /> Assign Mentee
                  </button>
                </div>
              </div>

              {/* Mentees grid */}
              <div className="p-6">
                {assignedMentees.length === 0 ? (
                  <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
                    <Users size={40} className="mx-auto text-foreground/20 mb-3" />
                    <p className="text-foreground/50 text-sm font-semibold">No mentees assigned yet</p>
                    <p className="text-foreground/40 text-xs mt-1 mb-4">Click <span className="font-bold">Assign Mentee</span> to map an intern or student.</p>
                    <button
                      onClick={() => openPicker()}
                      className="text-sm font-semibold text-[#1A9AB5] hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={14} /> Assign someone now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {assignedMentees.map(a => {
                      const mentee = a.mentee
                      if (!mentee) return null
                      const RoleIcon = mentee.role === 'intern' ? Briefcase : GraduationCap
                      const roleColor = mentee.role === 'intern' ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'
                      return (
                        <div key={a.id} className="group relative border border-border rounded-xl p-4 hover:shadow-md hover:border-[#1A9AB5] transition-all bg-white">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-[#82C93D]/15 text-[#5B8E2A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {mentee.avatar_url ? (
                                <img src={mentee.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold">{initials(mentee.full_name, mentee.email)}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-foreground/80 truncate">
                                {mentee.full_name || <span className="italic text-foreground/40">No name yet</span>}
                              </p>
                              <p className="text-[11px] truncate"><Handle username={mentee.username} /></p>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md ${roleColor}`}>
                                  <RoleIcon size={9} />
                                  {mentee.role}
                                </span>
                                <span className="text-[10px] text-foreground/40">
                                  since {new Date(a.assigned_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnassign(mentee.id, mentee.full_name || (mentee.username ? `@${mentee.username}` : 'this mentee'))}
                              disabled={busy}
                              className="opacity-0 group-hover:opacity-100 text-foreground/40 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all flex-shrink-0"
                              title="Remove mentee"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* ─── Assign Mentee Picker Modal ────────────────────────────── */}
      {showPicker && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
              <div>
                <h3 className="text-base font-heading font-bold text-primary">Assign Mentee</h3>
                <p className="text-xs text-foreground/50 mt-0.5">
                  Pick an unassigned intern or student for{' '}
                  <span className="font-semibold text-[#1A9AB5]">{selectedMentor.full_name || (selectedMentor.username ? `@${selectedMentor.username}` : 'this mentor')}</span>
                </p>
              </div>
              <button onClick={() => setShowPicker(false)} className="p-1.5 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-3 flex-shrink-0 border-b border-border">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  autoFocus
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search by name or username..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-[#35C8E0]"
                />
              </div>
              <div className="flex gap-1.5">
                {(['all', 'intern', 'student'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setPickerRole(r)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border transition-colors ${
                      pickerRole === r
                        ? 'bg-[#1A9AB5] text-white border-[#1A9AB5]'
                        : 'bg-white text-foreground/60 border-border hover:border-[#1A9AB5]'
                    }`}
                  >
                    {r === 'all' ? `All (${unassignedMentees.length})` : r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {filteredPicker.length === 0 ? (
                <div className="p-12 text-center text-sm text-foreground/40">
                  {unassignedMentees.length === 0
                    ? 'Every intern and student already has a mentor.'
                    : 'No matches for your search.'}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-2 pb-2">
                    <p className="text-[11px] text-foreground/50 font-semibold">
                      {filteredPicker.length} available · {pickerSelected.size} selected
                    </p>
                    {pickerSelected.size > 0 ? (
                      <button
                        onClick={() => setPickerSelected(new Set())}
                        className="text-[11px] text-foreground/50 hover:text-red-500 font-semibold"
                      >
                        Clear
                      </button>
                    ) : (
                      <button
                        onClick={() => setPickerSelected(new Set(filteredPicker.map(m => m.id)))}
                        className="text-[11px] text-[#1A9AB5] hover:underline font-semibold"
                      >
                        Select all
                      </button>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {filteredPicker.map(m => {
                      const RoleIcon = m.role === 'intern' ? Briefcase : GraduationCap
                      const checked = pickerSelected.has(m.id)
                      return (
                        <li key={m.id}>
                          <button
                            onClick={() => togglePick(m.id)}
                            disabled={busy}
                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors disabled:opacity-50 border ${
                              checked
                                ? 'bg-[#35C8E0]/15 border-[#1A9AB5]/40'
                                : 'border-transparent hover:bg-[#35C8E0]/10 hover:border-border'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              checked ? 'bg-[#1A9AB5] border-[#1A9AB5]' : 'border-border bg-white'
                            }`}>
                              {checked && <Check size={12} className="text-white" />}
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-[#82C93D]/15 text-[#5B8E2A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {m.avatar_url ? (
                                <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold">{initials(m.full_name, m.email)}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground/80 truncate">
                                {m.full_name || <span className="italic text-foreground/40">No name yet</span>}
                              </p>
                              <p className="text-[11px] truncate"><Handle username={m.username} /></p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/60 flex-shrink-0">
                              <RoleIcon size={9} />
                              {m.role}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-4 border-t border-border flex-shrink-0">
              <p className="text-xs text-foreground/60 font-semibold">
                {pickerSelected.size > 0 && `${pickerSelected.size} selected`}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowPicker(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleAssignBatch}
                  disabled={busy || pickerSelected.size === 0}
                  className="bg-[#1A9AB5] hover:bg-[#158da5] text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Assign{pickerSelected.size > 0 ? ` ${pickerSelected.size}` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
