/**
 * Pricing & Packaging API Routes
 * 
 * Provides REST API endpoints for:
 * - Tiered assessment pricing
 * - Industry-specific landing pages
 * - Insurance bundling and cross-sell
 * - Quarterly review packages
 * - White-label broker licensing
 */

import { Router, Request, Response } from 'express';
import { 
  pricingPackaging,
  AssessmentTier,
} from '../services/analytics/PricingPackaging';
import type { IndustryVertical, InsuranceLine } from '../services/insuranceComplianceHub/types';

const router = Router();

// ============================================================================
// ASSESSMENT PRICING
// ============================================================================

/**
 * GET /api/pricing/assessment-tiers
 * Get all assessment pricing tiers
 */
router.get('/assessment-tiers', (_req: Request, res: Response) => {
  try {
    const tiers = pricingPackaging.getAssessmentPricingTiers();

    res.json({
      success: true,
      data: tiers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/pricing/purchase-assessment
 * Purchase an assessment tier
 */
router.post('/purchase-assessment', (req: Request, res: Response) => {
  try {
    const { leadId, tier, paymentMethod } = req.body;

    if (!leadId || !tier || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: leadId, tier, paymentMethod',
      });
    }

    const purchase = pricingPackaging.purchaseAssessment(
      leadId,
      tier as AssessmentTier,
      paymentMethod
    );

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/pricing/assessment-conversion-rates
 * Get conversion rates by assessment tier
 */
router.get('/assessment-conversion-rates', (_req: Request, res: Response) => {
  try {
    const rates = pricingPackaging.getAssessmentConversionRates();

    res.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// INDUSTRY LANDING PAGES
// ============================================================================

/**
 * GET /api/pricing/landing-page/:industry
 * Get industry-specific landing page configuration
 */
router.get('/landing-page/:industry', (req: Request, res: Response) => {
  try {
    const { industry } = req.params;
    const landingPage = pricingPackaging.getIndustryLandingPage(industry as IndustryVertical);

    res.json({
      success: true,
      data: landingPage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// BUNDLING & CROSS-SELL
// ============================================================================

/**
 * GET /api/pricing/bundles
 * Get all insurance bundles
 */
router.get('/bundles', (_req: Request, res: Response) => {
  try {
    const bundles = pricingPackaging.getBundles();

    res.json({
      success: true,
      data: bundles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/pricing/bundles/recommended/:industry
 * Get recommended bundle for industry
 */
router.get('/bundles/recommended/:industry', (req: Request, res: Response) => {
  try {
    const { industry } = req.params;
    const bundle = pricingPackaging.getRecommendedBundle(industry as IndustryVertical);

    if (!bundle) {
      return res.status(404).json({
        success: false,
        error: 'No recommended bundle found',
      });
    }

    res.json({
      success: true,
      data: bundle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/pricing/cross-sell-opportunities
 * Identify cross-sell opportunities for a lead
 */
router.post('/cross-sell-opportunities', (req: Request, res: Response) => {
  try {
    const { leadId, industry, currentLines, employeeCount, annualRevenue } = req.body;

    if (!leadId || !industry || !currentLines || employeeCount === undefined || !annualRevenue) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: leadId, industry, currentLines, employeeCount, annualRevenue',
      });
    }

    const opportunities = pricingPackaging.identifyCrossSellOpportunities(
      leadId,
      industry as IndustryVertical,
      currentLines as InsuranceLine[],
      employeeCount,
      annualRevenue
    );

    res.json({
      success: true,
      data: opportunities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// QUARTERLY REVIEW
// ============================================================================

/**
 * GET /api/pricing/quarterly-review-packages
 * Get quarterly review packages
 */
router.get('/quarterly-review-packages', (_req: Request, res: Response) => {
  try {
    const packages = pricingPackaging.getQuarterlyReviewPackages();

    res.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/pricing/schedule-quarterly-review
 * Schedule quarterly review for a lead
 */
router.post('/schedule-quarterly-review', (req: Request, res: Response) => {
  try {
    const { leadId, packageId, autoRenew = true } = req.body;

    if (!leadId || !packageId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: leadId, packageId',
      });
    }

    const schedule = pricingPackaging.scheduleQuarterlyReview(leadId, packageId, autoRenew);

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/pricing/quarterly-review-upsell-leads
 * Get leads eligible for quarterly review upsell
 */
router.get('/quarterly-review-upsell-leads', (req: Request, res: Response) => {
  try {
    const { daysUntilRenewal = 90 } = req.query;
    
    const leads = pricingPackaging.getLeadsForQuarterlyReviewUpsell(
      Number(daysUntilRenewal)
    );

    res.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// BROKER LICENSING
// ============================================================================

/**
 * GET /api/pricing/broker-licensing-tiers
 * Get broker licensing tier options
 */
router.get('/broker-licensing-tiers', (_req: Request, res: Response) => {
  try {
    const tiers = pricingPackaging.getBrokerLicensingTiers();

    res.json({
      success: true,
      data: tiers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/pricing/create-broker-license
 * Create a new broker license
 */
router.post('/create-broker-license', (req: Request, res: Response) => {
  try {
    const { brokerName, brokerEmail, brokerCompany, licenseType } = req.body;

    if (!brokerName || !brokerEmail || !brokerCompany || !licenseType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: brokerName, brokerEmail, brokerCompany, licenseType',
      });
    }

    const license = pricingPackaging.createBrokerLicense(
      brokerName,
      brokerEmail,
      brokerCompany,
      licenseType
    );

    res.json({
      success: true,
      data: license,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/pricing/broker-license/:licenseId
 * Get broker license details
 */
router.get('/broker-license/:licenseId', (req: Request, res: Response) => {
  try {
    const { licenseId } = req.params;
    const license = pricingPackaging.getBrokerLicense(licenseId);

    if (!license) {
      return res.status(404).json({
        success: false,
        error: 'License not found',
      });
    }

    res.json({
      success: true,
      data: license,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/pricing/broker-roi/:licenseId
 * Calculate broker ROI
 */
router.get('/broker-roi/:licenseId', (req: Request, res: Response) => {
  try {
    const { licenseId } = req.params;
    const roi = pricingPackaging.calculateBrokerROI(licenseId);

    res.json({
      success: true,
      data: roi,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
