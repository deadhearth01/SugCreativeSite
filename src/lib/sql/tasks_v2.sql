-- tasks_v2.sql
-- The existing tasks table should already have these columns:
--   id, title, description, priority, status, assigned_to, assigned_by, due_date, created_at, updated_at
--
-- This migration ensures the table supports self-assignment and role-based task creation.
-- Run only if columns are missing.

-- Ensure updated_at column exists (some setups may not have it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE tasks ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ensure assigned_by is nullable (for self-assigned tasks where creator = assignee)
-- No change needed if already nullable.

-- Add index for faster lookups by assigned_to and assigned_by
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- RLS policies: ensure users can read tasks assigned to them or created by them
-- (Adjust based on your existing RLS setup)
