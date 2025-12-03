/**
 * Phase III: Risk Scoring Weights
 *
 * Defines weights and multipliers for Compliance Credit Score (CCS) calculation.
 * CCS ranges from 0-850 (like FICO credit scores).
 */

export const CCS_WEIGHTS = {
  violationSeverity: 0.45,      // Critical violations (45%)
  jurisdictionRisk: 0.20,       // Lawsuit hotspot (20%)
  serialPlaintiffRisk: 0.20,    // Plaintiff proximity (20%)
  improvementTrend: 0.10,       // Progress over time (10%)
  industryAdjustment: 0.05      // Retail vs. Healthcare (5%)
} as const;

export const INDUSTRY_RISK_MULTIPLIERS = {
  retail: 1.5,        // High lawsuit exposure
  hospitality: 1.3,
  healthcare: 1.2,
  finance: 1.1,
  tech: 0.8,          // Lower exposure
  education: 0.7,
  government: 0.6,
  nonprofit: 0.5
} as const;

export const JURISDICTION_RISK_MAP: Record<string, number> = {
  // States with high ADA litigation activity
  'CA': 0.9,  // California (highest)
  'NY': 0.85, // New York
  'FL': 0.8,  // Florida
  'TX': 0.7,  // Texas
  'IL': 0.65, // Illinois
  'PA': 0.6,  // Pennsylvania
  'NJ': 0.6,  // New Jersey

  // Moderate risk states
  'WA': 0.5,
  'MA': 0.5,
  'GA': 0.45,
  'NC': 0.4,
  'VA': 0.4,

  // Lower risk states
  'US': 0.3, // Default for unknown/multi-state
};

export const SEVERITY_IMPACT_WEIGHTS = {
  critical: 1.0,    // Blocks core functionality
  serious: 0.6,     // Significant barriers
  moderate: 0.3,    // Accessibility issues
  minor: 0.1        // Technical violations
} as const;

/**
 * Score interpretation ranges
 */
export const SCORE_RANGES = {
  excellent: { min: 750, max: 850, label: 'Excellent', color: '#00cc66' },
  good: { min: 650, max: 749, label: 'Good', color: '#66cc00' },
  fair: { min: 550, max: 649, label: 'Fair', color: '#ffbb00' },
  poor: { min: 400, max: 549, label: 'Poor', color: '#ff8800' },
  critical: { min: 0, max: 399, label: 'Critical', color: '#ff4444' }
} as const;

/**
 * Get score interpretation
 */
export function getScoreInterpretation(score: number): {
  range: keyof typeof SCORE_RANGES;
  label: string;
  color: string;
  description: string;
} {
  let range: keyof typeof SCORE_RANGES = 'critical';

  for (const [key, value] of Object.entries(SCORE_RANGES)) {
    if (score >= value.min && score <= value.max) {
      range = key as keyof typeof SCORE_RANGES;
      break;
    }
  }

  const info = SCORE_RANGES[range];

  const descriptions = {
    excellent: 'Minimal compliance risk. Website meets or exceeds WCAG 2.1 AA standards.',
    good: 'Low compliance risk. Minor accessibility improvements recommended.',
    fair: 'Moderate compliance risk. Address violations to reduce lawsuit exposure.',
    poor: 'High compliance risk. Immediate remediation strongly recommended.',
    critical: 'Critical compliance risk. Legal exposure is significant. Urgent action required.'
  };

  return {
    range,
    label: info.label,
    color: info.color,
    description: descriptions[range]
  };
}

/**
 * Calculate grade letter from score
 */
export function getScoreGrade(score: number): string {
  if (score >= 800) return 'A+';
  if (score >= 750) return 'A';
  if (score >= 700) return 'A-';
  if (score >= 650) return 'B+';
  if (score >= 600) return 'B';
  if (score >= 550) return 'B-';
  if (score >= 500) return 'C+';
  if (score >= 450) return 'C';
  if (score >= 400) return 'C-';
  if (score >= 350) return 'D';
  return 'F';
}
