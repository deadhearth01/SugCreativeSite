'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Link from 'next/link'
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
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Button } from '@/components/ui/button'

gsap.registerPlugin(ScrollTrigger)

const serviceCategories = [
  {
    id: 'business',
    num: '01',
    icon: Briefcase,
    title: 'Business Solutions',
    tagline: 'Strategic consulting for enterprises ready to scale',
    desc: 'Strategic consulting and operational excellence for businesses ready to scale, optimize, and dominate their market.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&h=600&fit=crop',
    cta: 'Get Business Consultation',
    accentColor: '#82C93D',
    items: [
      { icon: BarChart3, title: 'Strategic Consulting', desc: 'Data-driven strategies to optimize operations, reduce costs, and accelerate growth.' },
      { icon: Monitor, title: 'Digital Transformation', desc: 'Modernize your business with cutting-edge technology solutions and automation.' },
      { icon: PenTool, title: 'Brand Strategy & Identity', desc: 'Build a powerful brand that resonates with your audience and stands out in the market.' },
      { icon: TrendingUp, title: 'Revenue Optimization', desc: 'Maximize your profitability through pricing strategies, funnel optimization, and market expansion.' },
      { icon: Users, title: 'HR & Team Building', desc: 'Build high-performance teams with our recruitment, training, and organizational development services.' },
      { icon: Code, title: 'Tech Solutions', desc: 'Custom software development, website creation, and app development to power your business.' },
    ],
  },
  {
    id: 'career',
    num: '02',
    icon: GraduationCap,
    title: 'Career Guidance & Training',
    tagline: 'Accelerate your journey to the top',
    desc: 'Comprehensive career development programs to help you land your dream job, switch industries, or level up your skills.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&h=600&fit=crop',
    cta: 'Start Your Career Journey',
    accentColor: '#1A9AB5',
    items: [
      { icon: GraduationCap, title: 'Professional Training', desc: 'Industry-relevant courses in tech, business, marketing, and more — taught by practitioners.' },
      { icon: FileText, title: 'Resume & Profile Building', desc: 'Craft ATS-optimized resumes, LinkedIn profiles, and professional portfolios that get noticed.' },
      { icon: Presentation, title: 'Interview Preparation', desc: 'Mock interviews, behavioral coaching, and technical prep to help you ace any interview.' },
      { icon: Target, title: 'Career Roadmapping', desc: 'Personalized career plans based on your skills, interests, and market demand analysis.' },
      { icon: BookOpen, title: 'Workshops & Bootcamps', desc: 'Intensive, hands-on learning experiences for rapid upskilling in high-demand areas.' },
      { icon: Trophy, title: 'Placement Assistance', desc: 'Direct connections with hiring partners and companies looking for talent like you.' },
    ],
  },
  {
    id: 'startup',
    num: '03',
    icon: Rocket,
    title: 'Startup Hub',
    tagline: 'From idea to first funding round',
    desc: 'A complete ecosystem for founders — from first idea to first funding round. We provide the mentorship, resources, and connections you need.',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&h=600&fit=crop',
    cta: 'Launch Your Startup',
    accentColor: '#82C93D',
    items: [
      { icon: Lightbulb, title: 'Ideation & Validation', desc: 'Turn your idea into a validated business concept with market research and feasibility analysis.' },
      { icon: Building2, title: 'Business Model Design', desc: 'Create sustainable, scalable business models with revenue strategies that work.' },
      { icon: BarChart3, title: 'Funding & Pitch Prep', desc: 'Investor-ready pitch decks, financial projections, and introductions to angel investors and VCs.' },
      { icon: Code, title: 'MVP Development', desc: 'Build your minimum viable product quickly and cost-effectively to test market fit.' },
      { icon: TrendingUp, title: 'Growth Hacking', desc: 'Rapid experimentation across marketing channels to find the fastest path to growth.' },
      { icon: Users, title: 'Mentor Network', desc: "Access our network of 50+ industry mentors who've built and scaled successful businesses." },
    ],
  },
  {
    id: 'edutech',
    num: '04',
    icon: Monitor,
    title: 'Edu Tech',
    tagline: 'Technology-powered learning at scale',
    desc: 'Technology-powered learning platforms and solutions to make education accessible, engaging, and results-driven for institutions and learners alike.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=600&fit=crop',
    cta: 'Explore Edu Tech',
    accentColor: '#1A9AB5',
    items: [
      { icon: Monitor, title: 'Learning Management', desc: 'Custom LMS platforms with analytics, gamification, and AI-powered personalization.' },
      { icon: PenTool, title: 'Content Development', desc: 'Interactive course content, video production, and assessment design for modern learners.' },
      { icon: Building2, title: 'Institution Partnerships', desc: 'White-label training programs for universities, colleges, and corporate training divisions.' },
    ],
  },
  {
    id: 'young-compete',
    num: '05',
    icon: Trophy,
    title: 'Young Compete',
    tagline: 'Building the next generation of achievers',
    desc: 'Our flagship youth development program — designed to build competitive skills, leadership abilities, and professional confidence.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&h=600&fit=crop',
    cta: 'Enroll Your Youth',
    accentColor: '#82C93D',
    items: [
      { icon: Trophy, title: 'Competition Prep', desc: 'Training for hackathons, case competitions, olympiads, and global challenges.' },
      { icon: Users, title: 'Leadership Development', desc: 'Programs designed to cultivate communication, teamwork, and strategic thinking.' },
      { icon: Briefcase, title: 'Internship Connect', desc: 'Bridge the gap between education and industry with curated internship opportunities.' },
      { icon: GraduationCap, title: 'College Application Support', desc: 'Guidance for overseas admissions, scholarship applications, and portfolio building.' },
    ],
  },
]

