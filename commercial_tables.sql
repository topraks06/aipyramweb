-- ============================================================================
-- AIPYRAM v3.0 — COMMERCIAL INFRASTRUCTURE
-- Sponsor Applications, Lead Pipeline, Revenue Tracking
-- Run this AFTER the base app.sql migration
-- ============================================================================

-- ── 1. SPONSOR APPLICATIONS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sponsor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    package TEXT NOT NULL CHECK (package IN ('exhibitor', 'strategic_partner', 'enterprise')),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    source TEXT DEFAULT 'form' CHECK (source IN ('whatsapp', 'email', 'form', 'direct')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsor_status ON public.sponsor_applications(status);
CREATE INDEX IF NOT EXISTS idx_sponsor_created ON public.sponsor_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsor_package ON public.sponsor_applications(package);

-- RLS
ALTER TABLE public.sponsor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sponsor applications"
    ON public.sponsor_applications FOR ALL
    USING (is_admin());

CREATE POLICY "Anyone can submit sponsor application"
    ON public.sponsor_applications FOR INSERT
    WITH CHECK (true);

-- Trigger
CREATE TRIGGER update_sponsor_applications_updated_at
    BEFORE UPDATE ON public.sponsor_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── 2. LEADS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    source TEXT DEFAULT 'contact_form' CHECK (source IN ('contact_form', 'sponsor_page', 'whatsapp', 'direct', 'trtex')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
    score INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);

-- RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage leads"
    ON public.leads FOR ALL
    USING (is_admin());

CREATE POLICY "Anyone can create a lead"
    ON public.leads FOR INSERT
    WITH CHECK (true);

-- Trigger
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── 3. REVENUE TRANSACTIONS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.revenue_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID REFERENCES public.sponsor_applications(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    source_domain TEXT,
    type TEXT CHECK (type IN ('sponsorship', 'subscription', 'service')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revenue_status ON public.revenue_transactions(status);
CREATE INDEX IF NOT EXISTS idx_revenue_created ON public.revenue_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_type ON public.revenue_transactions(type);
CREATE INDEX IF NOT EXISTS idx_revenue_source ON public.revenue_transactions(source_domain);

-- RLS
ALTER TABLE public.revenue_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage revenue"
    ON public.revenue_transactions FOR ALL
    USING (is_admin());

-- Trigger (no updated_at column, only created_at)
