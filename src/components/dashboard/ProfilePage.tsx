'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Mail, Phone, MapPin, Briefcase, Edit2, Save, X,
  Camera, CheckCircle, AlertCircle, Loader2, Shield, Calendar, Trash2, AtSign,
} from 'lucide-react'

type Profile = {
  id: string
  display_id: string | null
  full_name: string | null
  email: string | null
  role: string
  status: string
  phone: string | null
  address: string | null
  avatar_url: string | null
  bio: string | null
  username: string | null
  avatar_id: number | null
  created_at: string
  updated_at: string
}

const roleLabels: Record<string, string> = {
  admin: 'Admin', student: 'Student', client: 'Client',
  mentor: 'Mentor', employee: 'Employee', intern: 'Intern',
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  student: 'bg-[#35C8E0]/15 text-[#1A9AB5]',
  client: 'bg-purple-100 text-purple-700',
  mentor: 'bg-green-100 text-green-700',
  employee: 'bg-amber-100 text-amber-700',
  intern: 'bg-[#82C93D]/15 text-green-700',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    bio: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function fetchProfile() {
    setLoading(true)
    try {
      const res = await fetch('/api/profile')
      const { data } = await res.json()
      if (data) {
        setProfile(data)
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          bio: data.bio || '',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const { data, error } = await res.json()
      if (error) throw new Error(error)
      setProfile(data)
      setEditing(false)
      setToast({ type: 'success', message: 'Profile updated successfully!' })
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save profile.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleRemovePhoto() {
    setUploadingAvatar(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: null }),
      })
      const { error } = await res.json()
      if (error) throw new Error(error)
      setProfile(prev => prev ? { ...prev, avatar_url: null } : prev)
      setToast({ type: 'success', message: 'Profile photo removed.' })
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to remove photo.' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/profile/upload-avatar', { method: 'POST', body: fd })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      setProfile(prev => prev ? { ...prev, avatar_url: url } : prev)
      setToast({ type: 'success', message: 'Profile photo updated!' })
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Upload failed.' })
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function getInitials(name: string | null, email: string | null) {
    const base = (name && name.trim()) || email || 'U'
    return base.split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-24 text-foreground/40 font-semibold">
        Could not load profile. Please refresh.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-bold animate-in slide-in-from-right duration-300 ${
          toast.type === 'success'
            ? 'bg-white border border-[#1A9AB5] text-[#1A9AB5]'
            : 'bg-white border border-red-500 text-red-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        {/* Hero band — clean, no overlay text */}
        <div className="h-32 bg-gradient-to-br from-[#1A9AB5] via-[#35C8E0] to-[#82C93D] relative">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="px-6 sm:px-8 pb-8">
          {/* Avatar overlapping band; Edit button parked top-right */}
          <div className="flex items-start justify-between -mt-14 mb-2">
            <div className="relative w-24 h-24 flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Avatar'}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-3xl border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#1A9AB5] to-[#35C8E0] rounded-3xl border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-black">
                  {getInitials(profile.full_name, profile.email)}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-1 right-1 w-8 h-8 bg-[#1A9AB5] text-white rounded-xl flex items-center justify-center border-2 border-white hover:bg-[#1580A0] transition-colors disabled:opacity-50 shadow-sm"
                title="Change photo"
              >
                {uploadingAvatar ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Top-right action buttons */}
            <div className="flex gap-2 mt-16">
              {editing && profile.avatar_url && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 border border-red-200 hover:border-red-400 rounded-xl px-3 py-2 transition-colors disabled:opacity-40"
                  title="Remove profile photo"
                >
                  {uploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Remove photo
                </button>
              )}
              {editing ? (
                <>
                  <button
                    onClick={() => { setEditing(false); setForm({ full_name: profile.full_name || '', phone: profile.phone || '', address: profile.address || '', bio: profile.bio || '' }) }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest border border-border rounded-xl text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-[#1A9AB5] text-white rounded-xl hover:bg-[#1580A0] transition-colors disabled:opacity-60 shadow-sm"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-[#1A9AB5] text-[#1A9AB5] rounded-xl hover:bg-[#1A9AB5] hover:text-white transition-all shadow-sm"
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Name + handle + role badges — sits cleanly on white below avatar */}
          <div className="mb-6">
            {editing ? (
              <input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="text-2xl font-black text-foreground border-b-2 border-[#1A9AB5] bg-transparent focus:outline-none w-full max-w-md pb-1"
                placeholder="Full Name"
              />
            ) : (
              <h2 className="text-2xl font-black text-foreground leading-tight">
                {profile.full_name || <span className="italic text-foreground/40">Name not set</span>}
              </h2>
            )}
            {profile.username ? (
              <p className="text-sm font-mono font-semibold text-[#5B8E2A] mt-1">@{profile.username}</p>
            ) : (
              <p className="text-sm italic text-amber-600 mt-1">@username not set</p>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${roleColors[profile.role] || 'bg-gray-100 text-gray-600'}`}>
                {roleLabels[profile.role] || profile.role}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${profile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {profile.status}
              </span>
              {profile.display_id && (
                <span className="text-[11px] font-mono font-bold text-[#1A9AB5] bg-[#35C8E0]/10 border border-[#35C8E0]/30 rounded-md px-2 py-0.5">
                  {profile.display_id}
                </span>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCard icon={<AtSign size={15} />} label="Username" value={profile.username ? `@${profile.username}` : '—'} mono={!!profile.username} />
            <InfoCard icon={<Mail size={15} />} label="Email" value={profile.email} />
            <InfoCard
              icon={<Phone size={15} />}
              label="Phone"
              editing={editing}
              value={editing ? form.phone : (profile.phone || '—')}
              inputValue={form.phone}
              onInput={v => setForm(f => ({ ...f, phone: v }))}
              placeholder="+91 98765 43210"
            />
            <InfoCard
              icon={<Shield size={15} />}
              label="Role"
              value={roleLabels[profile.role] || profile.role}
            />
            <InfoCard
              icon={<MapPin size={15} />}
              label="Address"
              editing={editing}
              value={editing ? form.address : (profile.address || '—')}
              inputValue={form.address}
              onInput={v => setForm(f => ({ ...f, address: v }))}
              placeholder="City, state or full address"
              className="sm:col-span-2"
              wrapValue
            />
          </div>

          {/* Bio */}
          <div className="mt-6 pt-6 border-t border-border">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50 flex items-center gap-1.5 mb-3">
              <Briefcase size={12} /> Bio / About
            </label>
            {editing ? (
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={4}
                className="w-full border border-border focus:border-[#1A9AB5] focus:outline-none rounded-2xl px-4 py-3 text-sm font-medium text-foreground placeholder:text-foreground/30 resize-none transition-colors"
                placeholder="Tell us a bit about yourself..."
              />
            ) : (
              <p className="text-sm text-foreground/70 font-medium leading-relaxed">
                {profile.bio || <span className="text-foreground/30 italic">No bio added yet. Click Edit Profile to add one.</span>}
              </p>
            )}
          </div>

          {/* Footer meta */}
          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-semibold text-foreground/40">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={11} /> Joined {formatDate(profile.created_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Edit2 size={11} /> Updated {formatDate(profile.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  icon, label, value, editing, inputValue, onInput, placeholder, className = '', wrapValue = false, mono = false,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
  editing?: boolean
  inputValue?: string
  onInput?: (v: string) => void
  placeholder?: string
  className?: string
  wrapValue?: boolean
  mono?: boolean
}) {
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-2xl bg-off-white/60 border border-border/60 hover:border-[#35C8E0]/40 transition-colors ${className}`}>
      <span className="mt-0.5 text-[#1A9AB5] flex-shrink-0 w-7 h-7 rounded-lg bg-[#35C8E0]/15 flex items-center justify-center">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">{label}</p>
        {editing && onInput ? (
          <input
            value={inputValue || ''}
            onChange={e => onInput(e.target.value)}
            placeholder={placeholder}
            className="border-b border-[#1A9AB5] bg-transparent focus:outline-none text-sm font-semibold text-foreground w-full pb-0.5 placeholder:text-foreground/20"
          />
        ) : (
          <p className={`text-sm font-semibold text-foreground/80 ${mono ? 'font-mono text-[#5B8E2A]' : ''} ${wrapValue ? 'whitespace-pre-wrap break-words' : 'truncate'}`}>{value || '—'}</p>
        )}
      </div>
    </div>
  )
}
