/**
 * Jurisdiction Risk Model
 *
 * Analyzes and predicts litigation risk by geographic jurisdiction.
 * Identifies "plaintiff-friendly" courts and emerging hotspots.
 */

import { PACERFiling } from './pacerFeed';
import { logger } from '../../../utils/logger';

export interface JurisdictionRiskProfile {
  court: string;
  courtName: string;
  state: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  metrics: {
    totalFilings: number;
    filingVelocity: number; // filings per month
    plaintiffWinRate: number; // percentage
    averageSettlement?: number;
    averageDaysToResolution?: number;
    dismissalRate: number; // percentage
  };
  trends: {
    filingTrend: 'increasing' | 'stable' | 'decreasing';
    velocityChange: number; // percentage change month-over-month
  };
  characteristics: {
    plaintiffFriendly: boolean;
    activePlaintiffs: number;
    primaryIndustries: string[];
    commonViolations: string[];
  };
  forecast: {
    next30Days: number;
    next90Days: number;
    confidence: number; // 0-100
  };
}

export interface JurisdictionComparison {
  jurisdiction1: string;
  jurisdiction2: string;
  comparison: {
    riskDifference: number;
    filingDifference: number;
    settlementDifference?: number;
    recommendation: string;
  };
}

export class JurisdictionRiskModel {
  /**
   * Build comprehensive risk profile for a jurisdiction
   */
  buildJurisdictionProfile(court: string, filings: PACERFiling[]): JurisdictionRiskProfile {
    const courtFilings = filings.filter(f => f.courtCode === court);

    if (courtFilings.length === 0) {
      return this.getEmptyProfile(court);
    }

    const metrics = this.calculateMetrics(courtFilings);
    const trends = this.analyzeTrends(courtFilings);
    const characteristics = this.analyzeCharacteristics(courtFilings);
    const forecast = this.forecastFilings(courtFilings);
    const riskScore = this.calculateRiskScore(metrics, trends, characteristics);
    const riskLevel = this.determineRiskLevel(riskScore);

    return {
      court,
      courtName: this.getCourtName(court),
      state: this.getState(court),
      riskScore,
      riskLevel,
      metrics,
      trends,
      characteristics,
      forecast
    };
  }

  /**
   * Calculate jurisdiction metrics
   */
  private calculateMetrics(filings: PACERFiling[]) {
    // Sort by date
    const sortedFilings = [...filings].sort((a, b) =>
      a.filingDate.getTime() - b.filingDate.getTime()
    );

    // Calculate filing velocity
    const firstDate = sortedFilings[0].filingDate;
    const lastDate = sortedFilings[sortedFilings.length - 1].filingDate;
    const monthsSpan = Math.max(
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
      1
    );
    const filingVelocity = filings.length / monthsSpan;

    // Calculate outcomes
    const settledCases = filings.filter(f => f.status === 'settled');
    const dismissedCases = filings.filter(f => f.status === 'dismissed');
    const resolvedCases = settledCases.length + dismissedCases.length;

    const plaintiffWinRate = resolvedCases > 0
      ? (settledCases.length / resolvedCases) * 100
      : 0;

    const dismissalRate = resolvedCases > 0
      ? (dismissedCases.length / resolvedCases) * 100
      : 0;

    // Calculate average settlement
    const settlementsWithAmount = settledCases.filter(f => f.demandAmount);
    const averageSettlement = settlementsWithAmount.length > 0
      ? settlementsWithAmount.reduce((sum, f) => sum + (f.demandAmount || 0), 0) / settlementsWithAmount.length
      : undefined;

    return {
      totalFilings: filings.length,
      filingVelocity,
      plaintiffWinRate,
      averageSettlement,
      averageDaysToResolution: undefined, // Would need termination dates
      dismissalRate
    };
  }

