'use client'

import { useEffect, useState } from 'react'
import { PageHeader, DashboardPanel } from '@/components/dashboard/DashboardUI'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Toast = { message: string; type: 'success' | 'error' }

export default function StudentSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
  })

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, bio')
        .eq('id', user.id)
        .single()

      setProfile({
        full_name: data?.full_name || '',
        email: user.email || '',
        phone: data?.phone || '',
        bio: data?.bio || '',
      })
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          bio: profile.bio,
        }),
      })
      if (res.ok) {
        showToast('Profile updated successfully!', 'success')
      } else {
        showToast('Failed to update profile.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwords.newPassword) {
      showToast('Please enter a new password.', 'error')
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('Passwords do not match.', 'error')
      return
    }
    if (passwords.newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error')
      return
    }
    setSavingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: passwords.newPassword })
      if (!error) {
        showToast('Password updated successfully!', 'success')
        setPasswords({ newPassword: '', confirmPassword: '' })
      } else {
        showToast(error.message || 'Failed to update password.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <PageHeader title="Settings" description="Manage your student account" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <DashboardPanel title="Profile">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-off-white text-foreground/50 cursor-not-allowed"
              />
              <p className="text-xs text-foreground/40 mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Bio</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] resize-none"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        </DashboardPanel>

        {/* Change Password */}
        <DashboardPanel title="Change Password">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Enter new password"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Confirm Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
              />
            </div>
            {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match.</p>
            )}
            <button
              onClick={handleUpdatePassword}
              disabled={savingPassword}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Update Password
            </button>
          </div>
        </DashboardPanel>
      </div>
    </div>
  )
}
