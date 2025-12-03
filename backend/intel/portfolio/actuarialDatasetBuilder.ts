/**
 * Actuarial Dataset Builder
 *
 * Builds historical datasets for actuarial analysis and model training.
 * Provides statistical analysis for insurance underwriting.
 */

import { logger } from '../../../utils/logger';
import { PACERFiling } from '../lawsuitMonitor/pacerFeed';

export interface ActuarialDataset {
  totalCases: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  lossStatistics: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    percentile25: number;
    percentile75: number;
    percentile95: number;
  };
  frequencyStatistics: {
    avgCasesPerMonth: number;
    peakMonth: number;
    lowMonth: number;
    trendSlope: number; // Positive = increasing, negative = decreasing
  };
  industryBreakdown: Array<{
    industry: string;
    caseCount: number;
    avgSettlement: number;
    frequency: number;
  }>;
  jurisdictionBreakdown: Array<{
    jurisdiction: string;
    caseCount: number;
    avgSettlement: number;
    plaintiffWinRate: number;
  }>;
  generatedAt: Date;
}

export class ActuarialDatasetBuilder {
  /**
   * Build comprehensive actuarial dataset from litigation history
   */
  buildDataset(filings: PACERFiling[]): ActuarialDataset {
    logger.info(`Building actuarial dataset from ${filings.length} filings`);

    if (filings.length === 0) {
      return this.getEmptyDataset();
    }

    // Sort by date
    const sorted = [...filings].sort((a, b) =>
      a.filingDate.getTime() - b.filingDate.getTime()
    );

    const dateRange = {
      start: sorted[0].filingDate,
      end: sorted[sorted.length - 1].filingDate
    };

    // Calculate loss statistics
    const lossStatistics = this.calculateLossStatistics(filings);

    // Calculate frequency statistics
    const frequencyStatistics = this.calculateFrequencyStatistics(filings);

    // Break down by industry
    const industryBreakdown = this.buildIndustryBreakdown(filings);

    // Break down by jurisdiction
    const jurisdictionBreakdown = this.buildJurisdictionBreakdown(filings);

    return {
      totalCases: filings.length,
      dateRange,
      lossStatistics,
      frequencyStatistics,
      industryBreakdown,
      jurisdictionBreakdown,
      generatedAt: new Date()
    };
  }

