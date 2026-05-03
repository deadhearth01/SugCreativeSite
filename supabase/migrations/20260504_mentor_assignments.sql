-- Mentor → mentee mapping (admin assigns interns/students to mentors)
-- A mentee (intern or student) can have at most one active mentor at a time;
-- a mentor can have many mentees.

CREATE TABLE IF NOT EXISTS mentor_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  CONSTRAINT mentor_assignments_unique_mentee UNIQUE (mentee_id),
  CONSTRAINT mentor_assignments_no_self CHECK (mentor_id <> mentee_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor ON mentor_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentee ON mentor_assignments(mentee_id);

ALTER TABLE mentor_assignments ENABLE ROW LEVEL SECURITY;

-- Admins manage everything
DROP POLICY IF EXISTS mentor_assignments_admin_all ON mentor_assignments;
CREATE POLICY mentor_assignments_admin_all ON mentor_assignments
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Mentors and mentees can read rows that involve them
DROP POLICY IF EXISTS mentor_assignments_self_read ON mentor_assignments;
CREATE POLICY mentor_assignments_self_read ON mentor_assignments
  FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);
