# YAGHAR — The Real Estate Operating System for India 🇮🇳

**YAGHAR** is a production-ready, multi-tenant SaaS web application built specifically for independent real estate consultants and small brokerages in India. A consultant can sign up, load demo data, and run their whole business on day one from their smartphone or laptop.

---

## 🚀 Key Features

1. **Workspace & Multi-Tenancy**:
   - One workspace per consultant or brokerage with Supabase Row Level Security (RLS) isolation.
   - Roles: Owner and Agent. Team invitations with seat limits based on plan tier.
2. **Lead CRM**:
   - Kanban pipeline (New, Contacted, Site Visit, Negotiation, Booked, Lost).
   - Duplicate phone detection (+91 normalization) before logging.
   - Bulk CSV import with field mapping and duplicate skip count.
   - "Reactivate Dead Leads" engine with 1-tap WhatsApp pitch templates.
3. **Property Inventory**:
   - Resale, new projects, and rental listings.
   - Indian Lakh/Crore pricing formatting (`₹ 1.45 Cr`, `₹ 85 L`).
   - MahaRERA / State RERA registration number verification.
   - Specs: BHK, carpet area (sq.ft), floor, furnishing, amenities, Google Maps location pin, photos.
4. **Lead-to-Property Matcher**:
   - Auto-suggests matching properties for each lead based on BHK, budget range, and preferred locality.
   - Match score (%) with 1-tap WhatsApp sharing.
5. **WhatsApp-First Sharing**:
   - Click-to-chat (`wa.me`) deep links with URL-encoded messages.
   - Template library with live variables (`{lead_name}`, `{property_title}`, `{price_formatted}`, `{locality}`, `{bhk}`, `{microsite_link}`, `{location_pin}`).
   - Modular architecture ready for WhatsApp Cloud API integration.
6. **Public Consultant Microsite (`/c/[slug]`)**:
   - Shareable, branded page per consultant with logo, brand colour, RERA badge, bio, stats, and testimonials.
   - Featured property listings with direct WhatsApp inquiry buttons.
   - Interactive lead form that automatically creates a lead in the consultant's CRM.
   - In-app QR code generator & download for visiting cards.
7. **Site Visit Scheduler**:
   - Calendar & agenda view of upcoming visits.
   - Outcome logger (Completed, Cancelled, No-show, 1-5 rating, feedback notes) that advances leads in the pipeline.
   - WhatsApp location pin and visit reminder links.
8. **Deals & Commission Tracker**:
   - Track deal value (INR), brokerage %, total commission, 18% GST, and expected vs received payout.
   - **GST-Ready Tax Invoice**: printable/downloadable invoice with SAC Code 997222 (Real Estate Agent Services), CGST 9% + SGST 9% or IGST 18%, Client GSTIN/PAN, and RERA credentials.
9. **Document Vault & Checklists**:
   - Pre-loaded Indian transaction checklists for Resale Flat Buy (Index II, 7/12 extract, Society NOC, OC, 30-year title search, KYC), Rent, and Sell.
   - Document upload and association with deals.
10. **Indian Real Estate Calculators**:
    - Home Loan EMI Calculator with amortization breakdown.
    - Stamp Duty & Registration Calculator (Maharashtra default: 5-7% stamp duty + 1% metro cess + ₹30,000/1% registration cap; 1% female concession; configurable states).
    - Brokerage Calculator (1%, 2% + 18% GST).
    - Rental Yield Calculator (Gross & Net yield).
    - Home Loan Affordability Calculator (50% FOIR banking norms).
    - Lead capture popup: "Get calculation on WhatsApp".
11. **Marketing Kit**:
    - AI Social Media Caption Generator for Instagram and WhatsApp status.
    - Property Flyer Generator (clean social card ready to download and share).
    - 30-Second Reel Script Templates (Hook, tour highlights, amenities, call to action).
12. **Ads Lead Intake**:
    - Webhook endpoint (`/api/webhooks/leads`) for Meta Lead Ads and Google Ads.
    - Cost per lead (CPL) tracker by ad source.
13. **Analytics Dashboard**:
    - Leads by source breakdown, funnel conversion rates, average response time, follow-ups due today, and revenue pipeline.
14. **AI Assistant**:
    - Server-side route (`/api/ai/assistant`) to summarize leads, suggest next follow-up actions, and draft WhatsApp messages in the consultant's tone.
15. **Built-to-Sell Layer**:
    - Landing page with hero, feature grid, interactive ROI calculator, transparent INR pricing, and FAQ.
    - Subscription Plans: 14-day Free Trial, Starter (₹999/mo), Pro (₹2,499/mo), Team (₹4,999/mo).
    - Razorpay subscription integration and webhook handling (`/api/webhooks/razorpay`).
    - Super-Admin panel (`/admin`): all tenants, MRR, active trials, and 1-click impersonation.
    - DPDP 2023 Compliant: Terms, Privacy Policy, Refund Policy, and 1-click machine-readable JSON data export.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons + Radix UI primitives
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Payments**: Razorpay Subscriptions (INR, UPI, Cards, NetBanking)
- **Deployment**: Vercel (Mobile-first PWA)
- **i18n**: English, Hindi, and Marathi dictionary architecture

---

## 📦 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd yaghar
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase, Razorpay, and AI credentials. (Note: The app includes a built-in interactive demo fallback, so you can test and explore immediately even without external credentials!).

### 3. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the contents of `src/supabase/schema.sql`.
3. To load demo data into your database, run `src/supabase/seed.sql`.
4. Copy your project URL and Anon Key from **Settings > API** into `.env.local`.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💳 Razorpay Configuration

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Generate API Keys in **Settings > API Keys** and copy the Key ID & Key Secret to `.env.local`.
3. Go to **Settings > Webhooks** and add a webhook pointing to:
   `https://your-domain.vercel.app/api/webhooks/razorpay`
4. Subscribe to the following events:
   - `subscription.charged`
   - `subscription.cancelled`
   - `payment.captured`
   - `payment.failed`
5. Copy the Webhook Secret to `RAZORPAY_WEBHOOK_SECRET` in `.env.local`.

---

## 🚀 Deployment on Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the project.
3. Add all environment variables from `.env.local` to the Vercel project settings.
4. Deploy!

---

## 📋 Launch Checklist

- [x] Multi-tenant database schema with RLS tested
- [x] Phone number normalization (+91) and duplicate detection active
- [x] WhatsApp click-to-chat deep links verified
- [x] GST tax invoice generator with SAC 997222 verified
- [x] Maharashtra stamp duty & registration calculator validated
- [x] Public consultant microsite `/c/[slug]` with QR code functional
- [x] DPDP 2023 compliance pages and 1-click JSON data export operational
- [x] Super-admin panel `/admin` with tenant impersonation active
- [x] 1-click "Load Demo Data" button tested
