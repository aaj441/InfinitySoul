/**
 * MGA ACQUISITION FILTER
 * ======================
 *
 * "Buy the license, fire the underwriters, deploy the agents."
 *
 * This service implements the Kluge Filter for identifying distressed
 * cyber insurance MGAs (Managing General Agents) that are acquisition targets.
 *
 * Kluge Criteria (translated to cyber insurance):
 * 1. Combined ratio > 115% (losing money on every premium dollar)
 * 2. Premium < $20M (small enough to acquire cheaply)
 * 3. Has reinsurance treaty (the "license")
 * 4. 5+ years of claims data (hidden asset)
 * 5. Owner age > 55 or showing exit signals
 *
 * Target Price: 0.5x book value
 * Target EBITDA flip: -$2M → +$3M (fire humans, deploy agents)
 */

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// TYPES
// =============================================================================

export interface MGAProfile {
  id: string;
  name: string;
  founded: number;
  headquarters: string;

  // Financial metrics
  annualPremium: number;           // Total written premium
  combinedRatio: number;           // Loss ratio + expense ratio (>100 = losing money)
  lossRatio: number;               // Claims / Premium
  expenseRatio: number;            // Operating costs / Premium
  bookValue: number;               // Net asset value

  // Operational metrics
  underwriterCount: number;        // Human underwriters on staff
  avgQuoteTime: number;            // Days to generate quote
  policiesInForce: number;         // Active policies
  claimsDataYears: number;         // Years of historical claims data

  // Strategic assets
  hasReinsuranceTreaty: boolean;   // The "license"
  reinsurancePartner?: string;     // Lloyd's, Munich Re, etc.
  specializations: string[];       // Cyber, E&O, D&O, etc.

  // Exit signals
  ownerAge?: number;
  recentLayoffs: boolean;
  seekingInvestment: boolean;
  hadRecentLoss: boolean;          // Major claim event

  // Metadata
  dataSource: string;
  lastUpdated: Date;
}

export interface AcquisitionScore {
  mgaId: string;
  mgaName: string;
  overallScore: number;            // 0-100 (higher = better target)
  recommendation: 'STRONG_BUY' | 'BUY' | 'WATCH' | 'PASS';

  // Component scores
  financialDistress: number;       // Higher = more distressed = cheaper
  operationalInefficiency: number; // Higher = more room for agent automation
  strategicValue: number;          // Higher = better assets (treaty, data)
  exitReadiness: number;           // Higher = owner more likely to sell

  // Valuation
  estimatedPrice: number;          // Estimated acquisition cost
  targetPrice: number;             // Our target price (0.5x book)
  estimatedEBITDABefore: number;   // Current EBITDA (likely negative)
  estimatedEBITDAAfter: number;    // Projected EBITDA post-acquisition

  // Risk factors
  risks: string[];
  opportunities: string[];

  // Scoring breakdown
  breakdown: {
    criterion: string;
    value: number | string | boolean;
    score: number;
    weight: number;
    notes: string;
  }[];
}

export interface StewardshipOffer {
  id: string;
  mgaId: string;
  mgaName: string;
  createdAt: Date;

  // Offer terms
  cashComponent: number;           // Upfront cash (target: $50K)
  revenueSharePercent: number;     // Ongoing revenue share (target: 15%)
  governanceTokens: number;        // $SOUL tokens for governance
  earnoutStructure?: {
    milestones: string[];
    maxPayout: number;
  };

  // Projected outcomes
  projectedYear1EBITDA: number;
  projectedYear3EBITDA: number;
  projectedValuationYear3: number;

  status: 'draft' | 'sent' | 'negotiating' | 'accepted' | 'rejected';
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const KLUGE_FILTER_CRITERIA = {
  // Financial thresholds
  MIN_COMBINED_RATIO: 115,         // Must be losing money
  MAX_PREMIUM: 20_000_000,         // Small enough to acquire
  MIN_PREMIUM: 1_000_000,          // Large enough to matter
  TARGET_BOOK_MULTIPLE: 0.5,       // Buy at 50% of book value

  // Operational thresholds
  MIN_CLAIMS_DATA_YEARS: 3,        // Need historical data
  IDEAL_CLAIMS_DATA_YEARS: 5,
  MAX_UNDERWRITERS: 20,            // Can't be too large
  MIN_AVG_QUOTE_TIME: 7,           // Slow = automatable

  // Strategic requirements
  REQUIRED_REINSURANCE_TREATY: true,
  PREFERRED_SPECIALIZATIONS: ['cyber', 'tech_e&o', 'data_breach'],

  // Exit signals
  MIN_OWNER_AGE: 55,               // Retirement age approaching
  EXIT_SIGNAL_BOOST: 20,           // Score boost for exit signals

  // Weights for scoring
  WEIGHTS: {
    financialDistress: 0.30,
    operationalInefficiency: 0.25,
    strategicValue: 0.25,
    exitReadiness: 0.20,
  },
} as const;

// =============================================================================
// SCORING ENGINE
// =============================================================================

export class MGAAcquisitionFilter {
  private criteria = KLUGE_FILTER_CRITERIA;

