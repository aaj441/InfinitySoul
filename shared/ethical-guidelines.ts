/**
 * MASONIC ETHICAL FRAMEWORK
 * 
 * Core principles guiding the WCAG AI Platform:
 * - Brotherly Love: Never exploit prospects, always provide genuine value first
 * - Relief: Help businesses serve ALL users (disabled, elderly, etc.)
 * - Truth: Transparent pricing, no dark patterns, honest reporting
 * - Charity: Free tier stays free forever, sliding scale for nonprofits
 * - Integrity: No selling user data, no spam, respect opt-outs immediately
 */

export const MASONIC_PRINCIPLES = {
  BROTHERLY_LOVE: {
    name: "Brotherly Love",
    description: "Never exploit prospects, always provide genuine value first",
    commitments: [
      "Free WCAG scans with no strings attached",
      "No pressure tactics or artificial urgency",
      "Honest assessment of accessibility issues",
      "Value given before value asked"
    ]
  },
  RELIEF: {
    name: "Relief",
    description: "Help businesses serve ALL users (disabled, elderly, etc.)",
    commitments: [
      "Focus on real accessibility impact, not just compliance",
      "Prioritize barriers affecting most vulnerable users",
      "Provide actionable remediation guidance",
      "Support businesses in becoming more inclusive"
    ]
  },
  TRUTH: {
    name: "Truth",
    description: "Transparent pricing, no dark patterns, honest reporting",
    commitments: [
      "Clear, upfront pricing with no hidden fees",
      "Accurate WCAG scores without inflation",
      "Honest about limitations and scope",
      "No deceptive subject lines or marketing tactics"
    ]
  },
  CHARITY: {
    name: "Charity",
    description: "Free tier stays free forever, sliding scale for nonprofits",
    commitments: [
      "Free tier remains free permanently",
      "Discounts for nonprofits and educational institutions",
      "Open-source accessibility resources",
      "Community-driven knowledge sharing"
    ]
  },
  INTEGRITY: {
    name: "Integrity",
    description: "No selling user data, no spam, respect opt-outs immediately",
    commitments: [
      "Zero user data sales, ever",
      "Respect 'Do Not Contact' requests immediately",
      "Easy one-click unsubscribe",
      "Maximum 1 email per prospect per week",
      "No email harvesting or list purchasing"
    ]
  }
} as const;

export interface EthicalConstraints {
  maxEmailsPerProspectPerWeek: number;
  requireExplicitPermission: boolean;
  respectDoNotContact: boolean;
  trackUnsubscribes: boolean;
  flagDeceptiveSubjectLines: boolean;
  allowDataSelling: boolean;
  freeTierAlwaysFree: boolean;
}

export const ETHICAL_CONSTRAINTS: EthicalConstraints = {
  maxEmailsPerProspectPerWeek: 1,
  requireExplicitPermission: true,
  respectDoNotContact: true,
  trackUnsubscribes: true,
  flagDeceptiveSubjectLines: true,
  allowDataSelling: false,
  freeTierAlwaysFree: true,
};

export interface DoNotContactEntry {
  email?: string;
  domain?: string;
  prospectId?: string;
  reason: string;
  addedAt: Date;
  permanent: boolean;
}

export interface EthicalMetrics {
  freeAuditsDelivered: number;
  paidAuditsDelivered: number;
  valueGivenVsAskedRatio: number; // Should be > 1
  helpFirstScore: number; // Percentage of free value vs total value
  emailsSentThisWeek: number;
  doNotContactListSize: number;
  unsubscribeRate: number;
  averageResponseTime: number;
}

export interface TransparencyReport {
  averageCostPerScan: number;
  freeTierCostCoverage: number; // What % of free tier costs are covered by paid users
  pricingMargin: number; // Markup over actual costs
  dataStoragePractices: string;
  userDataRetentionPolicy: string;
  thirdPartySharing: string; // Should always be "None"
}

/**
 * Validate if an email can be sent ethically
 */
export function canSendEmailEthically(params: {
  prospectId: string;
  emailsSentThisWeek: number;
  isInDoNotContactList: boolean;
  hasExplicitPermission: boolean;
}): { allowed: boolean; reason?: string } {
  if (params.isInDoNotContactList) {
    return { allowed: false, reason: "Prospect is on Do Not Contact list" };
  }

  if (!params.hasExplicitPermission && ETHICAL_CONSTRAINTS.requireExplicitPermission) {
    return { allowed: false, reason: "Explicit permission required before sending emails" };
  }

  if (params.emailsSentThisWeek >= ETHICAL_CONSTRAINTS.maxEmailsPerProspectPerWeek) {
    return { allowed: false, reason: `Maximum ${ETHICAL_CONSTRAINTS.maxEmailsPerProspectPerWeek} email(s) per week exceeded` };
  }

  return { allowed: true };
}

/**
 * Detect potentially deceptive subject lines
 */
export function isSubjectLineDeceptive(subject: string): { isDeceptive: boolean; reason?: string } {
  const deceptivePatterns = [
    /re:|fwd:/i, // Fake reply/forward
    /urgent|asap|immediate action/i, // Artificial urgency
    /congratulations|you('ve| have) won/i, // Fake prizes
    /act now|limited time|expires/i, // Pressure tactics
    /free money|guaranteed|risk-free/i, // Too good to be true
    /account suspended|verify your/i, // Phishing-like
  ];

  for (const pattern of deceptivePatterns) {
    if (pattern.test(subject)) {
      return {
        isDeceptive: true,
        reason: `Subject line matches deceptive pattern: ${pattern.source}`
      };
    }
  }

  return { isDeceptive: false };
}

/**
 * Calculate "Value Given vs Value Asked" ratio
 */
export function calculateValueRatio(metrics: EthicalMetrics): number {
  const totalValue = metrics.freeAuditsDelivered + metrics.paidAuditsDelivered;
  if (totalValue === 0) return 0;
  
  return metrics.freeAuditsDelivered / totalValue;
}

/**
 * Calculate "Help-First" score (percentage of free value)
 */
export function calculateHelpFirstScore(metrics: EthicalMetrics): number {
  return calculateValueRatio(metrics) * 100;
}

/**
 * Generate transparency report
 */
export function generateTransparencyReport(): TransparencyReport {
  return {
    averageCostPerScan: 0.11, // Updated with data-efficient components
    freeTierCostCoverage: 0.95, // 95% cost savings with optimization
    pricingMargin: 1.5, // 50% markup for sustainability
    dataStoragePractices: "Encrypted at rest and in transit. Minimum retention period. No third-party analytics.",
    userDataRetentionPolicy: "30 days for prospects, 90 days for users. Permanent deletion upon request.",
    thirdPartySharing: "None - Zero data sharing, ever"
  };
}

export const ETHICAL_MISSION = `
We serve accessibility, not shareholders.

Our platform exists to help businesses become more inclusive and serve ALL users - 
including those with disabilities, elderly users, and anyone who faces digital barriers.

We believe in:
- Giving value before asking for value
- Transparent, honest communication
- Protecting user privacy as a fundamental right
- Making accessibility consulting 10x faster while staying 100% ethical

The free tier stays free forever. We grow by helping, not exploiting.
`;
