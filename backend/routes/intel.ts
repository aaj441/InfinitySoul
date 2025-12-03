/**
 * Phase V Intelligence API Routes
 *
 * API endpoints for the Autonomous ADA Threat Intelligence Network
 */

import express, { Request, Response } from 'express';
import { fetchPACERFeed } from '../intel/lawsuitMonitor/pacerFeed';
import { plaintiffTracker } from '../intel/lawsuitMonitor/plaintiffTracker';
import { computeIndustryHeatmap } from '../intel/lawsuitMonitor/industryHeatmapBuilder';
import { predictionEngine } from '../intel/prediction/lawsuitPredictionV3';
import { portfolioEngine } from '../intel/portfolio/insurancePortfolioEngine';
import { logger } from '../../utils/logger';

const router = express.Router();

/**
 * GET /api/intel/pacer-feed
 * Fetch recent PACER filings
 */
router.get('/pacer-feed', async (req: Request, res: Response) => {
  try {
    const daysBack = parseInt(req.query.days as string) || 7;
    const filings = await fetchPACERFeed(daysBack);

    res.json({
      success: true,
      count: filings.length,
      filings
    });
  } catch (error) {
    logger.error('Error fetching PACER feed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch PACER feed'
    });
  }
});

/**
 * GET /api/intel/plaintiffs
 * Get serial plaintiff profiles
 */
router.get('/plaintiffs', async (req: Request, res: Response) => {
  try {
    // Fetch recent filings
    const filings = await fetchPACERFeed(90); // Last 90 days

    // Build plaintiff profiles
    plaintiffTracker.buildPlaintiffProfile(filings);

    // Get active serial plaintiffs
    const profiles = plaintiffTracker.getActiveSerialPlaintiffs();

    res.json({
      success: true,
      count: profiles.length,
      plaintiffs: profiles
    });
  } catch (error) {
    logger.error('Error fetching plaintiff profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plaintiff profiles'
    });
  }
});

/**
 * GET /api/intel/heatmap
 * Get industry litigation heatmap
 */
router.get('/heatmap', async (req: Request, res: Response) => {
  try {
    const filings = await fetchPACERFeed(365); // Last year
    const heatmap = computeIndustryHeatmap(filings);

    res.json({
      success: true,
      heatmap
    });
  } catch (error) {
    logger.error('Error generating heatmap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate heatmap'
    });
  }
});

/**
 * POST /api/intel/predict
 * Predict lawsuit risk for a company
 */
router.post('/predict', async (req: Request, res: Response) => {
  try {
    const { domain, companyProfile, features } = req.body;

    if (!domain || !companyProfile || !features) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: domain, companyProfile, features'
      });
    }

    const prediction = predictionEngine.predictSequence(companyProfile, features);

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    logger.error('Error generating prediction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate prediction'
    });
  }
});

/**
 * POST /api/intel/portfolio/analyze
 * Analyze insurance portfolio
 */
router.post('/portfolio/analyze', async (req: Request, res: Response) => {
  try {
    const { companies, predictions } = req.body;

    if (!companies || !predictions) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: companies, predictions'
      });
    }

    // Convert predictions array to Map
    const predictionsMap = new Map(
      Object.entries(predictions).map(([domain, pred]) => [domain, pred as any])
    );

    const assessment = portfolioEngine.analyzePortfolio(companies, predictionsMap);

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    logger.error('Error analyzing portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze portfolio'
    });
  }
});

/**
 * GET /api/intel/risk-atc
 * Get Risk ATC Dashboard data
 */
router.get('/risk-atc', async (req: Request, res: Response) => {
  try {
    // Fetch all required data
    const filings = await fetchPACERFeed(90);

    // Build plaintiff profiles
    plaintiffTracker.buildPlaintiffProfile(filings);
    const plaintiffs = plaintiffTracker.getActiveSerialPlaintiffs();

    // Generate heatmap
    const heatmap = computeIndustryHeatmap(filings);

    // Calculate global risk score (simplified)
    const globalRiskScore = Math.min(
      (filings.length / 100) * 100,
      100
    );

    // Mock forecast data (would use real prediction model)
    const forecast = {
      timeSeriesData: heatmap.timeSeriesData,
      prediction: {
        next30Days: Math.round(heatmap.globalMetrics.avgFilingsPerDay * 30),
        next90Days: Math.round(heatmap.globalMetrics.avgFilingsPerDay * 90),
        next365Days: Math.round(heatmap.globalMetrics.avgFilingsPerDay * 365)
      }
    };

    res.json({
      globalRiskScore: Math.round(globalRiskScore),
      industryHeatmap: heatmap,
      plaintiffs: plaintiffs.slice(0, 10).map(p => ({
        name: p.name,
        totalFilings: p.totalFilings,
        recentActivity: p.recentActivity,
        riskLevel: p.riskLevel,
        targetIndustries: p.targetIndustries.map(i => i.industry)
      })),
      forecast,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Error fetching Risk ATC data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Risk ATC data'
    });
  }
});

export default router;
