-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  2026-08-09 — Course types, editable page content, calendar RLS fix   ║
-- ║                                                                       ║
-- ║  1. courses.course_type  — 'specialization' | 'training'              ║
-- ║     Training courses ARE the internship programs; the /internships    ║
-- ║     page renders course_type = 'training'.                            ║
-- ║  2. page_content        — admin-editable copy/images for marketing    ║
-- ║     pages, one JSONB row per (page, section).                         ║
-- ║  3. calendar_events RLS — harden the role lookup so event visibility  ║
-- ║     can never be silently blocked by RLS on `profiles`.               ║
-- ║                                                                       ║
-- ║  Safe to re-run: every statement is idempotent.                       ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════
-- 1. COURSE TYPE
-- ═══════════════════════════════════════════════════════════════════════
-- Plain TEXT + CHECK rather than a new enum: enums can't be altered inside
-- a transaction in older Postgres, and a CHECK is trivial to extend later.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS course_type TEXT NOT NULL DEFAULT 'specialization';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_course_type_check'
  ) THEN
    ALTER TABLE public.courses
      ADD CONSTRAINT courses_course_type_check
      CHECK (course_type IN ('specialization', 'training'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_courses_course_type ON public.courses(course_type);

COMMENT ON COLUMN public.courses.course_type IS
  'specialization = full career program (/courses); training = internship program (/internships)';

-- ═══════════════════════════════════════════════════════════════════════
-- 2. PAGE CONTENT (admin-editable marketing copy + images)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.page_content (
  page       TEXT NOT NULL,
  section    TEXT NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (page, section)
);

COMMENT ON TABLE public.page_content IS
  'One JSONB blob per (page, section) of admin-editable marketing content.';

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous site visitors) may read published copy.
DROP POLICY IF EXISTS "page_content readable by all" ON public.page_content;
CREATE POLICY "page_content readable by all"
  ON public.page_content FOR SELECT
  USING (true);

-- Only admins may write. Writes also go through an admin-gated API route,
-- but the policy is the real boundary.
DROP POLICY IF EXISTS "page_content writable by admins" ON public.page_content;
CREATE POLICY "page_content writable by admins"
  ON public.page_content FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ─── Seed the internships page with the default layout ──────────────────
-- ON CONFLICT DO NOTHING so re-running never clobbers admin edits.
INSERT INTO public.page_content (page, section, data) VALUES
('internships', 'hero', jsonb_build_object(
  'eyebrow',   'OUR VERTICALS',
  'title',     'Internships That Build',
  'titleAccent','Real Industry Experience.',
  'body',      'Our internships are carefully designed to simulate real-world working environments. You will contribute to live projects, collaborate with industry mentors, and gain hands-on experience with the latest tools and technologies used by leading software companies.',
  'body2',     'Each program focuses on strengthening your technical expertise, enhancing problem-solving skills, and preparing you for high-impact roles in the IT and technology sectors.',
  'image',     '',
  'primaryCta','Apply for Internship',
  'primaryHref','/contact',
  'secondaryCta','Explore Programs',
  'secondaryHref','#programs'
)),
('internships', 'stats', jsonb_build_object('items', jsonb_build_array(
  jsonb_build_object('value','800+','label','Students Placed'),
  jsonb_build_object('value','50+','label','Hiring Partners'),
  jsonb_build_object('value','85%','label','Placement Success'),
  jsonb_build_object('value','500+','label','Internship Offers'),
  jsonb_build_object('value','24X7','label','Career Support')
))),
('internships', 'programs', jsonb_build_object(
  'eyebrow','OUR PROGRAMS',
  'title','Explore Internship Opportunities',
  'subtitle',''
)),
('internships', 'why', jsonb_build_object(
  'eyebrow','WHY INTERN WITH US?',
  'title','Real Experience. Real Impact.',
  'items', jsonb_build_array(
    jsonb_build_object('icon','users','title','Industry Exposure','body','Work on live projects and understand real-world business challenges.'),
    jsonb_build_object('icon','award','title','Expert Mentorship','body','Learn from experienced professionals and get career guidance.'),
    jsonb_build_object('icon','sparkles','title','Skill Development','body','Enhance technical and soft skills that make you industry-ready.'),
    jsonb_build_object('icon','badge','title','Certificate of Completion','body','Earn a recognized certificate that adds value to your career journey.'),
    jsonb_build_object('icon','trending','title','Pre-Placement Advantage','body','Top performers get fast-track consideration for full-time opportunities.')
  )
)),
('internships', 'journey', jsonb_build_object(
  'eyebrow','HOW IT WORKS',
  'title','Your Internship Journey',
  'items', jsonb_build_array(
    jsonb_build_object('title','Apply Online','body','Fill out the application form and choose your preferred domain.'),
    jsonb_build_object('title','Screening','body','Our team reviews your application and shortlists suitable candidates.'),
    jsonb_build_object('title','Interview Round','body','Selected candidates attend a virtual interview with our experts.'),
    jsonb_build_object('title','Offer & Onboarding','body','Receive your offer letter and complete the onboarding process.'),
    jsonb_build_object('title','Start & Grow','body','Begin your internship and grow with meaningful projects and learning.')
  )
)),
('internships', 'testimonials', jsonb_build_object(
  'eyebrow','FROM OUR INTERNS',
  'title','What Interns Say',
  'items', jsonb_build_array(
    jsonb_build_object('quote','Professional faculty, practical sessions, and strong Full Stack and MEAN Stack training.','name','Kavya S','role','INTERN','rating',5),
    jsonb_build_object('quote','Practical teaching, experienced trainers, affordable fees and individual attention.','name','Sai Santhosh','role','INTERN','rating',5),
    jsonb_build_object('quote','Patient and knowledgeable instructors with practical focus.','name','Pilla Papa','role','INTERN','rating',5)
  )
)),
('internships', 'cta', jsonb_build_object(
  'title','Ready to Kickstart Your Career?',
  'body','Apply for an internship today and take the first step towards a successful future.',
  'primaryCta','Apply Now',
  'primaryHref','/contact',
  'secondaryCta','Contact Us',
  'secondaryHref','/contact'
))
ON CONFLICT (page, section) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- 3. CALENDAR EVENT VISIBILITY — harden the role lookup
-- ═══════════════════════════════════════════════════════════════════════
-- The previous policy inlined `(SELECT role FROM profiles WHERE id = auth.uid())`.
-- A subquery inside a policy is itself subject to RLS on `profiles`, so if a
-- profiles policy ever fails to expose the caller's own row the subquery yields
-- NULL and every targeted event silently disappears. A SECURITY DEFINER helper
-- reads the role with RLS bypassed, which makes visibility deterministic.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.current_user_role() FROM public;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, anon;

DROP POLICY IF EXISTS "Users can view relevant events" ON public.calendar_events;
CREATE POLICY "Users can view relevant events"
  ON public.calendar_events FOR SELECT
  USING (
    target_roles IS NULL
    OR target_roles = '{}'
    OR public.current_user_role() = ANY(target_roles)
    OR created_by = auth.uid()
    OR public.is_admin()
  );

-- Same reasoning for announcements, which use the identical targeting scheme.
DROP POLICY IF EXISTS "Users can view relevant announcements" ON public.announcements;
CREATE POLICY "Users can view relevant announcements"
  ON public.announcements FOR SELECT
  USING (
    target_roles IS NULL
    OR target_roles = '{}'
    OR public.current_user_role() = ANY(target_roles)
    OR created_by = auth.uid()
    OR public.is_admin()
  );

NOTIFY pgrst, 'reload schema';
