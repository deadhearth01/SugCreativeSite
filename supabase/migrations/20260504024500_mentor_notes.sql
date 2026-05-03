-- Mentor notes sent by mentors to their assigned students/interns.

CREATE TABLE IF NOT EXISTS mentor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT mentor_notes_no_self CHECK (mentor_id <> mentee_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_notes_mentor ON mentor_notes(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_notes_mentee ON mentor_notes(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_notes_created_at ON mentor_notes(created_at DESC);

ALTER TABLE mentor_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mentor_notes_admin_all ON mentor_notes;
CREATE POLICY mentor_notes_admin_all ON mentor_notes
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS mentor_notes_select_involved ON mentor_notes;
CREATE POLICY mentor_notes_select_involved ON mentor_notes
  FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id OR is_admin());

DROP POLICY IF EXISTS mentor_notes_insert_assigned_mentor ON mentor_notes;
CREATE POLICY mentor_notes_insert_assigned_mentor ON mentor_notes
  FOR INSERT
  WITH CHECK (
    auth.uid() = mentor_id
    AND EXISTS (
      SELECT 1
      FROM mentor_assignments ma
      WHERE ma.mentor_id = auth.uid()
        AND ma.mentee_id = mentor_notes.mentee_id
    )
  );

DROP POLICY IF EXISTS mentor_notes_update_read_state ON mentor_notes;
CREATE POLICY mentor_notes_update_read_state ON mentor_notes
  FOR UPDATE
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id OR is_admin())
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id OR is_admin());
