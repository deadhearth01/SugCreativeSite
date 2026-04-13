'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  Target,
  Eye,
  Lightbulb,
  Heart,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Award,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'

gsap.registerPlugin(ScrollTrigger)

const timeline = [
  { year: '2015', title: 'The Beginning', desc: 'Founded with a vision to bridge the gap between potential and opportunity across businesses and careers.' },
  { year: '2017', title: 'First 500 Careers', desc: 'Reached our first major milestone — 500 careers transformed through guided mentorship and strategic coaching.' },
  { year: '2019', title: 'Business Consulting Launch', desc: 'Expanded into full-spectrum business solutions for SMEs and enterprises across South India.' },
  { year: '2021', title: 'Startup Hub Opened', desc: 'Launched our flagship incubation program, helping 20+ startups validate, fund, and scale from zero.' },
  { year: '2023', title: 'Edu Tech Division', desc: 'Introduced our technology-powered learning platform for scalable, outcome-focused education.' },
  { year: '2025', title: '3000+ Lives Impacted', desc: 'Continuing to grow, innovate, and transform futures across India and beyond with measurable results.' },
]

const values = [
  { icon: Lightbulb, title: 'Innovation', desc: 'We push boundaries, embrace creative thinking, and deliver solutions that didn\'t exist before.' },
  { icon: Heart, title: 'Empathy', desc: 'We listen first, understand deeply, then act decisively with the human impact always in mind.' },
  { icon: Shield, title: 'Integrity', desc: 'Transparent, honest, and ethical in everything we do — no shortcuts, no compromises.' },
  { icon: Zap, title: 'Excellence', desc: 'We never settle for good enough. We aim for exceptional outcomes at every engagement.' },
]

const stats = [
  { value: 3000, suffix: '+', label: 'Lives Impacted', icon: Users },
  { value: 200, suffix: '+', label: 'Businesses Scaled', icon: TrendingUp },
  { value: 50, suffix: '+', label: 'Startups Launched', icon: Lightbulb },
  { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: Award },
]

