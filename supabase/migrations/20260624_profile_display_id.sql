-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Structured, role-based human IDs for profiles                       ║
-- ║                                                                       ║
-- ║  Adds profiles.display_id (e.g. EMP000123, INT000045, STU001002,      ║
-- ║  MEN000007, CLI000019, SUG-ADM007). Assigned automatically on insert  ║
-- ║  via a BEFORE INSERT trigger, backfilled for existing rows. IDs are   ║
-- ║  stable: a later role change does NOT renumber an existing profile.   ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ─── 1. Column ──────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_id TEXT;

-- ─── 2. Per-prefix counter table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_id_counters (
  prefix     TEXT PRIMARY KEY,
  last_value INTEGER NOT NULL DEFAULT 0
);

-- ─── 3. Role → (prefix, zero-pad width) and next-id generator ───────────────
CREATE OR REPLACE FUNCTION public.role_id_prefix(p_role public.user_role)
RETURNS TEXT AS $$
  SELECT CASE p_role
    WHEN 'employee' THEN 'EMP'
    WHEN 'intern'   THEN 'INT'
    WHEN 'student'  THEN 'STU'
    WHEN 'mentor'   THEN 'MEN'
    WHEN 'client'   THEN 'CLI'
    WHEN 'admin'    THEN 'SUG-ADM'
    ELSE 'USR'
  END;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.role_id_width(p_role public.user_role)
RETURNS INTEGER AS $$
  SELECT CASE p_role WHEN 'admin' THEN 3 ELSE 6 END;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.next_display_id(p_role public.user_role)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT := public.role_id_prefix(p_role);
  v_width  INTEGER := public.role_id_width(p_role);
  v_next   INTEGER;
BEGIN
  INSERT INTO public.profile_id_counters (prefix, last_value)
  VALUES (v_prefix, 1)
  ON CONFLICT (prefix) DO UPDATE
    SET last_value = public.profile_id_counters.last_value + 1
  RETURNING last_value INTO v_next;

  RETURN v_prefix || lpad(v_next::text, v_width, '0');
END;
$$ LANGUAGE plpgsql;

-- ─── 4. Assign on insert when not provided ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.assign_profile_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL OR TRIM(NEW.display_id) = '' THEN
    NEW.display_id := public.next_display_id(COALESCE(NEW.role, 'student'::public.user_role));
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block profile creation on ID assignment.
  RAISE WARNING 'display_id assignment failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_profile_display_id ON public.profiles;
CREATE TRIGGER trg_assign_profile_display_id
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_profile_display_id();

-- ─── 5. Backfill existing rows (oldest first, stable numbering) ──────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, role FROM public.profiles
    WHERE display_id IS NULL OR TRIM(display_id) = ''
    ORDER BY created_at ASC, id ASC
  LOOP
    UPDATE public.profiles
      SET display_id = public.next_display_id(COALESCE(r.role, 'student'::public.user_role))
      WHERE id = r.id;
  END LOOP;
END $$;

-- ─── 6. Uniqueness + lookup index ───────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_display_id
  ON public.profiles(display_id)
  WHERE display_id IS NOT NULL;

-- Refresh PostgREST schema cache.
NOTIFY pgrst, 'reload schema';
