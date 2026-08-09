'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Scroll-reveal primitives.
 *
 * Everything animates once, on entry, with a soft spring-like ease — no
 * re-triggering as the user scrolls back up, which reads as noisy. All motion
 * collapses to a plain fade when the visitor prefers reduced motion.
 */

const EASE = [0.21, 0.47, 0.32, 0.98] as const

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

const offset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 32, y: 0 },
  right: { x: -32, y: 0 },
  none: { x: 0, y: 0 },
}

export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  className,
  amount = 0.25,
}: {
  children: ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  className?: string
  amount?: number
}) {
  const reduced = useReducedMotion()
  const { x, y } = reduced ? offset.none : offset[direction]

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduced ? 0.3 : duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Parent that staggers its <RevealItem> children as the group scrolls in. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
  amount = 0.15,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  amount?: number
}) {
  const reduced = useReducedMotion()
  const variants: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: delay },
    },
  }
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  children,
  className,
  direction = 'up',
}: {
  children: ReactNode
  className?: string
  direction?: Direction
}) {
  const reduced = useReducedMotion()
  const { x, y } = reduced ? offset.none : offset[direction]
  const variants: Variants = {
    hidden: { opacity: 0, x, y },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: reduced ? 0.3 : 0.65, ease: EASE },
    },
  }
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  )
}