  /**
   * Calculate loss statistics
   */
  private calculateLossStatistics(filings: PACERFiling[]) {
    // Extract settlement amounts
    const amounts = filings
      .filter(f => f.demandAmount && f.demandAmount > 0)
      .map(f => f.demandAmount!);

    if (amounts.length === 0) {
      return {
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        percentile25: 0,
        percentile75: 0,
        percentile95: 0
      };
    }

    // Sort for percentile calculations
    const sorted = [...amounts].sort((a, b) => a - b);

    // Calculate mean
    const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;

    // Calculate median
    const median = this.calculatePercentile(sorted, 50);

    // Calculate standard deviation
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean: Math.round(mean),
      median: Math.round(median),
      stdDev: Math.round(stdDev),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      percentile25: Math.round(this.calculatePercentile(sorted, 25)),
      percentile75: Math.round(this.calculatePercentile(sorted, 75)),
      percentile95: Math.round(this.calculatePercentile(sorted, 95))
    };
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(sorted: number[], percentile: number): number {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
      return sorted[lower];
    }

    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * Calculate frequency statistics
   */
  private calculateFrequencyStatistics(filings: PACERFiling[]) {
    // Group by month
    const monthlyCount = new Map<string, number>();

    for (const filing of filings) {
      const monthKey = `${filing.filingDate.getFullYear()}-${String(filing.filingDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyCount.set(monthKey, (monthlyCount.get(monthKey) || 0) + 1);
    }

    const counts = Array.from(monthlyCount.values());

    // Calculate average
    const avgCasesPerMonth = counts.length > 0
      ? counts.reduce((sum, val) => sum + val, 0) / counts.length
      : 0;

    // Find peak and low months
    const peakMonth = counts.length > 0 ? Math.max(...counts) : 0;
    const lowMonth = counts.length > 0 ? Math.min(...counts) : 0;

    // Calculate trend (simple linear regression)
    const trendSlope = this.calculateTrendSlope(Array.from(monthlyCount.entries()));

    return {
      avgCasesPerMonth: Math.round(avgCasesPerMonth),
      peakMonth,
      lowMonth,
      trendSlope: Math.round(trendSlope * 100) / 100
    };
  }

  /**
   * Calculate trend slope using simple linear regression
   */
  private calculateTrendSlope(data: Array<[string, number]>): number {
    if (data.length < 2) return 0;

    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const x = i;
      const y = data[i][1];

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return slope;
  }

  /**
   * Build industry breakdown
   */
  private buildIndustryBreakdown(filings: PACERFiling[]) {
    const industryMap = new Map<string, {
      cases: PACERFiling[];
      settlements: number[];
    }>();

    for (const filing of filings) {
      const industry = this.inferIndustry(filing.defendant);
      const data = industryMap.get(industry) || { cases: [], settlements: [] };

      data.cases.push(filing);
      if (filing.demandAmount) {
        data.settlements.push(filing.demandAmount);
      }

      industryMap.set(industry, data);
    }

    const breakdown = [];

    for (const [industry, data] of industryMap.entries()) {
      const avgSettlement = data.settlements.length > 0
        ? data.settlements.reduce((sum, val) => sum + val, 0) / data.settlements.length
        : 0;

      const frequency = data.cases.length / filings.length;

      breakdown.push({
        industry,
        caseCount: data.cases.length,
        avgSettlement: Math.round(avgSettlement),
        frequency: Math.round(frequency * 1000) / 10 // Percentage
      });
    }

    return breakdown.sort((a, b) => b.caseCount - a.caseCount);
  }

  /**
   * Build jurisdiction breakdown
   */
  private buildJurisdictionBreakdown(filings: PACERFiling[]) {
    const jurisdictionMap = new Map<string, {
      cases: PACERFiling[];
      settlements: number[];
      settled: number;
      dismissed: number;
    }>();

    for (const filing of filings) {
      const data = jurisdictionMap.get(filing.courtCode) || {
        cases: [],
        settlements: [],
        settled: 0,
        dismissed: 0
      };

      data.cases.push(filing);

      if (filing.demandAmount) {
        data.settlements.push(filing.demandAmount);
      }

      if (filing.status === 'settled') data.settled++;
      if (filing.status === 'dismissed') data.dismissed++;

      jurisdictionMap.set(filing.courtCode, data);
    }

    const breakdown = [];

    for (const [jurisdiction, data] of jurisdictionMap.entries()) {
      const avgSettlement = data.settlements.length > 0
        ? data.settlements.reduce((sum, val) => sum + val, 0) / data.settlements.length
        : 0;

      const resolvedCases = data.settled + data.dismissed;
      const plaintiffWinRate = resolvedCases > 0
        ? (data.settled / resolvedCases) * 100
        : 0;

      breakdown.push({
        jurisdiction,
        caseCount: data.cases.length,
        avgSettlement: Math.round(avgSettlement),
        plaintiffWinRate: Math.round(plaintiffWinRate)
      });
    }

    return breakdown.sort((a, b) => b.caseCount - a.caseCount);
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
   * Get empty dataset
   */
  private getEmptyDataset(): ActuarialDataset {
    return {
      totalCases: 0,
      dateRange: {
        start: new Date(),
        end: new Date()
      },
      lossStatistics: {
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        percentile25: 0,
        percentile75: 0,
        percentile95: 0
      },
      frequencyStatistics: {
        avgCasesPerMonth: 0,
        peakMonth: 0,
        lowMonth: 0,
        trendSlope: 0
      },
      industryBreakdown: [],
      jurisdictionBreakdown: [],
      generatedAt: new Date()
    };
  }
}

/**
 * Singleton instance
 */
export const actuarialBuilder = new ActuarialDatasetBuilder();
