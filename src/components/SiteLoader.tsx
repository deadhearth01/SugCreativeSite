'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const SugLogoAnimation = dynamic(() => import('./SugLogoAnimation'), { ssr: false })

export default function SiteLoader() {
  const [show, setShow] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cleanedUp = useRef(false)

  function cleanup() {
    if (cleanedUp.current) return
    cleanedUp.current = true
    setShow(false)
    document.body.style.overflow = ''
  }

  useEffect(() => {
    // Only show on the homepage — never on sub-pages
    if (window.location.pathname !== '/') return

    setShow(true)
    document.body.style.overflow = 'hidden'

    // Safety: force-close after 9 s if animation hangs on a slow device
    const safetyTimer = setTimeout(cleanup, 9000)
    return () => clearTimeout(safetyTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleComplete() {
    const el = overlayRef.current
    if (!el) { cleanup(); return }

    // Direct DOM fade-out — avoids React re-render racing with GSAP's
    // inline opacity on the white-bg child element.
    el.style.transition = 'opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1)'
    void el.offsetHeight          // force reflow so transition registers
    el.style.opacity = '0'

    el.addEventListener('transitionend', cleanup, { once: true })
    setTimeout(cleanup, 1400)     // fallback if transitionend doesn't fire
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
        // Solid dark bg prevents flash of site content before the dynamic
        // import of SugLogoAnimation resolves
        background: '#041520',
      }}
    >
      <SugLogoAnimation onAnimationComplete={handleComplete} />
    </div>
  )
}
