'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Filter, X, Eye, EyeOff, Ban, Trash2,
  Edit, ChevronLeft, ChevronRight, UserPlus, RefreshCw, Copy, Check, Shuffle, Loader2,
  MoreVertical, User, KeyRound, Activity, Lock, ShieldOff, Shield, Mail, Phone, Calendar,
  Tag, Plus, Users, UserCheck, ShieldCheck, Layers, ExternalLink
} from 'lucide-react'
import { PageHeader, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'
import { createPortal } from 'react-dom'

type Profile = {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'student' | 'client' | 'mentor' | 'employee' | 'intern'
  status: 'active' | 'pending' | 'banned' | 'inactive'
  phone: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  student: 'bg-blue-100 text-blue-700',
  client: 'bg-purple-100 text-purple-700',
  mentor: 'bg-green-100 text-green-700',
  employee: 'bg-amber-100 text-amber-700',
  intern: 'bg-cyan-100 text-cyan-700',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin', student: 'Student', client: 'Client',
  mentor: 'Mentor', employee: 'Employee', intern: 'Intern',
}

// Suggested tags pool for chip picker
const SUGGESTED_TAGS = [
  'batch-2025', 'batch-2026', 'premium', 'trial', 'vip', 'scholarship',
  'full-time', 'part-time', 'remote', 'on-site', 'probation',
  'high-priority', 'new-joinee', 'alumni',
]

function generatePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const nums = '23456789'
  const special = '@#$%&*!'
  const all = upper + lower + nums + special
  let pw = ''
  pw += upper[Math.floor(Math.random() * upper.length)]
  pw += lower[Math.floor(Math.random() * lower.length)]
  pw += nums[Math.floor(Math.random() * nums.length)]
  pw += special[Math.floor(Math.random() * special.length)]
  for (let i = 4; i < 14; i++) pw += all[Math.floor(Math.random() * all.length)]
  return pw.split('').sort(() => Math.random() - 0.5).join('')
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Tag Chip Selector Component ───────────────────────────────────────────
function TagChipSelector({
  selectedTags,
  onChange,
}: {
  selectedTags: string[]
  onChange: (tags: string[]) => void
}) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const allTags = Array.from(new Set([...SUGGESTED_TAGS, ...selectedTags]))
  const filteredSuggestions = allTags.filter(
    t => t.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.includes(t)
  )

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, '-')
    if (!clean || selectedTags.includes(clean)) return
    onChange([...selectedTags, clean])
    setInputValue('')
  }

  const removeTag = (tag: string) => {
    onChange(selectedTags.filter(t => t !== tag))
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    }
    if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1])
    }
  }

  return (
    <div>
      <div
        className="min-h-[42px] w-full border border-border rounded-lg px-3 py-2 flex flex-wrap gap-1.5 cursor-text focus-within:border-[#35C8E0] transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-[#35C8E0]/20 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
          >
            <Tag size={10} />
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              className="ml-0.5 hover:text-red-500 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={selectedTags.length === 0 ? 'Type or pick tags…' : ''}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent placeholder:text-foreground/30"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(inputValue ? filteredSuggestions : allTags.filter(t => !selectedTags.includes(t))).slice(0, 10).map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-dashed border-primary/30 text-foreground/60 hover:border-primary hover:text-primary transition-colors"
          >
            <Plus size={9} />
            {tag}
          </button>
        ))}
        {inputValue && !allTags.includes(inputValue.trim().toLowerCase()) && (
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#35C8E0]/10 border border-primary/40 text-primary hover:bg-[#35C8E0]/20 transition-colors"
          >
            <Plus size={9} />
            Create &quot;{inputValue.trim()}&quot;
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Row kebab (3-dot) menu ──────────────────────────────────────────────────
function UserActionsMenu({
  user,
  onEdit,
  onViewDetails,
  onViewProfile,
  onViewCredentials,
  onViewActivity,
  onUpdatePassword,
  onBan,
  onDelete,
}: {
  user: Profile
  onEdit: () => void
  onViewDetails: () => void
  onViewProfile: () => void
  onViewCredentials: () => void
  onViewActivity: () => void
  onUpdatePassword: () => void
  onBan: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, openUp: false })
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const isAdmin = user.role === 'admin'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggleMenu = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const openUp = spaceBelow < 380
      setMenuPosition({
        top: openUp ? rect.top - 8 : rect.bottom + 4,
        left: rect.right - 208, // 208 = menu width (w-52 = 13rem = 208px)
        openUp
      })
    }
    setOpen(v => !v)
  }

  const item = (icon: React.ReactNode, label: string, action: () => void, danger?: boolean, disabled?: boolean) => (
    <button
      key={label}
      onClick={() => { if (!disabled) { action(); setOpen(false) } }}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors text-left
        ${disabled ? 'opacity-40 cursor-not-allowed text-foreground/40'
          : danger ? 'text-red-600 hover:bg-red-50'
          : 'text-foreground/70 hover:bg-off-white hover:text-primary'}`}
    >
      {icon}
      {label}
    </button>
  )

  const menuContent = (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: menuPosition.openUp ? 'auto' : menuPosition.top,
        bottom: menuPosition.openUp ? window.innerHeight - menuPosition.top : 'auto',
        left: menuPosition.left,
        zIndex: 9999,
      }}
      className="w-52 bg-white border border-border rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95"
    >
      <div className="px-3 pt-1 pb-2 border-b border-border/60 mb-1">
        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Quick Actions</p>
      </div>
      {item(<ExternalLink size={14} />, 'View Details', onViewDetails)}
      {item(<Edit size={14} />, 'Edit User', onEdit)}
      <div className="border-t border-border/60 my-1" />
      <div className="px-3 pt-1 pb-0.5">
        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Info</p>
      </div>
      {item(<User size={14} />, 'View Profile', onViewProfile)}
      {item(<KeyRound size={14} />, 'View Credentials', onViewCredentials)}
      {item(<Activity size={14} />, 'View Activity Log', onViewActivity)}
      {item(<Lock size={14} />, 'Update Password', onUpdatePassword)}
      <div className="border-t border-border/60 my-1" />
      <div className="px-3 pt-1 pb-0.5">
        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Security</p>
      </div>
      {isAdmin
        ? item(<ShieldOff size={14} />, 'Cannot ban admin', () => {}, false, true)
        : user.status === 'banned'
          ? item(<Shield size={14} />, 'Unban User', onBan)
          : item(<ShieldOff size={14} />, 'Ban User', onBan)
      }
      <div className="border-t border-border/60 my-1" />
      {isAdmin
        ? item(<Trash2 size={14} />, 'Cannot delete admin', () => {}, false, true)
        : item(<Trash2 size={14} />, 'Delete User', onDelete, true)
      }
    </div>
  )

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={toggleMenu}
        className="p-1.5 rounded-lg hover:bg-[#35C8E0]/20 text-foreground/40 hover:text-primary transition-colors"
        title="More options"
      >
        <MoreVertical size={15} />
      </button>
      {open && mounted && createPortal(menuContent, document.body)}
    </div>
  )
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const perPage = 8

  // Extra modals
  const [viewProfileUser, setViewProfileUser] = useState<Profile | null>(null)
  const [viewCredentialsUser, setViewCredentialsUser] = useState<Profile | null>(null)
  const [viewActivityUser, setViewActivityUser] = useState<Profile | null>(null)
  const [updatePasswordUser, setUpdatePasswordUser] = useState<Profile | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'roles'>('all')

  const [formData, setFormData] = useState({
    name: '', email: '', role: 'student', phone: '', password: '', tags: [] as string[]
  })

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Fetch users from Supabase
  const loadUsers = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setToast({ type: 'error', message: error.message })
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  // Filter & paginate
  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.tags || []).some(t => t.toLowerCase().includes(q))
    const matchRole = filterRole === 'all' || u.role === filterRole
    const matchStatus = filterStatus === 'all' || u.status === filterStatus
    return matchSearch && matchRole && matchStatus
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // Signup requests: users with status 'pending'
  const signupRequests = users.filter(u => u.status === 'pending')

  // Role stats
  const roleStats = Object.keys(roleLabels).map(r => ({
    role: r,
    label: roleLabels[r],
    count: users.filter(u => u.role === r).length,
    color: roleColors[r],
  }))

  // ─── Create User (via API route → auth.admin.createUser) ───
  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setToast({ type: 'error', message: 'Name, email and password are required' })
      return
    }
    setActionLoading(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        role: formData.role,
        phone: formData.phone,
        tags: formData.tags,
      }),
    })
    const result = await res.json()
    if (res.ok) {
      setToast({ type: 'success', message: `User "${formData.name}" created successfully` })
      setShowCreateModal(false)
      setFormData({ name: '', email: '', role: 'student', phone: '', password: '', tags: [] })
      await loadUsers()
    } else {
      setToast({ type: 'error', message: result.error || 'Failed to create user' })
    }
    setActionLoading(false)
  }

  // ─── Update User (via API route → auth.admin.updateUserById + profile) ───
  const handleUpdateUser = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    const body: Record<string, unknown> = {
      full_name: formData.name,
      email: formData.email,
      role: formData.role,
      phone: formData.phone,
      tags: formData.tags,
    }
    if (formData.password) body.password = formData.password

    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const result = await res.json()
    if (res.ok) {
      setToast({ type: 'success', message: `User "${formData.name}" updated` })
      setSelectedUser(null)
      await loadUsers()
    } else {
      setToast({ type: 'error', message: result.error || 'Failed to update user' })
    }
    setActionLoading(false)
  }

  // ─── Ban / Unban — admin is protected ───────────────────────────────────────
  const handleBanUser = async (id: string) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    if (user.role === 'admin') {
      setToast({ type: 'error', message: 'Admin accounts cannot be banned.' })
      return
    }
    const newStatus = user.status === 'banned' ? 'active' : 'banned'
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id)
    if (error) {
      setToast({ type: 'error', message: error.message })
    } else {
      setToast({ type: 'success', message: `User ${newStatus === 'banned' ? 'banned' : 'unbanned'}` })
      await loadUsers()
    }
  }

  // ─── Approve / Reject signup request ──────────────────────────────────────
  const handleApproveUser = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', id)
    if (error) {
      setToast({ type: 'error', message: error.message })
    } else {
      setToast({ type: 'success', message: 'User approved successfully' })
      await loadUsers()
    }
  }

  const handleRejectUser = async (id: string) => {
    setActionLoading(true)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    const result = await res.json()
    if (res.ok) {
      setToast({ type: 'success', message: 'Signup request rejected and user removed' })
      await loadUsers()
    } else {
      setToast({ type: 'error', message: result.error || 'Failed to reject user' })
    }
    setActionLoading(false)
  }

  // ─── Update Password (standalone) ───────────────────────────────────────────
  const handleUpdatePassword = async () => {    if (!updatePasswordUser || !newPassword) return
    setActionLoading(true)
    const res = await fetch(`/api/admin/users/${updatePasswordUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    })
    const result = await res.json()
    if (res.ok) {
      setToast({ type: 'success', message: 'Password updated successfully' })
      setUpdatePasswordUser(null)
      setNewPassword('')
    } else {
      setToast({ type: 'error', message: result.error || 'Failed to update password' })
    }
    setActionLoading(false)
  }

  // ─── Delete User (via API route → auth.admin.deleteUser) ───
  const handleDeleteUser = async (id: string) => {
    const user = users.find(u => u.id === id)
    if (user?.role === 'admin') {
      setToast({ type: 'error', message: 'Admin accounts cannot be deleted' })
      setShowDeleteConfirm(null)
      return
    }
    setActionLoading(true)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    const result = await res.json()
    if (res.ok) {
      setToast({ type: 'success', message: 'User deleted permanently' })
      setShowDeleteConfirm(null)
      await loadUsers()
    } else {
      setToast({ type: 'error', message: result.error || 'Failed to delete user' })
    }
    setActionLoading(false)
  }

  const openEdit = (user: Profile) => {
    setSelectedUser(user)
    setFormData({
      name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      password: '',
      tags: user.tags || [],
    })
    setShowPassword(false)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      <PageHeader
        title="User Management"
        description="Create, edit, ban, remove, and manage all platform users"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              className="p-2.5 rounded-lg border border-border hover:bg-off-white transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                setShowCreateModal(true)
                setFormData({ name: '', email: '', role: 'student', phone: '', password: generatePassword(), tags: [] })
                setShowPassword(true)
              }}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <UserPlus size={16} />
              Add User
            </button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 bg-white border border-border rounded-xl p-1">
        {([
          { key: 'all' as const, label: 'All Users', icon: <Users size={15} />, count: users.length },
          { key: 'requests' as const, label: 'Signup Requests', icon: <UserCheck size={15} />, count: signupRequests.length },
          { key: 'roles' as const, label: 'Role Categories', icon: <Layers size={15} /> },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex-1 justify-center ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground/50 hover:text-primary hover:bg-off-white'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-[#35C8E0]/20 text-primary'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ Tab: All Users ═══ */}
      {activeTab === 'all' && (<>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {['all', 'admin', 'student', 'client', 'mentor', 'employee', 'intern'].map((role) => {
          const count = role === 'all' ? users.length : users.filter(u => u.role === role).length
          return (
            <button
              key={role}
              onClick={() => { setFilterRole(role); setPage(1) }}
              className={`p-3 rounded-xl border text-center transition-all ${
                filterRole === role
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-border hover:border-[#35C8E0]'
              }`}
            >
              <div className={`text-xl font-bold ${filterRole === role ? 'text-white' : 'text-primary'}`}>{count}</div>
              <div className={`text-xs font-medium ${filterRole === role ? 'text-white/80' : 'text-foreground/50'}`}>
                {role === 'all' ? 'Total' : roleLabels[role] + 's'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by name, email, or tag..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-[#35C8E0]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-foreground/40" />
          {['all', 'active', 'pending', 'inactive', 'banned'].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-off-white text-foreground/60 hover:text-primary'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-border rounded-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#1A9AB5]" />
            <span className="ml-2 text-sm text-foreground/50">Loading users...</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20 text-foreground/50 text-sm">
            {users.length === 0 ? 'No users found. Create your first user above.' : 'No users match the current filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-off-white/50">
                  <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider hidden md:table-cell">Tags</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground/60 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/dashboard/admin/users/${u.id}`)}
                    className="border-b border-border/50 last:border-0 hover:bg-off-white/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#35C8E0]/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                          {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-primary truncate">{u.full_name}</p>
                          <div className="flex items-center gap-1">
                            <p className="text-xs text-foreground/50 truncate">{u.email}</p>
                            <button
                              onClick={() => copyToClipboard(u.email, u.id)}
                              className="flex-shrink-0 text-foreground/30 hover:text-primary"
                              title="Copy email"
                            >
                              {copiedId === u.id ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-md ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(u.tags || []).length > 0 ? u.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] bg-[#35C8E0]/10 text-primary px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                            <Tag size={8} />
                            {tag}
                          </span>
                        )) : (
                          <span className="text-xs text-foreground/30">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={u.status} /></td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="text-xs text-foreground/50">{timeAgo(u.created_at)}</span>
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <UserActionsMenu
                        user={u}
                        onEdit={() => openEdit(u)}
                        onViewDetails={() => router.push(`/dashboard/admin/users/${u.id}`)}
                        onViewProfile={() => setViewProfileUser(u)}
                        onViewCredentials={() => setViewCredentialsUser(u)}
                        onViewActivity={() => setViewActivityUser(u)}
                        onUpdatePassword={() => { setUpdatePasswordUser(u); setNewPassword(''); setShowNewPassword(false) }}
                        onBan={() => handleBanUser(u.id)}
                        onDelete={() => setShowDeleteConfirm(u.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-foreground/50">
              Showing {Math.min(((page - 1) * perPage) + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} users
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-off-white disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    page === i + 1 ? 'bg-primary text-white' : 'hover:bg-off-white text-foreground/60'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-off-white disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      </>)}

      {/* ═══ Tab: Signup Requests ═══ */}
      {activeTab === 'requests' && (
        <div>
          {signupRequests.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                <UserCheck size={28} className="text-green-500" />
              </div>
              <h3 className="text-lg font-heading font-bold text-primary mb-1">All caught up!</h3>
              <p className="text-sm text-foreground/50">No pending signup requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-foreground/50 font-medium">{signupRequests.length} pending request{signupRequests.length !== 1 ? 's' : ''}</p>
              {signupRequests.map((u) => (
                <div key={u.id} className="bg-white border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-[#35C8E0] transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-bold flex-shrink-0">
                      {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-primary truncate">{u.full_name}</p>
                      <p className="text-xs text-foreground/50 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-md ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                    <span className="text-xs text-foreground/40">{timeAgo(u.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => handleApproveUser(u.id)}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
                    >
                      <Check size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectUser(u.id)}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Role Categories ═══ */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleStats.map((rs) => {
            const roleUsers = users.filter(u => u.role === rs.role)
            return (
              <div key={rs.role} className="bg-white border border-border rounded-xl p-5 hover:border-[#35C8E0] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${rs.color}`}>
                      {rs.label[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm">{rs.label}s</h4>
                      <p className="text-xs text-foreground/50">{rs.count} user{rs.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setFilterRole(rs.role); setActiveTab('all') }}
                    className="text-xs font-semibold text-[#1A9AB5] hover:underline"
                  >
                    View all
                  </button>
                </div>
                {roleUsers.length > 0 ? (
                  <div className="space-y-2">
                    {roleUsers.slice(0, 3).map((u) => (
                      <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg bg-off-white/60">
                        <div className="w-7 h-7 rounded-lg bg-[#35C8E0]/20 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                          {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-primary truncate">{u.full_name}</p>
                          <p className="text-[10px] text-foreground/40 truncate">{u.email}</p>
                        </div>
                        <StatusBadge status={u.status} />
                      </div>
                    ))}
                    {roleUsers.length > 3 && (
                      <p className="text-[10px] text-foreground/40 text-center pt-1">+{roleUsers.length - 3} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-foreground/30 text-center py-4">No users in this role</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Create User Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-heading font-bold text-primary">Add New User</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" placeholder="user@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] bg-white">
                    {Object.entries(roleLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" placeholder="+91 ..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Password *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] pr-10 font-mono"
                      placeholder="Password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFormData({ ...formData, password: generatePassword() }); setShowPassword(true) }}
                    className="px-3 py-2.5 rounded-lg border border-border hover:bg-off-white text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5 text-sm"
                    title="Generate random password"
                  >
                    <Shuffle size={14} />
                    Generate
                  </button>
                </div>
                {showPassword && formData.password && (
                  <button
                    onClick={() => copyToClipboard(formData.password, 'pw')}
                    className="mt-1.5 text-xs text-[#1A9AB5] hover:underline flex items-center gap-1"
                  >
                    {copiedId === 'pw' ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy password</>}
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Tags</label>
                <TagChipSelector selectedTags={formData.tags} onChange={(tags) => setFormData({ ...formData, tags })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
              <button
                onClick={handleCreateUser}
                disabled={actionLoading}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit User Modal ─── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-heading font-bold text-primary">Edit User</h3>
                <p className="text-xs text-foreground/50 mt-0.5">Joined {new Date(selectedUser.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-off-white rounded-xl">
                <div className="w-14 h-14 rounded-xl bg-[#35C8E0]/20 flex items-center justify-center text-primary text-lg font-bold">
                  {selectedUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-primary">{selectedUser.full_name}</p>
                  <p className="text-xs text-foreground/50">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedUser.status} />
                    <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-md ${roleColors[selectedUser.role]}`}>
                      {roleLabels[selectedUser.role]}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] bg-white">
                    {Object.entries(roleLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Reset Password</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] pr-10 font-mono"
                      placeholder="Leave blank to keep current"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFormData({ ...formData, password: generatePassword() }); setShowPassword(true) }}
                    className="px-3 py-2.5 rounded-lg border border-border hover:bg-off-white text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5 text-sm"
                  >
                    <Shuffle size={14} />
                  </button>
                </div>
                {showPassword && formData.password && (
                  <button
                    onClick={() => copyToClipboard(formData.password, 'pw-edit')}
                    className="mt-1.5 text-xs text-[#1A9AB5] hover:underline flex items-center gap-1"
                  >
                    {copiedId === 'pw-edit' ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy password</>}
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Tags</label>
                <TagChipSelector selectedTags={formData.tags} onChange={(tags) => setFormData({ ...formData, tags })} />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { handleBanUser(selectedUser.id); setSelectedUser(null) }}
                  disabled={selectedUser.role === 'admin'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    selectedUser.status === 'banned'
                      ? 'border-green-300 text-green-700 hover:bg-green-50'
                      : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                  }`}
                >
                  <Ban size={14} />
                  {selectedUser.status === 'banned' ? 'Unban User' : 'Ban User'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(selectedUser.id); setSelectedUser(null) }}
                  disabled={selectedUser.role === 'admin'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  Remove User
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setSelectedUser(null)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
              <button
                onClick={handleUpdateUser}
                disabled={actionLoading}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Profile Modal ───────────────────────────────────────────────── */}
      {viewProfileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-heading font-bold text-primary">User Profile</h3>
              <button onClick={() => setViewProfileUser(null)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#35C8E0]/20 flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">
                  {viewProfileUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">{viewProfileUser.full_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={viewProfileUser.status} />
                    <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-md ${roleColors[viewProfileUser.role]}`}>{roleLabels[viewProfileUser.role]}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-off-white rounded-xl">
                  <Mail size={15} className="text-primary/60 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-foreground/50 font-medium">Email</p>
                    <p className="text-sm font-medium text-primary">{viewProfileUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-off-white rounded-xl">
                  <Phone size={15} className="text-primary/60 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-foreground/50 font-medium">Phone</p>
                    <p className="text-sm font-medium text-primary">{viewProfileUser.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-off-white rounded-xl">
                  <Calendar size={15} className="text-primary/60 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-foreground/50 font-medium">Joined</p>
                    <p className="text-sm font-medium text-primary">
                      {new Date(viewProfileUser.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {(viewProfileUser.tags || []).length > 0 && (
                  <div className="p-3 bg-off-white rounded-xl">
                    <p className="text-xs text-foreground/50 font-medium mb-2 flex items-center gap-1"><Tag size={12} /> Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewProfileUser.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-[#35C8E0]/20 text-primary px-2.5 py-1 rounded-full font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-border">
              <button onClick={() => setViewProfileUser(null)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Credentials Modal ───────────────────────────────────────────── */}
      {viewCredentialsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-heading font-bold text-primary">Credentials</h3>
              <button onClick={() => setViewCredentialsUser(null)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5"><Lock size={12} /> Password is hashed and cannot be retrieved. Use &quot;Update Password&quot; to reset it.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">User ID</label>
                <div className="flex items-center gap-2 p-3 bg-off-white rounded-lg font-mono text-xs text-foreground/70 break-all">
                  {viewCredentialsUser.id}
                  <button onClick={() => copyToClipboard(viewCredentialsUser.id, 'uid')} className="flex-shrink-0 text-foreground/30 hover:text-primary ml-auto">
                    {copiedId === 'uid' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">Email</label>
                <div className="flex items-center gap-2 p-3 bg-off-white rounded-lg text-sm font-medium text-foreground/70">
                  {viewCredentialsUser.email}
                  <button onClick={() => copyToClipboard(viewCredentialsUser.email, 'cemail')} className="flex-shrink-0 text-foreground/30 hover:text-primary ml-auto">
                    {copiedId === 'cemail' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">Role</label>
                <div className="p-3 bg-off-white rounded-lg">
                  <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-md ${roleColors[viewCredentialsUser.role]}`}>{roleLabels[viewCredentialsUser.role]}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-border">
              <button onClick={() => setViewCredentialsUser(null)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Activity Log Modal ──────────────────────────────────────────── */}
      {viewActivityUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-heading font-bold text-primary">Activity Log</h3>
                <p className="text-xs text-foreground/50 mt-0.5">{viewActivityUser.full_name}</p>
              </div>
              <button onClick={() => setViewActivityUser(null)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[
                  { label: 'Account Created', date: viewActivityUser.created_at, icon: <UserPlus size={14} />, color: 'text-green-600 bg-green-50' },
                  { label: 'Profile Last Updated', date: viewActivityUser.updated_at, icon: <Edit size={14} />, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Current Status', date: null, icon: viewActivityUser.status === 'banned' ? <Ban size={14} /> : <Shield size={14} />, color: viewActivityUser.status === 'banned' ? 'text-red-600 bg-red-50' : 'text-primary bg-[#35C8E0]/20', value: viewActivityUser.status },
                ].map((actItem, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-off-white rounded-xl">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${actItem.color}`}>
                      {actItem.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary">{actItem.label}</p>
                      <p className="text-xs text-foreground/50 mt-0.5">
                        {actItem.date
                          ? new Date(actItem.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : <span className="capitalize font-semibold">{actItem.value}</span>
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-foreground/40 mt-4 text-center">Full audit logging requires server-side event tracking.</p>
            </div>
            <div className="flex justify-end p-6 border-t border-border">
              <button onClick={() => setViewActivityUser(null)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Update Password Modal ────────────────────────────────────────────── */}
      {updatePasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-heading font-bold text-primary">Update Password</h3>
                <p className="text-xs text-foreground/50 mt-0.5">{updatePasswordUser.full_name}</p>
              </div>
              <button onClick={() => setUpdatePasswordUser(null)} className="p-1 rounded-lg hover:bg-off-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">New Password *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] pr-10 font-mono"
                      placeholder="Enter new password"
                    />
                    <button type="button" onClick={() => setShowNewPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary">
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setNewPassword(generatePassword()); setShowNewPassword(true) }}
                    className="px-3 py-2.5 rounded-lg border border-border hover:bg-off-white text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5 text-sm"
                  >
                    <Shuffle size={14} />
                    Gen
                  </button>
                </div>
                {showNewPassword && newPassword && (
                  <button onClick={() => copyToClipboard(newPassword, 'new-pw')} className="mt-1.5 text-xs text-[#1A9AB5] hover:underline flex items-center gap-1">
                    {copiedId === 'new-pw' ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy password</>}
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => setUpdatePasswordUser(null)} className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">Cancel</button>
              <button
                onClick={handleUpdatePassword}
                disabled={actionLoading || !newPassword}
                className="flex-1 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ─── */}
      {showDeleteConfirm && (        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-xl">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-heading font-bold text-primary mb-2">Delete User?</h3>
              <p className="text-sm text-foreground/60">This will permanently delete the user account and all associated data. This cannot be undone.</p>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-off-white transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                disabled={actionLoading}
                className="flex-1 bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
