-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Courses — add enrollment_limit + display_order                      ║
-- ║                                                                       ║
-- ║  The admin course form and src/lib/courses.ts already write           ║
-- ║  `enrollment_limit`, but the column never existed (schema has         ║
-- ║  `max_students`). This caused: "Could not find the 'enrollment_limit' ║
-- ║  column of 'courses' in the schema cache". `display_order` is added   ║
-- ║  for admin-controlled homepage ordering.                              ║
-- ╚══════════════════════════════════════════════════════════════════════╝

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS enrollment_limit INTEGER,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Order the existing rows deterministically so admin reordering starts sane.
UPDATE courses SET display_order = 0 WHERE display_order IS NULL;

CREATE INDEX IF NOT EXISTS idx_courses_display_order ON courses(display_order);

-- Force PostgREST (Supabase API) to reload its schema cache immediately.
NOTIFY pgrst, 'reload schema';
