'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowUpRight,
  Plane,
  Compass,
  Globe2,
  Briefcase,
  Users,
  TrendingUp,
  GraduationCap,
  FileText,
  Languages,
  Wallet,
  Stamp,
  ClipboardCheck,
  Building2,
  Search,
  ListChecks,
  Send,
  BadgeCheck,
  PlaneTakeoff,
  CheckCircle2,
  XCircle,
  Minus,
  Plus,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Button } from '@/components/ui/button'

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

const trustStrip = [
  { value: '2022', label: 'Rajahmundry-rooted ed-tech & career heritage' },
  { value: '4', label: 'Integrated verticals — careers, training, startups, study abroad' },
  { value: '100%', label: 'Free counselling, always' },
  { value: '7+', label: 'Study destinations covered' },
]

const whyAbroad = [
  {
    icon: Globe2,
    title: 'Globally recognised degrees',
    desc: 'Qualifications respected by employers across borders — opening doors a local-only degree often cannot.',
  },
  {
    icon: Briefcase,
    title: 'Post-study work rights',
    desc: 'Most major destinations offer 1–3 years of post-graduation work permits to build real international experience.',
  },
  {
    icon: Users,
    title: 'Independence & exposure',
    desc: 'Living and studying abroad builds resilience, cross-cultural fluency, and the confidence employers notice.',
  },
  {
    icon: TrendingUp,
    title: 'Stronger career ROI',
    desc: 'Higher starting salaries and faster growth in tech, healthcare and business — paired with our placement know-how.',
  },
]

const destinations = [
  {
    country: 'United States',
    code: 'NYC / BOS',
    accent: '#3C3B6E',
    intakes: 'Fall, Spring',
    fields: 'STEM, Business',
    work: 'Up to 3 yrs (OPT)',
  },
  {
    country: 'United Kingdom',
    code: 'LON / MAN',
    accent: '#012169',
    intakes: 'Sept, Jan',
    fields: 'Business, Engg, Law',
    work: '2-yr Graduate Route',
  },
  {
    country: 'Canada',
    code: 'YYZ / YVR',
    accent: '#D52B1E',
    intakes: 'Sept, Jan, May',
    fields: 'IT, Healthcare, Mgmt',
    work: 'Up to 3 yrs (PGWP)',
  },
  {
    country: 'Australia',
    code: 'SYD / MEL',
    accent: '#00247D',
    intakes: 'Feb, Jul, Nov',
    fields: 'Engg, Data, Nursing',
    work: '2–4 yrs (post-study)',
  },
  {
    country: 'Germany',
    code: 'BER / MUC',
    accent: '#1A1A1A',
    intakes: 'Oct, Apr',
    fields: 'Engg, Automotive, CS',
    work: '18-month job-seeker visa',
  },
  {
    country: 'Ireland',
    code: 'DUB / COR',
    accent: '#169B62',
    intakes: 'Sept, Jan',
    fields: 'Tech, Pharma, Finance',
    work: 'Up to 2 yrs (Stamp 1G)',
  },
  {
    country: 'New Zealand',
    code: 'AKL / WLG',
    accent: '#00247D',
    intakes: 'Feb, Jul',
    fields: 'Agritech, IT, Business',
    work: 'Up to 3 yrs',
  },
]

const itinerary = [
  { num: '01', icon: ClipboardCheck, title: 'Profile evaluation', desc: 'We assess academics, budget, and goals to map destinations and courses that genuinely fit you.' },
  { num: '02', icon: GraduationCap, title: 'University & course shortlisting', desc: 'Curated options across 850+ institutions, matched to your scores and career direction.' },
  { num: '03', icon: FileText, title: 'SOP, LOR & application support', desc: 'Hands-on help drafting Statements of Purpose, recommendation letters, and full application files.' },
  { num: '04', icon: Languages, title: 'IELTS / PTE / TOEFL prep', desc: 'Structured test coaching, leveraging our existing training-and-placement infrastructure.' },
  { num: '05', icon: Wallet, title: 'Scholarships & education loans', desc: 'Guidance on merit and need-based scholarships, plus loan-partner referrals to ease financing.' },
  { num: '06', icon: Stamp, title: 'Visa filing & mock interviews', desc: 'Document checklists, form-filing support, and interview rehearsal before your real appointment.' },
  { num: '07', icon: Compass, title: 'Pre-departure briefing', desc: 'Packing, banking, insurance and culture-readiness so day one abroad is never a guessing game.' },
  { num: '08', icon: Building2, title: 'Accommodation & arrival support', desc: 'Housing shortlists, SIM and bank-account guidance, and a check-in once you have landed.' },
]

