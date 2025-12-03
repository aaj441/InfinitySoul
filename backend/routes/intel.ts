/**
 * Phase V — Threat Intelligence API Routes
 * Real-time lawsuit monitoring, predictions, and portfolio intelligence
 */

import express, { Request, Response } from 'express';
import { aggregateLawsuitFeeds } from '../intel/lawsuitMonitor/lawsuitFeedAggregator';
import { initializeGrid, enqueueDomains, getGridStatus } from '../intel/autonomousScanner/scanningGridManager';
import { predictLawsuitRisk } from '../intel/prediction/lawsuitPredictionV3';
import { aggregatePortfolioRisk, generateActuarialDataset } from '../intel/portfolio/portfolioRiskAggregator';

const router = express.Router();

// ============================================================================
// Lawsuit Monitoring Endpoints
// ============================================================================

/**
 * GET /api/v1/intel/lawsuits
 * Get latest ADA lawsuit filings
 */
router.get('/lawsuits', async (req: Request, res: Response) => {
  try {
    const { jurisdiction, industry, limit = 50 } = req.query;

    const feeds = await aggregateLawsuitFeeds();
    let filings = feeds.allFilings;

    // Filter by jurisdiction if provided
    if (jurisdiction) {
      filings = filings.filter(
        (f) => f.jurisdiction === (jurisdiction as string).toUpperCase()
      );
    }

    // Filter by industry if provided
    if (industry) {
      filings = filings.filter((f) => f.industry === industry);
    }

    // Sort by date (newest first)
    filings = filings.sort(
      (a, b) => new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime()
    );

    res.status(200).json({
      success: true,
      data: {
        totalCount: filings.length,
        filings: filings.slice(0, parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to fetch lawsuit feed',
    });
  }
});

/**
 * GET /api/v1/intel/plaintiffs
 * Get serial plaintiff profiles and threat levels
 */
router.get('/plaintiffs', async (req: Request, res: Response) => {
  try {
    const { threat_level } = req.query;

    const feeds = await aggregateLawsuitFeeds();
    let plaintiffs = Array.from(feeds.plaintiffs.values());

    // Filter by threat level
    if (threat_level) {
      plaintiffs = plaintiffs.filter(
        (p) => p.threatLevel === threat_level
      );
    }

    // Sort by filing velocity (most active first)
    plaintiffs = plaintiffs.sort((a, b) => b.filingVelocity - a.filingVelocity);

    res.status(200).json({
      success: true,
      data: {
        totalCount: plaintiffs.length,
        plaintiffs: plaintiffs.slice(0, 50),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to fetch plaintiff data',
    });
  }
});

/**
 * GET /api/v1/intel/industry-heatmap
 * Get industry-level litigation risk heatmap
 */
router.get('/industry-heatmap', async (req: Request, res: Response) => {
  try {
    const feeds = await aggregateLawsuitFeeds();
    const heatmap = Array.from(feeds.industryHeatmap.values());

    // Sort by litigation density (highest risk first)
    heatmap.sort((a, b) => b.litigationDensity - a.litigationDensity);

    res.status(200).json({
      success: true,
      data: {
        industries: heatmap,
        timestamp: new Date(),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to generate industry heatmap',
    });
  }
});

/**
 * GET /api/v1/intel/jurisdiction-threats
 * Get jurisdiction-level threat assessment
 */
router.get('/jurisdiction-threats', async (req: Request, res: Response) => {
  try {
    const feeds = await aggregateLawsuitFeeds();
    const hotspots = feeds.jurisdictionHotspots;

    res.status(200).json({
      success: true,
      data: {
        hotspots,
        timestamp: new Date(),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get jurisdiction threats',
    });
  }
});

// ============================================================================
// Lawsuit Prediction Endpoints
// ============================================================================

/**
 * POST /api/v1/intel/predict-lawsuit-risk
 * Predict lawsuit probability for a domain
 */
router.post('/predict-lawsuit-risk', async (req: Request, res: Response) => {
  try {
    const {
      domain,
      companyName,
      industry,
      jurisdiction,
      ccsScore,
      monthlyVisitors,
      estimatedRevenue,
      cmsType,
      violationTrend,
    } = req.body;

    if (!domain || !industry || !jurisdiction || ccsScore === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: domain, industry, jurisdiction, ccsScore',
      });
    }

    // Fetch context data (in production, from database)
    const feeds = await aggregateLawsuitFeeds();

    const company = {
      domain,
      companyName: companyName || domain,
      industry,
      jurisdiction: jurisdiction.toUpperCase(),
      ccsScore,
      monthlyVisitors: monthlyVisitors || 10000,
      estimatedRevenue: estimatedRevenue || 1000000,
      cmsType: cmsType || 'other',
      lastScanDate: new Date(),
      violationTrend: violationTrend || 'stable',
      publicLawsuits: 0,
      knownTargetOfSerialPlaintiff: false,
    };

    const industryData = feeds.industryHeatmap.get(industry);
    const jurisdictionHotspots = feeds.jurisdictionHotspots;
    const plaintiffData = Array.from(feeds.plaintiffs.values()).find(
      (p) => p.preferredIndustries.includes(industry)
    );

    const prediction = predictLawsuitRisk(
      company,
      industryData,
      jurisdictionHotspots[jurisdiction] || {},
      plaintiffData || {}
    );

    res.status(200).json({
      success: true,
      data: {
        domain,
        prediction,
        timestamp: new Date(),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Lawsuit prediction failed',
    });
  }
});

// ============================================================================
// Autonomous Scanning Grid Endpoints
// ============================================================================

/**
 * POST /api/v1/intel/scan-grid/enqueue
 * Add domains to global scanning queue
 */
router.post('/scan-grid/enqueue', (req: Request, res: Response) => {
  try {
    const { domains, priority } = req.body;

    if (!domains || !Array.isArray(domains)) {
      return res.status(400).json({
        success: false,
        error: 'domains must be an array',
      });
    }

    const jobIds = enqueueDomains(domains, priority || 50);

    res.status(202).json({
      success: true,
      data: {
        enqueuedCount: domains.length,
        jobIds,
        message: 'Domains added to global scanning queue',
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to enqueue domains',
    });
  }
});

/**
 * GET /api/v1/intel/scan-grid/status
 * Get global scanning grid status
 */
router.get('/scan-grid/status', (req: Request, res: Response) => {
  try {
    const status = getGridStatus();

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get grid status',
    });
  }
});

// ============================================================================
// Portfolio Intelligence Endpoints
// ============================================================================

/**
 * POST /api/v1/intel/portfolio/analyze
 * Analyze portfolio risk for law firm/insurer
 */
router.post('/portfolio/analyze', (req: Request, res: Response) => {
  try {
    const { portfolioName, clients } = req.body;

    if (!clients || !Array.isArray(clients)) {
      return res.status(400).json({
        success: false,
        error: 'clients must be an array of ClientRiskProfile',
      });
    }

    const metrics = aggregatePortfolioRisk(clients);

    res.status(200).json({
      success: true,
      data: {
        portfolioName: portfolioName || 'Unnamed Portfolio',
        metrics,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Portfolio analysis failed',
    });
  }
});

/**
 * POST /api/v1/intel/portfolio/actuarial
 * Generate actuarial dataset for insurance underwriting
 */
router.post('/portfolio/actuarial', (req: Request, res: Response) => {
  try {
    const { portfolios } = req.body;

    if (!portfolios || !Array.isArray(portfolios)) {
      return res.status(400).json({
        success: false,
        error: 'portfolios must be an array',
      });
    }

    const datasets = generateActuarialDataset(portfolios);

    res.status(200).json({
      success: true,
      data: {
        datasetCount: datasets.length,
        datasets,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Actuarial dataset generation failed',
    });
  }
});

// ============================================================================
// Threat Intelligence Pulse Endpoints
// ============================================================================

/**
 * GET /api/v1/intel/pulse
 * Get real-time global threat intelligence pulse
 */
router.get('/pulse', async (req: Request, res: Response) => {
  try {
    const feeds = await aggregateLawsuitFeeds();

    // Calculate global risk index (0-100)
    const totalFilings = feeds.allFilings.length;
    const criticalPlaintiffs = Array.from(feeds.plaintiffs.values()).filter(
      (p) => p.threatLevel === 'critical'
    ).length;
    const hotJurisdictions = Object.keys(feeds.jurisdictionHotspots).length;

    const globalRiskIndex = Math.round(
      Math.min(
        100,
        (totalFilings * 2 + criticalPlaintiffs * 15 + hotJurisdictions * 10) /
          5
      )
    );

    // Activity level assessment
    const recentFilings = feeds.allFilings.filter((f) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return f.filedDate > thirtyDaysAgo;
    }).length;

    let litigationActivityLevel = 'normal';
    if (recentFilings > 50) {
      litigationActivityLevel = 'surging';
    } else if (recentFilings > 25) {
      litigationActivityLevel = 'elevated';
    } else if (recentFilings < 10) {
      litigationActivityLevel = 'quiet';
    }

    res.status(200).json({
      success: true,
      data: {
        globalRiskIndex,
        litigationActivityLevel,
        totalLawsuits: totalFilings,
        recentFilings30Days: recentFilings,
        activeCriticalPlaintiffs: criticalPlaintiffs,
        jurisdictionHotspots: hotJurisdictions,
        timestamp: new Date(),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get threat intelligence pulse',
    });
  }
});

// ============================================================================
// Health & Status
// ============================================================================

/**
 * GET /api/v1/intel/health
 * Health check for threat intelligence system
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: 'Threat Intelligence Network (Phase V)',
    status: 'operational',
    version: '5.0.0',
    subsystems: {
      lawsuitMonitoring: 'active',
      plaintiffTracking: 'active',
      autonomousScanning: 'active',
      prediction: 'active',
      portfolioIntelligence: 'active',
    },
    timestamp: new Date(),
  });
});

export default router;
