-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Payroll — salaries / stipends + payslips                            ║
-- ║                                                                       ║
-- ║  Admin assigns a monthly salary (employees) or stipend (interns/      ║
-- ║  students) on the profile. Payslips are generated from that base plus ║
-- ║  default deductions (PF / tax) configured in payroll_settings.        ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ─── 1. Pay fields on profiles ──────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE pay_type AS ENUM ('salary', 'stipend');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS monthly_pay NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS pay_type pay_type;

-- ─── 2. Company-wide payroll defaults (single row, id = TRUE) ───────────────
CREATE TABLE IF NOT EXISTS public.payroll_settings (
  id              BOOLEAN PRIMARY KEY DEFAULT TRUE,
  company_name    TEXT NOT NULL DEFAULT 'SUG Creative',
  pf_percent      NUMERIC(5,2) NOT NULL DEFAULT 0,     -- % of gross
  tax_percent     NUMERIC(5,2) NOT NULL DEFAULT 0,     -- TDS % of gross
  professional_tax NUMERIC(10,2) NOT NULL DEFAULT 0,   -- flat amount
  pf_account_no   TEXT,
  tax_account_no  TEXT,
  extra           JSONB NOT NULL DEFAULT '{}',         -- company-specific fields
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payroll_settings_singleton CHECK (id = TRUE)
);

INSERT INTO public.payroll_settings (id) VALUES (TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── 3. Payslips ────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE payslip_status AS ENUM ('draft', 'issued', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.payslips (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payslip_no      TEXT NOT NULL UNIQUE,                -- e.g. PS-2026-06-EMP000123
  recipient_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_name  TEXT NOT NULL,
  recipient_email TEXT,
  display_id      TEXT,                                -- snapshot of profile.display_id
  pay_type        pay_type NOT NULL DEFAULT 'salary',
  period_month    INTEGER NOT NULL,                    -- 1-12
  period_year     INTEGER NOT NULL,
  earnings        JSONB NOT NULL DEFAULT '{}',         -- {basic, hra, allowances, ...}
  deductions      JSONB NOT NULL DEFAULT '{}',         -- {pf, tax, professional_tax, ...}
  gross           NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  net             NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'INR',
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',
  status          payslip_status NOT NULL DEFAULT 'issued',
  pdf_url         TEXT,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (recipient_id, period_month, period_year)     -- one payslip per person/month
);

CREATE INDEX IF NOT EXISTS idx_payslips_recipient ON public.payslips(recipient_id);
CREATE INDEX IF NOT EXISTS idx_payslips_period ON public.payslips(period_year, period_month);

-- updated_at trigger (uses the project's existing update_updated_at()).
DROP TRIGGER IF EXISTS set_payslips_updated_at ON public.payslips;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
    CREATE TRIGGER set_payslips_updated_at
      BEFORE UPDATE ON public.payslips
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- ─── 4. RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payslips admin all" ON public.payslips;
CREATE POLICY "payslips admin all"
  ON public.payslips FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "payslips read own" ON public.payslips;
CREATE POLICY "payslips read own"
  ON public.payslips FOR SELECT
  USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "payroll_settings admin all" ON public.payroll_settings;
CREATE POLICY "payroll_settings admin all"
  ON public.payroll_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

NOTIFY pgrst, 'reload schema';
