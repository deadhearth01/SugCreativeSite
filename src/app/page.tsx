'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, CheckCircle2, TrendingUp, GraduationCap, Award, Users, Clock, Play, Briefcase, Calendar, Star, Quote, Building2, Shield, Cpu, Globe, Server, Code2, Palette, Settings, Zap, Target, Rocket } from 'lucide-react'
import Grainient from '@/components/Grainient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'

gsap.registerPlugin(ScrollTrigger)

// Placement companies where SUGians got placed
const placementCompanies = [
  { name: 'Google', logo: '/CompanyLogos/google.svg' },
  { name: 'Bosch', logo: '/CompanyLogos/bosch.svg' },
  { name: 'Accenture', logo: '/CompanyLogos/accenture.svg' },
  { name: 'TCS', logo: '/CompanyLogos/tcs.svg' },
  { name: 'Capgemini', logo: '/CompanyLogos/capgemini.svg' },
  { name: 'Verizon', logo: '/CompanyLogos/verizon.svg' },
  { name: 'WatchGuard', logo: '/CompanyLogos/watchguard.svg' },
  { name: 'Coforge', logo: '/CompanyLogos/coforge.svg' },
]

// Collaborations
const collaborations = [
  { name: 'GMUN', logo: '/CompanyLogos/gmun.svg' },
  { name: 'IETE', logo: '/CompanyLogos/iete.svg' },
  { name: 'IEEE', logo: '/CompanyLogos/ieee.svg' },
  { name: 'Toastmasters', logo: '/CompanyLogos/toastmasters.svg' },
  { name: 'Teks Academy', logo: '/CompanyLogos/teks.svg' },
  { name: 'GITAM', logo: '/CompanyLogos/gitam.svg' },
  { name: 'GTech', logo: '/CompanyLogos/gtech.svg' },
]

// Success stories / Testimonials
const testimonials = [
  {
    name: 'Tanvi Bansal',
    company: 'WatchGuard',
    domain: 'IoT',
    quote: "Sug Creative's IoT domain training was exactly what I needed to enhance my skills and land a job at WatchGuard. The learning materials were spot-on, and the trainers helped me prepare for every interview.",
    image: '/testimonials/tanvi.jpg',
  },
  {
    name: 'Shyam',
    company: 'Bosch',
    domain: 'IoT',
    quote: "Thanks to Sug Creative's domain training, I gained the expertise in IoT that helped me get placed at Bosch. The course covered everything I needed to know, and the mentors were incredibly supportive.",
    image: '/testimonials/shyam.jpg',
  },
  {
    name: 'Anusha',
    company: 'Google',
    domain: 'Full Stack',
    quote: "I thank Sug Creative for the training I received. It gave me the practical skills and confidence needed to land a job at Google. The instructors were knowledgeable and always available.",
    image: '/testimonials/anusha.jpg',
  },
  {
    name: 'Pradeep',
    company: 'Accenture',
    domain: 'ML Engineer',
    quote: "Sug Creative's Placement Prep gave me the edge I needed to land a role as a Machine Learning Engineer at Accenture. The hands-on training helped me become job-ready and confident.",
    image: '/testimonials/pradeep.jpg',
  },
  {
    name: 'Chandrasekhar',
    company: 'TCS',
    domain: 'Web Design',
    quote: "The Web Designing Course provided by Sug Creative was a game-changer for my career. The detailed curriculum and hands-on experience helped me secure a role at TCS.",
    image: '/testimonials/chandrasekhar.jpg',
  },
  {
    name: 'Ruchita Patil',
    company: 'Capgemini',
    domain: 'UX Design',
    quote: "The practical approach to learning UX design helped me develop a strong portfolio and secure a role at Capgemini. I'm thrilled with my new career!",
    image: '/testimonials/ruchita.jpg',
  },
]

