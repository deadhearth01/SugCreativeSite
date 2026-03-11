'use client'

import { PageHeader } from '@/components/dashboard/DashboardUI'
import { Award, Download } from 'lucide-react'

const certificates = [
  { course: 'Resume Building Bootcamp', issueDate: 'May 20, 2025', credentialId: 'SUG-CERT-2025-0891' },
]

export default function CertificatesPage() {
  return (
    <div>
      <PageHeader title="Certificates" description="Your earned certifications" />

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, i) => (
            <div key={i} className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-primary-bright/10 mx-auto flex items-center justify-center mb-4">
                <Award size={28} className="text-primary-bright" />
              </div>
              <h3 className="font-heading font-bold text-primary mb-1">{cert.course}</h3>
              <p className="text-xs text-foreground/50 mb-1">Issued: {cert.issueDate}</p>
              <p className="text-xs font-mono text-foreground/40 mb-4">{cert.credentialId}</p>
              <button className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                <Download size={14} />
                Download Certificate
              </button>
            </div>
          ))}
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
