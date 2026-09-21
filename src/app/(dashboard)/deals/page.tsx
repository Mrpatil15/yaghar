'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { Deal } from '@/types/database.types';
import { formatINR, formatDate, formatPhoneDisplay } from '@/lib/formatters';
import { 
  FileText, IndianRupee, Plus, CheckCircle2, 
  Printer, Download, ShieldCheck, Building2, User, X, AlertCircle 
} from 'lucide-react';

export default function DealsPage() {
  const { deals, leads, properties, addDeal, updateDeal, workspace } = useApp();

  // Create Deal Modal
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || '');
  const [selectedPropId, setSelectedPropId] = useState(properties[0]?.id || '');
  const [dealValueLakh, setDealValueLakh] = useState('150'); // 1.5 Cr
  const [brokeragePct, setBrokeragePct] = useState('2.0');
  const [includeGST, setIncludeGST] = useState(true);
  const [clientGstin, setClientGstin] = useState('');
  const [clientPan, setClientPan] = useState('');

  // Invoice view modal
  const [invoiceDeal, setInvoiceDeal] = useState<Deal | null>(null);

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const dealValueINR = parseFloat(dealValueLakh) * 100000;
    const bPct = parseFloat(brokeragePct);
    const comm = Math.round((dealValueINR * bPct) / 100);
    const gst = includeGST ? Math.round(comm * 0.18) : 0;

    addDeal({
      lead_id: selectedLeadId,
      property_id: selectedPropId,
      deal_value: dealValueINR,
      deal_type: 'sale',
      brokerage_percentage: bPct,
      total_commission: comm,
      gst_applicable: includeGST,
      gst_amount: gst,
      expected_payout_date: new Date(Date.now() + 15 * 86400000).toISOString(),
      received_amount: 0,
      status: 'in_progress',
      invoice_number: `INV-${new Date().getFullYear()}-${String(deals.length + 1).padStart(3, '0')}`,
      client_gstin: clientGstin.trim() || null,
      client_pan: clientPan.trim() || null,
    });

    setIsAddDealOpen(false);
    setClientGstin('');
    setClientPan('');
  };

  const totalClosedCommission = deals
    .filter(d => d.status === 'closed' || d.status === 'in_progress')
    .reduce((acc, d) => acc + d.total_commission, 0);

  const totalReceived = deals.reduce((acc, d) => acc + d.received_amount, 0);
  const pendingPayout = totalClosedCommission - totalReceived;

  const getLead = (id: string) => leads.find(l => l.id === id);
  const getProp = (id: string) => properties.find(p => p.id === id);

  return (
    <div className="space-y-6">
      <Header
        title="Deals & Commission Tracker"
        subtitle="Manage deal payouts, splits, and generate GST-compliant tax invoices"
      />

      <div className="px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Expected Commission</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{formatINR(totalClosedCommission)}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Brokerage Received</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{formatINR(totalReceived)}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending Payout</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{formatINR(pendingPayout)}</div>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-600">
            {deals.length} Active & Closed Deals
          </div>

          <button
            onClick={() => setIsAddDealOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Deal</span>
          </button>
        </div>

        {/* Deals List */}
        <div className="space-y-3.5">
          {deals.map(deal => {
            const lead = getLead(deal.lead_id);
            const prop = getProp(deal.property_id);

            return (
              <div
                key={deal.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{lead?.name || 'Client'}</h4>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-semibold">{prop?.title || 'Property'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        deal.status === 'closed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {deal.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Invoice: <span className="font-mono font-semibold text-slate-700">{deal.invoice_number || 'INV-DRAFT'}</span>
                      {deal.expected_payout_date && <span> • Due: {formatDate(deal.expected_payout_date)}</span>}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Deal Value</span>
                    <span className="text-base font-black text-slate-900">{formatINR(deal.deal_value)}</span>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Brokerage Rate</span>
                    <span className="font-bold text-slate-800">{deal.brokerage_percentage}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Base Commission</span>
                    <span className="font-bold text-slate-800">{formatINR(deal.total_commission)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">18% GST</span>
                    <span className="font-bold text-slate-800">{formatINR(deal.gst_amount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Received So Far</span>
                    <span className="font-bold text-emerald-700">{formatINR(deal.received_amount)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-500">
                    Pending: <strong className="text-amber-700">{formatINR(deal.total_commission - deal.received_amount)}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {deal.status === 'in_progress' && (
                      <button
                        onClick={() => updateDeal(deal.id, { status: 'closed', received_amount: deal.total_commission })}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                      >
                        Mark Fully Paid
                      </button>
                    )}

                    <button
                      onClick={() => setInvoiceDeal(deal)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Tax Invoice</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Deal Modal */}
      {isAddDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Record Closed / Booked Deal</h3>
              <button
                onClick={() => setIsAddDealOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Client (Lead)</label>
                <select
                  value={selectedLeadId}
                  onChange={e => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({formatPhoneDisplay(l.phone)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Property</label>
                <select
                  value={selectedPropId}
                  onChange={e => setSelectedPropId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} — {formatINR(p.price)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agreed Deal Value (₹ Lakhs)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    value={dealValueLakh}
                    onChange={e => setDealValueLakh(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brokerage %</label>
                  <select
                    value={brokeragePct}
                    onChange={e => setBrokeragePct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="1.0">1.0%</option>
                    <option value="2.0">2.0%</option>
                    <option value="2.5">2.5%</option>
                    <option value="3.0">3.0%</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGST}
                      onChange={e => setIncludeGST(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-700"
                    />
                    <span>Add 18% GST</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client PAN (Optional)</label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={clientPan}
                    onChange={e => setClientPan(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="27ABCDE1234F1Z5"
                    value={clientGstin}
                    onChange={e => setClientGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDealOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Deal & Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GST TAX INVOICE MODAL / PRINTABLE SHEET */}
      {invoiceDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700" />
                <span className="font-bold text-sm text-slate-900">GST-Ready Tax Invoice</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setInvoiceDeal(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="p-6 border border-slate-200 rounded-2xl space-y-6 text-xs text-slate-800 bg-white">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">{workspace.name}</h2>
                  <p className="text-slate-500">{workspace.city}, India</p>
                  <p className="text-slate-500">Phone: {workspace.phone}</p>
                  {workspace.rera_number && (
                    <p className="text-amber-800 font-semibold mt-1">MahaRERA: {workspace.rera_number}</p>
                  )}
                  <p className="text-slate-500 font-mono">SAC Code: 997222 (Real Estate Agent Services)</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-teal-800 uppercase tracking-wider block">Tax Invoice</span>
                  <div className="text-xs font-bold text-slate-900 mt-1">Invoice No: {invoiceDeal.invoice_number}</div>
                  <div className="text-slate-500">Date: {formatDate(invoiceDeal.created_at)}</div>
                  <div className="text-slate-500">Status: <strong className="uppercase text-emerald-700">{invoiceDeal.status}</strong></div>
                </div>
              </div>

              {/* Billed To */}
              <div className="border-b border-slate-200 pb-4">
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Billed To (Client):</span>
                <div className="font-bold text-sm text-slate-900">{getLead(invoiceDeal.lead_id)?.name}</div>
                <div className="text-slate-500">{formatPhoneDisplay(getLead(invoiceDeal.lead_id)?.phone || '')}</div>
                {invoiceDeal.client_pan && <div className="font-mono">PAN: {invoiceDeal.client_pan}</div>}
                {invoiceDeal.client_gstin && <div className="font-mono">GSTIN: {invoiceDeal.client_gstin}</div>}
              </div>

              {/* Service Details Table */}
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-y border-slate-200">
                  <tr>
                    <th className="p-2.5">Description of Professional Services</th>
                    <th className="p-2.5 text-right">Deal Value</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-right">Taxable Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-900">Real Estate Consultancy & Brokerage</div>
                      <div className="text-[11px] text-slate-500">
                        Property: {getProp(invoiceDeal.property_id)?.title} ({getProp(invoiceDeal.property_id)?.locality})
                      </div>
                    </td>
                    <td className="p-2.5 text-right font-mono">{formatINR(invoiceDeal.deal_value)}</td>
                    <td className="p-2.5 text-right font-mono">{invoiceDeal.brokerage_percentage}%</td>
                    <td className="p-2.5 text-right font-mono font-bold">{formatINR(invoiceDeal.total_commission)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Tax Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Taxable Value:</span>
                    <span className="font-bold font-mono">{formatINR(invoiceDeal.total_commission)}</span>
                  </div>
                  {invoiceDeal.gst_applicable && (
                    <>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">CGST @ 9%:</span>
                        <span className="font-mono">{formatINR(invoiceDeal.gst_amount / 2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">SGST @ 9%:</span>
                        <span className="font-mono">{formatINR(invoiceDeal.gst_amount / 2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 font-bold text-sm text-slate-900">
                    <span>Total Amount Payable:</span>
                    <span className="font-mono text-teal-800">
                      {formatINR(invoiceDeal.total_commission + invoiceDeal.gst_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank Details Note */}
              <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p><strong>Payment Terms:</strong> Brokerage payable upon agreement registration or token handover.</p>
                <p>This is a computer-generated tax invoice compliant with Indian GST laws and MahaRERA guidelines.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
