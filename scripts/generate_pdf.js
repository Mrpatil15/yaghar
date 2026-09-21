const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

function generatePDF() {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 50;

  let currentY = margin;

  function checkPageBreak(neededHeight) {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = margin;
      drawHeaderFooter();
    }
  }

  function drawHeaderFooter() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('YAGHAR — The Real Estate Operating System for India (Operations Manual)', margin, 30);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 35, pageWidth - margin, 35);

    const pageCount = doc.internal.getNumberOfPages();
    doc.text(`Page ${pageCount}`, pageWidth - margin - 35, pageHeight - 25);
  }

  function addTitle(text) {
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 118, 110); // Teal 700
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, currentY + 18);
    currentY += lines.length * 26 + 10;
  }

  function addSubtitle(text) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // Slate 500
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, currentY + 10);
    currentY += lines.length * 15 + 15;
  }

  function addSectionHeader(text) {
    checkPageBreak(40);
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 118, 110); // Teal 700
    doc.text(text, margin, currentY + 12);
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(1);
    doc.line(margin, currentY + 17, margin + 80, currentY + 17);
    currentY += 30;
  }

  function addSubHeader(text) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(text, margin, currentY + 10);
    currentY += 18;
  }

  function addParagraph(text) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // Slate 700
    const lines = doc.splitTextToSize(text, contentWidth);
    const needed = lines.length * 14 + 8;
    checkPageBreak(needed);
    doc.text(lines, margin, currentY + 10);
    currentY += needed;
  }

  function addBullet(boldPrefix, text) {
    doc.setFontSize(9.5);
    const fullText = boldPrefix ? `${boldPrefix} ${text}` : text;
    const lines = doc.splitTextToSize(fullText, contentWidth - 15);
    const needed = lines.length * 14 + 6;
    checkPageBreak(needed);

    // Bullet dot
    doc.setFillColor(15, 118, 110);
    doc.circle(margin + 4, currentY + 7, 2, 'F');

    // First line with bold prefix
    if (boldPrefix) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const prefixWidth = doc.getTextWidth(boldPrefix + ' ');
      doc.text(boldPrefix + ' ', margin + 15, currentY + 10);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const remainingLines = doc.splitTextToSize(text, contentWidth - 15 - prefixWidth);
      if (remainingLines.length > 0) {
        doc.text(remainingLines[0], margin + 15 + prefixWidth, currentY + 10);
      }
      if (lines.length > 1) {
        const otherLines = lines.slice(1);
        doc.text(otherLines, margin + 15, currentY + 24);
      }
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(lines, margin + 15, currentY + 10);
    }

    currentY += needed;
  }

  // Cover / Header on First Page
  drawHeaderFooter();

  addTitle('YAGHAR — Real Estate Operating System');
  addSubtitle('Complete Operations Manual, Roles & Responsibilities, and Module Workflow Guide\nPrepared for Independent Real Estate Consultants and Small Brokerages across India');

  // Section 1
  addSectionHeader('1. Executive Overview');
  addParagraph(
    'YAGHAR is a production-ready, multi-tenant SaaS web application built specifically for independent real estate consultants and small brokerages in India. It solves the critical operational challenge faced by Indian brokers: managing buyer inquiries scattered across WhatsApp chats, Excel sheets, and paper diaries. YAGHAR provides an end-to-end operating system covering the entire lifecycle of a real estate deal from lead capture to WhatsApp follow-ups, inventory management, site visit coordination, commission tracking, and GST-compliant invoicing.'
  );

  // Section 2
  addSectionHeader('2. Stakeholder Roles & Responsibilities ("Work of Everyone")');
  addParagraph(
    'YAGHAR is designed to support a collaborative real estate brokerage team as well as solo independent consultants. Below is the detailed breakdown of each stakeholder role and how they interact with the platform:'
  );

  addSubHeader('Role 1: Principal Consultant / Brokerage Owner');
  addBullet('Workspace & Compliance:', 'Sets up the agency workspace, uploads firm logo, configures brand colors, and inputs verified MahaRERA/State RERA registration numbers.');
  addBullet('Pipeline Oversight:', 'Monitors the total active pipeline, team conversion rates, response times, and total inventory value across all listings.');
  addBullet('Team Management:', 'Invites team agents, assigns lead ownership, and sets commission split percentages (e.g., 50/50 co-agent split).');
  addBullet('Financial Management:', 'Reviews closed deals, confirms token receipts, and generates GST-compliant tax invoices (SAC 997222 with 18% GST) for clients and builders.');
  addBullet('Billing & Data Sovereignty:', 'Manages subscription tier (Starter, Pro, Team) via Razorpay and exports full database backups under DPDP Act 2023 compliance.');

  addSubHeader('Role 2: Real Estate Agent / Associate Consultant');
  addBullet('Lead Qualification:', 'Receives incoming inquiries from 99acres, MagicBricks, Meta Ads, and the public microsite. Normalizes phone numbers with +91 and detects duplicates before logging.');
  addBullet('Inventory Matching:', 'Uses the built-in Lead-to-Property Matcher to auto-suggest inventory based on client budget, BHK, and locality, sharing curated options via 1-tap WhatsApp deep links.');
  addBullet('Site Visit Execution:', 'Books property tours with clients, sends Google Maps location pins and reminder notes, and logs visit feedback (1–5 stars) to advance the lead to the Negotiation stage.');
  addBullet('Document Verification:', 'Reviews the Maharashtra Resale Flat or Rental checklist (Index II, 7/12 extract, Society NOC, OC, KYC) with the buyer and seller to ensure clear property title.');
  addBullet('Reactivation:', 'Uses the Reactivate Dead Leads engine to re-engage clients inactive for 30+ days with festive discount alerts and new developer inventory.');

  addSubHeader('Role 3: Client (Homebuyer / Tenant / Investor)');
  addBullet('Inquiry Submission:', 'Visits the consultant’s public microsite (/c/[slug]) or scans their visiting card QR code to view verified listings and submit inquiries.');
  addBullet('Receiving Curated Options:', 'Receives clean property cards, brochures, and location pins directly on WhatsApp without needing to download external mobile apps.');
  addBullet('Financial Planning:', 'Uses embeddable calculators to calculate Home Loan EMI, Maharashtra Stamp Duty with female buyer concessions, and net rental yields.');
  addBullet('Invoice Receipt:', 'Receives computer-generated, GST-compliant tax invoices detailing brokerage fees with SAC 997222.');

  addSubHeader('Role 4: Property Owner / Builder / Developer');
  addBullet('Inventory Onboarding:', 'Provides listing details (resale or new project), carpet area, RERA registration ID, amenities, and pricing in Lakhs/Crores.');
  addBullet('Site Visit Reception:', 'Receives pre-qualified, verified buyers for scheduled site visits instead of random walk-ins.');
  addBullet('Deal Finalization:', 'Coordinates token agreements, allotment letters, and final registration with the consultant.');

  addSubHeader('Role 5: Super-Administrator (Platform Operator)');
  addBullet('Tenant Monitoring:', 'Monitors total tenant workspaces, active subscriptions, Monthly Recurring Revenue (MRR), and trial expiries across all Indian cities.');
  addBullet('Customer Support:', 'Uses 1-Click Impersonation to switch into any tenant workspace to troubleshoot technical issues or assist the consultant in real time.');
  addBullet('Trial Management:', 'Extends evaluation trials by +14 days for high-potential brokerages.');

  // Section 3
  addSectionHeader('3. Complete Module Workflows ("How Everything Works")');

  addSubHeader('Module 1: Onboarding & Workspace Setup (< 3 Minutes)');
  addParagraph(
    'When a consultant signs up, the 3-step onboarding wizard prompts for firm name, city, focus localities (e.g. Borivali East, Wakad Pune), MahaRERA registration number, and brand color. The wizard features a 1-click "Load Demo Data" button that seeds 6 realistic Indian leads, 5 Mumbai/Pune listings, WhatsApp templates, and a sample deal so the user can experience the system immediately.'
  );

  addSubHeader('Module 2: Lead CRM & Kanban Pipeline');
  addParagraph(
    'The CRM organizes buyers across six pipeline stages: New -> Contacted -> Site Visit -> Negotiation -> Booked -> Lost. Each lead card displays budget in Lakhs/Crores, preferred BHK, locality, and direct 1-tap Call and WhatsApp buttons. When a phone number is entered, the system automatically checks for existing duplicates with +91 normalization. Inactive leads (>30 days) appear in the "Reactivate Dead Leads" engine with pre-crafted WhatsApp re-engagement templates.'
  );

  addSubHeader('Module 3: Property Inventory & RERA Verification');
  addParagraph(
    'Supports resale, new developer projects, and rental listings. All pricing is formatted in the Indian numbering system (e.g. ₹ 3.85 Cr, ₹ 85 L, ₹ 55,000/mo). Each listing captures carpet area (sq.ft), floor number, possession date, amenities, and MahaRERA registration ID. Every property detail page includes a "Matching Buyers" tab that identifies which clients in the CRM want that exact configuration.'
  );

  addSubHeader('Module 4: Auto Lead-to-Property Matcher');
  addParagraph(
    'An intelligent matching algorithm compares the lead’s BHK requirement (40 points), target locality (35 points), and budget range (25 points) against active inventory. A match score (%) is displayed alongside a 1-tap "Share via WhatsApp" button that generates a pre-filled wa.me message with the property title, price, carpet area, and brochure link.'
  );

  addSubHeader('Module 5: Public Consultant Microsite (/c/[slug]) & QR Code');
  addParagraph(
    'Every consultant receives a shareable, branded website displaying their logo, brand color, RERA verification badge, experience statistics, client testimonials, and featured properties. An integrated QR code generator allows consultants to print their microsite QR on visiting cards and site signboards. Any visitor who fills out the inquiry form is automatically inserted into the CRM as a new lead tagged with the source "microsite".'
  );

  addSubHeader('Module 6: Site Visit Scheduler & Outcome Logger');
  addParagraph(
    'Allows agents to schedule property tours with clients. Agents can send Google Maps location pins and reminder notes via WhatsApp. After the visit, the agent logs the outcome (Completed, Cancelled, No-Show) and client interest rating (1–5 stars). Marking a visit as completed automatically advances the client to the "Negotiation" stage.'
  );

  addSubHeader('Module 7: Deals & GST-Compliant Tax Invoicing');
  addParagraph(
    'Tracks deal value (INR), brokerage percentage (e.g. 2%), base commission, 18% GST (CGST 9% + SGST 9%), expected payout date, and received amount. Includes a professional printable/PDF tax invoice containing SAC Code 997222 (Real Estate Agent Services), consultant RERA ID, client PAN, and GSTIN.'
  );

  addSubHeader('Module 8: Indian Real Estate Calculators');
  addParagraph(
    'Includes 5 specialized calculators: Home Loan EMI with amortization, Maharashtra Stamp Duty & Registration (5-7% duty + 1% metro cess + ₹30,000 cap, female concession toggle), Brokerage with 18% GST, Rental Yield (gross and net), and Home Loan Affordability (50% FOIR). Every calculator includes a "Send Calculation to WhatsApp" button that captures buyer contact details and logs them into the CRM.'
  );

  addSubHeader('Module 9: Document Vault & Transaction Checklists');
  addParagraph(
    'Contains pre-configured Indian compliance checklists for Resale Flat Purchase (Index II, 7/12 extract, Society NOC, OC, 30-Year Title Search, KYC), Rental Agreements, and Seller Dockets. Items can be checked off interactively and persist in the database.'
  );

  addSubHeader('Module 10: Marketing Kit & AI Assistant');
  addParagraph(
    'Features an AI Caption Generator for Instagram and WhatsApp status, a Property Flyer Generator that renders printable social cards with consultant branding, and 30-Second Reel Script Templates formatted for mobile video. The AI Assistant endpoint (/api/ai/assistant) provides lead summarization, next follow-up suggestions, and tone-calibrated WhatsApp message drafting.'
  );

  // Section 4
  addSectionHeader('4. A Day in the Life of a Real Estate Consultant');
  addBullet('09:00 AM — Morning Command Center:', 'Open the Dashboard (/dashboard) to view follow-ups due today and scheduled site visits. Click 1-tap WhatsApp buttons to send morning greetings.');
  addBullet('11:00 AM — Lead Qualification & Matching:', 'Check new inquiries from Meta Ads and the public microsite. Run the Lead-to-Property Matcher and send curated options via WhatsApp.');
  addBullet('02:00 PM — Buyer Financial Consultations:', 'Use the Stamp Duty & EMI Calculator to generate financial breakdowns for buyers asking about total acquisition outflow.');
  addBullet('04:00 PM — Site Visits & Tours:', 'Send Google Maps location pins to clients for afternoon property tours. Log visit outcomes and ratings right from the smartphone.');
  addBullet('06:30 PM — Deal Closing & Invoicing:', 'Record closed deals in the Deals Tracker and generate a GST-ready tax invoice (SAC 997222) with 1-click PDF download for the builder or buyer.');
  addBullet('07:30 PM — Dead Lead Reactivation:', 'Open the "Reactivate Dead Leads" engine and broadcast festive discount pitches to buyers who went silent over the past month.');

  // Section 5
  addSectionHeader('5. Security, Multi-Tenancy & DPDP 2023 Compliance');
  addParagraph(
    'YAGHAR enforces strict multi-tenancy at the PostgreSQL level via Supabase Row Level Security (RLS). Every tenant table includes a workspace_id foreign key, and policies prevent any user from viewing another agency’s leads or properties. In accordance with India’s Digital Personal Data Protection (DPDP) Act 2023, the platform provides a 1-click machine-readable JSON data export in Settings so consultants maintain 100% ownership and portability of their business records.'
  );

  const outputPath = path.join(__dirname, '..', 'YAGHAR_Operations_Manual_and_System_Guide.pdf');
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log('Successfully generated PDF document at:', outputPath);
}

generatePDF();
