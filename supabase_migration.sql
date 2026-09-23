-- ==============================================================================
-- YAGHAR: Supabase Migration to Upgrade Existing Tables & Add Features
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Upgrade LEADS table with scoring, tiers, and call status
ALTER TABLE public.leads 
    ADD COLUMN IF NOT EXISTS score NUMERIC DEFAULT 50.0,
    ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Warm',
    ADD COLUMN IF NOT EXISTS call_status TEXT DEFAULT 'Not Called',
    ADD COLUMN IF NOT EXISTS call_notes TEXT,
    ADD COLUMN IF NOT EXISTS assigned_script TEXT,
    ADD COLUMN IF NOT EXISTS property_interest TEXT,
    ADD COLUMN IF NOT EXISTS budget BIGINT;

-- 2. Create BATCHES / UPLOADS table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    batch_name TEXT NOT NULL,
    upload_date DATE DEFAULT CURRENT_DATE,
    source_file TEXT,
    flat_fee_amount NUMERIC DEFAULT 15000.0,
    payment_status TEXT DEFAULT 'Unpaid',
    invoice_number TEXT,
    total_leads INT DEFAULT 0,
    valid_leads INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create CLIENTS table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact TEXT,
    corridor TEXT,
    date_onboarded DATE DEFAULT CURRENT_DATE,
    referral_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create CONSULTANT_SETTINGS table
CREATE TABLE IF NOT EXISTS public.consultant_settings (
    workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
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

-- 5. Create INVOICES table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_contact TEXT,
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'Unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Performance indexes
CREATE INDEX IF NOT EXISTS idx_leads_workspace ON public.leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_properties_workspace ON public.properties(workspace_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due ON public.follow_ups(due_date);
