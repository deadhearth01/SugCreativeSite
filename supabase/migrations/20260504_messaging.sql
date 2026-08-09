-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  SUG CREATIVE — Internal Messaging                                   ║
-- ║                                                                       ║
-- ║  WhatsApp-style chat for the dashboard. Everyone gets default        ║
-- ║  role-based groups (Mentors, Employees, Interns, Students). Admin    ║
-- ║  can create custom groups. DMs are role-pair restricted.             ║
-- ╚══════════════════════════════════════════════════════════════════════╝

CREATE TYPE chat_type AS ENUM ('direct', 'role_group', 'custom_group');

-- ─── 1. Tables ────────────────────────────────────────────────────────────
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type chat_type NOT NULL,
  name TEXT,                                  -- null for direct chats
  description TEXT,
  role_key user_role,                         -- only set for type='role_group'
  avatar_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chats_type ON chats(type);
CREATE UNIQUE INDEX idx_chats_role_key_unique ON chats(role_key) WHERE role_key IS NOT NULL;

CREATE TABLE chat_members (
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_group_admin BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (chat_id, user_id)
);

CREATE INDEX idx_chat_members_user ON chat_members(user_id);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CHECK (body IS NOT NULL OR image_url IS NOT NULL)
);

CREATE INDEX idx_chat_messages_chat_created ON chat_messages(chat_id, created_at DESC);

-- Bump chat.updated_at on new message so chat list can sort by recency
CREATE OR REPLACE FUNCTION bump_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats SET updated_at = now() WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_chat_messages_bump_chat
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION bump_chat_updated_at();

-- ─── 2. Helpers (SECURITY DEFINER — break RLS recursion) ─────────────────
CREATE OR REPLACE FUNCTION is_chat_member(chat_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_members
    WHERE chat_id = chat_id_param AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION is_chat_group_admin(chat_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_members
    WHERE chat_id = chat_id_param
      AND user_id = auth.uid()
      AND is_group_admin = true
  )
$$;

-- ─── 3. RLS ───────────────────────────────────────────────────────────────
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- chats
DROP POLICY IF EXISTS chats_select ON chats;
CREATE POLICY chats_select ON chats FOR SELECT
  USING (is_admin() OR is_chat_member(id));

DROP POLICY IF EXISTS chats_insert ON chats;
CREATE POLICY chats_insert ON chats FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      is_admin()
      -- non-admins can only create direct chats; custom_group is admin-only;
      -- role_group is seed-only
      OR (type = 'direct' AND created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS chats_update ON chats;
CREATE POLICY chats_update ON chats FOR UPDATE
  USING (is_admin() OR is_chat_group_admin(id) OR created_by = auth.uid())
  WITH CHECK (is_admin() OR is_chat_group_admin(id) OR created_by = auth.uid());

DROP POLICY IF EXISTS chats_delete ON chats;
CREATE POLICY chats_delete ON chats FOR DELETE
  USING (is_admin());

-- chat_members
DROP POLICY IF EXISTS chat_members_select ON chat_members;
CREATE POLICY chat_members_select ON chat_members FOR SELECT
  USING (
    is_admin()
    OR user_id = auth.uid()
    OR is_chat_member(chat_id)  -- members can see other members of the same chat
  );

DROP POLICY IF EXISTS chat_members_insert ON chat_members;
CREATE POLICY chat_members_insert ON chat_members FOR INSERT
  WITH CHECK (
    is_admin()
    OR is_chat_group_admin(chat_id)
    OR user_id = auth.uid()  -- self-join (used when creating a direct chat)
  );

DROP POLICY IF EXISTS chat_members_update ON chat_members;
CREATE POLICY chat_members_update ON chat_members FOR UPDATE
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS chat_members_delete ON chat_members;
CREATE POLICY chat_members_delete ON chat_members FOR DELETE
  USING (is_admin() OR is_chat_group_admin(chat_id) OR user_id = auth.uid());

-- chat_messages
DROP POLICY IF EXISTS chat_messages_select ON chat_messages;
CREATE POLICY chat_messages_select ON chat_messages FOR SELECT
  USING (is_admin() OR is_chat_member(chat_id));

DROP POLICY IF EXISTS chat_messages_insert ON chat_messages;
CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND is_chat_member(chat_id)
  );

DROP POLICY IF EXISTS chat_messages_update ON chat_messages;
CREATE POLICY chat_messages_update ON chat_messages FOR UPDATE
  USING (sender_id = auth.uid() OR is_admin())
  WITH CHECK (sender_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS chat_messages_delete ON chat_messages;
CREATE POLICY chat_messages_delete ON chat_messages FOR DELETE
  USING (sender_id = auth.uid() OR is_admin());

-- ─── 4. Seed default role-based groups ───────────────────────────────────
-- Per spec: Mentors, Employees, Interns, Students. No Clients group, no "All".
INSERT INTO chats (type, name, role_key, description)
VALUES
  ('role_group', 'Mentors',   'mentor',   'Default group for all mentors'),
  ('role_group', 'Employees', 'employee', 'Default group for all employees'),
  ('role_group', 'Interns',   'intern',   'Default group for all interns'),
  ('role_group', 'Students',  'student',  'Default group for all students')
ON CONFLICT DO NOTHING;

-- Populate role groups with current users (each role + admins as group_admins)
INSERT INTO chat_members (chat_id, user_id, is_group_admin)
SELECT c.id, p.id, (p.role = 'admin')
FROM chats c
JOIN profiles p ON (p.role = c.role_key OR p.role = 'admin')
WHERE c.type = 'role_group'
ON CONFLICT DO NOTHING;

-- ─── 5. Trigger: keep role-group memberships in sync with profile.role ───
CREATE OR REPLACE FUNCTION sync_role_group_memberships()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role = OLD.role THEN
    RETURN NEW;
  END IF;

  -- Admin belongs to every role_group; others only to their own.
  IF NEW.role <> 'admin' THEN
    DELETE FROM chat_members
    WHERE user_id = NEW.id
      AND chat_id IN (
        SELECT id FROM chats
        WHERE type = 'role_group' AND role_key <> NEW.role
      );
  END IF;

  INSERT INTO chat_members (chat_id, user_id, is_group_admin)
  SELECT c.id, NEW.id, (NEW.role = 'admin')
  FROM chats c
  WHERE c.type = 'role_group'
    AND (c.role_key = NEW.role OR NEW.role = 'admin')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_profiles_sync_role_groups ON profiles;
CREATE TRIGGER trg_profiles_sync_role_groups
AFTER INSERT OR UPDATE OF role ON profiles
FOR EACH ROW EXECUTE FUNCTION sync_role_group_memberships();

-- ─── 6. Realtime: enable for chat_messages so the UI can subscribe ────────
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ─── 7. Storage bucket for image attachments ─────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT DO NOTHING;

-- Anyone authenticated can upload to chat-images; reads are public-by-URL
-- (we use UUID-hashed paths so URLs are not guessable). Acceptable for
-- internal-team image attachments; switch to signed URLs if external clients
-- start sharing sensitive material.
DROP POLICY IF EXISTS "chat_images_upload" ON storage.objects;
CREATE POLICY "chat_images_upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "chat_images_select" ON storage.objects;
CREATE POLICY "chat_images_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "chat_images_delete" ON storage.objects;
CREATE POLICY "chat_images_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'chat-images' AND owner = auth.uid());
