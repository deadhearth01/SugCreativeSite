'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// 20 renamed photos
const ALL_PHOTOS = Array.from({ length: 20 }, (_, i) => `/grid-motion-hero-section/image${i + 1}.jpeg`)

// 4 rows × 5 photos
const ROWS = [
  ALL_PHOTOS.slice(0, 5),
  ALL_PHOTOS.slice(5, 10),
  ALL_PHOTOS.slice(10, 15),
  ALL_PHOTOS.slice(15, 20),
]

const ITEM_W = 220    // card width  px
const ITEM_H = 300    // card height px — portrait ~2:3 ratio
const GAP = 14        // gap between cards px
const REPEATS = 5     // repeat count per row for seamless loop
const SET_W = (ITEM_W + GAP) * 5   // 1170px — one full set width
const SCROLL_DURATION = 22          // seconds per loop

export default function GridMotionHero() {
  const autoRefs  = useRef<(HTMLDivElement | null)[]>([])
  const mouseRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Even rows scroll right (−SET_W → 0), odd rows scroll left (0 → −SET_W).
    // At repeat the jump is invisible — endpoints show identical content.
    const tweens = autoRefs.current.map((el, i) => {
      if (!el) return null
      const right = i % 2 === 0
      return gsap.fromTo(
        el,
        { x: right ? -SET_W : 0 },
        { x: right ? 0 : -SET_W, duration: SCROLL_DURATION, ease: 'none', repeat: -1 }
      )
    })

    // Gentle mouse parallax nudge on the outer wrapper
    const onMouseMove = (e: MouseEvent) => {
      const norm = e.clientX / window.innerWidth - 0.5  // −0.5 … +0.5
      mouseRefs.current.forEach((el, i) => {
        if (!el) return
        gsap.to(el, {
          x: norm * 60 * (i % 2 === 0 ? 1 : -1),
          duration: 1.4,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      })
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      tweens.forEach(t => t?.kill())
    }
  }, [])

  return (
    // Container fills the right column — parent already has overflow:hidden
    <div className="absolute inset-0">

      {/* Rotated grid — anchored to bottom so photos bleed off the lower edge */}
      <div
        className="absolute flex flex-col justify-end gap-4"
        style={{
          inset: '-20%',
          transform: 'rotate(-12deg)',
          transformOrigin: 'center center',
          paddingBottom: '2%',
        }}
      >
        {ROWS.map((rowPhotos, rowIndex) => (
          // Outer layer: mouse parallax
          <div
            key={rowIndex}
            ref={el => { mouseRefs.current[rowIndex] = el }}
            style={{ willChange: 'transform' }}
          >
            {/* Inner layer: auto-scroll */}
            <div
              ref={el => { autoRefs.current[rowIndex] = el }}
              className="flex"
              style={{ gap: GAP, willChange: 'transform' }}
            >
              {Array.from({ length: REPEATS }, (_, rep) =>
                rowPhotos.map((src, pi) => (
                  <div
                    key={`${rep}-${pi}`}
                    className="flex-shrink-0 rounded-2xl overflow-hidden shadow-md bg-gray-100"
                    style={{ width: ITEM_W, height: ITEM_H }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Left edge fade — soft transition where column meets the content */}
      <div
        className="absolute inset-y-0 left-0 w-32 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #ffffff, transparent)' }}
      />
      {/* Right edge fade */}
      <div
        className="absolute inset-y-0 right-0 w-16 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #ffffff, transparent)' }}
      />
      {/* Top edge fade — lighter since photos no longer crowd the top */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #ffffff 40%, transparent)' }}
      />
      {/* Bottom edge fade — photos bleed off the bottom naturally */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #ffffff 0%, transparent)' }}
      />
    </div>
  )
}
