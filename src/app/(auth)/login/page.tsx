'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loadDemoData } = useApp();

  const [email, setEmail] = useState('demo@yaghar.in');
  const [password, setPassword] = useState('demo1234');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const handleOneClickDemo = () => {
    loadDemoData();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-700/20">
            Y
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">YAGHAR</span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Sign in to your consultant account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Or{' '}
          <Link href="/signup" className="text-teal-700 font-semibold hover:underline">
            create a new workspace
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          {/* Quick Demo Access Callout */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span>Instant Demo Access</span>
            </div>
            <p className="text-teal-800 leading-relaxed text-[11px]">
              Explore YAGHAR immediately with pre-loaded Indian leads, Mumbai & Pune listings, WhatsApp sharing templates, and GST invoices.
            </p>
            <button
              onClick={handleOneClickDemo}
              className="w-full py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <span>Explore Demo Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">Or log in with email</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
