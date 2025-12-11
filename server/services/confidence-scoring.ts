/**
 * AI Confidence Scoring Service
 * Calculates 0-100 confidence scores for recommendations
 * Based on historical success, industry agreement, customer history
 */

import type { Violation, FeedbackDecision, PersonalizedWeights } from "@shared/schema";

export interface ConfidenceFactors {
  historicalSuccessRate: number; // 0-1 (87% → 0.87)
  violationFrequency: number; // 0-1 (seen 1000s of times → 0.92)
  violationSeverity: number; // 0-1 (critical → 0.9, minor → 0.6)
  industryAgreement: number; // 0-1 (95% of fintech teams agree → 0.95)
  customerHistory: number; // 0-1 (customer usually follows → 0.89)
}

export interface ConfidencePenalties {
  contradictions: number; // -0 to -0.2 (some teams fix differently)
  recentFailures: number; // -0 to -0.3 (failed 2x last week)
}

export interface ConfidenceScore {
  score: number; // 0-100
  reasoning: string; // "High confidence: 1000+ similar fixes"
  factors: ConfidenceFactors;
  penalties: ConfidencePenalties;
}

/**
 * Calculate confidence score for a recommendation
 */
export function calculateConfidenceScore(
  violation: Partial<Violation>,
  feedback: FeedbackDecision[],
  weights: PersonalizedWeights | null,
  industryData: { verticalName: string } | null
): ConfidenceScore {
  // Base factors (defaults if no data available)
  const factors: ConfidenceFactors = {
    historicalSuccessRate: calculateHistoricalSuccess(feedback),
    violationFrequency: calculateFrequency(violation.type || "unknown"),
    violationSeverity: calculateSeverityFactor(violation.severity || "moderate"),
    industryAgreement: calculateIndustryAgreement(violation.type || "unknown", industryData),
    customerHistory: calculateCustomerHistory(feedback),
  };

  // Penalties
  const penalties: ConfidencePenalties = {
    contradictions: calculateContradictions(feedback),
    recentFailures: calculateRecentFailures(feedback),
  };

  // Calculate base score (0-100)
  let score = 100;
  score *= factors.historicalSuccessRate;
  score *= factors.violationFrequency;
  score *= factors.violationSeverity;
  score *= factors.industryAgreement;
  score *= factors.customerHistory;

  // Apply penalties
  score -= penalties.contradictions * 100;
  score -= penalties.recentFailures * 100;

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Generate reasoning
  const reasoning = generateReasoning(score, factors, penalties);

  return {
    score,
    reasoning,
    factors,
    penalties,
  };
}

/**
 * Calculate historical success rate
 * What % of similar recommendations were followed and worked?
 */
function calculateHistoricalSuccess(feedback: FeedbackDecision[]): number {
  if (feedback.length === 0) return 0.75; // Default: 75% if no data

  const followed = feedback.filter(
    (f) => f.actionTaken === "fixed" && f.actualOutcome === "worked"
  );
  const total = feedback.length;

  // If very few data points, don't be overconfident
  if (total < 10) return 0.7;
  if (total < 50) return 0.75;

  return followed.length / total;
}

/**
 * Calculate frequency score
 * How often have we seen this violation type?
 */
function calculateFrequency(violationType: string): number {
  // In real implementation, query database for frequency
  // For now, return reasonable defaults based on common violations
  const commonViolations = [
    "color-contrast",
    "image-alt",
    "label",
    "link-name",
    "button-name",
  ];

  if (commonViolations.includes(violationType)) {
    return 0.92; // Very common, high confidence
  }

  return 0.7; // Less common, medium confidence
}

/**
 * Calculate severity factor
 * Critical violations → higher confidence (well-understood)
 * Minor violations → lower confidence (more subjective)
 */
function calculateSeverityFactor(severity: string): number {
  switch (severity.toLowerCase()) {
    case "critical":
      return 0.95;
    case "serious":
      return 0.85;
    case "moderate":
      return 0.75;
    case "minor":
      return 0.65;
    default:
      return 0.7;
  }
}

