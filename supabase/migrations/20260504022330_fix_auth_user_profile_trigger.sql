-- Fix admin-created Supabase Auth users failing with:
-- "Database error creating new user" / "unexpected_failure".
--
-- The auth.users trigger must never block Auth user creation. Profile creation
-- can be repaired by the API route after the auth user exists.

ALTER TABLE public.profiles
ALTER COLUMN full_name DROP NOT NULL;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  role_text TEXT;
  profile_role public.user_role;
  profile_full_name TEXT;
BEGIN
  role_text := lower(NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'role', '')), ''));
  profile_role := CASE
    WHEN role_text IN ('admin', 'student', 'client', 'mentor', 'employee', 'intern')
      THEN role_text::public.user_role
    ELSE 'student'::public.user_role
  END;

  profile_full_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')), '');

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    profile_full_name,
    profile_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = EXCLUDED.role;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Profile trigger error for auth user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
