'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, User, Mail, Phone, Calendar, Tag, Shield, Activity,
  FileText, GraduationCap, Briefcase, DollarSign, Clock, CheckCircle,
  AlertCircle, Edit, Ban, Trash2, KeyRound, MoreVertical, Building,
  BookOpen, Award, Users, MessageSquare, Target, TrendingUp, Loader2, Plus,
  Upload, ExternalLink
} from 'lucide-react'
import { PageHeader, StatusBadge } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  display_id: string | null
  full_name: string
  email: string
  role: 'admin' | 'student' | 'client' | 'mentor' | 'employee' | 'intern'
  status: 'active' | 'pending' | 'banned' | 'inactive'
  phone: string | null
  avatar_url: string | null
  bio: string | null
  tags: string[]
  monthly_pay: number | null
  pay_type: 'salary' | 'stipend' | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  student: 'bg-blue-100 text-blue-700 border-blue-200',
  client: 'bg-purple-100 text-purple-700 border-purple-200',
  mentor: 'bg-green-100 text-green-700 border-green-200',
  employee: 'bg-amber-100 text-amber-700 border-amber-200',
  intern: 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  student: 'Student',
  client: 'Client',
  mentor: 'Mentor',
  employee: 'Employee',
  intern: 'Intern',
}

// Define tabs for each role
const roleTabs: Record<string, { key: string; label: string; icon: React.ReactNode }[]> = {
  admin: [
    { key: 'overview', label: 'Overview', icon: <User size={18} /> },
    { key: 'activity', label: 'Activity Log', icon: <Activity size={18} /> },
    { key: 'security', label: 'Security', icon: <Shield size={18} /> },
  ],
  student: [
    { key: 'overview', label: 'Overview', icon: <User size={18} /> },
    { key: 'courses', label: 'Enrolled Courses', icon: <BookOpen size={18} /> },
    { key: 'certificates', label: 'Certificates', icon: <Award size={18} /> },
    { key: 'payments', label: 'Payments', icon: <DollarSign size={18} /> },
    { key: 'activity', label: 'Activity', icon: <Activity size={18} /> },
  ],
  client: [
    { key: 'overview', label: 'Overview', icon: <User size={18} /> },
    { key: 'projects', label: 'Projects', icon: <Briefcase size={18} /> },
    { key: 'payments', label: 'Payments & Invoices', icon: <DollarSign size={18} /> },
    { key: 'reports', label: 'Reports', icon: <FileText size={18} /> },
    { key: 'meetings', label: 'Meetings', icon: <Calendar size={18} /> },
  ],
  mentor: [
    { key: 'overview', label: 'Overview', icon: <User size={18} /> },
    { key: 'sessions', label: 'Sessions', icon: <Users size={18} /> },
    { key: 'students', label: 'Assigned Students', icon: <GraduationCap size={18} /> },
    { key: 'payments', label: 'Payments', icon: <DollarSign size={18} /> },
    { key: 'resources', label: 'Resources', icon: <FileText size={18} /> },
  ],
  employee: [
    { key: 'overview', label: 'Overview', icon: <User size={18} /> },
    { key: 'tasks', label: 'Tasks', icon: <Target size={18} /> },
    { key: 'attendance', label: 'Attendance', icon: <Clock size={18} /> },
    { key: 'payments', label: 'Payments', icon: <DollarSign size={18} /> },
    { key: 'performance', label: 'Performance', icon: <TrendingUp size={18} /> },
    { key: 'meetings', label: 'Meetings', icon: <Calendar size={18} /> },
  ],
  intern: [
    { key: 'overview', label: 'Overview', icon: <User size={18} /> },
    { key: 'tasks', label: 'Tasks', icon: <Target size={18} /> },
    { key: 'learning', label: 'Learning Progress', icon: <BookOpen size={18} /> },
    { key: 'attendance', label: 'Attendance', icon: <Clock size={18} /> },
    { key: 'payments', label: 'Payments', icon: <DollarSign size={18} /> },
    { key: 'reports', label: 'Reports', icon: <FileText size={18} /> },
  ],
}

