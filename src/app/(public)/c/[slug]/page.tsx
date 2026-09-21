'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatINR, formatPhoneDisplay, getWhatsAppUrl, normalizeIndianPhone } from '@/lib/formatters';
import { 
  Building2, Phone, MessageSquare, ShieldCheck, Star, 
  MapPin, CheckCircle2, QrCode, Share2, Send, X, ExternalLink 
} from 'lucide-react';
import QRCode from 'qrcode';

export default function ConsultantMicrositePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { workspace, properties, microsite, addLead } = useApp();

  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadRequirement, setLeadRequirement] = useState('');
  const [leadBhk, setLeadBhk] = useState('2 BHK');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Generate QR code for the current URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      QRCode.toDataURL(url, { width: 300, margin: 2 }, (err, dataUrl) => {
        if (!err && dataUrl) {
          setQrDataUrl(dataUrl);
        }
      });
    }
  }, []);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;

    addLead({
      name: leadName.trim(),
      phone: normalizeIndianPhone(leadPhone),
      stage: 'new',
      source: 'microsite',
      preferred_bhk: [leadBhk],
      preferred_localities: workspace.focus_localities.slice(0, 2),
      property_type: 'residential_buy',
      tags: ['Microsite Inquiry'],
      notes: `Inquiry submitted via public microsite. Requirement: ${leadRequirement || 'General property inquiry'}`,
    });

    setFormSubmitted(true);
    setTimeout(() => {
      setLeadName('');
      setLeadPhone('');
      setLeadRequirement('');
      setFormSubmitted(false);
    }, 4000);
  };

  const primaryColor = workspace.brand_color || '#0f766e';
  const availableProperties = properties.filter(p => p.status === 'available');

  const defaultWaText = `Namaste ${workspace.name}! 🙏 I visited your profile on YAGHAR and would like to consult with you regarding property options in ${workspace.city}.`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">
      {/* Top Bar / Consultant Identity */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-8 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              {workspace.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 leading-tight">{workspace.name}</h1>
              <p className="text-xs text-slate-500">{workspace.city} • Verified Real Estate Advisor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <a
              href={getWhatsAppUrl(workspace.phone || '+919820123456', defaultWaText)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-900 to-slate-900 text-white py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {workspace.rera_number && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Registered MahaRERA Agent: {workspace.rera_number}</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {microsite.tagline || `Find Verified Properties in ${workspace.city} with Complete Legal Peace of Mind`}
          </h2>

          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {microsite.about_text || `With years of market experience, we help homebuyers and investors navigate RERA-compliant resale flats, developer projects, and rental agreements.`}
          </p>

          {/* Stats Badges */}
          <div className="pt-4 grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xl sm:text-2xl font-black text-teal-300">{microsite.experience_years}+</div>
              <div className="text-[11px] text-slate-300">Years Experience</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xl sm:text-2xl font-black text-teal-300">{microsite.properties_sold}+</div>
              <div className="text-[11px] text-slate-300">Deals Closed</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-xl sm:text-2xl font-black text-teal-300">{microsite.happy_clients}+</div>
              <div className="text-[11px] text-slate-300">Happy Families</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Listings & Lead Form */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 -mt-6 space-y-12">
        {/* Quick Contact & Lead Capture Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Fast Property Consultation</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Tell us your requirement. We'll share curated options within 30 minutes.
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Zero spam. Direct WhatsApp updates with photos, floor plans, and verified pricing.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {workspace.focus_localities.map(loc => (
                  <span key={loc} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    📍 {loc}
                  </span>
                ))}
              </div>
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleLeadSubmit} className="space-y-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              {formSubmitted ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-900">Thank you! Your requirement is received.</h4>
                  <p className="text-xs text-slate-500">
                    We will connect with you on WhatsApp shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ankit Verma"
                        value={leadName}
                        onChange={e => setLeadName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Phone (+91)</label>
                      <input
                        type="tel"
                        required
                        placeholder="98201 23456"
                        value={leadPhone}
                        onChange={e => setLeadPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Looking for</label>
                      <select
                        value={leadBhk}
                        onChange={e => setLeadBhk(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="1 BHK">1 BHK Flat</option>
                        <option value="2 BHK">2 BHK Flat</option>
                        <option value="3 BHK">3 BHK Luxury</option>
                        <option value="4+ BHK">4+ BHK / Penthouse</option>
                        <option value="Commercial">Commercial / Office</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Budget</label>
                      <input
                        type="text"
                        placeholder="e.g. 75 Lakhs - 1.2 Cr"
                        value={leadRequirement}
                        onChange={e => setLeadRequirement(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Get Matching Properties on WhatsApp</span>
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Featured Property Listings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">Featured Listings</h3>
              <p className="text-xs text-slate-500">Curated, legally verified properties ready for inspection</p>
            </div>
            <span className="text-xs font-semibold text-teal-700">
              {availableProperties.length} Properties Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableProperties.map(property => {
              const waPropText = `Hello ${workspace.name}! 🙏 I am interested in *${property.title}* (${property.locality}) listed on your page for ${formatINR(property.price)}. Can you share more details or schedule a site visit?`;

              return (
                <div key={property.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col">
                  <div className="relative h-48 w-full bg-slate-100">
                    <img
                      src={property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white">
                        {property.listing_type.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-800 text-white">
                        {property.bhk}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 bg-white/95 px-3 py-1 rounded-lg shadow-sm">
                      <span className="text-sm font-black text-slate-900">{formatINR(property.price)}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{property.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{property.locality}, {property.city}</span>
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
                        <span>{property.carpet_area} sq.ft carpet</span>
                        <span className="capitalize">{property.possession_status.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <a
                        href={getWhatsAppUrl(workspace.phone || '+919820123456', waPropText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Inquire on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        {microsite.testimonials && microsite.testimonials.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">What Our Clients Say</h3>
              <p className="text-xs text-slate-500">Trusted by over {microsite.happy_clients} families across Mumbai and Pune</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {microsite.testimonials.map((t, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{t.text}"
                  </p>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="font-bold text-xs text-slate-900">{t.client_name}</div>
                    <div className="text-[11px] text-slate-500">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Consultant Profile QR</h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="Consultant QR Code" className="w-56 h-56 mx-auto rounded-xl" />
              )}
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">{workspace.name}</h4>
              <p className="text-xs text-slate-500">Scan to open listings on your phone or share with buyers</p>
            </div>

            <a
              href={qrDataUrl}
              download={`${workspace.slug}-qr-code.png`}
              className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs block transition-colors shadow-xs"
            >
              Download QR Code Image
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
