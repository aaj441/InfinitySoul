/**
 * Industry Litigation Heatmap Builder
 *
 * Analyzes lawsuit concentration across industries, jurisdictions, and time periods.
 * Provides real-time intelligence on litigation "hot spots".
 */

import { PACERFiling } from './pacerFeed';
import { logger } from '../../../utils/logger';

export interface IndustryHeatmap {
  industries: Array<{
    name: string;
    naicsCode?: string;
    totalFilings: number;
    filingTrend: 'increasing' | 'stable' | 'decreasing';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    averageSettlement?: number;
    topPlaintiffs: string[];
    topJurisdictions: string[];
    recentActivity: {
      last30Days: number;
      last90Days: number;
      last365Days: number;
    };
  }>;
  jurisdictions: Array<{
    court: string;
    courtName: string;
    totalFilings: number;
    filingTrend: 'increasing' | 'stable' | 'decreasing';
    topIndustries: string[];
    topPlaintiffs: string[];
    averageDaysToResolution?: number;
  }>;
  timeSeriesData: Array<{
    date: Date;
    filingCount: number;
    industry?: string;
    jurisdiction?: string;
  }>;
  globalMetrics: {
    totalFilings: number;
    activeJurisdictions: number;
    activeIndustries: number;
    avgFilingsPerDay: number;
    filingVelocityTrend: number; // percentage change week-over-week
  };
  generatedAt: Date;
}

export class IndustryHeatmapBuilder {
  /**
   * Compute comprehensive industry heatmap from filing data
   */
  computeIndustryHeatmap(filings: PACERFiling[]): IndustryHeatmap {
    logger.info(`Computing industry heatmap from ${filings.length} filings`);

    const industries = this.analyzeIndustries(filings);
    const jurisdictions = this.analyzeJurisdictions(filings);
    const timeSeriesData = this.buildTimeSeries(filings);
    const globalMetrics = this.calculateGlobalMetrics(filings);

    return {
      industries,
      jurisdictions,
      timeSeriesData,
      globalMetrics,
      generatedAt: new Date()
    };
  }

