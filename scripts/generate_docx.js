const { 
  Document, Packer, Paragraph, TextRun, HeadingLevel, 
  Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ShadingType 
} = require('docx');
const fs = require('fs');
const path = require('path');

// Colors
const COLOR_PRIMARY = '0F766E'; // Teal 700
const COLOR_SECONDARY = '115E59'; // Teal 800
const COLOR_DARK = '0F172A'; // Slate 900
const COLOR_MUTED = '64748B'; // Slate 500
const COLOR_BG_LIGHT = 'F8FAFC'; // Slate 50
const COLOR_BORDER = 'E2E8F0'; // Slate 200

function createHeader(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 300, after: 120 },
  });
}

function createParagraph(text, isBold = false) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: isBold,
        size: 22, // 11pt
        color: COLOR_DARK,
        font: 'Calibri',
      }),
    ],
    spacing: { after: 120, line: 276 },
  });
}

function createBullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + ' ', bold: true, size: 22, color: COLOR_DARK, font: 'Calibri' }));
  }
  children.push(new TextRun({ text, size: 22, color: COLOR_DARK, font: 'Calibri' }));

  return new Paragraph({
    children,
    bullet: { level: 0 },
    spacing: { after: 80, line: 260 },
  });
}

function createSectionTitle(title) {
  return new Paragraph({
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 28, // 14pt
        color: COLOR_PRIMARY,
        font: 'Calibri',
      }),
    ],
    spacing: { before: 360, after: 140 },
  });
}

