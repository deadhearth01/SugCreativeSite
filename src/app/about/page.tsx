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
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

gsap.registerPlugin(ScrollTrigger)

const timeline = [
  { year: '2015', title: 'The Beginning', desc: 'Founded with a vision to bridge the gap between potential and opportunity.' },
  { year: '2017', title: 'First 500 Careers', desc: 'Reached our first milestone — 500 careers transformed through guided mentorship.' },
  { year: '2019', title: 'Business Consulting Launch', desc: 'Expanded into full-spectrum business solutions for SMEs and enterprises.' },
  { year: '2021', title: 'Startup Hub Launched', desc: 'Opened our incubation program, helping 20+ startups get off the ground.' },
  { year: '2023', title: 'Edu Tech Division', desc: 'Launched our technology-powered learning platform for scalable education.' },
  { year: '2025', title: '3000+ Lives Impacted', desc: 'Continuing to grow, innovate, and transform futures across India and beyond.' },
]

const values = [
  { icon: Lightbulb, title: 'Innovation', desc: 'We push boundaries and embrace creative solutions.' },
  { icon: Heart, title: 'Empathy', desc: 'We listen first, understand deeply, then act decisively.' },
  { icon: Shield, title: 'Integrity', desc: 'Transparent, honest, and ethical in everything we do.' },
  { icon: Zap, title: 'Excellence', desc: 'We never settle for good enough — we aim for exceptional.' },
]

const team = [
  { name: 'Sujith Kumar', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face' },
  { name: 'Ananya Rao', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&crop=face' },
  { name: 'Vikram Desai', role: 'Career Strategy Lead', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face' },
  { name: 'Meera Nair', role: 'Startup Hub Director', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face' },
  { name: 'Rahul Joshi', role: 'Tech & Product Lead', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face' },
  { name: 'Preethi Menon', role: 'Client Success Manager', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face' },
]

export default function AboutPage() {
  const heroTextRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (heroTextRef.current) {
      gsap.from(heroTextRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
      })
    }
  }, [])

  return (
    <>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 bg-white overflow-hidden">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <Badge variant="secondary" className="mb-4 rounded-sm bg-primary-ghost text-primary-bright font-semibold uppercase tracking-widest text-xs px-3 py-1">
                Our Story
              </Badge>
              <h1
                ref={heroTextRef}
                className="text-4xl md:text-5xl lg:text-[3.25rem] font-heading font-bold text-primary leading-tight mb-6"
              >
                We Don&apos;t Just Consult —{' '}
                <span className="bg-gradient-to-r from-primary via-primary-light to-primary-bright bg-clip-text text-transparent">We Transform</span>
              </h1>
              <p className="text-lg text-foreground-muted max-w-lg leading-relaxed">
                Sug Creative was born from a simple belief: everyone deserves access to 
                world-class guidance, whether they&apos;re building a business, launching a startup, 
                or shaping a career.
              </p>
            </div>
            <div className="relative h-72 lg:h-96 overflow-hidden hidden lg:block">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="Our team at work"
                fill
                className="object-cover"
                sizes="50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MISSION & VISION ═══ */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatedSection direction="left">
              <Card className="rounded-sm shadow-none border-none bg-primary h-full">
                <CardContent className="p-10">
                  <div className="w-14 h-14 flex items-center justify-center bg-primary-bright mb-6">
                    <Target size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-white mb-4">Our Mission</h2>
                  <p className="text-white/70 leading-relaxed">
                    To democratize access to premium business consulting, career guidance, 
                    and startup mentorship — making world-class expertise available to 
                    everyone, regardless of background or budget.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.15}>
              <Card className="rounded-sm shadow-none border-2 border-primary bg-white h-full">
                <CardContent className="p-10">
                  <div className="w-14 h-14 flex items-center justify-center bg-primary mb-6">
                    <Eye size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-primary mb-4">Our Vision</h2>
                  <p className="text-foreground-muted leading-relaxed">
                    To become India&apos;s most trusted partner for professional growth — 
                    a platform where businesses thrive, careers flourish, and startups 
                    find their wings. A future where potential never goes unfulfilled.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ COMPANY TIMELINE ═══ */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="line-accent mx-auto" />
              <h2 className="text-3xl lg:text-[2.75rem] font-heading font-bold text-primary">
                A Decade of Impact
              </h2>
            </div>
          </AnimatedSection>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

            <div className="space-y-12">
              {timeline.map((item, i) => (
                <AnimatedSection
                  key={item.year}
                  delay={i * 0.1}
                  direction={i % 2 === 0 ? 'left' : 'right'}
                >
                  <div className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <Badge variant="outline" className="rounded-sm text-primary-bright border-primary-bright/30 font-bold text-xs mb-1">
                        {item.year}
                      </Badge>
                      <h3 className="text-xl font-heading font-bold text-primary mt-1 mb-2">{item.title}</h3>
                      <p className="text-foreground-muted text-sm">{item.desc}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary flex items-center justify-center text-white font-heading font-bold text-sm shrink-0 z-10">
                      {item.year.slice(2)}
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE SUG ═══ */}
      <section className="section-padding bg-off-white grid-pattern">
        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="line-accent mx-auto" />
              <h2 className="text-3xl lg:text-[2.75rem] font-heading font-bold text-primary mb-4">
                Values That Drive Us
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <AnimatedSection key={value.title} delay={i * 0.1}>
                <Card className="rounded-sm shadow-none border-border hover-lift text-center card-shine h-full">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 mx-auto flex items-center justify-center bg-primary-ghost mb-6">
                      <value.icon size={24} className="text-primary-bright" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-primary mb-2">{value.title}</h3>
                    <p className="text-foreground-muted text-sm">{value.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM ═══ */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="line-accent mx-auto" />
              <h2 className="text-3xl lg:text-[2.75rem] font-heading font-bold text-primary mb-4">
                Meet the Team
              </h2>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                A diverse team of strategists, mentors, technologists, and dreamers united 
                by a shared passion for creating impact.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <AnimatedSection key={member.name} delay={i * 0.1}>
                <Card className="rounded-sm shadow-none border-border hover-lift group overflow-hidden card-shine h-full">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-heading font-bold text-primary group-hover:text-primary-bright transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-foreground-muted text-sm mt-1">{member.role}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">
                  Ready to Join the Sug Fam?
                </h2>
                <p className="text-white/50 text-lg">
                  Let&apos;s create something extraordinary together.
                </p>
              </div>
              <Button asChild size="lg" className="rounded-sm bg-white text-primary hover:bg-primary-ghost uppercase tracking-wider text-sm font-semibold px-8 shrink-0">
                <Link href="/contact" className="group flex items-center gap-3">
                  Get In Touch
                  <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </>
  )
}
