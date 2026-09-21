'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/navigation/Header';
import { formatINR, formatPhoneDisplay } from '@/lib/formatters';
import { 
  Building2, MapPin, Maximize2, ShieldCheck, Share2, 
  ExternalLink, ArrowLeft, Users, FileText, CheckCircle2, Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import { WhatsAppShareModal } from '@/components/crm/WhatsAppShareModal';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;
  const { properties, leads, workspace } = useApp();

  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [selectedLeadForShare, setSelectedLeadForShare] = useState<any>(null);

  const property = properties.find(p => p.id === propertyId);

  if (!property) {
    return (
      <div className="p-8 text-center space-y-3">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Property not found</h2>
        <Link href="/properties" className="text-xs text-teal-700 font-semibold hover:underline">
          Return to Inventory
        </Link>
      </div>
    );
  }

  // Find matching leads
  const matchingLeads = leads.filter(l => {
    if (l.is_dead) return false;
    const bhkMatch = l.preferred_bhk.length === 0 || l.preferred_bhk.some(b => property.bhk.includes(b) || b.includes(property.bhk));
    const budgetMatch = !l.budget_max || property.price <= l.budget_max * 1.15;
    return bhkMatch && budgetMatch;
  });

  const displayImage = property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-6">
      <Header
        title={property.title}
        subtitle={`${property.bhk} in ${property.locality}, ${property.city}`}
      />

      <div className="px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/marketing?propertyId=${property.id}`}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Create Flyer / Reel</span>
            </Link>

            <button
              onClick={() => {
                setSelectedLeadForShare(null);
                setIsWaModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Hero Section: Image & Main Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
            <div className="relative h-72 sm:h-96 w-full bg-slate-100">
              <img
                src={displayImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs">
                  {property.listing_type.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-teal-800 text-white">
                  {property.bhk}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{property.title}</h2>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{property.locality}, {property.city}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-2xl font-black text-teal-800">
                    {formatINR(property.price)}
                  </div>
                  {property.listing_type === 'rental' && (
                    <span className="text-xs text-slate-500">per month</span>
                  )}
                </div>
              </div>

              {/* RERA */}
              {property.rera_number && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>MahaRERA Registered: <strong>{property.rera_number}</strong></span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 uppercase">Verified</span>
                </div>
              )}

              {/* Description */}
              {property.description && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Amenities & Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map(amenity => (
                      <span
                        key={amenity}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Specs & Matching Buyers */}
          <div className="space-y-6">
            {/* Specs Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Property Specifications
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Carpet Area:</span>
                  <span className="font-semibold text-slate-900">{property.carpet_area} sq. ft.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Possession:</span>
                  <span className="font-semibold text-slate-900 capitalize">{property.possession_status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Furnishing:</span>
                  <span className="font-semibold text-slate-900 capitalize">{property.furnishing.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Monthly Maintenance:</span>
                  <span className="font-semibold text-slate-900">₹ {property.maintenance_charge?.toLocaleString('en-IN') || '0'}</span>
                </div>
                {property.floor_number && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Floor:</span>
                    <span className="font-semibold text-slate-900">{property.floor_number} of {property.total_floors || '-'}</span>
                  </div>
                )}
              </div>

              {property.location_pin_url && (
                <a
                  href={property.location_pin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-2 px-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Open Location in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>

            {/* Matching Buyers Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">Matching Buyers ({matchingLeads.length})</h3>
                </div>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {matchingLeads.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No active buyers match this configuration yet.
                  </p>
                ) : (
                  matchingLeads.map(lead => (
                    <div key={lead.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{lead.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {formatPhoneDisplay(lead.phone)} • {lead.budget_max ? formatINR(lead.budget_max) : 'Open'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedLeadForShare(lead);
                          setIsWaModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        title="Share via WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {isWaModalOpen && (
        <WhatsAppShareModal
          isOpen={isWaModalOpen}
          initialProperty={property}
          initialLead={selectedLeadForShare}
          onClose={() => setIsWaModalOpen(false)}
        />
      )}
    </div>
  );
}
