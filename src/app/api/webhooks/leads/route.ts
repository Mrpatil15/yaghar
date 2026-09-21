import { NextRequest, NextResponse } from 'next/server';
import { normalizeIndianPhone } from '@/lib/formatters';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify API Key / Webhook secret if provided in query or header
    const authHeader = req.headers.get('authorization') || req.nextUrl.searchParams.get('token');
    const expectedSecret = process.env.LEADS_WEBHOOK_SECRET || 'yaghar_leads_secret';

    if (authHeader && authHeader.replace('Bearer ', '') !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
    }

    const {
      name,
      phone,
      email,
      platform = 'meta', // 'meta' | 'google' | '99acres' | 'magicbricks'
      campaign_name = 'Direct Lead Intake',
      bhk,
      locality,
      budget,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Missing required fields: name and phone' }, { status: 400 });
    }

    const normalizedPhone = normalizeIndianPhone(phone);

    console.log(`[Ads Lead Webhook] New lead received from ${platform}: ${name} (${normalizedPhone}), Campaign: ${campaign_name}`);

    // Lead payload ready for Supabase insertion or client sync
    const leadRecord = {
      name,
      phone: normalizedPhone,
      email: email || null,
      source: platform === 'google' ? 'google_ads' : platform === 'meta' ? 'meta_ads' : platform,
      preferred_bhk: bhk ? [bhk] : ['2 BHK'],
      preferred_localities: locality ? [locality] : ['Mumbai'],
      stage: 'new',
      tags: [platform, campaign_name],
      notes: `Ingested via ${platform} lead webhook. Campaign: ${campaign_name}. Budget: ${budget || 'Not specified'}`,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Lead received and processed successfully',
      lead: leadRecord,
    });
  } catch (err: any) {
    console.error('Lead webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/leads',
    supported_platforms: ['meta_lead_ads', 'google_lead_forms', 'zapier', '99acres'],
  });
}
