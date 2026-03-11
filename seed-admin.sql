-- ═══════════════════════════════════════════════════════════════
-- SEED ADMIN USER — Run this AFTER supabase-schema.sql
--
-- This script:
--   1. Cleans up any broken raw-inserted admin user
--   2. Creates admin via auth.users with ALL required columns
--   3. Updates the auto-created profile to role = admin
--
-- Admin Login:
--   Email:    sugcreative.dev@gmail.com
--   Password: Admin@SUG2026!
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Clean up any previously broken admin user + dependent rows
DO $$
DECLARE
  old_uid UUID;
BEGIN
  SELECT id INTO old_uid FROM auth.users WHERE email = 'sugcreative.dev@gmail.com';
  IF old_uid IS NOT NULL THEN
    DELETE FROM calendar_events WHERE created_by = old_uid;
    DELETE FROM announcements WHERE created_by = old_uid;
    DELETE FROM profiles WHERE id = old_uid;
    DELETE FROM auth.identities WHERE user_id = old_uid;
    DELETE FROM auth.users WHERE id = old_uid;
  END IF;
END $$;

-- Step 2: Create admin user with ALL required GoTrue fields
DO $$
DECLARE
  admin_uid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    is_sso_user,
    created_at,
    updated_at
  ) VALUES (
    admin_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'sugcreative.dev@gmail.com',
    crypt('Admin@SUG2026!', gen_salt('bf')),
    now(),          -- email_confirmed_at (confirmed immediately)
    NULL,           -- invited_at
    '',             -- confirmation_token
    NULL,           -- confirmation_sent_at
    '',             -- recovery_token
    NULL,           -- recovery_sent_at
    '',             -- email_change_token_new
    '',             -- email_change
    NULL,           -- email_change_sent_at
    now(),          -- last_sign_in_at
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object(
      'full_name', 'SUG Creative Admin',
      'role', 'admin',
      'email', 'sugcreative.dev@gmail.com',
      'email_verified', true,
      'phone_verified', false,
      'sub', admin_uid::text
    ),
    false,          -- is_super_admin
    false,          -- is_sso_user
    now(),
    now()
  );

  -- Step 3: Create identity record (required for email/password login)
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    admin_uid,
    admin_uid,
    admin_uid::text,
    'email',
    jsonb_build_object(
      'sub', admin_uid::text,
      'email', 'sugcreative.dev@gmail.com',
      'email_verified', true,
      'phone_verified', false
    ),
    now(),
    now(),
    now()
  );

  -- Step 4: Update the auto-created profile to admin role
  -- (The handle_new_user trigger already created the profile row)
  UPDATE profiles
  SET role = 'admin', status = 'active', full_name = 'SUG Creative Admin'
  WHERE id = admin_uid;

  RAISE NOTICE 'Admin user created successfully with ID: %', admin_uid;
END $$;