// Courses data - matching poster exactly with professional icons
const courses = [
  {
    title: 'DevOps Internship',
    desc: 'Master CI/CD pipelines, container orchestration with Docker & Kubernetes, cloud automation & DevSecOps practices.',
    href: '/courses/devops-internship',
    image: '/courses/devops-hero.jpg',
    price: 7999,
    originalPrice: 12999,
    savings: 5000,
    color: 'violet',
    tech: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'AWS / GCP', 'GitOps'],
    Icon: Server,
  },
  {
    title: 'Cyber Security Internship',
    desc: 'Deep-dive into ethical hacking, penetration testing, network security, VAPT & threat intelligence with live CTF labs.',
    href: '/courses/cyber-security-internship',
    image: '/courses/cybersecurity-hero.jpg',
    price: 4999,
    originalPrice: 9999,
    savings: 5000,
    color: 'blue',
    tech: ['Kali Linux', 'Metasploit', 'Wireshark', 'Burp Suite', 'SIEM', 'VAPT'],
    Icon: Shield,
  },
  {
    title: 'IoT & Embedded Systems',
    desc: 'Go from circuit to cloud — learn embedded C, RTOS, microcontroller programming & build complete smart IoT solutions.',
    href: '/courses/iot-embedded-internship',
    image: '/courses/iot-hero.jpg',
    price: 4999,
    originalPrice: 9999,
    savings: 5000,
    color: 'green',
    tech: ['Arduino', 'Raspberry Pi', 'Embedded C', 'RTOS', 'MQTT', 'AWS IoT'],
    Icon: Cpu,
  },
  {
    title: 'Full Stack Dev Internship',
    desc: 'Build production-ready web apps end-to-end — master React, Node.js, REST APIs, databases & cloud deployment.',
    href: '/courses/fullstack-dev-internship',
    image: '/courses/fullstack-hero.jpg',
    price: 5999,
    originalPrice: 10999,
    savings: 5000,
    color: 'gold',
    tech: ['React.js', 'Node.js', 'MongoDB', 'PostgreSQL', 'REST APIs', 'Vercel/AWS'],
    Icon: Globe,
  }
]

// Business services
const businessServices = [
  { Icon: Globe, title: 'Web Development', desc: 'Custom websites & web applications' },
  { Icon: Palette, title: 'UI/UX Design', desc: 'User-centered design solutions' },
  { Icon: Code2, title: 'Software Development', desc: 'Scalable enterprise software' },
  { Icon: Settings, title: 'IT Consulting', desc: 'Digital transformation strategy' },
]

const courseColors: Record<string, { bg: string; accent: string; shadow: string; gradient: string }> = {
  violet: { bg: 'bg-violet-500', accent: 'text-violet-500', shadow: 'shadow-[8px_8px_0px_rgba(139,92,246,1)]', gradient: 'from-violet-500 to-purple-600' },
  blue: { bg: 'bg-blue-500', accent: 'text-blue-500', shadow: 'shadow-[8px_8px_0px_rgba(59,130,246,1)]', gradient: 'from-blue-500 to-cyan-600' },
  green: { bg: 'bg-green-500', accent: 'text-green-500', shadow: 'shadow-[8px_8px_0px_rgba(34,197,94,1)]', gradient: 'from-green-500 to-emerald-600' },
  gold: { bg: 'bg-amber-500', accent: 'text-amber-500', shadow: 'shadow-[8px_8px_0px_rgba(245,158,11,1)]', gradient: 'from-amber-500 to-orange-600' },
}

