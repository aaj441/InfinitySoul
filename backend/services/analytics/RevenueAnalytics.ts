/**
 * Revenue Analytics Service
 * 
 * Implements Tier 1 Revenue Optimization Ideas #1-5:
 * 1. A/B test significance calculator
 * 2. Multi-touch attribution system
 * 3. Churn prediction model
 * 4. Segmented LTV by industry
 * 5. Multi-channel CAC tracker
 * 
 * This service provides the data science foundation for revenue optimization.
 */

import { v4 as uuidv4 } from 'uuid';
import type { IndustryVertical, InsuranceLine, LeadSource } from '../insuranceComplianceHub/types';

// ============================================================================
// A/B TESTING TYPES & CALCULATOR
// ============================================================================

export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  variantA: string;
  variantB: string;
  metric: 'conversion_rate' | 'email_open_rate' | 'email_click_rate' | 'assessment_completion';
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'running' | 'completed' | 'paused';
  targetSampleSize: number;
  minimumDetectableEffect: number; // Percentage points
  confidenceLevel: number; // 0.95 for 95% confidence
}

export interface ABTestResult {
  testId: string;
  variantA: {
    name: string;
    conversions: number;
    exposures: number;
    conversionRate: number;
  };
  variantB: {
    name: string;
    conversions: number;
    exposures: number;
    conversionRate: number;
  };
  analysis: {
    sampleSizeReached: boolean;
    isStatisticallySignificant: boolean;
    pValue: number;
    confidenceInterval: { lower: number; upper: number };
    relativeUplift: number;
    absoluteUplift: number;
    winner?: 'A' | 'B' | 'no_clear_winner';
    recommendation: string;
  };
}

export interface ABTestExposure {
  testId: string;
  leadId: string;
  variant: 'A' | 'B';
  exposedAt: Date;
  converted: boolean;
  convertedAt?: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// MULTI-TOUCH ATTRIBUTION TYPES
// ============================================================================

export type TouchpointType = 
  | 'email_open'
  | 'email_click'
  | 'website_visit'
  | 'assessment_start'
  | 'assessment_complete'
  | 'consultation_scheduled'
  | 'quote_requested'
  | 'policy_purchased';

export interface AttributionTouchpoint {
  id: string;
  leadId: string;
  type: TouchpointType;
  channel: LeadSource;
  timestamp: Date;
  metadata?: {
    emailSequenceStep?: number;
    pageUrl?: string;
    campaignId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
}

export interface AttributionModel {
  type: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  weights?: number[]; // For custom weighting
}

export interface AttributionResult {
  leadId: string;
  conversionValue: number;
  touchpoints: AttributionTouchpoint[];
  attributionByChannel: Record<LeadSource, number>;
  attributionByTouchpoint: Record<TouchpointType, number>;
  model: AttributionModel;
}

// ============================================================================
// CHURN PREDICTION TYPES
// ============================================================================

export interface ChurnSignal {
  type: 'email_engagement_drop' | 'assessment_abandonment' | 'no_response' | 'price_objection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  description: string;
}

export interface ChurnPrediction {
  leadId: string;
  riskScore: number; // 0-100, higher = more likely to churn
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  signals: ChurnSignal[];
  recommendedActions: string[];
  predictedChurnDate?: Date;
  confidenceScore: number;
}

// ============================================================================
// LTV SEGMENTATION TYPES
// ============================================================================

export interface LTVSegment {
  industry: IndustryVertical;
  averageLTV: number;
  medianLTV: number;
  customerCount: number;
  averageRetentionMonths: number;
  averageCommissionPerCustomer: number;
  totalRevenue: number;
  marketingAllocationRecommended: number; // Percentage of total marketing budget
}

export interface CustomerLTV {
  leadId: string;
  industry: IndustryVertical;
  actualLTV?: number; // If they've purchased
  predictedLTV: number;
  factors: {
    employeeCount: number;
    annualRevenue: number;
    linesOfInterest: InsuranceLine[];
    engagementScore: number;
    complianceScore: number;
  };
}

// ============================================================================
// CAC TRACKING TYPES
// ============================================================================

export interface ChannelCAC {
  channel: LeadSource;
  totalSpend: number;
  leadsAcquired: number;
  customersAcquired: number;
  cac: number; // Cost to acquire one customer
  cpl: number; // Cost per lead
  conversionRate: number;
  averageLTV: number;
  ltvcacRatio: number;
  roi: number;
  recommendation: 'scale_up' | 'maintain' | 'optimize' | 'scale_down';
}

export interface MarketingSpend {
  id: string;
  channel: LeadSource;
  amount: number;
  startDate: Date;
  endDate: Date;
  campaignName?: string;
  notes?: string;
}

// ============================================================================
// REVENUE ANALYTICS SERVICE
// ============================================================================

export class RevenueAnalytics {
  private abTests: Map<string, ABTestConfig> = new Map();
  private abExposures: Map<string, ABTestExposure[]> = new Map();
  private attributionTouchpoints: Map<string, AttributionTouchpoint[]> = new Map();
  private marketingSpends: MarketingSpend[] = [];
  private customerLTVs: Map<string, CustomerLTV> = new Map();

