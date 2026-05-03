-- Add address column to profiles for onboarding flow
-- Admin only collects email/role/tags/password; user fills name/phone/address/username on first login.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS address TEXT;

-- Allow full_name to be empty during admin-create flow (filled at onboarding)
ALTER TABLE profiles
ALTER COLUMN full_name DROP NOT NULL;

-- Update signup trigger so full_name is NULL when no metadata supplied
-- (admin bulk/quick create deliberately leaves full_name empty for the user to fill at onboarding)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')), ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
