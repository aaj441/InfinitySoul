/**
 * Portfolio Risk Aggregator
 *
 * Aggregates risk metrics across large portfolios for insurers and enterprises.
 * Provides real-time risk monitoring and alerting.
 */

import { logger } from '../../../utils/logger';
import { LawsuitPrediction } from '../prediction/lawsuitPredictionV3';
import { PortfolioCompany } from './insurancePortfolioEngine';

export interface AggregatedRisk {
  portfolioId: string;
  totalCompanies: number;
  riskMetrics: {
    avgProbability30Days: number;
    avgProbability90Days: number;
    avgProbability365Days: number;
    maxRisk: number;
    minRisk: number;
  };
  exposure: {
    totalExposure: number; // Total predicted loss
    concentrationRisk: number; // 0-1 (how concentrated risk is)
    diversificationScore: number; // 0-1 (how diversified)
  };
  alerts: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: string;
    message: string;
    affectedCompanies: number;
  }>;
  trends: {
    weekOverWeek: number; // Percentage change
    monthOverMonth: number;
    quarterOverQuarter: number;
  };
  aggregatedAt: Date;
}

export interface ClusterRisk {
  clusterId: string;
  clusterName: string;
  companies: string[];
  riskScore: number;
  commonFactors: string[];
  recommendation: string;
}

export class PortfolioRiskAggregator {
  /**
   * Aggregate risk across entire portfolio
   */
  aggregatePortfolio(
    portfolioId: string,
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>,
    historicalData?: Map<string, number[]> // Historical risk scores
  ): AggregatedRisk {
    logger.info(`Aggregating risk for portfolio ${portfolioId} (${companies.length} companies)`);

    // Calculate risk metrics
    const riskMetrics = this.calculateRiskMetrics(companies, predictions);

    // Calculate exposure
    const exposure = this.calculateExposure(companies, predictions);

    // Generate alerts
    const alerts = this.generateAlerts(companies, predictions);

    // Calculate trends
    const trends = this.calculateTrends(companies, predictions, historicalData);

    return {
      portfolioId,
      totalCompanies: companies.length,
      riskMetrics,
      exposure,
      alerts,
      trends,
      aggregatedAt: new Date()
    };
  }

  /**
   * Calculate aggregated risk metrics
   */
  private calculateRiskMetrics(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>
  ) {
    const probabilities30: number[] = [];
    const probabilities90: number[] = [];
    const probabilities365: number[] = [];

    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      probabilities30.push(prediction.predictions.next30Days);
      probabilities90.push(prediction.predictions.next90Days);
      probabilities365.push(prediction.predictions.next365Days);
    }

    const avg30 = probabilities30.length > 0
      ? probabilities30.reduce((sum, val) => sum + val, 0) / probabilities30.length
      : 0;

    const avg90 = probabilities90.length > 0
      ? probabilities90.reduce((sum, val) => sum + val, 0) / probabilities90.length
      : 0;

    const avg365 = probabilities365.length > 0
      ? probabilities365.reduce((sum, val) => sum + val, 0) / probabilities365.length
      : 0;

    const maxRisk = probabilities365.length > 0
      ? Math.max(...probabilities365)
      : 0;

    const minRisk = probabilities365.length > 0
      ? Math.min(...probabilities365)
      : 0;

