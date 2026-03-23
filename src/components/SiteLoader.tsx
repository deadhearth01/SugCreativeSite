'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const SugLogoAnimation = dynamic(() => import('./SugLogoAnimation'), { ssr: false })

export default function SiteLoader() {
  const [show, setShow] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cleanedUp = useRef(false)

  function cleanup() {
    if (cleanedUp.current) return
    cleanedUp.current = true
    setShow(false)
    document.body.style.overflow = ''
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    // Safety net: if animation hangs on a slow device, force-close after 9s
    const safetyTimer = setTimeout(cleanup, 9000)
    return () => clearTimeout(safetyTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleComplete() {
    const el = overlayRef.current
    if (!el) { cleanup(); return }

    // Use direct DOM manipulation for the fade-out — avoids React
    // re-render timing racing with GSAP's inline opacity on whiteBgRef.
    // The white bg inside the animation is already at opacity:1, so the
    // overlay fades from white → transparent → site content. Smooth.
    el.style.transition = 'opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1)'

    // Force a reflow so the transition registers before we change opacity
    void el.offsetHeight

    el.style.opacity = '0'

    // Remove from DOM once fade finishes
    el.addEventListener('transitionend', cleanup, { once: true })
    // Fallback in case transitionend doesn't fire (some mobile browsers skip it)
    setTimeout(cleanup, 1300)
  }

  if (!show) return null

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        opacity: 1,
        // Dark bg prevents flash of site content before GSAP initializes
        background: '#041520',
      }}
    >
      <SugLogoAnimation onAnimationComplete={handleComplete} />
    </div>
  )
}
