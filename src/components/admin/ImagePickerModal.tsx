'use client'

import { useState } from 'react'
import { Search, Loader2, X, Check, ImageIcon } from 'lucide-react'

type UnsplashImage = {
  id: string
  thumb: string
  full: string
  alt: string
  credit: string
  creditUrl: string
}

/**
 * Friendly Unsplash image picker modal.
 *
 * Search input + Search button → grid of results. Click a result to select it
 * (calls `onSelect` with the result's `full` URL and closes). Degrades
 * gracefully when the Unsplash key is missing (shows the API's message).
 */
export default function ImagePickerModal({
  open,
  initialQuery = '',
  currentUrl = '',
  onSelect,
  onClose,
}: {
  open: boolean
  initialQuery?: string
  currentUrl?: string
  onSelect: (fullUrl: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<UnsplashImage[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  if (!open) return null

  const runSearch = async () => {
    const q = query.trim()
    if (!q) return
    setSearching(true)
    setError('')
    setSearched(true)
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      if (json.error) {
        setError(json.error)
        setResults([])
      } else {
        setResults(json.data || [])
        if ((json.data || []).length === 0) setError('No images found. Try a different search.')
      }
    } catch {
      setError('Image search failed. Please try again.')
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search images"
        className="bg-white rounded-2xl w-full max-w-3xl shadow-lg flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <ImageIcon size={18} /> Search Images
            </h2>
            <p className="text-xs text-foreground/40 mt-0.5">
              Free photos from Unsplash. Click a result to use it as the course image.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Close image picker"
          >
            <X size={20} className="text-foreground/40" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-5 border-b border-gray-200 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
              />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    runSearch()
                  }
                }}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#35C8E0]/30 focus:border-[#35C8E0] transition-all"
                placeholder="e.g. coding, business meeting, startup…"
              />
            </div>
            <button
              type="button"
              onClick={runSearch}
              disabled={searching || !query.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
            >
              {searching ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
              Search
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>

        {/* Results */}
        <div className="p-5 overflow-y-auto overscroll-contain flex-1">
          {searching ? (
            <div className="flex items-center justify-center py-16 text-foreground/40">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((img) => {
                const selected = currentUrl === img.full
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => onSelect(img.full)}
                    title={`${img.alt} — ${img.credit}`}
                    className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                      selected
                        ? 'border-[#35C8E0] ring-2 ring-[#35C8E0]/30'
                        : 'border-transparent hover:border-[#35C8E0]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.thumb}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
                    {/* Hover / selected overlay */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${
                        selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1 bg-white text-primary text-xs font-bold px-2.5 py-1 rounded-full shadow">
                        <Check size={12} /> {selected ? 'Selected' : 'Use this'}
                      </span>
                    </span>
                    {/* Credit */}
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white/90 bg-black/40 rounded px-1 py-0.5 truncate text-left">
                      {img.credit}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-foreground/40">
              <ImageIcon size={36} className="mb-3 opacity-40" />
              <p className="text-sm">
                {searched ? 'No results.' : 'Search for a photo to get started.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
