'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mail, Phone, MapPin, Send, ArrowUpRight, CheckCircle2, Clock, MessageSquare } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Button } from '@/components/ui/button'

gsap.registerPlugin(ScrollTrigger)

const services = [
  { value: '', label: 'Select a service' },
  { value: 'business', label: 'Business Solutions' },
  { value: 'career', label: 'Career Guidance' },
  { value: 'startup', label: 'Startup Hub' },
  { value: 'edutech', label: 'Edu Tech' },
  { value: 'young-compete', label: 'Young Compete' },
  { value: 'other', label: 'Other' },
]

const contactInfo = [
  { icon: Mail, label: 'Email Us', value: 'hello@sugcreative.com', href: 'mailto:hello@sugcreative.com', color: 'bg-primary-dark', accent: '#82C93D' },
  { icon: Phone, label: 'Call Us', value: '+91 98765 43210', href: 'tel:+919876543210', color: 'bg-[#82C93D]', accent: '#1A9AB5' },
  { icon: MapPin, label: 'Visit Us', value: 'Chennai, India', href: '#', color: 'bg-white border-2 border-primary-dark', accent: '#1A9AB5' },
  { icon: Clock, label: 'Office Hours', value: 'Mon–Fri: 9AM–7PM', href: '#', color: 'bg-primary-dark/10 border-2 border-primary-dark', accent: '#1A9AB5' },
]

const faqItems = [
  { q: 'How quickly do you respond?', a: 'We respond to all inquiries within 24 hours on business days.' },
  { q: 'Do you offer free consultations?', a: 'Yes — your first discovery call is always free and commitment-free.' },
  { q: 'What industries do you serve?', a: 'We work across 25+ industries including tech, finance, healthcare, retail, and education.' },
]

