import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { action, lead, property, tone = 'professional', topic } = await req.json();

    // 1. Lead Summary
    if (action === 'summarize') {
      const summary = `Client ${lead.name} (${lead.phone}) is seeking a ${lead.preferred_bhk?.join('/') || 'residential unit'} in ${lead.preferred_localities?.join(', ') || 'Mumbai'}. Budget range is ₹ ${((lead.budget_min || 0) / 100000).toFixed(0)}L to ₹ ${((lead.budget_max || 0) / 100000).toFixed(0)}L. Current pipeline stage is ${lead.stage.toUpperCase()}. Key client notes: "${lead.notes || 'Interested in ready-to-move properties with good road connectivity.'}"`;
      return NextResponse.json({ result: summary });
    }

    // 2. Next Follow-Up Action
    if (action === 'next_action') {
      let suggestion = '';
      if (lead.stage === 'new') {
        suggestion = 'Call client within 15 minutes to verify budget flexibility and pre-approval status. Send welcome greeting on WhatsApp.';
      } else if (lead.stage === 'contacted') {
        suggestion = 'Share curated 2-3 property brochures matching their preferred locality on WhatsApp and propose a weekend site visit (Saturday 11:30 AM).';
      } else if (lead.stage === 'site_visit') {
        suggestion = 'Follow up within 24 hours of site visit to capture feedback. Inquire if they want to negotiate token terms or explore a 2nd option.';
      } else if (lead.stage === 'negotiation') {
        suggestion = 'Coordinate with seller/developer for final token agreement and provide draft 30-year title search & Index II checklist to build trust.';
      } else if (lead.stage === 'lost') {
        suggestion = 'Reactivate with festive developer discount alert or newly launched inventory in their target locality.';
      } else {
        suggestion = 'Schedule check-in call to maintain relationship and ask for client referrals.';
      }
      return NextResponse.json({ result: suggestion });
    }

    // 3. Draft WhatsApp Message
    if (action === 'draft_whatsapp') {
      let text = '';
      const salutation = tone === 'friendly' ? `Namaste ${lead.name} ji! 😊` : `Dear ${lead.name} ji,`;

      if (property) {
        text = `${salutation}\n\nI came across an exceptional property that aligns with your criteria in *${property.locality}*:\n\n🏡 *${property.title}*\n💰 Price: *₹ ${(property.price / 100000).toFixed(2)} Lakhs*\n📐 Carpet Area: ${property.carpet_area} sq.ft (${property.bhk})\n${property.rera_number ? `✅ MahaRERA: ${property.rera_number}\n` : ''}\nWould you like me to reserve a private site visit for you this weekend?\n\nWarm regards,\nYour Real Estate Consultant`;
      } else {
        text = `${salutation}\n\nHope you are having a wonderful week. I am reviewing new verified listings in *${lead.preferred_localities?.[0] || 'your target locality'}* and wanted to check if your requirement for ${lead.preferred_bhk?.join('/') || 'property'} is still active.\n\nWhen would be a convenient time for a brief 2-minute catch-up?\n\nWarm regards,\nYour Real Estate Consultant`;
      }
      return NextResponse.json({ result: text });
    }

    // 4. Marketing AI Caption
    if (action === 'generate_caption') {
      const pTitle = property?.title || topic || 'Luxury Home';
      const locality = property?.locality || 'Prime Location';
      const bhk = property?.bhk || '2 & 3 BHK';

      const caption = `🏡 *NEW LISTING ALERT* | ${pTitle}\n\nExperience elevated living in the heart of ${locality}. Premium ${bhk} residences crafted for discerning families who value connectivity, luxury amenities, and complete legal peace of mind.\n\n✨ Key Highlights:\n• RERA Approved & Legally Verified\n• High Speed Elevators, Grand Clubhouse & Swimming Pool\n• Close to Metro & Western Express Highway\n\n📲 DM or WhatsApp us at +91 98201 23456 to schedule an exclusive site tour.\n\n#RealEstateIndia #MumbaiProperties #LuxuryHomes #${locality.replace(/\s+/g, '')} #HomeBuyers`;
      return NextResponse.json({ result: caption });
    }

    // 5. Reel Script
    if (action === 'reel_script') {
      const script = `🎬 *30-SECOND REEL SCRIPT: ${property?.title || 'Property Tour'}*\n\n[00:00 - 00:05] HOOK (Show grand living room):\n"Stop scrolling if you are looking for a verified ${property?.bhk || '2 BHK'} in ${property?.locality || 'Mumbai'} under ${property ? `₹ ${(property.price / 10000000).toFixed(2)} Cr` : 'market budget'}!"\n\n[00:05 - 00:15] HIGHLIGHTS (Fast pan of kitchen & bedroom):\n"Notice this massive ${property?.carpet_area || '750'} sq.ft carpet area, uninterrupted natural light, and premium modular fittings. The best part? It's ready to move with full OC in place."\n\n[00:15 - 00:25] AMENITIES (Show pool or view):\n"Located just 5 minutes from the metro, with world-class amenities including an infinity pool and clubhouse."\n\n[00:25 - 00:30] CTA (To camera):\n"Direct developer inventory with zero brokerage. Tap the link in bio or WhatsApp us for the full brochure!"`;
      return NextResponse.json({ result: script });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('AI assistant error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
