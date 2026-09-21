-- YAGHAR: Real Estate OS for India
-- Multi-Tenant Database Schema with Row Level Security (RLS)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. WORKSPACES (Tenants)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    brand_color TEXT DEFAULT '#0f766e',
    phone TEXT,
    email TEXT,
    city TEXT DEFAULT 'Mumbai',
    focus_localities TEXT[] DEFAULT '{}',
    rera_number TEXT,
    plan_tier TEXT NOT NULL DEFAULT 'trial', -- 'trial', 'starter', 'pro', 'team'
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    razorpay_customer_id TEXT,
    razorpay_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'trialing', -- 'active', 'trialing', 'past_due', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKSPACE MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'agent', -- 'owner', 'admin', 'agent'
    invited_email TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'invited', 'suspended'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- 4. LEADS
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    stage TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'site_visit', 'negotiation', 'booked', 'lost'
    source TEXT NOT NULL DEFAULT 'manual', -- '99acres', 'magicbricks', 'housing', 'meta_ads', 'google_ads', 'microsite', 'referral', 'walk_in', 'manual'
    budget_min BIGINT, -- in INR
    budget_max BIGINT, -- in INR
    preferred_bhk TEXT[] DEFAULT '{}', -- e.g. ['1 BHK', '2 BHK']
    preferred_localities TEXT[] DEFAULT '{}',
    property_type TEXT DEFAULT 'residential_buy', -- 'residential_buy', 'residential_rent', 'commercial_buy', 'commercial_rent'
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    is_dead BOOLEAN DEFAULT FALSE,
    dead_reason TEXT,
    last_contacted_at TIMESTAMPTZ,
    next_follow_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LEAD ACTIVITIES & TIMELINE
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'note', 'call', 'whatsapp_sent', 'stage_change', 'site_visit_scheduled', 'property_shared'
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FOLLOW UPS
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROPERTIES (Inventory)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    listing_type TEXT NOT NULL DEFAULT 'resale', -- 'new_project', 'resale', 'rental'
    property_type TEXT NOT NULL DEFAULT 'apartment', -- 'apartment', 'villa', 'plot', 'commercial'
    city TEXT NOT NULL DEFAULT 'Mumbai',
    locality TEXT NOT NULL,
    sub_locality TEXT,
    bhk TEXT NOT NULL, -- '1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Commercial'
    carpet_area NUMERIC NOT NULL, -- in sq ft
    super_builtup_area NUMERIC,
    price BIGINT NOT NULL, -- In INR
    maintenance_charge NUMERIC DEFAULT 0,
    rera_number TEXT,
    possession_date DATE,
    possession_status TEXT DEFAULT 'ready_to_move', -- 'ready_to_move', 'under_construction'
    floor_number INT,
    total_floors INT,
    furnishing TEXT DEFAULT 'unfurnished', -- 'unfurnished', 'semi_furnished', 'fully_furnished'
    amenities TEXT[] DEFAULT '{}',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'available', -- 'available', 'under_offer', 'sold', 'rented'
    location_pin_url TEXT,
    brochure_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PROPERTY MEDIA
CREATE TABLE IF NOT EXISTS public.property_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SHORTLISTS
CREATE TABLE IF NOT EXISTS public.shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'suggested', -- 'suggested', 'shared', 'liked', 'disliked', 'visited'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lead_id, property_id)
);

-- 10. SITE VISITS
CREATE TABLE IF NOT EXISTS public.site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
    outcome_notes TEXT,
    feedback_rating INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DEALS & COMMISSIONS
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE RESTRICT,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
    deal_value BIGINT NOT NULL,
    deal_type TEXT NOT NULL DEFAULT 'sale', -- 'sale', 'rental'
    brokerage_percentage NUMERIC NOT NULL DEFAULT 2.0,
    total_commission BIGINT NOT NULL,
    gst_applicable BOOLEAN DEFAULT TRUE,
    gst_amount BIGINT DEFAULT 0,
    expected_payout_date DATE,
    received_amount BIGINT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'closed', 'cancelled'
    invoice_number TEXT,
    client_gstin TEXT,
    client_pan TEXT,
    invoice_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
    split_percentage NUMERIC NOT NULL,
    amount BIGINT NOT NULL,
    paid_status TEXT DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. DOCUMENTS & CHECKLISTS
CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'buy', 'sell', 'rent'
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    doc_type TEXT NOT NULL, -- 'index_2', '7_12', 'allotment_letter', 'pan_card', 'aadhaar', 'agreement_for_sale', 'other'
    file_url TEXT NOT NULL,
    file_size INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. WHATSAPP & EMAIL TEMPLATES
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. MICROSITES & FORM SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.microsites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL UNIQUE REFERENCES public.workspaces(id) ON DELETE CASCADE,
    tagline TEXT,
    about_text TEXT,
    experience_years INT DEFAULT 5,
    properties_sold INT DEFAULT 50,
    happy_clients INT DEFAULT 120,
    testimonials JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    qr_code_url TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    requirement_summary TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AD SOURCES
CREATE TABLE IF NOT EXISTS public.ad_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    ad_spend NUMERIC DEFAULT 0,
    leads_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AUDIT LOG
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microsites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.is_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships
    WHERE workspace_id = ws_id AND user_id = auth.uid() AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Isolation policies
CREATE POLICY workspace_member_access ON public.workspaces
    FOR SELECT USING (
        id IN (SELECT workspace_id FROM public.memberships WHERE user_id = auth.uid())
    );

CREATE POLICY tenant_isolation_leads ON public.leads
    FOR ALL USING (public.is_member(workspace_id));

CREATE POLICY tenant_isolation_properties ON public.properties
    FOR ALL USING (public.is_member(workspace_id));

CREATE POLICY tenant_isolation_deals ON public.deals
    FOR ALL USING (public.is_member(workspace_id));

CREATE POLICY tenant_isolation_visits ON public.site_visits
    FOR ALL USING (public.is_member(workspace_id));

CREATE POLICY tenant_isolation_activities ON public.lead_activities
    FOR ALL USING (public.is_member(workspace_id));

CREATE POLICY tenant_isolation_follow_ups ON public.follow_ups
    FOR ALL USING (public.is_member(workspace_id));

CREATE POLICY tenant_isolation_shortlists ON public.shortlists
    FOR ALL USING (public.is_member(workspace_id));

CREATE POLICY tenant_isolation_documents ON public.documents
    FOR ALL USING (public.is_member(workspace_id));

CREATE POLICY tenant_isolation_checklists ON public.checklists
    FOR ALL USING (public.is_member(workspace_id));

CREATE POLICY tenant_isolation_templates ON public.templates
    FOR ALL USING (public.is_member(workspace_id));

-- Public Microsite access
CREATE POLICY public_microsite_read ON public.microsites
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY public_form_submissions ON public.form_submissions
    FOR INSERT WITH CHECK (TRUE);