async function generateDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: 'YAGHAR — The Real Estate Operating System for India',
                bold: true,
                size: 36, // 18pt
                color: COLOR_PRIMARY,
                font: 'Calibri',
              }),
            ],
            spacing: { after: 120 },
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Complete Operations Manual, Roles & Responsibilities, and Module Workflow Guide',
                italics: true,
                size: 24, // 12pt
                color: COLOR_MUTED,
                font: 'Calibri',
              }),
            ],
            spacing: { after: 400 },
            alignment: AlignmentType.CENTER,
          }),

          // Table of Contents Summary
          createSectionTitle('1. Executive Overview'),
          createParagraph(
            'YAGHAR is a production-ready, multi-tenant SaaS web application built specifically for independent real estate consultants and small brokerages in India. It solves the critical operational challenge faced by Indian brokers: managing buyer inquiries scattered across WhatsApp chats, Excel sheets, and paper diaries. YAGHAR provides an end-to-end operating system covering the entire lifecycle of a real estate deal from lead capture to WhatsApp follow-ups, inventory management, site visit coordination, commission tracking, and GST-compliant invoicing.'
          ),

          createSectionTitle('2. User Roles & Responsibilities ("Work of Everyone")'),
          createParagraph(
            'YAGHAR is designed to support a collaborative real estate brokerage team as well as solo independent consultants. Below is the detailed breakdown of each stakeholder role and how they interact with the platform:'
          ),

          // Role 1: Brokerage Owner
          createHeader('Role 1: Principal Consultant / Brokerage Owner', HeadingLevel.HEADING_2),
          createBullet('Sets up the agency workspace, uploads firm logo, configures brand colors, and inputs verified MahaRERA/State RERA registration numbers.', 'Workspace & Compliance:'),
          createBullet('Monitors the total active pipeline, team conversion rates, response times, and total inventory value across all listings.', 'Pipeline Oversight:'),
          createBullet('Invites team agents, assigns lead ownership, and sets commission split percentages (e.g., 50/50 co-agent split).', 'Team Management:'),
          createBullet('Reviews closed deals, confirms token receipts, and generates GST-compliant tax invoices (SAC 997222 with 18% GST) for clients and builders.', 'Financial Management:'),
          createBullet('Manages subscription tier (Starter, Pro, Team) via Razorpay and exports full database backups under DPDP Act 2023 compliance.', 'Billing & Data Sovereignty:'),

          // Role 2: Team Agent
          createHeader('Role 2: Real Estate Agent / Associate Consultant', HeadingLevel.HEADING_2),
          createBullet('Receives incoming inquiries from 99acres, MagicBricks, Meta Ads, and the public microsite. Normalizes phone numbers with +91 and detects duplicates before logging.', 'Lead Qualification:'),
          createBullet('Uses the built-in Lead-to-Property Matcher to auto-suggest inventory based on client budget, BHK, and locality, sharing curated options via 1-tap WhatsApp deep links.', 'Inventory Matching:'),
          createBullet('Books property tours with clients, sends Google Maps location pins and reminder notes, and logs visit feedback (1–5 stars) to advance the lead to the Negotiation stage.', 'Site Visit Execution:'),
          createBullet('Reviews the Maharashtra Resale Flat or Rental checklist (Index II, 7/12 extract, Society NOC, OC, KYC) with the buyer and seller to ensure clear property title.', 'Document Verification:'),
          createBullet('Uses the Reactivate Dead Leads engine to re-engage clients inactive for 30+ days with festive discount alerts and new developer inventory.', 'Reactivation:'),

          // Role 3: Client
          createHeader('Role 3: Client (Homebuyer / Tenant / Investor)', HeadingLevel.HEADING_2),
          createBullet('Visits the consultant’s public microsite (/c/[slug]) or scans their visiting card QR code to view verified listings and submit inquiries.', 'Inquiry Submission:'),
          createBullet('Receives clean property cards, brochures, and location pins directly on WhatsApp without needing to download external mobile apps.', 'Receiving Curated Options:'),
          createBullet('Uses embeddable calculators to calculate Home Loan EMI, Maharashtra Stamp Duty with female buyer concessions, and net rental yields.', 'Financial Planning:'),
          createBullet('Receives computer-generated, GST-compliant tax invoices detailing brokerage fees with SAC 997222.', 'Invoice Receipt:'),

          // Role 4: Property Owner / Developer
          createHeader('Role 4: Property Owner / Builder / Developer', HeadingLevel.HEADING_2),
          createBullet('Provides listing details (resale or new project), carpet area, RERA registration ID, amenities, and pricing in Lakhs/Crores.', 'Inventory Onboarding:'),
          createBullet('Receives pre-qualified, verified buyers for scheduled site visits instead of random walk-ins.', 'Site Visit Reception:'),
          createBullet('Coordinates token agreements, allotment letters, and final registration with the consultant.', 'Deal Finalization:'),

          // Role 5: Super-Admin
          createHeader('Role 5: Super-Administrator (Platform Operator)', HeadingLevel.HEADING_2),
          createBullet('Monitors total tenant workspaces, active subscriptions, Monthly Recurring Revenue (MRR), and trial expiries across all Indian cities.', 'Tenant Monitoring:'),
          createBullet('Uses 1-Click Impersonation to switch into any tenant workspace to troubleshoot technical issues or assist the consultant in real time.', 'Customer Support:'),
          createBullet('Extends evaluation trials by +14 days for high-potential brokerages.', 'Trial Management:'),

          createSectionTitle('3. Detailed Module Workflows ("How Everything Works")'),

          createHeader('Module 1: Onboarding & Workspace Setup (< 3 Minutes)', HeadingLevel.HEADING_2),
          createParagraph(
            'When a consultant signs up, the 3-step onboarding wizard prompts for firm name, city, focus localities (e.g. Borivali East, Wakad Pune), MahaRERA registration number, and brand color. The wizard features a 1-click "Load Demo Data" button that seeds 6 realistic Indian leads, 5 Mumbai/Pune listings, WhatsApp templates, and a sample deal so the user can experience the system immediately.'
          ),

          createHeader('Module 2: Lead CRM & Kanban Pipeline', HeadingLevel.HEADING_2),
          createParagraph(
            'The CRM organizes buyers across six pipeline stages: New -> Contacted -> Site Visit -> Negotiation -> Booked -> Lost. Each lead card displays budget in Lakhs/Crores, preferred BHK, locality, and direct 1-tap Call and WhatsApp buttons. When a phone number is entered, the system automatically checks for existing duplicates with +91 normalization. Inactive leads (>30 days) appear in the "Reactivate Dead Leads" engine with pre-crafted WhatsApp re-engagement templates.'
          ),

          createHeader('Module 3: Property Inventory & RERA Verification', HeadingLevel.HEADING_2),
          createParagraph(
            'Supports resale, new developer projects, and rental listings. All pricing is formatted in the Indian numbering system (e.g. ₹ 3.85 Cr, ₹ 85 L, ₹ 55,000/mo). Each listing captures carpet area (sq.ft), floor number, possession date, amenities, and MahaRERA registration ID. Every property detail page includes a "Matching Buyers" tab that identifies which clients in the CRM want that exact configuration.'
          ),

          createHeader('Module 4: Auto Lead-to-Property Matcher', HeadingLevel.HEADING_2),
          createParagraph(
            'An intelligent matching algorithm compares the lead’s BHK requirement (40 points), target locality (35 points), and budget range (25 points) against active inventory. A match score (%) is displayed alongside a 1-tap "Share via WhatsApp" button that generates a pre-filled wa.me message with the property title, price, carpet area, and brochure link.'
          ),

          createHeader('Module 5: Public Consultant Microsite (/c/[slug]) & QR Code', HeadingLevel.HEADING_2),
          createParagraph(
            'Every consultant receives a shareable, branded website displaying their logo, brand color, RERA verification badge, experience statistics, client testimonials, and featured properties. An integrated QR code generator allows consultants to print their microsite QR on visiting cards and site signboards. Any visitor who fills out the inquiry form is automatically inserted into the CRM as a new lead tagged with the source "microsite".'
          ),

          createHeader('Module 6: Site Visit Scheduler & Outcome Logger', HeadingLevel.HEADING_2),
          createParagraph(
            'Allows agents to schedule property tours with clients. Agents can send Google Maps location pins and reminder notes via WhatsApp. After the visit, the agent logs the outcome (Completed, Cancelled, No-Show) and client interest rating (1–5 stars). Marking a visit as completed automatically advances the client to the "Negotiation" stage.'
          ),

          createHeader('Module 7: Deals & GST-Compliant Tax Invoicing', HeadingLevel.HEADING_2),
          createParagraph(
            'Tracks deal value (INR), brokerage percentage (e.g. 2%), base commission, 18% GST (CGST 9% + SGST 9%), expected payout date, and received amount. Includes a professional printable/PDF tax invoice containing SAC Code 997222 (Real Estate Agent Services), consultant RERA ID, client PAN, and GSTIN.'
          ),

          createHeader('Module 8: Indian Real Estate Calculators', HeadingLevel.HEADING_2),
          createParagraph(
            'Includes 5 specialized calculators: Home Loan EMI with amortization, Maharashtra Stamp Duty & Registration (5-7% duty + 1% metro cess + ₹30,000 cap, female concession toggle), Brokerage with 18% GST, Rental Yield (gross and net), and Home Loan Affordability (50% FOIR). Every calculator includes a "Send Calculation to WhatsApp" button that captures buyer contact details and logs them into the CRM.'
          ),

          createHeader('Module 9: Document Vault & Transaction Checklists', HeadingLevel.HEADING_2),
          createParagraph(
            'Contains pre-configured Indian compliance checklists for Resale Flat Purchase (Index II, 7/12 extract, Society NOC, OC, 30-Year Title Search, KYC), Rental Agreements, and Seller Dockets. Items can be checked off interactively and persist in the database.'
          ),

          createHeader('Module 10: Marketing Kit & AI Assistant', HeadingLevel.HEADING_2),
          createParagraph(
            'Features an AI Caption Generator for Instagram and WhatsApp status, a Property Flyer Generator that renders printable social cards with consultant branding, and 30-Second Reel Script Templates formatted for mobile video. The AI Assistant endpoint (/api/ai/assistant) provides lead summarization, next follow-up suggestions, and tone-calibrated WhatsApp message drafting.'
          ),

          createSectionTitle('4. A Day in the Life of a Consultant using YAGHAR'),
          createBullet('Open the Dashboard (/dashboard) to view follow-ups due today and scheduled site visits. Click 1-tap WhatsApp buttons to send morning greetings.', '09:00 AM — Morning Command Center:'),
          createBullet('Check new inquiries from Meta Ads and the public microsite. Run the Lead-to-Property Matcher and send curated options via WhatsApp.', '11:00 AM — Lead Qualification & Matching:'),
          createBullet('Use the Stamp Duty & EMI Calculator to generate financial breakdowns for buyers asking about total acquisition outflow.', '02:00 PM — Buyer Financial Consultations:'),
          createBullet('Send Google Maps location pins to clients for afternoon property tours. Log visit outcomes and ratings right from the smartphone.', '04:00 PM — Site Visits & Tours:'),
          createBullet('Record closed deals in the Deals Tracker and generate a GST-ready tax invoice (SAC 997222) with 1-click PDF download for the builder or buyer.', '06:30 PM — Deal Closing & Invoicing:'),
          createBullet('Open the "Reactivate Dead Leads" engine and broadcast festive discount pitches to buyers who went silent over the past month.', '07:30 PM — Dead Lead Reactivation:'),

          createSectionTitle('5. Security, Multi-Tenancy & DPDP 2023 Compliance'),
          createParagraph(
            'YAGHAR enforces strict multi-tenancy at the PostgreSQL level via Supabase Row Level Security (RLS). Every tenant table includes a workspace_id foreign key, and policies prevent any user from viewing another agency’s leads or properties. In accordance with India’s Digital Personal Data Protection (DPDP) Act 2023, the platform provides a 1-click machine-readable JSON data export in Settings so consultants maintain 100% ownership and portability of their business records.'
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, '..', 'YAGHAR_Operations_Manual_and_System_Guide.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('Successfully generated Word document at:', outputPath);
}

generateDocx().catch(console.error);
