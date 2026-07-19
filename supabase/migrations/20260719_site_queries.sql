-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  site_queries — contact form + footer newsletter submissions          ║
-- ║                                                                       ║
-- ║  The contact form (src/app/contact) and admin queries page            ║
-- ║  (src/app/dashboard/admin/queries) already reference this table, but  ║
-- ║  it was never migrated — inserts failed with                          ║
-- ║  "Could not find the table 'public.site_queries' in the schema cache".║
-- ╚══════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.site_queries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  service text,
  source text DEFAULT 'contact_page',  -- 'contact_page' or 'footer_newsletter'
  status text DEFAULT 'new',           -- new, contacted, closed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_queries ENABLE ROW LEVEL SECURITY;

-- Public visitors (anon) may submit queries.
DROP POLICY IF EXISTS "Anyone can insert site queries" ON public.site_queries;
CREATE POLICY "Anyone can insert site queries"
  ON public.site_queries FOR INSERT WITH CHECK (true);

-- Only admins can read submissions.
DROP POLICY IF EXISTS "Admins can read all site queries" ON public.site_queries;
CREATE POLICY "Admins can read all site queries"
  ON public.site_queries FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Only admins can update (change status).
DROP POLICY IF EXISTS "Admins can update site queries" ON public.site_queries;
CREATE POLICY "Admins can update site queries"
  ON public.site_queries FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Only admins can delete.
DROP POLICY IF EXISTS "Admins can delete site queries" ON public.site_queries;
CREATE POLICY "Admins can delete site queries"
  ON public.site_queries FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_site_queries_created ON public.site_queries(created_at DESC);

NOTIFY pgrst, 'reload schema';