const sectionBgs = [
  'bg-white',
  'bg-[#f0fafa]',
  'bg-white',
  'bg-[#f0fafa]',
  'bg-white',
]

export default function ServicesPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState(0)
  const [hoveredDot, setHoveredDot] = useState<number | null>(null)

  useEffect(() => {
    if (heroRef.current) {
      const tl = gsap.timeline({ delay: 0.4 })
      tl.from(heroRef.current.querySelectorAll('.hero-animate'), {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
      })
    }
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    serviceCategories.forEach((cat, idx) => {
      const el = document.getElementById(cat.id)
      if (el) {
        const obs = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) setActiveSection(idx)
          },
          { threshold: 0.3 }
        )
        obs.observe(el)
        observers.push(obs)
      }
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Navbar />

      {/* Sticky Sidebar Nav */}
      <nav className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-0">
        <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-[2px] bg-primary-dark/10 rounded-full" />
        {serviceCategories.map((cat, idx) => (
          <div key={cat.id} className="relative flex items-center py-3">
            <button
              onClick={() => scrollToSection(cat.id)}
              onMouseEnter={() => setHoveredDot(idx)}
              onMouseLeave={() => setHoveredDot(null)}
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 border-2 ${
                activeSection === idx
                  ? 'border-primary-dark bg-primary-dark text-white scale-110 shadow-lg'
                  : 'border-primary-dark/20 bg-white text-primary-dark/50 hover:border-primary-dark/60 hover:text-primary-dark hover:scale-105'
              }`}
              aria-label={`Navigate to ${cat.title}`}
            >
              {cat.num}
            </button>
            <div
              className={`absolute left-14 whitespace-nowrap bg-primary-dark text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-2xl shadow-xl transition-all duration-200 pointer-events-none ${
                hoveredDot === idx ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
            >
              {cat.title}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-primary-dark rotate-45 rounded-sm" />
            </div>
          </div>
        ))}
      </nav>

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center pt-32 pb-20 bg-[#fdfbf9] overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="container-wide relative z-10 w-full" ref={heroRef}>
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-[55%]">
              <div className="hero-animate inline-flex items-center gap-3 bg-white text-primary font-black text-xs uppercase tracking-widest px-5 py-2.5 mb-6 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Our Services
              </div>
              <h1 className="hero-animate text-5xl sm:text-6xl md:text-7xl font-heading font-black text-primary-dark leading-[1.05] tracking-tight mb-8">
                Everything<br />
                You Need to<br />
                <span className="text-[#82C93D]">Succeed</span>
              </h1>
              <div className="hero-animate text-lg md:text-xl text-primary-dark/70 max-w-xl leading-relaxed font-bold border-l-4 border-primary pl-5 mb-10">
                From enterprise consulting to career launchpads &mdash; we offer a comprehensive ecosystem
                of services designed to accelerate your growth at every stage.
              </div>
              <div className="hero-animate flex flex-wrap gap-3">
                {serviceCategories.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className="flex items-center gap-2 bg-white border-2 border-primary-dark text-primary-dark font-black text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-primary-dark hover:text-white transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)]"
                  >
                    <span className="text-[#82C93D] font-black">{s.num}</span>
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:w-[45%] grid grid-cols-2 gap-4 w-full">
              {serviceCategories.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="hero-animate group relative overflow-hidden rounded-3xl border-2 border-primary-dark shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-all duration-300 aspect-square text-left"
                >
                  <Image src={s.image} alt={s.title} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-primary-dark/60 group-hover:bg-primary-dark/40 transition-colors" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#82C93D]">{s.num}</div>
                    <div className="text-sm font-black text-white leading-tight">{s.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Sections */}
      {serviceCategories.map((cat, catIndex) => {
        const isEven = catIndex % 2 === 0
        return (
          <section
            key={cat.id}
            id={cat.id}
            className={`py-24 md:py-32 scroll-mt-20 ${sectionBgs[catIndex] || 'bg-white'}`}
          >
            <div className="container-wide">
              <AnimatedSection>
                <div className={`flex flex-col lg:flex-row items-start lg:items-center gap-12 mb-16 ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="text-7xl md:text-8xl font-heading font-black leading-none opacity-10 select-none" style={{ color: cat.accentColor }}>
                        {cat.num}
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-primary-dark shadow-[4px_4px_0px_rgba(0,0,0,0.15)]" style={{ backgroundColor: cat.accentColor }}>
                          <cat.icon size={24} className="text-white" />
                        </div>
                        <div className="inline-flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full w-fit" style={{ backgroundColor: cat.accentColor }}>
                          {cat.tagline}
                        </div>
                      </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-5">
                      {cat.title}
                    </h2>
                    <p className="text-primary-dark/70 font-bold text-lg max-w-xl leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="lg:w-[45%] w-full relative overflow-hidden rounded-3xl border-2 border-primary-dark shadow-[10px_10px_0px_rgba(0,0,0,1)] aspect-[4/3] group">
                    <Image src={cat.image} alt={cat.title} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-primary-dark/20 group-hover:opacity-0 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: cat.accentColor }} />
                  </div>
                </div>
              </AnimatedSection>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {cat.items.map((item, i) => (
                  <AnimatedSection key={item.title} delay={i * 0.08}>
                    <div className="bg-white border-2 border-primary-dark/80 p-8 rounded-3xl shadow-[5px_5px_0px_rgba(0,0,0,0.8)] hover:-translate-y-1.5 hover:shadow-[8px_8px_0px_rgba(0,0,0,0.8)] transition-all duration-300 group h-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: cat.accentColor }} />
                      <div className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-primary-dark mb-6 shadow-[3px_3px_0px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform" style={{ backgroundColor: cat.accentColor }}>
                        <item.icon size={20} className="text-white" />
                      </div>
                      <h3 className="text-lg font-heading font-black text-primary-dark mb-3">{item.title}</h3>
                      <p className="text-primary-dark/70 text-sm font-bold leading-relaxed">{item.desc}</p>
                      <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: cat.accentColor }}>
                        <CheckCircle2 size={14} />
                        Included in plan
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              <AnimatedSection delay={0.3}>
                <Button asChild size="lg" className="bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-2xl border-2 border-primary-dark px-10 h-16 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                  <Link href="/contact" className="flex items-center gap-3">
                    {cat.cta}
                    <ArrowUpRight size={20} />
                  </Link>
                </Button>
              </AnimatedSection>
            </div>
          </section>
        )
      })}

      {/* Bottom CTA */}
      <section className="py-24 md:py-32 bg-primary-dark relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 md:p-16 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                <div className="max-w-2xl">
                  <div className="inline-block bg-white text-primary-dark font-black text-xs uppercase tracking-widest px-5 py-2.5 mb-6 rounded-full shadow-[4px_4px_0px_rgba(255,255,255,0.2)] border-2 border-white/30">
                    Not Sure Where to Start?
                  </div>
                  <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 leading-tight">
                    Let&apos;s Find the Right<br />
                    <span className="text-[#82C93D]">Solution For You</span>
                  </h2>
                  <p className="text-white/50 text-lg font-bold">
                    Book a free discovery call and our experts will map out the best path forward.
                  </p>
                </div>
                <div className="shrink-0">
                  <Link href="/contact" className="group relative inline-flex items-center justify-center bg-white text-primary-dark px-10 py-6 font-black uppercase tracking-widest text-sm hover:text-white border-2 border-white transition-all duration-300 rounded-2xl overflow-hidden hover:shadow-[10px_10px_0px_rgba(255,255,255,0.3)]">
                    <span className="relative z-10 flex items-center gap-3">
                      Book Free Consultation
                      <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                    <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </>
  )
}
