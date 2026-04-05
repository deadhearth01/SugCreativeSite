'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const SugLogoAnimation = dynamic(() => import('./SugLogoAnimation'), { ssr: false })

const STORAGE_KEY = 'siteLoaderPlayed'

export default function SiteLoader() {
  // Start false on both server and client — no hydration mismatch
  const [show, setShow] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cleanedUp = useRef(false)
  const didRun = useRef(false)

  function cleanup() {
    if (cleanedUp.current) return
    cleanedUp.current = true
    try { sessionStorage.setItem(STORAGE_KEY, '1') } catch { /* noop */ }
    setShow(false)
    document.body.style.overflow = ''
  }

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    // Only on homepage
    if (window.location.pathname !== '/') return

    // Only once per session
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    } catch { /* noop */ }

    setShow(true)
    document.body.style.overflow = 'hidden'

    // Safety: force-close after 9s
    const safetyTimer = setTimeout(cleanup, 9000)
    return () => clearTimeout(safetyTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleComplete() {
    const el = overlayRef.current
    if (!el) { cleanup(); return }

    el.style.transition = 'opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1)'
    void el.offsetHeight
    el.style.opacity = '0'

    el.addEventListener('transitionend', cleanup, { once: true })
    setTimeout(cleanup, 1400)
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
        background: '#041520',
      }}
    >
      <SugLogoAnimation onAnimationComplete={handleComplete} />
    </div>
  )
}
