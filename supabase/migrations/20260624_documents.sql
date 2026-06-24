-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Documents — Certificates & Offer Letters                            ║
-- ║                                                                       ║
-- ║  Admin-generated certificates (Appreciation / Completion /            ║
-- ║  Internship / Excellence) and offer letters. Each row stores the      ║
-- ║  rendered content + a public, human-readable document_id used for     ║
-- ║  verification (e.g. SUGYCGC2025CE02RD05, SUGNFSIN05HR12RH24).         ║
-- ╚══════════════════════════════════════════════════════════════════════╝

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM ('certificate', 'offer_letter');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('draft', 'issued', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     TEXT NOT NULL UNIQUE,                 -- public verification id
  type            document_type NOT NULL,
  -- For certificates: 'appreciation' | 'completion' | 'internship' | 'excellence'
  -- For offer letters: 'offer' (or a role/department label)
  sub_type        TEXT,
  title           TEXT NOT NULL,                        -- e.g. "Certificate of Completion"

  -- Recipient: either an internal dashboard user (recipient_profile_id set) or
  -- an external person (free-text fields).
  recipient_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_name  TEXT NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,

  -- Document content + presentation.
  body            TEXT,                                 -- main editable copy
  fields          JSONB NOT NULL DEFAULT '{}',          -- type-specific extras
                                                        -- (role_title, salary,
                                                        --  joining_date, quote, etc.)
  signature_data  TEXT,                                 -- data-URL of drawn signature
  signature_name  TEXT,                                 -- printed signer name
  signature_title TEXT,                                 -- signer designation
  pdf_url         TEXT,                                 -- stored PDF (optional)

  status          document_status NOT NULL DEFAULT 'issued',
  issued_on       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_document_id ON public.documents(document_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_recipient ON public.documents(recipient_profile_id);

-- updated_at maintenance (reuses the project's set_updated_at if present).
DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    CREATE TRIGGER trg_documents_updated_at
      BEFORE UPDATE ON public.documents
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Admins manage everything.
DROP POLICY IF EXISTS "documents admin all" ON public.documents;
CREATE POLICY "documents admin all"
  ON public.documents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Recipients can read their own issued documents.
DROP POLICY IF EXISTS "documents read own" ON public.documents;
CREATE POLICY "documents read own"
  ON public.documents FOR SELECT
  USING (recipient_profile_id = auth.uid());

-- Note: public verification (by document_id, unauthenticated) is served through
-- a server route using the service-role key, not via an RLS policy, so we don't
-- expose a blanket public SELECT here.

NOTIFY pgrst, 'reload schema';
