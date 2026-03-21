'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { gsap } from 'gsap'
import StaggeredMenu from './StaggeredMenu'

// SSR-safe layout effect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/testimonials', label: 'Success Stories' },
  { href: '/blog', label: 'Insights' },
  { href: '/contact', label: 'Contact' },
]

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'Services', ariaLabel: 'View our services', link: '/services' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Success Stories', ariaLabel: 'Success Stories', link: '/testimonials' },
  { label: 'Insights', ariaLabel: 'Insights', link: '/blog' },
  { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' },
  { label: 'Login', ariaLabel: 'Login to portal', link: '/login' },
];

const socialItems = [
  { label: 'Instagram', link: 'https://instagram.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' },
  { label: 'Twitter', link: 'https://twitter.com' }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const pathname = usePathname();
  const isDarkBg = false
  const isLightHero = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Set initial position before paint to prevent flash
  useIsomorphicLayoutEffect(() => {
    if (navRef.current) {
      gsap.set(navRef.current, { y: -80, autoAlpha: 0 })
    }
  }, [pathname])

  // Animate in after paint
  useEffect(() => {
    const el = navRef.current
    if (!el) return
    gsap.killTweensOf(el)
    gsap.to(el, { y: 0, autoAlpha: 1, duration: 0.75, ease: 'power3.out', delay: 0.1 })
  }, [pathname])

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 hidden xl:block ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-black/5 py-4 shadow-sm'
            : 'bg-transparent py-8'
        }`}
      >
        <div className="container-wide flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative z-[60]">
            <div className={`w-12 h-12 flex items-center justify-center rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] ${
              isDarkBg ? 'bg-white text-primary-dark shadow-[4px_4px_0px_rgba(255,255,255,0.2)]' : 'bg-primary-dark text-white'
            }`}>
              <span className="font-heading font-black text-lg tracking-tighter">SC</span>
            </div>
            <span className={`text-2xl font-heading font-black tracking-tight transition-colors duration-300 ${
              isDarkBg ? 'text-white' : 'text-primary-dark'
            }`}>
              SUG CREATIVE
            </span>
          </Link>

          {/* Desktop Navigation (Center) */}
          <div className="hidden xl:flex items-center absolute left-1/2 -translate-x-1/2 gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 text-sm font-bold uppercase tracking-widest transition-colors duration-300 group ${
                  isDarkBg
                    ? 'text-white/80 hover:text-white'
                    : 'text-foreground/70 hover:text-primary-dark'
                }`}
              >
                {link.label}
                {/* Underline Hover Animation */}
                <span className={`absolute bottom-0 left-0 w-full h-[2px] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                  isDarkBg ? 'bg-white' : 'bg-primary-dark'
                }`} />
              </Link>
            ))}
          </div>

          {/* Desktop CTA & Portal (Right) */}
          <div className="hidden xl:flex items-center gap-5 relative z-[60]">
            <Link
              href="/login"
              className={`flex items-center gap-2 font-bold uppercase text-xs tracking-widest px-6 py-[18px] border-2 transition-all duration-300 rounded-none ${
                isDarkBg
                  ? 'border-white/30 text-white hover:border-white focus:outline-none'
                  : 'border-black/10 text-primary-dark hover:border-primary-dark hover:bg-black/5 focus:outline-none'
              }`}
            >
              Login
            </Link>

            <Link 
              href="/contact" 
              className={`font-bold uppercase text-xs tracking-widest px-8 py-[18px] border-2 transition-all duration-300 rounded-none inline-flex items-center gap-2 hover:-translate-y-[2px] ${
                isDarkBg 
                  ? 'bg-white text-primary-dark border-white hover:shadow-[4px_4px_0px_rgba(255,255,255,0.4)]' 
                  : 'bg-primary-dark text-white border-primary-dark hover:bg-white hover:text-primary-dark hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
              }`}
            >
              Start Project
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile only Staggered Menu */}
      <div className="block xl:hidden">
        <StaggeredMenu
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          menuButtonColor={isLightHero ? "#000000" : "#ffffff"}
          openMenuButtonColor="#000000"
          changeMenuColorOnOpen={true}
          colors={['#2563EB', '#4338CA', '#0F172A']}
          accentColor="#2563EB"
          isFixed={true}
          logo={
            <Link href="/" className="flex items-center gap-2 group relative z-[60] ml-4 mt-2">
              <div className={`w-8 h-8 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] bg-primary-dark text-white`}>
                <span className="font-heading font-black text-xs tracking-tighter">SC</span>
              </div>
              <span className={`text-lg font-heading font-black tracking-tight transition-colors duration-300 text-primary-dark pt-1`}>
                SUG CREATIVE
              </span>
            </Link>
          }
        />
      </div>
    </>
  )
}

