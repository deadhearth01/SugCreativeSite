'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import to ensure it's only ever client-side (no SSR)
const SugLogoAnimation = dynamic(() => import('./SugLogoAnimation'), { ssr: false })

export default function SiteLoader() {
  const [show, setShow] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Always show on every page load / refresh
    setShow(true)
    document.body.style.overflow = 'hidden'
  }, [])

  function handleComplete() {
    // Start the exit fade-out transition
    setExiting(true)
    // After fade-out transition completes, fully remove from DOM and restore scroll
    setTimeout(() => {
      setShow(false)
      document.body.style.overflow = ''
    }, 700)
  }

  if (!show) return null

  return (
    <div
      className="site-loader-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        transition: 'opacity 0.7s ease',
        opacity: exiting ? 0 : 1,
        pointerEvents: exiting ? 'none' : 'all',
      }}
    >
      <SugLogoAnimation onAnimationComplete={handleComplete} />
    </div>
  )
}
