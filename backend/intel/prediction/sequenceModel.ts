/**
 * Sequence Model for Litigation Pattern Analysis
 *
 * Analyzes temporal sequences to predict lawsuit filing patterns.
 * Uses time-series analysis to identify litigation cycles.
 */

import { logger } from '../../../utils/logger';

export interface SequenceDataPoint {
  timestamp: Date;
  violationCount: number;
  filingCount: number;
  industryActivity: number;
}

export interface SequencePattern {
  patternType: 'seasonal' | 'cyclic' | 'trend' | 'random';
  confidence: number;
  forecast: Array<{
    date: Date;
    expectedFilings: number;
    confidenceInterval: [number, number];
  }>;
}

export class SequenceLitigationModel {
  /**
   * Analyze sequence of data points to identify patterns
   */
  analyzeSequence(dataPoints: SequenceDataPoint[]): SequencePattern {
    if (dataPoints.length < 12) {
      logger.warn('Insufficient data points for sequence analysis (minimum: 12)');
      return this.getDefaultPattern();
    }

    // Sort by timestamp
    const sorted = [...dataPoints].sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Detect pattern type
    const patternType = this.detectPatternType(sorted);

    // Calculate confidence
    const confidence = this.calculatePatternConfidence(sorted, patternType);

    // Generate forecast
    const forecast = this.generateForecast(sorted, patternType);

    return {
      patternType,
      confidence,
      forecast
    };
  }

  /**
   * Detect pattern type in sequence
   */
  private detectPatternType(dataPoints: SequenceDataPoint[]): 'seasonal' | 'cyclic' | 'trend' | 'random' {
    // Calculate month-over-month changes
    const changes: number[] = [];
    for (let i = 1; i < dataPoints.length; i++) {
      const change = dataPoints[i].filingCount - dataPoints[i - 1].filingCount;
      changes.push(change);
    }

    // Calculate variance
    const mean = changes.reduce((sum, val) => sum + val, 0) / changes.length;
    const variance = changes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / changes.length;
    const stdDev = Math.sqrt(variance);

    // Detect seasonal pattern (monthly cyclical)
    if (this.hasSeasonalPattern(dataPoints)) {
      return 'seasonal';
    }

    // Detect trend (consistent increase or decrease)
    if (Math.abs(mean) > stdDev * 0.5) {
      return 'trend';
    }

    // Detect cyclic pattern
    if (this.hasCyclicPattern(dataPoints)) {
      return 'cyclic';
    }

    return 'random';
  }

  /**
   * Check for seasonal pattern (e.g., more filings in certain months)
   */
  private hasSeasonalPattern(dataPoints: SequenceDataPoint[]): boolean {
    if (dataPoints.length < 24) return false; // Need at least 2 years

    // Group by month
    const monthlyAverages = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);

    for (const point of dataPoints) {
      const month = point.timestamp.getMonth();
      monthlyAverages[month] += point.filingCount;
      monthlyCounts[month]++;
    }

    // Calculate averages
    for (let i = 0; i < 12; i++) {
      if (monthlyCounts[i] > 0) {
        monthlyAverages[i] /= monthlyCounts[i];
      }
    }

    // Check if there's significant variation between months
    const mean = monthlyAverages.reduce((sum, val) => sum + val, 0) / 12;
    const variance = monthlyAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 12;

    return variance > mean * 0.2; // Significant seasonal variation
  }

  /**
   * Check for cyclic pattern
   */
  private hasCyclicPattern(dataPoints: SequenceDataPoint[]): boolean {
    // Simplified cycle detection
    // A more robust implementation would use FFT or autocorrelation
    return false;
  }

  /**
   * Calculate confidence in pattern detection
   */
  private calculatePatternConfidence(dataPoints: SequenceDataPoint[], patternType: string): number {
    const dataPointCount = dataPoints.length;

    let baseConfidence = 0.5;

    // More data points = higher confidence
    if (dataPointCount >= 36) baseConfidence = 0.9;
    else if (dataPointCount >= 24) baseConfidence = 0.8;
    else if (dataPointCount >= 12) baseConfidence = 0.6;

    // Random patterns have lower confidence
    if (patternType === 'random') baseConfidence *= 0.5;

    return baseConfidence;
  }

  /**
   * Generate forecast based on detected pattern
   */
  private generateForecast(dataPoints: SequenceDataPoint[], patternType: string): SequencePattern['forecast'] {
    const forecast: SequencePattern['forecast'] = [];
    const lastPoint = dataPoints[dataPoints.length - 1];
    const recentAvg = this.calculateRecentAverage(dataPoints, 3);

    // Generate forecast for next 12 months
    for (let i = 1; i <= 12; i++) {
      const forecastDate = new Date(lastPoint.timestamp);
      forecastDate.setMonth(forecastDate.getMonth() + i);

      let expectedFilings: number;
      let uncertainty: number;

      switch (patternType) {
        case 'seasonal':
          expectedFilings = this.forecastSeasonal(dataPoints, forecastDate);
          uncertainty = expectedFilings * 0.2;
          break;

        case 'trend':
          expectedFilings = this.forecastTrend(dataPoints, i);
          uncertainty = expectedFilings * 0.25;
          break;

        case 'cyclic':
          expectedFilings = this.forecastCyclic(dataPoints, i);
          uncertainty = expectedFilings * 0.3;
          break;

        default:
          expectedFilings = recentAvg;
          uncertainty = recentAvg * 0.5;
      }

      forecast.push({
        date: forecastDate,
        expectedFilings: Math.max(0, Math.round(expectedFilings)),
        confidenceInterval: [
          Math.max(0, Math.round(expectedFilings - uncertainty)),
          Math.round(expectedFilings + uncertainty)
        ]
      });
    }

    return forecast;
  }

  /**
   * Forecast based on seasonal pattern
   */
  private forecastSeasonal(dataPoints: SequenceDataPoint[], forecastDate: Date): number {
    const month = forecastDate.getMonth();

    // Find historical data for this month
    const monthData = dataPoints.filter(p => p.timestamp.getMonth() === month);

    if (monthData.length === 0) {
      return this.calculateRecentAverage(dataPoints, 3);
    }

    // Average for this month
    return monthData.reduce((sum, p) => sum + p.filingCount, 0) / monthData.length;
  }

  /**
   * Forecast based on trend
   */
  private forecastTrend(dataPoints: SequenceDataPoint[], monthsAhead: number): number {
    // Simple linear regression
    const n = dataPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += dataPoints[i].filingCount;
      sumXY += i * dataPoints[i].filingCount;
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return intercept + slope * (n + monthsAhead - 1);
  }

  /**
   * Forecast based on cyclic pattern
   */
  private forecastCyclic(dataPoints: SequenceDataPoint[], monthsAhead: number): number {
    // Simplified cyclic forecast
    return this.calculateRecentAverage(dataPoints, 6);
  }

  /**
   * Calculate recent average
   */
  private calculateRecentAverage(dataPoints: SequenceDataPoint[], months: number): number {
    const recent = dataPoints.slice(-months);
    if (recent.length === 0) return 0;

    return recent.reduce((sum, p) => sum + p.filingCount, 0) / recent.length;
  }

  /**
   * Get default pattern for insufficient data
   */
  private getDefaultPattern(): SequencePattern {
    return {
      patternType: 'random',
      confidence: 0.2,
      forecast: []
    };
  }
}

/**
 * Singleton instance
 */
export const sequenceModel = new SequenceLitigationModel();
