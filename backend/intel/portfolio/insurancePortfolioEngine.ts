/**
 * Insurance Portfolio Intelligence Engine
 *
 * Provides insurance-grade risk assessment and portfolio analysis.
 * Enables dynamic premium pricing and loss prediction for insurers.
 */

import { logger } from '../../../utils/logger';
import { LawsuitPrediction } from '../prediction/lawsuitPredictionV3';
import { CompanyProfile } from '../prediction/riskFeatureExtractor';

export interface PortfolioCompany {
  domain: string;
  companyName: string;
  industry: string;
  policyNumber?: string;
  premiumAmount?: number;
  coverageLimit?: number;
  deductible?: number;
  policyStartDate?: Date;
  policyEndDate?: Date;
  claimsHistory?: Array<{
    date: Date;
    amount: number;
    type: string;
    status: 'pending' | 'paid' | 'denied';
  }>;
}

export interface PortfolioRiskAssessment {
  portfolio: {
    totalCompanies: number;
    totalPremiums: number;
    totalCoverageExposure: number;
    avgRiskScore: number;
  };
  riskDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  predictedLosses: {
    next30Days: number;
    next90Days: number;
    next365Days: number;
  };
  topRisks: Array<{
    domain: string;
    companyName: string;
    riskScore: number;
    predictedLoss: number;
    recommendation: string;
  }>;
  industryBreakdown: Array<{
    industry: string;
    companyCount: number;
    avgRiskScore: number;
    predictedLosses: number;
  }>;
  recommendedActions: string[];
  assessmentDate: Date;
}

export interface PremiumRecommendation {
  domain: string;
  currentPremium: number;
  recommendedPremium: number;
  adjustmentReason: string;
  riskFactors: string[];
  confidenceLevel: number;
}

export class InsurancePortfolioEngine {
  /**
   * Analyze entire insurance portfolio
   */
  analyzePortfolio(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>
  ): PortfolioRiskAssessment {
    logger.info(`Analyzing insurance portfolio with ${companies.length} companies`);

    // Calculate portfolio metrics
    const totalCompanies = companies.length;
    const totalPremiums = companies.reduce((sum, c) => sum + (c.premiumAmount || 0), 0);
    const totalCoverageExposure = companies.reduce((sum, c) => sum + (c.coverageLimit || 0), 0);

    // Calculate risk distribution
    const riskDistribution = this.calculateRiskDistribution(companies, predictions);

    // Calculate average risk score
    const avgRiskScore = this.calculateAverageRiskScore(companies, predictions);

    // Predict future losses
    const predictedLosses = this.predictPortfolioLosses(companies, predictions);

    // Identify top risks
    const topRisks = this.identifyTopRisks(companies, predictions);

    // Analyze by industry
    const industryBreakdown = this.analyzeByIndustry(companies, predictions);

    // Generate recommendations
    const recommendedActions = this.generatePortfolioRecommendations(
      riskDistribution,
      topRisks,
      industryBreakdown
    );

    return {
      portfolio: {
        totalCompanies,
        totalPremiums,
        totalCoverageExposure,
        avgRiskScore
      },
      riskDistribution,
      predictedLosses,
      topRisks,
      industryBreakdown,
      recommendedActions,
      assessmentDate: new Date()
    };
  }

  /**
   * Calculate risk distribution across portfolio
   */
  private calculateRiskDistribution(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>
  ) {
    const distribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      distribution[prediction.riskLevel]++;
    }

