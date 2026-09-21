'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { normalizeIndianPhone } from '@/lib/formatters';

export default function SignupPage() {
  const router = useRouter();
  const { workspace, setWorkspace } = useApp();

  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    setWorkspace({
      ...workspace,
      name: agencyName.trim() || `${name.trim()}'s Realty`,
      phone: normalizeIndianPhone(phone),
      email: email.trim(),
    });

    router.push('/onboarding');
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
        <h2 className="text-xl font-bold text-slate-900">Start your 14-day free trial</h2>
        <p className="text-xs text-slate-500 mt-1">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-700 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl">
          <form onSubmit={handleSignup} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Patil"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brokerage / Firm Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Patil Properties & Associates"
                value={agencyName}
                onChange={e => setAgencyName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone (+91)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-medium">+91</span>
                <input
                  type="tel"
                  required
                  placeholder="98201 23456"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-12 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="rajesh@patilproperties.com"
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
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95 mt-2"
            >
              Create Workspace & Continue
            </button>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              By signing up, you agree to our Terms of Service & Privacy Policy (DPDP 2023 compliant).
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