  /**
   * Score an MGA against Kluge acquisition criteria
   */
  scoreTarget(mga: MGAProfile): AcquisitionScore {
    const breakdown: AcquisitionScore['breakdown'] = [];

    // 1. Financial Distress Score (higher = more distressed = better)
    const financialDistress = this.scoreFinancialDistress(mga, breakdown);

    // 2. Operational Inefficiency Score (higher = more automatable)
    const operationalInefficiency = this.scoreOperationalInefficiency(mga, breakdown);

    // 3. Strategic Value Score (higher = better assets)
    const strategicValue = this.scoreStrategicValue(mga, breakdown);

    // 4. Exit Readiness Score (higher = more likely to sell)
    const exitReadiness = this.scoreExitReadiness(mga, breakdown);

    // Calculate weighted overall score
    const overallScore = Math.round(
      financialDistress * this.criteria.WEIGHTS.financialDistress +
      operationalInefficiency * this.criteria.WEIGHTS.operationalInefficiency +
      strategicValue * this.criteria.WEIGHTS.strategicValue +
      exitReadiness * this.criteria.WEIGHTS.exitReadiness
    );

    // Determine recommendation
    const recommendation = this.getRecommendation(overallScore, mga);

    // Calculate valuations
    const estimatedPrice = mga.bookValue * 0.75; // Market expects 0.75x
    const targetPrice = mga.bookValue * this.criteria.TARGET_BOOK_MULTIPLE;
    const estimatedEBITDABefore = this.calculateCurrentEBITDA(mga);
    const estimatedEBITDAAfter = this.projectPostAcquisitionEBITDA(mga);

    // Identify risks and opportunities
    const risks = this.identifyRisks(mga);
    const opportunities = this.identifyOpportunities(mga);

    return {
      mgaId: mga.id,
      mgaName: mga.name,
      overallScore,
      recommendation,
      financialDistress,
      operationalInefficiency,
      strategicValue,
      exitReadiness,
      estimatedPrice,
      targetPrice,
      estimatedEBITDABefore,
      estimatedEBITDAAfter,
      risks,
      opportunities,
      breakdown,
    };
  }

  /**
   * Score financial distress (0-100)
   * Higher = more distressed = better acquisition target
   */
  private scoreFinancialDistress(
    mga: MGAProfile,
    breakdown: AcquisitionScore['breakdown']
  ): number {
    let score = 0;

    // Combined ratio scoring (>115% is our threshold)
    const combinedRatioScore = Math.min(100,
      Math.max(0, (mga.combinedRatio - 100) * 5)
    );
    score += combinedRatioScore * 0.5;
    breakdown.push({
      criterion: 'Combined Ratio',
      value: `${mga.combinedRatio}%`,
      score: combinedRatioScore,
      weight: 0.5,
      notes: mga.combinedRatio > 115
        ? 'Target: Losing money on premiums'
        : 'Below distress threshold',
    });

    // Loss ratio scoring
    const lossRatioScore = Math.min(100, Math.max(0, (mga.lossRatio - 60) * 2.5));
    score += lossRatioScore * 0.3;
    breakdown.push({
      criterion: 'Loss Ratio',
      value: `${mga.lossRatio}%`,
      score: lossRatioScore,
      weight: 0.3,
      notes: mga.lossRatio > 80 ? 'High claims = pricing problem' : 'Acceptable range',
    });

    // Premium size (sweet spot: $5M-$15M)
    let premiumScore = 0;
    if (mga.annualPremium >= 5_000_000 && mga.annualPremium <= 15_000_000) {
      premiumScore = 100;
    } else if (mga.annualPremium < this.criteria.MIN_PREMIUM) {
      premiumScore = 20;
    } else if (mga.annualPremium > this.criteria.MAX_PREMIUM) {
      premiumScore = 30;
    } else {
      premiumScore = 60;
    }
    score += premiumScore * 0.2;
    breakdown.push({
      criterion: 'Premium Size',
      value: `$${(mga.annualPremium / 1_000_000).toFixed(1)}M`,
      score: premiumScore,
      weight: 0.2,
      notes: premiumScore === 100 ? 'Sweet spot for acquisition' : 'Outside ideal range',
    });

    return Math.round(score);
  }

