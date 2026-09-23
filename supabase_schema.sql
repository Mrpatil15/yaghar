-- ==============================================================================
-- YAGHAR REAL ESTATE OS — SUPABASE CORE SCHEMA
-- Multi-Tenant Database Schema with Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CONSULTANTS / PROFILES (1-to-1 with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.consultants (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    firm_name TEXT NOT NULL,
    phone TEXT,
    corridor TEXT DEFAULT 'Central Mumbai',
    rera_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BROKERAGE CLIENTS (Clients serviced by the consultant)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact TEXT,
    corridor TEXT,
    date_onboarded DATE DEFAULT CURRENT_DATE,
    referral_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROPERTY INVENTORY
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    property_type TEXT NOT NULL DEFAULT 'Apartment', -- Apartment, Villa, Plot, Commercial
    listing_type TEXT NOT NULL DEFAULT 'Resale',     -- Resale, New Project, Rental
    city TEXT NOT NULL DEFAULT 'Mumbai',
    locality TEXT NOT NULL,
    bhk TEXT NOT NULL,                              -- 1 BHK, 2 BHK, 3 BHK, 4+ BHK
    carpet_area NUMERIC,                            -- in sq ft
    price BIGINT NOT NULL,                          -- in INR
    status TEXT NOT NULL DEFAULT 'Available',       -- Available, Under Offer, Sold, Rented
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BATCHES / UPLOADS
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    batch_name TEXT NOT NULL,
    upload_date DATE DEFAULT CURRENT_DATE,
    source_file TEXT,
    flat_fee_amount NUMERIC DEFAULT 15000.0,
    payment_status TEXT DEFAULT 'Unpaid',           -- Unpaid, Paid
    invoice_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEADS (CENTRAL TRUTH TABLE)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    raw_phone TEXT,
    source TEXT DEFAULT 'Direct',
    enquiry_date DATE,
    property_interest TEXT,
    budget BIGINT,                                 -- in INR
    notes TEXT,
    cleaned_flag SMALLINT DEFAULT 1,                -- 1 = Clean, 0 = Flagged/Duplicate
    flag_reason TEXT,
    score NUMERIC(5, 1) DEFAULT 50.0,
    tier TEXT DEFAULT 'Warm',                       -- Hot, Warm, Cold
    status TEXT NOT NULL DEFAULT 'new',             -- new, contacted, site_visit, converted, lost
    call_status TEXT DEFAULT 'Not Called',          -- Not Called, Connected, Callback, Site Visit Booked, Not Interested
    call_notes TEXT,
    assigned_script TEXT,
    next_follow_up_at TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TASKS & FOLLOW-UPS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    reminder_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending',         -- pending, completed, cancelled
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONSULTANT SETTINGS & SCORING WEIGHTS
CREATE TABLE IF NOT EXISTS public.consultant_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    weight_recency NUMERIC DEFAULT 40.0,
    weight_source NUMERIC DEFAULT 30.0,
    weight_fit NUMERIC DEFAULT 30.0,
    hot_threshold NUMERIC DEFAULT 70.0,
    warm_threshold NUMERIC DEFAULT 40.0,
    script_hot TEXT,
    script_warm TEXT,
    script_cold TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'Unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Consultants / Profiles
CREATE POLICY "Users can view and edit own profile"
    ON public.consultants FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Clients
CREATE POLICY "Users manage own clients"
    ON public.clients FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Properties
CREATE POLICY "Users manage own properties"
    ON public.properties FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Batches
CREATE POLICY "Users manage own batches"
    ON public.batches FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Leads
CREATE POLICY "Users manage own leads"
    ON public.leads FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users manage own tasks"
    ON public.tasks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Settings
CREATE POLICY "Users manage own settings"
    ON public.consultant_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Invoices
CREATE POLICY "Users manage own invoices"
    ON public.invoices FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON public.leads(tier);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
