/**
 * Stripe Webhook Handler - Revenue Gate
 * Idempotent handlers ensure "paid" users never get stuck on "free"
 */

import { Request, Response } from 'express';
import crypto from 'crypto';

// In production, use Stripe SDK:
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Store for idempotent processing
const processedEvents = new Map<string, any>();

// In production, use a database instead
const subscriptionDatabase = new Map<
  string,
  {
    customerId: string;
    email: string;
    status: 'active' | 'past_due' | 'canceled';
    planId: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
  }
>();

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

function createIdempotentHandler(eventId: string) {
  // Check if event was already processed
  if (processedEvents.has(eventId)) {
    console.log(`⏭️ [WEBHOOK] Event ${eventId} already processed, skipping`);
    return processedEvents.get(eventId);
  }

  // Mark as being processed
  processedEvents.set(eventId, { processing: true });

  return null;
}

function recordProcessedEvent(eventId: string, result: any) {
  processedEvents.set(eventId, { ...result, processedAt: Date.now() });

  // Clean up old events (older than 24 hours)
  for (const [key, value] of processedEvents.entries()) {
    if (value.processedAt && Date.now() - value.processedAt > 86400000) {
      processedEvents.delete(key);
    }
  }
}

// ============ EVENT HANDLERS ============

/**
 * checkout.session.completed
 * User just completed payment - activate subscription
 */
function handleCheckoutSessionCompleted(event: any) {
  const { id, customer, client_reference_id, subscription, amount_total } = event.data.object;

  console.log(`💳 [STRIPE] Checkout completed: ${id}`);

  // Create or update user subscription
  try {
    // CRITICAL: Upsert pattern - create user if missing
    if (!subscriptionDatabase.has(customer)) {
      subscriptionDatabase.set(customer, {
        customerId: customer,
        email: client_reference_id || 'unknown@example.com',
        status: 'active',
        planId: subscription || 'starter',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    } else {
      const existing = subscriptionDatabase.get(customer)!;
      subscriptionDatabase.set(customer, {
        ...existing,
        status: 'active',
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000
      });
    }

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
function handleSubscriptionUpdated(event: any) {
  const { id, customer, status, current_period_start, current_period_end } =
    event.data.object;

  console.log(`🔄 [STRIPE] Subscription updated: ${id}`);

  try {
    const existing = subscriptionDatabase.get(customer);

    if (!existing) {
      // Create if missing (upsert pattern)
      subscriptionDatabase.set(customer, {
        customerId: customer,
        email: 'unknown@example.com',
        status,
        planId: id,
        currentPeriodStart: current_period_start * 1000,
        currentPeriodEnd: current_period_end * 1000
      });
    } else {
      subscriptionDatabase.set(customer, {
        ...existing,
        status,
        currentPeriodStart: current_period_start * 1000,
        currentPeriodEnd: current_period_end * 1000
      });
    }

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
function handleSubscriptionDeleted(event: any) {
  const { id, customer } = event.data.object;

  console.log(`🚫 [STRIPE] Subscription deleted: ${id}`);

  try {
    const existing = subscriptionDatabase.get(customer);

    if (existing) {
      subscriptionDatabase.set(customer, {
        ...existing,
        status: 'canceled'
      });
    } else {
      // Create cancelled subscription record
      subscriptionDatabase.set(customer, {
        customerId: customer,
        email: 'unknown@example.com',
        status: 'canceled',
        planId: 'free',
        currentPeriodStart: 0,
        currentPeriodEnd: 0
      });
    }

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

  // Check idempotency
  const existing = createIdempotentHandler(event.id);
  if (existing && !existing.processing) {
    return res.json({ received: true, cached: true });
  }

  try {
    let result;

    // Route to appropriate handler
    switch (event.type) {
      case 'checkout.session.completed':
        result = handleCheckoutSessionCompleted(event);
        break;

      case 'customer.subscription.updated':
        result = handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        result = handleSubscriptionDeleted(event);
        break;

      default:
        console.log(`⏭️ [WEBHOOK] Unhandled event type: ${event.type}`);
        result = { success: true, message: 'Event ignored' };
    }

    // Record successful processing
    recordProcessedEvent(event.id, result);

    return res.json({ received: true, processed: true });
  } catch (error) {
    console.error('❌ [WEBHOOK] Error handling event:', error);
    // Still return 200 to prevent Stripe retries, but log the error
    return res.json({ received: true, error: 'Processing failed', processed: false });
  }
}

// ============ QUERY SUBSCRIPTION STATUS ============

export function getSubscriptionStatus(customerId: string) {
  const subscription = subscriptionDatabase.get(customerId);

  if (!subscription) {
    return { status: 'free', planId: 'free' };
  }

  // Check if subscription is still valid
  if (subscription.status === 'canceled' || Date.now() > subscription.currentPeriodEnd) {
    return { status: 'free', planId: 'free' };
  }

  return {
    status: subscription.status,
    planId: subscription.planId,
    expiresAt: subscription.currentPeriodEnd
  };
}

// ============ DEBUG: List all subscriptions ============

export function getAllSubscriptions() {
  return Array.from(subscriptionDatabase.entries()).map(([customerId, data]) => ({
    customerId,
    ...data
  }));
}
