/**
 * Infinity8 Score Service
 * Digital Accessibility Credit Rating (like FICO for compliance)
 *
 * Score ranges from 0-1000, with factors based on:
 * 1. WCAG compliance level (automated)
 * 2. Historical litigation exposure (public data)
 * 3. Remediation velocity (how fast you fix issues)
 * 4. Industry benchmarking (where you rank vs peers)
 * 5. Third-party validation (independent audits)
 *
 * This is a TECHNICAL SCORE - not a legal judgment
 */

import { Infinity8Score, AccessibilityAudit, RiskAssessment } from '../types/index';
import * as litigationDB from './litigationDatabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Score brackets (like FICO)
 * 0-300: F (Critical)
 * 300-500: D (Poor)
 * 500-700: C (Fair)
 * 700-850: B (Good)
 * 850-950: A (Very Good)
 * 950-1000: A+ (Excellent)
 */
type ScoreGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

function scoreToGrade(score: number): ScoreGrade {
  if (score >= 950) return 'A+';
  if (score >= 850) return 'A';
  if (score >= 700) return 'B';
  if (score >= 500) return 'C';
  if (score >= 300) return 'D';
  return 'F';
}

/**
 * Calculate Infinity8 Score from audit and risk data
 */
export function calculateInfinity8Score(
  audit: AccessibilityAudit,
  riskAssessment: RiskAssessment,
  industry: string,
  previousScores?: { date: Date; score: number; grade: string }[]
): Infinity8Score {
  // Calculate individual factors (0-100 scale)
  const factors = {
    wcagCompliance: calculateWCAGFactor(audit),
    litigationHistory: calculateLitigationHistoryFactor(riskAssessment),
    remediationVelocity: calculateRemediationVelocityFactor(previousScores),
    industryBenchmark: calculateIndustryBenchmarkFactor(audit, industry),
    thirdPartyValidation: calculateValidationFactor(audit),
  };

  // Calculate final score (weighted average)
  const weights = {
    wcagCompliance: 0.3,
    litigationHistory: 0.25,
    remediationVelocity: 0.2,
    industryBenchmark: 0.15,
    thirdPartyValidation: 0.1,
  };

  const baseScore =
    (factors.wcagCompliance * weights.wcagCompliance +
      factors.litigationHistory * weights.litigationHistory +
      factors.remediationVelocity * weights.remediationVelocity +
      factors.industryBenchmark * weights.industryBenchmark +
      factors.thirdPartyValidation * weights.thirdPartyValidation) *
    10; // Scale to 0-1000

  const finalScore = Math.round(Math.max(0, Math.min(1000, baseScore)));
  const grade = scoreToGrade(finalScore);

  // Calculate market impact
  const marketImpact = calculateMarketImpact(finalScore, industry);

  // Build score history
  const history = previousScores || [];
  history.push({
    date: new Date(),
    score: finalScore,
    grade,
  });

  return {
    id: uuidv4(),
    domain: audit.domain,
    score: finalScore,
    grade,
    factors,
    marketImpact,
    history: history.slice(-12), // Keep last 12 entries
    lastUpdated: new Date(),
  };
}

/**
 * WCAG Compliance Factor (0-100)
 * Based on: violations per WCAG level
 */
function calculateWCAGFactor(audit: AccessibilityAudit): number {
  const { criticalCount, seriousCount, totalViolations } = audit.stats;

  if (totalViolations === 0) return 100; // No violations = perfect score

  // Violations reduce score based on severity
  const criticalPenalty = criticalCount * 15; // -15 per critical
  const seriousPenalty = seriousCount * 8; // -8 per serious
  const totalPenalty = Math.min(criticalPenalty + seriousPenalty, 100); // Cap at 100

  return Math.max(0, 100 - totalPenalty);
}

/**
 * Litigation History Factor (0-100)
 * Based on: litigation probability from comparable cases
 */
function calculateLitigationHistoryFactor(riskAssessment: RiskAssessment): number {
  // Convert litigation probability (0-100) to a factor that penalizes high-risk profiles
  // High probability = lower factor
  const litigationProbability = riskAssessment.litigationRisk.probability;

  // 0% probability = 100 points
  // 100% probability = 0 points
  return Math.max(0, 100 - litigationProbability);
}

/**
 * Remediation Velocity Factor (0-100)
 * Based on: how fast they're fixing issues over time
 */
function calculateRemediationVelocityFactor(previousScores?: { date: Date; score: number }[]): number {
  if (!previousScores || previousScores.length < 2) {
    return 50; // Neutral score if no history
  }

  const recentScores = previousScores.slice(-12); // Last year
  const oldestScore = recentScores[0].score;
  const newestScore = recentScores[recentScores.length - 1].score;

  const improvement = newestScore - oldestScore;

  // Score improvement = reward
  if (improvement > 200) return 100; // Excellent progress
  if (improvement > 100) return 80; // Good progress
  if (improvement > 0) return 60; // Some progress
  if (improvement === 0) return 40; // No change
  return 20; // Getting worse
}

/**
 * Industry Benchmark Factor (0-100)
 * Based on: where they rank vs. competitors in same industry
 */
