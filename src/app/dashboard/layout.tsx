'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  ChevronLeft,
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
  ],
  student: [
    { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { label: 'Training Courses', href: '/dashboard/student/courses', icon: GraduationCap },
    { label: 'Resume Builder', href: '/dashboard/student/resume', icon: FileText },
    { label: 'Meetings', href: '/dashboard/student/meetings', icon: Video },
    { label: 'SUG Calendar', href: '/dashboard/student/calendar', icon: Calendar },
    { label: 'Certificates', href: '/dashboard/student/certificates', icon: ClipboardList },
  ],
  client: [
    { label: 'Dashboard', href: '/dashboard/client', icon: LayoutDashboard },
    { label: 'Projects', href: '/dashboard/client/projects', icon: FolderKanban },
    { label: 'Invoices & Payments', href: '/dashboard/client/payments', icon: Receipt },
    { label: 'Meetings', href: '/dashboard/client/meetings', icon: Video },
    { label: 'Reports', href: '/dashboard/client/reports', icon: BarChart3 },
  ],
  mentor: [
    { label: 'Dashboard', href: '/dashboard/mentor', icon: LayoutDashboard },
    { label: 'My Students', href: '/dashboard/mentor/students', icon: UserCheck },
    { label: 'Sessions', href: '/dashboard/mentor/sessions', icon: Video },
    { label: 'Meetings', href: '/dashboard/mentor/meetings', icon: Calendar },
    { label: 'Calendar', href: '/dashboard/mentor/calendar', icon: Calendar },
    { label: 'Resources', href: '/dashboard/mentor/resources', icon: BookOpen },
    { label: 'Earnings', href: '/dashboard/mentor/earnings', icon: CreditCard },
  ],
  employee: [
    { label: 'Dashboard', href: '/dashboard/employee', icon: LayoutDashboard },
    { label: 'My Tasks', href: '/dashboard/employee/tasks', icon: ClipboardList },
    { label: 'Courses', href: '/dashboard/employee/courses', icon: BookOpen },
    { label: 'Calendar', href: '/dashboard/employee/calendar', icon: Calendar },
    { label: 'Meetings', href: '/dashboard/employee/meetings', icon: Video },
    { label: 'Announcements', href: '/dashboard/employee/announcements', icon: Megaphone },
    { label: 'Attendance', href: '/dashboard/employee/attendance', icon: Clock },
  ],
  intern: [
    { label: 'Dashboard', href: '/dashboard/intern', icon: LayoutDashboard },
    { label: 'My Tasks', href: '/dashboard/intern/tasks', icon: ClipboardList },
    { label: 'Reports', href: '/dashboard/intern/reports', icon: FileText },
    { label: 'Calendar', href: '/dashboard/intern/calendar', icon: Calendar },
    { label: 'Meetings', href: '/dashboard/intern/meetings', icon: Video },
    { label: 'Learning', href: '/dashboard/intern/learning', icon: BookOpen },
    { label: 'Attendance', href: '/dashboard/intern/attendance', icon: Clock },
  ],
}

const roleBottomItems: Record<string, NavItem[]> = {
  admin: [
    { label: 'Support & Tickets', href: '/dashboard/admin/tickets', icon: LifeBuoy },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
  student: [
    { label: 'Support', href: '/dashboard/student/support', icon: LifeBuoy },
    { label: 'Settings', href: '/dashboard/student/settings', icon: Settings },
  ],
  client: [
    { label: 'Support & Tickets', href: '/dashboard/client/tickets', icon: LifeBuoy },
    { label: 'Settings', href: '/dashboard/client/settings', icon: Settings },
  ],
  mentor: [
    { label: 'Settings', href: '/dashboard/mentor/settings', icon: Settings },
  ],
  employee: [
    { label: 'Support Tickets', href: '/dashboard/employee/tickets', icon: LifeBuoy },
    { label: 'Settings', href: '/dashboard/employee/settings', icon: Settings },
  ],
  intern: [
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

function NavLink({ item, collapsed, isActive, onClick }: {
  item: NavItem
  collapsed: boolean
  isActive: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all duration-200 group relative ${
        collapsed ? 'justify-center' : ''
      } ${
        isActive
          ? 'bg-white/15 text-white border-l-2 border-white'
          : 'text-white/55 hover:text-white hover:bg-white/8'
      }`}
    >
      <item.icon size={18} className="flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && isActive && <ChevronRight size={12} className="ml-auto flex-shrink-0" />}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const role = pathname.split('/')[2] || 'admin'
  const navItems = roleNavItems[role] || roleNavItems.admin
  const bottomItems = roleBottomItems[role] || []
  const allItems = [...navItems, ...bottomItems]

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
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className={`border-b border-white/10 flex items-center ${sidebarCollapsed && !mobile ? 'justify-center p-4' : 'justify-between p-5'}`}>
        {(!sidebarCollapsed || mobile) ? (
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-white flex items-center justify-center flex-shrink-0">
              <span className="font-black text-primary text-xs tracking-tight">SC</span>
            </div>
            <div className="min-w-0">
              <span className="text-white text-sm font-black tracking-tight block truncate">SUG CREATIVE</span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{roleLabels[role]} Portal</span>
            </div>
          </Link>
        ) : (
          <Link href="/" className="w-8 h-8 bg-white flex items-center justify-center">
            <span className="font-black text-primary text-xs tracking-tight">SC</span>
          </Link>
        )}
        {mobile ? (
          <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white p-1">
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`text-white/40 hover:text-white hover:bg-white/10 p-1.5 transition-colors flex-shrink-0 ${sidebarCollapsed ? 'ml-0' : 'ml-1'}`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={sidebarCollapsed && !mobile}
            isActive={pathname === item.href}
            onClick={mobile ? () => setSidebarOpen(false) : undefined}
          />
        ))}
      </nav>

      {/* Bottom Items (Support + Settings) */}
      <div className="border-t border-white/10 px-2 py-3 space-y-0.5">
        {bottomItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={sidebarCollapsed && !mobile}
            isActive={pathname === item.href}
            onClick={mobile ? () => setSidebarOpen(false) : undefined}
          />
        ))}
      </div>

      {/* Sign Out */}
      <div className="px-2 pb-3 border-t border-white/10 pt-2">
        <button
          onClick={handleLogout}
          title={sidebarCollapsed && !mobile ? 'Sign Out' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-white/40 hover:text-white hover:bg-white/8 transition-colors w-full ${sidebarCollapsed && !mobile ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(!sidebarCollapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#1A9AB5] flex flex-col transition-all duration-300 hidden lg:flex ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A9AB5] flex flex-col transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent mobile />
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-black/8 h-16 flex items-center px-4 sm:px-6 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#1A9AB5] hover:bg-black/5 p-2 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-[#1A9AB5] uppercase tracking-wide truncate">
              {allItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {userProfile?.full_name && (
              <span className="text-sm text-foreground/50 font-semibold hidden sm:block truncate max-w-32">
                {userProfile.full_name}
              </span>
            )}
            <div className="w-9 h-9 bg-[#1A9AB5] flex items-center justify-center text-white text-xs font-black border-2 border-[#1580A0] shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
              {getInitials(userProfile?.full_name || null)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
