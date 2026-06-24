# Phase 1 — Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the course create/update schema-cache error and relabel the marketing site's services (home, `/services`, navbar) around the new pillars with Study Abroad on top, plus tidy the homepage hero spacing.

**Architecture:** One Supabase migration adds the two missing `courses` columns the app already references. The rest are surgical edits to three existing frontend files (`src/app/page.tsx`, `src/app/services/page.tsx`, `src/components/Navbar.tsx`) — swapping data arrays and copy, no new components.

**Tech Stack:** Next.js 16 (App Router, `'use client'` pages), React 19, Tailwind v4, lucide-react icons, Supabase (Postgres). No test runner is installed — verification uses `npx tsc --noEmit`, `npm run lint`, `npm run build`, the dev server (`npm run dev`, port **3003**), and SQL checks in Supabase.

## Global Constraints

- **Brand palette:** primary green `#82C93D`, dark `primary-dark`, accent `#1A9AB5`. Use existing Tailwind tokens (`text-primary`, `text-primary-dark`, `bg-primary`) — do not introduce new color systems.
- **Design language:** neo-brutalist cards — `border-2 border-primary-dark`, hard offset shadows `shadow-[Npx_Npx_0px_rgba(0,0,0,1)]`, rounded corners. Match the surrounding code.
- **The four service pillars, in this exact order:** `01 Study Abroad → 02 Trainings → 03 Student Career Services → 04 Edu Services`.
- **Anchor ids (must match across navbar + services page):** `study-abroad`, `trainings`, `career-services`, `edu-services`.
- **Do not touch** the `/business-solutions` page (B2B content stays).
- **Commit** after each task. No pushing.
- Migration file naming: `supabase/migrations/YYYYMMDD_<title>.sql`.

---

## File Structure

- **Create** `supabase/migrations/20260624_courses_enrollment_limit_display_order.sql` — adds `enrollment_limit`, `display_order` to `courses` (Task 1).
- **Modify** `src/app/page.tsx` — hero spacing (Task 2) + home "Our Services" pillar block (Task 3). *Same file → Tasks 2 and 3 are sequential.*
- **Modify** `src/app/services/page.tsx` — replace `serviceCategories` data with the 4 pillars (Task 4).
- **Modify** `src/components/Navbar.tsx` — Services dropdown subItems → pillars (Task 5).

**Parallelization (for execution):** Task 1 (migration), Tasks 2+3 (home, sequential together), Task 4 (services), Task 5 (navbar) touch disjoint files — they can run as 4 parallel sub-agents. Task 4 and Task 5 share the anchor-id contract from Global Constraints.

---

### Task 1: Fix `courses` schema — add `enrollment_limit` + `display_order`

**Root cause:** `src/app/dashboard/admin/courses/page.tsx`, `src/lib/courses.ts:12`, and `src/app/api/courses/[id]/enroll/route.ts` all reference `enrollment_limit`, but the `courses` table (in `supabase-schema.sql`) only has `max_students`. No migration ever added `enrollment_limit`, so PostgREST's schema cache errors on write — exactly the screenshot: *"Could not find the 'enrollment_limit' column of 'courses' in the schema cache."* `display_order` is added now too (the app's homepage ordering needs it in a later phase, and adding both in one migration avoids a second DDL round-trip).

**Files:**
- Create: `supabase/migrations/20260624_courses_enrollment_limit_display_order.sql`

**Interfaces:**
- Produces: `courses.enrollment_limit` (INTEGER, nullable), `courses.display_order` (INTEGER, default 0), index `idx_courses_display_order`. Consumed by the existing admin course form and `src/lib/courses.ts` passthrough.

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/20260624_courses_enrollment_limit_display_order.sql`:

```sql
-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Courses — add enrollment_limit + display_order                      ║
-- ║                                                                       ║
-- ║  The admin course form and src/lib/courses.ts already write           ║
-- ║  `enrollment_limit`, but the column never existed (schema has         ║
-- ║  `max_students`). This caused: "Could not find the 'enrollment_limit' ║
-- ║  column of 'courses' in the schema cache". `display_order` is added   ║
-- ║  for admin-controlled homepage ordering.                              ║
-- ╚══════════════════════════════════════════════════════════════════════╝

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS enrollment_limit INTEGER,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Order the existing rows deterministically so admin reordering starts sane.
UPDATE courses SET display_order = 0 WHERE display_order IS NULL;

CREATE INDEX IF NOT EXISTS idx_courses_display_order ON courses(display_order);