function calculateIndustryBenchmarkFactor(audit: AccessibilityAudit, industry: string): number {
  const benchmark = litigationDB.getIndustryBenchmark(industry, audit.stats.totalViolations);

  // Percentile ranking
  // Bottom 10% = low score
  // Top 10% = high score
  return Math.round(100 - benchmark.percentile);
}

/**
 * Third-Party Validation Factor (0-100)
 * Based on: independent audits, expert reviews
 */
function calculateValidationFactor(audit: AccessibilityAudit): number {
  let factor = 50; // Base score

  // Automated tool + expert review = higher confidence
  if (audit.validation.expert) {
    factor += 30; // +30 for expert validation
  }

  // Blockchain verification = tamper-proof evidence
  if (audit.validation.blockchain) {
    factor += 20; // +20 for blockchain logging
  }

  return Math.min(factor, 100);
}

/**
 * Calculate market impact based on score
 * (Purely informational - shows business implications of compliance standing)
 */
function calculateMarketImpact(
  score: number,
  industry: string
): Infinity8Score['marketImpact'] {
  // Insurance premium impact (estimated)
  // Lower score = higher insurance costs
  const insurancePremiumDelta = Math.max(-30, Math.min(50, (score - 500) / 10));

  // RFP win rate impact (estimated)
  // Enterprise buyers increasingly require accessibility compliance
  const rfpWinRateDelta = (score - 500) * 0.3; // Each 100 points = ~30% impact

  // Enterprise partnership score
  const enterprisePartnershipScore = score * 0.9 + 100; // Capped at ~1000

  return {
    insurancePremiumDelta: Math.round(insurancePremiumDelta),
    rfpWinRateDelta: Math.round(rfpWinRateDelta),
    enterprisePartnershipScore: Math.round(Math.min(1000, enterprisePartnershipScore)),
    creditScore: scoreToGrade(score) === 'F' || scoreToGrade(score) === 'D' ? 'poor' : scoreToGrade(score) === 'C' ? 'fair' : scoreToGrade(score) === 'B' ? 'good' : 'excellent',
  };
}

/**
 * Generate score report for business stakeholders
 */
export function generateScoreReport(score: Infinity8Score): string {
  const lines: string[] = [];

  lines.push(`# Infinity8 Accessibility Score Report`);
  lines.push(``);

  // Score badge
  lines.push(`## Your Score: ${score.score}/1000 (Grade: ${score.grade})`);
  lines.push(``);

  // What it means
  const meanings: Record<ScoreGrade, string> = {
    'A+': 'Excellent compliance. Industry leader. Strong competitive advantage.',
    'A': 'Very good compliance. Minimal litigation risk. Enterprise-ready.',
    'B': 'Good compliance. Manageable risk. Recommended for remediation.',
    'C': 'Fair compliance. Moderate risk. Urgent remediation needed.',
    'D': 'Poor compliance. High risk. Immediate action required.',
    'F': 'Critical gaps. Severe risk. Crisis-level remediation required.',
  };

  lines.push(`**What This Means:** ${meanings[score.grade]}`);
  lines.push(``);

  // Score factors
  lines.push(`## Score Breakdown`);
  lines.push(``);
  lines.push(`| Factor | Score | Weight |`);
  lines.push(`|--------|-------|--------|`);
  lines.push(`| WCAG Compliance | ${score.factors.wcagCompliance}/100 | 30% |`);
  lines.push(`| Litigation History Risk | ${score.factors.litigationHistory}/100 | 25% |`);
  lines.push(`| Remediation Velocity | ${score.factors.remediationVelocity}/100 | 20% |`);
  lines.push(`| Industry Benchmark | ${score.factors.industryBenchmark}/100 | 15% |`);
  lines.push(`| Third-Party Validation | ${score.factors.thirdPartyValidation}/100 | 10% |`);
  lines.push(``);

  // Business impact
  lines.push(`## Business Impact`);
  lines.push(``);
  lines.push(
    `- **Insurance Premium Impact:** ${score.marketImpact.insurancePremiumDelta > 0 ? '+' : ''}${score.marketImpact.insurancePremiumDelta}% (${score.marketImpact.insurancePremiumDelta > 0 ? 'savings' : 'increase'})`
  );
  lines.push(
    `- **RFP Win Rate Impact:** ${score.marketImpact.rfpWinRateDelta > 0 ? '+' : ''}${Math.round(score.marketImpact.rfpWinRateDelta)}% improvement potential`
  );
  lines.push(
    `- **Enterprise Partnership Score:** ${score.marketImpact.enterprisePartnershipScore}/1000`
  );
  lines.push(`- **Credit Rating:** ${score.marketImpact.creditScore.toUpperCase()}`);
  lines.push(``);

  // Score history
  if (score.history.length > 1) {
    lines.push(`## Score Trend (Last 12 Months)`);
    lines.push(``);
    lines.push(`| Date | Score | Grade |`);
    lines.push(`|------|-------|-------|`);
    for (const entry of score.history) {
      lines.push(
        `| ${entry.date.toISOString().split('T')[0]} | ${entry.score} | ${entry.grade} |`
      );
    }
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`**This score is a technical measurement, not a legal determination.**`);
  lines.push(
    `It is based on WCAG standards, public litigation data, and industry benchmarking.`
  );

  return lines.join('\n');
}

export default {
  calculateInfinity8Score,
  generateScoreReport,
};
