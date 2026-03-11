'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, Plus, CheckCircle2, TrendingUp } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import RotatingText from '@/components/RotatingText'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'

gsap.registerPlugin(ScrollTrigger)

const collaborations = [
  { name: 'GMUN', url: '/logos/gmun.png', fallback: 'GMUN' },
  { name: 'IETE', url: 'https://upload.wikimedia.org/wikipedia/en/2/23/IETE_logo.png', fallback: 'IETE' },
  { name: 'IEEE', url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/IEEE_logo.svg', fallback: 'IEEE' },
  { name: 'Toastmasters', url: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Toastmasters_International_logo.png', fallback: 'Toastmasters' },
  { name: 'Teks Academy', url: 'https://www.teksacademy.com/assets/images/logo.png', fallback: 'Teks Academy' },
  { name: 'Gitam', url: 'https://upload.wikimedia.org/wikipedia/en/e/e5/GITAM_University_logo.png', fallback: 'GITAM' },
  { name: 'GTech', url: '/logos/gtech.png', fallback: 'GTech' }
]

const services = [
  {
    title: 'Business Consulting',
    desc: 'Strategic insights to streamline operations, reduce bottlenecks, and maximize enterprise growth.',
    href: '/services#business',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1200&fit=crop',
  },
  {
    title: 'Career Guidance',
    desc: 'Professional training and mentorship designed to accelerate your individual journey to the top.',
    href: '/services#career',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=1200&fit=crop',
  },
  {
    title: 'Startup Hub',
    desc: 'From ideation to execution - everything you need to validate, fund, and scale your new venture.',
    href: '/services#startup',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=1200&fit=crop',
  },
  {
    title: 'Edu Tech',
    desc: 'Cutting-edge learning platforms and certified programs that keep you ahead of industry curves.',
    href: '/services#edutech',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=1200&fit=crop',
  }
]

export default function HomePage() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const tagsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  const SHIFT_TEXTS = ['Careers', 'Businesses', 'Startups', 'Students']
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % SHIFT_TEXTS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Hero Animations
    const tl = gsap.timeline({ delay: 0.5 })
    if (headlineRef.current) {
      tl.from(headlineRef.current, { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out' })
    }
    if (subRef.current) {
      tl.from(subRef.current, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    }
    if (ctaRef.current) {
      tl.from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    }
    
    // Float main hero stat cards
    if (statsRef.current) {
      gsap.fromTo(statsRef.current.children, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "back.out(1.5)", delay: 0.8 }
      )
    }

    // Scroll trigger for floating tags in the Challenges section
    if (tagsRef.current) {
      const tags = tagsRef.current.querySelectorAll('.floating-tag')
      gsap.fromTo(tags, 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.2, 
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: tagsRef.current,
            start: "top 80%",
          }
        }
      )

      // Continuous subtle floating animation
      tags.forEach((tag, i) => {
        gsap.to(tag, {
          y: "-=8",
          duration: 1.5 + (i * 0.2),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: i * 0.2
        })
      })
    }

    return () => { 
      ScrollTrigger.getAll().forEach(t => t.kill())
      tl.kill() 
    }
  }, [])

  return (
    <>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center bg-[#fdfbf9] pt-32 pb-16 overflow-hidden border-b-2 border-black/10">
        {/* Subtle sharp grid background */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="container-wide relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
            
            {/* Left Text */}
            <div className="lg:w-[45%] relative z-20">
              <div className="inline-flex items-center gap-3 bg-white text-primary font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                <div className="w-2 h-2 bg-green-500 rounded-none animate-pulse"></div>
                Sug Creative Solutions
              </div>
              
              <h1 ref={headlineRef} className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem] font-heading text-primary-dark leading-[1.05] tracking-tight mb-8">
                Transforming<br />
                <div className="flex items-center text-primary mt-2 mb-2">
                  <RotatingText
                    texts={SHIFT_TEXTS}
                    mainClassName="px-2 sm:px-2 md:px-3 bg-[#4DA8DB] text-white overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg inline-block"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
                </div>
                Redefining Success
              </h1>
              
              <div ref={subRef} className="text-lg md:text-xl text-primary-dark/70 max-w-xl leading-relaxed mb-10 font-bold border-l-4 border-primary pl-5">
                We focus on delivering exceptional value through sustainable strategies that elevate your business, career, and startup ideas.
              </div>
              
              <div ref={ctaRef} className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-none border-2 border-primary-dark px-10 h-16 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                  <Link href="/contact" className="flex items-center gap-3">
                    Book Consultation <ArrowUpRight size={20} />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Image + Stats */}
            <div className="lg:w-[55%] relative w-full aspect-[4/3] lg:aspect-[4/3] mt-10 lg:mt-0 xl:max-w-[850px] ml-auto">
              
              {/* Main Image Container */}
              <div className="absolute inset-0 border-2 border-primary-dark shadow-[16px_16px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden group bg-primary-dark">
                <Image 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&h=1200&fit=crop" 
                  alt="Confident Business Professional" 
                  fill 
                  className="object-cover object-top grayscale hover:grayscale-0 transition-all duration-700"
                  priority
                />
                {/* Overlay tint */}
                <div className="absolute inset-0 bg-primary-dark/20 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" />
                
                {/* Decorative scanner line */}
                <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-white/20 group-hover:bg-white/40 transition-colors pointer-events-none" />
              </div>

              {/* Floating Stat Boxes */}
              <div ref={statsRef} className="absolute inset-x-[-1rem] md:inset-x-[-2rem] inset-y-8 pointer-events-none">
                
                {/* Overlapping Stat Box 1 (Bottom Left) */}
                <div className="absolute bottom-4 -left-2 md:-left-8 bg-white/95 backdrop-blur-xl border-2 border-primary-dark p-6 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,1)] z-30 pointer-events-auto max-w-[240px]">
                  <div className="flex items-center gap-2 mb-3 text-primary-dark uppercase text-[10px] font-black tracking-widest border-b-2 border-black/10 pb-2">
                    <TrendingUp size={14} className="text-[#4DA8DB]" />
                    Performance
                  </div>
                  <div className="text-4xl font-heading font-black text-primary-dark mb-1 tabular-nums">
                    <NumberTicker value={3000} />+
                  </div>
                  <div className="text-xs font-bold text-primary-dark/60 uppercase tracking-widest leading-tight">
                    Careers & Businesses Scaled successfully
                  </div>
                </div>

                {/* Overlapping Stat Box 2 (Top Right) */}
                <div className="absolute top-10 right-0 md:-right-8 bg-primary-dark text-white border-2 border-primary-dark p-4 rounded-none shadow-[8px_8px_0px_rgba(77,168,219,1)] z-30 pointer-events-auto flex items-center gap-4">
                  <div className="w-12 h-12 bg-white flex items-center justify-center rounded-none shadow-[2px_2px_0px_rgba(77,168,219,1)]">
                    <CheckCircle2 size={24} className="text-primary-dark" />
                  </div>
                  <div>
                    <div className="text-2xl font-black font-heading leading-none mb-1 text-[#4DA8DB]">98%</div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-white/70">Success Rate</div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══ COLLABORATIONS LOGO BAND ═══ */}
      <section className="py-20 bg-primary-dark border-b-2 border-black overflow-hidden relative">
        <div className="container-wide mb-12 text-center relative z-10">
          <div className="inline-block bg-white text-primary-dark font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(77,168,219,1)] border-2 border-white">
            Our Collaborations
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-black text-white tracking-tight leading-tight">
            Trusted by Leaders <br className="hidden md:block" /> Across Industries
          </h2>
        </div>
        
        {/* Infinite Marquee Native CSS implementation */}
        <div className="relative flex overflow-x-hidden group z-10 pb-8">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 35s linear infinite;
            }
            .group:hover .animate-marquee {
              animation-play-state: paused;
            }
          `}} />
          
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-primary-dark to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary-dark to-transparent z-20 pointer-events-none" />

          <div className="animate-marquee flex whitespace-nowrap w-max items-center bg-white/5 border-y-2 border-white/10 py-6 backdrop-blur-sm">
            {/* First Set */}
            <div className="flex items-center shrink-0 w-max">
              {collaborations.map((collab, i) => (
                <div key={`${collab.name}-1-${i}`} className="flex items-center">
                  <div className="px-12 md:px-20 flex-shrink-0 flex items-center justify-center grayscale brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={collab.url} 
                      alt={collab.name} 
                      className="w-auto h-12 md:h-16 object-contain" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden font-heading font-black text-2xl tracking-widest uppercase">
                      {collab.fallback}
                    </div>
                  </div>
                  {/* Vertical Divider */}
                  <div className="w-[2px] h-16 bg-white/10"></div>
                </div>
              ))}
            </div>
            {/* Duplicate Set for Seamless Loop */}
            <div className="flex items-center shrink-0 w-max">
              {collaborations.map((collab, i) => (
                <div key={`${collab.name}-2-${i}`} className="flex items-center">
                  <div className="px-12 md:px-20 flex-shrink-0 flex items-center justify-center grayscale brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={collab.url} 
                      alt={collab.name} 
                      className="w-auto h-12 md:h-16 object-contain" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden font-heading font-black text-2xl tracking-widest uppercase">
                      {collab.fallback}
                    </div>
                  </div>
                  {/* Vertical Divider */}
                  {i !== collaborations.length - 1 && <div className="w-[2px] h-16 bg-white/10"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ EXPERT SERVICES ═══ */}
      <section className="py-24 md:py-32 bg-gray-50 border-b-2 border-black/10">
        <div className="container-wide">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
              Our Services
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight">
              Our Expert Services to<br />Drive Growth
            </h2>
          </div>

          {/* Grid of Tall Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {services.map((srv, index) => (
              <AnimatedSection key={srv.title} delay={index * 0.1}>
                <Link href={srv.href} className="group block relative h-[480px] md:h-[500px] border-2 border-primary-dark rounded-none overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[16px_16px_0px_rgba(0,0,0,1)] bg-white focus:outline-none">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image src={srv.image} alt={srv.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                  
                  {/* Gradient Overlay for Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/80 to-primary-dark/20 opacity-90 group-hover:opacity-100 transition-opacity mix-blend-multiply" />
                  
                  {/* Top Right Button */}
                  <div className="absolute top-5 right-5 w-12 h-12 bg-white/10 backdrop-blur-md border-2 border-white flex items-center justify-center rounded-none text-white group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end border-t-4 border-transparent group-hover:border-[#4DA8DB] transition-colors duration-500">
                    <h3 className="text-2xl font-heading font-black text-white mb-4 tracking-tight group-hover:text-[#4DA8DB] transition-colors duration-300 leading-tight">
                      {srv.title}
                    </h3>
                    <p className="text-white/80 font-bold text-[14px] leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OUR APPROACH ═══ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10 relative">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative">
            
            {/* Left: Sticky Header */}
            <div className="lg:w-5/12 lg:sticky lg:top-32 h-fit mb-4">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                Our Approach
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-heading font-black text-primary-dark tracking-tight leading-[1.05] mb-10">
                A Streamlined<br />Process for<br />Lasting Results
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white font-black text-sm uppercase tracking-widest rounded-none border-2 border-primary-dark px-8 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                  <Link href="/contact">Let's Talk</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-2 border-primary-dark text-primary-dark hover:bg-primary-dark hover:text-white font-black text-sm uppercase tracking-widest rounded-none px-8 h-14 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Right: Scrolling Steps */}
            <div className="lg:w-7/12 flex flex-col gap-8">
              {[
                { num: '1', title: 'Discovery & Strategy', desc: 'We start by understanding your goals and creating a clear, actionable plan tailored to your specific needs.' },
                { num: '2', title: 'Design & Planning', desc: 'We develop a detailed roadmap to ensure smooth, efficient execution at every stage, avoiding common pitfalls.' },
                { num: '3', title: 'Implementation', desc: 'Our expert team brings the plan to life, focusing strictly on precision, quality, and alignment with your vision.' },
                { num: '4', title: 'Optimization & Growth', desc: 'We track outcomes, refine strategies, and support ongoing growth to guarantee lasting impact and maximum ROI.' }
              ].map((step, i) => (
                <div key={step.num} className="bg-white border-2 border-primary-dark p-8 md:p-10 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-none -z-0 transition-transform duration-700 group-hover:scale-[2.5]" />
                  
                  <div className="w-14 h-14 flex-shrink-0 bg-primary-dark text-white font-black text-2xl flex items-center justify-center rounded-none shadow-[4px_4px_0px_rgba(77,168,219,1)] border-2 border-primary-dark relative z-10 group-hover:bg-primary transition-colors">
                    {step.num}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-heading font-black text-primary-dark mb-4">{step.title}</h3>
                    <p className="text-primary-dark/80 font-bold text-[16px] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══ CHALLENGES AND BARRIERS ═══ */}
      <section className="py-24 md:py-32 bg-[#fdfaf6] overflow-hidden">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Text Left */}
            <div className="lg:w-1/2 z-10 relative">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                Facing Challenges
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-heading font-black text-primary-dark leading-[1.05] tracking-tight mb-8">
                Overcoming<br />These Key Barriers<br />Starts Here Today
              </h2>
              <p className="text-primary-dark/70 text-lg md:text-xl font-bold leading-relaxed max-w-lg mb-10">
                Don't let inefficiency block your success. We identify critical pain points and implement targeted strategies to propel you forward.
              </p>
              <Button asChild size="lg" className="bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-none border-2 border-primary-dark px-10 h-16 shadow-[4px_4px_0px_rgba(77,168,219,1)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(77,168,219,1)]">
                <Link href="/services">Discover Solutions</Link>
              </Button>
            </div>

            {/* Image & Floating Tags Right */}
            <div className="lg:w-1/2 relative w-full aspect-square max-w-lg mx-auto" ref={tagsRef}>
              <div className="absolute inset-0 border-2 border-primary-dark shadow-[16px_16px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden group bg-white">
                <Image 
                  src="https://images.unsplash.com/photo-1573167507017-6c0e536551b6?w=800&h=800&fit=crop" 
                  alt="Professional overcoming challenges" 
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary-dark/10 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-500" />
              </div>

              {/* Floating Tags (Boxy) */}
              <div className="floating-tag absolute -right-6 md:-right-16 top-[20%] bg-primary text-white border-2 border-primary-dark font-black text-xs md:text-sm uppercase tracking-widest px-6 py-4 rounded-none shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-[-6deg] z-20 whitespace-nowrap">
                Lost Opportunities
              </div>
              <div className="floating-tag absolute -left-6 md:-left-12 top-[45%] bg-[#4DA8DB] text-primary-dark border-2 border-primary-dark font-black text-xs md:text-sm uppercase tracking-widest px-6 py-4 rounded-none shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-[4deg] z-20 whitespace-nowrap">
                Lack of Expertise
              </div>
              <div className="floating-tag absolute -right-2 md:-right-8 bottom-[20%] bg-white text-primary-dark border-2 border-primary-dark font-black text-xs md:text-sm uppercase tracking-widest px-6 py-4 rounded-none shadow-[6px_6px_0px_rgba(77,168,219,1)] rotate-[-3deg] z-20 whitespace-nowrap">
                Limited Success
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
