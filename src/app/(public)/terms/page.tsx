import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: September 2026 • Applicable across India</p>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900">1. Agreement to Terms</h2>
          <p>
            By signing up, accessing, or using YAGHAR (the "Service") operated by YAGHAR Technologies Pvt. Ltd., you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a real estate firm, agency, or brokerage, you represent that you have authority to bind such entity.
          </p>

          <h2 className="text-sm font-bold text-slate-900">2. Real Estate Regulatory Authority (RERA) Compliance</h2>
          <p>
            Subscribers are solely responsible for ensuring that their real estate consultancy and brokerage operations comply with the Real Estate (Regulation and Development) Act, 2016 (RERA) and respective State Real Estate Regulatory Authority guidelines (such as MahaRERA, K-RERA, UP RERA). You agree to provide accurate and valid RERA registration credentials when generating invoices and public microsite listings.
          </p>

          <h2 className="text-sm font-bold text-slate-900">3. SaaS Subscriptions & Billing</h2>
          <p>
            YAGHAR provides a 14-day free trial. Following the trial period, access requires an active paid subscription billed in Indian Rupees (INR) via Razorpay. All fees are exclusive of applicable Goods and Services Tax (GST @ 18%), which will be charged on each transaction.
          </p>

          <h2 className="text-sm font-bold text-slate-900">4. User Content & Intellectual Property</h2>
          <p>
            You retain all rights and ownership of your client leads, property inventory, photographs, and commission agreements entered into YAGHAR. YAGHAR does not sell, broker, or claim ownership of any listings or client data.
          </p>

          <h2 className="text-sm font-bold text-slate-900">5. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
          </p>
        </div>
      </div>
    </div>
  );
}
