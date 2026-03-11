'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
}

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 1,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      duration,
      delay,
      ease: 'power3.out',
    }

    switch (direction) {
      case 'up':
        fromVars.y = 60
        break
      case 'down':
        fromVars.y = -60
        break
      case 'left':
        fromVars.x = 60
        break
      case 'right':
        fromVars.x = -60
        break
    }

    const anim = gsap.from(el, {
      ...fromVars,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'bottom 20%',
        toggleActions: 'play none none none',
      },
    })

    return () => {
      anim.kill()
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [delay, direction, duration])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
