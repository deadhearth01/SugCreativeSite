'use client'

import { useState, useEffect, useRef } from 'react'
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
  ChevronLeft,
  ChevronRight,
  Wallet,
  User,
  ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import WelcomeScreen from '@/components/dashboard/WelcomeScreen'

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
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all duration-200 group relative rounded-xl ${
        collapsed ? 'justify-center' : ''
      } ${
        isActive
          ? 'bg-white/20 text-white rounded-xl'
          : 'text-white/55 hover:text-white hover:bg-white/8 rounded-xl'
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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
      <div className={`border-b border-white/5 flex items-center ${sidebarCollapsed && !mobile ? 'justify-center p-4' : 'justify-between p-5'}`}>
        {(!sidebarCollapsed || mobile) ? (
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <Image src="/sug-new-log.svg" alt="Sug Creative" width={32} height={32} className="flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-white text-sm font-black tracking-tight block truncate">SUG CREATIVE</span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{roleLabels[role]} Portal</span>
            </div>
          </Link>
        ) : (
          <Link href="/">
            <Image src="/sug-new-log.svg" alt="Sug Creative" width={32} height={32} />
          </Link>
        )}
        {mobile ? (
          <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white p-1 rounded-xl">
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors flex-shrink-0 ${sidebarCollapsed ? 'ml-0' : 'ml-1'}`}
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
      <div className="border-t border-white/5 px-2 py-3 space-y-0.5">
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
      <div className="px-2 pb-3 border-t border-white/5 pt-2">
        <button
          onClick={handleLogout}
          title={sidebarCollapsed && !mobile ? 'Sign Out' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-white/40 hover:text-white hover:bg-white/8 transition-colors w-full rounded-xl ${sidebarCollapsed && !mobile ? 'justify-center' : ''}`}
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
        className={`fixed top-3 bottom-3 left-3 z-50 bg-[#1A9AB5] flex flex-col transition-all duration-300 hidden lg:flex rounded-3xl overflow-hidden ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-3 left-3 z-50 w-64 bg-[#1A9AB5] flex flex-col transition-transform duration-300 lg:hidden rounded-3xl overflow-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+12px)]'
        }`}
      >
        <SidebarContent mobile />
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[268px]'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-black/5 h-16 flex items-center px-4 sm:px-6 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#1A9AB5] hover:bg-black/5 p-2 transition-colors rounded-xl"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-[#1A9AB5] uppercase tracking-wide truncate">
              {allItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 hover:bg-black/5 px-2 py-1.5 transition-colors -mr-1 rounded-xl"
            >
              {userProfile?.full_name && (
                <span className="text-sm text-foreground/50 font-semibold hidden sm:block truncate max-w-32">
                  {userProfile.full_name}
                </span>
              )}
              {userProfile?.avatar_url ? (
                <Image src={userProfile.avatar_url} alt="Avatar" width={36} height={36} className="w-9 h-9 object-cover border-2 border-[#1580A0] rounded-xl shadow-md" />
              ) : (
                <div className="w-9 h-9 bg-[#1A9AB5] flex items-center justify-center text-white text-xs font-black border-2 border-[#1580A0] rounded-xl shadow-md">
                  {getInitials(userProfile?.full_name || null)}
                </div>
              )}
              <ChevronDown size={14} className={`text-foreground/40 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-black/10 shadow-lg z-50 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-black/5">
                  <p className="text-xs font-black uppercase tracking-widest text-[#1A9AB5]">{roleLabels[role]}</p>
                  <p className="text-sm font-semibold text-foreground truncate mt-0.5">{userProfile?.full_name || 'User'}</p>
                  <p className="text-xs text-foreground/40 truncate">{userProfile?.email || ''}</p>
                </div>
                <div className="py-1">
                  <Link
                    href={`/dashboard/${role}/profile`}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-black/5 transition-colors"
                  >
                    <User size={15} />
                    My Profile
                  </Link>
                  <Link
                    href={`/dashboard/${role}/settings`}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-black/5 transition-colors"
                  >
                    <Settings size={15} />
                    Settings
                  </Link>
                </div>
                <div className="border-t border-black/5 py-1">
                  <button
                    onClick={() => { setProfileDropdownOpen(false); handleLogout() }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* First-login Welcome Screen */}
      <WelcomeScreen name={userProfile?.full_name || null} role={role} />
    </div>
  )
}
