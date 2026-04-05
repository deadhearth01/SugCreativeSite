'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'
import { Quote, ArrowUpRight, Star, Building2, GraduationCap, Briefcase, Users, TrendingUp, Award } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { DomeGallery } from '@/components/DomeGallery'
import { LogoLoop } from '@/components/LogoLoop'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Company logos for the logo loop
const companyLogos = [
  { src: '/companyPlacementLogo/google.png', alt: 'Google' },
  { src: '/companyPlacementLogo/bosch.png', alt: 'Bosch' },
  { src: '/companyPlacementLogo/accenture.png', alt: 'Accenture' },
  { src: '/companyPlacementLogo/tcs.png', alt: 'TCS' },
  { src: '/companyPlacementLogo/capgemini.png', alt: 'Capgemini' },
  { src: '/companyPlacementLogo/verizon.png', alt: 'Verizon' },
  { src: '/companyPlacementLogo/watchGuard.png', alt: 'WatchGuard' },
  { src: '/companyPlacementLogo/coforge.png', alt: 'Coforge' },
  { src: '/companyPlacementLogo/icic.png', alt: 'ICICI' },
  { src: '/companyPlacementLogo/muSigma.png', alt: 'Mu Sigma' },
  { src: '/companyPlacementLogo/vi.png', alt: 'Vi' },
]

// Business Solutions Testimonials
const businessTestimonials = [
  {
    quote: 'Sug Creative completely transformed our business operations. Their strategic approach helped us scale 3x in just 8 months. The ROI on their consulting was phenomenal.',
    name: 'Priya Sharma',
    role: 'CEO, TechVentures India',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'We engaged Sug Creative for our digital transformation journey. Their team delivered beyond expectations — on time, on budget, and with exceptional quality.',
    name: 'Kavitha Menon',
    role: 'CTO, FinServ Corp',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'The brand strategy work Sug Creative did for us was transformative. Our brand recall improved by 400% and we saw a direct impact on customer acquisition.',
    name: 'Maria D\'Souza',
    role: 'Marketing Director, StyleBox',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'Their startup incubation program is world-class. From business model to first funding round, they were with us every step. We raised ₹2Cr in our seed round.',
    name: 'Sneha Reddy',
    role: 'Founder, GreenLeaf AI',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'The edu-tech solutions Sug Creative built for our university have transformed how we deliver courses. Student engagement is up 300% and completion rates have doubled.',
    name: 'Dr. Lakshmi Iyer',
    role: 'Dean, IIS University',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'From a napkin idea to a funded startup in 6 months. Sug Creative\'s mentor network and structured program made what seemed impossible completely achievable.',
    name: 'Nikhil Jain',
    role: 'Co-founder, MediTrack',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
  },
]

// Featured Placements (shown as cards)
const featuredPlacements = [
  { name: 'Arjun Patel', role: 'Software Engineer', company: 'Google', image: '/placements/placement_1.jpg' },
  { name: 'Deepika Rao', role: 'Data Analyst', company: 'Bosch', image: '/placements/placement_2.jpg' },
  { name: 'Vikram Singh', role: 'Cloud Architect', company: 'Accenture', image: '/placements/placement_3.jpg' },
  { name: 'Priya Nair', role: 'Product Manager', company: 'Verizon', image: '/placements/placement_4.jpg' },
  { name: 'Rahul Sharma', role: 'DevOps Engineer', company: 'TCS', image: '/placements/placement_5.jpg' },
]

// All 50 placement images
const placementImages = Array.from({ length: 50 }, (_, i) => ({
  src: `/placements/placement_${i + 1}.jpg`,
  alt: `SUG member placed at top company`
}))

const businessStats = [
  { value: '200+', label: 'Businesses Scaled', icon: Building2 },
  { value: '50+', label: 'Startups Launched', icon: TrendingUp },
  { value: '₹50Cr+', label: 'Funding Raised', icon: Award },
]