const flightPath = [
  { num: '01', icon: Search, title: 'Discover', desc: 'A free counselling call to understand your goals.' },
  { num: '02', icon: ListChecks, title: 'Shortlist', desc: 'Universities and courses matched to your profile.' },
  { num: '03', icon: FileText, title: 'Apply', desc: 'Applications, SOPs and LORs prepared together.' },
  { num: '04', icon: Wallet, title: 'Fund', desc: 'Scholarships and loan options sorted out.' },
  { num: '05', icon: Send, title: 'Visa', desc: 'Documentation, filing and interview prep.' },
  { num: '06', icon: PlaneTakeoff, title: 'Fly', desc: 'Pre-departure briefing and travel readiness.' },
]

const compareRows = [
  {
    label: 'Counsellor continuity',
    agency: 'Often reassigned, call-centre model',
    sug: 'One dedicated counsellor, start to finish',
  },
  {
    label: 'Beyond the visa',
    agency: 'Relationship often ends at admission / visa',
    sug: 'Tied into career & skills training post-arrival',
  },
  {
    label: 'Local accessibility',
    agency: 'Metro-city offices, limited regional reach',
    sug: 'Rooted in Rajahmundry & Andhra Pradesh, with regional-language support',
  },
  {
    label: 'Parent-company track record',
    agency: 'Education-only focus',
    sug: 'Real placement history in IT, IoT & web careers since 2022',
  },
  {
    label: 'Cost to students',
    agency: 'Counselling fees vary by branch',
    sug: 'Always free — we are paid by partner institutions, not you',
  },
]

const glanceStats = [
  { value: '2022', label: 'Founded in Rajahmundry, India' },
  { value: '4', label: 'Integrated business verticals' },
  { value: '1:1', label: 'Counsellor-to-student model' },
  { value: '₹0', label: 'Counselling fee for students' },
]

const faqs = [
  {
    q: 'Is counselling really free?',
    a: 'Yes. We are compensated by partner institutions when you enrol, so there is no fee to you for counselling, shortlisting, or application support.',
  },
  {
    q: 'Which countries do you cover?',
    a: 'The USA, UK, Canada, Australia, Germany, New Zealand and Ireland, with more destinations being added as we grow this division.',
  },
  {
    q: 'How early should I start the process?',
    a: 'Ideally 9–12 months before your intended intake, to allow time for tests, applications, and visa processing — but we will work with whatever timeline you bring us.',
  },
  {
    q: 'Do you help with scholarships and loans?',
    a: 'Yes — we guide you through merit and need-based scholarships, and connect you with education-loan partners to plan your finances.',
  },
  {
    q: 'Is this the same team as SUG Creative’s career guidance services?',
    a: 'Study Abroad is a new, dedicated division within SUG Creative. It is built by the same organisation, so you also get access to our career and skills-training resources before and after you go.',
  },
]

/* ──────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────── */

