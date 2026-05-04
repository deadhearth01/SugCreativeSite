-- Project updates feed: admin posts status updates → client sees them live.
-- Also adds a `comments` column to projects for internal admin notes.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS comments TEXT;

CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT,
  body TEXT NOT NULL,
  progress_at_post INTEGER CHECK (progress_at_post >= 0 AND progress_at_post <= 100),
  status_at_post project_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_updates_project ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_created ON project_updates(created_at DESC);

ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- Admin/employee can manage all updates
DROP POLICY IF EXISTS project_updates_admin_all ON project_updates;
CREATE POLICY project_updates_admin_all ON project_updates
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'employee')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'employee')
  ));

-- Client can read updates for their own projects
DROP POLICY IF EXISTS project_updates_client_read ON project_updates;
CREATE POLICY project_updates_client_read ON project_updates
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects pr
    WHERE pr.id = project_updates.project_id AND pr.client_id = auth.uid()
  ));
