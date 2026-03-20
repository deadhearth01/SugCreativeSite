'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  CreditCard,
  Megaphone,
  LifeBuoy,
  Settings,
  GraduationCap,
  FileText,
  Video,
  FolderKanban,
  Receipt,
  ClipboardList,
  UserCheck,
  Clock,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Wallet,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const roleNavItems: Record<string, NavItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'User Management', href: '/dashboard/admin/users', icon: Users },
    { label: 'Meetings', href: '/dashboard/admin/meetings', icon: Video },
    { label: 'SUG Calendar', href: '/dashboard/admin/calendar', icon: Calendar },
    { label: 'Course Management', href: '/dashboard/admin/courses', icon: BookOpen },
    { label: 'Budget & Finances', href: '/dashboard/admin/budget', icon: Wallet },
    { label: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard },
    { label: 'Announcements', href: '/dashboard/admin/announcements', icon: Megaphone },
    { label: 'Support & Tickets', href: '/dashboard/admin/tickets', icon: LifeBuoy },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
  student: [
    { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { label: 'Training Courses', href: '/dashboard/student/courses', icon: GraduationCap },
    { label: 'Resume Builder', href: '/dashboard/student/resume', icon: FileText },
    { label: 'Meetings', href: '/dashboard/student/meetings', icon: Video },
    { label: 'SUG Calendar', href: '/dashboard/student/calendar', icon: Calendar },
    { label: 'Certificates', href: '/dashboard/student/certificates', icon: ClipboardList },
    { label: 'Support', href: '/dashboard/student/support', icon: LifeBuoy },
    { label: 'Settings', href: '/dashboard/student/settings', icon: Settings },
  ],
  client: [
    { label: 'Dashboard', href: '/dashboard/client', icon: LayoutDashboard },
    { label: 'Projects', href: '/dashboard/client/projects', icon: FolderKanban },
    { label: 'Invoices & Payments', href: '/dashboard/client/payments', icon: Receipt },
    { label: 'Meetings', href: '/dashboard/client/meetings', icon: Video },
    { label: 'Reports', href: '/dashboard/client/reports', icon: BarChart3 },
    { label: 'Support & Tickets', href: '/dashboard/client/tickets', icon: LifeBuoy },
    { label: 'Settings', href: '/dashboard/client/settings', icon: Settings },
  ],
  mentor: [
    { label: 'Dashboard', href: '/dashboard/mentor', icon: LayoutDashboard },
    { label: 'My Students', href: '/dashboard/mentor/students', icon: UserCheck },
    { label: 'Sessions', href: '/dashboard/mentor/sessions', icon: Video },
    { label: 'Meetings', href: '/dashboard/mentor/meetings', icon: Calendar },
    { label: 'Calendar', href: '/dashboard/mentor/calendar', icon: Calendar },
    { label: 'Resources', href: '/dashboard/mentor/resources', icon: BookOpen },
    { label: 'Earnings', href: '/dashboard/mentor/earnings', icon: CreditCard },
    { label: 'Settings', href: '/dashboard/mentor/settings', icon: Settings },
  ],
  employee: [
    { label: 'Dashboard', href: '/dashboard/employee', icon: LayoutDashboard },
    { label: 'My Tasks', href: '/dashboard/employee/tasks', icon: ClipboardList },
    { label: 'Support Tickets', href: '/dashboard/employee/tickets', icon: LifeBuoy },
    { label: 'Courses', href: '/dashboard/employee/courses', icon: BookOpen },
    { label: 'Calendar', href: '/dashboard/employee/calendar', icon: Calendar },
    { label: 'Meetings', href: '/dashboard/employee/meetings', icon: Video },
    { label: 'Announcements', href: '/dashboard/employee/announcements', icon: Megaphone },
    { label: 'Attendance', href: '/dashboard/employee/attendance', icon: Clock },
    { label: 'Settings', href: '/dashboard/employee/settings', icon: Settings },
  ],
  intern: [
    { label: 'Dashboard', href: '/dashboard/intern', icon: LayoutDashboard },
    { label: 'My Tasks', href: '/dashboard/intern/tasks', icon: ClipboardList },
    { label: 'Reports', href: '/dashboard/intern/reports', icon: FileText },
    { label: 'Calendar', href: '/dashboard/intern/calendar', icon: Calendar },
    { label: 'Meetings', href: '/dashboard/intern/meetings', icon: Video },
    { label: 'Learning', href: '/dashboard/intern/learning', icon: BookOpen },
    { label: 'Attendance', href: '/dashboard/intern/attendance', icon: Clock },
    { label: 'Support', href: '/dashboard/intern/support', icon: LifeBuoy },
    { label: 'Settings', href: '/dashboard/intern/settings', icon: Settings },
  ],
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  student: 'Student',
  client: 'Client',
  mentor: 'Mentor',
  employee: 'Employee',
  intern: 'Intern',
}

type UserProfile = {
  full_name: string | null
  email: string | null
  avatar_url: string | null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Extract role from pathname
  const role = pathname.split('/')[2] || 'admin'
  const navItems = roleNavItems[role] || roleNavItems.admin

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setUserProfile(data)
        })
    })
  }, [])

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-off-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary flex flex-col transition-transform duration-300 lg:translate-x-0 rounded-r-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Sug Creative" width={32} height={32} />
            <span className="text-white text-lg font-heading font-bold">Sug Creative</span>
          </Link>
          <div className="mt-3 px-3 py-1.5 bg-primary-bright/20 rounded-lg w-fit">
            <span className="text-primary-soft text-xs font-semibold uppercase tracking-wider">
              {roleLabels[role]} Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-bright text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {isActive && <ChevronRight size={14} className="ml-auto" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-primary mr-4"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-heading font-bold text-primary capitalize">
              {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {userProfile?.full_name && (
              <span className="text-sm text-foreground/60 font-medium hidden sm:block">
                {userProfile.full_name}
              </span>
            )}
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white text-xs font-bold">
              {getInitials(userProfile?.full_name || null)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