export default function StudyAbroadPage() {
  const [openFaq, setOpenFaq] = useState<number>(0)

  return (
    <main className="min-h-screen bg-[#F0F2E8]">
      <Navbar />

      {/* ═══════════════════════════════════════
          1. HERO — BOARDING PASS
          ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#F0F2E8] overflow-hidden border-b-2 border-black/10">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(#35C8E0 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="container-wide relative z-10">
          <AnimatedSection>
            {/* Boarding pass card */}
            <div className="bg-white border-2 border-primary-dark rounded-3xl shadow-[10px_10px_0px_rgba(0,0,0,1)] overflow-hidden grid lg:grid-cols-[1fr_300px]">
              {/* Main */}
              <div className="p-8 sm:p-12 lg:p-14">
                {/* Route */}
                <div className="flex items-center gap-4 sm:gap-6 mb-8">
                  <div>
                    <div className="font-heading font-black text-2xl sm:text-3xl text-primary-dark tracking-tight">RJY</div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary-dark/50 mt-1">
                      Rajahmundry, India
                    </div>
                  </div>
                  <div className="flex-1 relative flex items-center" aria-hidden="true">
                    <div className="w-full border-t-2 border-dashed border-primary-dark/30" />
                    <div className="absolute left-1/2 -translate-x-1/2 bg-[#82C93D] text-primary-dark rounded-full p-2 border-2 border-primary-dark shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <Plane size={18} className="rotate-90" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading font-black text-2xl sm:text-3xl text-primary tracking-tight">???</div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary-dark/50 mt-1">
                      Your dream university
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-white text-primary font-black text-[10px] uppercase tracking-widest px-4 py-2 mb-6 rounded-full shadow-[3px_3px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                  <span className="w-2 h-2 bg-[#82C93D] rounded-full animate-pulse" />
                  New Division · Now Boarding
                </div>

                <h1 className="font-heading font-black text-primary-dark tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">
                  Your boarding pass to a <span className="text-[#82C93D]">global</span> education.
                </h1>

                <p className="text-primary-dark/70 text-lg font-bold leading-relaxed max-w-xl mb-8 border-l-4 border-primary pl-5">
                  SUG Creative is opening a dedicated Study Abroad practice — built on the same career-guidance and
                  skills foundation that has helped students land roles at Google, Bosch, WatchGuard and Accenture.
                  Now, we take that expertise overseas.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary hover:bg-primary-dark text-white font-black text-sm uppercase tracking-widest rounded-3xl px-9 h-16 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all border-2 border-black"
                  >
                    <Link href="/contact">
                      Book Free Counselling <ArrowUpRight size={20} className="ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-2 border-primary-dark text-primary-dark hover:bg-primary-dark/5 font-black text-sm uppercase tracking-widest rounded-3xl px-9 h-16 transition-all"
                  >
                    <Link href="#destinations">Explore Destinations</Link>
                  </Button>
                </div>

                {/* Pass footer details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 border-t-2 border-dashed border-primary-dark/20 pt-6">
                  {[
                    { k: 'Passenger', v: 'You, the Applicant' },
                    { k: 'Class', v: 'Free Counselling' },
                    { k: 'Departure', v: "When You're Ready" },
                    { k: 'Status', v: 'Confirmed', accent: true },
                  ].map((item) => (
                    <div key={item.k}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary-dark/40">{item.k}</div>
                      <div className={`text-sm font-black mt-1 ${item.accent ? 'text-[#82C93D]' : 'text-primary-dark'}`}>
                        {item.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stub */}
              <div className="relative bg-primary-dark text-white p-8 sm:p-10 flex flex-row lg:flex-col items-center lg:items-start justify-between gap-6">
                <div
                  className="hidden lg:block absolute left-0 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-white/30"
                  aria-hidden="true"
                />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#82C93D]">Gate</div>
                  <div className="font-black text-base mb-4">Counselling Desk</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#82C93D]">Seat</div>
                  <div className="font-black text-base">Reserved · Free</div>
                </div>
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#82C93D] flex items-center justify-center text-center -rotate-12 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#82C93D] leading-tight">
                    SUG
                    <br />
                    Creative
                    <br />
                    Est. 2022
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Trust strip */}
          <AnimatedSection delay={0.15}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              {trustStrip.map((t) => (
                <div
                  key={t.label}
                  className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                >
                  <div className="text-3xl md:text-4xl font-heading font-black text-primary mb-2">{t.value}</div>
                  <div className="text-xs font-bold text-primary-dark/60 leading-relaxed">{t.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          2. WHY STUDY ABROAD
          ═══════════════════════════════════════ */}
      <section id="why" className="py-24 md:py-32 bg-white border-b-2 border-black/10 scroll-mt-20">
        <div className="container-wide">
          <AnimatedSection>
            <div className="max-w-3xl mb-16">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                Why Go Abroad
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4">
                A degree is the ticket. The destination is a career.
              </h2>
              <p className="text-primary-dark/60 text-lg font-bold leading-relaxed">
                Studying overseas is not just about a university crest — it is globally recognised learning, real-world
                exposure, and a career runway most domestic paths cannot match.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyAbroad.map((card, i) => (
              <AnimatedSection key={card.title} delay={i * 0.08}>
                <div className="bg-white border-2 border-primary-dark/80 p-8 rounded-3xl shadow-[5px_5px_0px_rgba(0,0,0,0.8)] hover:-translate-y-1.5 hover:shadow-[8px_8px_0px_rgba(0,0,0,0.8)] transition-all duration-300 h-full relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#82C93D]" />
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-primary-dark mb-6 bg-primary text-white shadow-[3px_3px_0px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform">
                    <card.icon size={24} />
                  </div>
                  <h3 className="text-lg font-heading font-black text-primary-dark mb-3">{card.title}</h3>
                  <p className="text-primary-dark/70 text-sm font-bold leading-relaxed">{card.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3. DESTINATIONS — TICKET CARDS
          ═══════════════════════════════════════ */}
      <section id="destinations" className="py-24 md:py-32 bg-[#F0F2E8] border-b-2 border-black/10 scroll-mt-20">
        <div className="container-wide">
          <AnimatedSection>
            <div className="max-w-3xl mb-16">
              <div className="inline-block bg-[#82C93D] text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">
                Where You Could Land
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4">
                Seven gateways, one counselling desk.
              </h2>
              <p className="text-primary-dark/60 text-lg font-bold leading-relaxed">
                Compare intakes, top fields, and post-study work rights at a glance — like checking your own boarding details.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destinations.map((d, i) => (
              <AnimatedSection key={d.country} delay={i * 0.06}>
                <div className="relative bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1.5 hover:shadow-[9px_9px_0px_rgba(0,0,0,1)] transition-all duration-300 h-full overflow-hidden">
                  {/* Ticket top */}
                  <div className="relative p-6 border-b-2 border-dashed border-black/20">
                    <div className="h-1.5 w-12 rounded-full mb-4" style={{ backgroundColor: d.accent }} />
                    <div className="flex items-center gap-2 text-primary-dark/40 mb-1">
                      <MapPin size={14} />
                      <span className="font-heading font-black text-sm tracking-widest text-primary-dark">{d.code}</span>
                    </div>
                    <div className="font-heading font-black text-xl text-primary-dark tracking-tight">{d.country}</div>
                    {/* notches */}
                    <div className="absolute -left-3 -bottom-3 w-6 h-6 rounded-full bg-[#F0F2E8] border-2 border-black" aria-hidden="true" />
                    <div className="absolute -right-3 -bottom-3 w-6 h-6 rounded-full bg-[#F0F2E8] border-2 border-black" aria-hidden="true" />
                  </div>
                  {/* Ticket body */}
                  <div className="p-6 space-y-3">
                    {[
                      { k: 'Intakes', v: d.intakes },
                      { k: 'Top fields', v: d.fields },
                      { k: 'Post-study work', v: d.work },
                    ].map((row) => (
                      <div key={row.k} className="flex items-start justify-between gap-3 text-sm">
                        <span className="font-bold text-primary-dark/50">{row.k}</span>
                        <span className="font-black text-primary-dark text-right">{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}

            {/* "Not sure" CTA ticket */}
            <AnimatedSection delay={destinations.length * 0.06}>
              <Link
                href="/contact"
                className="relative bg-primary-dark border-2 border-black rounded-3xl shadow-[6px_6px_0px_rgba(130,201,61,1)] hover:-translate-y-1.5 hover:shadow-[9px_9px_0px_rgba(130,201,61,1)] transition-all duration-300 h-full flex flex-col justify-center items-start p-6 text-white group"
              >
                <Compass size={32} className="text-[#82C93D] mb-4" />
                <div className="font-heading font-black text-xl tracking-tight mb-2">Not sure where to go?</div>
                <p className="text-white/60 text-sm font-bold leading-relaxed mb-4">
                  Tell us your goals and budget — we will map the right destination for you.
                </p>
                <span className="inline-flex items-center gap-2 text-[#82C93D] font-black text-xs uppercase tracking-widest">
                  Book counselling
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. SERVICES — ITINERARY
          ═══════════════════════════════════════ */}
      <section id="services" className="py-24 md:py-32 bg-white border-b-2 border-black/10 scroll-mt-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-start">
            {/* Left: header + image */}
            <AnimatedSection>
              <div className="lg:sticky lg:top-28">
                <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                  What&apos;s In Your Itinerary
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4 leading-tight">
                  Everything between &ldquo;I want to study abroad&rdquo; and landing.
                </h2>
                <p className="text-primary-dark/60 text-lg font-bold leading-relaxed mb-8">
                  One desk, the full journey — no handing you off between vendors for visas, loans, or accommodation.
                </p>
                <div className="relative aspect-[4/3] rounded-3xl border-2 border-black shadow-[10px_10px_0px_rgba(130,201,61,1)] overflow-hidden group">
                  <Image
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&h=600&fit=crop"
                    alt="Students walking across a university campus"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary-dark/20 group-hover:opacity-0 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#82C93D]" />
                </div>
              </div>
            </AnimatedSection>

            {/* Right: itinerary legs */}
            <div className="grid sm:grid-cols-2 gap-5">
              {itinerary.map((leg, i) => (
                <AnimatedSection key={leg.num} delay={i * 0.06}>
                  <div className="flex gap-4 bg-white border-2 border-primary-dark/80 rounded-3xl p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.8)] transition-all duration-300 h-full">
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-primary-dark text-[#82C93D] border-2 border-black flex items-center justify-center font-heading font-black text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                        {leg.num}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <leg.icon size={16} className="text-primary" />
                        <h3 className="font-heading font-black text-primary-dark text-base leading-tight">{leg.title}</h3>
                      </div>
                      <p className="text-primary-dark/65 text-sm font-bold leading-relaxed">{leg.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. PROCESS — FLIGHT PATH
          ═══════════════════════════════════════ */}
      <section id="process" className="py-24 md:py-32 bg-primary-dark border-b-2 border-black relative overflow-hidden scroll-mt-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-block bg-[#82C93D] text-primary-dark font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">
                The Flight Path
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight mb-4">
                From first conversation to first day on campus.
              </h2>
              <p className="text-white/60 text-lg font-bold leading-relaxed">
                A real sequence, not a sales funnel — here is exactly what happens, in order.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {flightPath.map((step, i) => (
              <AnimatedSection key={step.num} delay={i * 0.08}>
                <div className="relative bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-3xl p-6 h-full hover:bg-white/10 transition-colors duration-300 group">
                  <div className="text-5xl font-heading font-black text-white/[0.06] absolute top-3 right-4 leading-none select-none group-hover:text-[#82C93D]/20 transition-colors">
                    {step.num}
                  </div>
                  <div className="w-12 h-12 bg-[#82C93D] text-primary-dark rounded-2xl flex items-center justify-center border-2 border-black mb-5">
                    <step.icon size={22} />
                  </div>
                  <h3 className="font-heading font-black text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-white/60 text-sm font-bold leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. WHY SUG — COMPARE
          ═══════════════════════════════════════ */}
      <section id="why-us" className="py-24 md:py-32 bg-white border-b-2 border-black/10 scroll-mt-20">
        <div className="container-wide">
          <AnimatedSection>
            <div className="max-w-3xl mb-16">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                Why SUG Creative
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4">
                We&apos;re not another counter in a franchise chain.
              </h2>
              <p className="text-primary-dark/60 text-lg font-bold leading-relaxed">
                Large agencies are built for volume. We are built around one student at a time — backed by a parent
                company that already builds careers, not just files visas.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="border-2 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
              {/* Header row */}
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1.2fr] bg-primary-dark text-white">
                <div className="p-5 font-black text-xs uppercase tracking-widest">What matters to you</div>
                <div className="hidden md:block p-5 font-black text-xs uppercase tracking-widest text-white/60 border-l-2 border-white/10">
                  Typical large agency
                </div>
                <div className="hidden md:flex items-center gap-2 p-5 font-black text-xs uppercase tracking-widest text-[#82C93D] border-l-2 border-white/10">
                  <Sparkles size={14} /> SUG Creative Study Abroad
                </div>
              </div>
              {/* Rows */}
              {compareRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1.2fr] ${
                    i % 2 === 0 ? 'bg-white' : 'bg-[#F0F2E8]'
                  } border-t-2 border-black/10`}
                >
                  <div className="p-5 font-black text-primary-dark text-sm">{row.label}</div>
                  <div className="p-5 flex items-start gap-2 text-sm font-bold text-primary-dark/50 md:border-l-2 border-black/10">
                    <XCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                    <span className="md:hidden font-black text-[10px] uppercase tracking-widest text-primary-dark/40 mr-1">
                      Agency:
                    </span>
                    {row.agency}
                  </div>
                  <div className="p-5 flex items-start gap-2 text-sm font-bold text-primary-dark md:border-l-2 border-black/10">
                    <CheckCircle2 size={16} className="text-[#82C93D] shrink-0 mt-0.5" />
                    <span className="md:hidden font-black text-[10px] uppercase tracking-widest text-[#82C93D] mr-1">
                      SUG:
                    </span>
                    {row.sug}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7. ABOUT / CREDIBILITY
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#F0F2E8] border-b-2 border-black/10">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
            <AnimatedSection>
              <div>
                <div className="inline-block bg-[#82C93D] text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">
                  The Parent Behind This Launch
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight mb-6">
                  Built on four years of getting students hired — now getting them on planes.
                </h2>
                <p className="text-primary-dark/65 text-base font-bold leading-relaxed mb-5">
                  Since 2022, SUG Creative has run career guidance, domain training, and startup-incubation programs out
                  of Rajahmundry — placing learners into roles at companies like Google, Bosch, Accenture and WatchGuard.
                  Study Abroad is the natural next step: the same counselling discipline, now pointed at international
                  classrooms instead of just the next job.
                </p>
                <p className="text-primary-dark/65 text-base font-bold leading-relaxed">
                  We are not promising fifteen years of overseas placement history we do not have. What we offer instead
                  is a team that already knows how to build a student&apos;s profile for the job market — and is now
                  applying that exact rigour to university applications, visas, and what comes after you land.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="relative bg-primary-dark text-white rounded-3xl border-2 border-black shadow-[10px_10px_0px_rgba(130,201,61,1)] p-8 md:p-10 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{ backgroundImage: 'radial-gradient(#82C93D 1.5px, transparent 1.5px)', backgroundSize: '26px 26px' }}
                />
                <div className="absolute top-6 right-6 w-20 h-20 rounded-full border-2 border-dashed border-[#82C93D] flex items-center justify-center rotate-12">
                  <BadgeCheck size={28} className="text-[#82C93D]" />
                </div>
                <div className="relative">
                  <h3 className="font-heading font-black text-2xl mb-2">SUG Creative at a glance</h3>
                  <p className="text-white/60 text-sm font-bold mb-8 max-w-[260px]">
                    Career guidance · Domain training · Startup incubation · Study Abroad
                  </p>
                  <div className="grid grid-cols-2 gap-5">
                    {glanceStats.map((s) => (
                      <div key={s.label} className="bg-white/5 border-2 border-white/10 rounded-2xl p-5">
                        <div className="font-heading font-black text-3xl text-[#82C93D] mb-1">{s.value}</div>
                        <div className="text-xs font-bold text-white/60 leading-snug">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8. FAQ
          ═══════════════════════════════════════ */}
      <section id="faq" className="py-24 md:py-32 bg-white border-b-2 border-black/10 scroll-mt-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16">
            <AnimatedSection>
              <div className="lg:sticky lg:top-28">
                <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                  Before You Ask
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4">
                  Frequently asked questions.
                </h2>
                <p className="text-primary-dark/60 text-lg font-bold leading-relaxed">
                  Still have a question? Our counsellors reply within one working day — no cost, no obligation.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="space-y-4">
                {faqs.map((faq, i) => {
                  const isOpen = openFaq === i
                  return (
                    <div
                      key={faq.q}
                      className={`border-2 border-black rounded-3xl overflow-hidden transition-all ${
                        isOpen ? 'shadow-[6px_6px_0px_rgba(130,201,61,1)] bg-[#F0F2E8]' : 'shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white'
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? -1 : i)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between gap-4 text-left p-6 cursor-pointer"
                      >
                        <span className="font-heading font-black text-primary-dark text-base md:text-lg">{faq.q}</span>
                        <span
                          className={`shrink-0 w-9 h-9 rounded-full border-2 border-black flex items-center justify-center transition-colors ${
                            isOpen ? 'bg-[#82C93D] text-primary-dark' : 'bg-white text-primary-dark'
                          }`}
                        >
                          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6 -mt-1">
                          <p className="text-primary-dark/70 text-sm md:text-base font-bold leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          9. FINAL CTA
          ═══════════════════════════════════════ */}
      <section id="contact" className="py-24 md:py-32 bg-[#1A9AB5] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="bg-white/5 border-2 border-white/15 rounded-3xl p-10 md:p-16 backdrop-blur-sm">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-block bg-[#82C93D] text-primary-dark font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">
                    Ready For Take-Off
                  </div>
                  <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight leading-tight mb-5">
                    Let&apos;s check you in for a <span className="text-[#82C93D]">free counselling</span> session.
                  </h2>
                  <p className="text-white/70 text-lg font-bold leading-relaxed mb-8 max-w-md">
                    Tell us where you would like to study, and a SUG Creative counsellor will reach out within one
                    working day — no obligation, no cost.
                  </p>
                  <div className="flex flex-wrap gap-8">
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-[#82C93D] mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#82C93D]">Office</div>
                        <div className="text-white font-bold text-sm mt-1">Rajahmundry, Andhra Pradesh, India</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={20} className="text-[#82C93D] mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#82C93D]">Response Time</div>
                        <div className="text-white font-bold text-sm mt-1">Within 24 hours</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boarding pass request card */}
                <div className="bg-white border-2 border-black rounded-3xl shadow-[10px_10px_0px_rgba(130,201,61,1)] p-8 md:p-10">
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-5">
                    <Plane size={14} className="rotate-90" />
                    Boarding Pass Request
                  </div>
                  <h3 className="font-heading font-black text-2xl text-primary-dark mb-3">
                    Reserve your free seat at the counselling desk.
                  </h3>
                  <p className="text-primary-dark/60 text-sm font-bold leading-relaxed mb-6">
                    Share your name, preferred destination, and study level on our contact form — your dedicated
                    counsellor takes it from there.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'One dedicated counsellor, start to finish',
                      'Country, university & course shortlisting',
                      'Scholarships, loans & visa support',
                    ].map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm font-bold text-primary-dark/80">
                        <CheckCircle2 size={16} className="text-[#82C93D] shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-2xl h-16 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
                  >
                    <Link href="/contact">
                      Book My Free Counselling <ArrowUpRight size={20} className="ml-2" />
                    </Link>
                  </Button>
                  <p className="text-primary-dark/50 text-xs font-bold text-center mt-4">
                    No spam, no obligation — just a real conversation with a counsellor.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </main>
  )
}