-- Force PostgREST (Supabase API) to reload its schema cache immediately.
NOTIFY pgrst, 'reload schema';
```

- [ ] **Step 2: Confirm it does not break the type-check or build (no code references change)**

Run: `npx tsc --noEmit`
Expected: exits 0 (the columns were already referenced in TS; this only makes the DB match).

- [ ] **Step 3: Apply + verify in Supabase (manual — requires DB access)**

The agent cannot reach the user's Supabase DB. Leave this for the user to run in the Supabase SQL editor, then verify:

```sql
-- Run the migration file contents, then:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'courses'
  AND column_name IN ('enrollment_limit', 'display_order');
```
Expected: two rows returned (`enrollment_limit | integer`, `display_order | integer`).
Then in the app: open Admin → Courses → edit a course → **Update Course** → the red "schema cache" toast no longer appears and the save succeeds.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260624_courses_enrollment_limit_display_order.sql
git commit -m "fix: add enrollment_limit + display_order to courses (schema cache error)"
```

---

### Task 2: Homepage hero spacing

**Files:**
- Modify: `src/app/page.tsx` (hero `<section>` ~175, left content column ~178)

**Interfaces:**
- Consumes: nothing. Produces: nothing (visual only).

The hero stacks `min-h-screen` + `pb-24 md:pb-32` on the section AND `pt-24 pb-20 lg:pt-24 lg:pb-24` on the inner column, creating an oversized gap before the "Placement Success" bar (which itself adds `pt-24 md:pt-36`). Reduce the doubled bottom padding.

- [ ] **Step 1: Trim the section's bottom padding**

In `src/app/page.tsx`, change the hero section opening tag (currently):

```tsx
      <section className="min-h-screen flex bg-white overflow-hidden pb-24 md:pb-32">
```

to:

```tsx
      <section className="min-h-screen flex bg-white overflow-hidden pb-12 md:pb-16">
```

- [ ] **Step 2: Trim the inner content column's bottom padding**

In the same file, change the left content column `<div>` (currently):

```tsx
        <div className="relative z-10 w-full lg:w-[45%] flex flex-col justify-end px-6 sm:px-10 lg:pl-16 lg:pr-8 pt-24 pb-20 lg:pt-24 lg:pb-24 flex-shrink-0">
```

to:

```tsx
        <div className="relative z-10 w-full lg:w-[45%] flex flex-col justify-end px-6 sm:px-10 lg:pl-16 lg:pr-8 pt-24 pb-10 lg:pt-24 lg:pb-12 flex-shrink-0">
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Visual check**

Run: `npm run dev` (port 3003), open `http://localhost:3003/`. Confirm the hero no longer leaves an excessive blank gap above "Our SUGians Are Placed At…", and the headline/stats/CTAs remain vertically balanced. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "fix: tighten homepage hero vertical spacing"
```

---

### Task 3: Homepage "Our Services" pillar block (replace Web Dev / UI-UX)

**Files:**
- Modify: `src/app/page.tsx` — import line ~5, `businessServices` array ~154–159, section badge/heading/intro ~401–410, render map ~411–423

**Interfaces:**
- Consumes: anchor ids from Global Constraints (`/services#study-abroad`, etc.).
- Produces: nothing downstream.

The home block currently markets Web Development / UI-UX / Software Development / IT Consulting under a "Business Solutions" badge. Replace the four items with the four pillars, retitle the block to "Our Services", and make each card link to its `/services` anchor.

- [ ] **Step 1: Add the two icons used by the pillars to the import**

In `src/app/page.tsx` line ~5, the lucide import currently ends `…ArrowRight }`. Add `Plane` and `BookOpen`:

```tsx
import { ArrowUpRight, CheckCircle2, TrendingUp, GraduationCap, Award, Users, Clock, Play, Briefcase, Calendar, Star, Quote, Building2, Shield, Cpu, Globe, Server, Code2, Palette, Settings, Zap, Target, Rocket, BadgeCheck, ArrowRight, Plane, BookOpen } from 'lucide-react'
```

- [ ] **Step 2: Replace the `businessServices` array with the four pillars**

Replace (currently `src/app/page.tsx` ~153–159):

```tsx
// Business services
const businessServices = [
  { Icon: Globe, title: 'Web Development', desc: 'Custom websites & web applications' },
  { Icon: Palette, title: 'UI/UX Design', desc: 'User-centered design solutions' },
  { Icon: Code2, title: 'Software Development', desc: 'Scalable enterprise software' },
  { Icon: Settings, title: 'IT Consulting', desc: 'Digital transformation strategy' },
]
```

with:

```tsx
// Service pillars — Study Abroad leads. Links jump to the matching /services anchor.
const servicePillars = [
  { Icon: Plane, title: 'Study Abroad', desc: 'Global education & overseas admissions', href: '/services#study-abroad' },
  { Icon: GraduationCap, title: 'Trainings', desc: 'Industry-led professional training', href: '/services#trainings' },
  { Icon: Briefcase, title: 'Student Career Services', desc: 'Resume, interviews & placement support', href: '/services#career-services' },
  { Icon: BookOpen, title: 'Edu Services', desc: 'Curriculum & ed-tech solutions', href: '/services#edu-services' },
]
```

- [ ] **Step 3: Update the section badge, heading, and intro copy**

In the "Business Solutions" section (~401–410), replace:

```tsx
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                <Zap size={14} className="inline mr-2" />
                Business Solutions
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight mb-6">
                We Also Excel In<br /><span className="text-primary">Digital Transformation</span>
              </h2>
              <p className="text-primary-dark/70 text-lg font-medium leading-relaxed mb-8">
                Beyond education, we help businesses thrive with cutting-edge technology solutions. From web development to IT consulting, we've partnered with <strong className="text-primary-dark">200+ businesses</strong> across industries.
              </p>
```

with:

```tsx
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                <Zap size={14} className="inline mr-2" />
                Our Services
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight mb-6">
                Everything You Need<br /><span className="text-primary">To Go Global</span>
              </h2>
              <p className="text-primary-dark/70 text-lg font-medium leading-relaxed mb-8">
                From studying abroad to landing your first role, our services cover every step. We've guided <strong className="text-primary-dark">thousands of students</strong> across study-abroad journeys, training, and careers.
              </p>
```

- [ ] **Step 4: Make the cards link to their anchors**

Replace the render map (~411–423, the `businessServices.map(...)` block):

```tsx
              <div className="grid grid-cols-2 gap-4 mb-8">
                {businessServices.map((service) => (
                  <div key={service.title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-black/8 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <service.Icon size={20} />
                    </div>
                    <div>
                      <div className="font-black text-primary-dark text-sm">{service.title}</div>
                      <div className="text-xs text-primary-dark/60">{service.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
```

with (now a `Link`, keeping the existing visual style):

```tsx
              <div className="grid grid-cols-2 gap-4 mb-8">
                {servicePillars.map((service) => (
                  <Link key={service.title} href={service.href} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-black/8 hover:border-primary/30 hover:-translate-y-0.5 transition-all">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <service.Icon size={20} />
                    </div>
                    <div>
                      <div className="font-black text-primary-dark text-sm">{service.title}</div>
                      <div className="text-xs text-primary-dark/60">{service.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
```

- [ ] **Step 5: Type-check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: tsc exits 0; lint reports no new errors. If lint flags `Code2`/`Palette`/`Settings` as now-unused in `page.tsx`, leave them only if still referenced elsewhere in the file; otherwise remove those three names from the import to satisfy lint.

- [ ] **Step 6: Visual check**