  /**
   * Analyze lawsuit concentration by industry
   */
  private analyzeIndustries(filings: PACERFiling[]): IndustryHeatmap['industries'] {
    // Group filings by industry (inferred from defendant business type)
    const industryMap = new Map<string, PACERFiling[]>();

    for (const filing of filings) {
      const industry = this.inferIndustry(filing.defendant);
      const existing = industryMap.get(industry) || [];
      existing.push(filing);
      industryMap.set(industry, existing);
    }

    const industries: IndustryHeatmap['industries'] = [];

    for (const [industry, industryFilings] of industryMap.entries()) {
      // Calculate metrics
      const now = new Date();
      const last30Days = industryFilings.filter(f =>
        (now.getTime() - f.filingDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
      ).length;
      const last90Days = industryFilings.filter(f =>
        (now.getTime() - f.filingDate.getTime()) <= 90 * 24 * 60 * 60 * 1000
      ).length;
      const last365Days = industryFilings.filter(f =>
        (now.getTime() - f.filingDate.getTime()) <= 365 * 24 * 60 * 60 * 1000
      ).length;

      // Calculate filing trend
      const filingTrend = this.calculateTrend(last30Days, last90Days, last365Days);

      // Calculate risk level
      const riskLevel = this.calculateIndustryRisk(last30Days, industryFilings.length);

      // Get top plaintiffs for this industry
      const plaintiffCount = new Map<string, number>();
      industryFilings.forEach(f => {
        plaintiffCount.set(f.plaintiff, (plaintiffCount.get(f.plaintiff) || 0) + 1);
      });
      const topPlaintiffs = Array.from(plaintiffCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([plaintiff]) => plaintiff);

      // Get top jurisdictions for this industry
      const jurisdictionCount = new Map<string, number>();
      industryFilings.forEach(f => {
        jurisdictionCount.set(f.courtCode, (jurisdictionCount.get(f.courtCode) || 0) + 1);
      });
      const topJurisdictions = Array.from(jurisdictionCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([court]) => court);

      // Calculate average settlement
      const settledCases = industryFilings.filter(f => f.status === 'settled' && f.demandAmount);
      const averageSettlement = settledCases.length > 0
        ? settledCases.reduce((sum, f) => sum + (f.demandAmount || 0), 0) / settledCases.length
        : undefined;

      industries.push({
        name: industry,
        totalFilings: industryFilings.length,
        filingTrend,
        riskLevel,
        averageSettlement,
        topPlaintiffs,
        topJurisdictions,
        recentActivity: {
          last30Days,
          last90Days,
          last365Days
        }
      });
    }

    return industries.sort((a, b) => b.totalFilings - a.totalFilings);
  }

  /**
   * Analyze lawsuit concentration by jurisdiction
   */
  private analyzeJurisdictions(filings: PACERFiling[]): IndustryHeatmap['jurisdictions'] {
    // Group filings by court
    const jurisdictionMap = new Map<string, PACERFiling[]>();

    for (const filing of filings) {
      const existing = jurisdictionMap.get(filing.courtCode) || [];
      existing.push(filing);
      jurisdictionMap.set(filing.courtCode, existing);
    }

    const jurisdictions: IndustryHeatmap['jurisdictions'] = [];

    for (const [court, courtFilings] of jurisdictionMap.entries()) {
      // Calculate filing trend
      const now = new Date();
      const last30Days = courtFilings.filter(f =>
        (now.getTime() - f.filingDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
      ).length;
      const last90Days = courtFilings.filter(f =>
        (now.getTime() - f.filingDate.getTime()) <= 90 * 24 * 60 * 60 * 1000
      ).length;
      const last365Days = courtFilings.filter(f =>
        (now.getTime() - f.filingDate.getTime()) <= 365 * 24 * 60 * 60 * 1000
      ).length;

      const filingTrend = this.calculateTrend(last30Days, last90Days, last365Days);

      // Get top industries for this jurisdiction
      const industryCount = new Map<string, number>();
      courtFilings.forEach(f => {
        const industry = this.inferIndustry(f.defendant);
        industryCount.set(industry, (industryCount.get(industry) || 0) + 1);
      });
      const topIndustries = Array.from(industryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([industry]) => industry);

      // Get top plaintiffs for this jurisdiction
      const plaintiffCount = new Map<string, number>();
      courtFilings.forEach(f => {
        plaintiffCount.set(f.plaintiff, (plaintiffCount.get(f.plaintiff) || 0) + 1);
      });
      const topPlaintiffs = Array.from(plaintiffCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([plaintiff]) => plaintiff);

      jurisdictions.push({
        court,
        courtName: this.getCourtName(court),
        totalFilings: courtFilings.length,
        filingTrend,
        topIndustries,
        topPlaintiffs
      });
    }

    return jurisdictions.sort((a, b) => b.totalFilings - a.totalFilings);
  }

  /**
   * Build time series data for trend analysis
   */
  private buildTimeSeries(filings: PACERFiling[]): IndustryHeatmap['timeSeriesData'] {
    // Group by day
    const dayMap = new Map<string, number>();

    for (const filing of filings) {
      const dateKey = filing.filingDate.toISOString().split('T')[0];
      dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + 1);
    }

    return Array.from(dayMap.entries())
      .map(([dateStr, count]) => ({
        date: new Date(dateStr),
        filingCount: count
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Calculate global litigation metrics
   */
  private calculateGlobalMetrics(filings: PACERFiling[]): IndustryHeatmap['globalMetrics'] {
    if (filings.length === 0) {
      return {
        totalFilings: 0,
        activeJurisdictions: 0,
        activeIndustries: 0,
        avgFilingsPerDay: 0,
        filingVelocityTrend: 0
      };
    }

    const uniqueJurisdictions = new Set(filings.map(f => f.courtCode));
    const uniqueIndustries = new Set(filings.map(f => this.inferIndustry(f.defendant)));

    // Calculate average filings per day
    const sortedFilings = [...filings].sort((a, b) =>
      a.filingDate.getTime() - b.filingDate.getTime()
    );
    const firstDate = sortedFilings[0].filingDate;
    const lastDate = sortedFilings[sortedFilings.length - 1].filingDate;
    const daysSpan = Math.max(
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
      1
    );
    const avgFilingsPerDay = filings.length / daysSpan;

    // Calculate week-over-week trend
    const now = new Date();
    const lastWeek = filings.filter(f =>
      (now.getTime() - f.filingDate.getTime()) <= 7 * 24 * 60 * 60 * 1000
    ).length;
    const previousWeek = filings.filter(f => {
      const daysAgo = (now.getTime() - f.filingDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo > 7 && daysAgo <= 14;
    }).length;

    const filingVelocityTrend = previousWeek > 0
      ? ((lastWeek - previousWeek) / previousWeek) * 100
      : 0;

    return {
      totalFilings: filings.length,
      activeJurisdictions: uniqueJurisdictions.size,
      activeIndustries: uniqueIndustries.size,
      avgFilingsPerDay,
      filingVelocityTrend
    };
  }

  /**
   * Infer industry from defendant name
   */
  private inferIndustry(defendantName: string): string {
    const name = defendantName.toLowerCase();

    // Industry classification keywords
    if (name.includes('restaurant') || name.includes('cafe') || name.includes('food') ||
        name.includes('dining') || name.includes('pizza') || name.includes('burger')) {
      return 'Food Service';
    }
    if (name.includes('hotel') || name.includes('inn') || name.includes('resort') ||
        name.includes('lodging')) {
      return 'Hospitality';
    }
    if (name.includes('store') || name.includes('shop') || name.includes('retail') ||
        name.includes('mall') || name.includes('boutique')) {
      return 'Retail';
    }
    if (name.includes('online') || name.includes('.com') || name.includes('digital') ||
        name.includes('marketplace')) {
      return 'E-Commerce';
    }
    if (name.includes('medical') || name.includes('health') || name.includes('clinic') ||
        name.includes('hospital') || name.includes('dental')) {
      return 'Healthcare';
    }
    if (name.includes('bank') || name.includes('credit') || name.includes('financial') ||
        name.includes('insurance')) {
      return 'Financial Services';
    }
    if (name.includes('law') || name.includes('consulting') || name.includes('accounting') ||
        name.includes('agency')) {
      return 'Professional Services';
    }

    return 'Other';
  }

  /**
   * Calculate filing trend from time-based counts
   */
  private calculateTrend(
    last30Days: number,
    last90Days: number,
    last365Days: number
  ): 'increasing' | 'stable' | 'decreasing' {
    // Calculate monthly averages
    const monthlyRecent = last30Days;
    const monthlyMid = (last90Days - last30Days) / 2;
    const monthlyHistorical = (last365Days - last90Days) / 9;

    if (monthlyRecent > monthlyMid * 1.2) return 'increasing';
    if (monthlyRecent < monthlyMid * 0.8) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate industry risk level
   */
  private calculateIndustryRisk(last30Days: number, totalFilings: number): 'low' | 'medium' | 'high' | 'critical' {
    if (last30Days >= 10 || totalFilings >= 100) return 'critical';
    if (last30Days >= 5 || totalFilings >= 50) return 'high';
    if (last30Days >= 2 || totalFilings >= 20) return 'medium';
    return 'low';
  }

  /**
   * Get human-readable court name from court code
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
}

/**
 * Singleton instance
 */
export const heatmapBuilder = new IndustryHeatmapBuilder();

/**
 * Main export function
 */
export function computeIndustryHeatmap(filings: PACERFiling[]): IndustryHeatmap {
  return heatmapBuilder.computeIndustryHeatmap(filings);
}
