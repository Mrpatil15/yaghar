-- YAGHAR: Real Estate OS for India - Demo Seed Data

-- 1. Insert Workspace
INSERT INTO public.workspaces (
    id, name, slug, brand_color, phone, email, city, focus_localities, rera_number, plan_tier, subscription_status
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Shree Ganesh Realty',
    'shree-ganesh-realty',
    '#0f766e',
    '+919820123456',
    'contact@shreeganeshrealty.in',
    'Mumbai',
    ARRAY['Borivali East', 'Kandivali West', 'Thane West', 'Andheri West', 'Wakad Pune'],
    'A51900012345',
    'pro',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Templates
INSERT INTO public.templates (workspace_id, name, category, content, is_default) VALUES
('a0000000-0000-0000-0000-000000000001', 'Welcome New Lead', 'welcome', 'Namaste {{lead_name}} ji! 🙏 Thank you for reaching out to Shree Ganesh Realty. I have noted your requirement for {{bhk}} in {{locality}}. When is a good time for a quick 2-minute call today?', true),
('a0000000-0000-0000-0000-000000000001', 'Property Details & Brochure', 'property_share', 'Hello {{lead_name}} ji, here is the curated option matching your budget: *{{property_title}}* in {{locality}}. Price: *{{price_formatted}}*. Carpet Area: {{carpet_area}} sq.ft. View photos & brochure here: {{microsite_link}}', true),
('a0000000-0000-0000-0000-000000000001', 'Site Visit Confirmation', 'site_visit', 'Dear {{lead_name}} ji, your site visit for *{{property_title}}* is confirmed for *{{visit_time}}*. Location pin: {{location_pin}}. See you there! Let me know if you need any assistance.', true),
('a0000000-0000-0000-0000-000000000001', 'Reactivate Dead Lead', 'reactivate', 'Namaste {{lead_name}} ji! A couple of new premium listings just opened up in {{locality}} with special festive developer discounts. Are you still exploring properties in this area? Would love to share details if interested.', true);

-- 3. Insert Properties
INSERT INTO public.properties (
    id, workspace_id, title, listing_type, property_type, city, locality, bhk, carpet_area, price, rera_number, possession_status, amenities, description, status, location_pin_url
) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Oberoi Sky City - Luxury 3 BHK',
    'resale',
    'apartment',
    'Mumbai',
    'Borivali East',
    '3 BHK',
    1080,
    38500000, -- 3.85 Cr
    'P51800003582',
    'ready_to_move',
    ARRAY['Clubhouse', 'Swimming Pool', 'Gym', 'Jogging Track', 'Kids Play Area', 'High Speed Elevators'],
    'Exquisite 3 BHK higher floor with panoramic National Park view. Ultra-modern amenities and prime connectivity to Western Express Highway & Metro.',
    'available',
    'https://maps.google.com/?q=Oberoi+Sky+City+Borivali'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Hiranandani Estate - The Walk 1 BHK',
    'resale',
    'apartment',
    'Thane',
    'Thane West',
    '1 BHK',
    465,
    6800000, -- 68 Lakhs
    'P51700000129',
    'ready_to_move',
    ARRAY['Security 24x7', 'Garden', 'Retail High Street', 'Clubhouse'],
    'Well maintained 1 BHK in European style township. Close to TCS Olympus and Viviana Mall.',
    'available',
    'https://maps.google.com/?q=Hiranandani+Estate+Thane'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Godrej Woodsman - Premium 2 BHK',
    'new_project',
    'apartment',
    'Pune',
    'Wakad',
    '2 BHK',
    750,
    8200000, -- 82 Lakhs
    'P52100018890',
    'under_construction',
    ARRAY['Clubhouse', 'Cricket Pitch', 'EV Charging Station', 'Infinity Pool'],
    'Spacious 2 BHK with 2 balconies, right near Hinjawadi IT Park Phase 1. Possession Dec 2025.',
    'available',
    'https://maps.google.com/?q=Wakad+Pune'
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Lodha Palava Lakeshore Greens 2 BHK',
    'resale',
    'apartment',
    'Thane',
    'Dombivli East',
    '2 BHK',
    610,
    5400000, -- 54 Lakhs
    'P51700000395',
    'ready_to_move',
    ARRAY['Golf Course', 'Olympic Sports Complex', 'Mall', 'School'],
    'Ready 2 BHK with modular kitchen, air-conditioned rooms, overlooking the serene river.',
    'available',
    'https://maps.google.com/?q=Lodha+Palava+Dombivli'
),
(
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'Sea View Penthouse - Bandra West',
    'resale',
    'apartment',
    'Mumbai',
    'Bandra West',
    '4+ BHK',
    2800,
    95000000, -- 9.50 Cr
    'P51800009988',
    'ready_to_move',
    ARRAY['Private Terrace', 'Sea Facing', 'Concierge', '2 Car Parks'],
    'Celebrity style sea-facing penthouse on Carter Road. Fully automated smart home with Italian marble.',
    'available',
    'https://maps.google.com/?q=Carter+Road+Bandra+West'
);