const team = [
  { name: 'Vamsi', role: 'Founder & CEO', image: '/team/vamsi.jpg' },
  { name: 'Teja Madhuri', role: 'Head of Operations', image: '/team/teja.jpg' },
  { name: 'Depika', role: 'Career Strategy Lead', image: '/team/depika.jpg' },
  { name: 'Meg', role: 'Startup Hub Director', image: '/team/meg.jpg' },
  { name: 'Rahul Joshi', role: 'Tech & Product Lead', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face' },
  { name: 'Preethi Menon', role: 'Client Success Manager', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face' },
]

const galleryImages = [
  '/events/event1.jpg',
  '/events/event2.jpg',
  '/events/event3.jpg',
  '/events/event4.jpg',
  '/events/event5.jpg',
  '/events/event6.jpg',
]

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

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

    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.querySelectorAll('.stat-card'),
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
        }
      )
    }

    if (timelineRef.current) {
      const items = timelineRef.current.querySelectorAll('.timeline-item')
      items.forEach((item, i) => {
        gsap.fromTo(item,
          { x: i % 2 === 0 ? -60 : 60, opacity: 0 },
          {
            x: 0, opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 85%' },
          }
        )
      })
    }

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-center pt-32 pb-20 bg-[#fdfbf9] border-b-2 border-black/10 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Corner decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-dark/3 border-l-2 border-primary-dark/10 hidden lg:block" />

        <div className="container-wide relative z-10 w-full" ref={heroRef}>
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
            {/* Left Text */}
            <div className="lg:w-[50%]">
              <div className="hero-animate inline-flex items-center gap-3 bg-white text-primary font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                <div className="w-2 h-2 bg-green-500 rounded-3xl animate-pulse" />
                Our Story
              </div>
              <h1 className="hero-animate text-5xl sm:text-6xl md:text-7xl font-heading font-black text-primary-dark leading-[1.05] tracking-tight mb-8">
                We Don&apos;t<br />
                Just Consult —<br />
                <span className="text-[#82C93D]">We Transform</span>
              </h1>
              <div className="hero-animate text-lg md:text-xl text-primary-dark/70 max-w-xl leading-relaxed font-bold border-l-4 border-primary pl-5 mb-10">
                Sug Creative was born from a simple belief: everyone deserves access to world-class
                guidance — whether they&apos;re building a business, launching a startup, or shaping a career.
              </div>
              <div className="hero-animate flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-3xl border-2 border-primary-dark px-10 h-16 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                  <Link href="/contact" className="flex items-center gap-3">
                    Work With Us <ArrowUpRight size={20} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-2 border-primary-dark text-primary-dark hover:bg-primary-dark hover:text-white font-black text-sm uppercase tracking-widest rounded-3xl px-10 h-16 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                  <Link href="/services">View Services</Link>
                </Button>
              </div>
            </div>

            {/* Right: Image grid */}
            <div className="lg:w-[50%] relative w-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="hero-animate relative h-64 rounded-3xl border-2 border-primary-dark shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=500&fit=crop" alt="Team collaboration" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-primary-dark/20 group-hover:opacity-0 transition-opacity" />
                </div>
                <div className="hero-animate relative h-64 mt-8 rounded-3xl border-2 border-primary-dark shadow-[8px_8px_0px_rgba(130,201,61,1)] overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=500&fit=crop" alt="Business growth" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-[#82C93D]/20 group-hover:opacity-0 transition-opacity" />
                </div>
                {/* Stat overlay box */}
                <div className="hero-animate absolute -bottom-6 left-4 bg-primary-dark text-white border-2 border-primary-dark p-5 rounded-3xl shadow-[8px_8px_0px_rgba(130,201,61,1)] z-20">
                  <div className="text-3xl font-black font-heading text-[#82C93D] mb-1">10+</div>
                  <div className="text-[10px] uppercase tracking-widest font-black text-white/70">Years of Impact</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-20 bg-primary-dark border-b-2 border-black relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="container-wide relative z-10" ref={statsRef}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={stat.label} className="stat-card rounded-3xl text-center p-8 border-2 border-white/10 hover:border-[#82C93D] bg-white/5 backdrop-blur-sm shadow-[4px_4px_0px_rgba(0,0,0,0.5)] transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 mx-auto mb-4 bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-[#82C93D] transition-colors">
                  <stat.icon size={22} className="text-[#82C93D] group-hover:text-white transition-colors" />
                </div>
                <div className="text-4xl md:text-5xl font-heading font-black text-white mb-2 tabular-nums">
                  <NumberTicker value={stat.value} />{stat.suffix}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#82C93D]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MISSION & VISION ═══ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                Our Foundation
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight">
                Mission & Vision
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatedSection direction="left">
              <div className="bg-primary-dark text-white border-2 border-primary-dark p-10 md:p-12 rounded-3xl shadow-[10px_10px_0px_rgba(0,0,0,1)] h-full group hover:-translate-y-1 hover:shadow-[14px_14px_0px_rgba(0,0,0,1)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#82C93D] border-2 border-white/20 mb-8 shadow-[4px_4px_0px_rgba(130,201,61,0.5)]">
                  <Target size={28} className="text-white" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#82C93D] mb-3">Mission</div>
                <h3 className="text-2xl md:text-3xl font-heading font-black text-white mb-6 leading-tight">
                  Democratize Premium Guidance
                </h3>
                <p className="text-white/70 leading-relaxed font-bold text-base">
                  To make world-class business consulting, career guidance, and startup mentorship
                  accessible to everyone — regardless of background, budget, or location.
                  Every ambitious person deserves expert support.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.15}>
              <div className="bg-white text-primary-dark border-2 border-primary-dark p-10 md:p-12 rounded-3xl shadow-[10px_10px_0px_rgba(130,201,61,1)] h-full group hover:-translate-y-1 hover:shadow-[14px_14px_0px_rgba(130,201,61,1)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary-dark border-2 border-primary-dark mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <Eye size={28} className="text-[#82C93D]" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Vision</div>
                <h3 className="text-2xl md:text-3xl font-heading font-black text-primary-dark mb-6 leading-tight">
                  India&apos;s Most Trusted Growth Partner
                </h3>
                <p className="text-primary-dark/70 leading-relaxed font-bold text-base">
                  To become the definitive platform for professional and business growth across India —
                  where businesses thrive, careers flourish, startups find their wings, and potential
                  never goes unfulfilled.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ COMPANY TIMELINE ═══ */}
      <section className="py-24 md:py-32 bg-[#fdfbf9] border-b-2 border-black/10 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="text-center mb-20">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                Company History
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight">
                A Decade of Impact
              </h2>
            </div>
          </AnimatedSection>

          <div className="relative" ref={timelineRef}>
            {/* Center line (desktop only) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-primary-dark/10 hidden md:block" />

            <div className="space-y-10">
              {timeline.map((item, i) => (
                <div key={item.year} className={`timeline-item flex flex-col md:flex-row items-center gap-0 md:gap-0 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  {/* Content side */}
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:pr-16' : 'md:pl-16'} w-full md:w-auto mb-4 md:mb-0`}>
                    <div className={`bg-white border-2 border-primary-dark p-8 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all duration-300 ${i % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'} max-w-lg`}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#82C93D] mb-2">{item.year}</div>
                      <h3 className="text-xl md:text-2xl font-heading font-black text-primary-dark mb-3">{item.title}</h3>
                      <p className="text-primary-dark/70 font-bold leading-relaxed">{item.desc}</p>
                    </div>
                  </div>

                  {/* Year badge (center) */}
                  <div className="w-16 h-16 bg-primary-dark text-white font-black flex items-center justify-center rounded-3xl border-2 border-primary-dark shadow-[4px_4px_0px_rgba(130,201,61,1)] z-10 shrink-0 text-lg">
                    {item.year.slice(2)}
                  </div>

                  {/* Empty side (desktop) */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALUES ═══ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                Core Principles
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight">
                Values That Drive Us
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <AnimatedSection key={value.title} delay={i * 0.1}>
                <div className="bg-white border-2 border-primary-dark p-8 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all duration-300 group h-full">
                  <div className="w-14 h-14 flex rounded-2xl items-center justify-center bg-primary-dark border-2 border-primary-dark mb-6 shadow-[4px_4px_0px_rgba(130,201,61,1)] group-hover:bg-[#82C93D] transition-colors">
                    <value.icon size={24} className="text-[#82C93D] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-heading font-black text-primary-dark mb-3">{value.title}</h3>
                  <p className="text-primary-dark/70 font-bold text-sm leading-relaxed">{value.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 md:py-32 bg-primary-dark relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
              <div className="max-w-2xl">
                <div className="inline-block bg-white text-primary-dark font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(255,255,255,0.2)] border-2 border-white/30">
                  Join the Sug Family
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 leading-tight">
                  Ready to Write Your <br />
                  <span className="text-[#82C93D]">Success Story?</span>
                </h2>
                <p className="text-white/50 text-lg font-bold">
                  Let&apos;s create something extraordinary together.
                </p>
              </div>
              <div className="shrink-0">
                <Link href="/contact" className="group relative inline-flex items-center justify-center bg-white text-primary-dark px-10 py-6 font-black uppercase tracking-widest text-sm hover:text-white border-2 border-white transition-all duration-300 rounded-3xl overflow-hidden hover:shadow-[10px_10px_0px_rgba(255,255,255,0.3)]">
                  <span className="relative z-10 flex items-center gap-3">
                    Get In Touch
                    <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </>
  )
}
