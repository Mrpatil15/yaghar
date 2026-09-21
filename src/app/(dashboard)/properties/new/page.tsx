'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { ListingType, PropertyType, PossessionStatus } from '@/types/database.types';
import { formatINR } from '@/lib/formatters';
import { ArrowLeft, Building2, MapPin, IndianRupee, ShieldCheck, Check, AlertCircle, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

const AMENITY_LIST = [
  'Clubhouse', 'Swimming Pool', 'Gym', 'Security 24x7', 'Power Backup', 
  'Kids Play Area', 'Jogging Track', 'EV Charging Station', 'Lift / High Speed Elevators', 
  'Garden / Park', 'Intercom', 'CCTV Surveillance'
];

export default function NewPropertyPage() {
  const router = useRouter();
  const { addProperty } = useApp();

  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState<ListingType>('resale');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [city, setCity] = useState('Mumbai');
  const [locality, setLocality] = useState('');
  const [subLocality, setSubLocality] = useState('');
  const [bhk, setBhk] = useState('2 BHK');
  const [carpetArea, setCarpetArea] = useState('');
  const [priceInput, setPriceInput] = useState(''); // in Lakhs
  const [maintenance, setMaintenance] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [possessionStatus, setPossessionStatus] = useState<PossessionStatus>('ready_to_move');
  const [furnishing, setFurnishing] = useState<'unfurnished' | 'semi_furnished' | 'fully_furnished'>('semi_furnished');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Security 24x7', 'Lift / High Speed Elevators']);
  const [description, setDescription] = useState('');
  const [locationPin, setLocationPin] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview('');
    setFileName('');
  };

  const calculatedINR = priceInput ? parseFloat(priceInput) * 100000 : 0;

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !locality.trim() || !carpetArea || !priceInput) {
      setError('Please fill in all required fields (Title, Locality, Carpet Area, Price).');
      return;
    }

    const res = addProperty({
      title: title.trim(),
      listing_type: listingType,
      property_type: propertyType,
      city,
      locality: locality.trim(),
      sub_locality: subLocality.trim() || null,
      bhk,
      carpet_area: parseFloat(carpetArea),
      price: calculatedINR,
      maintenance_charge: maintenance ? parseFloat(maintenance) : 0,
      rera_number: reraNumber.trim() || null,
      possession_status: possessionStatus,
      furnishing,
      amenities: selectedAmenities,
      description: description.trim() || null,
      status: 'available',
      location_pin_url: locationPin.trim() || null,
      images: imageUrl.trim() ? [imageUrl.trim()] : [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80'
      ],
    });

    if (!res.success) {
      setError(res.error || 'Failed to add property');
      return;
    }

    router.push('/properties');
  };

  return (
    <div className="space-y-6">
      <Header
        title="Add Property Listing"
        subtitle="Create a verified listing with RERA, pricing, and amenities"
      />

      <div className="px-4 md:px-8 max-w-4xl mx-auto space-y-5">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inventory</span>
        </Link>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-700" />
              <span>Listing Overview</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Oberoi Sky City - Luxury 3 BHK higher floor"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Listing Type
                </label>
                <select
                  value={listingType}
                  onChange={e => setListingType(e.target.value as ListingType)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="resale">Resale</option>
                  <option value="new_project">New Project (Developer)</option>
                  <option value="rental">Rental</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="apartment">Apartment / Flat</option>
                  <option value="villa">Row House / Villa</option>
                  <option value="plot">Residential Plot</option>
                  <option value="commercial">Commercial Space / Office</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  BHK Configuration
                </label>
                <select
                  value={bhk}
                  onChange={e => setBhk(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="1 RK">1 RK</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4+ BHK">4+ BHK</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Location & Area */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-700" />
              <span>Location & Dimensions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Locality <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Borivali East"
                  value={locality}
                  onChange={e => setLocality(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub-locality / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Off Western Express Highway"
                  value={subLocality}
                  onChange={e => setSubLocality(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Carpet Area (sq. ft.) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 750"
                  value={carpetArea}
                  onChange={e => setCarpetArea(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Maps Location Pin URL
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={locationPin}
                  onChange={e => setLocationPin(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & RERA */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-teal-700" />
              <span>Pricing & Legal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price in ₹ Lakhs <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="85 (for 85L) or 385 (for 3.85 Cr)"
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                {calculatedINR > 0 && (
                  <p className="text-[11px] text-teal-700 font-bold mt-1">
                    Display: {formatINR(calculatedINR)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Maintenance (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4500"
                  value={maintenance}
                  onChange={e => setMaintenance(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MahaRERA / RERA Registration No.
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. P51800003582"
                    value={reraNumber}
                    onChange={e => setReraNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Possession Status
                </label>
                <select
                  value={possessionStatus}
                  onChange={e => setPossessionStatus(e.target.value as PossessionStatus)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="ready_to_move">Ready to Move</option>
                  <option value="under_construction">Under Construction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Furnishing
                </label>
                <select
                  value={furnishing}
                  onChange={e => setFurnishing(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi_furnished">Semi-Furnished</option>
                  <option value="fully_furnished">Fully Furnished</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Amenities */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-700">
              Select Amenities:
            </label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_LIST.map(amenity => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Description & Image URL */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Description
              </label>
              <textarea
                rows={3}
                placeholder="Key highlights, views, builder reputation, subway connectivity, etc."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Property Cover Photo
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      uploadMode === 'upload' 
                        ? 'bg-white text-teal-800 shadow-xs font-semibold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📁 Upload from Device
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      uploadMode === 'url' 
                        ? 'bg-white text-teal-800 shadow-xs font-semibold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🔗 Web URL
                  </button>
                </div>
              </div>

              {uploadMode === 'upload' ? (
                <div>
                  {!imagePreview ? (
                    <label className="border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-bold text-teal-700 hover:underline">Click to browse your device / storage</span>
                        <span className="text-xs text-slate-500"> or drag and drop</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP, HEIC</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-2.5 flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Property Preview"
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold text-slate-800 truncate">{fileName || 'Uploaded Property Photo'}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Ready to publish with listing</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={e => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  {imageUrl && (
                    <div className="relative rounded-xl border border-slate-200 overflow-hidden w-28 h-20 bg-slate-100">
                      <img
                        src={imageUrl}
                        alt="URL preview"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview('')}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/properties"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm shadow-teal-700/20 active:scale-95 transition-all"
            >
              Publish Property Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
