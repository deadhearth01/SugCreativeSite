'use client'

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  SignaturePad — a draggable floating panel with a drawable <canvas>.   ║
// ║                                                                       ║
// ║  Dragging: the panel is position:fixed; its top-left is tracked in    ║
// ║  `pos` state. Pointer-down on the header captures the pointer and      ║
// ║  records the grab offset; pointer-move updates `pos`. We use Pointer   ║
// ║  Events so mouse + touch + pen all work with one code path.           ║
// ║                                                                       ║
// ║  Drawing: pointer events on the canvas draw lines between the last     ║
// ║  point and the current point. Coordinates are mapped through the       ║
// ║  canvas bounding-rect so the stroke lands under the cursor even when   ║
// ║  the canvas is CSS-scaled. "Insert" exports toDataURL('image/png').   ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useRef, useState, useEffect, useCallback } from 'react'
import { X, Eraser, Check, PenLine, Move } from 'lucide-react'

const CANVAS_W = 380
const CANVAS_H = 160

export default function SignaturePad({
  onInsert,
  onClose,
}: {
  onInsert: (dataUrl: string) => void
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const hasContent = useRef(false)
  const [empty, setEmpty] = useState(true)

  // Draggable panel position (top-left, in px from viewport).
  // Initialised lazily to centre the panel on the viewport (SSR-safe guard).
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 40, y: 40 }
    return {
      x: Math.max(12, window.innerWidth / 2 - 210),
      y: Math.max(12, window.innerHeight / 2 - 160),
    }
  })
  const dragOffset = useRef<{ x: number; y: number } | null>(null)

  // ── Canvas setup (white background so the PNG isn't transparent) ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#0d3b4f'
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    drawing.current = true
    last.current = pointFromEvent(e)
    canvasRef.current?.setPointerCapture(e.pointerId)
  }

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx || !last.current) return
    const p = pointFromEvent(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (!hasContent.current) {
      hasContent.current = true
      setEmpty(false)
    }
  }

  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false
    last.current = null
    canvasRef.current?.releasePointerCapture?.(e.pointerId)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    hasContent.current = false
    setEmpty(true)
  }

  const insert = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    onInsert(canvas.toDataURL('image/png'))
    onClose()
  }

  // ── Drag handlers (header is the grab handle) ──
  const onHeaderPointerDown = (e: React.PointerEvent) => {
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onHeaderPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragOffset.current) return
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      })
    },
    []
  )
  const onHeaderPointerUp = (e: React.PointerEvent) => {
    dragOffset.current = null
    ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
  }

  return (
    <div
      className="fixed z-[120] w-[420px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border-2 border-[#1A9AB5] overflow-hidden"
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
      role="dialog"
      aria-label="Signature pad"
    >
      {/* Drag handle / header */}
      <div
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[#1A9AB5] cursor-move select-none"
      >
        <div className="flex items-center gap-2 text-white">
          <Move size={15} className="opacity-70" />
          <PenLine size={15} />
          <span className="text-sm font-black uppercase tracking-wide">Draw Signature</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/15 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4">
        <div className="relative rounded-xl border-2 border-dashed border-[#35C8E0]/60 overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full block touch-none cursor-crosshair"
            style={{ touchAction: 'none' }}
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
            onPointerCancel={endDraw}
          />
          {empty && (
            <span className="absolute inset-0 flex items-center justify-center text-foreground/30 text-sm font-semibold pointer-events-none">
              Sign here with your mouse / finger
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={clear}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-foreground/70 bg-foreground/5 hover:bg-foreground/10 transition-colors"
          >
            <Eraser size={15} /> Clear
          </button>
          <button
            type="button"
            onClick={insert}
            disabled={empty}
            className="flex-[1.6] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-black text-white bg-[#82C93D] hover:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check size={15} /> Insert Signature
          </button>
        </div>
      </div>
    </div>
  )
}
