// Revenue-focused pricing tier strategy
// Tier 1 (Basic/$2.5K/mo): Scanning + basic reporting - Shows value immediately, hits limits naturally
// Tier 2 (Pro/$7.5K/mo): + Predictive intelligence + team workflows - Natural upgrade at 60-day mark
// Tier 3 (Enterprise/$25K+/mo): + Custom rules + regulatory consulting - For large enterprises

export type PricingTier = "BASIC" | "PRO" | "ENTERPRISE";

export interface TierFeatures {
  tier: PricingTier;
  monthlyPrice: number;
  scansPerMonth: number;
  teamMembers: number;
  features: {
    // Universal - NEVER gate these for Tier 1 (compliance data must be visible)
    complianceScanning: boolean;
    basicReporting: boolean;
    wcagCompliance: boolean;
    violationTracking: boolean;
    emailNotifications: boolean;
    
    // Tier 2+ - Smart expansion drivers
    predictiveIntelligence: boolean;  // ML-powered violation prediction
    teamWorkflows: boolean;            // Team collaboration & assignment
    customBenchmarks: boolean;         // Compare against custom industry benchmarks
    automatedRemediations: boolean;    // AI-powered fix suggestions
    apiAccess: boolean;                // REST API for integration
    ssoIntegration: boolean;           // Single sign-on
    
    // Tier 3+ - Enterprise only
    customRulesEngine: boolean;        // Domain-specific rules
    regulatoryConsulting: boolean;     // Compliance officer consultation
    prioritySupport: boolean;          // 24/7 support
    customSla: boolean;                // Custom SLAs
    dedicatedAccount: boolean;         // Dedicated account manager
  };
  limits: {
    violationsBeforeUpsell: number;    // Show "premium" badge after this many
    daysToUpsellTrigger: number;       // Show upgrade CTA after this many days
    teamCollaborationLimit: number;    // Max team members for Tier 1
    customRulesLimit: number;          // Max custom rules
  };
  upliftDrivers: {
    // When Tier 1 users hit these, show natural upsell trigger
    needsPredictiveAI: boolean;
    needsTeamCollaboration: boolean;
    needsCustomRules: boolean;
    needsHighVolumeScans: boolean;
  };
}

export const PRICING_TIERS: Record<PricingTier, TierFeatures> = {
  BASIC: {
    tier: "BASIC",
    monthlyPrice: 2500,
    scansPerMonth: 100,
    teamMembers: 1,
    features: {
      complianceScanning: true,
      basicReporting: true,
      wcagCompliance: true,
      violationTracking: true,
      emailNotifications: true,
      
      predictiveIntelligence: false,
      teamWorkflows: false,
      customBenchmarks: false,
      automatedRemediations: false,
      apiAccess: false,
      ssoIntegration: false,
      
      customRulesEngine: false,
      regulatoryConsulting: false,
      prioritySupport: false,
      customSla: false,
      dedicatedAccount: false,
    },
    limits: {
      violationsBeforeUpsell: 50,       // Show premium after 50 violations detected
      daysToUpsellTrigger: 30,          // Show upgrade CTA after 30 days
      teamCollaborationLimit: 1,
      customRulesLimit: 0,
    },
    upliftDrivers: {
      needsPredictiveAI: false,
      needsTeamCollaboration: false,
      needsCustomRules: false,
      needsHighVolumeScans: false,
    },
  },

  PRO: {
    tier: "PRO",
    monthlyPrice: 7500,
    scansPerMonth: 500,
    teamMembers: 5,
    features: {
      complianceScanning: true,
      basicReporting: true,
      wcagCompliance: true,
      violationTracking: true,
      emailNotifications: true,
      
      predictiveIntelligence: true,    // AI predicts violations before they happen
      teamWorkflows: true,              // Assign violations to team members
      customBenchmarks: true,           // vs. your vertical, not just generic
      automatedRemediations: true,      // Claude-powered fix suggestions
      apiAccess: true,
      ssoIntegration: true,
      
      customRulesEngine: false,
      regulatoryConsulting: false,
      prioritySupport: false,
      customSla: false,
      dedicatedAccount: false,
    },
    limits: {
      violationsBeforeUpsell: 200,
      daysToUpsellTrigger: 60,
      teamCollaborationLimit: 5,
      customRulesLimit: 10,
    },
    upliftDrivers: {
      needsPredictiveAI: false,
      needsTeamCollaboration: false,
      needsCustomRules: false,
      needsHighVolumeScans: false,
    },
  },

  ENTERPRISE: {
    tier: "ENTERPRISE",
    monthlyPrice: 25000,
    scansPerMonth: 5000,
    teamMembers: 50,
    features: {
      complianceScanning: true,
      basicReporting: true,
      wcagCompliance: true,
      violationTracking: true,
      emailNotifications: true,
      
      predictiveIntelligence: true,
      teamWorkflows: true,
      customBenchmarks: true,
      automatedRemediations: true,
      apiAccess: true,
      ssoIntegration: true,
      
      customRulesEngine: true,         // Domain-specific rules for fintech/healthcare/etc
      regulatoryConsulting: true,      // Annual compliance review with consultant
      prioritySupport: true,           // 24/7 support, 1hr response time
      customSla: true,
      dedicatedAccount: true,          // Personal account manager
    },
    limits: {
      violationsBeforeUpsell: 1000,
      daysToUpsellTrigger: 365,
      teamCollaborationLimit: 50,
      customRulesLimit: 100,
    },
    upliftDrivers: {
      needsPredictiveAI: false,
      needsTeamCollaboration: false,
      needsCustomRules: false,
      needsHighVolumeScans: false,
    },
  },
};

