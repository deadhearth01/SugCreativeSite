'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { Quote, ArrowUpRight, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const testimonials = [
  {
    quote: 'Sug Creative completely transformed our business operations. Their strategic approach helped us scale 3x in just 8 months. The ROI on their consulting was phenomenal.',
    name: 'Priya Sharma',
    role: 'CEO, TechVentures India',
    category: 'Business',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'The career guidance program gave me the confidence and skills to land my dream job at a top-tier company. The mock interviews and resume coaching were game-changers.',
    name: 'Arjun Patel',
    role: 'Software Engineer, Google',
    category: 'Career',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'Their startup incubation program is world-class. From business model to first funding round, they were with us every step. We raised ₹2Cr in our seed round.',
    name: 'Sneha Reddy',
    role: 'Founder, GreenLeaf AI',
    category: 'Startup',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'The Young Compete program completely changed my daughter\'s trajectory. She went from being shy to winning national-level debate competitions and securing a scholarship abroad.',
    name: 'Ramesh Kumar',
    role: 'Parent',
    category: 'Education',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'We engaged Sug Creative for our digital transformation journey. Their team delivered beyond expectations — on time, on budget, and with exceptional quality.',
    name: 'Kavitha Menon',
    role: 'CTO, FinServ Corp',
    category: 'Business',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'After 5 years in a dead-end role, Sug Creative\'s career roadmapping helped me transition into product management. I got 3 offers within 2 months.',
    name: 'Aditya Singh',
    role: 'Product Manager, Razorpay',
    category: 'Career',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'The edu-tech solutions Sug Creative built for our university have transformed how we deliver courses. Student engagement is up 300% and completion rates have doubled.',
    name: 'Dr. Lakshmi Iyer',
    role: 'Dean, IIS University',
    category: 'Education',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'From a napkin idea to a funded startup in 6 months. Sug Creative\'s mentor network and structured program made what seemed impossible completely achievable.',
    name: 'Nikhil Jain',
    role: 'Co-founder, MediTrack',
    category: 'Startup',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'The brand strategy work Sug Creative did for us was transformative. Our brand recall improved by 400% and we saw a direct impact on customer acquisition.',
    name: 'Maria D\'Souza',
    role: 'Marketing Director, StyleBox',
    category: 'Business',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
  },
]

const impactNumbers = [
  { value: '3000+', label: 'Careers Transformed', desc: 'Across IT, finance, marketing, and more' },
  { value: '200+', label: 'Businesses Scaled', desc: 'From startups to enterprises' },
  { value: '50+', label: 'Startups Launched', desc: 'With over ₹50Cr in total funding raised' },
  { value: '98%', label: 'Satisfaction Rate', desc: 'Based on post-engagement surveys' },
  { value: '25+', label: 'Industries Served', desc: 'Healthcare, fintech, edtech, SaaS, retail...' },
  { value: '15+', label: 'Countries Reached', desc: 'Clients and students across the globe' },
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
        {/* Subtle sharp grid background */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="container-wide relative z-10 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white text-primary font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
              <div className="w-2 h-2 bg-green-500 rounded-none animate-pulse"></div>
              Client Stories
            </div>
            <h1 ref={heroRef} className="text-5xl sm:text-6xl md:text-7xl font-heading font-black text-primary-dark leading-[1.05] tracking-tight mb-8">
              Real Results, <br />
              <span className="text-[#82C93D]">Real Stories</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-dark/70 max-w-2xl leading-relaxed font-bold border-l-4 border-primary pl-5">
              Don&apos;t just take our word for it. Hear from the businesses we&apos;ve scaled, 
              the careers we&apos;ve transformed, and the startups we&apos;ve launched.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ IMPACT NUMBERS ═══ */}
      <section className="py-20 bg-primary-dark relative overflow-hidden border-b-2 border-black">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
            {impactNumbers.map((item, i) => (
              <AnimatedSection key={item.label} delay={i * 0.08}>
                <div className="text-center p-6 border-2 border-white/10 hover:border-white/30 transition-colors bg-white/5 backdrop-blur-sm shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                  <div className="text-4xl font-heading font-black text-white mb-2 tabular-nums">{item.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#82C93D] mb-2">{item.label}</div>
                  <div className="text-xs text-white/50 font-bold leading-tight">{item.desc}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS GRID ═══ */}
      <section className="py-24 bg-gray-50 border-b-2 border-black/10">
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {testimonials.map((item, i) => (
              <AnimatedSection key={item.name} delay={i * 0.08}>
                <Card className="rounded-none shadow-[8px_8px_0px_rgba(0,0,0,1)] border-2 border-primary-dark hover:-translate-y-1 transition-transform h-full flex flex-col bg-white">
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
                    <div className="flex items-center justify-between pt-6 border-t-2 border-primary-dark/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-none border-2 border-primary-dark overflow-hidden bg-primary-dark/5">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale" />
                        </div>
                        <div>
                          <p className="font-black text-primary-dark text-sm uppercase tracking-wider">{item.name}</p>
                          <p className="text-primary-dark/60 text-xs font-bold">{item.role}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="rounded-none bg-primary-dark text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                        {item.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
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
                <div className="inline-block bg-white text-primary-dark font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(255,255,255,0.2)] border-2 border-white/30">
                  Your Turn
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 leading-tight">
                  Your Success Story<br /><span className="text-[#82C93D]">Starts Here</span>
                </h2>
                <p className="text-white/50 text-lg font-bold">
                  Join 3000+ professionals, businesses, and startups who chose to grow with Sug Creative.
                </p>
              </div>
              <div className="shrink-0">
                <Link href="/contact" className="group relative inline-flex items-center justify-center bg-white text-primary-dark px-10 py-6 font-black uppercase tracking-widest text-sm hover:text-white border-2 border-white transition-all duration-300 rounded-none overflow-hidden hover:shadow-[10px_10px_0px_rgba(255,255,255,0.3)]">
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
