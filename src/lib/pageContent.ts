// Admin-editable marketing content for the /internships page.
//
// Content lives in the `page_content` table as one JSONB row per
// (page, section). These defaults are the single source of truth for shape —
// the migration seeds the same values, and `mergeInternshipsContent` fills in
// anything missing so the public page always renders, even before the
// migration has been run or if an admin clears a field.

export type HeroSection = {
  eyebrow: string
  title: string
  titleAccent: string
  body: string
  body2: string
  image: string
  primaryCta: string
  primaryHref: string
  secondaryCta: string
  secondaryHref: string
}

export type StatItem = { value: string; label: string }
export type ProgramsSection = { eyebrow: string; title: string; subtitle: string }
export type WhyItem = { icon: string; title: string; body: string }
export type JourneyItem = { title: string; body: string }
export type TestimonialItem = { quote: string; name: string; role: string; rating: number }
export type CtaSection = {
  title: string
  body: string
  primaryCta: string
  primaryHref: string
  secondaryCta: string
  secondaryHref: string
}

export type InternshipsContent = {
  hero: HeroSection
  stats: { items: StatItem[] }
  programs: ProgramsSection
  why: { eyebrow: string; title: string; items: WhyItem[] }
  journey: { eyebrow: string; title: string; items: JourneyItem[] }
  testimonials: { eyebrow: string; title: string; items: TestimonialItem[] }
  cta: CtaSection
}

/** Icon keys offered in the admin editor for the "Why intern with us" cards. */
export const WHY_ICON_OPTIONS = [
  'users', 'award', 'sparkles', 'badge', 'trending', 'shield', 'rocket', 'target',
] as const

export const DEFAULT_INTERNSHIPS_CONTENT: InternshipsContent = {
  hero: {
    eyebrow: 'OUR VERTICALS',
    title: 'Internships That Build',
    titleAccent: 'Real Industry Experience.',
    body:
      'Our internships are carefully designed to simulate real-world working environments. You will contribute to live projects, collaborate with industry mentors, and gain hands-on experience with the latest tools and technologies used by leading software companies.',
    body2:
      'Each program focuses on strengthening your technical expertise, enhancing problem-solving skills, and preparing you for high-impact roles in the IT and technology sectors.',
    image: '',
    primaryCta: 'Apply for Internship',
    primaryHref: '/contact',
    secondaryCta: 'Explore Programs',
    secondaryHref: '#programs',
  },
  stats: {
    items: [
      { value: '800+', label: 'Students Placed' },
      { value: '50+', label: 'Hiring Partners' },
      { value: '85%', label: 'Placement Success' },
      { value: '500+', label: 'Internship Offers' },
      { value: '24X7', label: 'Career Support' },
    ],
  },
  programs: {
    eyebrow: 'OUR PROGRAMS',
    title: 'Explore Internship Opportunities',
    subtitle: '',
  },
  why: {
    eyebrow: 'WHY INTERN WITH US?',
    title: 'Real Experience. Real Impact.',
    items: [
      { icon: 'users', title: 'Industry Exposure', body: 'Work on live projects and understand real-world business challenges.' },
      { icon: 'award', title: 'Expert Mentorship', body: 'Learn from experienced professionals and get career guidance.' },
      { icon: 'sparkles', title: 'Skill Development', body: 'Enhance technical and soft skills that make you industry-ready.' },
      { icon: 'badge', title: 'Certificate of Completion', body: 'Earn a recognized certificate that adds value to your career journey.' },
      { icon: 'trending', title: 'Pre-Placement Advantage', body: 'Top performers get fast-track consideration for full-time opportunities.' },
    ],
  },
  journey: {
    eyebrow: 'HOW IT WORKS',
    title: 'Your Internship Journey',
    items: [
      { title: 'Apply Online', body: 'Fill out the application form and choose your preferred domain.' },
      { title: 'Screening', body: 'Our team reviews your application and shortlists suitable candidates.' },
      { title: 'Interview Round', body: 'Selected candidates attend a virtual interview with our experts.' },
      { title: 'Offer & Onboarding', body: 'Receive your offer letter and complete the onboarding process.' },
      { title: 'Start & Grow', body: 'Begin your internship and grow with meaningful projects and learning.' },
    ],
  },
  testimonials: {
    eyebrow: 'FROM OUR INTERNS',
    title: 'What Interns Say',
    items: [
      { quote: 'Professional faculty, practical sessions, and strong Full Stack and MEAN Stack training.', name: 'Kavya S', role: 'INTERN', rating: 5 },
      { quote: 'Practical teaching, experienced trainers, affordable fees and individual attention.', name: 'Sai Santhosh', role: 'INTERN', rating: 5 },
      { quote: 'Patient and knowledgeable instructors with practical focus.', name: 'Pilla Papa', role: 'INTERN', rating: 5 },
    ],
  },
  cta: {
    title: 'Ready to Kickstart Your Career?',
    body: 'Apply for an internship today and take the first step towards a successful future.',
    primaryCta: 'Apply Now',
    primaryHref: '/contact',
    secondaryCta: 'Contact Us',
    secondaryHref: '/contact',
  },
}

export const INTERNSHIPS_SECTIONS = [
  'hero', 'stats', 'programs', 'why', 'journey', 'testimonials', 'cta',
] as const
export type InternshipsSection = (typeof INTERNSHIPS_SECTIONS)[number]

type Row = { section: string; data: unknown }

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Shallow-merge stored section data over the defaults.
 *
 * Scalars fall back to the default when missing or empty-typed; arrays are
 * taken wholesale from the stored value when present (so an admin can delete
 * list items) but fall back to the default when absent entirely.
 */
function mergeSection<T extends Record<string, unknown>>(base: T, stored: unknown): T {
  if (!isObject(stored)) return base
  const out = { ...base } as Record<string, unknown>
  for (const key of Object.keys(base)) {
    const v = stored[key]
    if (v === undefined || v === null) continue
    if (Array.isArray(base[key])) {
      if (Array.isArray(v)) out[key] = v
    } else {
      out[key] = v
    }
  }
  return out as T
}

export function mergeInternshipsContent(rows: Row[] | null | undefined): InternshipsContent {
  const bySection = new Map<string, unknown>()
  for (const r of rows ?? []) bySection.set(r.section, r.data)

  return {
    hero: mergeSection(DEFAULT_INTERNSHIPS_CONTENT.hero, bySection.get('hero')),
    stats: mergeSection(DEFAULT_INTERNSHIPS_CONTENT.stats, bySection.get('stats')),
    programs: mergeSection(DEFAULT_INTERNSHIPS_CONTENT.programs, bySection.get('programs')),
    why: mergeSection(DEFAULT_INTERNSHIPS_CONTENT.why, bySection.get('why')),
    journey: mergeSection(DEFAULT_INTERNSHIPS_CONTENT.journey, bySection.get('journey')),
    testimonials: mergeSection(DEFAULT_INTERNSHIPS_CONTENT.testimonials, bySection.get('testimonials')),
    cta: mergeSection(DEFAULT_INTERNSHIPS_CONTENT.cta, bySection.get('cta')),
  }
}

/**
 * Only allow same-origin paths and anchors in CTA links, so a stored value can
 * never turn into a `javascript:` or off-site URL.
 */
export function safeInternalHref(href: string | undefined | null, fallback = '/contact'): string {
  if (!href) return fallback
  const v = href.trim()
  if (v.startsWith('#') || (v.startsWith('/') && !v.startsWith('//'))) return v
  return fallback
}
