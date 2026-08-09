'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, Save, Plus, Trash2, ImageIcon, Eye, ExternalLink,
  ChevronDown, GripVertical, RotateCcw, Monitor, Smartphone,
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { createClient } from '@/lib/supabase/client'
import ImagePickerModal from '@/components/admin/ImagePickerModal'
import InternshipsPageView, {
  type InternshipProgram,
} from '@/components/internships/InternshipsPageView'
import {
  DEFAULT_INTERNSHIPS_CONTENT,
  WHY_ICON_OPTIONS,
  mergeInternshipsContent,
  type InternshipsContent,
} from '@/lib/pageContent'

/* ────────────────────────── small field primitives ────────────────────────── */

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-foreground/40 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all'

function TextField({
  label, value, onChange, placeholder, hint,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; hint?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </Field>
  )
}

function AreaField({
  label, value, onChange, rows = 3, hint, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void
  rows?: number; hint?: string; placeholder?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${inputCls} resize-none`}
      />
    </Field>
  )
}

function Section({
  id, title, description, open, onToggle, children,
}: {
  id: string; title: string; description: string
  open: boolean; onToggle: (id: string) => void; children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50/70 transition-colors"
      >
        <span>
          <span className="block text-sm font-bold text-primary">{title}</span>
          <span className="block text-[11px] text-foreground/50 mt-0.5">{description}</span>
        </span>
        <ChevronDown
          size={18}
          className={`text-foreground/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-5 pb-5 pt-1 space-y-4 border-t border-gray-100">{children}</div>}
    </div>
  )
}

/** Add / remove / reorder controls shared by every repeatable list. */
function ListControls({
  index, total, onMove, onRemove,
}: {
  index: number; total: number
  onMove: (from: number, to: number) => void
  onRemove: (i: number) => void
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        className="p-1.5 text-foreground/40 hover:text-primary disabled:opacity-25 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Move up"
      >
        <GripVertical size={14} className="rotate-180" />
      </button>
      <button
        type="button"
        disabled={index === total - 1}
        onClick={() => onMove(index, index + 1)}
        className="p-1.5 text-foreground/40 hover:text-primary disabled:opacity-25 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Move down"
      >
        <GripVertical size={14} />
      </button>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-1.5 text-foreground/40 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
        aria-label="Remove"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1A9AB5] hover:text-[#35C8E0] transition-colors"
    >
      <Plus size={15} /> {label}
    </button>
  )
}

/* ──────────────────────────────── page ──────────────────────────────── */

