'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import { Mail, Phone, MapPin, Send, ArrowUpRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ContactPage() {
  const heroRef = useRef<HTMLHeadingElement>(null)
  const [formState, setFormState] = useState({
    name: '', email: '', phone: '', subject: '', message: '', service: '',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (heroRef.current) {
      gsap.from(heroRef.current, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.3 })
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 bg-white">
        <div className="container-wide">
          <div className="max-w-4xl">
            <Badge variant="secondary" className="mb-4 rounded-sm bg-primary-ghost text-primary-bright font-semibold uppercase tracking-widest text-xs px-3 py-1">
              Contact Us
            </Badge>
            <h1 ref={heroRef} className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary leading-tight mb-6">
              Let&apos;s Start a{' '}
              <span className="bg-gradient-to-r from-primary via-primary-light to-primary-bright bg-clip-text text-transparent">Conversation</span>
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl leading-relaxed">
              Have a question, project, or idea? We&apos;d love to hear from you. 
              Reach out and let&apos;s explore how we can work together.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT CONTENT ═══ */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <AnimatedSection direction="left">
                <h2 className="text-2xl font-heading font-bold text-primary mb-8">Get In Touch</h2>

                <div className="space-y-6 mb-12">
                  <a href="mailto:hello@sugcreative.com" className="flex items-start gap-4 group">
                    <div className="w-12 h-12 flex items-center justify-center bg-primary text-white shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">Email</p>
                      <p className="text-foreground-muted text-sm group-hover:text-primary-bright transition-colors">hello@sugcreative.com</p>
                    </div>
                  </a>

                  <a href="tel:+919876543210" className="flex items-start gap-4 group">
                    <div className="w-12 h-12 flex items-center justify-center bg-primary-bright text-white shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">Phone</p>
                      <p className="text-foreground-muted text-sm group-hover:text-primary-bright transition-colors">+91 98765 43210</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-primary-light text-white shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">Office</p>
                      <p className="text-foreground-muted text-sm">123 Innovation Hub, Koramangala<br />Bangalore, Karnataka 560034</p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Follow Us</h3>
                <div className="flex gap-2">
                  {['Li', 'Ig', 'X', 'Yt'].map((s) => (
                    <a key={s} href="#" className="w-10 h-10 flex items-center justify-center border border-border text-foreground-muted hover:bg-primary hover:text-white hover:border-primary transition-all text-xs font-bold">
                      {s}
                    </a>
                  ))}
                </div>

                {/* Office hours */}
                <Card className="rounded-sm shadow-none border-border mt-10">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-primary text-sm mb-3">Office Hours</h3>
                    <div className="space-y-1 text-sm text-foreground-muted">
                      <p>Monday – Friday: 9:00 AM – 7:00 PM</p>
                      <p>Saturday: 10:00 AM – 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <AnimatedSection direction="right" delay={0.15}>
                <Card className="rounded-sm shadow-none border-border">
                  <CardContent className="p-8 lg:p-10">
                    {submitted ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto flex items-center justify-center bg-primary-bright text-white mb-6">
                          <Send size={28} />
                        </div>
                        <h3 className="text-2xl font-heading font-bold text-primary mb-3">Message Sent!</h3>
                        <p className="text-foreground-muted">
                          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-2xl font-heading font-bold text-primary mb-2">Send Us a Message</h2>
                        <p className="text-foreground-muted text-sm mb-6">Fill out the form below and our team will get back to you promptly.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-primary mb-2">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={formState.name}
                              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                              className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:border-primary-bright focus:outline-none focus:ring-1 focus:ring-primary-bright/30 transition-colors bg-white"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-primary mb-2">Email *</label>
                            <input
                              type="email"
                              required
                              value={formState.email}
                              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                              className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:border-primary-bright focus:outline-none focus:ring-1 focus:ring-primary-bright/30 transition-colors bg-white"
                              placeholder="you@example.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-primary mb-2">Phone</label>
                            <input
                              type="tel"
                              value={formState.phone}
                              onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                              className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:border-primary-bright focus:outline-none focus:ring-1 focus:ring-primary-bright/30 transition-colors bg-white"
                              placeholder="+91 12345 67890"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-primary mb-2">Service Interest</label>
                            <select
                              value={formState.service}
                              onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                              className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:border-primary-bright focus:outline-none focus:ring-1 focus:ring-primary-bright/30 transition-colors bg-white text-foreground-muted"
                            >
                              <option value="">Select a service</option>
                              <option value="business">Business Solutions</option>
                              <option value="career">Career Guidance</option>
                              <option value="startup">Startup Hub</option>
                              <option value="edutech">Edu Tech</option>
                              <option value="young-compete">Young Compete</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-primary mb-2">Subject *</label>
                          <input
                            type="text"
                            required
                            value={formState.subject}
                            onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                            className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:border-primary-bright focus:outline-none focus:ring-1 focus:ring-primary-bright/30 transition-colors bg-white"
                            placeholder="How can we help?"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-primary mb-2">Message *</label>
                          <textarea
                            required
                            rows={5}
                            value={formState.message}
                            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                            className="w-full px-4 py-3 border border-border rounded-sm text-sm focus:border-primary-bright focus:outline-none focus:ring-1 focus:ring-primary-bright/30 transition-colors bg-white resize-none"
                            placeholder="Tell us about your project or inquiry..."
                          />
                        </div>

                        <Button type="submit" size="lg" className="w-full rounded-sm bg-primary hover:bg-primary-deep text-white font-semibold">
                          <span className="group inline-flex items-center justify-center gap-3">
                            Send Message
                            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </span>
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAP / OFFICE IMAGE ═══ */}
      <section className="bg-white">
        <div className="relative w-full h-[320px] md:h-[400px]">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=500&fit=crop"
            alt="Modern office workspace"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-primary/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <MapPin size={32} className="mx-auto mb-4 text-white/80" />
              <h3 className="text-2xl font-heading font-bold mb-2">Visit Our Office</h3>
              <p className="text-white/60 text-sm">123 Innovation Hub, Koramangala, Bangalore 560034</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
