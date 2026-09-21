import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';

    // Verify webhook signature
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);

    switch (event.event) {
      case 'subscription.charged':
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        console.log(`[Razorpay Webhook] Payment captured: ${payment.id}, amount: ${payment.amount}`);
        // In live DB: UPDATE workspaces SET subscription_status = 'active', trial_ends_at = ...
        break;
      }

      case 'subscription.cancelled': {
        const subscription = event.payload.subscription.entity;
        console.log(`[Razorpay Webhook] Subscription cancelled: ${subscription.id}`);
        // In live DB: UPDATE workspaces SET subscription_status = 'cancelled'
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        console.log(`[Razorpay Webhook] Payment failed: ${payment.id}`);
        // In live DB: UPDATE workspaces SET subscription_status = 'past_due'
        break;
      }

      default:
        console.log(`[Razorpay Webhook] Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Razorpay webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