Dev server → `http://localhost:3003/`. Confirm the block shows the four pillars (Study Abroad first), the badge reads "Our Services", and clicking a card navigates to `/services` and scrolls to the right section (works after Task 4).

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: replace homepage business-services block with service pillars (Study Abroad first)"
```

---

### Task 4: `/services` page — restructure into the four pillars

**Files:**
- Modify: `src/app/services/page.tsx` — lucide import ~8–27, `serviceCategories` array ~35–126

**Interfaces:**
- Consumes: anchor ids from Global Constraints. The page renders each category's `id` as the DOM id (`document.getElementById(cat.id)`, line ~158) and shows `serviceCategories.slice(0, 4)` in the hero grid (~245), so **exactly 4 entries** keeps the hero grid full. `sectionBgs` (~128–134) already has 5 entries; the first 4 are used.
- Produces: sections with ids `study-abroad`, `trainings`, `career-services`, `edu-services`.

- [ ] **Step 1: Ensure the icons used below are imported**

In `src/app/services/page.tsx`, the import block (~8–27) already includes `GraduationCap, Briefcase, Monitor, BarChart3, Users, PenTool, Target, BookOpen, Building2, TrendingUp, FileText, Presentation, Trophy`. Add `Plane`, `Compass`, `Languages`, `Award`, `Wallet` for the Study Abroad / pillars. Update the import to include them (add the missing names to the existing `{ ... }` list):

```tsx
import {
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Rocket,
  Monitor,
  Trophy,
  BarChart3,
  Users,
  Code,
  PenTool,
  Target,
  BookOpen,
  Lightbulb,
  Building2,
  TrendingUp,
  FileText,
  Presentation,
  CheckCircle2,
  Plane,
  Compass,
  Languages,
  Award,
  Wallet,
} from 'lucide-react'
```

- [ ] **Step 2: Replace the entire `serviceCategories` array**

Replace `serviceCategories` (currently `src/app/services/page.tsx` ~35–126) with the four pillars. Keep the exact object shape (`id, num, icon, title, tagline, desc, image, cta, accentColor, items[{icon,title,desc}]`) the renderer expects:

```tsx
const serviceCategories = [
  {
    id: 'study-abroad',
    num: '01',
    icon: Plane,
    title: 'Study Abroad',
    tagline: 'Your boarding pass to a global education',
    desc: 'End-to-end guidance for studying overseas — from choosing the right country and university to visas, funding, and your first day on campus.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&h=600&fit=crop',
    cta: 'Book a Free Counselling Session',
    accentColor: '#82C93D',
    items: [
      { icon: Compass, title: 'Country & Course Selection', desc: 'Pick the right destination and program based on your goals, budget, and post-study work options.' },
      { icon: GraduationCap, title: 'University Shortlisting', desc: 'Data-backed shortlists across Australia, Canada, UK, USA, Germany, Ireland & New Zealand.' },
      { icon: FileText, title: 'Applications & SOP', desc: 'Statement of purpose, essays, and applications crafted to maximise your admit chances.' },
      { icon: Plane, title: 'Visa Guidance', desc: 'Document checklists, financial proof, and mock interviews for a smooth visa approval.' },
      { icon: Languages, title: 'Test Preparation', desc: 'IELTS, TOEFL, GRE & GMAT coaching aligned to your target universities.' },
      { icon: Wallet, title: 'Scholarships & Funding', desc: 'Scholarship discovery, education-loan guidance, and cost-of-living planning.' },
    ],
  },
  {
    id: 'trainings',
    num: '02',
    icon: GraduationCap,
    title: 'Trainings',
    tagline: 'Industry-led, hands-on, job-ready',
    desc: 'Practitioner-taught training programs in high-demand tech and professional skills, built around real projects and certification.',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&h=600&fit=crop',
    cta: 'Explore Training Programs',
    accentColor: '#1A9AB5',
    items: [
      { icon: GraduationCap, title: 'Professional Tech Training', desc: 'Industry-relevant courses in DevOps, security, full-stack, IoT, and more — taught by practitioners.' },
      { icon: BookOpen, title: 'Workshops & Bootcamps', desc: 'Intensive, hands-on learning experiences for rapid upskilling in high-demand areas.' },
      { icon: Award, title: 'Certification Programs', desc: 'Course-completion and internship certificates that strengthen your profile.' },
      { icon: Building2, title: 'Corporate Training', desc: 'Custom upskilling cohorts for teams and institutions.' },
      { icon: Code, title: 'Hands-on Projects', desc: 'Build production-grade projects for your portfolio every week.' },
      { icon: Users, title: 'Mentor-led Cohorts', desc: 'Learn alongside peers with mentors from top MNCs guiding every step.' },
    ],
  },
  {
    id: 'career-services',
    num: '03',
    icon: Briefcase,
    title: 'Student Career Services',
    tagline: 'From classroom to career',
    desc: 'Everything a student needs to land and grow a career — resumes, interview prep, roadmaps, and direct placement support.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&h=600&fit=crop',
    cta: 'Start Your Career Journey',
    accentColor: '#82C93D',
    items: [
      { icon: FileText, title: 'Resume & Profile Building', desc: 'ATS-optimized resumes, LinkedIn profiles, and portfolios that get noticed.' },
      { icon: Presentation, title: 'Interview Preparation', desc: 'Mock interviews, behavioral coaching, and technical prep to ace any round.' },
      { icon: Target, title: 'Career Roadmapping', desc: 'Personalized plans based on your skills, interests, and market demand.' },
      { icon: Briefcase, title: 'Placement Assistance', desc: 'Direct connections with 50+ hiring partners looking for talent like you.' },
      { icon: Users, title: 'Internship Connect', desc: 'Curated internships bridging education and industry.' },
      { icon: PenTool, title: 'Portfolio Building', desc: 'Showcase projects and achievements that stand out to recruiters.' },
    ],
  },
  {
    id: 'edu-services',
    num: '04',
    icon: Monitor,
    title: 'Edu Services',
    tagline: 'Technology-powered learning at scale',
    desc: 'Learning platforms, content, and partnerships that make education accessible, engaging, and results-driven for institutions and learners.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=600&fit=crop',
    cta: 'Explore Edu Services',
    accentColor: '#1A9AB5',
    items: [
      { icon: Monitor, title: 'Learning Management', desc: 'Custom LMS platforms with analytics, gamification, and personalization.' },
      { icon: PenTool, title: 'Content Development', desc: 'Interactive course content, video production, and assessment design.' },
      { icon: Building2, title: 'Institution Partnerships', desc: 'White-label training for universities, colleges, and corporate divisions.' },
      { icon: BarChart3, title: 'Assessment & Analytics', desc: 'Data-driven assessments and dashboards to track learner outcomes.' },
    ],
  },
]
```

- [ ] **Step 3: Type-check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: tsc exits 0. If lint flags now-unused icons (`Rocket`, `Lightbulb`, `Trophy`) in this file, remove those names from the import to pass lint.

- [ ] **Step 4: Visual check**

Dev server → `http://localhost:3003/services`. Confirm: four sections in pillar order; left sticky dots show 01–04; hero chips and the 2×2 grid show all four; navigating to `http://localhost:3003/services#career-services` scrolls to the Student Career Services section.

