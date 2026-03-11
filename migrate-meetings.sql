-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: Fix meetings table to match application code
-- Run this in Supabase SQL Editor ONCE
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Drop dependent objects first
DROP TABLE IF EXISTS meeting_participants CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TYPE IF EXISTS meeting_type CASCADE;
DROP TYPE IF EXISTS meeting_status CASCADE;

-- Step 2: Recreate enums with correct values
CREATE TYPE meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE meeting_type AS ENUM ('general', 'mentoring', 'interview', 'review', 'standup');

-- Step 3: Recreate meetings table with correct columns
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  meeting_type meeting_type NOT NULL DEFAULT 'general',
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meeting_link TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status meeting_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meetings_organizer ON meetings(organizer_id);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);
CREATE INDEX idx_meetings_status ON meetings(status);

-- Step 4: Recreate meeting_participants with status column
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'invited',
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  UNIQUE(meeting_id, user_id)
);

CREATE INDEX idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user ON meeting_participants(user_id);

-- Step 5: Re-enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- Step 6: Recreate RLS policies for meetings
CREATE POLICY "Participants can view meetings"
  ON meetings FOR SELECT
  USING (
    organizer_id = auth.uid()
    OR id IN (SELECT meeting_id FROM meeting_participants WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Admins and organizers can manage meetings"
  ON meetings FOR ALL
  USING (organizer_id = auth.uid() OR is_admin());

-- Step 7: Recreate RLS policies for meeting_participants
CREATE POLICY "Users can see their participations"
  ON meeting_participants FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Organizers can manage participants"
  ON meeting_participants FOR ALL
  USING (is_admin() OR meeting_id IN (SELECT id FROM meetings WHERE organizer_id = auth.uid()));

-- Step 8: Recreate updated_at trigger for meetings
CREATE TRIGGER set_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
