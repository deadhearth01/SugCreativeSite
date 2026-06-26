import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { generateDocumentId } from '@/lib/documents'

// Admin-only: upload a certificate file for a student and record it as a
// `documents` row (type='certificate', sub_type='uploaded'). Mirrors the
// avatar-upload pattern but writes to the `documents` storage bucket and uses
// the service-role client so the row + storage object bypass RLS.
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const studentId = formData.get('student_id') as string | null
    const title = ((formData.get('title') as string | null) || '').trim() || 'Certificate'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!studentId) return NextResponse.json({ error: 'student_id is required' }, { status: 400 })

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use PDF, JPG, PNG, or WEBP.' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Look up recipient name for the document row.
    const { data: recipient } = await admin
      .from('profiles')
      .select('full_name, email')
      .eq('id', studentId)
      .single()

    const ext = (file.name.split('.').pop() || 'pdf').toLowerCase()
    const documentId = generateDocumentId('certificate', 'completion')
    const filePath = `certificates/${studentId}/${documentId}.${ext}`
    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await admin.storage
      .from('documents')
      .upload(filePath, bytes, { contentType: file.type, upsert: true })

    if (uploadError) {
      const hint = /bucket not found|not.*exist/i.test(uploadError.message)
        ? ' Create a public Storage bucket named "documents" in Supabase, or run the documents-storage migration.'
        : ''
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}.${hint}` }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage.from('documents').getPublicUrl(filePath)

    const { data, error } = await admin
      .from('documents')
      .insert({
        document_id: documentId,
        type: 'certificate',
        sub_type: 'uploaded',
        title,
        recipient_profile_id: studentId,
        recipient_name: recipient?.full_name || 'Student',
        recipient_email: recipient?.email || null,
        status: 'issued',
        pdf_url: publicUrl,
        issued_on: new Date().toISOString().slice(0, 10),
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      // Clean up the orphaned upload if the row insert fails.
      await admin.storage.from('documents').remove([filePath])
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/certificates/upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
