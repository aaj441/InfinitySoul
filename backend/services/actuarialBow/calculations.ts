import { RawSignals } from '../../intel/riskDistribution/types/RawSignals';
import { RiskVector, PremiumRecommendation } from '../../intel/riskDistribution/types/RiskVector';

/**
 * Risk calculation weights (config-driven)
 * Adjust these to tune model behavior per vertical (insurers vs. universities)
 */
export const RISK_WEIGHTS = {
  musicVolatility: 0.15,
  sentimentVolatility: 0.15,
  drivingRisk: 0.25,
  healthRisk: 0.25,
  householdInstability: 0.10,
  locationRisk: 0.10,
};

/**
 * Premium calculation multipliers
 */
export const PREMIUM_CONFIG = {
  baselineMultiplier: 1.0,
  lowRiskDiscount: 0.85,    // 15% discount
  mediumRiskSurcharge: 1.15, // 15% surcharge
  highRiskSurcharge: 1.50,   // 50% surcharge
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Compute RiskVector from normalized RawSignals
 *
 * @param signals Validated and normalized RawSignals
 * @returns RiskVector with all dimensions populated
 */
export function computeRiskVector(signals: RawSignals): RiskVector {
  const drivers: string[] = [];
  let riskScore = 0;

  // Music signals → emotional stability indicator
  if (signals.musicProfile) {
    const m = signals.musicProfile;
    const musicRisk = clamp01(m.volatilityIndex * 0.6 + m.lateNightListening * 0.4);
    riskScore += musicRisk * RISK_WEIGHTS.musicVolatility;

    if (musicRisk > 0.7) {
      drivers.push('High emotional volatility (music listening patterns)');
    }
    if (m.lateNightListening > 0.5) {
      drivers.push('Elevated late-night listening (sleep disruption signal)');
    }
  }

  // Sentiment signals → mental health indicator
  if (signals.sentimentProfile) {
    const s = signals.sentimentProfile;
    const sentimentRisk = clamp01(s.volatility * 0.7 + s.negativity * 0.3);
    riskScore += sentimentRisk * RISK_WEIGHTS.sentimentVolatility;

    if (sentimentRisk > 0.7) {
      drivers.push('Elevated emotional volatility (sentiment analysis)');
    }
    if (s.negativity > 0.6) {
      drivers.push('Persistent negative sentiment');
    }
  }

  // Driving signals → behavioral safety indicator
  if (signals.drivingProfile) {
    const d = signals.drivingProfile;
    const drivingRisk = clamp01(
      Math.min(1, d.hardBrakesPer100km / 10) * 0.3 +
      Math.min(1, d.harshAccelerationPer100km / 10) * 0.3 +
      Math.min(1, d.speedingIncidentsPerMonth / 5) * 0.4
    );
    riskScore += drivingRisk * RISK_WEIGHTS.drivingRisk;

    if (drivingRisk > 0.6) {
      drivers.push('Risky driving behaviors detected');
    }
    if (d.speedingIncidentsPerMonth > 2) {
      drivers.push('Multiple speeding incidents');
    }
  }

  // Health signals → medical complexity indicator
  if (signals.healthProfile) {
    const h = signals.healthProfile;
    const healthRisk = clamp01(
      h.chronicConditionScore * 0.5 +
      (1 - h.preventiveCareScore) * 0.3 +
      (1 - h.adherenceScore) * 0.2
    );
    riskScore += healthRisk * RISK_WEIGHTS.healthRisk;

    if (healthRisk > 0.7) {
      drivers.push('High medical complexity and/or poor treatment adherence');
    }
    if (h.chronicConditionScore > 0.7) {
      drivers.push('Multiple chronic conditions');
    }
  }

  // Household stability signals → financial/life stability indicator
  if (signals.householdStability) {
    const hs = signals.householdStability;
    const instability = clamp01(
      Math.min(1, hs.movesLast3Years / 3) * 0.4 +
      Math.min(1, hs.missedPaymentsLast12Months / 6) * 0.6
    );
    riskScore += instability * RISK_WEIGHTS.householdInstability;

    if (instability > 0.6) {
      drivers.push('Financial and/or housing instability');
    }
    if (hs.missedPaymentsLast12Months > 2) {
      drivers.push('Multiple missed payments');
    }
  }

  // Location risk → geographic/environmental factor
  if (typeof signals.locationRiskFactor === 'number') {
    riskScore += clamp01(signals.locationRiskFactor) * RISK_WEIGHTS.locationRisk;

    if (signals.locationRiskFactor > 0.7) {
      drivers.push('High-risk geographic location');
    }
  }

  riskScore = clamp01(riskScore);

  // Compute individual dimensions
  const stabilityScore = signals.householdStability
    ? 1 - clamp01(signals.householdStability.movesLast3Years / 3)
    : 0.5;

  const emotionalVolatility = signals.sentimentProfile?.volatility ?? 0.5;

  const behavioralConsistency = signals.drivingProfile
    ? 1 - clamp01(
        Math.min(1, signals.drivingProfile.hardBrakesPer100km / 20) +
        Math.min(1, signals.drivingProfile.speedingIncidentsPerMonth / 10)
      ) / 2
    : 0.5;

  const locationRisk = clamp01(signals.locationRiskFactor ?? 0.5);
  const claimsLikelihood = riskScore;

  return {
    stabilityScore,
    emotionalVolatility,
    behavioralConsistency,
    locationRisk,
    claimsLikelihood,
    overallRisk: riskScore,
    drivers: drivers.length > 0 ? drivers : ['Standard risk profile'],
    confidence: 0.75,
    computedAt: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  };
}

/**
 * Compute PremiumRecommendation from RiskVector and baseline
 *
 * @param risk Computed RiskVector
 * @param baselinePremium Market baseline premium ($)
 * @returns PremiumRecommendation with adjusted premium and rationale
 */
export function computePremiumRecommendation(
  risk: RiskVector,
  baselinePremium: number = 1000 // Default $1000/month for health insurance example
): PremiumRecommendation {
  const riskLevel = risk.overallRisk;
  let multiplier: number;
  const discountReasons: string[] = [];
  const surchargeReasons: string[] = [...risk.drivers];

  // Tiered multiplier based on overall risk
  if (riskLevel < 0.33) {
    multiplier = PREMIUM_CONFIG.lowRiskDiscount;
    discountReasons.push('Low risk profile: stable, consistent behaviors');
  } else if (riskLevel < 0.66) {
    multiplier = PREMIUM_CONFIG.baselineMultiplier;
    discountReasons.push('Medium risk: within typical population ranges');
  } else {
    multiplier = PREMIUM_CONFIG.highRiskSurcharge;
  }

  const adjustedPremium = baselinePremium * multiplier;

  // Confidence interval (±20% around adjusted)
  const confidenceMargin = adjustedPremium * 0.2;

  return {
    baselinePremium,
    adjustedPremium: Math.round(adjustedPremium * 100) / 100,
    discountReasons,
    surchargeReasons,
    confidenceInterval: {
      lower: Math.round((adjustedPremium - confidenceMargin) * 100) / 100,
      upper: Math.round((adjustedPremium + confidenceMargin) * 100) / 100,
    },
  };
}

/**
 * Analyze a cohort of signals and return aggregate statistics
 * Useful for campus early warning or insurer portfolio analysis
 *
 * @param cohort Array of RawSignals objects
 * @returns Cohort-level statistics and risk distribution
 */
export function analyzeCohort(cohort: RawSignals[]): {
  count: number;
  averageRisk: number;
  riskDistribution: { low: number; medium: number; high: number };
  topRiskDrivers: { driver: string; frequency: number }[];
  recommendations: string[];
} {
  if (cohort.length === 0) {
    return {
      count: 0,
      averageRisk: 0,
      riskDistribution: { low: 0, medium: 0, high: 0 },
      topRiskDrivers: [],
      recommendations: [],
    };
  }

  const risks = cohort.map(computeRiskVector);
  const averageRisk = risks.reduce((sum, r) => sum + r.overallRisk, 0) / risks.length;

  // Count risk levels
  const riskDistribution = {
    low: risks.filter(r => r.overallRisk < 0.33).length,
    medium: risks.filter(r => r.overallRisk >= 0.33 && r.overallRisk < 0.66).length,
    high: risks.filter(r => r.overallRisk >= 0.66).length,
  };

  // Aggregate drivers
  const driverMap = new Map<string, number>();
  risks.forEach(r => {
    r.drivers.forEach(d => {
      driverMap.set(d, (driverMap.get(d) ?? 0) + 1);
    });
  });

  const topRiskDrivers = Array.from(driverMap.entries())
    .map(([driver, frequency]) => ({ driver, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Recommendations
  const recommendations: string[] = [];
  if (averageRisk > 0.6) {
    recommendations.push('Cohort exhibits elevated overall risk. Targeted interventions recommended.');
  }
  if (riskDistribution.high / cohort.length > 0.3) {
    recommendations.push('More than 30% of cohort in high-risk category. Consider segmented pricing or support programs.');
  }

  const emotionalVolatility = risks.reduce((sum, r) => sum + r.emotionalVolatility, 0) / risks.length;
  if (emotionalVolatility > 0.6) {
    recommendations.push('Elevated emotional volatility across cohort. Mental health support resources may improve retention.');
  }

  return {
    count: cohort.length,
    averageRisk,
    riskDistribution,
    topRiskDrivers,
    recommendations,
  };
}