  /**
   * Score operational inefficiency (0-100)
   * Higher = more room for automation
   */
  private scoreOperationalInefficiency(
    mga: MGAProfile,
    breakdown: AcquisitionScore['breakdown']
  ): number {
    let score = 0;

    // Underwriter count (more = more to automate)
    const underwriterScore = Math.min(100, mga.underwriterCount * 10);
    score += underwriterScore * 0.4;
    breakdown.push({
      criterion: 'Underwriter Count',
      value: mga.underwriterCount,
      score: underwriterScore,
      weight: 0.4,
      notes: `$${(mga.underwriterCount * 150_000).toLocaleString()} potential savings`,
    });

    // Quote time (slower = more automatable)
    const quoteTimeScore = Math.min(100, mga.avgQuoteTime * 5);
    score += quoteTimeScore * 0.3;
    breakdown.push({
      criterion: 'Avg Quote Time',
      value: `${mga.avgQuoteTime} days`,
      score: quoteTimeScore,
      weight: 0.3,
      notes: mga.avgQuoteTime > 14 ? 'Highly automatable' : 'Already somewhat efficient',
    });

    // Expense ratio (higher = more fat to cut)
    const expenseScore = Math.min(100, Math.max(0, (mga.expenseRatio - 25) * 4));
    score += expenseScore * 0.3;
    breakdown.push({
      criterion: 'Expense Ratio',
      value: `${mga.expenseRatio}%`,
      score: expenseScore,
      weight: 0.3,
      notes: mga.expenseRatio > 35 ? 'High overhead to eliminate' : 'Lean operation',
    });

    return Math.round(score);
  }

  /**
   * Score strategic value (0-100)
   * Higher = better assets
   */
  private scoreStrategicValue(
    mga: MGAProfile,
    breakdown: AcquisitionScore['breakdown']
  ): number {
    let score = 0;

    // Reinsurance treaty (critical)
    const treatyScore = mga.hasReinsuranceTreaty ? 100 : 0;
    score += treatyScore * 0.4;
    breakdown.push({
      criterion: 'Reinsurance Treaty',
      value: mga.hasReinsuranceTreaty,
      score: treatyScore,
      weight: 0.4,
      notes: mga.hasReinsuranceTreaty
        ? `Treaty with ${mga.reinsurancePartner || 'partner'} - THE LICENSE`
        : 'NO TREATY = NO DEAL',
    });

    // Claims data years
    const dataScore = Math.min(100, mga.claimsDataYears * 20);
    score += dataScore * 0.3;
    breakdown.push({
      criterion: 'Claims Data History',
      value: `${mga.claimsDataYears} years`,
      score: dataScore,
      weight: 0.3,
      notes: mga.claimsDataYears >= 5
        ? 'Excellent training data for AI'
        : 'Limited historical data',
    });

    // Specialization match
    const specMatch = mga.specializations.some(s =>
      this.criteria.PREFERRED_SPECIALIZATIONS.includes(s.toLowerCase())
    );
    const specScore = specMatch ? 100 : 40;
    score += specScore * 0.3;
    breakdown.push({
      criterion: 'Cyber Specialization',
      value: mga.specializations.join(', '),
      score: specScore,
      weight: 0.3,
      notes: specMatch ? 'Cyber-focused = strategic fit' : 'May need repositioning',
    });

    return Math.round(score);
  }

