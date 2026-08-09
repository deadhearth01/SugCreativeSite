'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Building2, UserRoundCheck, Gauge, BadgeCheck, TrendingUp, ShieldCheck,
  Rocket, Target, Code2, Briefcase, Network, Sparkles,
  ArrowRight, ArrowUpRight, Star, Clock, Quote, CheckCircle2,
} from 'lucide-react'
import type { InternshipsContent } from '@/lib/pageContent'
import { safeInternalHref } from '@/lib/pageContent'
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'

export type InternshipProgram = {
  id: string
  title: string
  slug?: string | null
  description?: string | null
  thumbnail_url?: string | null
  duration_text?: string | null
  tech_stack?: string[] | null
  color_theme?: string | null
}

const WHY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  // current, descriptive keys
  building: Building2,
  mentor: UserRoundCheck,
  gauge: Gauge,
  certificate: BadgeCheck,
  career: TrendingUp,
  shield: ShieldCheck,
  rocket: Rocket,
  target: Target,
  code: Code2,
  briefcase: Briefcase,
  network: Network,
  // legacy keys kept so previously-saved content still renders
  users: Building2,
  award: UserRoundCheck,
  sparkles: Gauge,
  badge: BadgeCheck,
  trending: TrendingUp,
}

const ACCENTS: Record<string, string> = {
  blue: '#3B82F6',
  violet: '#8B5CF6',
  green: '#10B981',
  gold: '#F59E0B',
  cyan: '#35C8E0',
}

function accentFor(theme?: string | null) {
  return ACCENTS[theme || 'cyan'] ?? ACCENTS.cyan
}

/** next/image only accepts configured hosts; anything else degrades to <img>. */
function isOptimizableHost(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return (
      hostname === 'images.unsplash.com' ||
      hostname === 'plus.unsplash.com' ||
      hostname.endsWith('.supabase.co')
    )
  } catch {
    return false
  }
}

function RemoteImage({
  src, alt, className, sizes,
}: { src: string; alt: string; className?: string; sizes?: string }) {
  if (isOptimizableHost(src)) {
    return <Image src={src} alt={alt} fill className={className} sizes={sizes} />
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`absolute inset-0 w-full h-full ${className ?? ''}`} />
}

