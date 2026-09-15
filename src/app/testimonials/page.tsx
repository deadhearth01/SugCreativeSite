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
  },
  {
    quote: 'We engaged Sug Creative for our digital transformation journey. Their team delivered beyond expectations — on time, on budget, and with exceptional quality.',
    name: 'Kavitha Menon',
    role: 'CTO, FinServ Corp',
    rating: 5,
  },
  {
    quote: 'The brand strategy work Sug Creative did for us was transformative. Our brand recall improved by 400% and we saw a direct impact on customer acquisition.',
    name: 'Maria D\'Souza',
    role: 'Marketing Director, StyleBox',
    rating: 5,
  },
  {
    quote: 'Their startup incubation program is world-class. From business model to first funding round, they were with us every step. We raised ₹2Cr in our seed round.',
    name: 'Sneha Reddy',
    role: 'Founder, GreenLeaf AI',
    rating: 5,
  },
  {
    quote: 'The edu-tech solutions Sug Creative built for our university have transformed how we deliver courses. Student engagement is up 300% and completion rates have doubled.',
    name: 'Dr. Lakshmi Iyer',
    role: 'Dean, IIS University',
    rating: 5,
  },
  {
    quote: 'From a napkin idea to a funded startup in 6 months. Sug Creative\'s mentor network and structured program made what seemed impossible completely achievable.',
    name: 'Nikhil Jain',
    role: 'Co-founder, MediTrack',
    rating: 5,
  },
]


// Success stories / Testimonials — real placements (names + companies from the
// grid-motion-hero-section photo set; cropped headshots in /public/testimonials).
const testimonials = [
  {
    name: 'Tanvi Bansal',
    company: 'WatchGuard',
    quote: "Sug Creative's training was exactly what I needed to sharpen my skills and land a job at WatchGuard. The learning materials were spot-on, and the trainers helped me prepare for every interview.",
    image: '/testimonials/tanvi-bansal.jpg',
  },
  {
    name: 'Pradeep',
    company: 'Accenture',
    quote: "Sug Creative's placement prep gave me the edge I needed to land a role at Accenture. The hands-on training helped me become job-ready and confident.",
    image: '/testimonials/pradeep.jpg',
  },
  {
    name: 'Bhavya',
    company: 'Verizon',
    quote: "Thanks to Sug Creative's guidance, I gained the skills and confidence to get placed at Verizon. The mentors were supportive every step of the way.",
    image: '/testimonials/bhavya.jpg',
  },
  {
    name: 'Haritha',
    company: 'Capgemini',
    quote: "The practical, hands-on approach at Sug Creative helped me build a strong profile and secure a role at Capgemini. I couldn't be happier with my new career.",
    image: '/testimonials/haritha.jpg',
  },
  {
    name: 'Shruthi',
    company: 'Coforge',
    quote: "Sug Creative's detailed curriculum and real-world projects gave me exactly what I needed to land my role at Coforge.",
    image: '/testimonials/shruthi.jpg',
  },
  {
    name: 'Kiran Teja',
    company: 'Mphasis',
    quote: "The training at Sug Creative was a game-changer. From fundamentals to interview prep, they prepared me thoroughly to join Mphasis.",
    image: '/testimonials/kiran-teja.jpg',
  },
];

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
  { value: '3000+', label: 'Careers Transformed', icon: TrendingUp },
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
                    <div className="pt-6 border-t-2 border-primary-dark/10">
                      <p className="font-black text-primary-dark text-sm uppercase tracking-wider">{item.name}</p>
                      <p className="text-primary-dark/60 text-xs font-bold">{item.role}</p>
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
              <div className="grid grid-cols-2 gap-6">
                {placementStats.map((stat) => (
                  <div key={stat.label} className="bg-white/5 border-2 border-white/10 rounded-3xl p-5 text-center backdrop-blur-sm">
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <AnimatedSection key={t.name} delay={i * 0.1}>
                    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_rgba(130,201,61,1)] p-6 h-full flex flex-col rounded-3xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-primary/20 rounded-[inherit] border-2 border-black flex items-center justify-center text-2xl font-black text-primary-dark overflow-hidden">
                          <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-black text-primary-dark">{t.name}</div>
                          <div className="text-sm font-bold text-primary">
                            <Building2 size={12} className="inline mr-1" />
                            {t.company}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Quote size={24} className="text-primary/30 mb-2" />
                        <p className="text-primary-dark/80 font-medium text-sm leading-relaxed">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                      </div>
                    </div>
                  </AnimatedSection>
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
