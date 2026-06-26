-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Harden profile_id_counters — enable RLS (Supabase lint fix)         ║
-- ║                                                                       ║
-- ║  profile_id_counters is an internal counter table (one row per role   ║
-- ║  prefix) used only by next_display_id() during profile inserts. It is ║
-- ║  in the `public` schema, so PostgREST exposes it — the linter flags   ║
-- ║  it as "RLS Disabled in Public".                                      ║
-- ║                                                                       ║
-- ║  Fix: enable RLS with NO policies (denies all API/anon/authenticated  ║
-- ║  access), and make next_display_id() SECURITY DEFINER so the trigger  ║
-- ║  path can still increment the counter regardless of the caller's role.║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- 1. Enable RLS. With no policies, anon/authenticated get zero access via the
--    API. The table owner (postgres) and service_role (bypassrls) are unaffected.
ALTER TABLE public.profile_id_counters ENABLE ROW LEVEL SECURITY;

-- Revoke any direct table grants from the API roles for good measure.
REVOKE ALL ON public.profile_id_counters FROM anon, authenticated;

-- 2. next_display_id() must keep working when a profile insert is triggered by a
--    non-privileged path. SECURITY DEFINER runs it as the function owner
--    (table owner), which bypasses RLS for the counter upsert. Pin search_path.
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

NOTIFY pgrst, 'reload schema';