    return distribution;
  }

  /**
   * Calculate average risk score
   */
  private calculateAverageRiskScore(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>
  ): number {
    let totalScore = 0;
    let count = 0;

    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      // Convert probability to score (0-100)
      const score = prediction.predictions.next365Days * 100;
      totalScore += score;
      count++;
    }

    return count > 0 ? totalScore / count : 0;
  }

  /**
   * Predict portfolio losses
   */
  private predictPortfolioLosses(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>
  ) {
    const avgSettlement = 75000; // Average ADA settlement
    const avgLegalFees = 25000; // Average legal defense cost

    let next30Days = 0;
    let next90Days = 0;
    let next365Days = 0;

    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      const expectedLoss = avgSettlement + avgLegalFees;

      next30Days += prediction.predictions.next30Days * expectedLoss;
      next90Days += prediction.predictions.next90Days * expectedLoss;
      next365Days += prediction.predictions.next365Days * expectedLoss;
    }

    return {
      next30Days: Math.round(next30Days),
      next90Days: Math.round(next90Days),
      next365Days: Math.round(next365Days)
    };
  }

  /**
   * Identify top risk companies
   */
  private identifyTopRisks(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>
  ): PortfolioRiskAssessment['topRisks'] {
    const risks: PortfolioRiskAssessment['topRisks'] = [];

    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      const riskScore = prediction.predictions.next365Days * 100;
      const predictedLoss = prediction.predictions.next365Days * 100000; // Avg loss

      let recommendation = '';
      if (prediction.riskLevel === 'critical') {
        recommendation = 'Immediate intervention required - consider policy exclusion or premium increase';
      } else if (prediction.riskLevel === 'high') {
        recommendation = 'Recommend comprehensive accessibility audit and remediation plan';
      } else if (prediction.riskLevel === 'medium') {
        recommendation = 'Monitor closely and encourage proactive compliance';
      } else {
        recommendation = 'Maintain current coverage';
      }

      risks.push({
        domain: company.domain,
        companyName: company.companyName,
        riskScore,
        predictedLoss,
        recommendation
      });
    }

    // Sort by risk score and return top 10
    return risks
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }

  /**
   * Analyze portfolio by industry
   */
  private analyzeByIndustry(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>
  ): PortfolioRiskAssessment['industryBreakdown'] {
    const industryMap = new Map<string, {
      companies: PortfolioCompany[];
      scores: number[];
      losses: number[];
    }>();

    // Group by industry
    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      const industry = company.industry;
      const data = industryMap.get(industry) || { companies: [], scores: [], losses: [] };

      data.companies.push(company);
      data.scores.push(prediction.predictions.next365Days * 100);
      data.losses.push(prediction.predictions.next365Days * 100000);

      industryMap.set(industry, data);
    }

    // Calculate metrics for each industry
    const breakdown: PortfolioRiskAssessment['industryBreakdown'] = [];

    for (const [industry, data] of industryMap.entries()) {
      const avgRiskScore = data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length;
      const predictedLosses = data.losses.reduce((sum, l) => sum + l, 0);

      breakdown.push({
        industry,
        companyCount: data.companies.length,
        avgRiskScore: Math.round(avgRiskScore),
        predictedLosses: Math.round(predictedLosses)
      });
    }

    return breakdown.sort((a, b) => b.avgRiskScore - a.avgRiskScore);
  }

  /**
   * Generate portfolio-level recommendations
   */
  private generatePortfolioRecommendations(
    riskDistribution: PortfolioRiskAssessment['riskDistribution'],
    topRisks: PortfolioRiskAssessment['topRisks'],
    industryBreakdown: PortfolioRiskAssessment['industryBreakdown']
  ): string[] {
    const recommendations: string[] = [];

    // Risk distribution analysis
    const totalCompanies = Object.values(riskDistribution).reduce((sum, val) => sum + val, 0);
    const criticalPct = (riskDistribution.critical / totalCompanies) * 100;
    const highPct = (riskDistribution.high / totalCompanies) * 100;

    if (criticalPct > 10) {
      recommendations.push(
        `URGENT: ${riskDistribution.critical} companies (${criticalPct.toFixed(1)}%) at critical risk - immediate portfolio review required`
      );
    }

    if (highPct > 20) {
      recommendations.push(
        `WARNING: ${riskDistribution.high} companies (${highPct.toFixed(1)}%) at high risk - consider systematic intervention program`
      );
    }

    // Top risks analysis
    if (topRisks.length > 0) {
      const totalPredictedLoss = topRisks.reduce((sum, r) => sum + r.predictedLoss, 0);
      recommendations.push(
        `Top 10 risks account for $${(totalPredictedLoss / 1000000).toFixed(2)}M in predicted losses`
      );
    }

    // Industry concentration risk
    const topIndustry = industryBreakdown[0];
    if (topIndustry && topIndustry.companyCount > totalCompanies * 0.3) {
      recommendations.push(
        `Industry concentration risk: ${topIndustry.companyCount} companies in ${topIndustry.industry} (consider diversification)`
      );
    }

    // High-risk industry
    if (topIndustry && topIndustry.avgRiskScore > 70) {
      recommendations.push(
        `${topIndustry.industry} industry showing elevated risk (avg score: ${topIndustry.avgRiskScore}) - recommend industry-wide intervention`
      );
    }

    // General recommendations
    if (riskDistribution.critical > 0 || riskDistribution.high > 5) {
      recommendations.push(
        'Recommend implementing automated compliance monitoring for high-risk policies'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Portfolio risk within acceptable parameters - maintain current oversight');
    }

    return recommendations;
  }

  /**
   * Calculate recommended premium adjustments
   */
  calculatePremiumRecommendations(
    companies: PortfolioCompany[],
    predictions: Map<string, LawsuitPrediction>,
    basePremiumRate: number = 5000 // Base annual premium
  ): PremiumRecommendation[] {
    const recommendations: PremiumRecommendation[] = [];

    for (const company of companies) {
      const prediction = predictions.get(company.domain);
      if (!prediction) continue;

      const currentPremium = company.premiumAmount || basePremiumRate;

      // Calculate risk-adjusted premium
      const riskMultiplier = 1 + (prediction.predictions.next365Days * 2); // Max 3x for 100% probability
      const recommendedPremium = Math.round(basePremiumRate * riskMultiplier);

      // Determine adjustment reason
      let adjustmentReason = '';
      const adjustment = ((recommendedPremium - currentPremium) / currentPremium) * 100;

      if (Math.abs(adjustment) < 10) {
        adjustmentReason = 'Risk profile matches current premium';
      } else if (adjustment > 0) {
        adjustmentReason = `Risk increased - recommend ${adjustment.toFixed(0)}% premium increase`;
      } else {
        adjustmentReason = `Risk decreased - recommend ${Math.abs(adjustment).toFixed(0)}% premium reduction`;
      }

      // Extract risk factors
      const riskFactors = prediction.topRiskFactors.map(f => f.factor);

      recommendations.push({
        domain: company.domain,
        currentPremium,
        recommendedPremium,
        adjustmentReason,
        riskFactors,
        confidenceLevel: prediction.confidenceScore
      });
    }

    return recommendations.sort((a, b) => b.recommendedPremium - a.recommendedPremium);
  }

  /**
   * Generate actuarial report
   */
  generateActuarialReport(assessment: PortfolioRiskAssessment): string {
    const report = `
# Insurance Portfolio Actuarial Report
Generated: ${assessment.assessmentDate.toISOString()}

## Portfolio Summary
- Total Companies: ${assessment.portfolio.totalCompanies}
- Total Premiums: $${(assessment.portfolio.totalPremiums / 1000000).toFixed(2)}M
- Total Coverage Exposure: $${(assessment.portfolio.totalCoverageExposure / 1000000).toFixed(2)}M
- Average Risk Score: ${assessment.portfolio.avgRiskScore.toFixed(1)}/100

## Risk Distribution
- Critical Risk: ${assessment.riskDistribution.critical} companies
- High Risk: ${assessment.riskDistribution.high} companies
- Medium Risk: ${assessment.riskDistribution.medium} companies
- Low Risk: ${assessment.riskDistribution.low} companies

## Predicted Losses
- Next 30 Days: $${(assessment.predictedLosses.next30Days / 1000).toFixed(0)}K
- Next 90 Days: $${(assessment.predictedLosses.next90Days / 1000).toFixed(0)}K
- Next 12 Months: $${(assessment.predictedLosses.next365Days / 1000000).toFixed(2)}M

## Loss Ratio Projection
- Expected Loss Ratio: ${((assessment.predictedLosses.next365Days / assessment.portfolio.totalPremiums) * 100).toFixed(1)}%

## Top Recommended Actions
${assessment.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

---
Report generated by InfinitySoul Phase V Insurance Portfolio Intelligence Engine
`.trim();

    return report;
  }
}

/**
 * Singleton instance
 */
export const portfolioEngine = new InsurancePortfolioEngine();
