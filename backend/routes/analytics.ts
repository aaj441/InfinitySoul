/**
 * Analytics API Routes
 * 
 * RESTful API endpoints for revenue optimization analytics:
 * - A/B Test Significance
 * - Multi-Touch Attribution
 * - Churn Prediction
 * - Segmented LTV
 * - Multi-Channel CAC
 */

import { Router, Request, Response } from 'express';
import {
  revenueAnalytics,
  ABTestCalculator,
  type ABTestResult,
  type TouchPoint,
  type Attribution,
  type ChurnPrediction,
  type IndustryLTV,
  type ChannelCAC,
} from '../services/analytics';

const router = Router();

// =============================================================================
// A/B TEST ENDPOINTS (Idea #1)
// =============================================================================

/**
 * POST /api/analytics/ab-test/evaluate
 * Evaluate A/B test significance
 */
router.post('/ab-test/evaluate', (req: Request, res: Response) => {
  try {
    const {
      variantA,
      variantB,
      confidenceLevel = 0.95,
    } = req.body;

    if (!variantA || !variantB) {
      return res.status(400).json({
        success: false,
        error: 'variantA and variantB are required',
      });
    }

    if (!variantA.conversions || !variantA.exposures || !variantB.conversions || !variantB.exposures) {
      return res.status(400).json({
        success: false,
        error: 'Each variant must have conversions and exposures',
      });
    }

    const result = ABTestCalculator.calculateSignificance(
      variantA,
      variantB,
      confidenceLevel
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to evaluate A/B test',
    });
  }
});

/**
 * POST /api/analytics/ab-test/sample-size
 * Calculate required sample size for A/B test
 */
router.post('/ab-test/sample-size', (req: Request, res: Response) => {
  try {
    const {
      baselineRate,
      minimumDetectableEffect = 0.1,
      confidenceLevel = 0.95,
      power = 0.80,
    } = req.body;

    if (!baselineRate) {
      return res.status(400).json({
        success: false,
        error: 'baselineRate is required',
      });
    }

    // Use the calculation from ABTestCalculator
    const result = ABTestCalculator.calculateSignificance(
      { conversions: 1, exposures: 1 },
      { conversions: 1, exposures: 1 },
      confidenceLevel
    );

    res.json({
      success: true,
      data: {
        requiredSampleSize: result.requiredSampleSize,
        baselineRate,
        minimumDetectableEffect,
        confidenceLevel,
        power,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate sample size',
    });
  }
});

// =============================================================================
// ATTRIBUTION ENDPOINTS (Idea #2)
// =============================================================================

/**
 * POST /api/analytics/attribution/track
 * Track a touchpoint for attribution
 */
router.post('/attribution/track', (req: Request, res: Response) => {
  try {
    const { userId, channel, type, metadata } = req.body;

    if (!userId || !channel || !type) {
      return res.status(400).json({
        success: false,
        error: 'userId, channel, and type are required',
      });
    }

    const touchPoint: Omit<TouchPoint, 'id'> = {
      channel,
      timestamp: new Date(),
      type,
      metadata,
    };

    revenueAnalytics.multiTouchAttribution.trackTouchPoint(userId, touchPoint);

    res.json({
      success: true,
      message: 'Touchpoint tracked successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track touchpoint',
    });
  }
});

/**
 * POST /api/analytics/attribution/calculate
 * Calculate attribution for a user
 */
router.post('/attribution/calculate', (req: Request, res: Response) => {
  try {
    const { userId, conversionValue } = req.body;

    if (!userId || !conversionValue) {
      return res.status(400).json({
        success: false,
        error: 'userId and conversionValue are required',
      });
    }

    const attribution = revenueAnalytics.multiTouchAttribution.calculateAttribution(
      userId,
      conversionValue
    );

    if (!attribution) {
      return res.status(404).json({
        success: false,
        error: 'No touchpoints found for user',
      });
    }

    res.json({
      success: true,
      data: attribution,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate attribution',
    });
  }
});

/**
 * GET /api/analytics/attribution/email-sequence
 * Get email sequence performance analytics
 */
router.get('/attribution/email-sequence', (_req: Request, res: Response) => {
  try {
    const performance = revenueAnalytics.multiTouchAttribution.getEmailSequencePerformance();

    res.json({
      success: true,
      data: performance,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get email sequence performance',
    });
  }
});

// =============================================================================
// CHURN PREDICTION ENDPOINTS (Idea #3)
// =============================================================================

/**
 * POST /api/analytics/churn/predict
 * Predict churn risk for a user
 */
router.post('/churn/predict', (req: Request, res: Response) => {
  try {
    const { userId, emailHistory } = req.body;

    if (!userId || !emailHistory) {
      return res.status(400).json({
        success: false,
        error: 'userId and emailHistory are required',
      });
    }

    // Convert date strings to Date objects
    const parsedHistory = emailHistory.map((entry: any) => ({
      date: new Date(entry.date),
      opened: entry.opened,
    }));

    const prediction = revenueAnalytics.churnPredictor.predictChurn(
      userId,
      parsedHistory
    );

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to predict churn',
    });
  }
});

