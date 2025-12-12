/**
 * Conversion Rate Optimization API Routes
 * 
 * Provides REST API endpoints for:
 * - Device and form tracking
 * - Funnel analytics
 * - Urgency badge generation
 * - Social proof metrics
 * - Exit intent popups
 */

import { Router, Request, Response } from 'express';
import { 
  conversionOptimization,
  FormInteraction,
  FunnelSession,
  ExitIntentDisplay,
} from '../services/analytics/ConversionOptimization';

const router = Router();

// ============================================================================
// DEVICE & FORM TRACKING
// ============================================================================

/**
 * POST /api/cro/form/track
 * Track form interaction
 */
router.post('/form/track', (req: Request, res: Response) => {
  try {
    const interaction: FormInteraction = req.body;

    if (!interaction.sessionId || !interaction.device || !interaction.formType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, device, formType',
      });
    }

    conversionOptimization.recordFormInteraction(interaction);

    res.json({
      success: true,
      message: 'Form interaction tracked',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/cro/device-metrics
 * Get device-specific conversion metrics
 */
router.get('/device-metrics', (_req: Request, res: Response) => {
  try {
    const metrics = conversionOptimization.calculateDeviceMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/cro/mobile-recommendations
 * Get mobile optimization recommendations
 */
router.get('/mobile-recommendations', (_req: Request, res: Response) => {
  try {
    const recommendations = conversionOptimization.getMobileOptimizationRecommendations();

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

/**
 * POST /api/cro/funnel/track
 * Track funnel progress
 */
router.post('/funnel/track', (req: Request, res: Response) => {
  try {
    const session: FunnelSession = req.body;

    if (!session.sessionId || session.currentStep === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, currentStep',
      });
    }

    conversionOptimization.recordFunnelProgress(session);

    res.json({
      success: true,
      message: 'Funnel progress tracked',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/cro/funnel/metrics
 * Get assessment funnel metrics
 */
router.get('/funnel/metrics', (_req: Request, res: Response) => {
  try {
    const metrics = conversionOptimization.calculateFunnelMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// URGENCY BADGES
// ============================================================================

/**
 * POST /api/cro/urgency-badge
 * Generate urgency badge for assessment results
 */
router.post('/urgency-badge', (req: Request, res: Response) => {
  try {
    const { riskScore, complianceGrade } = req.body;

    if (riskScore === undefined || !complianceGrade) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: riskScore, complianceGrade',
      });
    }

    const badge = conversionOptimization.generateUrgencyBadge(riskScore, complianceGrade);

    res.json({
      success: true,
      data: badge,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/cro/time-sensitive-urgency
 * Generate time-sensitive urgency badge
 */
router.post('/time-sensitive-urgency', (req: Request, res: Response) => {
  try {
    const { daysUntilExpiration } = req.body;

    const badge = conversionOptimization.generateTimeSensitiveUrgency(daysUntilExpiration);

    res.json({
      success: true,
      data: badge,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// SOCIAL PROOF
// ============================================================================

/**
 * POST /api/cro/social-proof/increment
 * Increment social proof counter
 */
router.post('/social-proof/increment', (req: Request, res: Response) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: type',
      });
    }

    conversionOptimization.incrementSocialProof(type);

    res.json({
      success: true,
      message: 'Social proof counter incremented',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/cro/social-proof/metrics
 * Get social proof metrics
 */
router.get('/social-proof/metrics', (_req: Request, res: Response) => {
  try {
    const metrics = conversionOptimization.getSocialProofMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/cro/social-proof/message
 * Get random social proof message
 */
router.get('/social-proof/message', (_req: Request, res: Response) => {
  try {
    const message = conversionOptimization.generateSocialProofMessage();

    res.json({
      success: true,
      data: { message },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// EXIT INTENT
// ============================================================================

/**
 * GET /api/cro/exit-intent/config
 * Get exit intent configuration
 */
router.get('/exit-intent/config', (_req: Request, res: Response) => {
  try {
    const config = conversionOptimization.getDefaultExitIntentConfig();

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/cro/exit-intent/variant
 * Get exit intent variant for display
 */
router.post('/exit-intent/variant', (req: Request, res: Response) => {
  try {
    const config = conversionOptimization.getDefaultExitIntentConfig();
    const variant = conversionOptimization.selectExitIntentVariant(config);

    res.json({
      success: true,
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/cro/exit-intent/track
 * Track exit intent display
 */
router.post('/exit-intent/track', (req: Request, res: Response) => {
  try {
    const display: ExitIntentDisplay = req.body;

    if (!display.sessionId || !display.variantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, variantId',
      });
    }

    conversionOptimization.recordExitIntentDisplay(display);

    res.json({
      success: true,
      message: 'Exit intent display tracked',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/cro/exit-intent/performance
 * Get exit intent performance metrics
 */
router.get('/exit-intent/performance', (_req: Request, res: Response) => {
  try {
    const performance = conversionOptimization.calculateExitIntentPerformance();

    // Convert Map to object for JSON serialization
    const conversionsByVariant: Record<string, any> = {};
    performance.conversionsByVariant.forEach((value, key) => {
      conversionsByVariant[key] = value;
    });

    res.json({
      success: true,
      data: {
        ...performance,
        conversionsByVariant,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
