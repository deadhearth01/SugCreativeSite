-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Course tags — persistence + auto-suggest                            ║
-- ║                                                                       ║
-- ║  Adds courses.tags (TEXT[]) and a global course_tags catalogue with   ║
-- ║  usage counts so the admin editor can recommend previously-used tags. ║
-- ║  A trigger keeps the catalogue in sync whenever a course is saved.    ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ─── 1. Per-course tags array ───────────────────────────────────────────────
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_courses_tags ON public.courses USING GIN (tags);

-- ─── 2. Global tag catalogue (for auto-suggest / recommendations) ───────────
CREATE TABLE IF NOT EXISTS public.course_tags (
  tag         TEXT PRIMARY KEY,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_tags_usage ON public.course_tags(usage_count DESC);

-- ─── 3. Keep the catalogue in sync on course insert/update ──────────────────
CREATE OR REPLACE FUNCTION public.sync_course_tags()
RETURNS TRIGGER AS $$
DECLARE
  t TEXT;
BEGIN
  IF NEW.tags IS NOT NULL THEN
    FOREACH t IN ARRAY NEW.tags LOOP
      t := lower(trim(t));
      CONTINUE WHEN t = '';
      INSERT INTO public.course_tags (tag, usage_count)
      VALUES (t, 1)
      ON CONFLICT (tag) DO UPDATE
        SET usage_count = public.course_tags.usage_count + 1;
    END LOOP;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'sync_course_tags failed for course %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_course_tags ON public.courses;
CREATE TRIGGER trg_sync_course_tags
  AFTER INSERT OR UPDATE OF tags ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.sync_course_tags();

-- ─── 4. RLS: catalogue readable by anyone, writable via trigger only ────────
ALTER TABLE public.course_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "course_tags readable by all" ON public.course_tags;
CREATE POLICY "course_tags readable by all"
  ON public.course_tags FOR SELECT
  USING (true);

-- ─── 5. Seed the catalogue from any existing tech_stack values ──────────────
INSERT INTO public.course_tags (tag, usage_count)
SELECT lower(trim(t)) AS tag, count(*)
FROM public.courses, unnest(coalesce(tech_stack, '{}')) AS t
WHERE trim(t) <> ''
GROUP BY lower(trim(t))
ON CONFLICT (tag) DO NOTHING;

NOTIFY pgrst, 'reload schema';