export default function ContactPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', subject: '', message: '', service: '' })
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState('')

  useEffect(() => {
    if (heroRef.current) {
      gsap.set(heroRef.current.querySelectorAll('.hero-animate'), { y: 50, opacity: 0 })
      gsap.to(heroRef.current.querySelectorAll('.hero-animate'), {
        y: 0, opacity: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.4,
      })
    }
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const inputClass = (field: string) =>
    `w-full px-5 py-4 border-2 rounded-none text-sm font-bold transition-all outline-none bg-white ${
      focused === field
        ? 'border-primary-dark shadow-[4px_4px_0px_rgba(0,0,0,1)]'
        : 'border-primary-dark/20 hover:border-primary-dark/50'
    }`

  return (
    <>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 bg-[#fdfbf9] border-b-2 border-black/10 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="container-wide relative z-10" ref={heroRef}>
          <div className="flex flex-col lg:flex-row items-end justify-between gap-10">
            <div className="max-w-3xl">
              <div className="hero-animate inline-flex items-center gap-3 bg-white text-primary font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                <div className="w-2 h-2 bg-green-500 rounded-none animate-pulse" />
                Contact Us
              </div>
              <h1 className="hero-animate text-5xl sm:text-6xl md:text-7xl font-heading font-black text-primary-dark leading-[1.05] tracking-tight mb-6">
                Let&apos;s Start a<br />
                <span className="text-[#82C93D]">Conversation</span>
              </h1>
              <p className="hero-animate text-lg md:text-xl text-primary-dark/70 font-bold leading-relaxed border-l-4 border-primary pl-5 max-w-2xl">
                Have a question, project, or idea? We&apos;d love to hear from you.
                Reach out and let&apos;s explore how we can work together.
              </p>
            </div>
            <div className="hero-animate shrink-0 hidden lg:block">
              <div className="bg-primary-dark text-white border-2 border-primary-dark p-6 rounded-none shadow-[8px_8px_0px_rgba(130,201,61,1)]">
                <MessageSquare size={32} className="text-[#82C93D] mb-3" />
                <div className="text-3xl font-heading font-black text-white mb-1">24h</div>
                <div className="text-xs font-black uppercase tracking-widest text-white/60">Average Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT INFO CARDS ═══ */}
      <section className="py-16 bg-primary-dark border-b-2 border-black relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, i) => (
              <AnimatedSection key={info.label} delay={i * 0.08}>
                <a
                  href={info.href}
                  className="group flex flex-col gap-4 p-6 border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,0.5)]"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-white/10 border border-white/20 group-hover:bg-[#82C93D] group-hover:border-[#82C93D] transition-colors">
                    <info.icon size={20} className="text-[#82C93D] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{info.label}</div>
                    <div className="text-sm font-black text-white group-hover:text-[#82C93D] transition-colors">{info.value}</div>
                  </div>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTACT CONTENT ═══ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Left: Info + FAQ */}
            <div className="lg:col-span-2">
              <AnimatedSection direction="left">
                <div className="mb-12">
                  <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                    Why Choose Us
                  </div>
                  <div className="space-y-5">
                    {[
                      'Free 30-minute discovery call, no commitment',
                      'Dedicated account manager from day one',
                      'Results guaranteed or we keep working',
                      'Transparent pricing with no hidden fees',
                      '98% client satisfaction rate since 2015',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 group">
                        <div className="w-6 h-6 bg-primary-dark border-2 border-primary-dark flex items-center justify-center shrink-0 mt-0.5 shadow-[2px_2px_0px_rgba(130,201,61,0.5)]">
                          <CheckCircle2 size={12} className="text-[#82C93D]" />
                        </div>
                        <span className="text-primary-dark font-bold text-sm leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ */}
                <div>
                  <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                    Quick Answers
                  </div>
                  <div className="space-y-4">
                    {faqItems.map((faq, i) => (
                      <div key={i} className="border-2 border-primary-dark p-5 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="font-black text-primary-dark text-sm mb-2">{faq.q}</div>
                        <div className="text-primary-dark/60 text-sm font-bold leading-relaxed">{faq.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <AnimatedSection direction="right" delay={0.15}>
                <div className="border-2 border-primary-dark rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)]">
                  {/* Form header */}
                  <div className="bg-primary-dark text-white px-8 py-6 border-b-2 border-primary-dark">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#82C93D] mb-1">Free Consultation</div>
                        <h2 className="text-xl font-heading font-black text-white">Send Us a Message</h2>
                      </div>
                      <div className="w-12 h-12 bg-[#82C93D]/20 border border-[#82C93D]/40 flex items-center justify-center">
                        <Send size={20} className="text-[#82C93D]" />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-10">
                    {submitted ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto flex items-center justify-center bg-primary-dark border-2 border-primary-dark mb-6 shadow-[6px_6px_0px_rgba(130,201,61,1)]">
                          <CheckCircle2 size={36} className="text-[#82C93D]" />
                        </div>
                        <h3 className="text-2xl font-heading font-black text-primary-dark mb-4">Message Sent!</h3>
                        <p className="text-primary-dark/60 font-bold max-w-sm mx-auto leading-relaxed">
                          Thank you for reaching out. Our team will get back to you within 24 hours with a personalized response.
                        </p>
                        <button
                          onClick={() => setSubmitted(false)}
                          className="mt-8 bg-primary-dark text-white font-black text-xs uppercase tracking-widest px-8 py-4 border-2 border-primary-dark rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
                        >
                          Send Another Message
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-primary-dark/60 mb-2">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={formState.name}
                              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                              onFocus={() => setFocused('name')}
                              onBlur={() => setFocused('')}
                              className={inputClass('name')}
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-primary-dark/60 mb-2">Email *</label>
                            <input
                              type="email"
                              required
                              value={formState.email}
                              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                              onFocus={() => setFocused('email')}
                              onBlur={() => setFocused('')}
                              className={inputClass('email')}
                              placeholder="you@example.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-primary-dark/60 mb-2">Phone</label>
                            <input
                              type="tel"
                              value={formState.phone}
                              onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                              onFocus={() => setFocused('phone')}
                              onBlur={() => setFocused('')}
                              className={inputClass('phone')}
                              placeholder="+91 12345 67890"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-primary-dark/60 mb-2">Service Interest</label>
                            <select
                              value={formState.service}
                              onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                              onFocus={() => setFocused('service')}
                              onBlur={() => setFocused('')}
                              className={inputClass('service')}
                            >
                              {services.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-primary-dark/60 mb-2">Subject *</label>
                          <input
                            type="text"
                            required
                            value={formState.subject}
                            onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                            onFocus={() => setFocused('subject')}
                            onBlur={() => setFocused('')}
                            className={inputClass('subject')}
                            placeholder="How can we help?"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-primary-dark/60 mb-2">Message *</label>
                          <textarea
                            required
                            rows={5}
                            value={formState.message}
                            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                            onFocus={() => setFocused('message')}
                            onBlur={() => setFocused('')}
                            className={`${inputClass('message')} resize-none`}
                            placeholder="Tell us about your project or inquiry..."
                          />
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-none border-2 border-primary-dark h-16 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
                        >
                          <span className="flex items-center justify-center gap-3">
                            Send Message
                            <ArrowUpRight size={20} />
                          </span>
                        </Button>
                        <p className="text-xs text-primary-dark/40 font-bold text-center">
                          We respond within 24 hours on business days
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OFFICE IMAGE BANNER ═══ */}
      <section className="relative w-full h-[300px] md:h-[380px] overflow-hidden border-b-2 border-black/10">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=500&fit=crop"
          alt="Modern office workspace"
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-primary-dark/75" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="inline-block bg-white text-primary-dark font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(255,255,255,0.3)] border-2 border-white/50">
              Our Office
            </div>
            <h3 className="text-3xl md:text-4xl font-heading font-black mb-4">Visit Us in Person</h3>
            <p className="text-white/60 font-bold">Chennai, India · Open Mon–Sat</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
