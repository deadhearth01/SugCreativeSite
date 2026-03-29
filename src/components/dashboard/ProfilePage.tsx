'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  User, Mail, Phone, MapPin, Briefcase, Edit2, Save, X,
  Camera, CheckCircle, AlertCircle, Loader2, Shield, Calendar, Trash2, AtSign,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: string
  status: string
  phone: string | null
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
      const { data, error } = await res.json()
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

  function getInitials(name: string | null) {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3.5 border-2 shadow-[4px_4px_0px_rgba(0,0,0,0.12)] text-sm font-bold animate-in slide-in-from-right duration-300 ${
          toast.type === 'success'
            ? 'bg-white border-[#1A9AB5] text-[#1A9AB5]'
            : 'bg-white border-red-500 text-red-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white border-2 border-black/8 shadow-[4px_4px_0px_rgba(0,0,0,0.06)]">
        {/* Header band */}
        <div className="h-24 bg-gradient-to-r from-[#1A9AB5] to-[#35C8E0] relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        <div className="px-6 sm:px-8 pb-8">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 mb-6">
            <div className="relative w-20 h-20 flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Avatar'}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover border-4 border-white shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                />
              ) : (
                <div className="w-20 h-20 bg-[#1A9AB5] border-4 border-white shadow-[2px_2px_0px_rgba(0,0,0,0.1)] flex items-center justify-center text-white text-2xl font-black">
                  {getInitials(profile.full_name)}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-7 h-7 bg-[#1A9AB5] text-white flex items-center justify-center border-2 border-white hover:bg-[#1580A0] transition-colors disabled:opacity-50"
                title="Change photo"
              >
                {uploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Remove photo — only in edit mode when a photo exists */}
            {editing && profile.avatar_url && (
              <button
                onClick={handleRemovePhoto}
                disabled={uploadingAvatar}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 transition-colors disabled:opacity-40 self-end sm:self-auto"
                title="Remove profile photo"
              >
                {uploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Remove photo
              </button>
            )}

            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => { setEditing(false); setForm({ full_name: profile.full_name || '', phone: profile.phone || '', bio: profile.bio || '' }) }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-black/10 text-foreground/50 hover:text-foreground hover:border-black/20 transition-colors"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-[#1A9AB5] text-white border-2 border-[#1A9AB5] hover:bg-[#1580A0] transition-colors disabled:opacity-60 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-[#1A9AB5] text-[#1A9AB5] hover:bg-[#1A9AB5] hover:text-white transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Name + role */}
          <div className="mb-6">
            {editing ? (
              <input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="text-2xl font-black text-foreground border-b-2 border-[#1A9AB5] bg-transparent focus:outline-none w-full max-w-sm pb-1"
                placeholder="Full Name"
              />
            ) : (
              <h2 className="text-2xl font-black text-foreground">{profile.full_name || 'Unknown User'}</h2>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 border ${roleColors[profile.role] || 'bg-gray-100 text-gray-600'}`}>
                {roleLabels[profile.role] || profile.role}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 ${profile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {profile.status}
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoRow icon={<AtSign size={15} />} label="Username" value={profile.username ? `@${profile.username}` : '—'} />
            <InfoRow icon={<Mail size={15} />} label="Email" value={profile.email} />
            <InfoRow
              icon={<Phone size={15} />}
              label="Phone"
              editing={editing}
              value={editing ? form.phone : (profile.phone || '—')}
              inputValue={form.phone}
              onInput={v => setForm(f => ({ ...f, phone: v }))}
              placeholder="+91 98765 43210"
            />
            <InfoRow icon={<Shield size={15} />} label="Role" value={roleLabels[profile.role] || profile.role} />
            <InfoRow icon={<Calendar size={15} />} label="Member Since" value={formatDate(profile.created_at)} />
          </div>

          {/* Bio */}
          <div className="mt-6 pt-6 border-t border-black/8">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2 mb-3">
              <Briefcase size={13} /> Bio / About
            </label>
            {editing ? (
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={4}
                className="w-full border-2 border-black/10 focus:border-[#1A9AB5] focus:outline-none px-4 py-3 text-sm font-medium text-foreground placeholder:text-foreground/30 resize-none"
                placeholder="Tell us a bit about yourself..."
              />
            ) : (
              <p className="text-sm text-foreground/70 font-medium leading-relaxed">
                {profile.bio || <span className="text-foreground/30 italic">No bio added yet. Click Edit Profile to add one.</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white border-2 border-black/8 shadow-[4px_4px_0px_rgba(0,0,0,0.06)] p-6 sm:p-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-5 flex items-center gap-2">
          <Shield size={13} /> Account Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/30 mb-1">User ID</p>
            <p className="font-mono text-xs text-foreground/60 break-all">{profile.id}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/30 mb-1">Last Updated</p>
            <p className="font-semibold text-foreground/60">{formatDate(profile.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon, label, value, editing, inputValue, onInput, placeholder,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
  editing?: boolean
  inputValue?: string
  onInput?: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[#1A9AB5] flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-0.5">{label}</p>
        {editing && onInput ? (
          <input
            value={inputValue || ''}
            onChange={e => onInput(e.target.value)}
            placeholder={placeholder}
            className="border-b-2 border-[#1A9AB5] bg-transparent focus:outline-none text-sm font-semibold text-foreground w-full pb-0.5 placeholder:text-foreground/20"
          />
        ) : (
          <p className="text-sm font-semibold text-foreground/80 truncate">{value || '—'}</p>
        )}
      </div>
    </div>
  )
}
