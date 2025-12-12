/**
 * Revenue Analytics Service
 * 
 * Implements comprehensive revenue optimization tracking:
 * - A/B test significance calculator
 * - Multi-touch attribution
 * - Churn prediction
 * - Segmented LTV by industry
 * - Multi-channel CAC tracking
 * 
 * Part of the 50 Revenue Optimization Ideas implementation (Ideas #1-5)
 */

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// TYPES
// =============================================================================

export interface ABTest {
  id: string;
  name: string;
  variant: 'A' | 'B';
  startDate: Date;
  endDate?: Date;
  conversions: number;
  exposures: number;
  conversionRate: number;
}

export interface ABTestResult {
  testId: string;
  variantA: {
    conversions: number;
    exposures: number;
    conversionRate: number;
  };
  variantB: {
    conversions: number;
    exposures: number;
    conversionRate: number;
  };
  isSignificant: boolean;
  pValue: number;
  confidenceLevel: number;
  requiredSampleSize: number;
  recommendation: string;
}

export interface TouchPoint {
  id: string;
  channel: string;
  timestamp: Date;
  type: 'email_open' | 'email_click' | 'page_visit' | 'assessment_start' | 'assessment_complete' | 'quote_request' | 'conversion';
  metadata?: Record<string, any>;
}

export interface Attribution {
  userId: string;
  touchPoints: TouchPoint[];
  firstTouch: TouchPoint;
  lastTouch: TouchPoint;
  converted: boolean;
  conversionValue?: number;
  attributionWeights: Record<string, number>;
}

export interface ChurnPrediction {
  userId: string;
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  indicators: {
    emailEngagementDrop: boolean;
    daysSinceLastOpen: number;
    openRateDecline: number;
    predictedChurnDate?: Date;
  };
  recommendedActions: string[];
}

export interface IndustryLTV {
  industry: string;
  avgLifetimeValue: number;
  avgCustomerLifetime: number; // months
  avgRevenuePerMonth: number;
  customerCount: number;
  churnRate: number;
}

export interface ChannelCAC {
  channel: string;
  totalSpend: number;
  conversions: number;
  cac: number; // Cost per acquisition
  ltv: number; // Average LTV from this channel
  ltvCacRatio: number;
  roi: number;
}

// =============================================================================
// IDEA #1: A/B TEST SIGNIFICANCE CALCULATOR
// =============================================================================

export class ABTestCalculator {
  /**
   * Calculate if an A/B test result is statistically significant
   * Requires n >= 385 samples and p < 0.05
   */
  static calculateSignificance(
    variantA: { conversions: number; exposures: number },
    variantB: { conversions: number; exposures: number },
    confidenceLevel: number = 0.95
  ): ABTestResult {
    const conversionRateA = variantA.conversions / variantA.exposures;
    const conversionRateB = variantB.conversions / variantB.exposures;

    // Calculate pooled probability
    const pooledConversions = variantA.conversions + variantB.conversions;
    const pooledExposures = variantA.exposures + variantB.exposures;
    const pooledProbability = pooledConversions / pooledExposures;

    // Calculate standard error
    const standardError = Math.sqrt(
      pooledProbability * (1 - pooledProbability) * 
      (1 / variantA.exposures + 1 / variantB.exposures)
    );

    // Calculate z-score
    const zScore = (conversionRateB - conversionRateA) / standardError;

    // Calculate p-value (two-tailed test)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    // Calculate required sample size for 95% confidence and 80% power
    const baselineRate = conversionRateA;
    const minimumDetectableEffect = 0.1; // 10% relative improvement
    const requiredSampleSize = this.calculateRequiredSampleSize(
      baselineRate,
      minimumDetectableEffect,
      0.95,
      0.80
    );

    const isSignificant = pValue < (1 - confidenceLevel) && 
                          variantA.exposures >= 385 && 
                          variantB.exposures >= 385;

    let recommendation = '';
    if (!isSignificant) {
      if (variantA.exposures < 385 || variantB.exposures < 385) {
        recommendation = `Not enough data. Need at least 385 samples per variant. Current: A=${variantA.exposures}, B=${variantB.exposures}`;
      } else if (pValue >= (1 - confidenceLevel)) {
        recommendation = `Not statistically significant (p=${pValue.toFixed(4)}). Continue testing or declare no winner.`;
      }
    } else {
      const winner = conversionRateB > conversionRateA ? 'B' : 'A';
      const improvement = ((Math.max(conversionRateB, conversionRateA) / Math.min(conversionRateB, conversionRateA) - 1) * 100).toFixed(2);
      recommendation = `Variant ${winner} wins with ${improvement}% improvement (p=${pValue.toFixed(4)})`;
    }

    return {
      testId: uuidv4(),
      variantA: {
        conversions: variantA.conversions,
        exposures: variantA.exposures,
        conversionRate: conversionRateA,
      },
      variantB: {
        conversions: variantB.conversions,
        exposures: variantB.exposures,
        conversionRate: conversionRateB,
      },
      isSignificant,
      pValue,
      confidenceLevel,
      requiredSampleSize,
      recommendation,
    };
  }

