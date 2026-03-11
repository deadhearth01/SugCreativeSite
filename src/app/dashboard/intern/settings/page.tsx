'use client'

import { PageHeader, DashboardPanel } from '@/components/dashboard/DashboardUI'

export default function InternSettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your intern account" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="Profile">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Full Name</label><input type="text" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Email</label><input type="email" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">College / University</label><input type="text" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Internship Duration</label><input type="text" placeholder="e.g. 3 months" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <button className="bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">Save Changes</button>
          </div>
        </DashboardPanel>
        <DashboardPanel title="Security">
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