  /**
   * Analyze filing trends
   */
  private analyzeTrends(filings: PACERFiling[]) {
    const now = new Date();

    // Count filings by month
    const thisMonth = filings.filter(f => {
      const daysAgo = (now.getTime() - f.filingDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    }).length;

    const lastMonth = filings.filter(f => {
      const daysAgo = (now.getTime() - f.filingDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo > 30 && daysAgo <= 60;
    }).length;

    const twoMonthsAgo = filings.filter(f => {
      const daysAgo = (now.getTime() - f.filingDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo > 60 && daysAgo <= 90;
    }).length;

    // Determine trend
    let filingTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (thisMonth > lastMonth * 1.2) filingTrend = 'increasing';
    else if (thisMonth < lastMonth * 0.8) filingTrend = 'decreasing';

    // Calculate velocity change
    const velocityChange = lastMonth > 0
      ? ((thisMonth - lastMonth) / lastMonth) * 100
      : 0;

    return {
      filingTrend,
      velocityChange
    };
  }

  /**
   * Analyze jurisdiction characteristics
   */
  private analyzeCharacteristics(filings: PACERFiling[]) {
    // Count unique plaintiffs
    const uniquePlaintiffs = new Set(filings.map(f => f.plaintiff));
    const activePlaintiffs = uniquePlaintiffs.size;

    // Identify if plaintiff-friendly
    const settledCases = filings.filter(f => f.status === 'settled');
    const dismissedCases = filings.filter(f => f.status === 'dismissed');
    const resolvedCases = settledCases.length + dismissedCases.length;
    const plaintiffFriendly = resolvedCases > 10 && (settledCases.length / resolvedCases) > 0.7;

    // Extract primary industries
    const industryCount = new Map<string, number>();
    filings.forEach(f => {
      const industry = this.inferIndustry(f.defendant);
      industryCount.set(industry, (industryCount.get(industry) || 0) + 1);
    });
    const primaryIndustries = Array.from(industryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([industry]) => industry);

    // Common violations (placeholder - would need actual violation data)
    const commonViolations = ['color-contrast', 'missing-alt-text', 'keyboard-navigation'];

    return {
      plaintiffFriendly,
      activePlaintiffs,
      primaryIndustries,
      commonViolations
    };
  }

  /**
   * Forecast future filings using simple linear regression
   */
  private forecastFilings(filings: PACERFiling[]) {
    const now = new Date();

    // Calculate historical velocity
    const last30Days = filings.filter(f =>
      (now.getTime() - f.filingDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
    ).length;

    const last90Days = filings.filter(f =>
      (now.getTime() - f.filingDate.getTime()) <= 90 * 24 * 60 * 60 * 1000
    ).length;

    // Simple forecast based on recent velocity
    const monthlyVelocity = last90Days / 3;

    return {
      next30Days: Math.round(monthlyVelocity),
      next90Days: Math.round(monthlyVelocity * 3),
      confidence: this.calculateForecastConfidence(filings.length)
    };
  }

  /**
   * Calculate forecast confidence based on data volume
   */
  private calculateForecastConfidence(dataPoints: number): number {
    if (dataPoints >= 100) return 90;
    if (dataPoints >= 50) return 75;
    if (dataPoints >= 20) return 60;
    if (dataPoints >= 10) return 40;
    return 20;
  }

  /**
   * Calculate overall risk score (0-100)
   */
  private calculateRiskScore(
    metrics: JurisdictionRiskProfile['metrics'],
    trends: JurisdictionRiskProfile['trends'],
    characteristics: JurisdictionRiskProfile['characteristics']
  ): number {
    let score = 0;

    // Filing velocity (0-35 points)
    score += Math.min((metrics.filingVelocity / 10) * 35, 35);

    // Plaintiff win rate (0-25 points)
    score += (metrics.plaintiffWinRate / 100) * 25;

    // Trend (0-20 points)
    if (trends.filingTrend === 'increasing') score += 20;
    else if (trends.filingTrend === 'stable') score += 10;

    // Plaintiff friendly (0-10 points)
    if (characteristics.plaintiffFriendly) score += 10;

    // Active plaintiffs (0-10 points)
    score += Math.min((characteristics.activePlaintiffs / 20) * 10, 10);

    return Math.min(Math.round(score), 100);
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  /**
   * Compare two jurisdictions
   */
  compareJurisdictions(
    profile1: JurisdictionRiskProfile,
    profile2: JurisdictionRiskProfile
  ): JurisdictionComparison {
    const riskDifference = profile1.riskScore - profile2.riskScore;
    const filingDifference = profile1.metrics.totalFilings - profile2.metrics.totalFilings;

    const settlementDifference = profile1.metrics.averageSettlement && profile2.metrics.averageSettlement
      ? profile1.metrics.averageSettlement - profile2.metrics.averageSettlement
      : undefined;

    let recommendation = '';
    if (Math.abs(riskDifference) < 10) {
      recommendation = 'Similar risk levels. Consider other factors for jurisdiction selection.';
    } else if (riskDifference > 0) {
      recommendation = `${profile2.courtName} is ${Math.abs(riskDifference)} points lower risk than ${profile1.courtName}.`;
    } else {
      recommendation = `${profile1.courtName} is ${Math.abs(riskDifference)} points lower risk than ${profile2.courtName}.`;
    }

    return {
      jurisdiction1: profile1.court,
      jurisdiction2: profile2.court,
      comparison: {
        riskDifference,
        filingDifference,
        settlementDifference,
        recommendation
      }
    };
  }

  /**
   * Get empty profile for jurisdictions with no data
   */
  private getEmptyProfile(court: string): JurisdictionRiskProfile {
    return {
      court,
      courtName: this.getCourtName(court),
      state: this.getState(court),
      riskScore: 0,
      riskLevel: 'low',
      metrics: {
        totalFilings: 0,
        filingVelocity: 0,
        plaintiffWinRate: 0,
        dismissalRate: 0
      },
      trends: {
        filingTrend: 'stable',
        velocityChange: 0
      },
      characteristics: {
        plaintiffFriendly: false,
        activePlaintiffs: 0,
        primaryIndustries: [],
        commonViolations: []
      },
      forecast: {
        next30Days: 0,
        next90Days: 0,
        confidence: 0
      }
    };
  }

  /**
   * Infer industry from defendant name
   */
  private inferIndustry(defendantName: string): string {
    const name = defendantName.toLowerCase();

    if (name.includes('restaurant') || name.includes('food')) return 'Food Service';
    if (name.includes('hotel') || name.includes('resort')) return 'Hospitality';
    if (name.includes('store') || name.includes('retail')) return 'Retail';
    if (name.includes('online') || name.includes('.com')) return 'E-Commerce';
    if (name.includes('medical') || name.includes('health')) return 'Healthcare';
    if (name.includes('bank') || name.includes('financial')) return 'Financial Services';

    return 'Other';
  }

  /**
   * Get court name from court code
   */
  private getCourtName(courtCode: string): string {
    const courtNames: { [key: string]: string } = {
      'cacd': 'C.D. California',
      'nysd': 'S.D. New York',
      'flsd': 'S.D. Florida',
      'ilnd': 'N.D. Illinois',
      'txsd': 'S.D. Texas',
      'paed': 'E.D. Pennsylvania',
      'azd': 'D. Arizona',
      'wawd': 'W.D. Washington'
    };

    return courtNames[courtCode] || courtCode.toUpperCase();
  }

  /**
   * Get state from court code
   */
  private getState(courtCode: string): string {
    // Extract state code (first 2 letters typically)
    const stateMap: { [key: string]: string } = {
      'ca': 'California',
      'ny': 'New York',
      'fl': 'Florida',
      'il': 'Illinois',
      'tx': 'Texas',
      'pa': 'Pennsylvania',
      'az': 'Arizona',
      'wa': 'Washington'
    };

    const stateCode = courtCode.substring(0, 2);
    return stateMap[stateCode] || 'Unknown';
  }
}

/**
 * Singleton instance
 */
export const jurisdictionModel = new JurisdictionRiskModel();