function SectionHeading({
  eyebrow, title, subtitle, light = false, align = 'center',
}: {
  eyebrow: string; title: string; subtitle?: string
  light?: boolean; align?: 'center' | 'left'
}) {
  return (
    <div className={align === 'center' ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}>
      {eyebrow && (
        <p className="text-[#35C8E0] text-xs font-bold uppercase tracking-[0.22em] mb-3">
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-3xl md:text-[2.6rem] leading-[1.1] font-black tracking-tight ${
          light ? 'text-white' : 'text-[#0A2472]'
        }`}
      >
        {title}
      </h2>
      <div
        className={`h-1 w-16 rounded-full bg-gradient-to-r from-[#82C93D] to-[#35C8E0] mt-5 ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      />
      {subtitle && (
        <p className={`mt-5 leading-relaxed ${light ? 'text-white/65' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default function InternshipsPageView({
  content,
  programs,
}: {
  content: InternshipsContent
  programs: InternshipProgram[]
}) {
  const { hero, stats, programs: programsMeta, why, journey, testimonials, cta } = content
  const [lead, ...rest] = why.items

  return (
    <div className="bg-white">
      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden bg-[#061539] pt-36 pb-40">
        {/* depth: soft colour blooms + fine grid, no flat grey band */}
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{
            background:
              'radial-gradient(60rem 40rem at 12% 8%, rgba(53,200,224,0.30), transparent 60%),' +
              'radial-gradient(48rem 34rem at 92% 78%, rgba(130,201,61,0.26), transparent 62%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(70% 60% at 50% 40%, #000 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(70% 60% at 50% 40%, #000 30%, transparent 100%)',
          }}
        />

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center max-w-6xl mx-auto">
            <div>
              <Reveal direction="up">
                <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 mb-7">
                  <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
                  <span>/</span>
                  <span className="text-[#82C93D]">Internships</span>
                </nav>
              </Reveal>

              <Reveal direction="up" delay={0.06}>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur text-[11px] font-bold uppercase tracking-[0.18em] text-white/75 mb-6">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#82C93D] opacity-75 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#82C93D]" />
                  </span>
                  {hero.eyebrow}
                </span>
              </Reveal>

              <Reveal direction="up" delay={0.12}>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.04] text-white mb-6">
                  {hero.title}
                  <br />
                  <span className="bg-gradient-to-r from-[#82C93D] via-[#35C8E0] to-[#7EE5F2] bg-clip-text text-transparent">
                    {hero.titleAccent}
                  </span>
                </h1>
              </Reveal>

              <Reveal direction="up" delay={0.18}>
                <div className="space-y-4 max-w-xl">
                  {hero.body && <p className="text-white/65 leading-relaxed">{hero.body}</p>}
                  {hero.body2 && <p className="text-white/50 leading-relaxed text-[15px]">{hero.body2}</p>}
                </div>
              </Reveal>

              <Reveal direction="up" delay={0.26}>
                <div className="flex flex-wrap gap-4 mt-9">
                  {hero.primaryCta && (
                    <Link
                      href={safeInternalHref(hero.primaryHref)}
                      className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-[#03102b] font-bold rounded-2xl shadow-[0_10px_40px_-10px_rgba(53,200,224,0.7)] hover:shadow-[0_14px_50px_-8px_rgba(53,200,224,0.85)] hover:-translate-y-0.5 transition-all"
                    >
                      {hero.primaryCta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                  {hero.secondaryCta && (
                    <a
                      href={safeInternalHref(hero.secondaryHref, '#programs')}
                      className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-bold rounded-2xl border border-white/20 bg-white/[0.04] backdrop-blur hover:bg-white/[0.1] hover:-translate-y-0.5 transition-all"
                    >
                      {hero.secondaryCta}
                    </a>
                  )}
                </div>
              </Reveal>
            </div>

            {/* Hero visual */}
            <Reveal direction="left" delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-tr from-[#35C8E0]/25 to-[#82C93D]/20 blur-3xl rounded-full" />
                <div className="relative aspect-[4/3] rounded-[1.75rem] overflow-hidden ring-1 ring-white/15 shadow-2xl">
                  {hero.image ? (
                    <RemoteImage
                      src={hero.image}
                      alt={hero.title}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 46vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/5 flex flex-col items-center justify-center gap-3">
                      <Briefcase className="w-12 h-12 text-white/30" />
                      <p className="text-sm font-bold text-white/40">Add a hero image</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061539]/70 via-transparent to-transparent" />
                </div>

                {/* floating credential chip */}
                <div className="absolute -bottom-5 -left-3 md:-left-6 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#82C93D] to-[#35C8E0] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Now enrolling</p>
                    <p className="text-sm font-black text-[#0A2472]">
                      {programs.length > 0 ? `${programs.length} live programs` : 'Next cohort'}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ════════ STATS — lifted over the hero edge ════════ */}
      {stats.items.length > 0 && (
        <section className="relative -mt-24 z-10">
          <div className="container mx-auto px-4">
            <Reveal direction="up">
              <div className="max-w-5xl mx-auto rounded-3xl bg-white shadow-[0_24px_70px_-30px_rgba(6,21,57,0.45)] ring-1 ring-black/5 px-6 py-8 md:px-10">
                <RevealGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4">
                  {stats.items.map((s, i) => (
                    <RevealItem key={i} className="text-center relative">
                      <p className="text-[1.9rem] md:text-4xl font-black bg-gradient-to-br from-[#0A2472] to-[#1A9AB5] bg-clip-text text-transparent">
                        {s.value}
                      </p>
                      <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mt-1.5">
                        {s.label}
                      </p>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ════════ PROGRAMS ════════ */}
      <section id="programs" className="py-24 scroll-mt-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <SectionHeading
              eyebrow={programsMeta.eyebrow}
              title={programsMeta.title}
              subtitle={programsMeta.subtitle || undefined}
            />
          </Reveal>

          {programs.length > 0 ? (
            <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 max-w-6xl mx-auto mt-14">
              {programs.map((p) => {
                const accent = accentFor(p.color_theme)
                return (
                  <RevealItem key={p.id}>
                    <Link
                      href={p.slug ? `/courses/${p.slug}` : '/contact'}
                      className="group block h-full rounded-3xl bg-white ring-1 ring-black/[0.07] shadow-[0_4px_24px_-12px_rgba(6,21,57,0.25)] hover:shadow-[0_28px_60px_-24px_rgba(6,21,57,0.4)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative h-44 overflow-hidden">
                        {p.thumbnail_url ? (
                          <RemoteImage
                            src={p.thumbnail_url}
                            alt={p.title}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#35C8E0]/20 to-[#82C93D]/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        {p.duration_text && (
                          <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[10px] font-bold uppercase tracking-wide text-[#0A2472]">
                            <Clock className="w-3 h-3" />
                            {p.duration_text}
                          </span>
                        )}
                        <h3 className="absolute bottom-3.5 left-4 right-4 text-white font-black text-lg leading-snug">
                          {p.title}
                        </h3>
                      </div>

                      <div className="p-5">
                        {p.description && (
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {p.description}
                          </p>
                        )}
                        {(p.tech_stack?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {p.tech_stack!.slice(0, 3).map((t, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                                style={{ color: accent, backgroundColor: `${accent}18` }}
                              >
                                {t}
                              </span>
                            ))}
                            {p.tech_stack!.length > 3 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-400 bg-gray-100">
                                +{p.tech_stack!.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <span
                          className="inline-flex items-center gap-1.5 mt-5 text-sm font-bold group-hover:gap-2.5 transition-all"
                          style={{ color: accent }}
                        >
                          View program
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  </RevealItem>
                )
              })}
            </RevealGroup>
          ) : (
            <div className="max-w-xl mx-auto text-center py-14 mt-12 rounded-3xl border border-dashed border-gray-300">
              <Rocket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold mb-1">No internships published yet</h3>
              <p className="text-sm text-gray-500">
                Add a course in Course Management and set its type to{' '}
                <span className="font-semibold">Internship</span>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ════════ WHY — bento, not a row of identical boxes ════════ */}
      {why.items.length > 0 && (
        <section className="py-24 bg-[#F7FAFC]">
          <div className="container mx-auto px-4">
            <Reveal>
              <SectionHeading eyebrow={why.eyebrow} title={why.title} />
            </Reveal>

            <RevealGroup className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-14">
              {lead && (
                <RevealItem className="lg:row-span-2">
                  {(() => {
                    const Icon = WHY_ICONS[lead.icon] ?? Building2
                    return (
                      <div className="h-full relative overflow-hidden rounded-3xl bg-[#061539] p-8 flex flex-col justify-between min-h-[280px]">
                        <div
                          className="absolute inset-0 opacity-60"
                          style={{
                            background:
                              'radial-gradient(30rem 20rem at 80% 0%, rgba(53,200,224,0.35), transparent 65%)',
                          }}
                        />
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#82C93D] to-[#35C8E0] flex items-center justify-center mb-6">
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-2xl font-black text-white mb-3">{lead.title}</h3>
                          <p className="text-white/60 leading-relaxed">{lead.body}</p>
                        </div>
                      </div>
                    )
                  })()}
                </RevealItem>
              )}

              {rest.map((item, i) => {
                const Icon = WHY_ICONS[item.icon] ?? Sparkles
                return (
                  <RevealItem key={i}>
                    <div className="h-full bg-white rounded-3xl p-6 ring-1 ring-black/[0.06] shadow-[0_2px_14px_-8px_rgba(6,21,57,0.3)] hover:shadow-[0_20px_44px_-24px_rgba(6,21,57,0.35)] hover:-translate-y-1 transition-all duration-300">
                      <div className="w-11 h-11 rounded-xl bg-[#35C8E0]/10 ring-1 ring-[#35C8E0]/20 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-[#1A9AB5]" />
                      </div>
                      <h3 className="font-black text-[#0A2472] mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                    </div>
                  </RevealItem>
                )
              })}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ════════ JOURNEY — connected timeline ════════ */}
      {journey.items.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <Reveal>
              <SectionHeading eyebrow={journey.eyebrow} title={journey.title} />
            </Reveal>

            <div className="relative max-w-6xl mx-auto mt-16">
              {/* connecting rail */}
              <div className="hidden lg:block absolute top-7 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#35C8E0]/40 to-transparent" />

              <RevealGroup
                className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 relative"
                stagger={0.12}
              >
                {journey.items.map((step, i) => (
                  <RevealItem key={i}>
                    <div className="text-center lg:text-left group">
                      <div className="flex lg:block justify-center">
                        <div className="relative w-14 h-14 rounded-2xl bg-white ring-1 ring-black/[0.07] shadow-lg flex items-center justify-center mb-5 group-hover:-translate-y-1 transition-transform duration-300">
                          <span className="text-lg font-black bg-gradient-to-br from-[#0A2472] to-[#1A9AB5] bg-clip-text text-transparent">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-br from-[#82C93D] to-[#35C8E0]" />
                        </div>
                      </div>
                      <h3 className="font-black text-[#0A2472] mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </div>
        </section>
      )}

      {/* ════════ TESTIMONIALS ════════ */}
      {testimonials.items.length > 0 && (
        <section className="py-24 bg-[#F7FAFC]">
          <div className="container mx-auto px-4">
            <Reveal>
              <SectionHeading eyebrow={testimonials.eyebrow} title={testimonials.title} />
            </Reveal>

            <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-14">
              {testimonials.items.map((t, i) => (
                <RevealItem key={i}>
                  <figure className="h-full bg-white rounded-3xl p-7 ring-1 ring-black/[0.06] shadow-[0_2px_14px_-8px_rgba(6,21,57,0.3)] hover:shadow-[0_20px_44px_-24px_rgba(6,21,57,0.35)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <Quote className="w-7 h-7 text-[#35C8E0]/35 mb-4" />
                    <blockquote className="text-[15px] text-gray-700 leading-relaxed flex-1">
                      {t.quote}
                    </blockquote>
                    <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A2472] to-[#1A9AB5] flex items-center justify-center text-white text-xs font-black shrink-0">
                        {t.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[#0A2472] truncate">{t.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {t.role}
                        </p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: Math.max(0, Math.min(5, t.rating || 0)) }).map((_, s) => (
                          <Star key={s} className="w-3 h-3 fill-[#F5A623] text-[#F5A623]" />
                        ))}
                      </div>
                    </figcaption>
                  </figure>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ════════ CLOSING CTA ════════ */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Reveal direction="up">
            <div className="relative max-w-5xl mx-auto rounded-[2rem] overflow-hidden bg-[#061539] px-8 py-14 md:px-16 md:py-16 text-center">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    'radial-gradient(36rem 22rem at 20% 0%, rgba(130,201,61,0.30), transparent 60%),' +
                    'radial-gradient(36rem 22rem at 85% 100%, rgba(53,200,224,0.34), transparent 62%)',
                }}
              />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                  {cta.title}
                </h2>
                <p className="text-white/60 max-w-xl mx-auto mb-9">{cta.body}</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  {cta.primaryCta && (
                    <Link
                      href={safeInternalHref(cta.primaryHref)}
                      className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-[#03102b] font-bold rounded-2xl shadow-[0_10px_40px_-10px_rgba(53,200,224,0.7)] hover:-translate-y-0.5 transition-all"
                    >
                      {cta.primaryCta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                  {cta.secondaryCta && (
                    <Link
                      href={safeInternalHref(cta.secondaryHref)}
                      className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-2xl border border-white/20 bg-white/[0.05] backdrop-blur hover:bg-white/[0.12] hover:-translate-y-0.5 transition-all"
                    >
                      {cta.secondaryCta}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
