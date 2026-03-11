'use client'

import { PageHeader, DashboardPanel } from '@/components/dashboard/DashboardUI'
import { User, Bell, Shield, Palette } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your admin account and site preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="Profile Settings">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Full Name</label>
              <input type="text" defaultValue="Admin User" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Email</label>
              <input type="email" defaultValue="admin@sugcreative.com" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Phone</label>
              <input type="tel" defaultValue="+91 98765 43210" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
            </div>
            <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              Save Changes
            </button>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Security">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Current Password</label>
              <input type="password" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">New Password</label>
              <input type="password" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Confirm New Password</label>
              <input type="password" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
            </div>
            <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              Update Password
            </button>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Notifications">
          <div className="space-y-4">
            {[
              { label: 'New user registrations', desc: 'Get notified when a new user signs up', defaultChecked: true },
              { label: 'Support tickets', desc: 'Get alerted for new support tickets', defaultChecked: true },
              { label: 'Payment notifications', desc: 'Receive payment confirmations', defaultChecked: true },
              { label: 'System updates', desc: 'Stay informed about platform updates', defaultChecked: false },
              { label: 'Weekly reports', desc: 'Get a weekly summary email', defaultChecked: true },
            ].map((item, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">{item.label}</p>
                  <p className="text-xs text-foreground/50">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-checked:bg-primary-bright rounded-full peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Preferences">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Timezone</label>
              <select className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright bg-white">
                <option>Asia/Kolkata (IST)</option>
                <option>America/New_York (EST)</option>
                <option>Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Language</label>
              <select className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright bg-white">
                <option>English</option>
                <option>Hindi</option>
                <option>Telugu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Date Format</label>
              <select className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright bg-white">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              Save Preferences
            </button>
          </div>
        </DashboardPanel>
      </div>
    </div>
  )
}
