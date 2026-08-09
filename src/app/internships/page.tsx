import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import InternshipsPageView, {
  type InternshipProgram,
} from '@/components/internships/InternshipsPageView'
import { mergeInternshipsContent } from '@/lib/pageContent'

export const metadata: Metadata = {
  title: 'Internships | Sug Creative',
  description:
    'Hands-on internship programs across software development, data science, cloud, cyber security and design. Work on live projects with industry mentors and earn a certificate of completion.',
}

export default async function InternshipsPage() {
  const supabase = await createClient()

  // Both queries degrade gracefully: if `page_content` has not been migrated
  // yet the defaults render, and if `course_type` is missing no program cards
  // show rather than the page erroring.
  const [contentRes, coursesRes] = await Promise.all([
    supabase.from('page_content').select('section, data').eq('page', 'internships'),
    supabase
      .from('courses')
      .select('id, title, slug, description, thumbnail_url, duration_text, tech_stack, color_theme')
      .eq('status', 'active')
      .eq('course_type', 'training')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  const content = mergeInternshipsContent(contentRes.data)
  const programs = (coursesRes.data ?? []) as InternshipProgram[]

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <InternshipsPageView content={content} programs={programs} />
      </main>
      <Footer />
    </>
  )
}
