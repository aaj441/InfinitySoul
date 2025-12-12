/**
 * Revenue Analytics API Routes
 * 
 * Provides REST API endpoints for:
 * - A/B testing and significance calculation
 * - Multi-touch attribution tracking
 * - Churn prediction
 * - LTV segmentation by industry
 * - CAC tracking by channel
 */

import { Router, Request, Response } from 'express';
import { 
  revenueAnalytics,
  ABTestConfig,
  ABTestExposure,
  AttributionTouchpoint,
  AttributionModel,
  CustomerLTV,
  MarketingSpend,
} from '../services/analytics/RevenueAnalytics';
import { LeadSource } from '../services/insuranceComplianceHub/types';

const router = Router();

// ============================================================================
// A/B TESTING ENDPOINTS
// ============================================================================

/**
 * POST /api/analytics/ab-tests/calculate-sample-size
 * Calculate required sample size for an A/B test
 */
router.post('/ab-tests/calculate-sample-size', (req: Request, res: Response) => {
  try {
    const {
      baselineConversionRate,
      minimumDetectableEffect,
      confidenceLevel = 0.95,
      power = 0.80,
    } = req.body;

    if (!baselineConversionRate || !minimumDetectableEffect) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: baselineConversionRate, minimumDetectableEffect',
      });
    }

    const sampleSize = revenueAnalytics.calculateRequiredSampleSize(
      baselineConversionRate,
      minimumDetectableEffect,
      confidenceLevel,
      power
    );

    res.json({
      success: true,
      data: {
        sampleSize,
        samplesPerVariant: sampleSize / 2,
        parameters: {
          baselineConversionRate,
          minimumDetectableEffect,
          confidenceLevel,
          power,
        },
        interpretation: `You need ${sampleSize} total samples (${sampleSize / 2} per variant) to detect a ${minimumDetectableEffect}% effect with ${confidenceLevel * 100}% confidence and ${power * 100}% power.`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/analytics/ab-tests
 * Create a new A/B test
 */
router.post('/ab-tests', (req: Request, res: Response) => {
  try {
    const config: Omit<ABTestConfig, 'id'> = req.body;

    if (!config.name || !config.variantA || !config.variantB) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, variantA, variantB',
      });
    }

    const test = revenueAnalytics.createABTest(config);

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/analytics/ab-tests
 * Get all A/B tests
 */
router.get('/ab-tests', (_req: Request, res: Response) => {
  try {
    const tests = revenueAnalytics.getAllABTests();

    res.json({
      success: true,
      data: tests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/analytics/ab-tests/:testId
 * Get specific A/B test
 */
router.get('/ab-tests/:testId', (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    const test = revenueAnalytics.getABTest(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/analytics/ab-tests/:testId/expose
 * Record an exposure to an A/B test variant
 */
router.post('/ab-tests/:testId/expose', (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    const exposure: Omit<ABTestExposure, 'testId'> = req.body;

    revenueAnalytics.recordABExposure({
      ...exposure,
      testId,
    });

    res.json({
      success: true,
      message: 'Exposure recorded',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/analytics/ab-tests/:testId/results
 * Get A/B test results and statistical analysis
 */
router.get('/ab-tests/:testId/results', (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    const results = revenueAnalytics.analyzeABTest(testId);

    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// ATTRIBUTION TRACKING ENDPOINTS
// ============================================================================

/**
 * POST /api/analytics/attribution/touchpoint
 * Record an attribution touchpoint
 */
router.post('/attribution/touchpoint', (req: Request, res: Response) => {
  try {
    const touchpoint: AttributionTouchpoint = req.body;

    if (!touchpoint.leadId || !touchpoint.type || !touchpoint.channel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: leadId, type, channel',
      });
    }

    revenueAnalytics.recordTouchpoint(touchpoint);

    res.json({
      success: true,
      message: 'Touchpoint recorded',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/analytics/attribution/calculate
 * Calculate attribution for a lead based on model
 */
router.post('/attribution/calculate', (req: Request, res: Response) => {
  try {
    const { leadId, conversionValue, model } = req.body;

    if (!leadId || !conversionValue || !model) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: leadId, conversionValue, model',
      });
    }

    const result = revenueAnalytics.calculateAttribution(
      leadId,
      conversionValue,
      model as AttributionModel
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'No touchpoints found for lead',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// CHURN PREDICTION ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/churn/predict/:leadId
 * Get churn prediction for a specific lead
 */
router.get('/churn/predict/:leadId', (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const prediction = revenueAnalytics.predictChurn(leadId);

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// LTV SEGMENTATION ENDPOINTS
// ============================================================================

/**
 * POST /api/analytics/ltv/record
 * Record customer LTV
 */
router.post('/ltv/record', (req: Request, res: Response) => {
  try {
    const ltv: CustomerLTV = req.body;

    if (!ltv.leadId || !ltv.industry || !ltv.predictedLTV) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: leadId, industry, predictedLTV',
      });
    }

    revenueAnalytics.recordCustomerLTV(ltv);

    res.json({
      success: true,
      message: 'LTV recorded',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/analytics/ltv/segments
 * Get LTV segments by industry
 */
router.get('/ltv/segments', (_req: Request, res: Response) => {
  try {
    const segments = revenueAnalytics.calculateLTVSegments();

    res.json({
      success: true,
      data: segments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// CAC TRACKING ENDPOINTS
// ============================================================================

/**
 * POST /api/analytics/cac/spend
 * Record marketing spend
 */
router.post('/cac/spend', (req: Request, res: Response) => {
  try {
    const spend: Omit<MarketingSpend, 'id'> = req.body;

    if (!spend.channel || !spend.amount || !spend.startDate || !spend.endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: channel, amount, startDate, endDate',
      });
    }

    const record = revenueAnalytics.recordMarketingSpend(spend);

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/analytics/cac/calculate
 * Calculate CAC for a specific channel
 */
router.post('/cac/calculate', (req: Request, res: Response) => {
  try {
    const { channel, leadsAcquired, customersAcquired, averageLTV } = req.body;

    if (!channel || leadsAcquired === undefined || customersAcquired === undefined || !averageLTV) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: channel, leadsAcquired, customersAcquired, averageLTV',
      });
    }

    const cac = revenueAnalytics.calculateChannelCAC(
      channel as LeadSource,
      leadsAcquired,
      customersAcquired,
      averageLTV
    );

    res.json({
      success: true,
      data: cac,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/analytics/cac/all-channels
 * Calculate CAC for all channels
 */
router.post('/cac/all-channels', (req: Request, res: Response) => {
  try {
    const { leadsByChannel, customersByChannel, ltvByChannel } = req.body;

    if (!leadsByChannel || !customersByChannel || !ltvByChannel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: leadsByChannel, customersByChannel, ltvByChannel',
      });
    }

    // Convert plain objects to Maps
    const leadsMap = new Map(Object.entries(leadsByChannel));
    const customersMap = new Map(Object.entries(customersByChannel));
    const ltvMap = new Map(Object.entries(ltvByChannel));

    const allCAC = revenueAnalytics.getAllChannelCAC(
      leadsMap as Map<LeadSource, number>,
      customersMap as Map<LeadSource, number>,
      ltvMap as Map<LeadSource, number>
    );

    res.json({
      success: true,
      data: allCAC,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