  /**
   * Normal cumulative distribution function approximation
   */
  private static normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - probability : probability;
  }

  /**
   * Calculate required sample size for A/B test
   */
  private static calculateRequiredSampleSize(
    baselineRate: number,
    minimumDetectableEffect: number,
    confidenceLevel: number,
    power: number
  ): number {
    // Z-score for confidence level
    const zAlpha = this.getZScore(confidenceLevel);
    // Z-score for power
    const zBeta = this.getZScore(power);
    
    const p1 = baselineRate;
    const p2 = baselineRate * (1 + minimumDetectableEffect);
    const pBar = (p1 + p2) / 2;

    const n = (
      Math.pow(zAlpha + zBeta, 2) * 
      (p1 * (1 - p1) + p2 * (1 - p2))
    ) / Math.pow(p2 - p1, 2);

    return Math.ceil(n);
  }

  /**
   * Get z-score for confidence level
   */
  private static getZScore(probability: number): number {
    const zScores: Record<number, number> = {
      0.80: 1.28,
      0.85: 1.44,
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };
    return zScores[probability] || 1.96;
  }
}

// =============================================================================
// IDEA #2: MULTI-TOUCH ATTRIBUTION SYSTEM
// =============================================================================

export class MultiTouchAttribution {
  private touchPoints: Map<string, TouchPoint[]> = new Map();

  /**
   * Track a touchpoint for a user
   */
  trackTouchPoint(userId: string, touchPoint: Omit<TouchPoint, 'id'>): void {
    const userTouchPoints = this.touchPoints.get(userId) || [];
    userTouchPoints.push({
      id: uuidv4(),
      ...touchPoint,
    });
    this.touchPoints.set(userId, userTouchPoints);
  }

