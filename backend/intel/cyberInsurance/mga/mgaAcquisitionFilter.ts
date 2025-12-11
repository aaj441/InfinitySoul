/**
 * MGA Acquisition Filter
 * 
 * Implements the Kluge Playbook filtering logic:
 * 1. Distressed financials (combined ratio >115%)
 * 2. Structural assets (reinsurance treaty, claims data)
 * 3. Operational inefficiency (manual underwriters)
 * 4. Founder exit intent (age >55, underwater)
 */

import { MGATarget, MGAAcquisitionScore } from './mgaTypes';

/**
 * Kluge Acquisition Filter Criteria
 * 
 * Based on 1956 TV station signals translated to 2025 cyber insurance
 */
export const KLUGE_FILTER_CRITERIA = {
  // Financial Distress Signals
  minCombinedRatio: 115,          // >115% = losing money
  maxCombinedRatio: 150,          // >150% = terminal
  minAnnualPremium: 5_000_000,    // $5M minimum scale
  maxAnnualPremium: 50_000_000,   // $50M max (still acquirable)
  
  // Pricing Targets
  maxBookValueMultiple: 0.6,      // Max 0.6x book (target 0.5x)
  targetBookValueMultiple: 0.5,   // Kluge target: 0.5x book
  
  // Operational Leverage
  minUnderwriterCount: 3,         // At least 3 to justify automation
  minUnderwriterSalary: 80_000,   // $80K avg = meaningful savings
  
  // Data Assets
  minClaimsHistoryYears: 3,       // 3+ years of data
  minClaimRecords: 1000,          // 1K+ records for ML
  
  // Reinsurance Quality
  minTreatyCapacity: 10_000_000,  // $10M+ capacity
  requiredRenewalLikelihood: ['high', 'medium'], // Treaty must be renewable
  
  // Distress Scoring Weights
  weights: {
    combinedRatio: 0.35,          // 35% weight on losses
    founderAge: 0.15,             // 15% on exit intent
    bookValueDiscount: 0.25,      // 25% on price
    dataQuality: 0.15,            // 15% on data assets
    reinsuranceQuality: 0.10,     // 10% on treaty
  },
  
  // Projected Returns
  minIRR: 50,                     // 50% minimum IRR
  targetIRR: 82,                  // 82% target (Kluge target)
};

/**
 * Calculate MGA Acquisition Score
 * 
 * Evaluates an MGA target against Kluge criteria
 */
export function calculateMGAAcquisitionScore(target: MGATarget): MGAAcquisitionScore {
  const criteria = KLUGE_FILTER_CRITERIA;
  
  // 1. Financial Distress Score (0-100)
  const financialDistress = calculateFinancialDistressScore(target, criteria);
  
  // 2. Structural Assets Score (0-100)
  const structuralAssets = calculateStructuralAssetsScore(target, criteria);
  
  // 3. Operational Leverage Score (0-100)
  const operationalLeverage = calculateOperationalLeverageScore(target, criteria);
  
  // 4. Market Position Score (0-100)
  const marketPosition = calculateMarketPositionScore(target);
  
  // 5. Acquisition Price Score (0-100)
  const acquisitionPrice = calculateAcquisitionPriceScore(target, criteria);
  
  // Weighted Overall Score
  const overallScore = 
    financialDistress * 0.35 +
    structuralAssets * 0.25 +
    operationalLeverage * 0.20 +
    marketPosition * 0.10 +
    acquisitionPrice * 0.10;
  
  // Calculate Projected Savings (Kluge operational leverage)
  const projectedSavings = calculateProjectedSavings(target);
  
  // Calculate Projected Financials
  const projectedFinancials = calculateProjectedFinancials(target, projectedSavings);
  
  // Identify Risks & Mitigations
  const risks = identifyRisks(target);
  const mitigations = generateMitigations(risks, target);
  
  // Generate Recommendation
  const recommendation = generateRecommendation(
    overallScore,
    projectedFinancials.irr,
    target.combinedRatio
  );
  
  return {
    targetId: target.id,
    overallScore: Math.round(overallScore),
    breakdown: {
      financialDistress: Math.round(financialDistress),
      structuralAssets: Math.round(structuralAssets),
      operationalLeverage: Math.round(operationalLeverage),
      marketPosition: Math.round(marketPosition),
      acquisitionPrice: Math.round(acquisitionPrice),
    },
    projectedSavings,
    projectedFinancials,
    risks,
    mitigations,
    recommendation,
    rationale: generateRationale(overallScore, projectedFinancials, target),
    assessmentDate: new Date(),
  };
}

/**
 * Calculate Financial Distress Score
 * 
 * Higher combined ratio = more distressed = better target
 */