export default function HomePage() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

    return () => { 
      ScrollTrigger.getAll().forEach(t => t.kill())
      tl.kill() 
    }
  }, [])

  return (
    <>
      <Navbar />

      {/* ═══ HERO — CLEAN & MARKETING FOCUSED ═══ */}
      <section className="relative min-h-[90vh] flex items-center bg-[#f2fafd] pt-32 pb-20 overflow-hidden border-b-2 border-black/10">
        <div className="absolute inset-0 opacity-[0.08]">
          <Grainient
            color1="#82C93D"
            color2="#35C8E0"
            color3="#1A9AB5"
            timeSpeed={0.1}
            warpStrength={0.5}
            warpFrequency={3}
            warpSpeed={0.8}
            warpAmplitude={90}
            rotationAmount={180}
            grainAmount={0.06}
            contrast={1.2}
            saturation={1.4}
            zoom={0.75}
          />
        </div>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(53,200,224,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(53,200,224,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="container-wide relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-[#82C93D] text-white font-black text-xs uppercase tracking-widest px-5 py-2.5 mb-8 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
              <Rocket size={16} />
              Trusted by 550+ Professionals at Top MNCs
            </div>
            
            <h1 ref={headlineRef} className="text-5xl sm:text-6xl md:text-7xl font-heading text-primary-dark leading-[1.08] tracking-tight mb-8">
              Launch Your <span className="text-primary">Tech Career</span><br />
              With Industry Experts
            </h1>
            
            <p ref={subRef} className="text-lg md:text-xl text-primary-dark/70 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
              3-month intensive internships with <strong className="text-primary-dark">real MNC mentors</strong>, hands-on projects, and <strong className="text-primary-dark">placement support</strong>. Join our community at Google, Bosch, Accenture & more.
            </p>
            
            <div ref={ctaRef} className="flex flex-wrap justify-center items-center gap-4 mb-12">
              <Button asChild size="lg" className="bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-none border-2 border-primary-dark px-10 h-16 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                <Link href="/courses" className="flex items-center gap-3">
                  Explore Courses <ArrowUpRight size={20} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white border-2 border-primary-dark text-primary-dark hover:bg-primary-dark hover:text-white font-black text-sm uppercase tracking-widest rounded-none px-8 h-16 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
                <Link href="/contact">Get Free Counselling</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 items-center">
              <div className="flex items-center gap-2 text-primary-dark/70">
                <div className="w-10 h-10 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <Clock size={18} className="text-primary" />
                </div>
                <span className="text-sm font-bold">3-Month Programs</span>
              </div>
              <div className="flex items-center gap-2 text-primary-dark/70">
                <div className="w-10 h-10 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <Award size={18} className="text-[#82C93D]" />
                </div>
                <span className="text-sm font-bold">2 Certifications</span>
              </div>
              <div className="flex items-center gap-2 text-primary-dark/70">
                <div className="w-10 h-10 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <Briefcase size={18} className="text-violet-500" />
                </div>
                <span className="text-sm font-bold">Placement Support</span>
              </div>
              <div className="flex items-center gap-2 text-primary-dark/70">
                <div className="w-10 h-10 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <TrendingUp size={18} className="text-amber-500" />
                </div>
                <span className="text-sm font-bold">98% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUSTED BY LOGOS ═══ */}
      <section className="py-10 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <div className="text-center text-xs font-bold uppercase tracking-widest text-primary-dark/50 mb-6">
            Our SUGians Work At
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center">
            {['Google', 'Bosch', 'Accenture', 'TCS', 'Capgemini', 'Verizon', 'WatchGuard'].map((company) => (
              <div key={company} className="text-primary-dark/40 text-sm md:text-base font-bold hover:text-primary-dark transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INTERNSHIP PROGRAMS ═══ */}
      <section className="py-24 md:py-32 bg-gray-50 border-b-2 border-black/10">
        <div className="container-wide">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block bg-[#82C93D] text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
              <GraduationCap size={14} className="inline mr-2" />
              Career Programs
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight mb-4">
              Industry-Focused Internships<br />With Placement Support
            </h2>
            <p className="text-primary-dark/70 text-lg font-bold">
              3-month intensive programs designed by MNC mentors. Get certified, build real projects, and launch your career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {courses.map((course, index) => {
              const colors = courseColors[course.color]
              const IconComponent = course.Icon
              return (
                <AnimatedSection key={course.title} delay={index * 0.1}>
                  <Link href={course.href} className={`group block relative h-[560px] border-2 border-primary-dark rounded-none overflow-hidden ${colors.shadow} transition-all duration-500 hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] bg-white focus:outline-none`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20`} />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    
                    {/* Price Tag with Savings */}
                    <div className="absolute top-4 right-4 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] p-3">
                      <div className="text-[10px] font-bold uppercase text-red-500 bg-red-50 px-2 py-0.5 mb-1 border border-red-200 flex items-center gap-1">
                        <Target size={10} /> Save ₹{course.savings.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 line-through">₹{course.originalPrice.toLocaleString()}</div>
                      <div className="text-xl font-black text-primary-dark">₹{course.price.toLocaleString()}</div>
                    </div>

                    {/* Icon & Duration Badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className={`w-14 h-14 ${colors.bg} border-2 border-black flex items-center justify-center text-white`}>
                        <IconComponent size={28} />
                      </div>
                      <div className="bg-white text-primary-dark font-black text-[10px] uppercase tracking-widest px-3 py-1.5 border-2 border-black text-center">
                        3 Months
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                      {/* Tech Stack - all 6 pills */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {course.tech.map((t) => (
                          <span key={t} className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 border border-white/30">
                            {t}
                          </span>
                        ))}
                      </div>
                      
                      <h3 className="text-xl font-heading font-black text-white mb-2 tracking-tight group-hover:text-[#82C93D] transition-colors duration-300 leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-white/80 font-bold text-sm leading-relaxed mb-4 line-clamp-2">
                        {course.desc}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#82C93D] font-bold text-sm group-hover:gap-4 transition-all">
                          View Details <ArrowUpRight size={16} />
                        </div>
                        <div className="text-[10px] text-white/60 font-bold flex items-center gap-1">
                          <Calendar size={10} />
                          Apr 20
                        </div>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white font-black text-sm uppercase tracking-widest rounded-none border-2 border-primary-dark px-10 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
              <Link href="/courses" className="flex items-center gap-3">
                View All Programs <ArrowUpRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ BUSINESS SOLUTIONS SECTION ═══ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                <Zap size={14} className="inline mr-2" />
                Business Solutions
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight mb-6">
                We Also Excel In<br /><span className="text-primary">Digital Transformation</span>
              </h2>
              <p className="text-primary-dark/70 text-lg font-medium leading-relaxed mb-8">
                Beyond education, we help businesses thrive with cutting-edge technology solutions. From web development to IT consulting, we've partnered with <strong className="text-primary-dark">200+ businesses</strong> across industries.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {businessServices.map((service) => (
                  <div key={service.title} className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-black/10 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <service.Icon size={20} />
                    </div>
                    <div>
                      <div className="font-black text-primary-dark text-sm">{service.title}</div>
                      <div className="text-xs text-primary-dark/60">{service.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-none border-2 border-primary-dark px-8 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                <Link href="/services" className="flex items-center gap-3">
                  Explore Services <ArrowUpRight size={18} />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-dark border-2 border-black p-6 shadow-[6px_6px_0px_rgba(130,201,61,1)]">
                  <div className="text-4xl font-black text-white mb-1">
                    <NumberTicker value={200} />+
                  </div>
                  <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Business Clients</div>
                </div>
                <div className="bg-[#82C93D] border-2 border-black p-6 shadow-[6px_6px_0px_rgba(26,154,181,1)]">
                  <div className="text-4xl font-black text-white mb-1">
                    <NumberTicker value={8} />+
                  </div>
                  <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Years Experience</div>
                </div>
                <div className="col-span-2 bg-gray-50 border-2 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/20 flex items-center justify-center text-primary">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <div className="font-black text-primary-dark">End-to-End Solutions</div>
                      <div className="text-sm text-primary-dark/60">From concept to deployment</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Startups', 'SMEs', 'Enterprises', 'NGOs'].map((type) => (
                      <span key={type} className="text-xs font-bold px-3 py-1 bg-white border border-black/10 text-primary-dark/70">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PLACEMENT SUCCESS STORIES ═══ */}
      <section className="py-24 md:py-32 bg-primary-dark border-b-2 border-black overflow-hidden relative">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="container-wide relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block bg-[#82C93D] text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">
              <Star size={14} className="inline mr-2" />
              Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight leading-tight mb-4">
              Hear From Our<br />Placed SUGians
            </h2>
            <p className="text-white/70 text-lg font-bold">
              Real stories from real students who launched their tech careers with us.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.1}>
                <div className="bg-white border-2 border-black shadow-[6px_6px_0px_rgba(130,201,61,1)] p-6 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary/20 rounded-none border-2 border-black flex items-center justify-center text-2xl font-black text-primary-dark">
                      {t.name.charAt(0)}
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
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-black/10">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1">
                      {t.domain}
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROGRAM HIGHLIGHTS ═══ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight">
              Everything You Need to<br />Launch Your Career
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Play size={32} />, title: 'Live Sessions', desc: 'Interactive classes with industry experts, not just recorded videos.' },
              { icon: <Users size={32} />, title: 'MNC Mentors', desc: 'Learn from professionals working at Google, Microsoft, Amazon & more.' },
              { icon: <Award size={32} />, title: '2 Certifications', desc: 'Get both course completion and internship certificates.' },
              { icon: <Briefcase size={32} />, title: 'Placement Support', desc: 'Resume reviews, mock interviews & job referrals included.' },
              { icon: <Clock size={32} />, title: '3-Month Intensive', desc: 'Focused learning with hands-on projects every week.' },
              { icon: <CheckCircle2 size={32} />, title: 'Real Projects', desc: 'Build production-grade applications for your portfolio.' },
              { icon: <TrendingUp size={32} />, title: '98% Success Rate', desc: 'Most of our students land jobs within 3 months of completion.' },
              { icon: <Calendar size={32} />, title: 'Flexible Batches', desc: 'Weekend and weekday batches available.' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.05}>
                <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all h-full">
                  <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mb-4 text-primary border-2 border-primary/20">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-black text-primary-dark mb-2">{item.title}</h3>
                  <p className="text-primary-dark/70 font-medium text-sm">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS SECTION ═══ */}
      <section className="py-20 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] border-y-2 border-black">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 3000, suffix: '+', label: 'Careers Transformed' },
              { value: 550, suffix: '+', label: 'SUGians Placed' },
              { value: 200, suffix: '+', label: 'Business Clients' },
              { value: 15, suffix: '+', label: 'Collaborations' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border-2 border-white/30 p-6">
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  <NumberTicker value={stat.value} />{stat.suffix}
                </div>
                <div className="text-white/80 text-sm font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container-wide text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-primary-dark tracking-tight leading-tight mb-6">
            Ready to Launch Your<br /><span className="text-primary">Tech Career?</span>
          </h2>
          <p className="text-primary-dark/70 text-lg md:text-xl font-bold max-w-2xl mx-auto mb-10">
            Join our next batch and become part of the 550+ SUGians working at top MNCs. Limited seats available.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-none border-2 border-primary-dark px-12 h-16 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
              <Link href="/courses" className="flex items-center gap-3">
                Explore Courses <ArrowUpRight size={20} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-2 border-primary-dark text-primary-dark hover:bg-primary-dark hover:text-white font-black text-sm uppercase tracking-widest rounded-none px-12 h-16 shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
              <Link href="/contact">Talk to Counsellor</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