const placementStats = [
  { value: '500+', label: 'Members Placed', icon: Users },
  { value: '150+', label: 'Partner Companies', icon: Briefcase },
  { value: '95%', label: 'Placement Rate', icon: GraduationCap },
]

export default function TestimonialsPage() {
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
      <section className="relative min-h-[60vh] flex flex-col justify-center pt-32 pb-20 bg-[#fdfbf9] border-b-2 border-black/10 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="container-wide relative z-10 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white text-primary font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Success Stories
            </div>
            <h1 ref={heroRef} className="text-5xl sm:text-6xl md:text-7xl font-heading font-black text-primary-dark leading-[1.05] tracking-tight mb-8">
              Real Results, <br />
              <span className="text-[#82C93D]">Real Stories</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-dark/70 max-w-2xl leading-relaxed font-bold border-l-4 border-primary pl-5">
              From scaling businesses to launching careers — discover how SUG Creative 
              has transformed lives and organizations across India.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 1: BUSINESS SOLUTIONS ═══ */}
      <section className="py-24 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          {/* Section Header */}
          <AnimatedSection>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-primary-dark text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl">
                  <Building2 size={14} />
                  Business Solutions
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark leading-tight mb-4">
                  Businesses We&apos;ve<br /><span className="text-primary">Transformed</span>
                </h2>
                <p className="text-primary-dark/60 text-lg font-medium">
                  From digital transformation to startup incubation, see how we&apos;ve helped businesses 
                  scale, innovate, and lead their industries.
                </p>
              </div>
              
              {/* Business Stats */}
              <div className="flex flex-wrap gap-6">
                {businessStats.map((stat) => (
                  <div key={stat.label} className="bg-gray-50 border-2 border-primary-dark/10 rounded-3xl p-5 text-center min-w-[140px]">
                    <stat.icon size={24} className="text-primary mx-auto mb-2" />
                    <div className="text-2xl font-black text-primary-dark">{stat.value}</div>
                    <div className="text-xs font-bold text-primary-dark/50 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Business Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {businessTestimonials.map((item, i) => (
              <AnimatedSection key={item.name} delay={i * 0.08}>
                <Card className="rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] border-2 border-primary-dark hover:-translate-y-1 transition-transform h-full flex flex-col bg-white">
                  <CardContent className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-1 mb-6">
                      {Array.from({ length: item.rating }).map((_, j) => (
                        <Star key={j} size={16} className="fill-[#82C93D] text-[#82C93D]" />
                      ))}
                    </div>
                    <Quote size={32} className="text-primary-dark/10 mb-4" />
                    <p className="text-primary-dark font-bold leading-relaxed mb-8 flex-1 text-base">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4 pt-6 border-t-2 border-primary-dark/10">
                      <div className="w-12 h-12 rounded-full border-2 border-primary-dark overflow-hidden bg-primary-dark/5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-primary-dark text-sm uppercase tracking-wider">{item.name}</p>
                        <p className="text-primary-dark/60 text-xs font-bold">{item.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: PLACEMENTS ═══ */}
      <section className="py-24 bg-primary-dark relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        
        <div className="container-wide relative z-10">
          {/* Section Header */}
          <AnimatedSection>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-[#82C93D] text-primary-dark font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl">
                  <GraduationCap size={14} />
                  Career Success
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white leading-tight mb-4">
                  Careers We&apos;ve<br /><span className="text-[#82C93D]">Launched</span>
                </h2>
                <p className="text-white/60 text-lg font-medium">
                  Our members are now working at Google, Bosch, Accenture, TCS, Verizon, and 150+ other 
                  top companies. Here are some of their success stories.
                </p>
              </div>
              
              {/* Placement Stats */}
              <div className="flex flex-wrap gap-6">
                {placementStats.map((stat) => (
                  <div key={stat.label} className="bg-white/5 border-2 border-white/10 rounded-3xl p-5 text-center min-w-[140px] backdrop-blur-sm">
                    <stat.icon size={24} className="text-[#82C93D] mx-auto mb-2" />
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-xs font-bold text-white/50 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Featured Placements Cards */}
          <AnimatedSection delay={0.2}>
            <div className="mb-16">
              <h3 className="text-xl font-black text-white/80 uppercase tracking-widest mb-8">Featured Placements</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {featuredPlacements.map((person, i) => (
                  <div 
                    key={person.name} 
                    className="group bg-white/5 border-2 border-white/10 rounded-3xl p-4 hover:bg-white/10 transition-all hover:-translate-y-1"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 border-2 border-white/20">
                      <img 
                        src={person.image} 
                        alt={person.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <p className="font-black text-white text-sm">{person.name}</p>
                    <p className="text-white/50 text-xs font-bold">{person.role}</p>
                    <Badge className="mt-2 bg-[#82C93D] text-primary-dark text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg">
                      {person.company}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Dome Gallery Section - Edge to Edge */}
        <div className="mt-16">
          <div className="container-wide mb-8">
            <AnimatedSection delay={0.3}>
              <div className="text-center">
                <h3 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
                  500+ SUG Members Placed
                </h3>
                <p className="text-white/50 font-bold max-w-xl mx-auto">
                  Drag to explore our placement gallery. Click any photo to enlarge.
                </p>
              </div>
            </AnimatedSection>
          </div>
          
          {/* Edge-to-edge Dome Gallery Container - spans full viewport width */}
          <div className="relative w-screen left-1/2 -translate-x-1/2 h-[500px] md:h-[600px] lg:h-[700px]">
            <DomeGallery
              images={placementImages}
              fit={0.9}
              minRadius={500}
              maxVerticalRotationDeg={8}
              segments={32}
              dragDampening={1.8}
              grayscale={false}
              overlayBlurColor="#1A9AB5"
              imageBorderRadius="12px"
              openedImageBorderRadius="20px"
              openedImageWidth="280px"
              openedImageHeight="360px"
            />
          </div>
        </div>
      </section>

      {/* ═══ PARTNER COMPANIES - Logo Scroll ═══ */}
      <section className="py-16 bg-gray-50 border-b-2 border-black/10 overflow-hidden">
        <div className="container-wide mb-8">
          <AnimatedSection>
            <p className="text-center text-xs font-black uppercase tracking-widest text-primary-dark/40">
              Our members work at
            </p>
          </AnimatedSection>
        </div>
        
        {/* Edge-to-edge Logo Loop */}
        <div className="w-screen relative left-1/2 -translate-x-1/2">
          <LogoLoop
            logos={companyLogos}
            speed={80}
            direction="left"
            logoHeight={50}
            gap={80}
            pauseOnHover
            scaleOnHover
            fadeOut
            fadeOutColor="#f9fafb"
            ariaLabel="Companies where our members work"
          />
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 md:py-32 bg-[#fdfbf9] relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 bg-primary-dark rounded-3xl p-10 md:p-16 border-2 border-primary-dark shadow-[12px_12px_0px_rgba(0,0,0,0.3)]">
              <div className="max-w-2xl">
                <div className="inline-block bg-[#82C93D] text-primary-dark font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-xl">
                  Your Turn
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 leading-tight">
                  Your Success Story<br /><span className="text-[#82C93D]">Starts Here</span>
                </h2>
                <p className="text-white/50 text-lg font-bold">
                  Join 3000+ professionals, businesses, and startups who chose to grow with SUG Creative.
                </p>
              </div>
              <div className="shrink-0">
                <Link href="/contact" className="group relative inline-flex items-center justify-center bg-white text-primary-dark px-10 py-6 font-black uppercase tracking-widest text-sm hover:text-white border-2 border-white transition-all duration-300 rounded-3xl overflow-hidden hover:shadow-[10px_10px_0px_rgba(255,255,255,0.3)]">
                  <span className="relative z-10 flex items-center gap-3">
                    Start Your Journey
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
