'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, Users, MessageSquare, FileText, Calculator, 
  ShieldCheck, ArrowRight, CheckCircle2, Sparkles, 
  Smartphone, Receipt, ChevronDown, Check, Phone, Mail,
  ExternalLink, Layers
} from 'lucide-react';
import { PLANS } from '@/lib/plans';
import { formatINR } from '@/lib/formatters';
import { 
  SUPPORT_EMAIL, SUPPORT_WHATSAPP_DISPLAY, LEGAL_ENTITY_NAME, 
  DEMO_VIDEO_URL, TESTIMONIALS, WHATSAPP_CHAT_URL 
} from '@/config/site';

interface ScreenshotItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageSrc: string;
  alt: string;
}

const DEMO_GALLERY: ScreenshotItem[] = [
  {
    id: 'kanban',
    title: 'Kanban Lead CRM',
    subtitle: 'Track buyers across pipeline stages with duplicate-phone detection.',
    badge: 'Pipeline',
    imageSrc: '/screenshots/kanban-board.webp',
    alt: 'YAGHAR Kanban Lead CRM Board showing buyer stages from New to Site Visit and Booked',
  },
  {
    id: 'whatsapp',
    title: '1-Tap WhatsApp Sharing',
    subtitle: 'Instant click-to-chat links with pre-filled brochures and Google Maps location pins.',
    badge: 'Sharing',
    imageSrc: '/screenshots/whatsapp-share.webp',
    alt: 'YAGHAR 1-Tap WhatsApp Property Sharing modal with prefilled brochure and location link',
  },
  {
    id: 'matcher',
    title: 'Lead-to-Property Matcher',
    subtitle: 'Automated scoring based on buyer budget, preferred BHK, and target localities.',
    badge: 'Matching',
    imageSrc: '/screenshots/property-matcher.webp',
    alt: 'YAGHAR Lead-to-Property Matcher showing percentage match score based on budget, BHK, and locality',
  },
  {
    id: 'invoice',
    title: 'GST SAC 997222 Invoicing',
    subtitle: 'One-click commission invoices with 18% GST (CGST + SGST) and RERA numbers.',
    badge: 'Tax Invoices',
    imageSrc: '/screenshots/gst-invoice.webp',
    alt: 'YAGHAR GST-Ready Commission Invoicing with SAC 997222 and CGST plus SGST breakdown',
  },
];

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'Do I need the WhatsApp Business API?',
    a: 'No. YAGHAR opens WhatsApp click-to-chat with your message pre-filled, sent directly from your own personal or business phone number. There are no monthly WhatsApp Business API fees, no template approval delays, and no Meta setup required.',
  },
  {
    q: 'Can I import my existing leads?',
    a: 'Yes, CSV import with automatic duplicate-phone detection is built-in. You can bulk import existing lead lists from Excel, Google Sheets, 99acres, MagicBricks, or Facebook lead ads.',
  },
  {
    q: 'Are the invoices GST-ready?',
    a: 'Yes. Invoices include SAC code 997222 (Real Estate Agency Services), 18% GST calculation (9% CGST + 9% SGST), and your RERA registration number. Please confirm your final tax filing with your Chartered Accountant.',
  },
  {
    q: 'What happens after the 14-day trial?',
    a: 'You choose a plan (Starter, Pro, or Team) to continue using YAGHAR. No credit card or upfront payment is needed to start your 14-day trial.',
  },
  {
    q: 'Can I cancel or get a refund?',
    a: 'You can cancel your subscription at any time directly from Settings > Billing. If you encounter technical defects or were billed inadvertently within 7 days of renewal without usage, you can request a refund by emailing support. Approved refunds are credited back to your original payment method in 5–7 business days via Razorpay.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. Your client leads, listings, and financial records are strictly isolated using PostgreSQL Row Level Security (RLS) and stored in compliance with India’s Digital Personal Data Protection (DPDP) Act, 2023. You can download a complete 1-click JSON backup anytime.',
  },
  {
    q: 'How many team members can I add?',
    a: 'Starter includes 1 seat (Solo Consultant), Pro includes up to 3 team seats, and Brokerage Team includes up to 10 team seats with role permissions for Owners and Agents.',
  },
];

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [activeDemoTab, setActiveDemoTab] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Interactive ROI Calculator
  const [dealsPerMonth, setDealsPerMonth] = useState(2);
  const [avgDealValueCr, setAvgDealValueCr] = useState(1.2); // 1.2 Cr
  const additionalCommission = Math.round(dealsPerMonth * avgDealValueCr * 10000000 * 0.02);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-500 selection:text-white overflow-x-hidden">
      {/* Semantic Landmark: Header & Nav */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-teal-600 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform">
              Y
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-slate-900 tracking-tight">YAGHAR</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                IN 🇮🇳
              </span>
            </div>
          </Link>

          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md p-1">Features</a>
            <a href="#demo" className="hover:text-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md p-1">See It in Action</a>
            <a href="#how-it-works" className="hover:text-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md p-1">How It Works</a>
            <a href="#roi" className="hover:text-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md p-1">ROI Calculator</a>
            <a href="#pricing" className="hover:text-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md p-1">Pricing</a>
            <a href="#faq" className="hover:text-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md p-1">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-3.5 py-2 min-h-[44px] flex items-center justify-center rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 min-h-[44px] flex items-center justify-center rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm shadow-teal-700/20 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Semantic Landmark: Main Content */}
      <main>
        {/* Hero Section */}
        <section className="pt-14 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8 bg-gradient-to-b from-teal-50/60 via-white to-slate-50 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/90 text-teal-900 border border-teal-200 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Built for Independent Consultants &amp; Small Brokerages in India</span>
            </div>

            {/* Exactly One H1 Landmark */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
              Stop losing buyers in WhatsApp chats.{' '}
              <span className="text-teal-700">Run your whole brokerage in one place.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Leads, inventory, WhatsApp sharing, site visits and GST invoices — built for independent consultants and small brokerages in India.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-lg shadow-teal-700/25 flex items-center justify-center gap-2 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#demo"
                className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-2xs flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <span>See it in action</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </a>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>MahaRERA &amp; GST ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1-tap WhatsApp sharing</span>
              </div>
            </div>
          </div>
        </section>

        {/* P1: #demo "See it in action" Gallery */}
        <section id="demo" className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Product Tour</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              See it in action
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Explore the core tools that replace scattered WhatsApp chats and paper notebooks.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DEMO_GALLERY.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveDemoTab(idx)}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeDemoTab === idx
                    ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          {/* Active Screenshot Display Card */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                    {DEMO_GALLERY[activeDemoTab].badge}
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    {DEMO_GALLERY[activeDemoTab].title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  {DEMO_GALLERY[activeDemoTab].subtitle}
                </p>
              </div>

              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shrink-0 self-start sm:self-auto"
              >
                <span>Try this in your workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-3 sm:p-6 bg-slate-100/70 border-t border-slate-200">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-inner">
                <Image
                  src={DEMO_GALLERY[activeDemoTab].imageSrc}
                  alt={DEMO_GALLERY[activeDemoTab].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-contain object-top"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Video slot: only rendered if DEMO_VIDEO_URL is non-empty */}
          {DEMO_VIDEO_URL.trim().length > 0 && (
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
              <h3 className="text-base font-bold">Watch Product Walkthrough</h3>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
                <iframe
                  src={DEMO_VIDEO_URL}
                  title="YAGHAR Demo Walkthrough Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </section>

        {/* P1: "How It Works" Section */}
        <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8 bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Simple 3-Step Flow</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                How YAGHAR works for your brokerage
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Zero steep learning curve. Start closing deals on day one.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 relative">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-lg">
                  1
                </div>
                <h3 className="font-bold text-base text-slate-900">Add Leads &amp; Listings</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Import contacts via CSV with duplicate-phone detection, or add property listings with instant Lakh/Crore formatting and MahaRERA numbers.
                </p>
              </div>

              <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
                  2
                </div>
                <h3 className="font-bold text-base text-slate-900">Share on WhatsApp in 1 Tap</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our system matches buyer budget and BHK with available inventory. Send curated brochures and Google Maps location pins directly from your number.
                </p>
              </div>

              <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-lg">
                  3
                </div>
                <h3 className="font-bold text-base text-slate-900">Invoice with GST</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When a deal closes, generate professional GST commission invoices under SAC 997222 with 18% tax calculation (CGST+SGST) in 1 click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Engineered for Indian Brokerages</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Everything you need to close more deals every month
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Kanban Lead CRM</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track buyers across stages (New, Contacted, Site Visit, Negotiation, Booked). Automatic duplicate phone detection and dead lead reactivation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">1-Tap WhatsApp Sharing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click-to-chat deep links that open WhatsApp with curated property cards, brochures, and Google Maps location pins sent from your own number.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Inventory with Lakh/Cr Pricing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Resale, developer projects, and rental listings. Instant Lakh/Crore formatting (₹ 1.45 Cr), MahaRERA ID verification, and amenities checklist.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Auto Lead-to-Property Matcher</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Matches lead budget, preferred BHK, and target localities with available inventory. Displays match score (%) and lets you share options in one tap.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Indian Real Estate Calculators</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                EMI, Maharashtra Stamp Duty &amp; Registration, Brokerage with 18% GST, Rental Yield, and Affordability calculators.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">GST-Ready Commission Invoicing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track expected vs received brokerage payouts. Generate professional tax invoices with SAC 997222, CGST+SGST, and RERA credentials.
              </p>
            </div>
          </div>
        </section>

        {/* P0: Interactive ROI Calculator with Honest Copy */}
        <section id="roi" className="py-16 sm:py-20 px-4 sm:px-8 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Your Return on Investment</span>
              <h2 className="text-2xl sm:text-3xl font-black">How much more brokerage will you make with YAGHAR?</h2>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <label htmlFor="deals-slider">Additional Deals Closed per Month:</label>
                    <span className="text-teal-400 font-bold">{dealsPerMonth} Deals</span>
                  </div>
                  <input
                    id="deals-slider"
                    type="range"
                    min="1"
                    max="10"
                    value={dealsPerMonth}
                    onChange={e => setDealsPerMonth(parseInt(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <label htmlFor="price-slider">Average Property Deal Value:</label>
                    <span className="text-teal-400 font-bold">₹ {avgDealValueCr} Cr</span>
                  </div>
                  <input
                    id="price-slider"
                    type="range"
                    min="0.4"
                    max="5.0"
                    step="0.1"
                    value={avgDealValueCr}
                    onChange={e => setAvgDealValueCr(parseFloat(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                </div>

                {/* Honest Copy Replacement */}
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Move the sliders to see what 1–3 extra deals a month could be worth to you.
                </p>
              </div>

              <div className="bg-white/10 p-6 rounded-2xl border border-white/10 text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Estimated Additional Monthly Brokerage
                </span>
                <div className="text-3xl sm:text-4xl font-black text-teal-300 font-mono">
                  {formatINR(additionalCommission)}
                </div>
                {/* Footnote constraint */}
                <p className="text-xs text-slate-200">
                  Illustrative estimate at a 2% brokerage rate. Actual results vary.
                </p>
                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-400"
                  >
                    <span>Claim Your Free Trial</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Table with Accurate Badges */}
        <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Transparent Indian Pricing</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Simple plans that scale with your brokerage
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              14 days free trial on all plans. Pay securely in INR via UPI, NetBanking or Credit Card.
            </p>

            {/* Keyboard-Accessible Toggle */}
            <div 
              role="group" 
              aria-label="Billing frequency toggle" 
              className="pt-3 inline-flex items-center gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold"
            >
              <button
                type="button"
                aria-pressed={!isAnnual}
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 min-h-[40px] rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  !isAnnual ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                aria-pressed={isAnnual}
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 min-h-[40px] rounded-xl transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  isAnnual ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual (2 Months Free)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-md uppercase font-black">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PLANS).filter(([k]) => k !== 'trial').map(([tier, plan]) => {
              const monthlyDisplay = isAnnual ? Math.round(plan.priceYearlyINR / 12) : plan.priceMonthlyINR;

              return (
                <div
                  key={tier}
                  className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between border transition-all ${
                    plan.popular
                      ? 'border-teal-600 ring-2 ring-teal-500 shadow-xl relative'
                      : 'border-slate-200 shadow-xs hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-teal-700 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{plan.tagline}</p>
                    </div>

                    <div className="pt-2">
                      <span className="text-3xl font-black text-slate-900 font-mono">
                        ₹ {monthlyDisplay.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-600"> / month</span>
                      {isAnnual && (
                        <div className="text-[11px] text-teal-800 font-bold mt-0.5">
                          Billed annually (₹ {plan.priceYearlyINR.toLocaleString('en-IN')}/yr)
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                      {plan.features.map((feat, i) => {
                        // Check if this feature is not yet built in UI and tag with Coming soon
                        const isComingSoon = 
                          (tier === 'team' && feat.includes('Agent Commission Splits')) ||
                          (tier === 'team' && feat.includes('Custom Domain'));

                        return (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                            <span className="leading-snug">
                              {feat}
                              {isComingSoon && (
                                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 inline-block align-middle">
                                  Coming soon
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={`/signup?plan=${tier}`}
                      className={`w-full py-3 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-teal-600 ${
                        plan.popular
                          ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <span>Start 14-Day Free Trial</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* P1: Accessible FAQ Accordion */}
        <section id="faq" className="py-16 sm:py-20 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Got Questions?</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Everything you need to know about plans, compliance, and features.
            </p>
          </div>

          <div className="space-y-3" role="region" aria-label="Frequently Asked Questions Accordion">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    id={`faq-question-${idx}`}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal-700' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${idx}`}
                      role="region"
                      aria-labelledby={`faq-question-${idx}`}
                      className="px-5 pb-5 text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-3"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* P1: Testimonials Component (Renders NOTHING when empty) */}
        {TESTIMONIALS.length > 0 && (
          <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Client Reviews</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">What Consultants Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(t => (
                <div key={t.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <p className="text-xs text-slate-700 italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="font-bold text-xs text-slate-900">{t.author}</div>
                    <div className="text-[11px] text-slate-600">{t.agency} • {t.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* P1: Final CTA Band Above Footer */}
        <section className="py-16 px-4 sm:px-8 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to stop losing leads? Start your 14-day free trial.
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-xl mx-auto">
              Join forward-thinking Indian real estate consultants who run their leads, property matching, and GST billing in one place.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4 text-teal-700" />
              </Link>
              <a
                href={WHATSAPP_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Semantic Landmark: Footer */}
      <footer className="bg-slate-950 text-white py-14 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-base">
                  Y
                </div>
                <div className="font-black text-lg tracking-tight">YAGHAR</div>
              </div>
              <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                The Real Estate Operating System for independent consultants and small brokerages in India.
              </p>
              <div className="pt-2 text-[11px] text-slate-400">
                MahaRERA &amp; Digital Personal Data Protection (DPDP) Act 2023 Compliant.
              </div>
            </div>

            {/* Column 2: Legal Links */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">Legal &amp; Policy</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link href="/terms" className="hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded">
                    Privacy Policy (DPDP 2023)
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded">
                    Refund &amp; Cancellation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Support */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">Contact &amp; Support</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-2 hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
                  >
                    <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{SUPPORT_EMAIL}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={WHATSAPP_CHAT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-teal-300 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{SUPPORT_WHATSAPP_DISPLAY}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Entity */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              © {new Date().getFullYear()} {LEGAL_ENTITY_NAME}. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Made for Indian Real Estate 🇮🇳</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