  /**
   * Calculate attribution weights using time-decay model
   * More recent touches get more credit
   */
  calculateAttribution(userId: string, conversionValue: number): Attribution | null {
    const userTouchPoints = this.touchPoints.get(userId);
    if (!userTouchPoints || userTouchPoints.length === 0) {
      return null;
    }

    // Sort by timestamp
    const sorted = [...userTouchPoints].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate time decay weights
    const now = new Date().getTime();
    const weights: Record<string, number> = {};
    let totalWeight = 0;

    sorted.forEach((touchPoint, index) => {
      // Time decay: more recent = more weight
      const daysAgo = (now - touchPoint.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.exp(-daysAgo / 7); // Half-life of 7 days
      
      // Position weight: first touch and last touch get bonus
      let positionBonus = 1;
      if (index === 0) positionBonus = 1.5; // First touch bonus
      if (index === sorted.length - 1) positionBonus = 1.5; // Last touch bonus
      
      const weight = decayFactor * positionBonus;
      weights[touchPoint.channel] = (weights[touchPoint.channel] || 0) + weight;
      totalWeight += weight;
    });

    // Normalize weights to sum to 1
    Object.keys(weights).forEach(channel => {
      weights[channel] = weights[channel] / totalWeight;
    });

    const lastTouchPoint = sorted[sorted.length - 1];
    const converted = lastTouchPoint.type === 'conversion';

    return {
      userId,
      touchPoints: sorted,
      firstTouch: sorted[0],
      lastTouch: lastTouchPoint,
      converted,
      conversionValue: converted ? conversionValue : undefined,
      attributionWeights: weights,
    };
  }

  /**
   * Get email sequence performance
   * Identifies which emails in the 5-email sequence drive conversions
   */
  getEmailSequencePerformance(): Record<number, { opens: number; clicks: number; conversions: number }> {
    const performance: Record<number, { opens: number; clicks: number; conversions: number }> = {
      1: { opens: 0, clicks: 0, conversions: 0 },
      2: { opens: 0, clicks: 0, conversions: 0 },
      3: { opens: 0, clicks: 0, conversions: 0 },
      4: { opens: 0, clicks: 0, conversions: 0 },
      5: { opens: 0, clicks: 0, conversions: 0 },
    };

    this.touchPoints.forEach((touchPoints, userId) => {
      touchPoints.forEach(tp => {
        if (tp.metadata?.emailNumber) {
          const emailNum = tp.metadata.emailNumber;
          if (tp.type === 'email_open') {
            performance[emailNum].opens++;
          } else if (tp.type === 'email_click') {
            performance[emailNum].clicks++;
          }
        }
      });

      // Check if converted
      const converted = touchPoints.some(tp => tp.type === 'conversion');
      if (converted) {
        // Attribute conversion to last email before conversion
        const emailTouchPoints = touchPoints.filter(tp => tp.metadata?.emailNumber);
        if (emailTouchPoints.length > 0) {
          const lastEmail = emailTouchPoints[emailTouchPoints.length - 1];
          const emailNum = lastEmail.metadata?.emailNumber;
          if (emailNum) {
            performance[emailNum].conversions++;
          }
        }
      }
    });

    return performance;
  }
}

// =============================================================================
// IDEA #3: CHURN PREDICTION MODEL
// =============================================================================

export class ChurnPredictor {
  /**
   * Predict churn risk based on email engagement patterns
   * Flag customers when email opens drop after day 20
   */
  predictChurn(
    userId: string,
    emailHistory: Array<{ date: Date; opened: boolean }>
  ): ChurnPrediction {
    const now = new Date();
    const daysSinceLastOpen = this.getDaysSinceLastOpen(emailHistory);
    const openRateDecline = this.calculateOpenRateDecline(emailHistory);
    
    // Calculate risk score (0-100)
    let riskScore = 0;
    
    // Factor 1: Days since last open (0-40 points)
    if (daysSinceLastOpen > 30) riskScore += 40;
    else if (daysSinceLastOpen > 20) riskScore += 30;
    else if (daysSinceLastOpen > 10) riskScore += 15;
    
    // Factor 2: Open rate decline (0-40 points)
    if (openRateDecline > 0.5) riskScore += 40; // 50%+ decline
    else if (openRateDecline > 0.3) riskScore += 25; // 30%+ decline
    else if (openRateDecline > 0.15) riskScore += 10; // 15%+ decline
    
    // Factor 3: Recent engagement (0-20 points)
    const recentEmails = emailHistory.filter(e => {
      const daysAgo = (now.getTime() - e.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });
    const recentOpenRate = recentEmails.filter(e => e.opened).length / Math.max(recentEmails.length, 1);
    if (recentOpenRate === 0 && recentEmails.length > 0) riskScore += 20;
    else if (recentOpenRate < 0.2) riskScore += 10;

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (riskScore >= 70) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    // Generate recommendations
    const recommendedActions: string[] = [];
    if (daysSinceLastOpen > 20) {
      recommendedActions.push('Send re-engagement campaign');
      recommendedActions.push('Offer exclusive discount or value-add');
    }
    if (openRateDecline > 0.3) {
      recommendedActions.push('Review email content relevance');
      recommendedActions.push('Consider different send times');
    }
    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      recommendedActions.push('Personal outreach via phone or LinkedIn');
      recommendedActions.push('Schedule check-in call');
    }

    // Predict churn date based on current trajectory
    let predictedChurnDate: Date | undefined;
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      const daysUntilChurn = Math.max(30 - daysSinceLastOpen, 7);
      predictedChurnDate = new Date(now.getTime() + daysUntilChurn * 24 * 60 * 60 * 1000);
    }

    return {
      userId,
      riskScore,
      riskLevel,
      indicators: {
        emailEngagementDrop: openRateDecline > 0.2,
        daysSinceLastOpen,
        openRateDecline,
        predictedChurnDate,
      },
      recommendedActions,
    };
  }

  private getDaysSinceLastOpen(emailHistory: Array<{ date: Date; opened: boolean }>): number {
    const now = new Date();
    const lastOpen = emailHistory
      .filter(e => e.opened)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    
    if (!lastOpen) return 999; // Never opened
    
    return (now.getTime() - lastOpen.date.getTime()) / (1000 * 60 * 60 * 24);
  }

