// Helpers for the courses API — keeps schema-drift mapping in one place.
//
// Background: the original `courses` schema (supabase-schema.sql) has
// `total_lessons`, `duration_hours`, `thumbnail_url`. The edutech migration
// added `duration_text`, `original_price`, `offer_price`, `tech_stack`, etc.
// The admin form sends `duration` (string) and `lessons` — we translate.

export function mapCoursePayload(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  const passthrough = [
    'title', 'description', 'category', 'price', 'status',
    'start_date', 'end_date', 'enrollment_limit', 'display_order',
    'syllabus', 'highlights', 'color_theme', 'slug',
    'original_price', 'offer_price', 'tech_stack', 'tags',
    'batch_start_date', 'is_featured', 'photos',
  ]
  for (const k of passthrough) if (body[k] !== undefined) out[k] = body[k]

  // UI uses `duration` and `lessons`; DB has `duration_text` and `total_lessons`.
  if (body.duration !== undefined) out.duration_text = body.duration
  if (body.duration_text !== undefined) out.duration_text = body.duration_text
  if (body.lessons !== undefined) out.total_lessons = body.lessons
  if (body.total_lessons !== undefined) out.total_lessons = body.total_lessons
  // UI may send `thumbnail`; DB column is `thumbnail_url`
  if (body.thumbnail !== undefined) out.thumbnail_url = body.thumbnail
  if (body.thumbnail_url !== undefined) out.thumbnail_url = body.thumbnail_url

  return out
}

// Revalidate every public surface that renders course data, so admin edits
// show up immediately instead of being served stale from the cache.
export async function revalidateCoursePaths() {
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/')                       // homepage Career Programs
  revalidatePath('/courses')                // public listing
  revalidatePath('/courses/[slug]', 'page') // all course detail pages
}

export function slugify(input: string) {
  return input.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}
