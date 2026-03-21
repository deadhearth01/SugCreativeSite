'use client'

import Link from 'next/link'
import { ArrowUpRight, Mail, Phone, MapPin, Facebook, Linkedin, Instagram, Twitter } from 'lucide-react'

const footerLinks = {
  Services: [
    { label: 'Business Solutions', href: '/services#business' },
    { label: 'Career Guidance', href: '/services#career' },
    { label: 'Startup Hub', href: '/services#startup' },
    { label: 'Edu Tech', href: '/services#edutech' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund-policy' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white relative font-body border-t-2 border-white/10 overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
          backgroundSize: '100px 100px' 
        }} 
      />

      <div className="container-wide relative z-10">
        
        {/* Pre-Footer CTA */}
        <div className="py-20 lg:py-32 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="max-w-3xl">
            <p className="text-white/60 uppercase tracking-[0.2em] font-bold text-sm mb-6 flex items-center gap-4">
              <span className="w-12 h-px bg-white/30 inline-block"></span>
              Elevate Your Operations
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black leading-[1.1] tracking-tight text-white drop-shadow-sm">
              Ready to scale your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-pale to-white">business?</span>
            </h2>
          </div>
          <div>
            <Link href="/contact" className="group relative inline-flex items-center justify-center bg-white text-primary-dark px-10 py-6 font-bold uppercase tracking-widest text-sm hover:text-white border-2 border-white transition-all duration-300 rounded-none overflow-hidden hover:shadow-[10px_10px_0px_rgba(255,255,255,1)]">
              <span className="relative z-10 flex items-center gap-3">
                <span className="group-hover:-translate-y-10 transition-transform duration-300 block">Start a Project</span>
                <span className="absolute inset-0 translate-y-10 group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center">Start a Project</span>
                <ArrowUpRight size={20} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white relative z-10" />
              </span>
              <div className="absolute inset-0 bg-primary-dark translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </Link>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="mb-10">
              <Link href="/" className="inline-block group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white flex items-center justify-center shadow-[4px_4px_0px_rgba(255,255,255,0.2)] group-hover:shadow-[6px_6px_0px_rgba(255,255,255,1)] transition-all">
                    <span className="text-primary-dark font-heading font-black text-xl tracking-tighter">SC</span>
                  </div>
                  <span className="font-heading font-black text-2xl tracking-tight">SUG CREATIVE</span>
                </div>
              </Link>
            </div>
            
            <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-sm font-medium">
              We provide enterprise-grade solutions, strategic career guidance, and end-to-end startup incubation designed to yield measurable success.
            </p>

            <form className="relative max-w-md w-full" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="newsletter" className="sr-only">Subscribe to newsletter</label>
              <div className="flex">
                <input 
                  type="email" 
                  id="newsletter" 
                  placeholder="Enter your email" 
                  className="bg-white/5 border border-white/20 text-white placeholder:text-white/40 px-5 py-4 w-full focus:outline-none focus:border-white focus:bg-white/10 transition-all rounded-none font-medium text-sm"
                />
                <button type="submit" className="bg-white text-primary-dark px-6 py-4 border border-white hover:bg-primary-pale hover:border-primary-pale hover:text-black transition-colors flex items-center justify-center rounded-none group shadow-[4px_4px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
                  <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>

          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Links Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-8 border-l-2 border-white/40 pl-3">
                  {category}
                </h4>
                <ul className="space-y-5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href} 
                        className="group inline-flex items-center text-white/70 hover:text-white text-sm transition-colors duration-300 font-medium relative"
                      >
                        <span className="relative overflow-hidden inline-flex items-center gap-1">
                          {link.label}
                          <ArrowUpRight size={12} className="opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-6 text-white/60 text-sm font-medium">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            <a href="mailto:hello@sugcreative.com" className="flex items-center gap-3 hover:text-white transition-colors group">
              <span className="w-10 h-10 rounded-none border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-primary-dark transition-all shadow-[2px_2px_0px_rgba(255,255,255,0.1)] group-hover:shadow-[4px_4px_0px_rgba(255,255,255,1)]">
                <Mail size={16} />
              </span> 
              hello@sugcreative.com
            </a>
            <a href="tel:+919876543210" className="flex items-center gap-3 hover:text-white transition-colors group">
              <span className="w-10 h-10 rounded-none border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-primary-dark transition-all shadow-[2px_2px_0px_rgba(255,255,255,0.1)] group-hover:shadow-[4px_4px_0px_rgba(255,255,255,1)]">
                <Phone size={16} />
              </span> 
              +91 98765 43210
            </a>
            <span className="flex items-center gap-3 group">
              <span className="w-10 h-10 rounded-none border border-white/20 flex items-center justify-center shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
                <MapPin size={16} />
              </span> 
              Chennai, India
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/40 text-xs tracking-widest uppercase font-black">
            &copy; {new Date().getFullYear()} Sug Creative. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
             {[
               { icon: Linkedin, href: '#' },
               { icon: Twitter, href: '#' },
               { icon: Facebook, href: '#' },
               { icon: Instagram, href: '#' }
             ].map((social, idx) => (
              <a 
                key={idx} 
                href={social.href} 
                className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white hover:text-primary-dark hover:border-white transition-all duration-300 rounded-none shadow-[2px_2px_0px_rgba(255,255,255,0.05)] hover:shadow-[4px_4px_0px_rgba(255,255,255,1)]"
                aria-label="Social Link"
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
