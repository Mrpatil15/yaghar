'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { formatINR, normalizeIndianPhone } from '@/lib/formatters';
import { useApp } from '@/context/AppContext';
import { Calculator, IndianRupee, FileText, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

type CalcType = 'emi' | 'stamp_duty' | 'brokerage' | 'rental_yield' | 'affordability';

export default function CalculatorsPage() {
  const { addLead, workspace } = useApp();
  const [activeTab, setActiveTab] = useState<CalcType>('emi');

  // Lead capture state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [calcSummaryText, setCalcSummaryText] = useState('');
  const [leadCaptured, setLeadCaptured] = useState(false);

  // 1. EMI State
  const [loanAmountLakh, setLoanAmountLakh] = useState('50'); // 50 Lakhs
  const [interestRate, setInterestRate] = useState('8.5'); // 8.5%
  const [tenureYears, setTenureYears] = useState('20');

  const p = (parseFloat(loanAmountLakh) || 0) * 100000;
  const r = (parseFloat(interestRate) || 0) / 12 / 100;
  const n = (parseFloat(tenureYears) || 0) * 12;

  const monthlyEMI = n > 0 && r > 0 ? Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : 0;
  const totalPayment = monthlyEMI * n;
  const totalInterest = totalPayment - p;

  // 2. Stamp Duty State (Maharashtra default)
  const [propertyPriceLakh, setPropertyPriceLakh] = useState('85');
  const [state, setState] = useState<'maharashtra' | 'karnataka' | 'delhi' | 'gujarat'>('maharashtra');
  const [buyerGender, setBuyerGender] = useState<'male' | 'female' | 'joint'>('male');

  const propValue = (parseFloat(propertyPriceLakh) || 0) * 100000;
  
  let stampDutyPct = 5.0; // Maharashtra base
  if (state === 'maharashtra') {
    stampDutyPct = buyerGender === 'female' ? 4.0 : 5.0; // 1% female concession in Maharashtra
    // 1% metro cess in Mumbai/Pune
    stampDutyPct += 1.0;
  } else if (state === 'karnataka') {
    stampDutyPct = 5.6; // 5% + cess
  } else if (state === 'delhi') {
    stampDutyPct = buyerGender === 'female' ? 4.0 : 6.0;
  } else if (state === 'gujarat') {
    stampDutyPct = 4.9;
  }

  const stampDutyAmount = Math.round((propValue * stampDutyPct) / 100);
  // Maharashtra registration fee is 1% capped at ₹ 30,000 for properties > 30L
  const registrationFee = state === 'maharashtra' 
    ? Math.min(30000, Math.round(propValue * 0.01))
    : Math.round(propValue * 0.01);
  const totalGovtCharges = stampDutyAmount + registrationFee;

  // 3. Brokerage State
  const [dealValueLakh, setDealValueLakh] = useState('100'); // 1 Cr
  const [brokeragePct, setBrokeragePct] = useState('2.0'); // 2%
  const [includeGST, setIncludeGST] = useState(true);

  const dealINR = (parseFloat(dealValueLakh) || 0) * 100000;
  const rawBrokerage = Math.round((dealINR * (parseFloat(brokeragePct) || 0)) / 100);
  const gstAmount = includeGST ? Math.round(rawBrokerage * 0.18) : 0;
  const totalBrokerageWithGST = rawBrokerage + gstAmount;

  // 4. Rental Yield State
  const [totalCostLakh, setTotalCostLakh] = useState('75');
  const [monthlyRent, setMonthlyRent] = useState('28000');
  const [annualMaintenance, setAnnualMaintenance] = useState('36000');

  const totalCostINR = (parseFloat(totalCostLakh) || 0) * 100000;
  const annualRent = (parseFloat(monthlyRent) || 0) * 12;
  const annualMaint = parseFloat(annualMaintenance) || 0;
  const grossYield = totalCostINR > 0 ? ((annualRent / totalCostINR) * 100).toFixed(2) : '0';
  const netYield = totalCostINR > 0 ? (((annualRent - annualMaint) / totalCostINR) * 100).toFixed(2) : '0';

  // 5. Affordability State
  const [monthlyIncome, setMonthlyIncome] = useState('150000'); // 1.5 Lakhs/mo
  const [existingEmis, setExistingEmis] = useState('15000');

  const income = parseFloat(monthlyIncome) || 0;
  const existing = parseFloat(existingEmis) || 0;
  const maxAllowedEMI = Math.max(0, Math.round(income * 0.5 - existing)); // 50% FOIR
  // Max loan calculation based on 8.5% for 20 years
  const approxMaxLoan = r > 0 ? Math.round((maxAllowedEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))) : 0;

  const triggerLeadCapture = (summary: string) => {
    setCalcSummaryText(summary);
    setIsLeadModalOpen(true);
  };

  const handleCaptureLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;

    addLead({
      name: leadName.trim(),
      phone: normalizeIndianPhone(leadPhone),
      stage: 'new',
      source: 'manual',
      tags: ['Calculator Lead'],
      notes: `Lead captured from ${activeTab.toUpperCase()} Calculator. Details: ${calcSummaryText}`,
      preferred_bhk: ['2 BHK'],
      preferred_localities: workspace.focus_localities.slice(0, 2),
      property_type: 'residential_buy',
    });

    setLeadCaptured(true);
    setTimeout(() => {
      setLeadCaptured(false);
      setIsLeadModalOpen(false);
      setLeadName('');
      setLeadPhone('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Real Estate Calculators"
        subtitle="Indian property calculators with state stamp duties, GST, and lead capture"
      />

      <div className="px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200">
          {[
            { id: 'emi', label: 'Home Loan EMI' },
            { id: 'stamp_duty', label: 'Stamp Duty & Reg.' },
            { id: 'brokerage', label: 'Brokerage & 18% GST' },
            { id: 'rental_yield', label: 'Rental Yield' },
            { id: 'affordability', label: 'Loan Affordability' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CalcType)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. EMI CALCULATOR */}
        {activeTab === 'emi' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">Home Loan EMI Calculator</h3>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Loan Amount:</span>
                  <span className="text-teal-700 font-bold">{formatINR(p)}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={loanAmountLakh}
                  onChange={e => setLoanAmountLakh(e.target.value)}
                  className="w-full accent-teal-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>₹ 5 Lakhs</span>
                  <span>₹ 5 Crores</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Interest Rate (% per annum):</span>
                  <span className="text-teal-700 font-bold">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="6.5"
                  max="14.0"
                  step="0.1"
                  value={interestRate}
                  onChange={e => setInterestRate(e.target.value)}
                  className="w-full accent-teal-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>6.5%</span>
                  <span>14.0%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Loan Tenure (Years):</span>
                  <span className="text-teal-700 font-bold">{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={tenureYears}
                  onChange={e => setTenureYears(e.target.value)}
                  className="w-full accent-teal-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1 Year</span>
                  <span>30 Years</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Loan EMI</span>
                <div className="text-3xl font-black text-teal-800 mt-1">
                  {formatINR(monthlyEMI)}
                </div>
                <span className="text-xs text-slate-500">per month for {tenureYears} years</span>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Principal Loan:</span>
                  <span className="font-bold text-slate-900">{formatINR(p)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Interest Payable:</span>
                  <span className="font-bold text-slate-900">{formatINR(totalInterest)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Payment (P + I):</span>
                  <span>{formatINR(totalPayment)}</span>
                </div>
              </div>

              <button
                onClick={() => triggerLeadCapture(`Loan: ${formatINR(p)}, EMI: ${formatINR(monthlyEMI)}/mo for ${tenureYears} yrs`)}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Detailed Calculation to WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. STAMP DUTY & REGISTRATION */}
        {activeTab === 'stamp_duty' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">Stamp Duty & Registration Calculator</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="maharashtra">Maharashtra</option>
                    <option value="karnataka">Karnataka</option>
                    <option value="delhi">Delhi</option>
                    <option value="gujarat">Gujarat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Buyer Gender</label>
                  <select
                    value={buyerGender}
                    onChange={e => setBuyerGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="male">Male (Standard)</option>
                    <option value="female">Female (1% Concession)</option>
                    <option value="joint">Joint (Male + Female)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Agreement Value:</span>
                  <span className="text-teal-700 font-bold">{formatINR(propValue)}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="5"
                  value={propertyPriceLakh}
                  onChange={e => setPropertyPriceLakh(e.target.value)}
                  className="w-full accent-teal-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>₹ 20 Lakhs</span>
                  <span>₹ 10 Crores</span>
                </div>
              </div>

              {state === 'maharashtra' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Maharashtra Government Rules:</span>
                  </div>
                  <div>• 5% Base Stamp Duty + 1% Metro Cess (Mumbai/Pune/Thane/Nagpur) = 6%</div>
                  <div>• 1% Female Buyer Concession applied if registered solely in woman's name</div>
                  <div>• Registration fee is 1% capped at ₹ 30,000 for properties above ₹ 30 Lakhs</div>
                </div>
              )}
            </div>

            {/* Results */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Govt. Charges</span>
                <div className="text-3xl font-black text-teal-800 mt-1">
                  {formatINR(totalGovtCharges)}
                </div>
                <span className="text-xs text-slate-500">Stamp Duty + Registration</span>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Stamp Duty ({stampDutyPct}%):</span>
                  <span className="font-bold text-slate-900">{formatINR(stampDutyAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration Fee:</span>
                  <span className="font-bold text-slate-900">{formatINR(registrationFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Outflow (Value + Taxes):</span>
                  <span>{formatINR(propValue + totalGovtCharges)}</span>
                </div>
              </div>

              <button
                onClick={() => triggerLeadCapture(`Property: ${formatINR(propValue)}, Stamp Duty: ${formatINR(stampDutyAmount)}, Reg: ${formatINR(registrationFee)}`)}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Share Stamp Duty Sheet on WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. BROKERAGE & 18% GST */}
        {activeTab === 'brokerage' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">Brokerage & GST Calculator</h3>
              <p className="text-xs text-slate-500">Standard Indian brokerage billing under SAC 997222 with 18% GST</p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deal Value (₹ Lakhs)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={dealValueLakh}
                    onChange={e => setDealValueLakh(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div className="text-[11px] text-teal-700 font-bold mt-1">Value: {formatINR(dealINR)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brokerage %</label>
                  <select
                    value={brokeragePct}
                    onChange={e => setBrokeragePct(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="1.0">1.0% (Buyer / Seller)</option>
                    <option value="2.0">2.0% (Standard Sale)</option>
                    <option value="3.0">3.0% (Exclusive mandate)</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGST}
                      onChange={e => setIncludeGST(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-700"
                    />
                    <span>Include 18% GST</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Commission Payable</span>
                <div className="text-3xl font-black text-teal-800 mt-1">
                  {formatINR(totalBrokerageWithGST)}
                </div>
                <span className="text-xs text-slate-500">Including 18% GST (CGST 9% + SGST 9%)</span>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Brokerage ({brokeragePct}%):</span>
                  <span className="font-bold text-slate-900">{formatINR(rawBrokerage)}</span>
                </div>
                {includeGST && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CGST (9%):</span>
                      <span className="font-bold text-slate-900">{formatINR(gstAmount / 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SGST (9%):</span>
                      <span className="font-bold text-slate-900">{formatINR(gstAmount / 2)}</span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => triggerLeadCapture(`Deal: ${formatINR(dealINR)}, Commission: ${formatINR(rawBrokerage)} + GST ${formatINR(gstAmount)}`)}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Quotation to WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. RENTAL YIELD */}
        {activeTab === 'rental_yield' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">Rental Yield Calculator</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Property Purchase Cost (₹ Lakhs)</label>
                <input
                  type="number"
                  value={totalCostLakh}
                  onChange={e => setTotalCostLakh(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Monthly Rent (₹)</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={e => setMonthlyRent(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Maintenance & Tax Outflow (₹)</label>
                <input
                  type="number"
                  value={annualMaintenance}
                  onChange={e => setAnnualMaintenance(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Gross Yield</span>
                  <div className="text-3xl font-black text-teal-800 mt-1">{grossYield}%</div>
                  <span className="text-[11px] text-slate-400">Annual Rent / Cost</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Net Yield</span>
                  <div className="text-3xl font-black text-emerald-700 mt-1">{netYield}%</div>
                  <span className="text-[11px] text-slate-400">After maintenance</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Annual Rental Income:</span>
                  <span className="font-bold text-slate-900">{formatINR(annualRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Net Annual Inflow:</span>
                  <span className="font-bold text-slate-900">{formatINR(annualRent - annualMaint)}</span>
                </div>
              </div>

              <button
                onClick={() => triggerLeadCapture(`Property Cost: ${formatINR(totalCostINR)}, Rent: ₹${monthlyRent}/mo, Gross Yield: ${grossYield}%, Net Yield: ${netYield}%`)}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Share Yield Analysis on WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. AFFORDABILITY CALCULATOR */}
        {activeTab === 'affordability' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">Home Loan Affordability Calculator</h3>
              <p className="text-xs text-slate-500">Calculates maximum eligible loan based on 50% FOIR banking norms</p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly In-Hand Salary (₹)</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Existing Monthly EMIs (Car/Personal/Credit) (₹)</label>
                <input
                  type="number"
                  value={existingEmis}
                  onChange={e => setExistingEmis(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Eligible Loan</span>
                <div className="text-3xl font-black text-teal-800 mt-1">
                  {formatINR(approxMaxLoan)}
                </div>
                <span className="text-xs text-slate-500">At 8.5% interest for 20 years</span>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Allowable EMI (50% FOIR):</span>
                  <span className="font-bold text-slate-900">{formatINR(maxAllowedEMI)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approx Affordable Property (with 20% down payment):</span>
                  <span className="font-bold text-emerald-700">{formatINR(approxMaxLoan * 1.25)}</span>
                </div>
              </div>

              <button
                onClick={() => triggerLeadCapture(`Income: ₹${monthlyIncome}/mo, Max Eligible Loan: ${formatINR(approxMaxLoan)}, Max EMI: ${formatINR(maxAllowedEMI)}/mo`)}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Eligibility Report to WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Capture Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">Send Calculation via WhatsApp</h3>
            <p className="text-xs text-slate-500">
              Enter client details to send this calculation directly and add them to your CRM.
            </p>

            {leadCaptured ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900">Calculation Sent & Lead Saved!</h4>
              </div>
            ) : (
              <form onSubmit={handleCaptureLead} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Gupta"
                    value={leadName}
                    onChange={e => setLeadName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number (+91)</label>
                  <input
                    type="tel"
                    required
                    placeholder="98201 23456"
                    value={leadPhone}
                    onChange={e => setLeadPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                  <strong>Attached Calculation:</strong> {calcSummaryText}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsLeadModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs"
                  >
                    Send & Save Lead
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
