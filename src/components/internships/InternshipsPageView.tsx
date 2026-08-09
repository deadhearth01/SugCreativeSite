'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Users, Award, Sparkles, BadgeCheck, TrendingUp, Shield, Rocket, Target,
  ArrowRight, Star, Clock, Mail, Briefcase,
} from 'lucide-react'
import type { InternshipsContent } from '@/lib/pageContent'
import { safeInternalHref } from '@/lib/pageContent'

export type InternshipProgram = {
  id: string
  title: string
  slug?: string | null
  description?: string | null
  thumbnail_url?: string | null
  duration_text?: string | null
  tech_stack?: string[] | null
}

/**
 * next/image only accepts hosts listed in next.config remotePatterns, and an
 * admin can paste any URL into the image field. Anything outside the allowed
 * hosts renders through a plain <img> so a stray URL degrades instead of
 * throwing at runtime.
 */
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

const WHY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  award: Award,
  sparkles: Sparkles,
  badge: BadgeCheck,
  trending: TrendingUp,
  shield: Shield,
  rocket: Rocket,
  target: Target,
}

/**
 * The full /internships page body. Rendered by the public route and, at reduced
 * scale, by the admin editor's live preview — so what an admin sees while
 * editing is literally the same component the visitor gets.
 */
export default function InternshipsPageView({
  content,
  programs,
}: {
  content: InternshipsContent
  programs: InternshipProgram[]
}) {
  const { hero, stats, programs: programsMeta, why, journey, testimonials, cta } = content

  return (
    <div className="bg-white">
      {/* ── Breadcrumb banner ── */}
      <section className="bg-[#0A2472] py-14">
        <div className="container mx-auto px-4">
          <p className="text-[#82C93D] text-xs font-bold uppercase tracking-[0.2em] mb-2">
            {hero.eyebrow}
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">Internships</h1>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
            Home / Internships
          </p>
        </div>
      </section>

      {/* ── Hero ── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <p className="text-[#1A9AB5] text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Internship Programs
              </p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                {hero.title}
                <br />
                <span className="bg-gradient-to-r from-[#82C93D] to-[#35C8E0] bg-clip-text text-transparent">
                  {hero.titleAccent}
                </span>
              </h2>
              {hero.body && <p className="text-gray-600 leading-relaxed mb-4">{hero.body}</p>}
              {hero.body2 && <p className="text-gray-600 leading-relaxed mb-8">{hero.body2}</p>}

              <div className="flex flex-wrap gap-4">
                {hero.primaryCta && (
                  <Link
                    href={safeInternalHref(hero.primaryHref)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-white font-bold rounded-2xl shadow-lg hover:scale-[0.98] transition-all"
                  >
                    {hero.primaryCta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {hero.secondaryCta && (
                  <a
                    href={safeInternalHref(hero.secondaryHref, '#programs')}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#1A9AB5] font-bold rounded-2xl border-2 border-[#35C8E0] hover:scale-[0.98] transition-all"
                  >
                    {hero.secondaryCta}
                  </a>
                )}
              </div>
            </div>

            <div className="relative">
              {hero.image ? (
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <RemoteImage
                    src={hero.image}
                    alt={hero.title}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#35C8E0]/15 to-[#82C93D]/15 border border-gray-200 flex flex-col items-center justify-center gap-3">
                  <Briefcase className="w-12 h-12 text-[#35C8E0]" />
                  <p className="text-sm font-bold text-gray-400">Add a hero image</p>
                </div>
              )}
              <div className="absolute -bottom-5 -right-2 md:right-6 bg-[#0A2472] text-white px-5 py-3 rounded-2xl shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#82C93D]">Learn.</p>
                <p className="text-sm font-black">BUILD. LEAD.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      {stats.items.length > 0 && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-xl p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 divide-y md:divide-y-0 lg:divide-x divide-gray-100">
                {stats.items.map((s, i) => (
                  <div key={i} className="text-center px-2 pt-6 md:pt-0 first:pt-0">
                    <p className="text-2xl md:text-3xl font-black text-[#1A9AB5]">{s.value}</p>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Programs ── */}
      <section id="programs" className="py-16 bg-gray-50/60 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#82C93D] text-xs font-bold uppercase tracking-[0.2em] mb-3">
              {programsMeta.eyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{programsMeta.title}</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] mx-auto mt-4 rounded-full" />
            {programsMeta.subtitle && (
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">{programsMeta.subtitle}</p>
            )}
          </div>

          {programs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {programs.map((p) => (
                <Link
                  key={p.id}
                  href={p.slug ? `/courses/${p.slug}` : '/contact'}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
                >
                  {p.thumbnail_url ? (
                    <div className="relative h-32">
                      <RemoteImage
                        src={p.thumbnail_url}
                        alt={p.title}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 20vw"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-[#35C8E0]/15 to-[#82C93D]/15 flex items-center justify-center">
                      <Rocket className="w-8 h-8 text-[#35C8E0]" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-black text-center mb-2 group-hover:text-[#1A9AB5] transition-colors">
                      {p.title}
                    </h3>
                    {p.description && (
                      <p className="text-xs text-gray-600 text-center line-clamp-3 mb-4">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px]">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="font-bold text-gray-500">{p.duration_text || '4-8 Weeks'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="max-w-xl mx-auto text-center py-14 rounded-3xl border border-dashed border-gray-300 bg-white">
              <Rocket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold mb-1">No internship programs published yet</h3>
              <p className="text-sm text-gray-500">
                Add a course in Course Management and set its type to{' '}
                <span className="font-semibold">Training / Internship</span>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Why intern with us ── */}
      {why.items.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-[#82C93D] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                {why.eyebrow}
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">{why.title}</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] mx-auto mt-4 rounded-full" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {why.items.map((item, i) => {
                const Icon = WHY_ICONS[item.icon] ?? Sparkles
                return (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#82C93D]/20 to-[#35C8E0]/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#1A9AB5]" />
                    </div>
                    <h3 className="font-bold mb-2 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Journey ── */}
      {journey.items.length > 0 && (
        <section className="py-16 bg-gray-50/60">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-[#82C93D] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                {journey.eyebrow}
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">{journey.title}</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] mx-auto mt-4 rounded-full" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {journey.items.map((step, i) => (
                <div
                  key={i}
                  className="relative bg-white p-6 rounded-2xl border border-gray-200 shadow-md"
                >
                  <span className="absolute top-4 right-5 text-3xl font-black text-gray-100 select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-11 h-11 mb-4 rounded-xl bg-[#35C8E0]/10 flex items-center justify-center">
                    <span className="text-sm font-black text-[#1A9AB5]">{i + 1}</span>
                  </div>
                  <h3 className="font-bold mb-2 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {testimonials.items.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-[#82C93D] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                {testimonials.eyebrow}
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">{testimonials.title}</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] mx-auto mt-4 rounded-full" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.items.map((t, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                  <p className="text-sm text-gray-700 italic leading-relaxed mb-5">
                    {'"'}
                    {t.quote}
                    {'"'}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {t.role}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.max(0, Math.min(5, t.rating || 0)) }).map((_, s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Closing CTA ── */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#35C8E0]/10 to-[#82C93D]/10 border border-gray-200 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[#0A2472] flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-black mb-1">{cta.title}</h3>
              <p className="text-sm text-gray-600">{cta.body}</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center shrink-0">
              {cta.primaryCta && (
                <Link
                  href={safeInternalHref(cta.primaryHref)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-white font-bold rounded-xl shadow-lg hover:scale-[0.98] transition-all"
                >
                  {cta.primaryCta}
                </Link>
              )}
              {cta.secondaryCta && (
                <Link
                  href={safeInternalHref(cta.secondaryHref)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1A9AB5] font-bold rounded-xl border-2 border-[#35C8E0] hover:scale-[0.98] transition-all"
                >
                  {cta.secondaryCta}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
