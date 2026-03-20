'use client'

import { useState, useEffect } from 'react'
import { PageHeader, DashboardPanel } from '@/components/dashboard/DashboardUI'
import { Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  full_name: string
  email: string
  phone: string | null
  bio: string | null
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function InternSettingsPage() {
  const [profile, setProfile] = useState<Profile>({ full_name: '', email: '', phone: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [passwords, setPasswords] = useState({ new_password: '', confirm: '' })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('full_name, email, phone, bio').eq('id', user.id).single()
      if (data) setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: profile.full_name, phone: profile.phone, bio: profile.bio }),
      })
      if (res.ok) setToast({ message: 'Profile saved', type: 'success' })
      else { const { error } = await res.json(); setToast({ message: error || 'Failed to save profile', type: 'error' }) }
    } finally { setSavingProfile(false) }
  }

  const handleUpdatePassword = async () => {
    if (!passwords.new_password || passwords.new_password !== passwords.confirm) {
      setToast({ message: 'Passwords do not match', type: 'error' }); return
    }
    if (passwords.new_password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' }); return
    }
    setSavingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: passwords.new_password })
      if (error) setToast({ message: error.message, type: 'error' })
      else {
        setToast({ message: 'Password updated', type: 'success' })
        setPasswords({ new_password: '', confirm: '' })
      }
    } finally { setSavingPassword(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-primary-bright" /></div>

  return (
    <div>
      <PageHeader title="Settings" description="Manage your intern account and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="Profile Settings">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Email</label>
              <input
                type="email"
                value={profile.email || ''}
                disabled
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-off-white text-foreground/50 cursor-not-allowed"
              />
              <p className="text-xs text-foreground/40 mt-1">Email cannot be changed here</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Phone</label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright resize-none"
                rows={3}
                placeholder="Brief bio..."
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingProfile && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Security">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">New Password</label>
              <input
                type="password"
                value={passwords.new_password}
                onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright"
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              disabled={savingPassword}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingPassword && <Loader2 size={14} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </DashboardPanel>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