// Only allow safe URL schemes in href (blocks stored javascript:/data: XSS).
function safeHref(u: string | null | undefined): string | undefined {
  if (!u) return undefined
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://sugcreative.com'
    const url = new URL(u, base)
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [roleData, setRoleData] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (userId) {
      loadUser()
    }
  }, [userId])

  const loadUser = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error loading user:', error)
      router.push('/dashboard/admin/users')
      return
    }

    setUser(data)
    await loadRoleSpecificData(data.role)
    setLoading(false)
  }

  const loadRoleSpecificData = async (role: string) => {
    const supabase = createClient()
    const data: Record<string, unknown> = {}

    try {
      switch (role) {
        case 'student':
          // Load enrollments
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('*, courses(*)')
            .eq('student_id', userId)
          data.enrollments = enrollments || []

          // Load certificates (legacy course-completion table)
          const { data: certificates } = await supabase
            .from('certificates')
            .select('*, courses(title)')
            .eq('student_id', userId)
          data.certificates = certificates || []

          // Load certificate documents (cert/offer system)
          const { data: certDocs } = await supabase
            .from('documents')
            .select('id, document_id, title, sub_type, issued_on, status, pdf_url')
            .eq('type', 'certificate')
            .eq('recipient_profile_id', userId)
            .order('issued_on', { ascending: false })
          data.certificateDocs = certDocs || []

          // Load payments
          const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
          data.payments = payments || []
          break

        case 'client':
          // Load projects
          const { data: projects } = await supabase
            .from('projects')
            .select('*')
            .eq('client_id', userId)
          data.projects = projects || []

          // Load payments
          const { data: clientPayments } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
          data.payments = clientPayments || []
          break

        case 'mentor':
          // Load sessions
          const { data: sessions } = await supabase
            .from('mentor_sessions')
            .select('*, profiles!mentor_sessions_student_id_fkey(full_name, email)')
            .eq('mentor_id', userId)
            .order('created_at', { ascending: false })
          data.sessions = sessions || []

          // Load meetings the mentor initiated (organizer)
          const { data: organizedMeetings } = await supabase
            .from('meetings')
            .select('id, title, meeting_type, meeting_link, scheduled_at, duration_minutes, status, notes')
            .eq('organizer_id', userId)
            .order('scheduled_at', { ascending: false })
          data.organizedMeetings = organizedMeetings || []

          // Load resources
          const { data: resources } = await supabase
            .from('mentor_resources')
            .select('*')
            .eq('mentor_id', userId)
            .order('created_at', { ascending: false })
          data.resources = resources || []

          // Load assigned students (mentee profiles)
          const { data: assignments } = await supabase
            .from('mentor_assignments')
            .select('id, assigned_at, notes, mentee:mentee_id(id, full_name, email, display_id, role)')
            .eq('mentor_id', userId)
            .order('assigned_at', { ascending: false })
          data.assignedStudents = assignments || []
          break

        case 'employee':
        case 'intern':
          // Load tasks
          const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('assigned_to', userId)
            .order('created_at', { ascending: false })
          data.tasks = tasks || []

          // Load attendance
          const { data: attendance } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(30)
          data.attendance = attendance || []
          break
      }

      // Load meetings for all roles
      const { data: meetings } = await supabase
        .from('meeting_participants')
        .select('*, meetings(*)')
        .eq('user_id', userId)
      data.meetings = meetings || []

      // Load tickets for all roles
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      data.tickets = tickets || []

    } catch (err) {
      console.error('Error loading role data:', err)
    }

    setRoleData(data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-primary mb-2">User Not Found</h2>
        <p className="text-foreground/50 mb-4">The user you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/dashboard/admin/users')}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Back to Users
        </button>
      </div>
    )
  }

  const tabs = roleTabs[user.role] || roleTabs.admin

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/admin/users')}
          className="flex items-center gap-2 text-sm text-foreground/50 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Users
        </button>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-xl bg-[#35C8E0]/20 flex items-center justify-center text-primary text-2xl font-bold">
                {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-primary">{user.full_name}</h1>
                <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-md border ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
                <StatusBadge status={user.status} />
                {user.display_id && (
                  <span className="text-xs font-mono font-bold text-[#1A9AB5] bg-[#35C8E0]/10 border border-[#35C8E0]/30 rounded-md px-2.5 py-1">
                    {user.display_id}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-foreground/40" />
                  <span className="text-foreground/70 truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-foreground/40" />
                    <span className="text-foreground/70">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-foreground/40" />
                  <span className="text-foreground/70">Joined {formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-foreground/40" />
                  <span className="text-foreground/70">Updated {timeAgo(user.updated_at)}</span>
                </div>
              </div>

              {/* Tags */}
              {user.tags && user.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {user.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-[#35C8E0]/10 text-primary px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push(`/dashboard/admin/users?edit=${user.id}`)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Edit size={14} />
                Edit User
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-semibold text-foreground/70 hover:bg-off-white transition-colors">
                <KeyRound size={14} />
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Vertical Tabs */}
      <div className="flex gap-6">
        {/* Vertical Tab Navigation */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white border border-border rounded-xl p-2 sticky top-4">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                {roleLabels[user.role]} Menu
              </p>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1 ${
                  activeTab === tab.key
                    ? 'bg-primary text-white'
                    : 'text-foreground/60 hover:bg-off-white hover:text-primary'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Bio */}
              {user.bio && (
                <div className="bg-white border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-primary mb-3">Bio</h3>
                  <p className="text-sm text-foreground/70">{user.bio}</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {user.role === 'student' && (
                  <>
                    <StatCard
                      label="Enrolled Courses"
                      value={(roleData.enrollments as unknown[])?.length || 0}
                      icon={<BookOpen size={20} />}
                    />
                    <StatCard
                      label="Certificates"
                      value={(roleData.certificates as unknown[])?.length || 0}
                      icon={<Award size={20} />}
                    />
                    <StatCard
                      label="Total Payments"
                      value={(roleData.payments as unknown[])?.length || 0}
                      icon={<DollarSign size={20} />}
                    />
                    <StatCard
                      label="Support Tickets"
                      value={(roleData.tickets as unknown[])?.length || 0}
                      icon={<MessageSquare size={20} />}
                    />
                  </>
                )}
                {user.role === 'client' && (
                  <>
                    <StatCard
                      label="Active Projects"
                      value={(roleData.projects as unknown[])?.length || 0}
                      icon={<Briefcase size={20} />}
                    />
                    <StatCard
                      label="Total Payments"
                      value={(roleData.payments as unknown[])?.length || 0}
                      icon={<DollarSign size={20} />}
                    />
                    <StatCard
                      label="Meetings"
                      value={(roleData.meetings as unknown[])?.length || 0}
                      icon={<Calendar size={20} />}
                    />
                    <StatCard
                      label="Support Tickets"
                      value={(roleData.tickets as unknown[])?.length || 0}
                      icon={<MessageSquare size={20} />}
                    />
                  </>
                )}
                {user.role === 'mentor' && (
                  <>
                    <StatCard
                      label="Total Sessions"
                      value={(roleData.sessions as unknown[])?.length || 0}
                      icon={<Users size={20} />}
                    />
                    <StatCard
                      label="Resources Shared"
                      value={(roleData.resources as unknown[])?.length || 0}
                      icon={<FileText size={20} />}
                    />
                    <StatCard
                      label="Meetings"
                      value={(roleData.meetings as unknown[])?.length || 0}
                      icon={<Calendar size={20} />}
                    />
                    <StatCard
                      label="Support Tickets"
                      value={(roleData.tickets as unknown[])?.length || 0}
                      icon={<MessageSquare size={20} />}
                    />
                  </>
                )}
                {(user.role === 'employee' || user.role === 'intern') && (
                  <>
                    <StatCard
                      label="Assigned Tasks"
                      value={(roleData.tasks as unknown[])?.length || 0}
                      icon={<Target size={20} />}
                    />
                    <StatCard
                      label="Attendance Records"
                      value={(roleData.attendance as unknown[])?.length || 0}
                      icon={<Clock size={20} />}
                    />
                    <StatCard
                      label="Meetings"
                      value={(roleData.meetings as unknown[])?.length || 0}
                      icon={<Calendar size={20} />}
                    />
                    <StatCard
                      label="Support Tickets"
                      value={(roleData.tickets as unknown[])?.length || 0}
                      icon={<MessageSquare size={20} />}
                    />
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <StatCard
                      label="Meetings"
                      value={(roleData.meetings as unknown[])?.length || 0}
                      icon={<Calendar size={20} />}
                    />
                    <StatCard
                      label="Support Tickets"
                      value={(roleData.tickets as unknown[])?.length || 0}
                      icon={<MessageSquare size={20} />}
                    />
                  </>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-primary mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <ActivityItem
                    icon={<User size={14} />}
                    text="Account created"
                    time={formatDate(user.created_at)}
                  />
                  <ActivityItem
                    icon={<Edit size={14} />}
                    text="Profile updated"
                    time={timeAgo(user.updated_at)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab (Student) */}
          {activeTab === 'courses' && user.role === 'student' && (
            <div className="bg-white border border-border rounded-xl">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold text-primary">Enrolled Courses</h3>
              </div>
              {(roleData.enrollments as unknown[])?.length === 0 ? (
                <div className="p-8 text-center text-foreground/50">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No courses enrolled yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {(roleData.enrollments as { id: string; courses: { title: string }; status: string; progress_percent: number; enrolled_at: string }[])?.map((enrollment) => (
                    <div key={enrollment.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary">{enrollment.courses?.title}</p>
                        <p className="text-xs text-foreground/50">Enrolled {formatDate(enrollment.enrolled_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-off-white rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${enrollment.progress_percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground/60">{enrollment.progress_percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab (Employee/Intern) */}
          {activeTab === 'tasks' && (user.role === 'employee' || user.role === 'intern') && (
            <div className="bg-white border border-border rounded-xl">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold text-primary">Assigned Tasks</h3>
              </div>
              {(roleData.tasks as unknown[])?.length === 0 ? (
                <div className="p-8 text-center text-foreground/50">
                  <Target size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No tasks assigned yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {(roleData.tasks as { id: string; title: string; status: string; priority: string; due_date: string }[])?.map((task) => (
                    <div key={task.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-700' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      {task.due_date && (
                        <span className="text-xs text-foreground/50">Due {formatDate(task.due_date)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (user.role === 'employee' || user.role === 'intern') && (
            <div className="bg-white border border-border rounded-xl">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold text-primary">Attendance Records (Last 30 days)</h3>
              </div>
              {(roleData.attendance as unknown[])?.length === 0 ? (
                <div className="p-8 text-center text-foreground/50">
                  <Clock size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No attendance records yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {(roleData.attendance as { id: string; date: string; status: string; check_in: string; check_out: string; hours_worked: number }[])?.map((record) => (
                    <div key={record.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary">{formatDate(record.date)}</p>
                        <p className="text-xs text-foreground/50">
                          {record.check_in ? new Date(record.check_in).toLocaleTimeString() : '--'} -
                          {record.check_out ? new Date(record.check_out).toLocaleTimeString() : '--'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          record.status === 'present' ? 'bg-green-100 text-green-700' :
                          record.status === 'absent' ? 'bg-red-100 text-red-700' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {record.status}
                        </span>
                        {record.hours_worked && (
                          <span className="text-xs text-foreground/50">{record.hours_worked}h</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Projects Tab (Client) */}
          {activeTab === 'projects' && user.role === 'client' && (
            <div className="bg-white border border-border rounded-xl">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold text-primary">Projects</h3>
              </div>
              {(roleData.projects as unknown[])?.length === 0 ? (
                <div className="p-8 text-center text-foreground/50">
                  <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No projects yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {(roleData.projects as { id: string; title: string; status: string; progress_percent: number; deadline: string }[])?.map((project) => (
                    <div key={project.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary">{project.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          project.status === 'completed' ? 'bg-green-100 text-green-700' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-off-white rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${project.progress_percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground/60">{project.progress_percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assigned Students Tab (Mentor) */}
          {activeTab === 'students' && user.role === 'mentor' && (
            <div className="bg-white border border-border rounded-xl">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold text-primary">Assigned Students</h3>
              </div>
              {(roleData.assignedStudents as unknown[])?.length === 0 ? (
                <div className="p-8 text-center text-foreground/50">
                  <GraduationCap size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No students assigned yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {(roleData.assignedStudents as { id: string; assigned_at: string; mentee: { id: string; full_name: string; email: string; display_id: string | null; role: string } | null }[])?.map((a) => (
                    a.mentee && (
                      <button
                        key={a.id}
                        onClick={() => router.push(`/dashboard/admin/users/${a.mentee!.id}`)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-off-white transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[#35C8E0]/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                            {a.mentee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-primary truncate">{a.mentee.full_name}</p>
                            <p className="text-xs text-foreground/50 truncate">{a.mentee.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-md bg-off-white text-foreground/60">{a.mentee.role}</span>
                          {a.mentee.display_id && (
                            <span className="text-xs font-mono font-bold text-[#1A9AB5] bg-[#35C8E0]/10 border border-[#35C8E0]/30 rounded-md px-2 py-0.5">
                              {a.mentee.display_id}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sessions Tab (Mentor) */}
          {activeTab === 'sessions' && user.role === 'mentor' && (
            <div className="space-y-6">
              {/* Mentoring sessions */}
              <div className="bg-white border border-border rounded-xl">
                <div className="p-5 border-b border-border">
                  <h3 className="text-sm font-semibold text-primary">Mentoring Sessions</h3>
                </div>
                {(roleData.sessions as unknown[])?.length === 0 ? (
                  <div className="p-8 text-center text-foreground/50">
                    <Users size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No mentoring sessions yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {(roleData.sessions as { id: string; duration_minutes: number; rating: number | null; feedback: string | null; created_at: string; profiles: { full_name: string; email: string } | null }[])?.map((s) => (
                      <div key={s.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-primary">{s.profiles?.full_name || 'Student'}</p>
                            <p className="text-xs text-foreground/50">{s.created_at ? formatDate(s.created_at) : ''}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            {s.duration_minutes != null && (
                              <span className="text-foreground/50">{s.duration_minutes} min</span>
                            )}
                            {s.rating != null && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">★ {s.rating}</span>
                            )}
                          </div>
                        </div>
                        {s.feedback && (
                          <p className="text-xs text-foreground/60 mt-2 italic">&ldquo;{s.feedback}&rdquo;</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Meetings initiated */}
              <div className="bg-white border border-border rounded-xl">
                <div className="p-5 border-b border-border">
                  <h3 className="text-sm font-semibold text-primary">Meetings Initiated</h3>
                </div>
                {(roleData.organizedMeetings as unknown[])?.length === 0 ? (
                  <div className="p-8 text-center text-foreground/50">
                    <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No meetings initiated yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {(roleData.organizedMeetings as { id: string; title: string; scheduled_at: string; status: string; meeting_link: string | null }[])?.map((m) => (
                      <div key={m.id} className="p-4 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-primary truncate">{m.title}</p>
                          <p className="text-xs text-foreground/50">{m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : ''}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            m.status === 'completed' ? 'bg-green-100 text-green-700' :
                            m.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {m.status}
                          </span>
                          {m.meeting_link && (
                            <a href={safeHref(m.meeting_link)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs font-semibold text-[#1A9AB5] hover:underline">
                              Join
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resources Tab (Mentor) */}
          {activeTab === 'resources' && user.role === 'mentor' && (
            <div className="bg-white border border-border rounded-xl">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold text-primary">Shared Resources</h3>
              </div>
              {(roleData.resources as unknown[])?.length === 0 ? (
                <div className="p-8 text-center text-foreground/50">
                  <FileText size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No resources shared yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {(roleData.resources as { id: string; title: string; description: string | null; file_url: string | null; resource_type: string | null; is_public: boolean; created_at: string }[])?.map((r) => (
                    <div key={r.id} className="p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-primary truncate">{r.title}</p>
                        {r.description && <p className="text-xs text-foreground/50 truncate">{r.description}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          {r.resource_type && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-off-white text-foreground/60">{r.resource_type}</span>
                          )}
                          {r.is_public && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Public</span>
                          )}
                        </div>
                      </div>
                      {r.file_url && (
                        <a href={safeHref(r.file_url)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#1A9AB5] hover:underline flex-shrink-0">
                          Open
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Certificates Tab (Student) */}
          {activeTab === 'certificates' && user.role === 'student' && (
            <StudentCertificatesTab user={user} roleData={roleData} onReload={() => loadRoleSpecificData('student')} router={router} />
          )}

          {/* Meetings Tab (Employee/Intern/Client) */}
          {activeTab === 'meetings' && ['employee', 'intern', 'client'].includes(user.role) && (
            <div className="bg-white border border-border rounded-xl">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold text-primary">Meetings</h3>
              </div>
              {(roleData.meetings as unknown[])?.length === 0 ? (
                <div className="p-8 text-center text-foreground/50">
                  <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No meetings yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {(roleData.meetings as { id: string; status: string; meetings: { id: string; title: string; scheduled_at: string; status: string; meeting_link: string | null } | null }[])?.map((mp) => (
                    mp.meetings && (
                      <div key={mp.id} className="p-4 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-primary truncate">{mp.meetings.title}</p>
                          <p className="text-xs text-foreground/50">{mp.meetings.scheduled_at ? new Date(mp.meetings.scheduled_at).toLocaleString() : ''}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            mp.meetings.status === 'completed' ? 'bg-green-100 text-green-700' :
                            mp.meetings.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {mp.meetings.status}
                          </span>
                          {mp.meetings.meeting_link && (
                            <a href={safeHref(mp.meetings.meeting_link)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#1A9AB5] hover:underline">
                              Join
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Performance Tab (Employee/Intern) */}
          {activeTab === 'performance' && (user.role === 'employee' || user.role === 'intern') && (
            <PerformanceTab roleData={roleData} />
          )}

          {/* Learning Tab (Intern) */}
          {activeTab === 'learning' && user.role === 'intern' && (
            <div className="bg-white border border-border rounded-xl">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold text-primary">Learning Progress</h3>
              </div>
              <div className="p-8 text-center text-foreground/50">
                <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                <p>No learning records yet.</p>
              </div>
            </div>
          )}

          {/* Reports Tab (Intern/Client) */}
          {activeTab === 'reports' && (user.role === 'intern' || user.role === 'client') && (
            <div className="bg-white border border-border rounded-xl">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold text-primary">Reports</h3>
              </div>
              <div className="p-8 text-center text-foreground/50">
                <FileText size={32} className="mx-auto mb-3 opacity-30" />
                <p>No reports yet.</p>
              </div>
            </div>
          )}

          {/* Security Tab / Activity Tab - Show for all roles */}
          {(activeTab === 'security' || activeTab === 'activity') && (
            <div className="bg-white border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-primary mb-4">
                {activeTab === 'security' ? 'Security Settings' : 'Activity Log'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-off-white rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Account Status</p>
                    <p className="text-xs text-foreground/50">Current account status</p>
                  </div>
                  <StatusBadge status={user.status} />
                </div>
                <div className="flex items-center justify-between p-4 bg-off-white rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Last Updated</p>
                    <p className="text-xs text-foreground/50">Profile last modified</p>
                  </div>
                  <span className="text-sm text-foreground/60">{formatDate(user.updated_at)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-off-white rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Account Created</p>
                    <p className="text-xs text-foreground/50">Registration date</p>
                  </div>
                  <span className="text-sm text-foreground/60">{formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payments — salary/stipend + payslip generation (employee/intern/student) */}
          {activeTab === 'payments' && ['employee', 'intern', 'student', 'mentor'].includes(user.role) && (
            <UserPaymentsTab user={user} onUserUpdate={(u) => setUser(u)} />
          )}

          {/* Default content — only for genuinely unhandled tab/role combos */}
          {![
            'overview', 'courses', 'tasks', 'attendance', 'projects', 'security', 'activity',
            'students', 'sessions', 'resources', 'certificates', 'meetings', 'performance',
            'learning', 'reports',
          ].includes(activeTab) &&
            !(activeTab === 'payments' && ['employee', 'intern', 'student', 'mentor'].includes(user.role)) && (
            <div className="bg-white border border-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-xl bg-off-white flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-foreground/30" />
              </div>
              <h3 className="font-semibold text-primary mb-1">Coming Soon</h3>
              <p className="text-sm text-foreground/50">This section is under development.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Components
function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#35C8E0]/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{value}</p>
          <p className="text-xs text-foreground/50">{label}</p>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ icon, text, time }: { icon: React.ReactNode; text: string; time: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-off-white flex items-center justify-center text-foreground/40">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-foreground/70">{text}</p>
        <p className="text-xs text-foreground/40">{time}</p>
      </div>
    </div>
  )
}

// ─── Student Certificates tab ────────────────────────────────────────────────
type CertDoc = { id: string; document_id: string; title: string; sub_type: string | null; issued_on: string; status: string; pdf_url: string | null }
type LegacyCert = { id: string; certificate_number: string; issued_at: string; file_url: string | null; courses: { title: string } | null }

function StudentCertificatesTab({
  user, roleData, onReload, router,
}: {
  user: Profile
  roleData: Record<string, unknown>
  onReload: () => Promise<void> | void
  router: ReturnType<typeof useRouter>
}) {
  const certDocs = (roleData.certificateDocs as CertDoc[]) || []
  const legacy = (roleData.certificates as LegacyCert[]) || []

  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const flash = (kind: 'ok' | 'err', text: string) => { setMsg({ kind, text }); setTimeout(() => setMsg(null), 6000) }

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!confirm(`Delete certificate "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { flash('err', json.error || 'Delete failed'); return }
      flash('ok', 'Certificate deleted.')
      await onReload()
    } catch {
      flash('err', 'Delete failed.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('student_id', user.id)
      fd.append('title', file.name.replace(/\.[^.]+$/, '') || 'Certificate')
      const res = await fetch('/api/certificates/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { flash('err', json.error || 'Upload failed'); return }
      flash('ok', 'Certificate uploaded.')
      await onReload()
    } catch {
      flash('err', 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const isEmpty = certDocs.length === 0 && legacy.length === 0

  return (
    <div className="space-y-6">
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.kind === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white border border-border rounded-xl">
        <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-primary">Certificates</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard/admin/documents')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-all"
            >
              <Plus size={15} /> Generate Certificate
            </button>
            <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-border text-foreground/70 hover:bg-off-white transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload Certificate'}
              <input type="file" accept="application/pdf,image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        {isEmpty ? (
          <div className="p-8 text-center text-foreground/50">
            <Award size={32} className="mx-auto mb-3 opacity-30" />
            <p>No certificates yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {certDocs.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-primary truncate">{d.title}</p>
                  <p className="text-xs text-foreground/50 font-mono">{d.document_id}</p>
                  <p className="text-xs text-foreground/40">Issued {d.issued_on ? formatDate(d.issued_on) : '—'}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {d.pdf_url && (
                    <a href={safeHref(d.pdf_url)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-foreground/60 hover:text-primary hover:underline flex items-center gap-1">
                      <ExternalLink size={12} /> File
                    </a>
                  )}
                  <a href={`/verify?id=${d.document_id}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#1A9AB5] hover:underline">
                    Verify
                  </a>
                  <button
                    onClick={() => handleDeleteDoc(d.id, d.title)}
                    disabled={deletingId === d.id}
                    title="Delete certificate"
                    className="p-1.5 rounded-lg text-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === d.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}
            {legacy.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-primary truncate">{c.courses?.title || 'Course Certificate'}</p>
                  <p className="text-xs text-foreground/50 font-mono">{c.certificate_number}</p>
                  <p className="text-xs text-foreground/40">Issued {c.issued_at ? formatDate(c.issued_at) : '—'}</p>
                </div>
                {c.file_url && (
                  <a href={safeHref(c.file_url)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#1A9AB5] hover:underline flex items-center gap-1 flex-shrink-0">
                    <ExternalLink size={12} /> Open
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Performance tab (Employee/Intern) ───────────────────────────────────────
function PerfBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-foreground/60">{label}</span>
        <span className="text-xs font-medium text-foreground/70">{value}</span>
      </div>
      <div className="h-2 bg-off-white rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
      </div>
    </div>
  )
}

function PerformanceTab({ roleData }: { roleData: Record<string, unknown> }) {
  const tasks = (roleData.tasks as { status: string }[]) || []
  const attendance = (roleData.attendance as { status: string }[]) || []

  const totalTasks = tasks.length
  const byStatus = (s: string) => tasks.filter((t) => t.status === s).length
  const completed = byStatus('completed')
  const inProgress = byStatus('in_progress')
  const pending = byStatus('pending')
  const overdue = byStatus('overdue')
  const taskRate = totalTasks ? Math.round((completed / totalTasks) * 100) : 0

  const totalAtt = attendance.length
  const present = attendance.filter((a) => a.status === 'present').length
  const late = attendance.filter((a) => a.status === 'late').length
  const absent = attendance.filter((a) => a.status === 'absent').length
  const presentRate = totalAtt ? Math.round((present / totalAtt) * 100) : 0

  const score = Math.round(taskRate * 0.7 + presentRate * 0.3)
  const scoreColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-6">
      {/* Score + headline stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#35C8E0]/20 flex items-center justify-center text-primary">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${scoreColor}`}>{score}</p>
              <p className="text-xs text-foreground/50">Performance Score</p>
            </div>
          </div>
        </div>
        <StatCard label="Task Completion" value={`${taskRate}%`} icon={<Target size={20} />} />
        <StatCard label="Attendance Rate" value={`${presentRate}%`} icon={<Clock size={20} />} />
        <StatCard label="Total Tasks" value={totalTasks} icon={<CheckCircle size={20} />} />
      </div>

      {/* Task breakdown */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-4">Task Breakdown</h3>
        {totalTasks === 0 ? (
          <p className="text-sm text-foreground/50">No tasks assigned yet.</p>
        ) : (
          <div className="space-y-3">
            <PerfBar label="Completed" value={completed} total={totalTasks} color="bg-green-500" />
            <PerfBar label="In Progress" value={inProgress} total={totalTasks} color="bg-blue-500" />
            <PerfBar label="Pending" value={pending} total={totalTasks} color="bg-gray-400" />
            <PerfBar label="Overdue" value={overdue} total={totalTasks} color="bg-red-500" />
          </div>
        )}
      </div>

      {/* Attendance summary */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-4">Attendance (Last 30 days)</h3>
        {totalAtt === 0 ? (
          <p className="text-sm text-foreground/50">No attendance records yet.</p>
        ) : (
          <div className="space-y-3">
            <PerfBar label="Present" value={present} total={totalAtt} color="bg-green-500" />
            <PerfBar label="Late" value={late} total={totalAtt} color="bg-yellow-500" />
            <PerfBar label="Absent" value={absent} total={totalAtt} color="bg-red-500" />
          </div>
        )}
      </div>
    </div>
  )
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

type PayslipRow = {
  id: string
  payslip_no: string
  period_month: number
  period_year: number
  gross: number
  total_deductions: number
  net: number
  pay_type: 'salary' | 'stipend'
  status: string
}

// Payments tab: set the person's salary/stipend (the "salary algorithm" that
// auto-applies to their payslips) and generate individual payslips.
function UserPaymentsTab({ user, onUserUpdate }: { user: Profile; onUserUpdate: (u: Profile) => void }) {
  const isIntern = user.role === 'intern'
  const defaultType: 'salary' | 'stipend' = isIntern ? 'stipend' : 'salary'

  const [pay, setPay] = useState<string>(user.monthly_pay != null ? String(user.monthly_pay) : '')
  const [payType, setPayType] = useState<'salary' | 'stipend'>(user.pay_type || defaultType)
  const [savingPay, setSavingPay] = useState(false)

  const [slips, setSlips] = useState<PayslipRow[]>([])
  const [loadingSlips, setLoadingSlips] = useState(true)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const now = new Date()
  const [genMonth, setGenMonth] = useState(now.getMonth() + 1)
  const [genYear, setGenYear] = useState(now.getFullYear())
  const [generating, setGenerating] = useState(false)
  const [showGen, setShowGen] = useState(false)

  const flash = (kind: 'ok' | 'err', text: string) => { setMsg({ kind, text }); setTimeout(() => setMsg(null), 5000) }

  const loadSlips = useCallback(async () => {
    setLoadingSlips(true)
    try {
      const res = await fetch(`/api/payslips?recipient_id=${user.id}`)
      const json = await res.json()
      setSlips(res.ok ? (json.data || []) : [])
    } catch { setSlips([]) } finally { setLoadingSlips(false) }
  }, [user.id])

  useEffect(() => { loadSlips() }, [loadSlips])

  const savePay = async () => {
    setSavingPay(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthly_pay: pay === '' ? null : Number(pay), pay_type: pay === '' ? null : payType }),
      })
      const json = await res.json()
      if (!res.ok) { flash('err', json.error || 'Failed to save'); return }
      onUserUpdate({ ...user, monthly_pay: pay === '' ? null : Number(pay), pay_type: pay === '' ? null : payType })
      flash('ok', 'Salary saved — it will apply to new payslips.')
    } catch { flash('err', 'Failed to save salary.') } finally { setSavingPay(false) }
  }

  const generate = async (sendEmail: boolean) => {
    if (pay === '' && user.monthly_pay == null) { flash('err', 'Set a salary/stipend first.'); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: user.id, period_month: genMonth, period_year: genYear, send_email: sendEmail }),
      })
      const json = await res.json()
      if (!res.ok) { flash('err', json.error || 'Failed to generate'); return }
      flash('ok', `Payslip generated for ${MONTHS[genMonth - 1]} ${genYear}${sendEmail ? ' and emailed' : ''}.`)
      setShowGen(false)
      await loadSlips()
    } catch { flash('err', 'Failed to generate payslip.') } finally { setGenerating(false) }
  }

  const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.kind === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Salary / stipend editor */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-1">{isIntern ? 'Stipend' : 'Salary'} Setup</h3>
        <p className="text-xs text-foreground/50 mb-4">Set the monthly {isIntern ? 'stipend' : 'salary'}. This auto-applies to generated payslips (gross = this amount; PF/tax from payroll settings).</p>
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Monthly Amount (₹)</label>
            <input
              type="number"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Type</label>
            <select
              value={payType}
              onChange={(e) => setPayType(e.target.value as 'salary' | 'stipend')}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0]"
            >
              <option value="salary">Salary</option>
              <option value="stipend">Stipend</option>
            </select>
          </div>
          <button
            onClick={savePay}
            disabled={savingPay}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {savingPay ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Payslips */}
      <div className="bg-white border border-border rounded-xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">Payslips</h3>
          <button
            onClick={() => setShowGen((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[#82C93D] text-white hover:brightness-95 transition-all"
          >
            <Plus size={15} /> Generate Payslip
          </button>
        </div>

        {showGen && (
          <div className="p-5 border-b border-border bg-off-white/50 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Month</label>
              <select value={genMonth} onChange={(e) => setGenMonth(Number(e.target.value))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">Year</label>
              <input type="number" value={genYear} onChange={(e) => setGenYear(Number(e.target.value))} className="w-28 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white" />
            </div>
            <button onClick={() => generate(false)} disabled={generating} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50">
              {generating ? 'Generating…' : 'Generate'}
            </button>
            <button onClick={() => generate(true)} disabled={generating} className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-primary text-primary hover:bg-primary/5 disabled:opacity-50">
              Generate & Email
            </button>
          </div>
        )}

        {loadingSlips ? (
          <div className="p-8 text-center text-foreground/40 text-sm">Loading…</div>
        ) : slips.length === 0 ? (
          <div className="p-8 text-center text-foreground/50">
            <DollarSign size={32} className="mx-auto mb-3 opacity-30" />
            <p>No payslips yet. Use “Generate Payslip” to create one.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {slips.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">{MONTHS[s.period_month - 1]} {s.period_year}</p>
                  <p className="text-xs text-foreground/50 font-mono">{s.payslip_no}</p>
                </div>
                <div className="flex items-center gap-5 text-sm">
                  <span className="text-foreground/50">Gross {fmt(s.gross)}</span>
                  <span className="text-foreground/50">− {fmt(s.total_deductions)}</span>
                  <span className="font-bold text-primary">Net {fmt(s.net)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
