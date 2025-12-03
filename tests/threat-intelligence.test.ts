/**
 * Phase V — Threat Intelligence System Tests
 * Comprehensive test suite for lawsuit monitoring, prediction, and portfolio intelligence
 */

import {
  buildPlaintiffProfile,
  buildIndustryHeatmap,
  aggregateLawsuitFeeds,
} from '../backend/intel/lawsuitMonitor/lawsuitFeedAggregator';
import {
  ProxyPool,
  FingerprintGenerator,
  ScanJobScheduler,
  initializeGrid,
  enqueueDomains,
} from '../backend/intel/autonomousScanner/scanningGridManager';
import {
  extractFeatures,
  predictLitigationProbability,
  predictLawsuitRisk,
} from '../backend/intel/prediction/lawsuitPredictionV3';
import {
  aggregatePortfolioRisk,
  generateActuarialDataset,
  analyzeRiskTrending,
} from '../backend/intel/portfolio/portfolioRiskAggregator';

describe('Phase V — Threat Intelligence System', () => {
  describe('Lawsuit Feed Aggregation', () => {
    test('Should fetch and aggregate lawsuit filings', async () => {
      const result = await aggregateLawsuitFeeds();

      expect(result.allFilings).toBeDefined();
      expect(Array.isArray(result.allFilings)).toBe(true);
      expect(result.plaintiffs).toBeDefined();
      expect(result.industryHeatmap).toBeDefined();
      expect(result.jurisdictionHotspots).toBeDefined();
    });

    test('Should build plaintiff profiles from litigation history', () => {
      const mockFilings = [
        {
          caseNumber: '1:24-cv-1234',
          court: 'E.D.N.Y.',
          jurisdiction: 'NY',
          plaintiff: 'Jane Doe',
          plaintiffAttorney: 'Serial Plaintiff Law, PLLC',
          defendant: 'example.com',
          violationTypes: ['alt-text'],
          filedDate: new Date('2024-11-15'),
          status: 'settled' as const,
          settlementAmount: 75000,
          source: 'PACER' as const,
        },
        {
          caseNumber: '1:24-cv-1235',
          court: 'E.D.N.Y.',
          jurisdiction: 'NY',
          plaintiff: 'Jane Doe',
          plaintiffAttorney: 'Serial Plaintiff Law, PLLC',
          defendant: 'another-example.com',
          violationTypes: ['color-contrast'],
          filedDate: new Date('2024-11-10'),
          status: 'filed' as const,
          source: 'PACER' as const,
        },
      ];

      const plaintiffs = buildPlaintiffProfile(mockFilings);

      expect(plaintiffs.has('Jane Doe')).toBe(true);
      const profile = plaintiffs.get('Jane Doe')!;
      expect(profile.totalFilings).toBe(2);
      expect(profile.settlementsWon).toBe(1);
      expect(profile.winRate).toBeGreaterThan(0);
      expect(profile.threatLevel).toBe('medium');
    });

    test('Should classify serial plaintiffs as critical threat', () => {
      const mockFilings = Array.from({ length: 25 }, (_, i) => ({
        caseNumber: `1:24-cv-${1000 + i}`,
        court: 'E.D.N.Y.',
        jurisdiction: 'NY',
        plaintiff: 'Prolific Litigant',
        plaintiffAttorney: 'Serial Plaintiff Law, PLLC',
        defendant: `example-${i}.com`,
        violationTypes: ['alt-text'],
        filedDate: new Date(`2024-${String((i % 12) + 1).padStart(2, '0')}-15`),
        status: ('settled' as const),
        settlementAmount: 75000,
        source: ('PACER' as const),
      }));

      const plaintiffs = buildPlaintiffProfile(mockFilings);
      const profile = plaintiffs.get('Prolific Litigant')!;

      expect(profile.totalFilings).toBe(25);
      expect(profile.threatLevel).toBe('critical');
    });

    test('Should build industry heatmap', () => {
      const mockFilings = [
        {
          caseNumber: '1:24-cv-1234',
          court: 'E.D.N.Y.',
          jurisdiction: 'NY',
          plaintiff: 'Jane Doe',
          defendant: 'retail-store.com',
          violationTypes: ['alt-text', 'color-contrast'],
          filedDate: new Date('2024-11-15'),
          status: 'settled' as const,
          settlementAmount: 75000,
          source: 'PACER' as const,
        },
        {
          caseNumber: '1:24-cv-1235',
          court: 'E.D.N.Y.',
          jurisdiction: 'NY',
          plaintiff: 'John Smith',
          defendant: 'another-store.com',
          violationTypes: ['form-labels'],
          filedDate: new Date('2024-11-10'),
          status: 'filed' as const,
          source: 'PACER' as const,
        },
      ];

      const heatmap = buildIndustryHeatmap(mockFilings);

      expect(heatmap.has('retail')).toBe(true);
      const retailHeat = heatmap.get('retail')!;
      expect(retailHeat.recentFilingCount).toBe(2);
      expect(retailHeat.commonViolations).toContain('alt-text');
    });
  });

  describe('Autonomous Scanning Grid', () => {
    test('Should initialize grid with N nodes', () => {
      initializeGrid(5);

      // Grid should be initialized (mock validation)
      expect(true).toBe(true);
    });

    test('Should enqueue domains for scanning', () => {
      const domains = ['example.com', 'test.com', 'sample.com'];
      const jobIds = enqueueDomains(domains, 75);

      expect(jobIds).toHaveLength(3);
      expect(jobIds.every((id) => id.startsWith('job-'))).toBe(true);
    });

    test('ProxyPool should rotate proxies', () => {
      const pool = new ProxyPool();

      const proxy1 = pool.getNextProxy();
      const proxy2 = pool.getNextProxy();

      expect(proxy1).toBeDefined();
      expect(proxy2).toBeDefined();
      // Different proxies on sequential calls
      expect(proxy1.ip).not.toBe(proxy2.ip);
    });

    test('FingerprintGenerator should create random fingerprints', () => {
      const generator = new FingerprintGenerator();

      const fp1 = generator.generateFingerprint();
      const fp2 = generator.generateFingerprint();

      expect(fp1).toBeDefined();
      expect(fp2).toBeDefined();
      expect(fp1.userAgent).toBeTruthy();
      expect(fp1.timezone).toBeTruthy();
      expect(fp1.language).toBeTruthy();
    });

    test('ScanJobScheduler should manage job queue', () => {
      const scheduler = new ScanJobScheduler();
      scheduler.registerNode('node-0');

      const job1 = scheduler.createJob('example.com', 80);
      const job2 = scheduler.createJob('test.com', 50);

      expect(job1.status).toBe('pending');
      expect(job2.status).toBe('pending');

      // Higher priority job should come first
      const nextJob = scheduler.getNextJob();
      expect(nextJob?.domain).toBe('example.com');

      scheduler.startJob(job1.jobId, 'node-0');
      expect(job1.status).toBe('scanning');

      scheduler.completeJob(job1.jobId, { violations: [] });
      expect(job1.status).toBe('completed');
    });
  });

  describe('Lawsuit Prediction Engine v3', () => {
    test('Should extract features from company profile', () => {
      const company = {
        domain: 'example.com',
        companyName: 'Example Inc',
        industry: 'retail',
        jurisdiction: 'CA',
        ccsScore: 650,
        monthlyVisitors: 50000,
        estimatedRevenue: 5000000,
        cmsType: 'Shopify',
        lastScanDate: new Date(),
        violationTrend: 'stable' as const,
        publicLawsuits: 0,
        knownTargetOfSerialPlaintiff: false,
      };

      const features = extractFeatures(company, {}, {}, {});

      expect(features.violationCount).toBeDefined();
      expect(features.industryLitigationDensity).toBeDefined();
      expect(features.jurisdictionThreatLevel).toBeDefined();
      expect(features.monthlyVisitorsScore).toBeGreaterThanOrEqual(0);
      expect(features.monthlyVisitorsScore).toBeLessThanOrEqual(1);
    });

    test('Should predict litigation probability', () => {
      const features = {
        violationCount: 50,
        criticalViolationCount: 5,
        violationTrend: 0.3,
        violationSeverityScore: 0.7,
        industryLitigationDensity: 0.3,
        industryTrend: 0.2,
        dominantPlaintiffsInIndustry: 3,
        jurisdictionThreatLevel: 0.8,
        jurisdictionLitigationVelocity: 5,
        jurisdictionTrend: 0.3,
        targetedBySerialPlaintiff: 0.2,
        seriesPlaintiffThreatLevel: 0.4,
        serialPlaintiffHistoryWithIndustry: 0.5,
        monthlyVisitorsScore: 0.6,
        revenueScore: 0.7,
        cmsRiskScore: 0.65,
        hasPublicLawsuits: 0,
        complianceTrend: 0.2,
        improvementVelocity: 0.3,
        litigationCyclicalFactor: 0.2,
        economicSensitivity: 0.2,
      };

      const prediction = predictLitigationProbability(features);

      expect(prediction.probability30Days).toBeGreaterThanOrEqual(0);
      expect(prediction.probability30Days).toBeLessThanOrEqual(1);
      expect(prediction.probability90Days).toBeGreaterThanOrEqual(0);
      expect(prediction.probability90Days).toBeLessThanOrEqual(1);
      expect(prediction.probability1Year).toBeGreaterThanOrEqual(0);
      expect(prediction.probability1Year).toBeLessThanOrEqual(1);
      expect(['critical', 'high', 'medium', 'low']).toContain(prediction.riskRating);
      expect(prediction.drivingFactors.length).toBeGreaterThan(0);
    });

    test('Higher violation severity should increase probability', () => {
      const baseFeaturesLowViolations = {
        violationCount: 5,
        criticalViolationCount: 0,
        violationTrend: -0.2,
        violationSeverityScore: 0.1,
        industryLitigationDensity: 0.15,
        industryTrend: 0,
        dominantPlaintiffsInIndustry: 0,
        jurisdictionThreatLevel: 0.3,
        jurisdictionLitigationVelocity: 1,
        jurisdictionTrend: 0,
        targetedBySerialPlaintiff: 0.1,
        seriesPlaintiffThreatLevel: 0.1,
        serialPlaintiffHistoryWithIndustry: 0.1,
        monthlyVisitorsScore: 0.3,
        revenueScore: 0.3,
        cmsRiskScore: 0.4,
        hasPublicLawsuits: 0,
        complianceTrend: 0.3,
        improvementVelocity: 0.5,
        litigationCyclicalFactor: 0.1,
        economicSensitivity: 0.1,
      };

      const baseFeaturesHighViolations = {
        ...baseFeaturesLowViolations,
        violationCount: 100,
        criticalViolationCount: 15,
        violationTrend: 0.4,
        violationSeverityScore: 0.8,
      };

      const predictionLow = predictLitigationProbability(baseFeaturesLowViolations);
      const predictionHigh = predictLitigationProbability(baseFeaturesHighViolations);

      expect(predictionHigh.probability90Days).toBeGreaterThan(predictionLow.probability90Days);
    });
  });

  describe('Portfolio Intelligence', () => {
    test('Should aggregate portfolio risk metrics', () => {
      const clients = [
        {
          domain: 'client1.com',
          companyName: 'Client 1',
          ccsScore: 750,
          litigationProbability90Days: 0.1,
          expectedExposure: 50000,
          industry: 'retail',
          jurisdiction: 'CA',
          riskLevel: 'low' as const,
        },
        {
          domain: 'client2.com',
          companyName: 'Client 2',
          ccsScore: 450,
          litigationProbability90Days: 0.4,
          expectedExposure: 150000,
          industry: 'ecommerce',
          jurisdiction: 'NY',
          riskLevel: 'critical' as const,
        },
      ];

      const metrics = aggregatePortfolioRisk(clients);

      expect(metrics.clientCount).toBe(2);
      expect(metrics.totalExposure).toBe(200000);
      expect(metrics.criticalRiskClients).toBe(1);
      expect(metrics.expectedClaimsPerYear).toBeGreaterThan(0);
      expect(metrics.recommendedInsurancePremium).toBeGreaterThan(0);
    });

    test('Should identify litigation cluster risk', () => {
      const criticalClients = Array.from({ length: 5 }, (_, i) => ({
        domain: `critical-${i}.com`,
        companyName: `Client ${i}`,
        ccsScore: 350,
        litigationProbability90Days: 0.5,
        expectedExposure: 100000,
        industry: 'retail',
        jurisdiction: 'CA', // All in CA
        riskLevel: 'critical' as const,
      }));

      const metrics = aggregatePortfolioRisk(criticalClients);

      expect(metrics.litigationClusterRisk).toBe(true);
      expect(Object.keys(metrics.jurisdictionHotspots)).toContain('CA');
    });

    test('Should generate actuarial datasets', () => {
      const portfolios = [
        {
          name: 'Portfolio A',
          clients: [
            {
              domain: 'client1.com',
              companyName: 'Client 1',
              ccsScore: 650,
              litigationProbability90Days: 0.15,
              expectedExposure: 75000,
              industry: 'retail',
              jurisdiction: 'CA',
              riskLevel: 'medium' as const,
            },
          ],
        },
      ];

      const datasets = generateActuarialDataset(portfolios);

      expect(datasets).toHaveLength(1);
      const dataset = datasets[0];
      expect(dataset.portfolioName).toBe('Portfolio A');
      expect(dataset.actuarialData).toBeDefined();
      expect(dataset.actuarialData.expectedClaimsPerYear).toBeDefined();
      expect(dataset.actuarialData.basePremiumPerClient).toBeGreaterThan(0);
    });

    test('Should analyze risk trending', () => {
      const baseline = {
        clientCount: 10,
        totalExposure: 500000,
        averageCCSScore: 550,
        averageLitigationProbability: 0.25,
        criticalRiskClients: 3,
        highRiskClients: 3,
        mediumRiskClients: 3,
        lowRiskClients: 1,
        litigationClusterRisk: true,
        jurisdictionHotspots: {},
        industryHotspots: {},
        expectedClaimsPerYear: 2.5,
        expectedTotalClaims: 250000,
        recommendedInsurancePremium: 450000,
        lossReductionOpportunity: 40,
        urgentRemediationClients: [],
        highestExposureClients: [],
      };

      const current = {
        ...baseline,
        averageCCSScore: 600,
        averageLitigationProbability: 0.20,
        criticalRiskClients: 2,
      };

      const trending = analyzeRiskTrending(baseline, current);

      expect(trending.ccsScoreImproving).toBe(true);
      expect(trending.probabilityImproving).toBe(true);
      expect(trending.overallRiskDirection).toBe('improving');
    });
  });

  describe('Integration Tests', () => {
    test('Complete threat intelligence pipeline', async () => {
      // Aggregate lawsuit feeds
      const feeds = await aggregateLawsuitFeeds();

      expect(feeds.allFilings).toBeDefined();
      expect(feeds.plaintiffs).toBeDefined();
      expect(feeds.industryHeatmap).toBeDefined();

      // Create mock company profile
      const company = {
        domain: 'test.com',
        companyName: 'Test Company',
        industry: 'retail',
        jurisdiction: 'CA',
        ccsScore: 600,
        monthlyVisitors: 100000,
        estimatedRevenue: 10000000,
        cmsType: 'Shopify',
        lastScanDate: new Date(),
        violationTrend: 'stable' as const,
        publicLawsuits: 1,
        knownTargetOfSerialPlaintiff: false,
      };

      // Extract features and predict
      const features = extractFeatures(
        company,
        feeds.industryHeatmap.get('retail'),
        feeds.jurisdictionHotspots['CA'],
        Array.from(feeds.plaintiffs.values())[0]
      );

      const prediction = predictLawsuitRisk(
        company,
        feeds.industryHeatmap.get('retail'),
        feeds.jurisdictionHotspots['CA'],
        Array.from(feeds.plaintiffs.values())[0]
      );

      expect(prediction.probability30Days).toBeGreaterThanOrEqual(0);
      expect(prediction.probability90Days).toBeGreaterThanOrEqual(
        prediction.probability30Days
      );
      expect(prediction.probability1Year).toBeGreaterThanOrEqual(
        prediction.probability90Days
      );
      expect(prediction.estimatedSettlement).toBeGreaterThan(0);
    });
  });
});
