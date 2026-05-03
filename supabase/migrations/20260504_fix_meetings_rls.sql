-- Fix: "infinite recursion detected in policy for relation 'meetings'"
--
-- Root cause: meetings.SELECT references meeting_participants, and
-- meeting_participants.{ALL,SELECT} references meetings — circular evaluation.
--
-- Fix: replace the cross-table subqueries with SECURITY DEFINER helper
-- functions that bypass RLS internally so policy evaluation never recurses.

-- ─── Helper: is current user the organizer of <meeting_id>? ────────────────
CREATE OR REPLACE FUNCTION is_meeting_organizer(meeting_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM meetings
    WHERE id = meeting_id_param
      AND organizer_id = auth.uid()
  )
$$;

-- ─── Helper: is current user a participant in <meeting_id>? ────────────────
CREATE OR REPLACE FUNCTION is_meeting_participant(meeting_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM meeting_participants
    WHERE meeting_id = meeting_id_param
      AND user_id = auth.uid()
  )
$$;

-- ─── Drop the recursive policies ───────────────────────────────────────────
DROP POLICY IF EXISTS "Participants can view meetings" ON meetings;
DROP POLICY IF EXISTS "Admins and organizers can manage meetings" ON meetings;
DROP POLICY IF EXISTS "Users can see their participations" ON meeting_participants;
DROP POLICY IF EXISTS "Organizers can manage participants" ON meeting_participants;

-- ─── Rebuild meetings policies ─────────────────────────────────────────────
CREATE POLICY "meetings_select" ON meetings
  FOR SELECT
  USING (
    organizer_id = auth.uid()
    OR is_admin()
    OR is_meeting_participant(id)
  );

CREATE POLICY "meetings_modify" ON meetings
  FOR ALL
  USING (organizer_id = auth.uid() OR is_admin())
  WITH CHECK (organizer_id = auth.uid() OR is_admin());

-- ─── Rebuild meeting_participants policies ─────────────────────────────────
CREATE POLICY "meeting_participants_select" ON meeting_participants
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_admin()
    OR is_meeting_organizer(meeting_id)
  );

CREATE POLICY "meeting_participants_modify" ON meeting_participants
  FOR ALL
  USING (is_admin() OR is_meeting_organizer(meeting_id))
  WITH CHECK (is_admin() OR is_meeting_organizer(meeting_id));
