import { PlanTier } from '@/types/database.types';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  tagline: string;
  priceMonthlyINR: number;
  priceYearlyINR: number;
  features: string[];
  limits: {
    maxLeads: number;
    maxProperties: number;
    maxUsers: number;
    hasAIAssistant: boolean;
    hasCustomBranding: boolean;
    hasGstInvoice: boolean;
  };
  popular?: boolean;
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  trial: {
    id: 'trial',
    name: '14-Day Free Trial',
    tagline: 'Experience the complete operating system risk-free',
    priceMonthlyINR: 0,
    priceYearlyINR: 0,
    features: [
      'Up to 50 active leads',
      'Up to 15 property listings',
      '1 Team user (Solo)',
      'WhatsApp Click-to-Chat sharing',
      'Public Consultant Microsite',
      'Basic Calculators (EMI, Stamp Duty)',
      'Community Support',
    ],
    limits: {
      maxLeads: 50,
      maxProperties: 15,
      maxUsers: 1,
      hasAIAssistant: false,
      hasCustomBranding: false,
      hasGstInvoice: true,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter Consultant',
    tagline: 'Ideal for independent brokers scaling their deal pipeline',
    priceMonthlyINR: 999,
    priceYearlyINR: 9990, // ~2 months free
    features: [
      'Up to 250 active leads',
      'Up to 50 property listings',
      '1 Team user',
      'WhatsApp Click-to-Chat sharing & templates',
      'Branded Consultant Microsite + QR code',
      'All 5 Indian Real Estate Calculators',
      'GST-Ready Commission Invoices',
      'Lead CSV import & duplicate detection',
    ],
    limits: {
      maxLeads: 250,
      maxProperties: 50,
      maxUsers: 1,
      hasAIAssistant: false,
      hasCustomBranding: true,
      hasGstInvoice: true,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro Broker',
    tagline: 'For top-producing brokers closing 3-10 deals a month',
    priceMonthlyINR: 2499,
    priceYearlyINR: 24990,
    popular: true,
    features: [
      'Up to 1,000 active leads',
      'Up to 250 property listings',
      'Up to 3 Team seats',
      'AI Assistant (Lead summarizer & WhatsApp drafting)',
      'Automated Lead-to-Property Matcher',
      'Site Visit Scheduler & Reminders',
      'Meta & Google Ads Webhook Intake',
      'Dead Leads Reactivation Engine',
      'Full Analytics Dashboard (CPL & Funnels)',
      'Priority WhatsApp Support',
    ],
    limits: {
      maxLeads: 1000,
      maxProperties: 250,
      maxUsers: 3,
      hasAIAssistant: true,
      hasCustomBranding: true,
      hasGstInvoice: true,
    },
  },
  team: {
    id: 'team',
    name: 'Brokerage Team',
    tagline: 'For boutique agencies and multi-agent brokerages',
    priceMonthlyINR: 4999,
    priceYearlyINR: 49990,
    features: [
      'Unlimited leads',
      'Unlimited property listings',
      'Up to 10 Team seats (Owner + Agents)',
      'Agent Commission Splits & Payout Tracker',
      'Full AI Assistant suite & Marketing Kit',
      'Multi-agent role-based access',
      'Custom Domain for Consultant Microsite',
      'Dedicated Account Manager',
    ],
    limits: {
      maxLeads: 999999,
      maxProperties: 999999,
      maxUsers: 10,
      hasAIAssistant: true,
      hasCustomBranding: true,
      hasGstInvoice: true,
    },
  },
};