  // ========================================================================
  // A/B TESTING METHODS
  // ========================================================================

  /**
   * Calculate required sample size for A/B test
   * Using standard formula: n = 16 * σ² / δ²
   * Where σ = standard deviation, δ = minimum detectable effect
   * 
   * For conversion rates, we use simplified formula based on baseline conversion rate
   */
  calculateRequiredSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    confidenceLevel: number = 0.95,
    power: number = 0.80
  ): number {
    // Z-scores for confidence level and power
    const zAlpha = confidenceLevel === 0.95 ? 1.96 : 1.645; // 95% or 90%
    const zBeta = power === 0.80 ? 0.84 : 1.28; // 80% or 90% power
    
    const p1 = baselineConversionRate;
    const p2 = baselineConversionRate + (minimumDetectableEffect / 100);
    const pBar = (p1 + p2) / 2;
    
    const numerator = Math.pow(zAlpha + zBeta, 2) * 2 * pBar * (1 - pBar);
    const denominator = Math.pow(p2 - p1, 2);
    
    const samplesPerVariant = Math.ceil(numerator / denominator);
    
    // Total samples needed (both variants)
    return samplesPerVariant * 2;
  }

  /**
   * Create new A/B test
   */
  createABTest(config: Omit<ABTestConfig, 'id'>): ABTestConfig {
    const test: ABTestConfig = {
      ...config,
      id: uuidv4(),
    };
    
    this.abTests.set(test.id, test);
    this.abExposures.set(test.id, []);
    
    return test;
  }

  /**
   * Record A/B test exposure
   */
  recordABExposure(exposure: Omit<ABTestExposure, 'id'>): void {
    const exposures = this.abExposures.get(exposure.testId) || [];
    exposures.push(exposure as ABTestExposure);
    this.abExposures.set(exposure.testId, exposures);
  }

  /**
   * Calculate statistical significance using two-proportion z-test
   */
  private calculateZTest(
    conversionsA: number,
    exposuresA: number,
    conversionsB: number,
    exposuresB: number
  ): { pValue: number; zScore: number } {
    const p1 = conversionsA / exposuresA;
    const p2 = conversionsB / exposuresB;
    const pPool = (conversionsA + conversionsB) / (exposuresA + exposuresB);
    
    const standardError = Math.sqrt(
      pPool * (1 - pPool) * (1 / exposuresA + 1 / exposuresB)
    );
    
    const zScore = (p2 - p1) / standardError;
    
    // Two-tailed p-value
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    
    return { pValue, zScore };
  }

  /**
   * Cumulative distribution function for standard normal distribution
   */
  private normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  }

  /**
   * Calculate confidence interval for difference in conversion rates
   */
  private calculateConfidenceInterval(
    p1: number,
    n1: number,
    p2: number,
    n2: number,
    confidenceLevel: number = 0.95
  ): { lower: number; upper: number } {
    const diff = p2 - p1;
    const zScore = confidenceLevel === 0.95 ? 1.96 : 1.645;
    
    const se = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
    const marginOfError = zScore * se;
    
    return {
      lower: diff - marginOfError,
      upper: diff + marginOfError,
    };
  }

