'use client'

import { PageHeader, DashboardPanel } from '@/components/dashboard/DashboardUI'

export default function MentorSettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your mentor profile" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="Profile">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Full Name</label><input type="text" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Email</label><input type="email" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Specialization</label><input type="text" placeholder="e.g. Business Strategy, Career Coaching" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1">Bio</label><textarea rows={3} className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright resize-none" /></div>
            <button className="bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">Save Changes</button>
          </div>
        </DashboardPanel>
        <DashboardPanel title="Availability">
          <div className="space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-sm text-primary font-medium">{day}</span>
                <div className="flex items-center gap-2">
                  <select className="border border-border px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-primary-bright">
                    <option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option>
                  </select>
                  <span className="text-foreground/40 text-xs">to</span>
                  <select className="border border-border px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-primary-bright">
                    <option>5:00 PM</option><option>6:00 PM</option><option>7:00 PM</option><option>8:00 PM</option>
                  </select>
                </div>
              </div>
            ))}
            <button className="bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">Update Availability</button>
          </div>
        </DashboardPanel>
      </div>
    </div>
  )
}
