'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, Users, MessageSquare, FileText, Calculator, 
  ShieldCheck, ArrowRight, CheckCircle2, Star, Sparkles, 
  ChevronRight, Smartphone, Zap, IndianRupee 
} from 'lucide-react';
import { PLANS } from '@/lib/plans';
import { formatINR } from '@/lib/formatters';

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  // Interactive ROI Calculator
  const [dealsPerMonth, setDealsPerMonth] = useState(2);
  const [avgDealValueCr, setAvgDealValueCr] = useState(1.2); // 1.2 Cr
  const additionalCommission = Math.round(dealsPerMonth * avgDealValueCr * 10000000 * 0.02);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-teal-700/20">
              Y
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-slate-900 tracking-tight">YAGHAR</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                IN
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition-colors">Features</a>
            <a href="#roi" className="hover:text-teal-700 transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-teal-700 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-teal-700 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm shadow-teal-700/20 transition-all active:scale-95"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-8 bg-gradient-to-b from-teal-50/50 via-white to-slate-50 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 text-teal-800 border border-teal-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Built for Indian Real Estate Consultants & Small Brokerages</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            The All-In-One Operating System for <span className="text-teal-700">Real Estate Consultants</span> in India.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop losing buyer inquiries in messy WhatsApp chats and paper notebooks. Run your entire brokerage on day one: Lead CRM, inventory, 1-tap WhatsApp sharing, RERA site visits, and GST invoices.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-lg shadow-teal-700/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore Demo Workspace</span>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>MahaRERA & GST ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant WhatsApp integration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Engineered for Indian Brokerages</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Everything you need to close more deals every month
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Kanban Lead CRM</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track buyers across stages (New, Contacted, Site Visit, Negotiation, Booked). Automatic duplicate phone detection and dead lead reactivation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">WhatsApp-First Sharing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              1-tap click-to-chat deep links. Share curated property cards, brochures, and Google Maps location pins with live variable replacement.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Inventory with Lakh/Cr Pricing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Resale, new developer projects, and rental listings. Instant Lakh/Crore formatting (`₹ 1.45 Cr`), MahaRERA ID verification, and amenities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Auto Lead-to-Property Matcher</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Matches lead budget and preferred BHK with available inventory. Shows match score (%) and lets you share options in one tap.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Indian Real Estate Calculators</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              EMI, Maharashtra Stamp Duty & Registration, Brokerage with 18% GST, Rental Yield, and Affordability with built-in lead capture.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">GST-Ready Commission Invoicing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track expected vs received brokerage payouts. Generate professional tax invoices with SAC 997222, CGST+SGST, and RERA credentials.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section id="roi" className="py-16 px-4 sm:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Your Return on Investment</span>
            <h2 className="text-2xl sm:text-3xl font-black">How much more brokerage will you make with YAGHAR?</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Additional Deals Closed per Month:</span>
                  <span className="text-teal-400 font-bold">{dealsPerMonth} Deals</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={dealsPerMonth}
                  onChange={e => setDealsPerMonth(parseInt(e.target.value))}
                  className="w-full accent-teal-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Average Property Deal Value:</span>
                  <span className="text-teal-400 font-bold">₹ {avgDealValueCr} Cr</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="5.0"
                  step="0.1"
                  value={avgDealValueCr}
                  onChange={e => setAvgDealValueCr(parseFloat(e.target.value))}
                  className="w-full accent-teal-400"
                />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                By automating WhatsApp follow-ups, reactivating dead leads, and sending instant property matches, top consultants using YAGHAR close 1 to 3 extra deals every month.
              </p>
            </div>

            <div className="bg-white/10 p-6 rounded-2xl border border-white/10 text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Estimated Additional Monthly Brokerage
              </span>
              <div className="text-3xl sm:text-4xl font-black text-teal-300">
                {formatINR(additionalCommission)}
              </div>
              <p className="text-xs text-slate-400">
                At standard 2% brokerage on ₹ {avgDealValueCr} Cr properties.
              </p>
              <div className="pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-xs transition-colors"
                >
                  <span>Claim Your Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Transparent Indian Pricing</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            Simple plans that scale with your brokerage
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            14 days free trial on all plans. Pay securely in INR via UPI, NetBanking or Credit Card.
          </p>

          {/* Toggle */}
          <div className="pt-3 inline-flex items-center gap-3 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-xl transition-all ${!isAnnual ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-500'}`}
            >
              <span>Annual (2 Months Free)</span>
              <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-md uppercase font-black">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANS).filter(([k]) => k !== 'trial').map(([tier, plan]) => {
            const price = isAnnual ? Math.round(plan.priceYearlyINR / 12) : plan.priceMonthlyINR;

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
                    <p className="text-xs text-slate-500 mt-0.5">{plan.tagline}</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-3xl font-black text-slate-900">₹ {price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-500"> / month</span>
                    {isAnnual && (
                      <div className="text-[11px] text-teal-700 font-semibold mt-0.5">
                        Billed annually (₹ {plan.priceYearlyINR.toLocaleString('en-IN')}/yr)
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/signup?plan=${tier}`}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
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

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-base">
              Y
            </div>
            <div>
              <div className="font-bold text-sm">YAGHAR</div>
              <p className="text-[11px] text-slate-400">The Real Estate Operating System for India</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy (DPDP 2023)</Link>
            <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link href="/admin" className="hover:text-teal-400 transition-colors">Super Admin</Link>
          </div>

          <div className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} YAGHAR Technologies Pvt. Ltd.
          </div>
        </div>
      </footer>
    </div>
  );
}
