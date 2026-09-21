'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { normalizeIndianPhone } from '@/lib/formatters';
import { 
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, 
  User, Building2, Phone, Mail, Lock, Eye, EyeOff, Star, Check
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { workspace, setWorkspace } = useApp();

  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setWorkspace({
      ...workspace,
      name: agencyName.trim() || `${name.trim()}'s Realty`,
      phone: normalizeIndianPhone(phone),
      email: email.trim(),
    });

    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen flex bg-white font-sans antialiased">
      {/* LEFT SIDE: Premium Luxury Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-12 xl:p-16 flex-col justify-between overflow-hidden text-white">
        {/* Glowing ambient background */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-teal-600/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
              Y
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                YAGHAR
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  INDIA 🇮🇳
                </span>
              </span>
              <p className="text-xs text-teal-200/70 font-medium">The Real Estate Operating System</p>
            </div>
          </Link>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 space-y-8 my-auto py-8 max-w-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 border border-teal-700/50 text-teal-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              14-Day Full-Access Free Trial
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Launch your branded <br />
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-100 bg-clip-text text-transparent">
                real estate agency in 2 minutes.
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Everything you need to capture leads, match properties, send WhatsApp brochures, and generate GST tax invoices.
            </p>
          </div>

          <div className="space-y-3.5 text-xs text-slate-200">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-medium">No credit card or upfront payment required</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-medium">Instant public microsite with QR code for visiting cards</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-medium">Pre-loaded Indian resale flat checklists & tax calculators</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-medium">100% compliant with MahaRERA & India DPDP Act 2023</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900/40 to-slate-900/40 border border-teal-500/20 backdrop-blur-md space-y-2.5">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              &ldquo;Signing up for YAGHAR took 2 minutes. We loaded our listings and sent our first WhatsApp brochure to 15 buyer leads on the same afternoon.&rdquo;
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
              <span className="font-bold text-white">Patil Properties & Associates</span>
              <span className="text-teal-300 font-medium">Pune, Maharashtra</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Cloud PostgreSQL Active
          </span>
          <span>© {new Date().getFullYear()} YAGHAR Technologies</span>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Modern Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 xl:p-20 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between pb-6 border-b border-slate-100">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-teal-700/20">
              Y
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">YAGHAR</span>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            India Edition 🇮🇳
          </span>
        </div>

        <div className="my-auto max-w-md w-full mx-auto py-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Create your agency workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Start your 14-day free trial. Setup takes less than 2 minutes.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Patil"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:outline-none focus:ring-3 focus:ring-teal-600/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Brokerage / Firm Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patil Properties & Associates"
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:outline-none focus:ring-3 focus:ring-teal-600/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Phone (+91)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="absolute left-10 top-2.5 text-xs text-slate-400 font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="98201 23456"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-18 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:outline-none focus:ring-3 focus:ring-teal-600/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="rajesh@patilproperties.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:outline-none focus:ring-3 focus:ring-teal-600/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:outline-none focus:ring-3 focus:ring-teal-600/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition-all cursor-pointer mt-2 disabled:opacity-75"
            >
              <span>{isLoading ? 'Creating Workspace...' : 'Create Workspace & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-1">
              By creating a workspace, you agree to our{' '}
              <Link href="/terms" className="text-slate-600 underline hover:text-slate-900">Terms</Link> &{' '}
              <Link href="/privacy" className="text-slate-600 underline hover:text-slate-900">Privacy Policy</Link>{' '}
              (India DPDP Act 2023 Compliant).
            </p>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-teal-700 hover:text-teal-800 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Bank-Grade 256-Bit SSL Encryption</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