- [ ] **Step 5: Commit**

```bash
git add src/app/services/page.tsx
git commit -m "feat: restructure /services around four pillars (Study Abroad first)"
```

---

### Task 5: Navbar — Services dropdown → pillars (Study Abroad on top)

**Files:**
- Modify: `src/components/Navbar.tsx` — lucide import ~7, `navLinks` Services `subItems` ~35–44

**Interfaces:**
- Consumes: anchor ids from Global Constraints; must match Task 4's section ids.
- Produces: nothing downstream.

- [ ] **Step 1: Add the pillar icons to the import**

In `src/components/Navbar.tsx` line ~7, add `Plane`, `GraduationCap`, `Briefcase`, `BookOpen`:

```tsx
import { ArrowUpRight, ChevronDown, Server, Shield, Cpu, Globe, Code2, Palette, Settings, Rocket, Megaphone, Users, Plane, GraduationCap, Briefcase, BookOpen } from 'lucide-react'
```

- [ ] **Step 2: Replace the Services `subItems`**

Replace (currently ~35–44):

```tsx
  { 
    href: '/services', 
    label: 'Services',
    subItems: [
      { href: '/services#web-development', label: 'Web Development', icon: Code2, desc: 'Custom websites & apps' },
      { href: '/services#ui-ux-design', label: 'UI/UX Design', icon: Palette, desc: 'User-centered design' },
      { href: '/services#it-consulting', label: 'IT Consulting', icon: Settings, desc: 'Strategic tech guidance' },
      { href: '/services#digital-marketing', label: 'Digital Marketing', icon: Megaphone, desc: 'SEO, Social & Ads' },
    ]
  },
```

with:

```tsx
  { 
    href: '/services', 
    label: 'Services',
    subItems: [
      { href: '/services#study-abroad', label: 'Study Abroad', icon: Plane, desc: 'Global education & admissions' },
      { href: '/services#trainings', label: 'Trainings', icon: GraduationCap, desc: 'Job-ready, hands-on programs' },
      { href: '/services#career-services', label: 'Student Career Services', icon: Briefcase, desc: 'Resume, interviews & placement' },
      { href: '/services#edu-services', label: 'Edu Services', icon: BookOpen, desc: 'LMS, content & partnerships' },
    ]
  },
```

- [ ] **Step 3: Type-check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: tsc exits 0. If lint flags `Code2`, `Palette`, `Settings`, or `Megaphone` as now-unused in `Navbar.tsx`, remove those names from the import to pass lint (verify they aren't used elsewhere in the file first).

- [ ] **Step 4: Visual check**

Dev server → `http://localhost:3003/`. Hover "Services" in the navbar; confirm the dropdown lists Study Abroad (top), Trainings, Student Career Services, Edu Services, and each navigates to the matching `/services` section.

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: navbar services dropdown to pillars (Study Abroad on top)"
```

---

## Final verification (after all tasks)

- [ ] Run `npm run build` — expected: build succeeds with no type or lint errors.
- [ ] Manual: homepage hero spacing tightened; "Our Services" block shows 4 pillars and links work; `/services` shows the 4 pillar sections; navbar dropdown matches. Admin → Courses → Update Course saves without the schema-cache error (after the user applies the Task 1 migration in Supabase).

## Notes carried to later phases (do NOT do here)
- Homepage Career Programs pulling order from `display_order` (A2) → Phase 4.
- Dedicated `/services/study-abroad` page + re-pointing the dropdown to it → Phase 3.
- Image search, live preview, tags in course management (D1–D5) → Phase 4.