  /**
   * Score exit readiness (0-100)
   * Higher = owner more likely to sell
   */
  private scoreExitReadiness(
    mga: MGAProfile,
    breakdown: AcquisitionScore['breakdown']
  ): number {
    let score = 0;
    let signalCount = 0;

    // Owner age
    if (mga.ownerAge && mga.ownerAge >= this.criteria.MIN_OWNER_AGE) {
      score += 30;
      signalCount++;
      breakdown.push({
        criterion: 'Owner Age',
        value: mga.ownerAge,
        score: 30,
        weight: 0.25,
        notes: 'Approaching retirement age',
      });
    }

    // Recent layoffs
    if (mga.recentLayoffs) {
      score += 25;
      signalCount++;
      breakdown.push({
        criterion: 'Recent Layoffs',
        value: true,
        score: 25,
        weight: 0.25,
        notes: 'Cost-cutting indicates distress',
      });
    }

    // Seeking investment
    if (mga.seekingInvestment) {
      score += 30;
      signalCount++;
      breakdown.push({
        criterion: 'Seeking Investment',
        value: true,
        score: 30,
        weight: 0.25,
        notes: 'Already looking for capital = open to offers',
      });
    }

    // Had recent major loss
    if (mga.hadRecentLoss) {
      score += 15;
      signalCount++;
      breakdown.push({
        criterion: 'Recent Major Loss',
        value: true,
        score: 15,
        weight: 0.25,
        notes: 'Shell-shocked = motivated seller',
      });
    }

    // Normalize to 100
    const maxScore = signalCount > 0 ? Math.min(100, score) : 20;

    if (signalCount === 0) {
      breakdown.push({
        criterion: 'Exit Signals',
        value: 'None detected',
        score: 20,
        weight: 1,
        notes: 'No obvious exit motivation - may need relationship building',
      });
    }

    return maxScore;
  }

  /**
   * Determine recommendation based on score and deal-breakers
   */
  private getRecommendation(
    score: number,
    mga: MGAProfile
  ): AcquisitionScore['recommendation'] {
    // Deal-breakers
    if (!mga.hasReinsuranceTreaty) return 'PASS';
    if (mga.annualPremium < this.criteria.MIN_PREMIUM) return 'PASS';
    if (mga.combinedRatio < 100) return 'WATCH'; // Too healthy

    // Score-based
    if (score >= 75) return 'STRONG_BUY';
    if (score >= 55) return 'BUY';
    if (score >= 35) return 'WATCH';
    return 'PASS';
  }

  /**
   * Calculate current EBITDA (likely negative for distressed MGAs)
   */
  private calculateCurrentEBITDA(mga: MGAProfile): number {
    const revenue = mga.annualPremium * 0.30; // MGA fee ~30% of premium
    const losses = mga.annualPremium * (mga.lossRatio / 100) * 0.30; // Loss share
    const expenses = mga.underwriterCount * 150_000 + (mga.annualPremium * 0.10);
    return Math.round(revenue - losses - expenses);
  }

  /**
   * Project EBITDA after agent deployment
   */
  private projectPostAcquisitionEBITDA(mga: MGAProfile): number {
    const revenue = mga.annualPremium * 0.30;
    // Improved loss ratio (70% vs current)
    const losses = mga.annualPremium * 0.70 * 0.30;
    // Reduced expenses (fire 80% of underwriters, automate)
    const remainingStaff = Math.ceil(mga.underwriterCount * 0.2);
    const expenses = remainingStaff * 150_000 + (mga.annualPremium * 0.03);
    return Math.round(revenue - losses - expenses);
  }

  /**
   * Identify acquisition risks
   */
  private identifyRisks(mga: MGAProfile): string[] {
    const risks: string[] = [];

    if (mga.combinedRatio > 150) {
      risks.push('Extremely high loss ratio - may have adverse selection issues');
    }
    if (mga.claimsDataYears < 3) {
      risks.push('Limited claims history - AI training data insufficient');
    }
    if (mga.annualPremium > 15_000_000) {
      risks.push('Large premium base - integration complexity');
    }
    if (!mga.specializations.some(s => s.toLowerCase().includes('cyber'))) {
      risks.push('No cyber specialization - repositioning required');
    }
    if (mga.hadRecentLoss) {
      risks.push('Recent major loss - may have ongoing liabilities');
    }

    return risks;
  }

  /**
   * Identify acquisition opportunities
   */
  private identifyOpportunities(mga: MGAProfile): string[] {
    const opportunities: string[] = [];

    const underwriterSavings = mga.underwriterCount * 150_000 * 0.8;
    opportunities.push(`$${(underwriterSavings / 1_000_000).toFixed(1)}M in underwriter cost reduction`);

    if (mga.avgQuoteTime > 14) {
      opportunities.push('Quote automation: 30 days → 30 seconds');
    }

    if (mga.claimsDataYears >= 5) {
      opportunities.push(`${mga.claimsDataYears} years of claims data for AI training`);
    }

    if (mga.hasReinsuranceTreaty && mga.reinsurancePartner) {
      opportunities.push(`Existing ${mga.reinsurancePartner} treaty = immediate capacity`);
    }

    const ebidtaFlip = this.projectPostAcquisitionEBITDA(mga) - this.calculateCurrentEBITDA(mga);
    opportunities.push(`EBITDA flip potential: +$${(ebidtaFlip / 1_000_000).toFixed(1)}M`);

    return opportunities;
  }

