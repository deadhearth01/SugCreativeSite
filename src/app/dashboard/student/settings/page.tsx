'use client'

import { PageHeader, DashboardPanel } from '@/components/dashboard/DashboardUI'

export default function StudentSettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your student account" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="Profile">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Full Name</label><input type="text" defaultValue="Student User" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Email</label><input type="email" defaultValue="student@example.com" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Phone</label><input type="tel" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <button className="bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">Save Changes</button>
          </div>
        </DashboardPanel>
        <DashboardPanel title="Change Password">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Current Password</label><input type="password" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">New Password</label><input type="password" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Confirm Password</label><input type="password" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <button className="bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">Update Password</button>
          </div>
        </DashboardPanel>
      </div>
    </div>
  )
}
