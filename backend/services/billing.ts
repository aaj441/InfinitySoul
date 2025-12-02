/**
 * InfinitySoul Billing Service
 * Stripe integration for subscription management
 * Pricing tiers with usage limits
 */

import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// PRICING TIERS
// ============================================================================

export const PRICING_TIERS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    scansPerMonth: 5,
    reports: false,
    support: 'community',
    stripePriceId: null,
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 99,
    scansPerMonth: 100,
    reports: true,
    support: 'email',
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 299,
    scansPerMonth: 500,
    reports: true,
    apiAccess: true,
    support: 'priority',
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
  business: {
    name: 'Business',
    monthlyPrice: 499,
    scansPerMonth: 2000,
    reports: true,
    apiAccess: true,
    whiteLabel: true,
    support: 'phone',
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS,
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: null, // Custom
    scansPerMonth: null, // Unlimited
    reports: true,
    apiAccess: true,
    whiteLabel: true,
    sso: true,
    support: 'dedicated',
    stripePriceId: null,
  },
};

export type TierName = keyof typeof PRICING_TIERS;

// ============================================================================
// USAGE LIMITS
// ============================================================================

export interface UserUsage {
  userId: string;
  tier: TierName;
  scansThisMonth: number;
  scansLimit: number;
  storageUsedMB: number;
  storageLimit: number;
  lastReset: Date;
}

export function getUserLimits(tier: TierName) {
  const tierData = PRICING_TIERS[tier];
  return {
    scansPerMonth: tierData.scansPerMonth,
    storageGB: {
      free: 0.1,
      starter: 1,
      pro: 10,
      business: 100,
      enterprise: null, // Unlimited
    }[tier],
    apiRateLimit: {
      free: 10,
      starter: 100,
      pro: 500,
      business: 2000,
      enterprise: null, // Unlimited
    }[tier],
    reportFormat: {
      free: ['json'],
      starter: ['json', 'pdf'],
      pro: ['json', 'pdf', 'csv'],
      business: ['json', 'pdf', 'csv', 'html'],
      enterprise: ['json', 'pdf', 'csv', 'html', 'custom'],
    }[tier],
  };
}

// ============================================================================
// BILLING WEBHOOK HANDLERS
// ============================================================================

export interface WebhookEvent {
  type: string;
  data: any;
}

/**
 * Handle Stripe webhook events
 * Note: Real implementation requires valid Stripe API key
 */
export async function handleBillingWebhook(event: WebhookEvent): Promise<void> {
  console.log(`[Billing] Processing webhook: ${event.type}`);

  switch (event.type) {
    case 'customer.subscription.created':
      handleSubscriptionCreated(event.data);
      break;

    case 'customer.subscription.updated':
      handleSubscriptionUpdated(event.data);
      break;

    case 'customer.subscription.deleted':
      handleSubscriptionCancelled(event.data);
      break;

    case 'invoice.payment_succeeded':
      handlePaymentSucceeded(event.data);
      break;

    case 'invoice.payment_failed':
      handlePaymentFailed(event.data);
      break;

    default:
      console.log(`[Billing] Unknown webhook type: ${event.type}`);
  }
}

function handleSubscriptionCreated(subscription: any): void {
  const { metadata } = subscription;
  console.log(`[Billing] Subscription created for user: ${metadata.userId}`);
  console.log(`[Billing] Tier: ${metadata.tier}`);
  console.log(`[Billing] Amount: $${subscription.plan.amount / 100}/month`);

  // In production: Update user tier in database
  // await updateUserTier(metadata.userId, metadata.tier);
}

function handleSubscriptionUpdated(subscription: any): void {
  const { metadata } = subscription;
  console.log(`[Billing] Subscription updated for user: ${metadata.userId}`);
  console.log(`[Billing] New tier: ${metadata.tier}`);

  // In production: Update user tier in database
  // await updateUserTier(metadata.userId, metadata.tier);
}

function handleSubscriptionCancelled(subscription: any): void {
  const { metadata } = subscription;
  console.log(`[Billing] Subscription cancelled for user: ${metadata.userId}`);

  // In production: Downgrade to free tier
  // await updateUserTier(metadata.userId, 'free');
}

function handlePaymentSucceeded(invoice: any): void {
  const { customer_email, amount_paid, paid } = invoice;
  if (paid) {
    console.log(`[Billing] Payment succeeded from ${customer_email}: $${amount_paid / 100}`);
  }
}