  /**
   * Generate a stewardship offer for an MGA
   */
  generateStewardshipOffer(mga: MGAProfile, score: AcquisitionScore): StewardshipOffer {
    // Cash component: 1% of book value or $50K minimum
    const cashComponent = Math.max(50_000, mga.bookValue * 0.01);

    // Revenue share: 15% base, +5% if strong buy
    const revenueSharePercent = score.recommendation === 'STRONG_BUY' ? 20 : 15;

    // Governance tokens: based on book value
    const governanceTokens = Math.round(mga.bookValue / 10_000);

    return {
      id: uuidv4(),
      mgaId: mga.id,
      mgaName: mga.name,
      createdAt: new Date(),
      cashComponent,
      revenueSharePercent,
      governanceTokens,
      earnoutStructure: {
        milestones: [
          'Combined ratio < 100% in Year 1',
          'Premium growth > 20% in Year 2',
          'Full agent automation in Year 2',
        ],
        maxPayout: mga.bookValue * 0.25,
      },
      projectedYear1EBITDA: score.estimatedEBITDAAfter * 0.7,
      projectedYear3EBITDA: score.estimatedEBITDAAfter * 1.5,
      projectedValuationYear3: score.estimatedEBITDAAfter * 1.5 * 5, // 5x EBITDA
      status: 'draft',
    };
  }

  /**
   * Filter a list of MGAs to find top acquisition targets
   */
  filterTargets(mgas: MGAProfile[]): AcquisitionScore[] {
    return mgas
      .map(mga => this.scoreTarget(mga))
      .filter(score => score.recommendation !== 'PASS')
      .sort((a, b) => b.overallScore - a.overallScore);
  }
}

// =============================================================================
// MOCK DATA SOURCE
// =============================================================================

/**
 * Generate mock MGA data for development
 * In production: connect to PitchBook, LinkedIn Sales Navigator, etc.
 */
export function generateMockMGAs(count: number = 10): MGAProfile[] {
  const mgas: MGAProfile[] = [];

  const names = [
    'CyberShield MGA', 'TechRisk Underwriters', 'Digital Defense Insurance',
    'NetGuard MGA', 'DataSafe Underwriting', 'CloudCover Insurance',
    'ByteSecure MGA', 'InfoRisk Partners', 'CyberVault Insurance',
    'ThreatGuard Underwriters', 'SecureStack MGA', 'RiskByte Insurance'
  ];

  for (let i = 0; i < count; i++) {
    const premium = 2_000_000 + Math.random() * 18_000_000;
    const lossRatio = 50 + Math.random() * 70;
    const expenseRatio = 25 + Math.random() * 25;

    mgas.push({
      id: uuidv4(),
      name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
      founded: 2005 + Math.floor(Math.random() * 15),
      headquarters: ['New York', 'Chicago', 'Austin', 'Denver', 'Atlanta'][Math.floor(Math.random() * 5)],
      annualPremium: Math.round(premium),
      combinedRatio: Math.round(lossRatio + expenseRatio),
      lossRatio: Math.round(lossRatio),
      expenseRatio: Math.round(expenseRatio),
      bookValue: Math.round(premium * 0.8),
      underwriterCount: 3 + Math.floor(Math.random() * 15),
      avgQuoteTime: 5 + Math.floor(Math.random() * 25),
      policiesInForce: 100 + Math.floor(Math.random() * 2000),
      claimsDataYears: 2 + Math.floor(Math.random() * 8),
      hasReinsuranceTreaty: Math.random() > 0.2,
      reinsurancePartner: Math.random() > 0.3 ? ['Lloyd\'s', 'Munich Re', 'Swiss Re', 'Berkshire'][Math.floor(Math.random() * 4)] : undefined,
      specializations: Math.random() > 0.3
        ? ['cyber', 'tech_e&o', 'data_breach'].slice(0, 1 + Math.floor(Math.random() * 3))
        : ['general_liability', 'property'],
      ownerAge: Math.random() > 0.5 ? 45 + Math.floor(Math.random() * 25) : undefined,
      recentLayoffs: Math.random() > 0.7,
      seekingInvestment: Math.random() > 0.6,
      hadRecentLoss: Math.random() > 0.8,
      dataSource: 'mock_pitchbook',
      lastUpdated: new Date(),
    });
  }

  return mgas;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default MGAAcquisitionFilter;