-- 4. Insert Leads
INSERT INTO public.leads (
    id, workspace_id, name, phone, email, stage, source, budget_min, budget_max, preferred_bhk, preferred_localities, notes
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Rahul Sharma',
    '+919820554433',
    'rahul.sharma@gmail.com',
    'site_visit',
    '99acres',
    30000000, -- 3.0 Cr
    40000000, -- 4.0 Cr
    ARRAY['3 BHK'],
    ARRAY['Borivali East', 'Kandivali East'],
    'Looking for ready to move 3 BHK near Metro station. Wife works in BKC, needs good connectivity.'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Priya Nair',
    '+919870112233',
    'priya.nair@outlook.com',
    'negotiation',
    'referral',
    80000000, -- 8.0 Cr
    100000000, -- 10.0 Cr
    ARRAY['4+ BHK'],
    ARRAY['Bandra West'],
    'Offered 9.1 Cr on Carter Road penthouse. Meeting scheduled with seller for token finalization.'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Amit Kulkarni',
    '+919890445566',
    'amit.kulkarni@techcorp.com',
    'contacted',
    'magicbricks',
    7500000, -- 75 L
    9000000, -- 90 L
    ARRAY['2 BHK'],
    ARRAY['Wakad', 'Baner'],
    'Software engineer at Hinjawadi. Interested in Godrej Woodsman. Shared brochure over WhatsApp.'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Vikram Malhotra',
    '+919811223344',
    'vikram.m@gmail.com',
    'new',
    'meta_ads',
    6000000, -- 60 L
    7000000, -- 70 L
    ARRAY['1 BHK', '2 BHK'],
    ARRAY['Thane West'],
    'Inquired via Facebook ad for Thane properties. Call scheduled for tomorrow.'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'Sneha Patil',
    '+919822334455',
    'sneha.p@yahoo.com',
    'lost',
    'housing',
    5000000, -- 50 L
    5500000, -- 55 L
    ARRAY['2 BHK'],
    ARRAY['Dombivli East'],
    'Was unresponsive for 40 days. Candidate for festive reactivation campaign.'
);

-- 5. Insert Sample Deal
INSERT INTO public.deals (
    id, workspace_id, lead_id, property_id, deal_value, deal_type, brokerage_percentage, total_commission, gst_applicable, gst_amount, status, invoice_number
) VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    38500000, -- 3.85 Cr
    'sale',
    2.0, -- 2%
    770000, -- 7.7 Lakhs brokerage
    true,
    138600, -- 18% GST (69300 CGST + 69300 SGST)
    'in_progress',
    'INV-2026-001'
);

-- 6. Insert Checklist
INSERT INTO public.checklists (workspace_id, deal_id, title, category, items) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Maharashtra Resale Flat Transaction Checklist',
    'buy',
    '[
        {"name": "Original Allotment Letter & Agreement for Sale", "checked": true},
        {"name": "Share Certificate from Co-op Housing Society", "checked": true},
        {"name": "No Objection Certificate (NOC) from Society", "checked": false},
        {"name": "Index II (Registration Receipt of Seller)", "checked": true},
        {"name": "Title Search Report (Last 30 years by Advocate)", "checked": false},
        {"name": "Encumbrance Certificate", "checked": false},
        {"name": "Occupancy Certificate (OC) / Completion Certificate", "checked": true},
        {"name": "Property Tax Receipts (Up to date)", "checked": true},
        {"name": "Buyer & Seller KYC (PAN + Aadhaar)", "checked": true},
        {"name": "Bank Loan Sanction Letter", "checked": false}
    ]'::jsonb
);

-- 7. Insert Microsite
INSERT INTO public.microsites (
    workspace_id, tagline, about_text, experience_years, properties_sold, happy_clients, testimonials, is_published
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Trusted Real Estate Advisors in Mumbai & Pune since 2012',
    'With over a decade of experience, Shree Ganesh Realty helps families and investors find verified RERA-approved homes with complete legal transparency and zero hassle.',
    14,
    180,
    350,
    '[
        {"client_name": "Dr. Rajesh Kothari", "role": "Cardiologist", "text": "Shree Ganesh Realty found us our dream 3 BHK in Oberoi Sky City within 2 weeks. The documentation and loan process was seamless."},
        {"client_name": "Meera Joshi", "role": "IT Director", "text": "Transparent dealings, great negotiation with the builder, and clear legal guidance. Highly recommend them for Mumbai suburbs."}
    ]'::jsonb,
    true
);
