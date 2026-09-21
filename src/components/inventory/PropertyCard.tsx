'use client';

import React from 'react';
import { Property } from '@/types/database.types';
import { formatINR } from '@/lib/formatters';
import { Building2, MapPin, Maximize2, ShieldCheck, Share2, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

interface PropertyCardProps {
  property: Property;
  onOpenWhatsApp?: (property: Property) => void;
  onShowMatchingLeads?: (property: Property) => void;
}

export function PropertyCard({ property, onOpenWhatsApp, onShowMatchingLeads }: PropertyCardProps) {
  const { leads } = useApp();

  // Find matching leads for this property
  const matchingLeads = leads.filter(l => {
    if (l.is_dead) return false;
    // BHK match
    const bhkMatch = l.preferred_bhk.length === 0 || l.preferred_bhk.some(b => property.bhk.includes(b) || b.includes(property.bhk));
    // Budget match
    const budgetMatch = !l.budget_max || property.price <= l.budget_max * 1.15;
    return bhkMatch && budgetMatch;
  });

  const displayImage = property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
      {/* Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs">
            {property.listing_type.replace('_', ' ')}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-800/90 text-white backdrop-blur-xs">
            {property.bhk}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs ${
            property.status === 'available'
              ? 'bg-emerald-600/90 text-white'
              : 'bg-amber-600/90 text-white'
          }`}>
            {property.status.replace('_', ' ')}
          </span>
        </div>

        {/* Price Pill on image */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm">
          <span className="text-sm font-black text-slate-900">
            {formatINR(property.price)}
          </span>
          {property.listing_type === 'rental' && <span className="text-[10px] text-slate-500 font-normal"> / month</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link href={`/properties/${property.id}`} className="block">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>

          <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{property.locality}, {property.city}</span>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.carpet_area} sq.ft carpet</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">{property.possession_status.replace('_', ' ')}</span>
            </div>
          </div>

          {/* RERA Badge */}
          {property.rera_number && (
            <div className="mt-2.5 flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
              <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">RERA: {property.rera_number}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {matchingLeads.length > 0 && (
            <button
              onClick={() => onShowMatchingLeads?.(property)}
              className="text-[11px] font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>{matchingLeads.length} Matches</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => onOpenWhatsApp?.(property)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