function handlePaymentFailed(invoice: any): void {
  const { customer_email } = invoice;
  console.log(`[Billing] Payment failed for ${customer_email}`);
  console.log(`[Billing] Sending retry email...`);

  // In production: Send retry email
  // await sendPaymentFailedEmail(customer_email);
}

// ============================================================================
// USAGE CHECKING
// ============================================================================

export async function checkUsageLimit(userId: string, tier: TierName): Promise<{
  allowed: boolean;
  reason?: string;
  remaining: number;
}> {
  const tierData = PRICING_TIERS[tier];

  // Free tier users after trial
  if (tier === 'free') {
    // In production: check if trial expired
    console.log(`[Usage] Free tier user: ${userId}`);
    return {
      allowed: true,
      remaining: tierData.scansPerMonth,
    };
  }

  // In production: Query database for monthly usage
  // const scansThisMonth = await getScansThisMonth(userId);
  // const limit = tierData.scansPerMonth;
  // const remaining = limit - scansThisMonth;

  const scansThisMonth = 0; // Mock
  const limit = tierData.scansPerMonth || 0;
  const remaining = limit - scansThisMonth;

  if (scansThisMonth >= limit) {
    return {
      allowed: false,
      reason: `Monthly limit exceeded. Used ${scansThisMonth}/${limit}`,
      remaining: 0,
    };
  }

  console.log(`[Usage] User ${userId} (${tier}): ${scansThisMonth}/${limit} scans`);

  return {
    allowed: true,
    remaining,
  };
}

// ============================================================================
// TRIAL MANAGEMENT
// ============================================================================

export interface TrialStatus {
  active: boolean;
  daysRemaining?: number;
  expiresAt?: Date;
}

export function getTrialStatus(userId: string): TrialStatus {
  // In production: Query database
  // const user = await User.findOne({ id: userId });
  // return {
  //   active: user.trialActive,
  //   daysRemaining: calculateDaysRemaining(user.trialExpiresAt),
  //   expiresAt: user.trialExpiresAt
  // };

  console.log(`[Trial] Checking trial status for ${userId}`);

  return {
    active: true,
    daysRemaining: 14,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  };
}

// ============================================================================
// PAYMENT PROCESSING (Simulated - Real requires Stripe SDK)
// ============================================================================

export interface CheckoutSession {
  id: string;
  url: string;
  clientSecret?: string;
}

export async function createCheckoutSession(
  userId: string,
  tier: TierName,
  returnUrl: string
): Promise<CheckoutSession> {
  const tierData = PRICING_TIERS[tier];

  if (!tierData.stripePriceId) {
    throw new Error(`No Stripe price configured for tier: ${tier}`);
  }

  console.log(`[Checkout] Creating session for ${userId} (${tier})`);
  console.log(`[Checkout] Price: $${tierData.monthlyPrice}/month`);

  // In production: Use real Stripe API
  // const session = await stripe.checkout.sessions.create({
  //   mode: 'subscription',
  //   line_items: [{
  //     price: tierData.stripePriceId,
  //     quantity: 1,
  //   }],
  //   success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
  //   cancel_url: `${returnUrl}?cancelled=true`,
  //   metadata: { userId, tier },
  // });

  // Simulated response
  const session: CheckoutSession = {
    id: `cs_test_${Math.random().toString(36).slice(2, 12)}`,
    url: `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).slice(2, 12)}`,
    clientSecret: `cs_test_secret_${Math.random().toString(36).slice(2, 20)}`,
  };

  console.log(`[Checkout] Session created: ${session.id}`);

  return session;
}

// ============================================================================
// INVOICE GENERATION
// ============================================================================

export interface Invoice {
  invoiceId: string;
  userId: string;
  tier: TierName;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  status: 'draft' | 'sent' | 'paid' | 'failed';
  pdfUrl?: string;
}

export async function generateInvoice(userId: string, tier: TierName): Promise<Invoice> {
  const tierData = PRICING_TIERS[tier];

  const invoice: Invoice = {
    invoiceId: `INV-${Date.now()}`,
    userId,
    tier,
    amount: tierData.monthlyPrice || 0,
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    periodEnd: new Date(),
    status: 'sent',
  };

  console.log(`[Invoice] Generated: ${invoice.invoiceId}`);
  console.log(`[Invoice] Amount: $${invoice.amount}`);

  return invoice;
}

export default {
  PRICING_TIERS,
  getUserLimits,
  handleBillingWebhook,
  checkUsageLimit,
  getTrialStatus,
  createCheckoutSession,
  generateInvoice,
};
