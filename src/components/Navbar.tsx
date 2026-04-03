'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ChevronDown, Server, Shield, Cpu, Globe, Code2, Palette, Settings, Rocket, Megaphone, Users } from 'lucide-react'
import { gsap } from 'gsap'
import StaggeredMenu from './StaggeredMenu'

// SSR-safe layout effect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Navigation with submenus
interface SubMenuItem {
  href: string
  label: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  desc?: string
}

interface NavLink {
  href: string
  label: string
  subItems?: SubMenuItem[]
}

const navLinks: NavLink[] = [
  { 
    href: '/courses', 
    label: 'Courses',
    subItems: [
      { href: '/courses/devops-internship', label: 'DevOps Internship', icon: Server, desc: 'CI/CD, Docker, Kubernetes' },
      { href: '/courses/cyber-security-internship', label: 'Cyber Security', icon: Shield, desc: 'Ethical Hacking, VAPT' },
      { href: '/courses/iot-embedded-internship', label: 'IoT & Embedded', icon: Cpu, desc: 'Arduino, Raspberry Pi' },
      { href: '/courses/fullstack-dev-internship', label: 'Full Stack Dev', icon: Globe, desc: 'React, Node.js, Databases' },
    ]
  },
  { 
    href: '/services', 
    label: 'Services',
    subItems: [
      { href: '/services#web-development', label: 'Web Development', icon: Code2, desc: 'Custom websites & apps' },
      { href: '/services#ui-ux-design', label: 'UI/UX Design', icon: Palette, desc: 'User-centered design' },
      { href: '/services#it-consulting', label: 'IT Consulting', icon: Settings, desc: 'Strategic tech guidance' },
      { href: '/services#digital-marketing', label: 'Digital Marketing', icon: Megaphone, desc: 'SEO, Social & Ads' },
    ]
  },
  { href: '/about', label: 'About' },
  { href: '/testimonials', label: 'Success Stories' },
  { href: '/contact', label: 'Contact' },
]

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'Courses', ariaLabel: 'View our courses', link: '/courses' },
  { label: 'Services', ariaLabel: 'View our services', link: '/services' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Success Stories', ariaLabel: 'Success Stories', link: '/testimonials' },
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
            <Image
              src="/sug-new-log.svg"
              alt="Sug Creative Logo"
              width={44}
              height={44}
              className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
            />
            <span className={`text-2xl font-heading font-black tracking-tight transition-colors duration-300 ${
              isDarkBg ? 'text-white' : 'text-foreground'
            }`}>
              SUG CREATIVE
            </span>
          </Link>

          {/* Desktop Navigation (Center) */}
          <div className="hidden xl:flex items-center absolute left-1/2 -translate-x-1/2 gap-6">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className={`relative py-2 text-sm font-bold uppercase tracking-widest transition-colors duration-300 flex items-center gap-1 ${
                    isDarkBg
                      ? 'text-white/80 hover:text-white'
                      : 'text-foreground/70 hover:text-primary-dark'
                  }`}
                >
                  {link.label}
                  {link.subItems && (
                    <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                  )}
                  {/* Underline Hover Animation */}
                  <span className={`absolute bottom-0 left-0 w-full h-[2px] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                    isDarkBg ? 'bg-white' : 'bg-primary-dark'
                  }`} />
                </Link>
                
                {/* Dropdown Menu */}
                {link.subItems && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] min-w-[280px] p-2">
                      {link.subItems.map((subItem) => {
                        const IconComponent = subItem.icon
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors group/item"
                          >
                            {IconComponent && (
                              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                <IconComponent size={20} />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-primary-dark text-sm group-hover/item:text-primary transition-colors">
                                {subItem.label}
                              </div>
                              {subItem.desc && (
                                <div className="text-xs text-primary-dark/60 mt-0.5">
                                  {subItem.desc}
                                </div>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                      <div className="border-t border-black/10 mt-2 pt-2">
                        <Link
                          href={link.href}
                          className="flex items-center justify-between p-3 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors"
                        >
                          View All {link.label}
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA & Portal (Right) */}
          <div className="hidden xl:flex items-center gap-4 relative z-[60]">
            <Link
              href="/login"
              className={`flex items-center justify-center font-bold uppercase text-xs tracking-widest px-6 py-4 border-2 transition-all duration-300 rounded-none min-w-[100px] ${
                isDarkBg
                  ? 'border-white/30 text-white hover:border-white focus:outline-none'
                  : 'border-black/10 text-primary-dark hover:border-primary-dark hover:bg-black/5 focus:outline-none'
              }`}
            >
              Login
            </Link>

            <Link 
              href="/contact" 
              className={`font-bold uppercase text-xs tracking-widest px-6 py-4 border-2 transition-all duration-300 rounded-none inline-flex items-center justify-center gap-2 hover:-translate-y-[2px] min-w-[140px] ${
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
          colors={['#35C8E0', '#1A9AB5', '#1A9AB5']}
          accentColor="#82C93D"
          isFixed={true}
          logo={
            <Link href="/" className="flex items-center gap-2 group relative z-[60] ml-4 mt-2">
              <Image src="/sug-new-log.svg" alt="Sug Creative Logo" width={34} height={34} className="flex-shrink-0" />
              <span className="text-lg font-heading font-black tracking-tight text-foreground pt-1">
                SUG CREATIVE
              </span>
            </Link>
          }
        />
      </div>
    </>
  )
}

