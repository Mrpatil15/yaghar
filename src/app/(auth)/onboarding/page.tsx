'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Building2, Sparkles, ShieldCheck, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

const POPULAR_LOCALITIES = [
  'Borivali East', 'Andheri West', 'Bandra West', 'Thane West', 
  'Wakad Pune', 'Whitefield Bengaluru', 'Gurugram Cyber City', 'Noida Sec 62'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { workspace, setWorkspace, loadDemoData } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(workspace.name || '');
  const [city, setCity] = useState(workspace.city || 'Mumbai');
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>(workspace.focus_localities || ['Borivali East', 'Thane West']);
  const [customLocality, setCustomLocality] = useState('');
  const [reraNumber, setReraNumber] = useState(workspace.rera_number || '');
  const [brandColor, setBrandColor] = useState(workspace.brand_color || '#0f766e');

  const toggleLocality = (loc: string) => {
    setSelectedLocalities(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const handleAddCustomLocality = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customLocality.trim()) {
      e.preventDefault();
      if (!selectedLocalities.includes(customLocality.trim())) {
        setSelectedLocalities(prev => [...prev, customLocality.trim()]);
      }
      setCustomLocality('');
    }
  };

  const handleComplete = (withDemoData: boolean) => {
    if (withDemoData) {
      loadDemoData();
    } else {
      setWorkspace({
        ...workspace,
        name: name.trim() || 'My Real Estate Agency',
        city,
        focus_localities: selectedLocalities,
        rera_number: reraNumber.trim() || null,
        brand_color: brandColor,
      });
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Progress bar */}
        <div className="bg-slate-100 h-1.5 w-full">
          <div 
            className="bg-teal-600 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 sm:p-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
                Y
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 leading-tight">YAGHAR Setup</h1>
                <p className="text-xs text-slate-500">Step {step} of 3 • Under 3 minutes</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              India Edition
            </span>
          </div>

          {/* Step 1: Workspace Name & Localities */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Brokerage / Brand Name</h2>
                <p className="text-xs text-slate-500">This will appear on your client microsite and WhatsApp shares</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Firm or Consultant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shree Ganesh Realty / Rohit Sharma & Associates"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Operating City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Pune, Thane, Bengaluru"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Focus Localities (Click to select)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {POPULAR_LOCALITIES.map(loc => {
                    const isSelected = selectedLocalities.includes(loc);
                    return (
                      <button
                        type="button"
                        key={loc}
                        onClick={() => toggleLocality(loc)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  placeholder="Type custom locality and press Enter..."
                  value={customLocality}
                  onChange={e => setCustomLocality(e.target.value)}
                  onKeyDown={handleAddCustomLocality}
                  className="w-full px-3.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: RERA & Branding */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-slate-900">RERA Compliance & Branding</h2>
                <p className="text-xs text-slate-500">Build instant trust with verified credentials</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RERA Agent Registration Number (Optional)
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. A51900012345"
                    value={reraNumber}
                    onChange={e => setReraNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Will be displayed on your invoices and public listings to comply with state RERA regulations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Brand Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={e => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                  />
                  <span className="text-xs font-mono text-slate-600">{brandColor}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <span>Next: Choose Starting Data</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Demo Data or Clean Slate */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-slate-900">Get Started on Day One</h2>
                <p className="text-xs text-slate-500">Run your real estate business immediately</p>
              </div>

              <div className="space-y-3">
                {/* Option 1: Load Demo Data (Recommended) */}
                <div 
                  onClick={() => handleComplete(true)}
                  className="p-5 rounded-2xl border-2 border-teal-600 bg-teal-50/40 hover:bg-teal-50 cursor-pointer transition-all space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-700" />
                      <span className="font-bold text-sm text-slate-900">Load Ready-to-Use Demo Data (Recommended)</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-teal-700 text-white">
                      Instant Day 1
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Seeds 6 realistic Indian leads, 5 Mumbai/Pune listings (Oberoi, Godrej, Hiranandani), ready WhatsApp templates, a sample deal, and legal checklist.
                  </p>
                </div>

                {/* Option 2: Empty workspace */}
                <div 
                  onClick={() => handleComplete(false)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-400 bg-white cursor-pointer transition-all space-y-1 text-slate-700"
                >
                  <div className="font-bold text-xs">Start with a Blank Slate</div>
                  <p className="text-xs text-slate-500">
                    Start fresh without demo data. You can load demo data later anytime from the sidebar.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
