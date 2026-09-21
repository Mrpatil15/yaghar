'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { PLANS } from '@/lib/plans';
import { formatINR, formatDate } from '@/lib/formatters';
import { 
  CreditCard, ShieldCheck, CheckCircle2, ArrowRight, 
  Sparkles, AlertCircle, RefreshCw, Zap 
} from 'lucide-react';
import { PlanTier } from '@/types/database.types';

export default function BillingPage() {
  const { workspace, setWorkspace, plan, leads, properties } = useApp();
  const [isAnnual, setIsAnnual] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const leadsUsagePct = Math.min(100, Math.round((leads.length / plan.limits.maxLeads) * 100));
  const propertiesUsagePct = Math.min(100, Math.round((properties.length / plan.limits.maxProperties) * 100));

  const handleSelectPlan = (tier: PlanTier) => {
    setIsProcessing(tier);
    // Simulate Razorpay checkout
    setTimeout(() => {
      setWorkspace({
        ...workspace,
        plan_tier: tier,
        subscription_status: 'active',
        trial_ends_at: new Date(Date.now() + 365 * 86400000).toISOString(),
      });
      setIsProcessing(null);
      setSuccessMsg(`Successfully upgraded to the ${PLANS[tier].name}! Your subscription is now active.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Billing & Subscription Plans"
        subtitle="Manage your Razorpay subscription, plan limits, and invoicing"
      />

      <div className="px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Current Plan</span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-black uppercase">
                  {workspace.plan_tier}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  workspace.subscription_status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {workspace.subscription_status}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{plan.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{plan.tagline}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block">Renews / Expires:</span>
              <span className="font-bold text-xs text-slate-800">{formatDate(workspace.trial_ends_at)}</span>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Leads Capacity</span>
                <span className="font-bold text-slate-900">{leads.length} / {plan.limits.maxLeads}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    leadsUsagePct > 80 ? 'bg-rose-500' : 'bg-teal-600'
                  }`}
                  style={{ width: `${leadsUsagePct}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400">
                {plan.limits.maxLeads - leads.length} lead slots remaining
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Property Listings Capacity</span>
                <span className="font-bold text-slate-900">{properties.length} / {plan.limits.maxProperties}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    propertiesUsagePct > 80 ? 'bg-rose-500' : 'bg-teal-600'
                  }`}
                  style={{ width: `${propertiesUsagePct}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400">
                {plan.limits.maxProperties - properties.length} listing slots remaining
              </span>
            </div>
          </div>
        </div>

        {/* Upgrade Plans Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Available Plans</h3>
              <p className="text-xs text-slate-500">Upgrade anytime to increase leads and team seats</p>
            </div>

            {/* Toggle */}
            <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-3 py-1.5 rounded-lg transition-all ${!isAnnual ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-3 py-1.5 rounded-lg transition-all ${isAnnual ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-500'}`}
              >
                Annual (Save 17%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Object.entries(PLANS).filter(([k]) => k !== 'trial').map(([tier, pConfig]) => {
              const price = isAnnual ? Math.round(pConfig.priceYearlyINR / 12) : pConfig.priceMonthlyINR;
              const isCurrent = workspace.plan_tier === tier;

              return (
                <div
                  key={tier}
                  className={`bg-white rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                    isCurrent
                      ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-md'
                      : 'border-slate-200 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-base text-slate-900">{pConfig.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 uppercase">
                          Current
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-2xl font-black text-slate-900">₹ {price.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-500"> / month</span>
                      {isAnnual && (
                        <div className="text-[11px] text-teal-700 font-semibold mt-0.5">
                          Billed annually (₹ {pConfig.priceYearlyINR.toLocaleString('en-IN')}/yr)
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                      {pConfig.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      disabled={isCurrent || isProcessing === tier}
                      onClick={() => handleSelectPlan(tier as PlanTier)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : 'bg-teal-700 hover:bg-teal-800 text-white shadow-sm'
                      }`}
                    >
                      {isProcessing === tier ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Connecting to Razorpay...</span>
                        </>
                      ) : isCurrent ? (
                        <span>Current Active Plan</span>
                      ) : (
                        <span>Upgrade to {pConfig.name}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
