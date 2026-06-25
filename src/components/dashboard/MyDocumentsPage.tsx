'use client'

// Employee/intern "My Documents" — lists the certificates and offer letters
// issued to the signed-in user. Reads via RLS ("documents read own"), so the
// browser client only returns the current user's rows. Each item links to the
// public /verify page, which renders the full document and allows download.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Award, FileText, ExternalLink, ShieldCheck } from 'lucide-react'

type DocRow = {
  document_id: string
  type: 'certificate' | 'offer_letter'
  sub_type: string | null
  title: string
  issued_on: string
  status: string
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

export default function MyDocumentsPage() {
  const [docs, setDocs] = useState<DocRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (!cancelled) { setError('Please sign in to view your documents.'); setLoading(false) }
          return
        }
        const { data, error } = await supabase
          .from('documents')
          .select('document_id, type, sub_type, title, issued_on, status')
          .eq('recipient_profile_id', user.id)
          .eq('status', 'issued')
          .order('issued_on', { ascending: false })
        if (cancelled) return
        if (error) setError(error.message)
        else setDocs(data || [])
      } catch {
        if (!cancelled) setError('Failed to load documents.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-black text-primary-dark flex items-center gap-2">
          <Award className="text-primary" /> My Documents
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          Certificates and offer letters issued to you. Tap any document to view or download it.
        </p>
      </div>

      {loading && <p className="text-foreground/50 text-sm">Loading your documents…</p>}

      {!loading && error && (
        <div className="border-2 border-red-200 bg-red-50 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && docs.length === 0 && (
        <div className="border-2 border-dashed border-primary-dark/15 rounded-2xl p-10 text-center">
          <FileText className="mx-auto text-primary-dark/30 mb-3" size={40} />
          <p className="text-foreground/60 font-medium">No documents have been issued to you yet.</p>
        </div>
      )}

      {!loading && !error && docs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {docs.map((d) => (
            <div
              key={d.document_id}
              className="bg-white border-2 border-primary-dark rounded-2xl p-5 shadow-[4px_4px_0px_rgba(26,154,181,0.25)] flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                {d.type === 'certificate'
                  ? <Award size={18} className="text-[#82C93D]" />
                  : <FileText size={18} className="text-primary" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  {d.type === 'certificate' ? 'Certificate' : 'Offer Letter'}
                </span>
              </div>
              <h3 className="font-black text-primary-dark leading-tight">{d.title}</h3>
              <div className="mt-2 text-xs text-foreground/50 font-mono">{d.document_id}</div>
              <div className="text-xs text-foreground/50 mt-0.5">Issued {formatDate(d.issued_on)}</div>
              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600">
                  <ShieldCheck size={13} /> Verified
                </span>
                <Link
                  href={`/verify?id=${encodeURIComponent(d.document_id)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white bg-primary-dark hover:bg-black rounded-lg px-3 py-1.5 transition-colors"
                >
                  View <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