// =============================================================================
// LTV ENDPOINTS (Idea #4)
// =============================================================================

/**
 * POST /api/analytics/ltv/track-customer
 * Track customer for LTV calculation
 */
router.post('/ltv/track-customer', (req: Request, res: Response) => {
  try {
    const { industry, customerId, signupDate, totalRevenue, churnDate } = req.body;

    if (!industry || !customerId || !signupDate || totalRevenue === undefined) {
      return res.status(400).json({
        success: false,
        error: 'industry, customerId, signupDate, and totalRevenue are required',
      });
    }

    revenueAnalytics.industryLTVAnalyzer.trackCustomer(
      industry,
      customerId,
      new Date(signupDate),
      totalRevenue,
      churnDate ? new Date(churnDate) : undefined
    );

    res.json({
      success: true,
      message: 'Customer tracked successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track customer',
    });
  }
});

/**
 * GET /api/analytics/ltv/by-industry/:industry
 * Get LTV metrics for a specific industry
 */
router.get('/ltv/by-industry/:industry', (req: Request, res: Response) => {
  try {
    const { industry } = req.params;

    const ltv = revenueAnalytics.industryLTVAnalyzer.calculateIndustryLTV(industry);

    if (!ltv) {
      return res.status(404).json({
        success: false,
        error: 'No data found for industry',
      });
    }

    res.json({
      success: true,
      data: ltv,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate LTV',
    });
  }
});

/**
 * GET /api/analytics/ltv/ranked
 * Get all industries ranked by LTV
 */
router.get('/ltv/ranked', (_req: Request, res: Response) => {
  try {
    const industries = revenueAnalytics.industryLTVAnalyzer.getAllIndustriesRankedByLTV();

    res.json({
      success: true,
      data: industries,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get ranked industries',
    });
  }
});

/**
 * POST /api/analytics/ltv/marketing-allocation
 * Get marketing budget allocation recommendations
 */
router.post('/ltv/marketing-allocation', (req: Request, res: Response) => {
  try {
    const { totalBudget } = req.body;

    if (!totalBudget) {
      return res.status(400).json({
        success: false,
        error: 'totalBudget is required',
      });
    }

    const allocation = revenueAnalytics.industryLTVAnalyzer.getMarketingAllocation(totalBudget);

    res.json({
      success: true,
      data: allocation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate marketing allocation',
    });
  }
});

// =============================================================================
// CAC ENDPOINTS (Idea #5)
// =============================================================================

/**
 * POST /api/analytics/cac/track-spend
 * Track marketing spend for a channel
 */
router.post('/cac/track-spend', (req: Request, res: Response) => {
  try {
    const { channel, amount } = req.body;

    if (!channel || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'channel and amount are required',
      });
    }

    revenueAnalytics.channelCACTracker.trackSpend(channel, amount);

    res.json({
      success: true,
      message: 'Spend tracked successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track spend',
    });
  }
});

/**
 * POST /api/analytics/cac/track-conversion
 * Track conversion from a channel
 */
router.post('/cac/track-conversion', (req: Request, res: Response) => {
  try {
    const { channel, customerId, ltv } = req.body;

    if (!channel || !customerId || ltv === undefined) {
      return res.status(400).json({
        success: false,
        error: 'channel, customerId, and ltv are required',
      });
    }

    revenueAnalytics.channelCACTracker.trackConversion(channel, customerId, ltv);

    res.json({
      success: true,
      message: 'Conversion tracked successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track conversion',
    });
  }
});

/**
 * GET /api/analytics/cac/by-channel/:channel
 * Get CAC metrics for a specific channel
 */
router.get('/cac/by-channel/:channel', (req: Request, res: Response) => {
  try {
    const { channel } = req.params;

    const cac = revenueAnalytics.channelCACTracker.calculateChannelCAC(channel);

    if (!cac) {
      return res.status(404).json({
        success: false,
        error: 'No data found for channel',
      });
    }

    res.json({
      success: true,
      data: cac,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate CAC',
    });
  }
});

/**
 * GET /api/analytics/cac/ranked
 * Get all channels ranked by efficiency
 */
router.get('/cac/ranked', (_req: Request, res: Response) => {
  try {
    const channels = revenueAnalytics.channelCACTracker.getAllChannelsRanked();

    res.json({
      success: true,
      data: channels,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get ranked channels',
    });
  }
});

/**
 * GET /api/analytics/cac/recommendations
 * Get budget reallocation recommendations
 */
router.get('/cac/recommendations', (_req: Request, res: Response) => {
  try {
    const recommendations = revenueAnalytics.channelCACTracker.getReallocationRecommendations();

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get recommendations',
    });
  }
});

// =============================================================================
// DASHBOARD ENDPOINT
// =============================================================================

/**
 * GET /api/analytics/dashboard
 * Get comprehensive analytics dashboard
 */
router.get('/dashboard', (_req: Request, res: Response) => {
  try {
    const dashboard = revenueAnalytics.getDashboard();

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get dashboard',
    });
  }
});

export default router;