function calculateFinancialDistressScore(target: MGATarget, criteria: typeof KLUGE_FILTER_CRITERIA): number {
  const { combinedRatio, annualPremium } = target;
  
  // Combined ratio score (sweet spot: 120-140%)
  let crScore = 0;
  if (combinedRatio < criteria.minCombinedRatio) {
    // Not distressed enough
    crScore = 0;
  } else if (combinedRatio > criteria.maxCombinedRatio) {
    // Too distressed (terminal)
    crScore = 30;
  } else {
    // Sweet spot: 115-150%
    crScore = Math.min(100, ((combinedRatio - 100) / 50) * 100);
  }
  
  // Scale score
  let scaleScore = 0;
  if (annualPremium >= criteria.minAnnualPremium && annualPremium <= criteria.maxAnnualPremium) {
    scaleScore = 100;
  } else if (annualPremium < criteria.minAnnualPremium) {
    scaleScore = (annualPremium / criteria.minAnnualPremium) * 50;
  } else {
    // Too large (harder to acquire)
    scaleScore = 100 - ((annualPremium - criteria.maxAnnualPremium) / criteria.maxAnnualPremium) * 50;
  }
  
  // Founder exit intent
  const founderScore = calculateFounderExitScore(target);
  
  return (crScore * 0.5) + (scaleScore * 0.3) + (founderScore * 0.2);
}

/**
 * Calculate Structural Assets Score
 * 
 * Reinsurance treaty + claims data = structural moat
 */
function calculateStructuralAssetsScore(target: MGATarget, criteria: typeof KLUGE_FILTER_CRITERIA): number {
  const { reinsuranceTreaty, claimsHistory } = target;
  
  // Reinsurance Treaty Score
  let treatyScore = 0;
  if (reinsuranceTreaty.capacity >= criteria.minTreatyCapacity) {
    treatyScore += 40;
  } else {
    treatyScore += (reinsuranceTreaty.capacity / criteria.minTreatyCapacity) * 40;
  }
  
  if (criteria.requiredRenewalLikelihood.includes(reinsuranceTreaty.renewalLikelihood)) {
    treatyScore += 10;
  }
  
  // Claims Data Score
  let dataScore = 0;
  if (claimsHistory.yearsOfData >= criteria.minClaimsHistoryYears) {
    dataScore += 30;
  } else {
    dataScore += (claimsHistory.yearsOfData / criteria.minClaimsHistoryYears) * 30;
  }
  
  if (claimsHistory.recordCount >= criteria.minClaimRecords) {
    dataScore += 20;
  } else {
    dataScore += (claimsHistory.recordCount / criteria.minClaimRecords) * 20;
  }
  
  // Data quality bonus
  const qualityMap = { excellent: 10, good: 7, fair: 4, poor: 0 };
  dataScore += qualityMap[claimsHistory.dataQuality] || 0;
  
  return treatyScore + dataScore;
}

/**
 * Calculate Operational Leverage Score
 * 
 * Potential savings from firing underwriters and deploying agents
 */
function calculateOperationalLeverageScore(target: MGATarget, criteria: typeof KLUGE_FILTER_CRITERIA): number {
  const { underwriters, operatingExpense, annualPremium } = target;
  
  // Underwriter replacement potential
  let replacementScore = 0;
  if (underwriters.canReplace && underwriters.count >= criteria.minUnderwriterCount) {
    replacementScore = 60;
  } else if (underwriters.canReplace) {
    replacementScore = 40;
  } else {
    replacementScore = 0;
  }
  
  // Expense ratio (high = more leverage)
  const expenseRatio = operatingExpense / annualPremium;
  let expenseScore = 0;
  if (expenseRatio > 0.3) {
    // >30% expense ratio = lots of savings potential
    expenseScore = 40;
  } else if (expenseRatio > 0.2) {
    expenseScore = 30;
  } else {
    expenseScore = 20;
  }
  
  return replacementScore + expenseScore;
}

/**
 * Calculate Market Position Score
 */
function calculateMarketPositionScore(target: MGATarget): number {
  // Niche specialization (focused = better)
  let nicheScore = 0;
  if (target.niche.length === 1) {
    nicheScore = 50; // Deep specialization
  } else if (target.niche.length <= 3) {
    nicheScore = 35; // Moderate focus
  } else {
    nicheScore = 20; // Too broad
  }
  
  // Jurisdiction (high-risk jurisdictions = more lawsuits = more claims data)
  const jurisdictionScore = 50; // Baseline
  
  return nicheScore + jurisdictionScore;
}

/**
 * Calculate Acquisition Price Score
 * 
 * Lower price relative to book value = better deal
 */
