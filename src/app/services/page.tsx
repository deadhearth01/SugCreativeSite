'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowRight,
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
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const businessServices = [
  { icon: BarChart3, title: 'Strategic Consulting', desc: 'Data-driven strategies to optimize operations, reduce costs, and accelerate growth.' },
  { icon: Monitor, title: 'Digital Transformation', desc: 'Modernize your business with cutting-edge technology solutions and automation.' },
  { icon: PenTool, title: 'Brand Strategy & Identity', desc: 'Build a powerful brand that resonates with your audience and stands out in the market.' },
  { icon: TrendingUp, title: 'Revenue Optimization', desc: 'Maximize your profitability through pricing strategies, funnel optimization, and market expansion.' },
  { icon: Users, title: 'HR & Team Building', desc: 'Build high-performance teams with our recruitment, training, and organizational development services.' },
  { icon: Code, title: 'Tech Solutions', desc: 'Custom software development, website creation, and app development to power your business.' },
]

const careerServices = [
  { icon: GraduationCap, title: 'Professional Training', desc: 'Industry-relevant courses in tech, business, marketing, and more — taught by practitioners.' },
  { icon: FileText, title: 'Resume & Profile Building', desc: 'Craft ATS-optimized resumes, LinkedIn profiles, and professional portfolios that get noticed.' },
  { icon: Presentation, title: 'Interview Preparation', desc: 'Mock interviews, behavioral coaching, and technical prep to help you ace any interview.' },
  { icon: Target, title: 'Career Roadmapping', desc: 'Personalized career plans based on your skills, interests, and market demand analysis.' },
  { icon: BookOpen, title: 'Workshops & Bootcamps', desc: 'Intensive, hands-on learning experiences for rapid upskilling in high-demand areas.' },
  { icon: Trophy, title: 'Placement Assistance', desc: 'Direct connections with hiring partners and companies looking for talent like you.' },
]

const startupServices = [
  { icon: Lightbulb, title: 'Ideation & Validation', desc: 'Turn your idea into a validated business concept with market research and feasibility analysis.' },
  { icon: Building2, title: 'Business Model Design', desc: 'Create sustainable, scalable business models with revenue strategies that work.' },
  { icon: BarChart3, title: 'Funding & Pitch Prep', desc: 'Investor-ready pitch decks, financial projections, and introductions to angel investors and VCs.' },
  { icon: Code, title: 'MVP Development', desc: 'Build your minimum viable product quickly and cost-effectively to test market fit.' },
  { icon: TrendingUp, title: 'Growth Hacking', desc: 'Rapid experimentation across marketing channels to find the fastest path to growth.' },
  { icon: Users, title: 'Mentor Network', desc: 'Access to our network of 50+ industry mentors who\'ve built and scaled successful businesses.' },
]

