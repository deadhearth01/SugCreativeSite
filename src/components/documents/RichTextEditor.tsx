'use client'

// Quill-based rich-text editor (open source, BSD) for the offer-letter body.
// Quill touches `window`, so it's imported dynamically inside an effect and the
// component only renders its container on the client. Emits sanitized-ready
// HTML via onChange; the preview sanitizes before rendering.

import { useEffect, useRef } from 'react'
import type QuillType from 'quill'
import 'quill/dist/quill.snow.css'

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'clean'],
]

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<QuillType | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  // Guard so the value→editor sync doesn't echo back as an onChange.
  const settingRef = useRef(false)

  // Init Quill once.
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const Quill = (await import('quill')).default
      if (!mounted || !hostRef.current || quillRef.current) return
      const quill = new Quill(hostRef.current, {
        theme: 'snow',
        placeholder,
        modules: { toolbar: TOOLBAR },
      })
      quillRef.current = quill
      // Seed initial content.
      if (value) {
        settingRef.current = true
        quill.clipboard.dangerouslyPasteHTML(value)
        settingRef.current = false
      }
      quill.on('text-change', () => {
        if (settingRef.current) return
        const html = quill.root.innerHTML
        onChangeRef.current(html === '<p><br></p>' ? '' : html)
      })
    })()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external value changes (e.g. switching document type loads a default)
  // into the editor without clobbering in-progress typing.
  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return
    const current = quill.root.innerHTML
    const normalized = current === '<p><br></p>' ? '' : current
    if (value !== normalized) {
      settingRef.current = true
      const sel = quill.getSelection()
      quill.clipboard.dangerouslyPasteHTML(value || '')
      if (sel) { try { quill.setSelection(sel) } catch {} }
      settingRef.current = false
    }
  }, [value])

  return <div className="rte-host"><div ref={hostRef} /></div>
}
