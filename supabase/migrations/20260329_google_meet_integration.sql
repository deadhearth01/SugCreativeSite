-- ═══════════════════════════════════════════════════════════════
-- Google Meet Integration - Add columns for Google tokens and Meet info
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Add Google OAuth tokens to profiles for Meet integration
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMPTZ;

-- Add Google Meet specific fields to meetings table
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS google_meet_space_name TEXT,
ADD COLUMN IF NOT EXISTS google_meet_code TEXT,
ADD COLUMN IF NOT EXISTS is_google_meet BOOLEAN DEFAULT false;

-- Index for Google Meet lookups
CREATE INDEX IF NOT EXISTS idx_meetings_google_meet ON meetings(google_meet_code) WHERE google_meet_code IS NOT NULL;

-- Function to store Google tokens for a user
CREATE OR REPLACE FUNCTION store_google_tokens(
  p_user_id UUID,
  p_access_token TEXT,
  p_refresh_token TEXT,
  p_expires_in INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET 
    google_access_token = p_access_token,
    google_refresh_token = COALESCE(p_refresh_token, google_refresh_token),
    google_token_expires_at = now() + (p_expires_in || ' seconds')::INTERVAL,
    updated_at = now()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has valid Google tokens
CREATE OR REPLACE FUNCTION has_valid_google_token(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expires_at TIMESTAMPTZ;
BEGIN
  SELECT google_token_expires_at INTO expires_at
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN expires_at IS NOT NULL AND expires_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- Done! Run this migration in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════
