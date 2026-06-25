'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()
  // Smooth scroll is a marketing-site nicety. Inside the dashboard it hijacks
  // the wheel and breaks native scrolling in modals, dropdowns, and overflow
  // containers — so disable Lenis entirely on /dashboard routes.
  const isDashboard = pathname?.startsWith('/dashboard')

  useEffect(() => {
    if (isDashboard) return
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      // Let native wheel/trackpad scroll work inside modals, dropdowns, the
      // dashboard sidebar — anything inside a fixed-positioned ancestor or
      // explicitly opted out via [data-lenis-prevent] / [role="dialog"].
      prevent: (node) => {
        let el: Element | null = node as Element
        while (el && el !== document.documentElement) {
          if (el.hasAttribute('data-lenis-prevent')) return true
          if (el.getAttribute('role') === 'dialog') return true
          const pos = window.getComputedStyle(el).position
          if (pos === 'fixed' || pos === 'sticky') return true
          el = el.parentElement
        }
        return false
      },
    })

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [isDashboard])

  return <>{children}</>
}
