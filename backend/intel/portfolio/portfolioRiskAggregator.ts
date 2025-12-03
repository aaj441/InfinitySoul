/**
 * Phase V — Insurance Portfolio Intelligence Engine
 * Risk aggregation for law firms, insurers, and agencies managing multiple clients
 */

export interface ClientRiskProfile {
  domain: string;
  companyName: string;
  ccsScore: number;
  litigationProbability90Days: number;
  expectedExposure: number;
  industry: string;
  jurisdiction: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface PortfolioMetrics {
  clientCount: number;
  totalExposure: number;
  averageCCSScore: number;
  averageLitigationProbability: number;

  // Risk distribution
  criticalRiskClients: number;
  highRiskClients: number;
  mediumRiskClients: number;
  lowRiskClients: number;

  // Clustered risks
  litigationClusterRisk: boolean;
  jurisdictionHotspots: Record<string, number>;
  industryHotspots: Record<string, number>;

  // Predictive metrics
  expectedClaimsPerYear: number;
  expectedTotalClaims: number;
  recommendedInsurancePremium: number;
  lossReductionOpportunity: number;

  // Client prioritization
  urgentRemediationClients: ClientRiskProfile[];
  highestExposureClients: ClientRiskProfile[];
}

/**
 * Aggregate portfolio risk metrics
 */
export function aggregatePortfolioRisk(
  clients: ClientRiskProfile[]
): PortfolioMetrics {
  if (clients.length === 0) {
    return {
      clientCount: 0,
      totalExposure: 0,
      averageCCSScore: 0,
      averageLitigationProbability: 0,
      criticalRiskClients: 0,
      highRiskClients: 0,
      mediumRiskClients: 0,
      lowRiskClients: 0,
      litigationClusterRisk: false,
      jurisdictionHotspots: {},
      industryHotspots: {},
      expectedClaimsPerYear: 0,
      expectedTotalClaims: 0,
      recommendedInsurancePremium: 0,
      lossReductionOpportunity: 0,
      urgentRemediationClients: [],
      highestExposureClients: [],
    };
  }

  // Basic metrics
  const clientCount = clients.length;
  const totalExposure = clients.reduce((sum, c) => sum + c.expectedExposure, 0);
  const averageCCSScore = Math.round(
    clients.reduce((sum, c) => sum + c.ccsScore, 0) / clientCount
  );
  const averageLitigationProbability =
    clients.reduce((sum, c) => sum + c.litigationProbability90Days, 0) /
    clientCount;

  // Risk distribution
  const riskDistribution = {
    critical: clients.filter((c) => c.riskLevel === 'critical').length,
    high: clients.filter((c) => c.riskLevel === 'high').length,
    medium: clients.filter((c) => c.riskLevel === 'medium').length,
    low: clients.filter((c) => c.riskLevel === 'low').length,
  };

  // Detect jurisdiction hotspots (multiple high-risk clients in same state)
  const jurisdictionMap: Record<string, ClientRiskProfile[]> = {};
  for (const client of clients) {
    if (!jurisdictionMap[client.jurisdiction]) {
      jurisdictionMap[client.jurisdiction] = [];
    }
    jurisdictionMap[client.jurisdiction].push(client);
  }

  const jurisdictionHotspots: Record<string, number> = {};
  for (const [jurisdiction, jurisdictionClients] of Object.entries(
    jurisdictionMap
  )) {
    const highRiskCount = jurisdictionClients.filter(
      (c) => c.riskLevel === 'critical' || c.riskLevel === 'high'
    ).length;
    if (highRiskCount >= 3) {
      jurisdictionHotspots[jurisdiction] = highRiskCount;
    }
  }

  // Detect industry hotspots
  const industryMap: Record<string, ClientRiskProfile[]> = {};
  for (const client of clients) {
    if (!industryMap[client.industry]) {
      industryMap[client.industry] = [];
    }
    industryMap[client.industry].push(client);
  }

  const industryHotspots: Record<string, number> = {};
  for (const [industry, industryClients] of Object.entries(industryMap)) {
    const avgRisk =
      industryClients.reduce(
        (sum, c) => sum + c.litigationProbability90Days,
        0
      ) / industryClients.length;
    if (avgRisk > 0.25) {
      industryHotspots[industry] = Math.round(avgRisk * 100);
    }
  }

  // Litigation cluster risk
  const litigationClusterRisk =
    Object.keys(jurisdictionHotspots).length > 0 ||
    Object.keys(industryHotspots).length > 0;

  // Expected claims per year
  const expectedClaimsPerYear = clients.reduce(
    (sum, c) => sum + c.litigationProbability90Days * (365 / 90),
    0
  );

  // Expected total claims
  const expectedTotalClaims = Math.round(
    expectedClaimsPerYear *
      (clients.reduce((sum, c) => sum + c.expectedExposure, 0) / clientCount)
  );

  // Insurance premium recommendation
  // Base: 1.5x expected claims + 20% for admin/profit
  const baseInsurancePremium = Math.round(expectedTotalClaims * 1.5 * 1.2);

  // Adjustment based on cluster risk
  const premiumAdjustment = litigationClusterRisk ? 1.3 : 1.0;
  const recommendedInsurancePremium = Math.round(
    baseInsurancePremium * premiumAdjustment
  );

  // Loss reduction opportunity
  // If all clients improved by 1 grade, how much exposure would decrease?
  const potentialReduction = clients.filter((c) => c.ccsScore < 750).length;
  const lossReductionOpportunity = Math.round(
    (potentialReduction / clientCount) * 100
  );

  // Urgent remediation: clients in critical risk
  const urgentRemediationClients = clients
    .filter((c) => c.riskLevel === 'critical')
    .sort((a, b) => b.expectedExposure - a.expectedExposure)
    .slice(0, 10);

  // Highest exposure clients
  const highestExposureClients = clients
    .sort((a, b) => b.expectedExposure - a.expectedExposure)
    .slice(0, 10);

  return {
    clientCount,
    totalExposure: Math.round(totalExposure),
    averageCCSScore,
    averageLitigationProbability,
    criticalRiskClients: riskDistribution.critical,
    highRiskClients: riskDistribution.high,
    mediumRiskClients: riskDistribution.medium,
    lowRiskClients: riskDistribution.low,
    litigationClusterRisk,
    jurisdictionHotspots,
    industryHotspots,
    expectedClaimsPerYear,
    expectedTotalClaims,
    recommendedInsurancePremium,
    lossReductionOpportunity,
    urgentRemediationClients,
    highestExposureClients,
  };
}

/**
 * Generate actuarial dataset for insurance underwriting
 * Insurers use this to price policies and manage claims
 */
export function generateActuarialDataset(
  portfolios: Array<{ name: string; clients: ClientRiskProfile[] }>
) {
  const datasets = portfolios.map((portfolio) => {
    const metrics = aggregatePortfolioRisk(portfolio.clients);

    return {
      portfolioName: portfolio.name,
      metrics,
      actuarialData: {
        // Claims frequency
        expectedClaimsPerYear: metrics.expectedClaimsPerYear,
        claimProbabilityDistribution: {
          zero: Math.pow(1 - metrics.averageLitigationProbability, 365 / 90),
          one:
            (365 / 90) *
            metrics.averageLitigationProbability *
            Math.pow(1 - metrics.averageLitigationProbability, 365 / 90 - 1),
          multiple: 1 -
            Math.pow(1 - metrics.averageLitigationProbability, 365 / 90) -
            ((365 / 90) *
              metrics.averageLitigationProbability *
              Math.pow(1 - metrics.averageLitigationProbability, 365 / 90 - 1)),
        },

        // Loss severity
        expectedClaimValue: Math.round(
          metrics.expectedTotalClaims / (metrics.expectedClaimsPerYear || 1)
        ),
        claimSeverityDistribution: {
          low: 0.3,
          medium: 0.4,
          high: 0.2,
          catastrophic: 0.1,
        },

        // Risk premium calculation
        basePremiumPerClient: Math.round(
          metrics.recommendedInsurancePremium / metrics.clientCount
        ),
        riskLoadingFactor: litigationClusterRisk ? 1.3 : 1.0,
        profitMargin: 0.2,

        // Retention and deductible recommendations
        recommendedDeductible: Math.round(
          metrics.expectedTotalClaims * 0.1
        ),
        recommendedRetention: Math.round(
          metrics.expectedTotalClaims * 0.25
        ),

        // Loss control opportunities
        lossReductionStrategies: [
          {
            strategy: 'Remediate critical clients',
            targetClients: metrics.urgentRemediationClients.length,
            expectedSavings: Math.round(
              metrics.expectedTotalClaims * 0.3
            ),
          },
          {
            strategy: 'Improve jurisdiction hotspots',
            targetJurisdictions: Object.keys(metrics.jurisdictionHotspots)
              .length,
            expectedSavings: Math.round(
              metrics.expectedTotalClaims * 0.15
            ),
          },
        ],
      },
    };
  });

  return datasets;
}

/**
 * Risk trending analysis
 * Compare portfolio risk over time
 */
export function analyzeRiskTrending(
  baselineMetrics: PortfolioMetrics,
  currentMetrics: PortfolioMetrics
) {
  const ccsScoreTrend =
    ((currentMetrics.averageCCSScore - baselineMetrics.averageCCSScore) /
      baselineMetrics.averageCCSScore) *
    100;

  const probabilityTrend =
    ((currentMetrics.averageLitigationProbability -
      baselineMetrics.averageLitigationProbability) /
      baselineMetrics.averageLitigationProbability) *
    100;

  const exposureTrend =
    ((currentMetrics.totalExposure - baselineMetrics.totalExposure) /
      baselineMetrics.totalExposure) *
    100;

  return {
    ccsScoreTrend: ccsScoreTrend.toFixed(1) + '%',
    ccsScoreImproving: ccsScoreTrend > 0,
    probabilityTrend: probabilityTrend.toFixed(1) + '%',
    probabilityImproving: probabilityTrend < 0,
    exposureTrend: exposureTrend.toFixed(1) + '%',
    exposureImproving: exposureTrend < 0,
    criticalClientsReduction:
      baselineMetrics.criticalRiskClients -
      currentMetrics.criticalRiskClients,
    overallRiskDirection:
      ccsScoreTrend > 0 && probabilityTrend < 0 ? 'improving' : 'worsening',
  };
}

export default {
  aggregatePortfolioRisk,
  generateActuarialDataset,
  analyzeRiskTrending,
};
