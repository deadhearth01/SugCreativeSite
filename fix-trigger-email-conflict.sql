-- ═══════════════════════════════════════════════════════════════
-- FIX: Update trigger to handle email conflicts and add error handling
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Replace the function with improved error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any orphaned profile with the same email (different id)
  -- This handles edge cases where profile exists but auth user was deleted
  DELETE FROM public.profiles WHERE email = NEW.email AND id != NEW.id;

  -- Insert or update the profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'role', '')::user_role,
      'student'::user_role
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log the error but DON'T fail the user creation
  -- The profile can be created manually later via the API
  RAISE WARNING 'Profile trigger error for user %: % (SQLSTATE: %)',
    NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 4: Verify the trigger exists
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Step 5: Clean up any orphaned profiles (profiles without auth users)
-- This is safe because of the foreign key ON DELETE CASCADE
-- But let's check for any that might exist due to bugs
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  -- Count orphaned profiles (shouldn't exist due to FK, but just in case)
  SELECT COUNT(*) INTO orphan_count
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = p.id
  );

  IF orphan_count > 0 THEN
    RAISE NOTICE 'Found % orphaned profiles. These will be cleaned up.', orphan_count;
    DELETE FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users u WHERE u.id = p.id
    );
  ELSE
    RAISE NOTICE 'No orphaned profiles found.';
  END IF;
END $$;
