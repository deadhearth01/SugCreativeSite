'use client'

import { useEffect, useState } from 'react'
import { PageHeader, DashboardPanel } from '@/components/dashboard/DashboardUI'
import { Download, Eye, Plus, FileText, Briefcase, GraduationCap, Code, Award, Loader2, Trash2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type EducationEntry = {
  degree: string
  institution: string
  year: string
  grade: string
}

type ExperienceEntry = {
  title: string
  company: string
  start_date: string
  end_date: string
  description: string
}

type ProjectEntry = {
  name: string
  description: string
  url: string
}

type CertificationEntry = {
  name: string
  issuer: string
  year: string
}

type ResumeData = {
  full_name: string
  email: string
  phone: string
  linkedin: string
  github: string
  summary: string
  education: EducationEntry[]
  skills: string[]
  experience: ExperienceEntry[]
  projects: ProjectEntry[]
  certifications: CertificationEntry[]
}

type Toast = { message: string; type: 'success' | 'error' }

const emptyResume: ResumeData = {
  full_name: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  summary: '',
  education: [],
  skills: [],
  experience: [],
  projects: [],
  certifications: [],
}

export default function ResumePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resume, setResume] = useState<ResumeData>(emptyResume)
  const [newSkill, setNewSkill] = useState('')
  const [toast, setToast] = useState<Toast | null>(null)
  const [activeSection, setActiveSection] = useState<string>('personal')

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const fetchResume = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('resumes')
        .select('*')
        .eq('student_id', user.id)
        .single()

      if (data) {
        setResume({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          summary: data.summary || '',
          education: data.education || [],
          skills: data.skills || [],
          experience: data.experience || [],
          projects: data.projects || [],
          certifications: data.certifications || [],
        })
      }
      setLoading(false)
    }
    fetchResume()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume),
      })
      if (res.ok) {
        showToast('Resume saved successfully!', 'success')
      } else {
        showToast('Failed to save resume.', 'error')
      }
    } catch {
      showToast('An error occurred.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addEducation = () => {
    setResume({ ...resume, education: [...resume.education, { degree: '', institution: '', year: '', grade: '' }] })
  }
  const removeEducation = (i: number) => {
    setResume({ ...resume, education: resume.education.filter((_, idx) => idx !== i) })
  }
  const updateEducation = (i: number, field: keyof EducationEntry, value: string) => {
    const updated = [...resume.education]
    updated[i] = { ...updated[i], [field]: value }
    setResume({ ...resume, education: updated })
  }

  const addExperience = () => {
    setResume({ ...resume, experience: [...resume.experience, { title: '', company: '', start_date: '', end_date: '', description: '' }] })
  }
  const removeExperience = (i: number) => {
    setResume({ ...resume, experience: resume.experience.filter((_, idx) => idx !== i) })
  }
  const updateExperience = (i: number, field: keyof ExperienceEntry, value: string) => {
    const updated = [...resume.experience]
    updated[i] = { ...updated[i], [field]: value }
    setResume({ ...resume, experience: updated })
  }

  const addProject = () => {
    setResume({ ...resume, projects: [...resume.projects, { name: '', description: '', url: '' }] })
  }
  const removeProject = (i: number) => {
    setResume({ ...resume, projects: resume.projects.filter((_, idx) => idx !== i) })
  }
  const updateProject = (i: number, field: keyof ProjectEntry, value: string) => {
    const updated = [...resume.projects]
    updated[i] = { ...updated[i], [field]: value }
    setResume({ ...resume, projects: updated })
  }

  const addCertification = () => {
    setResume({ ...resume, certifications: [...resume.certifications, { name: '', issuer: '', year: '' }] })
  }
  const removeCertification = (i: number) => {
    setResume({ ...resume, certifications: resume.certifications.filter((_, idx) => idx !== i) })
  }
  const updateCertification = (i: number, field: keyof CertificationEntry, value: string) => {
    const updated = [...resume.certifications]
    updated[i] = { ...updated[i], [field]: value }
    setResume({ ...resume, certifications: updated })
  }

  const addSkill = () => {
    if (newSkill.trim() && !resume.skills.includes(newSkill.trim())) {
      setResume({ ...resume, skills: [...resume.skills, newSkill.trim()] })
      setNewSkill('')
    }
  }
  const removeSkill = (skill: string) => {
    setResume({ ...resume, skills: resume.skills.filter((s) => s !== skill) })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <PageHeader
        title="Resume Builder"
        description="Build and manage your professional resume"
        action={
          <div className="flex gap-3">
            <button className="border border-border rounded-lg px-4 py-2.5 text-sm font-semibold text-primary flex items-center gap-2 hover:bg-off-white transition-colors">
              <Eye size={16} />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Resume
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Nav */}
        <div className="lg:col-span-1">
          <DashboardPanel title="Sections">
            <div className="space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === sec.id ? 'bg-primary text-white' : 'hover:bg-off-white text-foreground/70'}`}
                >
                  <sec.icon size={14} />
                  {sec.label}
                </button>
              ))}
            </div>
          </DashboardPanel>
        </div>

        {/* Form Sections */}
        <div className="lg:col-span-3 space-y-6">
          {/* Personal Info */}
          {activeSection === 'personal' && (
            <DashboardPanel title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resume.full_name}
                    onChange={(e) => setResume({ ...resume, full_name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Email</label>
                  <input
                    type="email"
                    value={resume.email}
                    onChange={(e) => setResume({ ...resume, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={resume.phone}
                    onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={resume.linkedin}
                    onChange={(e) => setResume({ ...resume, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/yourname"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">GitHub</label>
                  <input
                    type="url"
                    value={resume.github}
                    onChange={(e) => setResume({ ...resume, github: e.target.value })}
                    placeholder="github.com/yourname"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Professional Summary</label>
                  <textarea
                    rows={3}
                    value={resume.summary}
                    onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                    placeholder="Brief professional summary..."
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0] resize-none"
                  />
                </div>
              </div>
            </DashboardPanel>
          )}

          {/* Experience */}
          {activeSection === 'experience' && (
            <DashboardPanel
              title="Experience"
              action={
                <button onClick={addExperience} className="text-xs text-[#1A9AB5] font-semibold flex items-center gap-1 hover:underline">
                  <Plus size={12} /> Add Experience
                </button>
              }
            >
              {resume.experience.length === 0 ? (
                <p className="text-sm text-foreground/40 py-8 text-center">No experience entries. Click &quot;Add Experience&quot; to start.</p>
              ) : (
                <div className="space-y-4">
                  {resume.experience.map((exp, i) => (
                    <div key={i} className="border border-border/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-end">
                        <button onClick={() => removeExperience(i)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Job Title" value={exp.title} onChange={(e) => updateExperience(i, 'title', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                        <input type="text" placeholder="Company Name" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                        <input type="text" placeholder="Start Date (e.g. Jan 2023)" value={exp.start_date} onChange={(e) => updateExperience(i, 'start_date', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                        <input type="text" placeholder="End Date (or Present)" value={exp.end_date} onChange={(e) => updateExperience(i, 'end_date', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                      </div>
                      <textarea rows={2} placeholder="Describe your responsibilities..." value={exp.description} onChange={(e) => updateExperience(i, 'description', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0] resize-none" />
                    </div>
                  ))}
                </div>
              )}
            </DashboardPanel>
          )}

          {/* Education */}
          {activeSection === 'education' && (
            <DashboardPanel
              title="Education"
              action={
                <button onClick={addEducation} className="text-xs text-[#1A9AB5] font-semibold flex items-center gap-1 hover:underline">
                  <Plus size={12} /> Add Education
                </button>
              }
            >
              {resume.education.length === 0 ? (
                <p className="text-sm text-foreground/40 py-8 text-center">No education entries. Click &quot;Add Education&quot; to start.</p>
              ) : (
                <div className="space-y-4">
                  {resume.education.map((edu, i) => (
                    <div key={i} className="border border-border/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-end">
                        <button onClick={() => removeEducation(i)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                        <input type="text" placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                        <input type="text" placeholder="Year (e.g. 2020–2024)" value={edu.year} onChange={(e) => updateEducation(i, 'year', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                        <input type="text" placeholder="Grade / CGPA" value={edu.grade} onChange={(e) => updateEducation(i, 'grade', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardPanel>
          )}

          {/* Skills */}
          {activeSection === 'skills' && (
            <DashboardPanel title="Skills">
              <div className="flex flex-wrap gap-2 mb-4">
                {resume.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-off-white px-3 py-1.5 text-xs font-medium text-primary rounded-lg flex items-center gap-1.5"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-foreground/40 hover:text-red-500 transition-colors"><Trash2 size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill (press Enter)"
                  className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                />
                <button
                  onClick={addSkill}
                  className="bg-primary-bright text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-bright/90 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </DashboardPanel>
          )}

          {/* Projects */}
          {activeSection === 'projects' && (
            <DashboardPanel
              title="Projects"
              action={
                <button onClick={addProject} className="text-xs text-[#1A9AB5] font-semibold flex items-center gap-1 hover:underline">
                  <Plus size={12} /> Add Project
                </button>
              }
            >
              {resume.projects.length === 0 ? (
                <p className="text-sm text-foreground/40 py-8 text-center">No projects added yet.</p>
              ) : (
                <div className="space-y-4">
                  {resume.projects.map((proj, i) => (
                    <div key={i} className="border border-border/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-end">
                        <button onClick={() => removeProject(i)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Project Name" value={proj.name} onChange={(e) => updateProject(i, 'name', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                        <input type="url" placeholder="Project URL" value={proj.url} onChange={(e) => updateProject(i, 'url', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                      </div>
                      <textarea rows={2} placeholder="Describe the project..." value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0] resize-none" />
                    </div>
                  ))}
                </div>
              )}
            </DashboardPanel>
          )}

          {/* Certifications */}
          {activeSection === 'certifications' && (
            <DashboardPanel
              title="Certifications"
              action={
                <button onClick={addCertification} className="text-xs text-[#1A9AB5] font-semibold flex items-center gap-1 hover:underline">
                  <Plus size={12} /> Add Certification
                </button>
              }
            >
              {resume.certifications.length === 0 ? (
                <p className="text-sm text-foreground/40 py-8 text-center">No certifications added yet.</p>
              ) : (
                <div className="space-y-4">
                  {resume.certifications.map((cert, i) => (
                    <div key={i} className="border border-border/50 rounded-lg p-4">
                      <div className="flex justify-end mb-2">
                        <button onClick={() => removeCertification(i)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input type="text" placeholder="Certification Name" value={cert.name} onChange={(e) => updateCertification(i, 'name', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                        <input type="text" placeholder="Issuing Organization" value={cert.issuer} onChange={(e) => updateCertification(i, 'issuer', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                        <input type="text" placeholder="Year" value={cert.year} onChange={(e) => updateCertification(i, 'year', e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#35C8E0]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardPanel>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