function calculateAcquisitionPriceScore(target: MGATarget, criteria: typeof KLUGE_FILTER_CRITERIA): number {
  const priceToBook = target.targetAcquisitionPrice / target.bookValue;
  
  if (priceToBook <= criteria.targetBookValueMultiple) {
    // Kluge target hit (0.5x book)
    return 100;
  } else if (priceToBook <= criteria.maxBookValueMultiple) {
    // Acceptable (0.5-0.6x book)
    return 100 - ((priceToBook - criteria.targetBookValueMultiple) / 0.1) * 20;
  } else if (priceToBook <= 1.0) {
    // Not ideal but workable (<1x book)
    return 60 - ((priceToBook - criteria.maxBookValueMultiple) / 0.4) * 40;
  } else {
    // Too expensive (>1x book)
    return Math.max(0, 20 - ((priceToBook - 1.0) * 20));
  }
}

/**
 * Calculate Founder Exit Score
 */
function calculateFounderExitScore(target: MGATarget): number {
  const { founderProfile } = target;
  
  let score = 0;
  
  // Age factor
  if (founderProfile.age >= 60) {
    score += 50;
  } else if (founderProfile.age >= 55) {
    score += 35;
  } else if (founderProfile.age >= 50) {
    score += 20;
  }
  
  // Exit intent
  const exitMap = { high: 50, medium: 30, low: 10 };
  score += exitMap[founderProfile.exitIntent] || 0;
  
  return Math.min(100, score);
}

/**
 * Calculate Projected Savings (Kluge operational leverage)
 */
function calculateProjectedSavings(target: MGATarget) {
  const { underwriters, operatingExpense, annualPremium, claimsExpense } = target;
  
  // 1. Underwriter cost savings (fire them)
  const underwriterCostSavings = underwriters.canReplace
    ? underwriters.count * underwriters.avgSalary * 0.9 // 90% savings (keep 1 supervisor)
    : 0;
  
  // 2. General expense reduction (automation)
  const expenseReduction = operatingExpense * 0.3; // 30% expense reduction
  
  // 3. Loss ratio improvement (better risk selection)
  const currentLossRatio = claimsExpense / annualPremium;
  const targetLossRatio = 0.70; // 70% target
  const lossRatioImprovement = currentLossRatio > targetLossRatio
    ? (currentLossRatio - targetLossRatio) * annualPremium
    : 0;
  
  return {
    underwriterCostSavings: Math.round(underwriterCostSavings),
    expenseReduction: Math.round(expenseReduction),
    lossRatioImprovement: Math.round(lossRatioImprovement),
    totalAnnualSavings: Math.round(underwriterCostSavings + expenseReduction + lossRatioImprovement),
  };
}

/**
 * Calculate Projected Financials (3-year model)
 */
function calculateProjectedFinancials(target: MGATarget, savings: ReturnType<typeof calculateProjectedSavings>) {
  const { annualPremium, claimsExpense, operatingExpense, targetAcquisitionPrice } = target;
  
  // Current EBITDA (negative)
  const currentEbitda = annualPremium - claimsExpense - operatingExpense;
  
  // Year 1: Partial savings (ramp-up)
  const year1Ebitda = currentEbitda + (savings.totalAnnualSavings * 0.6);
  
  // Year 2: Full savings
  const year2Ebitda = currentEbitda + savings.totalAnnualSavings;
  
  // Year 3: Full savings + growth
  const year3Ebitda = (currentEbitda + savings.totalAnnualSavings) * 1.15; // 15% growth
  
  // Calculate IRR (simplified)
  const cashFlows = [
    -targetAcquisitionPrice,  // Year 0 (acquisition)
    year1Ebitda,              // Year 1
    year2Ebitda,              // Year 2
    year3Ebitda + (target.bookValue * 3), // Year 3 + exit at 3x book
  ];
  
  const irr = calculateIRR(cashFlows);
  
  return {
    year1Ebitda: Math.round(year1Ebitda),
    year2Ebitda: Math.round(year2Ebitda),
    year3Ebitda: Math.round(year3Ebitda),
    irr: Math.round(irr),
  };
}

/**
 * Simple IRR calculation
 */
function calculateIRR(cashFlows: number[]): number {
  // Simplified IRR estimation
  const totalInflow = cashFlows.slice(1).reduce((sum, cf) => sum + (cf > 0 ? cf : 0), 0);
  const totalOutflow = Math.abs(cashFlows[0]);
  const years = cashFlows.length - 1;
  
  return ((Math.pow(totalInflow / totalOutflow, 1 / years) - 1) * 100);
}

/**
 * Identify Risks
 */
