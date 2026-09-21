import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LEGAL_ENTITY_NAME, SUPPORT_EMAIL } from '@/config/site';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Cancellation &amp; Refund Policy</h1>
        <p className="text-xs text-slate-500">Transparent subscription terms for Indian brokers</p>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900">1. 14-Day Risk-Free Trial</h2>
          <p>
            {LEGAL_ENTITY_NAME} offers a 14-day fully functional free trial without requiring credit card details upfront. You may evaluate the software and its features with zero financial obligation.
          </p>

          <h2 className="text-sm font-bold text-slate-900">2. Subscription Cancellation</h2>
          <p>
            You can cancel your recurring Razorpay subscription at any time directly from the <em>Settings &gt; Billing</em> page. Upon cancellation, your workspace remains fully active until the end of the current paid billing cycle.
          </p>

          <h2 className="text-sm font-bold text-slate-900">3. Refund Eligibility</h2>
          <p>
            If you encounter technical defects that prevent you from using the service, or if you were billed inadvertently within 7 days of subscription renewal without usage, you may request a refund by emailing{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-teal-700 font-bold hover:underline">
              {SUPPORT_EMAIL}
            </a>. Approved refunds will be processed back to the original payment source (UPI / NetBanking / Card) within 5 to 7 business days via Razorpay.
          </p>
        </div>
      </div>
    </div>
  );
}
