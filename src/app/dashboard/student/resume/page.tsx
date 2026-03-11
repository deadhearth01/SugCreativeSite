'use client'

import { PageHeader, DashboardPanel } from '@/components/dashboard/DashboardUI'
import { Download, Eye, Plus, FileText, Briefcase, GraduationCap, Code, Award } from 'lucide-react'

export default function ResumePage() {
  return (
    <div>
      <PageHeader
        title="Resume Builder"
        description="Build and manage your professional resume"
        action={
          <div className="flex gap-3">
            <button className="border border-border rounded-lg px-4 py-2.5 text-sm font-semibold text-primary flex items-center gap-2 hover:bg-off-white transition-colors">
              <Eye size={16} />
              Preview
            </button>
            <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
              <Download size={16} />
              Download PDF
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Form */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardPanel title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Full Name</label>
                <input type="text" placeholder="Your full name" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Email</label>
                <input type="email" placeholder="your@email.com" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Phone</label>
                <input type="tel" placeholder="+91 98765 43210" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Location</label>
                <input type="text" placeholder="City, State" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground/70 mb-1">Professional Summary</label>
                <textarea rows={3} placeholder="Brief professional summary..." className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-bright resize-none" />
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel title="Experience" action={<button className="text-xs text-primary-bright font-semibold flex items-center gap-1"><Plus size={12} /> Add</button>}>
            <div className="border border-border/50 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Job Title" className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
                <input type="text" placeholder="Company Name" className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
                <input type="text" placeholder="Start Date" className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
                <input type="text" placeholder="End Date" className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
              </div>
              <textarea rows={2} placeholder="Describe your responsibilities..." className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-bright resize-none" />
            </div>
          </DashboardPanel>

          <DashboardPanel title="Education" action={<button className="text-xs text-primary-bright font-semibold flex items-center gap-1"><Plus size={12} /> Add</button>}>
            <div className="border border-border/50 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Degree" className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
                <input type="text" placeholder="Institution" className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
                <input type="text" placeholder="Year" className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
                <input type="text" placeholder="Grade / CGPA" className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary-bright" />
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel title="Skills" action={<button className="text-xs text-primary-bright font-semibold flex items-center gap-1"><Plus size={12} /> Add</button>}>
            <div className="flex flex-wrap gap-2">
              {['Microsoft Office', 'Communication', 'Problem Solving', 'Leadership'].map((skill) => (
                <span key={skill} className="bg-off-white px-3 py-1.5 text-xs font-medium text-primary">{skill}</span>
              ))}
              <button className="border border-dashed border-border px-3 py-1.5 text-xs text-foreground/40 hover:border-primary-bright hover:text-primary-bright transition-colors">
                + Add Skill
              </button>
            </div>
          </DashboardPanel>
        </div>

        {/* Template Selector */}
        <div>
          <DashboardPanel title="Choose Template">
            <div className="space-y-3">
              {[
                { name: 'Classic', desc: 'Clean, traditional layout', active: true },
                { name: 'Modern', desc: 'Contemporary design with color accents', active: false },
                { name: 'Minimal', desc: 'Simple and elegant', active: false },
                { name: 'Creative', desc: 'Stand out with a unique layout', active: false },
              ].map((template) => (
                <button
                  key={template.name}
                  className={`w-full text-left p-3 border transition-colors ${
                    template.active ? 'border-primary-bright bg-primary-bright/5' : 'border-border hover:border-primary-bright/50'
                  }`}
                >
                  <p className="text-sm font-medium text-primary">{template.name}</p>
                  <p className="text-xs text-foreground/50">{template.desc}</p>
                </button>
              ))}
            </div>
          </DashboardPanel>

          <div className="mt-6">
            <DashboardPanel title="Sections">
              <div className="space-y-2">
                {[
                  { label: 'Experience', icon: Briefcase },
                  { label: 'Education', icon: GraduationCap },
                  { label: 'Skills', icon: Code },
                  { label: 'Certifications', icon: Award },
                  { label: 'Projects', icon: FileText },
                ].map((sec) => (
                  <div key={sec.label} className="flex items-center justify-between p-2">
                    <span className="flex items-center gap-2 text-sm text-primary"><sec.icon size={14} className="text-primary-bright" />{sec.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-8 h-4 bg-gray-200 peer-checked:bg-primary-bright rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                ))}
              </div>
            </DashboardPanel>
          </div>
        </div>
      </div>
    </div>
  )
}
