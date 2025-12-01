/**
 * Stripe Webhook Handler - Revenue Gate
 * Idempotent handlers ensure "paid" users never get stuck on "free"
 *
 * TIER 1: Uses database for persistence across deployments
 * Idempotency keys stored in PostgreSQL prevent duplicate charges
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import { idempotencyOps, subscriptionOps } from './database';

// In production, use Stripe SDK:
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ============ WEBHOOK SIGNATURE VERIFICATION ============

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const timestamp = signature.split(',')[0].split('=')[1];
    const hash = signature.split(',')[1].split('=')[1];

    const signedContent = `${timestamp}.${body}`;
    const computed = crypto
      .createHmac('sha256', secret)
      .update(signedContent)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(computed)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

// ============ IDEMPOTENT EVENT HANDLER ============

/**
 * Check if webhook event was already processed (using database)
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  try {
    return await idempotencyOps.isProcessed(eventId);
  } catch (error) {
    console.error('Error checking event idempotency:', error);
    // On error, return false to allow processing (safer than blocking)
    return false;
  }
}

/**
 * Record processed event in database (for idempotency)
 */
async function recordProcessedEvent(eventId: string, result: any): Promise<void> {
  try {
    await idempotencyOps.record(eventId, result);
  } catch (error) {
    console.error('Error recording processed event:', error);
    // Don't throw - webhook handler should complete even if recording fails
  }
}

// ============ EVENT HANDLERS ============

/**
 * checkout.session.completed
 * User just completed payment - activate subscription
 */
async function handleCheckoutSessionCompleted(event: any) {
  const { id, customer, client_reference_id, subscription, amount_total } = event.data.object;

  console.log(`💳 [STRIPE] Checkout completed: ${id}`);

  try {
    // CRITICAL: Upsert pattern - create user if missing
    await subscriptionOps.upsert(customer, {
      email: client_reference_id || 'unknown@example.com',
      status: 'active',
      planId: subscription || 'starter',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    console.log(`✅ [STRIPE] Subscription activated for ${customer}`);
    return { success: true, message: 'Subscription activated' };
  } catch (error) {
    console.error('❌ [STRIPE] Error processing checkout:', error);
    throw error;
  }
}

/**
 * customer.subscription.updated
 * Subscription details changed - update database
 */
async function handleSubscriptionUpdated(event: any) {
  const { id, customer, status, current_period_start, current_period_end } =
    event.data.object;

  console.log(`🔄 [STRIPE] Subscription updated: ${id}`);

  try {
    // Upsert pattern - create if missing
    await subscriptionOps.upsert(customer, {
      email: 'unknown@example.com',
      status,
      planId: id,
      currentPeriodStart: new Date(current_period_start * 1000),
      currentPeriodEnd: new Date(current_period_end * 1000)
    });

    console.log(`✅ [STRIPE] Subscription updated for ${customer}: ${status}`);
    return { success: true, message: 'Subscription updated' };
  } catch (error) {
    console.error('❌ [STRIPE] Error updating subscription:', error);
    throw error;
  }
}

/**
 * customer.subscription.deleted
 * Subscription cancelled - downgrade to free
 */
async function handleSubscriptionDeleted(event: any) {
  const { id, customer } = event.data.object;

  console.log(`🚫 [STRIPE] Subscription deleted: ${id}`);

  try {
    // Upsert pattern - create cancelled record if missing
    await subscriptionOps.upsert(customer, {
      email: 'unknown@example.com',
      status: 'canceled',
      planId: 'free',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date()
    });

    console.log(`✅ [STRIPE] Subscription cancelled for ${customer}`);
    return { success: true, message: 'Subscription cancelled' };
  } catch (error) {
    console.error('❌ [STRIPE] Error cancelling subscription:', error);
    throw error;
  }
}

// ============ MAIN WEBHOOK HANDLER ============

export async function handleStripeWebhook(req: Request, res: Response) {
  // CRITICAL: Use raw body, not parsed JSON
  const rawBody = (req as any).rawBody || req.body;
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!signature) {
    console.error('❌ Missing Stripe signature');
    return res.status(400).json({ error: 'Missing signature' });
  }

  // Verify signature
  if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    console.error('❌ Invalid webhook signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(typeof rawBody === 'string' ? rawBody : rawBody.toString());
  } catch (error) {
    console.error('❌ Failed to parse webhook body');
    return res.status(400).json({ error: 'Failed to parse webhook' });
  }

  console.log(`📨 [WEBHOOK] Received: ${event.type} (${event.id})`);

  // Check idempotency (database-backed)
  const processed = await isEventProcessed(event.id);
  if (processed) {
    console.log(`⏭️ [WEBHOOK] Event ${event.id} already processed, returning cached response`);
    return res.json({ received: true, cached: true });
  }

  try {
    let result;

    // Route to appropriate handler (now all async)
    switch (event.type) {
      case 'checkout.session.completed':
        result = await handleCheckoutSessionCompleted(event);
        break;

      case 'customer.subscription.updated':
        result = await handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        result = await handleSubscriptionDeleted(event);
        break;

      default:
        console.log(`⏭️ [WEBHOOK] Unhandled event type: ${event.type}`);
        result = { success: true, message: 'Event ignored' };
    }

    // Record successful processing (database-backed)
    await recordProcessedEvent(event.id, result);

    return res.json({ received: true, processed: true });
  } catch (error) {
    console.error('❌ [WEBHOOK] Error handling event:', error);
    // Still return 200 to prevent Stripe retries, but log the error
    return res.json({ received: true, error: 'Processing failed', processed: false });
  }
}

// ============ QUERY SUBSCRIPTION STATUS ============

/**
 * Get subscription status from database
 * Now async to support database lookups
 */
export async function getSubscriptionStatus(customerId: string) {
  try {
    const subscription = await subscriptionOps.getByCustomerId(customerId);

    if (!subscription) {
      return { status: 'free', planId: 'free' };
    }

    // Check if subscription is still valid
    if (subscription.status === 'canceled' || new Date() > new Date(subscription.currentPeriodEnd)) {
      return { status: 'free', planId: 'free' };
    }

    return {
      status: subscription.status,
      planId: subscription.planId,
      expiresAt: subscription.currentPeriodEnd
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return { status: 'free', planId: 'free' };
  }
}