  /**
   * Analyze A/B test results
   */
  analyzeABTest(testId: string): ABTestResult | null {
    const test = this.abTests.get(testId);
    if (!test) return null;
    
    const exposures = this.abExposures.get(testId) || [];
    
    const variantAData = exposures.filter(e => e.variant === 'A');
    const variantBData = exposures.filter(e => e.variant === 'B');
    
    const conversionsA = variantAData.filter(e => e.converted).length;
    const exposuresA = variantAData.length;
    const conversionRateA = exposuresA > 0 ? conversionsA / exposuresA : 0;
    
    const conversionsB = variantBData.filter(e => e.converted).length;
    const exposuresB = variantBData.length;
    const conversionRateB = exposuresB > 0 ? conversionsB / exposuresB : 0;
    
    const sampleSizeReached = (exposuresA + exposuresB) >= test.targetSampleSize;
    
    const { pValue } = this.calculateZTest(
      conversionsA,
      exposuresA,
      conversionsB,
      exposuresB
    );
    
    const isStatisticallySignificant = pValue < (1 - test.confidenceLevel);
    
    const confidenceInterval = this.calculateConfidenceInterval(
      conversionRateA,
      exposuresA,
      conversionRateB,
      exposuresB,
      test.confidenceLevel
    );
    
    const absoluteUplift = conversionRateB - conversionRateA;
    const relativeUplift = conversionRateA > 0 
      ? (absoluteUplift / conversionRateA) * 100 
      : 0;
    
    let winner: 'A' | 'B' | 'no_clear_winner' = 'no_clear_winner';
    let recommendation = '';
    
    if (!sampleSizeReached) {
      recommendation = `Continue test. Need ${test.targetSampleSize - (exposuresA + exposuresB)} more samples.`;
    } else if (!isStatisticallySignificant) {
      recommendation = 'No statistically significant difference detected. Consider running longer or increasing sample size.';
    } else {
      winner = conversionRateB > conversionRateA ? 'B' : 'A';
      recommendation = `Variant ${winner} wins with ${Math.abs(relativeUplift).toFixed(2)}% ${relativeUplift > 0 ? 'improvement' : 'decrease'}.`;
    }
    
    return {
      testId,
      variantA: {
        name: test.variantA,
        conversions: conversionsA,
        exposures: exposuresA,
        conversionRate: conversionRateA,
      },
      variantB: {
        name: test.variantB,
        conversions: conversionsB,
        exposures: exposuresB,
        conversionRate: conversionRateB,
      },
      analysis: {
        sampleSizeReached,
        isStatisticallySignificant,
        pValue,
        confidenceInterval,
        relativeUplift,
        absoluteUplift,
        winner: isStatisticallySignificant ? winner : undefined,
        recommendation,
      },
    };
  }

  /**
   * Get all A/B tests
   */
  getAllABTests(): ABTestConfig[] {
    return Array.from(this.abTests.values());
  }

  /**
   * Get A/B test by ID
   */
  getABTest(testId: string): ABTestConfig | undefined {
    return this.abTests.get(testId);
  }

  // ========================================================================
  // MULTI-TOUCH ATTRIBUTION METHODS
  // ========================================================================

  /**
   * Track attribution touchpoint
   */
  recordTouchpoint(touchpoint: AttributionTouchpoint): void {
    const touchpoints = this.attributionTouchpoints.get(touchpoint.leadId) || [];
    touchpoints.push(touchpoint);
    this.attributionTouchpoints.set(touchpoint.leadId, touchpoints);
  }

  /**
   * Calculate attribution based on model
   */
  calculateAttribution(
    leadId: string,
    conversionValue: number,
    model: AttributionModel
  ): AttributionResult | null {
    const touchpoints = this.attributionTouchpoints.get(leadId);
    if (!touchpoints || touchpoints.length === 0) return null;
    
    // Sort touchpoints by timestamp
    const sortedTouchpoints = [...touchpoints].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    let weights: number[] = [];
    
    switch (model.type) {
      case 'first_touch':
        weights = sortedTouchpoints.map((_, i) => i === 0 ? 1 : 0);
        break;
      
      case 'last_touch':
        weights = sortedTouchpoints.map((_, i) => 
          i === sortedTouchpoints.length - 1 ? 1 : 0
        );
        break;
      
      case 'linear':
        weights = sortedTouchpoints.map(() => 1 / sortedTouchpoints.length);
        break;
      
      case 'time_decay':
        // More recent touchpoints get higher weight
        const halfLife = 7; // days
        weights = sortedTouchpoints.map((tp, i) => {
          const daysSinceFirst = (sortedTouchpoints[sortedTouchpoints.length - 1].timestamp.getTime() - tp.timestamp.getTime()) / (1000 * 60 * 60 * 24);
          return Math.pow(0.5, daysSinceFirst / halfLife);
        });
        // Normalize
        const sumWeights = weights.reduce((a, b) => a + b, 0);
        weights = weights.map(w => w / sumWeights);
        break;
      
      case 'position_based':
        // 40% to first, 40% to last, 20% distributed among middle
        if (sortedTouchpoints.length === 1) {
          weights = [1];
        } else if (sortedTouchpoints.length === 2) {
          weights = [0.5, 0.5];
        } else {
          const middleWeight = 0.2 / (sortedTouchpoints.length - 2);
          weights = sortedTouchpoints.map((_, i) => {
            if (i === 0) return 0.4;
            if (i === sortedTouchpoints.length - 1) return 0.4;
            return middleWeight;
          });
        }
        break;
    }
    
    // Calculate attribution by channel and touchpoint type
    const attributionByChannel: Record<LeadSource, number> = {} as any;
    const attributionByTouchpoint: Record<TouchpointType, number> = {} as any;
    
    sortedTouchpoints.forEach((tp, i) => {
      const attributionValue = conversionValue * weights[i];
      
      attributionByChannel[tp.channel] = (attributionByChannel[tp.channel] || 0) + attributionValue;
      attributionByTouchpoint[tp.type] = (attributionByTouchpoint[tp.type] || 0) + attributionValue;
    });
    
    return {
      leadId,
      conversionValue,
      touchpoints: sortedTouchpoints,
      attributionByChannel,
      attributionByTouchpoint,
      model,
    };
  }

