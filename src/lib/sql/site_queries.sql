CREATE TABLE site_queries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  service text,
  source text DEFAULT 'contact_page',  -- 'contact_page' or 'footer_newsletter'
  status text DEFAULT 'new',  -- new, contacted, closed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE site_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read all site queries" ON site_queries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Anyone can insert site queries" ON site_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update site queries" ON site_queries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
