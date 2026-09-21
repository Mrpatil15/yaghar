'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, 
  Mail, Lock, Eye, EyeOff, Building2, Smartphone, Receipt, Star
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loadDemoData } = useApp();

  const [email, setEmail] = useState('demo@yaghar.in');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  const handleOneClickDemo = () => {
    loadDemoData();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-white font-sans antialiased">
      {/* LEFT SIDE: Premium Luxury Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-12 xl:p-16 flex-col justify-between overflow-hidden text-white">
        {/* Subtle glowing ambient lighting */}
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

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-8 my-auto py-8 max-w-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 border border-teal-700/50 text-teal-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Built for Indian Brokers & Consultants
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Close deals faster. <br />
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-100 bg-clip-text text-transparent">
                Run your agency with zero chaos.
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Replace messy WhatsApp chats, paper diaries, and manual invoicing with India&apos;s first purpose-built operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">1-Tap WhatsApp Sharing</h4>
              <p className="text-[11px] text-slate-400">Send verified property brochures and location pins in 2 seconds.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">GST SAC 997222 Invoices</h4>
              <p className="text-[11px] text-slate-400">Generate 18% GST tax invoices with CGST/SGST calculation in 1 click.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Branded Microsite & QR</h4>
              <p className="text-[11px] text-slate-400">Your agency website with MahaRERA badges and digital visiting cards.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">DPDP 2023 Compliant</h4>
              <p className="text-[11px] text-slate-400">Bank-grade Row Level Security with isolated multi-tenant database.</p>
            </div>
          </div>

          {/* Social Proof Testimonial Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900/40 to-slate-900/40 border border-teal-500/20 backdrop-blur-md space-y-2.5">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              &ldquo;YAGHAR completely streamlined our client follow-ups in Borivali & Thane. We closed ₹3.8 Cr in resale deals last month alone without missing a single inquiry.&rdquo;
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
              <span className="font-bold text-white">Shree Ganesh Realty</span>
              <span className="text-teal-300 font-medium">Mumbai, Maharashtra</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Legal */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Cloud PostgreSQL Active
          </span>
          <span>© {new Date().getFullYear()} YAGHAR Technologies</span>
        </div>
      </div>

      {/* RIGHT SIDE: Elegant Clean Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 xl:p-20 overflow-y-auto">
        {/* Mobile Top Header (hidden on desktop) */}
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

        <div className="my-auto max-w-md w-full mx-auto py-8 space-y-7">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign in to manage your real estate pipeline, listings, and client visits.
            </p>
          </div>

          {/* Quick 1-Click Demo Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-teal-900">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span>Instant Demo Access</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-700 text-white uppercase tracking-wider">
                1-Click
              </span>
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              Explore YAGHAR with pre-loaded Mumbai listings (Oberoi Sky City, Hiranandani), Indian leads, and GST invoices.
            </p>
            <button
              type="button"
              onClick={handleOneClickDemo}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-teal-700/20 transition-all cursor-pointer"
            >
              <span>Explore Demo Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              Or sign in with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@agency.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:outline-none focus:ring-3 focus:ring-teal-600/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('For demo access, simply use email: demo@yaghar.in and password: demo1234, or click Explore Demo Workspace above!'); }}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 text-teal-700 focus:ring-teal-600 accent-teal-700"
                />
                <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition-all cursor-pointer disabled:opacity-75"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Don&apos;t have a workspace yet?{' '}
              <Link href="/signup" className="text-teal-700 hover:text-teal-800 font-bold hover:underline">
                Start 14-Day Free Trial
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
