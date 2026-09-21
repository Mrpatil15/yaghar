import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-700" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Privacy Policy</h1>
        </div>
        <p className="text-xs text-slate-500">
          Compliant with India's Digital Personal Data Protection (DPDP) Act, 2023
        </p>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900">1. Data Fiduciary & Data Principal</h2>
          <p>
            Under the Digital Personal Data Protection Act, 2023 ("DPDP Act"), YAGHAR Technologies Pvt. Ltd. acts as a Data Processor for subscriber client leads, while the subscribing consultant/brokerage operates as the Data Fiduciary regarding buyer and seller personal data.
          </p>

          <h2 className="text-sm font-bold text-slate-900">2. Collection and Purpose of Data</h2>
          <p>
            We collect personal data strictly necessary for providing the real estate operating system, including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Consultant profile: Name, phone number, email address, RERA registration credentials, and billing details.</li>
            <li>Client lead records: Contact information, property preferences (budget, locality, BHK), site visit dates, and activity notes uploaded by the consultant.</li>
          </ul>

          <h2 className="text-sm font-bold text-slate-900">3. Multi-Tenant Data Isolation</h2>
          <p>
            Every tenant's data is strictly isolated using database-level Row Level Security (RLS) policies. No consultant or agency can view or access leads, properties, or deals of any other workspace.
          </p>

          <h2 className="text-sm font-bold text-slate-900">4. Right to Data Portability & Erasure</h2>
          <p>
            In accordance with the DPDP Act 2023, every subscriber has the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Export Data:</strong> 1-click full export of all lead records, properties, and invoices in standard JSON or CSV format.</li>
            <li><strong>Data Erasure:</strong> Request permanent deletion of their account and all associated client records upon account termination.</li>
          </ul>

          <h2 className="text-sm font-bold text-slate-900">5. Data Protection Officer (DPO) Contact</h2>
          <p>
            For any inquiries regarding data protection, grievance redressal, or exercise of your rights under the DPDP Act, contact our Grievance Officer at <strong>grievance@yaghar.in</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