function identifyRisks(target: MGATarget): string[] {
  const risks: string[] = [];
  
  if (target.combinedRatio > 140) {
    risks.push('Extremely distressed - may require bridge financing');
  }
  
  if (target.reinsuranceTreaty.renewalLikelihood === 'low') {
    risks.push('Reinsurance treaty renewal risk - may lose capacity');
  }
  
  if (target.claimsHistory.dataQuality === 'poor') {
    risks.push('Poor claims data quality - may delay ML deployment');
  }
  
  if (target.underwriters.canReplace === false) {
    risks.push('Underwriters may be difficult to replace - execution risk');
  }
  
  if (target.founderProfile.exitIntent === 'low') {
    risks.push('Founder may resist sale - negotiation risk');
  }
  
  return risks;
}

/**
 * Generate Mitigations
 */
function generateMitigations(risks: string[], target: MGATarget): string[] {
  const mitigations: string[] = [];
  
  risks.forEach(risk => {
    if (risk.includes('bridge financing')) {
      mitigations.push('Structure with 70% cloud credits + 20% venture debt');
    }
    if (risk.includes('renewal risk')) {
      mitigations.push('Negotiate treaty extension as acquisition condition');
    }
    if (risk.includes('data quality')) {
      mitigations.push('Budget 6 months for data cleanup + vectorization');
    }
    if (risk.includes('replace')) {
      mitigations.push('Transition to hybrid model (agents + 1 senior underwriter)');
    }
    if (risk.includes('resist sale')) {
      mitigations.push('Offer stewardship model: $50K cash + 15% revshare + governance tokens');
    }
  });
  
  return mitigations;
}

/**
 * Generate Recommendation
 */
function generateRecommendation(
  score: number,
  irr: number,
  combinedRatio: number
): 'acquire' | 'negotiate' | 'pass' {
  const criteria = KLUGE_FILTER_CRITERIA;
  
  if (score >= 70 && irr >= criteria.targetIRR && combinedRatio >= criteria.minCombinedRatio) {
    return 'acquire';
  } else if (score >= 50 && irr >= criteria.minIRR) {
    return 'negotiate';
  } else {
    return 'pass';
  }
}

/**
 * Generate Rationale
 */
function generateRationale(
  score: number,
  financials: ReturnType<typeof calculateProjectedFinancials>,
  target: MGATarget
): string {
  const rec = generateRecommendation(score, financials.irr, target.combinedRatio);
  
  if (rec === 'acquire') {
    return `Strong acquisition target (score: ${score}/100, IRR: ${financials.irr}%). ` +
           `Distressed financials (${target.combinedRatio}% combined ratio) + structural assets ` +
           `(reinsurance treaty + ${target.claimsHistory.yearsOfData}yr claims data) + ` +
           `high operational leverage (${target.underwriters.count} replaceable underwriters). ` +
           `Projected EBITDA: Y1 $${(financials.year1Ebitda / 1e6).toFixed(1)}M → Y3 $${(financials.year3Ebitda / 1e6).toFixed(1)}M. ` +
           `Kluge playbook fit: acquire at ${(target.targetAcquisitionPrice / target.bookValue).toFixed(2)}x book, ` +
           `deploy agents, sell at 3-5x book.`;
  } else if (rec === 'negotiate') {
    return `Negotiable target (score: ${score}/100, IRR: ${financials.irr}%). ` +
           `Some risk factors present. Recommend counter-offer or contingent terms.`;
  } else {
    return `Pass (score: ${score}/100, IRR: ${financials.irr}%). ` +
           `Does not meet Kluge criteria. Better targets available.`;
  }
}

/**
 * Filter MGAs by Criteria
 * 
 * Returns only MGAs meeting minimum Kluge criteria
 */
export function filterMGATargets(targets: MGATarget[]): {
  qualified: MGATarget[];
  scores: MGAAcquisitionScore[];
  summary: {
    totalEvaluated: number;
    qualified: number;
    recommended: number;
    avgScore: number;
    avgIRR: number;
  };
} {
  const scores = targets.map(t => calculateMGAAcquisitionScore(t));
  
  const qualified = targets.filter((_, i) => {
    const score = scores[i];
    return score.overallScore >= 50 && score.recommendation !== 'pass';
  });
  
  const recommended = scores.filter(s => s.recommendation === 'acquire').length;
  const avgScore = scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length;
  const avgIRR = scores.reduce((sum, s) => sum + s.projectedFinancials.irr, 0) / scores.length;
  
  return {
    qualified,
    scores: scores.filter((_, i) => qualified.includes(targets[i])),
    summary: {
      totalEvaluated: targets.length,
      qualified: qualified.length,
      recommended,
      avgScore: Math.round(avgScore),
      avgIRR: Math.round(avgIRR),
    },
  };
}