  // ========================================================================
  // CHURN PREDICTION METHODS
  // ========================================================================

  /**
   * Predict churn risk for a lead
   */
  predictChurn(leadId: string): ChurnPrediction {
    const touchpoints = this.attributionTouchpoints.get(leadId) || [];
    
    const signals: ChurnSignal[] = [];
    let riskScore = 0;
    
    // Check email engagement drop
    const emailTouchpoints = touchpoints.filter(tp => 
      tp.type === 'email_open' || tp.type === 'email_click'
    );
    
    if (emailTouchpoints.length > 0) {
      const recentEmailTouchpoints = emailTouchpoints.filter(tp => {
        const daysSince = (Date.now() - tp.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });
      
      if (recentEmailTouchpoints.length === 0 && emailTouchpoints.length >= 3) {
        signals.push({
          type: 'email_engagement_drop',
          severity: 'high',
          detectedAt: new Date(),
          description: 'No email engagement in past 7 days after previously engaging',
        });
        riskScore += 30;
      }
    }
    
    // Check assessment abandonment
    const assessmentStarts = touchpoints.filter(tp => tp.type === 'assessment_start');
    const assessmentCompletes = touchpoints.filter(tp => tp.type === 'assessment_complete');
    
    if (assessmentStarts.length > assessmentCompletes.length) {
      signals.push({
        type: 'assessment_abandonment',
        severity: 'medium',
        detectedAt: new Date(),
        description: 'Started assessment but did not complete',
      });
      riskScore += 20;
    }
    
    // Check overall inactivity
    if (touchpoints.length > 0) {
      const lastTouchpoint = [...touchpoints].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )[0];
      
      const daysSinceLastActivity = (Date.now() - lastTouchpoint.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastActivity > 14) {
        signals.push({
          type: 'no_response',
          severity: 'critical',
          detectedAt: new Date(),
          description: `No activity in ${Math.floor(daysSinceLastActivity)} days`,
        });
        riskScore += 40;
      } else if (daysSinceLastActivity > 7) {
        signals.push({
          type: 'no_response',
          severity: 'medium',
          detectedAt: new Date(),
          description: `No activity in ${Math.floor(daysSinceLastActivity)} days`,
        });
        riskScore += 15;
      }
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 60) riskLevel = 'critical';
    else if (riskScore >= 40) riskLevel = 'high';
    else if (riskScore >= 20) riskLevel = 'medium';
    else riskLevel = 'low';
    
    // Generate recommendations
    const recommendedActions: string[] = [];
    
    if (signals.some(s => s.type === 'email_engagement_drop')) {
      recommendedActions.push('Send personalized re-engagement email with value proposition');
      recommendedActions.push('Try different channel (phone call or SMS)');
    }
    
    if (signals.some(s => s.type === 'assessment_abandonment')) {
      recommendedActions.push('Send email highlighting assessment value and offering help');
      recommendedActions.push('Reduce assessment friction with 2-step flow');
    }
    
    if (signals.some(s => s.type === 'no_response')) {
      recommendedActions.push('Trigger win-back campaign');
      recommendedActions.push('Offer limited-time incentive or consultation');
    }
    
    if (recommendedActions.length === 0) {
      recommendedActions.push('Continue normal nurture sequence');
    }
    
    return {
      leadId,
      riskScore: Math.min(100, riskScore),
      riskLevel,
      signals,
      recommendedActions,
      confidenceScore: touchpoints.length >= 5 ? 0.8 : 0.5,
    };
  }

  // ========================================================================
  // LTV SEGMENTATION METHODS
  // ========================================================================

  /**
   * Record customer LTV
   */
  recordCustomerLTV(ltv: CustomerLTV): void {
    this.customerLTVs.set(ltv.leadId, ltv);
  }