// Feature comparison data for "upgrade" modal
export const FEATURE_COMPARISON = {
  "Compliance Scanning": { basic: "✓", pro: "✓", enterprise: "✓" },
  "WCAG Audits": { basic: "✓", pro: "✓", enterprise: "✓" },
  "Basic Reporting": { basic: "✓", pro: "✓", enterprise: "✓" },
  "Violation Tracking": { basic: "✓", pro: "✓", enterprise: "✓" },
  
  "Predictive Intelligence (ML)": { basic: "—", pro: "✓", enterprise: "✓" },
  "Team Workflows": { basic: "—", pro: "✓ (5 users)", enterprise: "✓ (50 users)" },
  "Automated Remediations": { basic: "—", pro: "✓", enterprise: "✓" },
  "Custom Industry Benchmarks": { basic: "—", pro: "✓", enterprise: "✓" },
  
  "Custom Rules Engine": { basic: "—", pro: "—", enterprise: "✓" },
  "Regulatory Consulting": { basic: "—", pro: "—", enterprise: "✓" },
  "Priority Support (24/7)": { basic: "—", pro: "—", enterprise: "✓" },
  "Dedicated Account Manager": { basic: "—", pro: "—", enterprise: "✓" },
};

// Natural upsell triggers (when to show upgrade CTA)
export interface UpsellTrigger {
  condition: string;
  message: string;
  trigger: "predictive_ai" | "team_workflow" | "custom_rules" | "volume" | "support";
  tier: PricingTier;
}

export const UPSELL_TRIGGERS: UpsellTrigger[] = [
  {
    condition: "violations_count > 50",
    message: "Wow! You've found 50+ violations. Our Pro plan includes AI-powered predictions to find issues before they happen.",
    trigger: "predictive_ai",
    tier: "PRO",
  },
  {
    condition: "team_size > 1 && tier == BASIC",
    message: "Multiple team members? Pro plan includes team workflows to assign violations and track progress.",
    trigger: "team_workflow",
    tier: "PRO",
  },
  {
    condition: "days_active > 30 && tier == BASIC",
    message: "You've been using our platform for a month. Pro customers get 5x the scans and AI remediation suggestions.",
    trigger: "volume",
    tier: "PRO",
  },
  {
    condition: "team_size > 5 && tier == PRO",
    message: "Growing team? Enterprise plan supports up to 50 team members with custom domain rules and compliance consulting.",
    trigger: "team_workflow",
    tier: "ENTERPRISE",
  },
  {
    condition: "violations_count > 200 && tier == PRO",
    message: "Large compliance scope? Enterprise includes custom rules for your specific industry and regulatory framework.",
    trigger: "custom_rules",
    tier: "ENTERPRISE",
  },
];

// Tier determination helper
export function getUserTier(subscription: any): PricingTier {
  if (!subscription) return "BASIC";
  
  const planName = subscription.planName?.toUpperCase() || "";
  if (planName.includes("ENTERPRISE")) return "ENTERPRISE";
  if (planName.includes("PRO")) return "PRO";
  return "BASIC";
}

// Feature access helper - used throughout dashboard
export function hasFeature(tier: PricingTier, feature: keyof TierFeatures["features"]): boolean {
  return PRICING_TIERS[tier].features[feature];
}

// Check if user has hit upsell trigger
export function checkUpsellTriggers(
  tier: PricingTier,
  userData: {
    violationCount: number;
    teamSize: number;
    daysActive: number;
  }
): UpsellTrigger | null {
  for (const trigger of UPSELL_TRIGGERS) {
    // Skip if already on this tier or higher
    const tierOrder = { BASIC: 0, PRO: 1, ENTERPRISE: 2 };
    if (tierOrder[tier] >= tierOrder[trigger.tier]) continue;

    // Check condition
    if (trigger.trigger === "predictive_ai" && userData.violationCount > 50) {
      return trigger;
    }
    if (
      trigger.trigger === "team_workflow" &&
      userData.teamSize > 1 &&
      tier === "BASIC"
    ) {
      return trigger;
    }
    if (trigger.trigger === "volume" && userData.daysActive > 30 && tier === "BASIC") {
      return trigger;
    }
    if (
      trigger.trigger === "team_workflow" &&
      userData.teamSize > 5 &&
      tier === "PRO"
    ) {
      return trigger;
    }
    if (trigger.trigger === "custom_rules" && userData.violationCount > 200 && tier === "PRO") {
      return trigger;
    }
  }

  return null;
}