export default function InternshipsPageEditor() {
  const [content, setContent] = useState<InternshipsContent>(DEFAULT_INTERNSHIPS_CONTENT)
  const [programs, setPrograms] = useState<InternshipProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [openSection, setOpenSection] = useState<string>('hero')
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  // Warn before losing unsaved edits.
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const [contentRes, courseRes] = await Promise.all([
          fetch('/api/page-content?page=internships').then((r) => r.json()).catch(() => ({})),
          supabase
            .from('courses')
            .select('id, title, slug, description, thumbnail_url, duration_text, tech_stack')
            .eq('status', 'active')
            .eq('course_type', 'training')
            .order('created_at', { ascending: false }),
        ])
        setContent(mergeInternshipsContent(contentRes?.data))
        setPrograms((courseRes.data ?? []) as InternshipProgram[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /** Typed section updater — keeps every edit handler a one-liner. */
  const update = useCallback(
    <K extends keyof InternshipsContent>(
      section: K,
      patch: Partial<InternshipsContent[K]>
    ) => {
      setContent((c) => ({ ...c, [section]: { ...c[section], ...patch } }))
      setDirty(true)
    },
    []
  )

  function moveItem<T>(arr: T[], from: number, to: number): T[] {
    if (to < 0 || to >= arr.length) return arr
    const next = [...arr]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 'internships', sections: content }),
      })
      const json = await res.json()
      if (!res.ok) {
        setToast({ message: json.error || 'Failed to save', type: 'error' })
        return
      }
      setDirty(false)
      setToast({ message: 'Saved — the live page is updated', type: 'success' })
    } catch {
      setToast({ message: 'Failed to save', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const resetSection = (section: keyof InternshipsContent) => {
    setContent((c) => ({ ...c, [section]: DEFAULT_INTERNSHIPS_CONTENT[section] }))
    setDirty(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  const toggle = (id: string) => setOpenSection((s) => (s === id ? '' : id))

  return (
    <div>
      <PageHeader
        title="Internships Page"
        description="Edit every heading, paragraph, image and list on the public /internships page"
      />

      {toast && (
        <div
          className={`fixed top-6 right-6 z-[60] px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-[#82C93D] text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Action bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border border-gray-200 rounded-2xl px-4 py-3 mb-6 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Eye size={16} className="text-[#1A9AB5]" />
          <span className="font-semibold text-primary">Live preview</span>
          {dirty ? (
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Unsaved changes
            </span>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#82C93D] bg-[#82C93D]/10 px-2 py-0.5 rounded-full">
              In sync with live
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setPreviewWidth('desktop')}
              className={`p-1.5 rounded-lg transition-colors ${
                previewWidth === 'desktop' ? 'bg-white shadow-sm text-primary' : 'text-foreground/40'
              }`}
              aria-label="Desktop preview"
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setPreviewWidth('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${
                previewWidth === 'mobile' ? 'bg-white shadow-sm text-primary' : 'text-foreground/40'
              }`}
              aria-label="Mobile preview"
            >
              <Smartphone size={15} />
            </button>
          </div>
          <Link
            href="/internships"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground/60 hover:text-primary border border-gray-200 rounded-xl transition-colors"
          >
            <ExternalLink size={15} /> Open live page
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-white text-sm font-bold rounded-xl shadow-md hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 items-start">
        {/* ── Editor column ── */}
        <div className="space-y-3">
          {/* HERO */}
          <Section
            id="hero"
            title="1 · Hero"
            description="Top banner, intro paragraphs, image and buttons"
            open={openSection === 'hero'}
            onToggle={toggle}
          >
            <TextField
              label="Eyebrow"
              value={content.hero.eyebrow}
              onChange={(v) => update('hero', { eyebrow: v })}
              hint="Small label above the page title"
            />
            <TextField
              label="Title (line 1)"
              value={content.hero.title}
              onChange={(v) => update('hero', { title: v })}
            />
            <TextField
              label="Title (line 2, coloured)"
              value={content.hero.titleAccent}
              onChange={(v) => update('hero', { titleAccent: v })}
            />
            <AreaField
              label="Paragraph 1"
              value={content.hero.body}
              onChange={(v) => update('hero', { body: v })}
              rows={4}
            />
            <AreaField
              label="Paragraph 2"
              value={content.hero.body2}
              onChange={(v) => update('hero', { body2: v })}
              rows={3}
            />

            <Field label="Hero image" hint="Search Unsplash or paste any image URL">
              <div className="flex items-center gap-3">
                <div className="w-24 h-16 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                  {content.hero.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={content.hero.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={18} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={content.hero.image}
                    onChange={(e) => update('hero', { image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className={inputCls}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1A9AB5] border border-[#35C8E0] rounded-lg hover:bg-[#35C8E0]/10 transition-colors"
                    >
                      <ImageIcon size={13} /> Search Unsplash
                    </button>
                    {content.hero.image && (
                      <button
                        type="button"
                        onClick={() => update('hero', { image: '' })}
                        className="px-3 py-1.5 text-xs font-semibold text-foreground/50 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Primary button"
                value={content.hero.primaryCta}
                onChange={(v) => update('hero', { primaryCta: v })}
              />
              <TextField
                label="Primary link"
                value={content.hero.primaryHref}
                onChange={(v) => update('hero', { primaryHref: v })}
                placeholder="/contact"
              />
              <TextField
                label="Secondary button"
                value={content.hero.secondaryCta}
                onChange={(v) => update('hero', { secondaryCta: v })}
              />
              <TextField
                label="Secondary link"
                value={content.hero.secondaryHref}
                onChange={(v) => update('hero', { secondaryHref: v })}
                placeholder="#programs"
              />
            </div>
            <p className="text-[11px] text-foreground/40">
              Links must start with <code>/</code> or <code>#</code>. Anything else falls back to /contact.
            </p>
          </Section>

          {/* STATS */}
          <Section
            id="stats"
            title="2 · Stats strip"
            description="The numbers row under the hero"
            open={openSection === 'stats'}
            onToggle={toggle}
          >
            {content.stats.items.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) =>
                      update('stats', {
                        items: content.stats.items.map((x, xi) =>
                          xi === i ? { ...x, value: e.target.value } : x
                        ),
                      })
                    }
                    placeholder="800+"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) =>
                      update('stats', {
                        items: content.stats.items.map((x, xi) =>
                          xi === i ? { ...x, label: e.target.value } : x
                        ),
                      })
                    }
                    placeholder="Students Placed"
                    className={inputCls}
                  />
                </div>
                <ListControls
                  index={i}
                  total={content.stats.items.length}
                  onMove={(from, to) =>
                    update('stats', { items: moveItem(content.stats.items, from, to) })
                  }
                  onRemove={(idx) =>
                    update('stats', { items: content.stats.items.filter((_, xi) => xi !== idx) })
                  }
                />
              </div>
            ))}
            <div className="flex items-center justify-between">
              <AddButton
                label="Add stat"
                onClick={() =>
                  update('stats', { items: [...content.stats.items, { value: '', label: '' }] })
                }
              />
              <button
                type="button"
                onClick={() => resetSection('stats')}
                className="inline-flex items-center gap-1 text-xs text-foreground/40 hover:text-foreground/70"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </Section>

          {/* PROGRAMS */}
          <Section
            id="programs"
            title="3 · Programs heading"
            description="Heading above the internship cards"
            open={openSection === 'programs'}
            onToggle={toggle}
          >
            <TextField
              label="Eyebrow"
              value={content.programs.eyebrow}
              onChange={(v) => update('programs', { eyebrow: v })}
            />
            <TextField
              label="Title"
              value={content.programs.title}
              onChange={(v) => update('programs', { title: v })}
            />
            <AreaField
              label="Subtitle (optional)"
              value={content.programs.subtitle}
              onChange={(v) => update('programs', { subtitle: v })}
              rows={2}
            />
            <div className="rounded-xl bg-[#35C8E0]/5 border border-[#35C8E0]/20 p-3">
              <p className="text-xs text-foreground/60 leading-relaxed">
                The cards themselves come from{' '}
                <Link href="/dashboard/admin/courses" className="font-semibold text-[#1A9AB5] underline">
                  Course Management
                </Link>
                . Any active course with type{' '}
                <span className="font-semibold">Training / Internship</span> appears here.
                {' '}Currently <span className="font-bold">{programs.length}</span> published.
              </p>
            </div>
          </Section>

          {/* WHY */}
          <Section
            id="why"
            title="4 · Why intern with us"
            description="Benefit cards with icons"
            open={openSection === 'why'}
            onToggle={toggle}
          >
            <TextField
              label="Eyebrow"
              value={content.why.eyebrow}
              onChange={(v) => update('why', { eyebrow: v })}
            />
            <TextField
              label="Title"
              value={content.why.title}
              onChange={(v) => update('why', { title: v })}
            />
            <div className="space-y-3 pt-1">
              {content.why.items.map((item, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={item.icon}
                      onChange={(e) =>
                        update('why', {
                          items: content.why.items.map((x, xi) =>
                            xi === i ? { ...x, icon: e.target.value } : x
                          ),
                        })
                      }
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#35C8E0]"
                    >
                      {WHY_ICON_OPTIONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        update('why', {
                          items: content.why.items.map((x, xi) =>
                            xi === i ? { ...x, title: e.target.value } : x
                          ),
                        })
                      }
                      placeholder="Card title"
                      className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                    />
                    <ListControls
                      index={i}
                      total={content.why.items.length}
                      onMove={(from, to) => update('why', { items: moveItem(content.why.items, from, to) })}
                      onRemove={(idx) =>
                        update('why', { items: content.why.items.filter((_, xi) => xi !== idx) })
                      }
                    />
                  </div>
                  <textarea
                    value={item.body}
                    onChange={(e) =>
                      update('why', {
                        items: content.why.items.map((x, xi) =>
                          xi === i ? { ...x, body: e.target.value } : x
                        ),
                      })
                    }
                    rows={2}
                    placeholder="Card description"
                    className={`${inputCls} resize-none`}
                  />
                </div>
              ))}
            </div>
            <AddButton
              label="Add benefit card"
              onClick={() =>
                update('why', {
                  items: [...content.why.items, { icon: 'sparkles', title: '', body: '' }],
                })
              }
            />
          </Section>

          {/* JOURNEY */}
          <Section
            id="journey"
            title="5 · Internship journey"
            description="Numbered step-by-step cards"
            open={openSection === 'journey'}
            onToggle={toggle}
          >
            <TextField
              label="Eyebrow"
              value={content.journey.eyebrow}
              onChange={(v) => update('journey', { eyebrow: v })}
            />
            <TextField
              label="Title"
              value={content.journey.title}
              onChange={(v) => update('journey', { title: v })}
            />
            <div className="space-y-3 pt-1">
              {content.journey.items.map((step, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#35C8E0]/10 text-[#1A9AB5] text-xs font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) =>
                        update('journey', {
                          items: content.journey.items.map((x, xi) =>
                            xi === i ? { ...x, title: e.target.value } : x
                          ),
                        })
                      }
                      placeholder="Step title"
                      className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                    />
                    <ListControls
                      index={i}
                      total={content.journey.items.length}
                      onMove={(from, to) =>
                        update('journey', { items: moveItem(content.journey.items, from, to) })
                      }
                      onRemove={(idx) =>
                        update('journey', {
                          items: content.journey.items.filter((_, xi) => xi !== idx),
                        })
                      }
                    />
                  </div>
                  <textarea
                    value={step.body}
                    onChange={(e) =>
                      update('journey', {
                        items: content.journey.items.map((x, xi) =>
                          xi === i ? { ...x, body: e.target.value } : x
                        ),
                      })
                    }
                    rows={2}
                    placeholder="What happens at this step"
                    className={`${inputCls} resize-none`}
                  />
                </div>
              ))}
            </div>
            <AddButton
              label="Add step"
              onClick={() =>
                update('journey', { items: [...content.journey.items, { title: '', body: '' }] })
              }
            />
          </Section>

          {/* TESTIMONIALS */}
          <Section
            id="testimonials"
            title="6 · Intern testimonials"
            description="Quotes, names and star ratings"
            open={openSection === 'testimonials'}
            onToggle={toggle}
          >
            <TextField
              label="Eyebrow"
              value={content.testimonials.eyebrow}
              onChange={(v) => update('testimonials', { eyebrow: v })}
            />
            <TextField
              label="Title"
              value={content.testimonials.title}
              onChange={(v) => update('testimonials', { title: v })}
            />
            <div className="space-y-3 pt-1">
              {content.testimonials.items.map((t, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) =>
                        update('testimonials', {
                          items: content.testimonials.items.map((x, xi) =>
                            xi === i ? { ...x, name: e.target.value } : x
                          ),
                        })
                      }
                      placeholder="Name"
                      className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                    />
                    <input
                      type="text"
                      value={t.role}
                      onChange={(e) =>
                        update('testimonials', {
                          items: content.testimonials.items.map((x, xi) =>
                            xi === i ? { ...x, role: e.target.value } : x
                          ),
                        })
                      }
                      placeholder="INTERN"
                      className="w-24 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#35C8E0]"
                    />
                    <select
                      value={t.rating}
                      onChange={(e) =>
                        update('testimonials', {
                          items: content.testimonials.items.map((x, xi) =>
                            xi === i ? { ...x, rating: Number(e.target.value) } : x
                          ),
                        })
                      }
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#35C8E0]"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} ★</option>
                      ))}
                    </select>
                    <ListControls
                      index={i}
                      total={content.testimonials.items.length}
                      onMove={(from, to) =>
                        update('testimonials', {
                          items: moveItem(content.testimonials.items, from, to),
                        })
                      }
                      onRemove={(idx) =>
                        update('testimonials', {
                          items: content.testimonials.items.filter((_, xi) => xi !== idx),
                        })
                      }
                    />
                  </div>
                  <textarea
                    value={t.quote}
                    onChange={(e) =>
                      update('testimonials', {
                        items: content.testimonials.items.map((x, xi) =>
                          xi === i ? { ...x, quote: e.target.value } : x
                        ),
                      })
                    }
                    rows={2}
                    placeholder="What the intern said"
                    className={`${inputCls} resize-none`}
                  />
                </div>
              ))}
            </div>
            <AddButton
              label="Add testimonial"
              onClick={() =>
                update('testimonials', {
                  items: [
                    ...content.testimonials.items,
                    { quote: '', name: '', role: 'INTERN', rating: 5 },
                  ],
                })
              }
            />
          </Section>

          {/* CTA */}
          <Section
            id="cta"
            title="7 · Closing call-to-action"
            description="The apply banner at the bottom"
            open={openSection === 'cta'}
            onToggle={toggle}
          >
            <TextField
              label="Title"
              value={content.cta.title}
              onChange={(v) => update('cta', { title: v })}
            />
            <AreaField
              label="Body"
              value={content.cta.body}
              onChange={(v) => update('cta', { body: v })}
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Primary button"
                value={content.cta.primaryCta}
                onChange={(v) => update('cta', { primaryCta: v })}
              />
              <TextField
                label="Primary link"
                value={content.cta.primaryHref}
                onChange={(v) => update('cta', { primaryHref: v })}
              />
              <TextField
                label="Secondary button"
                value={content.cta.secondaryCta}
                onChange={(v) => update('cta', { secondaryCta: v })}
              />
              <TextField
                label="Secondary link"
                value={content.cta.secondaryHref}
                onChange={(v) => update('cta', { secondaryHref: v })}
              />
            </div>
          </Section>
        </div>

        {/* ── Live preview column ── */}
        <div className="hidden xl:block sticky top-24">
          <div className="rounded-2xl border border-gray-200 bg-gray-100 shadow-inner overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-[11px] font-medium text-foreground/40">
                sugcreative.com/internships
              </span>
            </div>
            <div className="max-h-[calc(100vh-13rem)] overflow-y-auto overflow-x-hidden bg-white">
              {/* Scaled down so a full-width layout is readable in the panel. */}
              <div
                className="origin-top-left"
                style={{
                  width: previewWidth === 'desktop' ? '1280px' : '420px',
                  transform: `scale(${previewWidth === 'desktop' ? 0.52 : 0.9})`,
                  height: previewWidth === 'desktop' ? '192%' : '111%',
                }}
              >
                <InternshipsPageView content={content} programs={programs} />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-foreground/40 mt-2 text-center">
            Preview updates as you type. Click <span className="font-semibold">Save changes</span> to publish.
          </p>
        </div>
      </div>

      <ImagePickerModal
        open={showImagePicker}
        initialQuery="internship office team"
        currentUrl={content.hero.image}
        onSelect={(url) => {
          update('hero', { image: url })
          setShowImagePicker(false)
        }}
        onClose={() => setShowImagePicker(false)}
      />
    </div>
  )
}