export default function ServicesPage() {
  const heroRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (heroRef.current) {
      gsap.from(heroRef.current, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.3 })
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
                Our Services
              </Badge>
              <h1 ref={heroRef} className="text-4xl md:text-5xl lg:text-[3.25rem] font-heading font-bold text-primary leading-tight mb-6">
                Everything You Need to{' '}
                <span className="bg-gradient-to-r from-primary via-primary-light to-primary-bright bg-clip-text text-transparent">Succeed</span>
              </h1>
              <p className="text-lg text-foreground-muted max-w-lg leading-relaxed">
                From enterprise consulting to career launchpads — we offer a comprehensive 
                ecosystem of services designed to accelerate your growth at every stage.
              </p>
            </div>
            <div className="relative h-72 lg:h-96 overflow-hidden hidden lg:block">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
                alt="Team strategy session"
                fill
                className="object-cover"
                sizes="50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BUSINESS SOLUTIONS ═══ */}
      <section id="business" className="section-padding bg-off-white scroll-mt-20">
        <div className="container-wide">
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary text-white">
                    <Briefcase size={22} />
                  </div>
                  <Badge variant="outline" className="rounded-sm text-primary-bright border-primary-bright/30 font-semibold uppercase tracking-widest text-xs">
                    01
                  </Badge>
                </div>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">Business Solutions</h2>
                <p className="text-foreground-muted text-lg max-w-lg">
                  Strategic consulting and operational excellence for businesses ready to scale, optimize, and dominate their market.
                </p>
              </div>
              <div className="relative h-64 overflow-hidden hidden lg:block">
                <Image
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop"
                  alt="Business consulting"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessServices.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <Card className="rounded-sm shadow-none border-border hover-lift h-full card-shine">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 flex items-center justify-center bg-primary-ghost mb-5">
                      <item.icon size={22} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-primary mb-2">{item.title}</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.3}>
            <div className="mt-10">
              <Button asChild size="lg" className="rounded-sm bg-primary hover:bg-primary-deep text-white uppercase tracking-wider text-sm font-semibold px-8">
                <Link href="/contact" className="group inline-flex items-center gap-3">
                  Get Business Consultation
                  <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ CAREER GUIDANCE ═══ */}
      <section id="career" className="section-padding bg-white scroll-mt-20">
        <div className="container-wide">
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
              <div className="relative h-64 overflow-hidden hidden lg:block order-2 lg:order-1">
                <Image
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop"
                  alt="Career guidance session"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary-bright text-white">
                    <GraduationCap size={22} />
                  </div>
                  <Badge variant="outline" className="rounded-sm text-primary-bright border-primary-bright/30 font-semibold uppercase tracking-widest text-xs">
                    02
                  </Badge>
                </div>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">Career Guidance & Training</h2>
                <p className="text-foreground-muted text-lg max-w-lg">
                  Comprehensive career development programs to help you land your dream job, switch industries, or level up your skills.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerServices.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <Card className="rounded-sm shadow-none border-border hover-lift h-full card-shine bg-off-white">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 flex items-center justify-center bg-white border border-border-light mb-5">
                      <item.icon size={22} className="text-primary-bright" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-primary mb-2">{item.title}</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.3}>
            <div className="mt-10">
              <Button asChild size="lg" className="rounded-sm bg-primary-bright hover:bg-primary text-white uppercase tracking-wider text-sm font-semibold px-8">
                <Link href="/contact" className="group inline-flex items-center gap-3">
                  Start Your Career Journey
                  <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ EDU TECH ═══ */}
      <section id="edutech" className="py-24 bg-primary scroll-mt-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary-bright text-white">
                    <Monitor size={22} />
                  </div>
                  <Badge variant="outline" className="rounded-sm text-primary-soft border-primary-soft/30 font-semibold uppercase tracking-widest text-xs">
                    03
                  </Badge>
                </div>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-4">Edu Tech</h2>
                <p className="text-white/60 text-lg max-w-lg">
                  Technology-powered learning platforms and solutions to make education accessible, 
                  engaging, and results-driven for institutions and learners alike.
                </p>
              </div>
              <div className="relative h-64 overflow-hidden hidden lg:block">
                <Image
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop"
                  alt="Edu Tech solutions"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-primary/30" />
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Learning Management', desc: 'Custom LMS platforms with analytics, gamification, and AI-powered personalization.' },
              { title: 'Content Development', desc: 'Interactive course content, video production, and assessment design for modern learners.' },
              { title: 'Institution Partnerships', desc: 'White-label training programs for universities, colleges, and corporate training divisions.' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <Card className="rounded-sm shadow-none border-white/20 bg-transparent backdrop-blur-sm hover-lift h-full">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-heading font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STARTUP HUB ═══ */}
      <section id="startup" className="section-padding bg-off-white scroll-mt-20">
        <div className="container-wide">
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
              <div className="relative h-64 overflow-hidden hidden lg:block">
                <Image
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=500&fit=crop"
                  alt="Startup workspace"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary text-white">
                    <Rocket size={22} />
                  </div>
                  <Badge variant="outline" className="rounded-sm text-primary-bright border-primary-bright/30 font-semibold uppercase tracking-widest text-xs">
                    04
                  </Badge>
                </div>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">Startup Hub</h2>
                <p className="text-foreground-muted text-lg max-w-lg">
                  A complete ecosystem for founders — from first idea to first funding round. We provide the mentorship, resources, and connections you need.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startupServices.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <Card className="rounded-sm shadow-none border-border hover-lift h-full card-shine">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 flex items-center justify-center bg-primary-ghost mb-5">
                      <item.icon size={22} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-primary mb-2">{item.title}</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.3}>
            <div className="mt-10">
              <Button asChild size="lg" className="rounded-sm bg-primary hover:bg-primary-deep text-white uppercase tracking-wider text-sm font-semibold px-8">
                <Link href="/contact" className="group inline-flex items-center gap-3">
                  Launch Your Startup
                  <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ YOUNG COMPETE ═══ */}
      <section id="young-compete" className="section-padding bg-white scroll-mt-20">
        <div className="container-wide">
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary text-white">
                    <Trophy size={22} />
                  </div>
                  <Badge variant="outline" className="rounded-sm text-primary-bright border-primary-bright/30 font-semibold uppercase tracking-widest text-xs">
                    05
                  </Badge>
                </div>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">Young Compete</h2>
                <p className="text-foreground-muted text-lg max-w-lg">
                  Our flagship youth development program — designed to build competitive skills, 
                  leadership abilities, and professional confidence in the next generation of achievers.
                </p>
              </div>
              <div className="relative h-64 overflow-hidden hidden lg:block">
                <Image
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop"
                  alt="Young professionals competing"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Competition Prep', desc: 'Training for hackathons, case competitions, olympiads, and global challenges.' },
              { title: 'Leadership Development', desc: 'Programs designed to cultivate communication, teamwork, and strategic thinking.' },
              { title: 'Internship Connect', desc: 'Bridge the gap between education and industry with curated internship opportunities.' },
              { title: 'College Application Support', desc: 'Guidance for overseas admissions, scholarship applications, and portfolio building.' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <Card className="rounded-sm shadow-none border-border hover-lift h-full card-shine bg-off-white">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-heading font-bold text-primary mb-2">{item.title}</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.3}>
            <div className="mt-10">
              <Button asChild size="lg" className="rounded-sm bg-primary hover:bg-primary-deep text-white uppercase tracking-wider text-sm font-semibold px-8">
                <Link href="/contact" className="group inline-flex items-center gap-3">
                  Enroll Your Youth
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
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
