'use client'

import { useEffect } from 'react'
import { WebHaptics } from 'web-haptics'

const haptics = new WebHaptics()

export default function HapticsProvider() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Stronger feedback for buttons / links / interactive elements
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[role="tab"]')
      ) {
        haptics.trigger([
          { duration: 25 },
          { delay: 40, duration: 35, intensity: 0.9 },
        ])
      } else {
        // Light tap for other clicks
        haptics.trigger([{ duration: 15, intensity: 0.5 }])
      }
    }

    window.addEventListener('click', handleClick, { passive: true })
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return null
}