  /**
   * Calculate segmented LTV by industry
   */
  calculateLTVSegments(): LTVSegment[] {
    const segments = new Map<IndustryVertical, CustomerLTV[]>();
    
    // Group by industry
    this.customerLTVs.forEach(ltv => {
      const existing = segments.get(ltv.industry) || [];
      existing.push(ltv);
      segments.set(ltv.industry, existing);
    });
    
    const totalCustomers = this.customerLTVs.size;
    
    // Calculate stats for each segment
    return Array.from(segments.entries()).map(([industry, customers]) => {
      const ltvValues = customers.map(c => c.actualLTV || c.predictedLTV);
      const averageLTV = ltvValues.reduce((a, b) => a + b, 0) / ltvValues.length;
      
      // Calculate median
      const sortedLTVs = [...ltvValues].sort((a, b) => a - b);
      const medianLTV = sortedLTVs[Math.floor(sortedLTVs.length / 2)];
      
      const totalRevenue = ltvValues.reduce((a, b) => a + b, 0);
      
      // Marketing allocation should be proportional to total revenue potential
      const marketingAllocationRecommended = totalCustomers > 0 
        ? (customers.length / totalCustomers) * (averageLTV / 1000) // Weighted by LTV
        : 0;
      
      return {
        industry,
        averageLTV,
        medianLTV,
        customerCount: customers.length,
        averageRetentionMonths: 12, // Default, would need actual data
        averageCommissionPerCustomer: averageLTV * 0.15, // Assume 15% commission
        totalRevenue,
        marketingAllocationRecommended,
      };
    }).sort((a, b) => b.averageLTV - a.averageLTV); // Sort by highest LTV
  }

  // ========================================================================
  // CAC TRACKING METHODS
  // ========================================================================

  /**
   * Record marketing spend
   */
  recordMarketingSpend(spend: Omit<MarketingSpend, 'id'>): MarketingSpend {
    const record: MarketingSpend = {
      ...spend,
      id: uuidv4(),
    };
    this.marketingSpends.push(record);
    return record;
  }

  /**
   * Calculate CAC by channel
   */
  calculateChannelCAC(
    channel: LeadSource,
    leadsAcquired: number,
    customersAcquired: number,
    averageLTV: number
  ): ChannelCAC {
    // Sum all spend for this channel
    const totalSpend = this.marketingSpends
      .filter(s => s.channel === channel)
      .reduce((sum, s) => sum + s.amount, 0);
    
    const cac = customersAcquired > 0 ? totalSpend / customersAcquired : 0;
    const cpl = leadsAcquired > 0 ? totalSpend / leadsAcquired : 0;
    const conversionRate = leadsAcquired > 0 ? customersAcquired / leadsAcquired : 0;
    const ltvcacRatio = cac > 0 ? averageLTV / cac : 0;
    const roi = cac > 0 ? ((averageLTV - cac) / cac) * 100 : 0;
    
    let recommendation: 'scale_up' | 'maintain' | 'optimize' | 'scale_down';
    
    if (ltvcacRatio >= 3 && roi >= 200) {
      recommendation = 'scale_up';
    } else if (ltvcacRatio >= 2 && roi >= 100) {
      recommendation = 'maintain';
    } else if (ltvcacRatio >= 1 && roi >= 0) {
      recommendation = 'optimize';
    } else {
      recommendation = 'scale_down';
    }
    
    return {
      channel,
      totalSpend,
      leadsAcquired,
      customersAcquired,
      cac,
      cpl,
      conversionRate,
      averageLTV,
      ltvcacRatio,
      roi,
      recommendation,
    };
  }

  /**
   * Get all channel CAC analysis
   */
  getAllChannelCAC(
    leadsByChannel: Map<LeadSource, number>,
    customersByChannel: Map<LeadSource, number>,
    ltvByChannel: Map<LeadSource, number>
  ): ChannelCAC[] {
    const channels: LeadSource[] = [
      'organic_seo',
      'risk_assessment',
      'compliance_audit',
      'lead_magnet',
      'referral',
      'paid_ads',
      'direct',
    ];
    
    return channels.map(channel => 
      this.calculateChannelCAC(
        channel,
        leadsByChannel.get(channel) || 0,
        customersByChannel.get(channel) || 0,
        ltvByChannel.get(channel) || 0
      )
    ).filter(cac => cac.leadsAcquired > 0); // Only return channels with activity
  }
}

/**
 * Singleton instance
 */
export const revenueAnalytics = new RevenueAnalytics();