/**
 * Calculate industry agreement
 * Do most teams in this vertical fix it the same way?
 */
function calculateIndustryAgreement(
  violationType: string,
  industryData: { verticalName: string } | null
): number {
  // In real implementation, query aggregated vertical insights
  // For now, return reasonable defaults
  if (!industryData) return 0.8; // No vertical data, assume moderate agreement

  // Some violations are universal (high agreement)
  const universalViolations = ["color-contrast", "image-alt", "label"];
  if (universalViolations.includes(violationType)) {
    return 0.95; // 95% of teams agree
  }

  return 0.8; // Default: 80% agreement
}

/**
 * Calculate customer history
 * Does this customer usually follow AI recommendations?
 */
function calculateCustomerHistory(feedback: FeedbackDecision[]): number {
  if (feedback.length === 0) return 0.8; // Default: assume they'll follow

  const followed = feedback.filter((f) => f.actionTaken === "fixed");
  const total = feedback.length;

  // If very few data points, don't penalize
  if (total < 5) return 0.85;

  return followed.length / total;
}

/**
 * Calculate contradiction penalty
 * Are there multiple ways teams fix this?
 */
function calculateContradictions(feedback: FeedbackDecision[]): number {
  if (feedback.length < 10) return 0; // Not enough data to detect contradictions

  // Count different fix approaches
  const fixApproaches = new Set<string>();
  feedback.forEach((f) => {
    if (f.actionTaken === "fixed" || f.actionTaken === "already_fixed_differently") {
      // In real implementation, analyze fix text similarity
      fixApproaches.add(f.recommendationText);
    }
  });

  // If multiple approaches, penalize confidence
  if (fixApproaches.size > 2) {
    return 0.08; // -8% confidence
  }

  return 0;
}

/**
 * Calculate recent failure penalty
 * Did this recommendation fail recently?
 */
function calculateRecentFailures(feedback: FeedbackDecision[]): number {
  // Get feedback from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentFeedback = feedback.filter(
    (f) => new Date(f.timestamp) > sevenDaysAgo
  );

  if (recentFeedback.length === 0) return 0;

  const failures = recentFeedback.filter((f) => f.actualOutcome === "failed");

  // More than 2 failures in last week = significant penalty
  if (failures.length > 2) {
    return 0.15; // -15% confidence
  }

  // 1-2 failures = small penalty
  if (failures.length > 0) {
    return 0.05; // -5% confidence
  }

  return 0;
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(
  score: number,
  factors: ConfidenceFactors,
  penalties: ConfidencePenalties
): string {
  if (score >= 90) {
    return `Very high confidence: ${Math.round(factors.historicalSuccessRate * 100)}% historical success, ${Math.round(factors.industryAgreement * 100)}% industry agreement`;
  }

  if (score >= 80) {
    return `High confidence: Strong historical data and industry consensus`;
  }

  if (score >= 70) {
    return `Moderate confidence: Good historical data, some variation in approaches`;
  }

  if (score >= 60) {
    return `Medium confidence: Limited historical data or recent failures detected`;
  }

  if (score >= 50) {
    return `Low confidence: Contradictory fixes observed or insufficient data`;
  }

  return `Very low confidence: Recommend human review before implementing`;
}

/**
 * Get confidence tier (for UI display)
 */
export function getConfidenceTier(
  score: number
): "very-high" | "high" | "moderate" | "low" | "very-low" {
  if (score >= 90) return "very-high";
  if (score >= 80) return "high";
  if (score >= 70) return "moderate";
  if (score >= 60) return "low";
  return "very-low";
}

/**
 * Get confidence badge color
 */
export function getConfidenceColor(score: number): string {
  if (score >= 90) return "text-emerald-500";
  if (score >= 80) return "text-blue-500";
  if (score >= 70) return "text-yellow-500";
  if (score >= 60) return "text-orange-500";
  return "text-red-500";
}

/**
 * Should recommendation require human review?
 */
export function requiresHumanReview(score: number): boolean {
  return score < 60;
}