    return {
      avgProbability30Days: avg30,
      avgProbability90Days: avg90,
      avgProbability365Days: avg365,
      maxRisk,
      minRisk
    };
  }

  /**
   * Calculate portfolio exposure
   */
  private calculateExposure(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>
  ) {
    const avgLoss = 100000; // Average ADA lawsuit loss
    let totalExposure = 0;

    const riskScores: number[] = [];

    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      totalExposure += prediction.predictions.next365Days * avgLoss;
      riskScores.push(prediction.predictions.next365Days);
    }

    // Calculate concentration risk (Herfindahl index)
    const concentrationRisk = this.calculateHerfindahlIndex(riskScores);

    // Diversification score (inverse of concentration)
    const diversificationScore = 1 - concentrationRisk;

    return {
      totalExposure: Math.round(totalExposure),
      concentrationRisk: Math.round(concentrationRisk * 100) / 100,
      diversificationScore: Math.round(diversificationScore * 100) / 100
    };
  }

  /**
   * Calculate Herfindahl index for concentration
   */
  private calculateHerfindahlIndex(values: number[]): number {
    if (values.length === 0) return 0;

    const total = values.reduce((sum, val) => sum + val, 0);
    if (total === 0) return 0;

    const shares = values.map(val => val / total);
    const herfindahl = shares.reduce((sum, share) => sum + share * share, 0);

    // Normalize to 0-1 range
    const minHerfindahl = 1 / values.length;
    const normalizedHerfindahl = (herfindahl - minHerfindahl) / (1 - minHerfindahl);

    return Math.max(0, Math.min(1, normalizedHerfindahl));
  }

  /**
   * Generate risk alerts
   */
  private generateAlerts(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>
  ): AggregatedRisk['alerts'] {
    const alerts: AggregatedRisk['alerts'] = [];

    // Count by risk level
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;

    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      if (prediction.riskLevel === 'critical') criticalCount++;
      else if (prediction.riskLevel === 'high') highCount++;
      else if (prediction.riskLevel === 'medium') mediumCount++;
    }

    // Generate alerts
    if (criticalCount > 0) {
      alerts.push({
        severity: 'critical',
        type: 'HIGH_RISK_COMPANIES',
        message: `${criticalCount} companies at critical risk of lawsuit within 90 days`,
        affectedCompanies: criticalCount
      });
    }

    if (highCount > companies.length * 0.2) {
      alerts.push({
        severity: 'high',
        type: 'PORTFOLIO_RISK_ELEVATED',
        message: `${highCount} companies (${Math.round((highCount / companies.length) * 100)}%) at high risk`,
        affectedCompanies: highCount
      });
    }

    // Check for clustering
    if (criticalCount > 3) {
      alerts.push({
        severity: 'medium',
        type: 'RISK_CLUSTERING',
        message: 'Multiple critical risks detected - potential systemic issue',
        affectedCompanies: criticalCount
      });
    }

    return alerts;
  }

  /**
   * Calculate risk trends
   */
  private calculateTrends(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>,
    historicalData?: Map<string, number[]>
  ): AggregatedRisk['trends'] {
    // If no historical data, return zeros
    if (!historicalData || historicalData.size === 0) {
      return {
        weekOverWeek: 0,
        monthOverMonth: 0,
        quarterOverQuarter: 0
      };
    }

    // Calculate current average risk
    const currentRisks: number[] = [];
    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (prediction) {
        currentRisks.push(prediction.predictions.next365Days);
      }
    }

    const currentAvg = currentRisks.length > 0
      ? currentRisks.reduce((sum, val) => sum + val, 0) / currentRisks.length
      : 0;

    // Placeholder trend calculations (would use actual historical data)
    const weekOverWeek = 0;
    const monthOverMonth = 0;
    const quarterOverQuarter = 0;

    return {
      weekOverWeek,
      monthOverMonth,
      quarterOverQuarter
    };
  }

  /**
   * Identify risk clusters
   */
  identifyRiskClusters(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>
  ): ClusterRisk[] {
    const clusters: ClusterRisk[] = [];

    // Group by industry
    const industryMap = new Map<string, {
      companies: PortfolioCompany[];
      risks: number[];
      predictions: LawsuitPrediction[];
    }>();

    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      const industry = company.industry;
      const data = industryMap.get(industry) || { companies: [], risks: [], predictions: [] };

      data.companies.push(company);
      data.risks.push(prediction.predictions.next365Days);
      data.predictions.push(prediction);

      industryMap.set(industry, data);
    }

    // Analyze each industry cluster
    for (const [industry, data] of industryMap.entries()) {
      const avgRisk = data.risks.reduce((sum, val) => sum + val, 0) / data.risks.length;

      // Only include high-risk clusters
      if (avgRisk > 0.3) {
        // Find common risk factors
        const factorCount = new Map<string, number>();

        for (const prediction of data.predictions) {
          for (const factor of prediction.topRiskFactors) {
            factorCount.set(factor.factor, (factorCount.get(factor.factor) || 0) + 1);
          }
        }

        const commonFactors = Array.from(factorCount.entries())
          .filter(([_, count]) => count >= data.companies.length * 0.5)
          .map(([factor, _]) => factor)
          .slice(0, 3);

        let recommendation = '';
        if (avgRisk > 0.7) {
          recommendation = `CRITICAL: Industry-wide intervention required for ${industry}`;
        } else if (avgRisk > 0.5) {
          recommendation = `HIGH: Implement compliance program for ${industry} cluster`;
        } else {
          recommendation = `MEDIUM: Monitor ${industry} cluster closely`;
        }

        clusters.push({
          clusterId: `cluster-${industry.toLowerCase().replace(/\s+/g, '-')}`,
          clusterName: industry,
          companies: data.companies.map(c => c.domain),
          riskScore: Math.round(avgRisk * 100),
          commonFactors,
          recommendation
        });
      }
    }

    return clusters.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Calculate Value at Risk (VaR)
   */
  calculateVaR(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>,
    confidenceLevel: number = 0.95
  ): { var: number; cvar: number } {
    const avgLoss = 100000;
    const losses: number[] = [];

    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      const expectedLoss = prediction.predictions.next365Days * avgLoss;
      losses.push(expectedLoss);
    }

    if (losses.length === 0) {
      return { var: 0, cvar: 0 };
    }

    // Sort losses
    const sorted = [...losses].sort((a, b) => a - b);

    // Calculate VaR (Value at Risk)
    const varIndex = Math.floor(sorted.length * confidenceLevel);
    const varValue = sorted[varIndex];

    // Calculate CVaR (Conditional Value at Risk) - average of losses beyond VaR
    const cvarLosses = sorted.slice(varIndex);
    const cvarValue = cvarLosses.length > 0
      ? cvarLosses.reduce((sum, val) => sum + val, 0) / cvarLosses.length
      : varValue;

    return {
      var: Math.round(varValue),
      cvar: Math.round(cvarValue)
    };
  }
}

/**
 * Singleton instance
 */
export const riskAggregator = new PortfolioRiskAggregator();
