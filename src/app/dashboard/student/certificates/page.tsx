'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/DashboardUI'
import { Award, Download, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Certificate = {
  id: string
  certificate_number: string
  issued_at: string
  student_id: string
  course_id: string
  course: { title: string; category: string } | null
}

export default function CertificatesPage() {
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    const fetchCertificates = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('certificates')
        .select('*, course:course_id(title, category)')
        .eq('student_id', user.id)
        .order('issued_at', { ascending: false })

      setCertificates((data as unknown as Certificate[]) || [])
      setLoading(false)
    }
    fetchCertificates()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#1A9AB5]" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Certificates" description="Your earned certifications" />

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const course = cert.course as { title: string; category: string } | null
            const issuedDate = cert.issued_at
              ? new Date(cert.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : '—'
            return (
              <div key={cert.id} className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 bg-[#35C8E0]/20 mx-auto flex items-center justify-center mb-4 rounded-full">
                  <Award size={28} className="text-[#1A9AB5]" />
                </div>
                {course?.category && (
                  <span className="inline-block text-xs bg-off-white px-2 py-1 rounded-md font-medium text-foreground/60 mb-2">
                    {course.category}
                  </span>
                )}
                <h3 className="font-heading font-bold text-primary mb-1">{course?.title || 'Course Certificate'}</h3>
                <p className="text-xs text-foreground/50 mb-1">Issued: {issuedDate}</p>
                <p className="text-xs font-mono text-foreground/40 mb-4">{cert.certificate_number || cert.id}</p>
                <button className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                  <Download size={14} />
                  Download Certificate
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <Award size={48} className="mx-auto text-foreground/20 mb-3" />
          <p className="text-foreground/50">No certificates earned yet. Complete a course to earn your first certificate!</p>
        </div>
      )}
    </div>
  )
}