  private calculateOpenRateDecline(emailHistory: Array<{ date: Date; opened: boolean }>): number {
    const now = new Date();
    
    // Recent 30 days
    const recent = emailHistory.filter(e => {
      const daysAgo = (now.getTime() - e.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });
    
    // Previous 30 days (30-60 days ago)
    const previous = emailHistory.filter(e => {
      const daysAgo = (now.getTime() - e.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo > 30 && daysAgo <= 60;
    });
    
    if (previous.length === 0) return 0; // Not enough history
    
    const recentOpenRate = recent.filter(e => e.opened).length / Math.max(recent.length, 1);
    const previousOpenRate = previous.filter(e => e.opened).length / previous.length;
    
    return previousOpenRate - recentOpenRate; // Positive = decline
  }
}

// =============================================================================
// IDEA #4: SEGMENTED LTV BY INDUSTRY
// =============================================================================

export class IndustryLTVAnalyzer {
  private industryData: Map<string, {
    customers: Array<{
      id: string;
      signupDate: Date;
      churnDate?: Date;
      totalRevenue: number;
    }>;
  }> = new Map();

  /**
   * Track customer for LTV calculation
   */
  trackCustomer(
    industry: string,
    customerId: string,
    signupDate: Date,
    totalRevenue: number,
    churnDate?: Date
  ): void {
    if (!this.industryData.has(industry)) {
      this.industryData.set(industry, { customers: [] });
    }
    
    const data = this.industryData.get(industry)!;
    data.customers.push({
      id: customerId,
      signupDate,
      churnDate,
      totalRevenue,
    });
  }

  /**
   * Calculate LTV metrics by industry
   * Identifies which industries have 2-3x higher LTV
   */
  calculateIndustryLTV(industry: string): IndustryLTV | null {
    const data = this.industryData.get(industry);
    if (!data || data.customers.length === 0) {
      return null;
    }

    const now = new Date();
    let totalRevenue = 0;
    let totalLifetimeMonths = 0;
    let churnedCustomers = 0;

    data.customers.forEach(customer => {
      totalRevenue += customer.totalRevenue;
      
      const endDate = customer.churnDate || now;
      const lifetimeMonths = (endDate.getTime() - customer.signupDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      totalLifetimeMonths += lifetimeMonths;
      
      if (customer.churnDate) {
        churnedCustomers++;
      }
    });

    const customerCount = data.customers.length;
    const avgLifetimeValue = totalRevenue / customerCount;
    const avgCustomerLifetime = totalLifetimeMonths / customerCount;
    const avgRevenuePerMonth = avgLifetimeValue / Math.max(avgCustomerLifetime, 1);
    const churnRate = churnedCustomers / customerCount;

    return {
      industry,
      avgLifetimeValue,
      avgCustomerLifetime,
      avgRevenuePerMonth,
      customerCount,
      churnRate,
    };
  }

  /**
   * Get all industries ranked by LTV
   */
  getAllIndustriesRankedByLTV(): IndustryLTV[] {
    const industries: IndustryLTV[] = [];
    
    this.industryData.forEach((_, industry) => {
      const ltv = this.calculateIndustryLTV(industry);
      if (ltv) {
        industries.push(ltv);
      }
    });

    return industries.sort((a, b) => b.avgLifetimeValue - a.avgLifetimeValue);
  }

  /**
   * Get marketing budget allocation recommendation
   * Allocate 80% of budget to top LTV industries
   */
  getMarketingAllocation(totalBudget: number): Record<string, { allocation: number; percentage: number }> {
    const rankedIndustries = this.getAllIndustriesRankedByLTV();
    if (rankedIndustries.length === 0) {
      return {};
    }

    const totalLTV = rankedIndustries.reduce((sum, ind) => sum + ind.avgLifetimeValue * ind.customerCount, 0);
    const allocation: Record<string, { allocation: number; percentage: number }> = {};

    rankedIndustries.forEach(industry => {
      const industryLTV = industry.avgLifetimeValue * industry.customerCount;
      const percentage = industryLTV / totalLTV;
      allocation[industry.industry] = {
        allocation: totalBudget * percentage,
        percentage: percentage * 100,
      };
    });

    return allocation;
  }
}

// =============================================================================
// IDEA #5: MULTI-CHANNEL CAC TRACKER
// =============================================================================

export class ChannelCACTracker {
  private channelData: Map<string, {
    spend: number;
    conversions: Array<{ customerId: string; ltv: number }>;
  }> = new Map();

  /**
   * Track spend for a channel
   */
  trackSpend(channel: string, amount: number): void {
    if (!this.channelData.has(channel)) {
      this.channelData.set(channel, { spend: 0, conversions: [] });
    }
    const data = this.channelData.get(channel)!;
    data.spend += amount;
  }

  /**
   * Track conversion from a channel
   */
  trackConversion(channel: string, customerId: string, ltv: number): void {
    if (!this.channelData.has(channel)) {
      this.channelData.set(channel, { spend: 0, conversions: [] });
    }
    const data = this.channelData.get(channel)!;
    data.conversions.push({ customerId, ltv });
  }

  /**
   * Calculate CAC for a channel
   */
  calculateChannelCAC(channel: string): ChannelCAC | null {
    const data = this.channelData.get(channel);
    if (!data) {
      return null;
    }

    const totalSpend = data.spend;
    const conversions = data.conversions.length;
    const cac = conversions > 0 ? totalSpend / conversions : totalSpend;
    
    const totalLTV = data.conversions.reduce((sum, c) => sum + c.ltv, 0);
    const avgLTV = conversions > 0 ? totalLTV / conversions : 0;
    
    const ltvCacRatio = cac > 0 ? avgLTV / cac : 0;
    const roi = totalSpend > 0 ? ((totalLTV - totalSpend) / totalSpend) * 100 : 0;

    return {
      channel,
      totalSpend,
      conversions,
      cac,
      ltv: avgLTV,
      ltvCacRatio,
      roi,
    };
  }

  /**
   * Get all channels ranked by efficiency (LTV:CAC ratio)
   */
  getAllChannelsRanked(): ChannelCAC[] {
    const channels: ChannelCAC[] = [];
    
    this.channelData.forEach((_, channel) => {
      const cac = this.calculateChannelCAC(channel);
      if (cac) {
        channels.push(cac);
      }
    });

    return channels.sort((a, b) => b.ltvCacRatio - a.ltvCacRatio);
  }

  /**
   * Get budget reallocation recommendations
   * Move budget from high CAC to low CAC channels
   */
  getReallocationRecommendations(): {
    recommendations: Array<{
      action: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
      channel: string;
      currentCAC: number;
      ltvCacRatio: number;
      reason: string;
    }>;
  } {
    const channels = this.getAllChannelsRanked();
    const recommendations: Array<{
      action: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
      channel: string;
      currentCAC: number;
      ltvCacRatio: number;
      reason: string;
    }> = [];

    channels.forEach((channel, index) => {
      let action: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
      let reason = '';

      if (channel.ltvCacRatio > 3) {
        action = 'INCREASE';
        reason = `Excellent LTV:CAC ratio of ${channel.ltvCacRatio.toFixed(2)}. Increase budget to scale.`;
      } else if (channel.ltvCacRatio < 1.5) {
        action = 'DECREASE';
        reason = `Poor LTV:CAC ratio of ${channel.ltvCacRatio.toFixed(2)}. Consider reducing spend or optimizing.`;
      } else {
        action = 'MAINTAIN';
        reason = `Acceptable LTV:CAC ratio of ${channel.ltvCacRatio.toFixed(2)}. Monitor and optimize.`;
      }

      // Special case: $0 CAC channels (like podcasts)
      if (channel.cac === 0 && channel.conversions > 0) {
        action = 'INCREASE';
        reason = `Zero CAC with ${channel.conversions} conversions. Max out this channel!`;
      }

      recommendations.push({
        action,
        channel: channel.channel,
        currentCAC: channel.cac,
        ltvCacRatio: channel.ltvCacRatio,
        reason,
      });
    });

    return { recommendations };
  }
}

// =============================================================================
// CONSOLIDATED ANALYTICS SERVICE
// =============================================================================

export class RevenueAnalyticsService {
  public abTestCalculator: ABTestCalculator;
  public multiTouchAttribution: MultiTouchAttribution;
  public churnPredictor: ChurnPredictor;
  public industryLTVAnalyzer: IndustryLTVAnalyzer;
  public channelCACTracker: ChannelCACTracker;

  constructor() {
    this.abTestCalculator = new ABTestCalculator();
    this.multiTouchAttribution = new MultiTouchAttribution();
    this.churnPredictor = new ChurnPredictor();
    this.industryLTVAnalyzer = new IndustryLTVAnalyzer();
    this.channelCACTracker = new ChannelCACTracker();
  }

  /**
   * Get comprehensive revenue analytics dashboard
   */
  getDashboard(): {
    abTests: any[];
    emailSequencePerformance: Record<number, { opens: number; clicks: number; conversions: number }>;
    topIndustries: IndustryLTV[];
    topChannels: ChannelCAC[];
    channelRecommendations: any;
  } {
    return {
      abTests: [],
      emailSequencePerformance: this.multiTouchAttribution.getEmailSequencePerformance(),
      topIndustries: this.industryLTVAnalyzer.getAllIndustriesRankedByLTV().slice(0, 10),
      topChannels: this.channelCACTracker.getAllChannelsRanked(),
      channelRecommendations: this.channelCACTracker.getReallocationRecommendations(),
    };
  }
}

// Singleton instance
export const revenueAnalytics = new RevenueAnalyticsService();
