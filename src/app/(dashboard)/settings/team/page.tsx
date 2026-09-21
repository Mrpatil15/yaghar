'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { Users, UserPlus, Shield, Mail, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'agent';
  status: 'active' | 'invited';
}

const INITIAL_TEAM: TeamMember[] = [
  { id: 'tm-1', name: 'Rajesh Patil (You)', email: 'contact@shreeganeshrealty.in', role: 'owner', status: 'active' },
  { id: 'tm-2', name: 'Kunal Deshmukh', email: 'kunal@shreeganeshrealty.in', role: 'agent', status: 'active' },
];

export default function TeamSettingsPage() {
  const { plan } = useApp();
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'agent' | 'owner'>('agent');
  const [error, setError] = useState<string | null>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    if (team.length >= plan.limits.maxUsers) {
      setError(`Your current ${plan.name} allows up to ${plan.limits.maxUsers} team seats. Please upgrade to Team plan for more.`);
      return;
    }

    setTeam(prev => [
      ...prev,
      {
        id: 'tm-' + Date.now(),
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'invited',
      },
    ]);

    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Team Members & Seats"
        subtitle={`Manage agent access. Current plan: ${team.length} of ${plan.limits.maxUsers} seats used`}
      />

      <div className="px-4 md:px-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-600">
            {team.length} Active Consultants
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Agent</span>
          </button>
        </div>

        {/* Team list */}
        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {team.map(member => (
            <div key={member.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    {member.name}
                    {member.role === 'owner' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{member.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  member.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {member.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Invite Team Member</h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agent Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agent Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="priya@agency.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Access Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="agent">Agent (Can view and manage assigned leads)</option>
                  <option value="owner">Admin / Owner (Full access to all leads and billing)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl shadow-xs"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
