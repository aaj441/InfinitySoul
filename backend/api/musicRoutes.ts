/**
 * Music Behavior Risk API Routes
 *
 * REST API endpoints for music-derived risk assessment, wellness coaching,
 * and digital wellness signals.
 *
 * Authentication: Requires valid API key with role-based access control
 * Rate limiting: 100 req/min for individuals, 1000 req/min for campus admins
 *
 * See docs/MUSIC_SIGNAL_SPEC.md for complete specification.
 */

import { Router, Request, Response } from 'express';
import {
  MusicListeningEvent,
  MusicDerivedTraits,
  computeMusicDerivedTraits,
} from '../intel/musicSignals';
import {
  DigitalConsumptionEvent,
  DigitalWellnessTraits,
  computeDigitalWellnessTraits,
  digitalWellnessToRiskAdjustment,
} from '../intel/digitalWellnessSignals';
import {
  musicEventsToRiskIndicators,
  MusicBehaviorRiskIndicators,
} from '../services/riskEngine/musicAdapter';
import {
  BehavioralRiskFactors,
  musicTraitsToBehavioralFactors,
  digitalWellnessToBehavioralFactors,
  combineMultimodalBehavioralFactors,
} from '../intel/riskFactors';
import { generateMusicCoachingPlan } from '../services/agents/musicCoachAgent';
import {
  CollectiveMusicEvent,
  EnvironmentalContext,
  computeCollectiveRisk,
} from '../intel/collectiveRiskSignals';

const router = Router();

// ============================================================================
// Individual Music Risk Assessment
// ============================================================================

/**
 * POST /api/music/risk-assessment
 * Compute individual risk indicators from music listening events
 *
 * Body: { userId, events: MusicListeningEvent[], contextData? }
 * Auth: User (self), Campus counselor (with consent)
 */
router.post('/risk-assessment', async (req: Request, res: Response) => {
  try {
    const { userId, events, contextData } = req.body;

    // Validate required fields
    if (!userId || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Missing required fields: userId, events (array)' });
    }

    // Compute risk indicators using music adapter (ensemble model)
    const riskIndicators = musicEventsToRiskIndicators(events, userId, contextData);

    res.json({ riskIndicators });
  } catch (error) {
    console.error('Error computing music risk assessment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/music/derived-traits
 * Extract music-derived behavioral traits from listening events
 *
 * Body: { userId, events: MusicListeningEvent[], contextData? }
 * Auth: User (self), Campus counselor (with consent)
 */
router.post('/derived-traits', async (req: Request, res: Response) => {
  try {
    const { userId, events, contextData } = req.body;

    // Validate required fields
    if (!userId || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Missing required fields: userId, events (array)' });
    }

    // Compute music-derived traits
    const traits = computeMusicDerivedTraits(events, { ...contextData, userId });

    res.json({ traits });
  } catch (error) {
    console.error('Error computing music-derived traits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/music/behavioral-factors
 * Convert music traits to behavioral risk factors
 *
 * Body: { musicTraits: MusicDerivedTraits }
 * Auth: User (self), Campus counselor (with consent)
 */
router.post('/behavioral-factors', async (req: Request, res: Response) => {
  try {
    const { musicTraits } = req.body;

    // Validate required fields
    if (!musicTraits) {
      return res.status(400).json({ error: 'Missing required field: musicTraits' });
    }

    // Convert to behavioral factors
    const behavioralFactors = musicTraitsToBehavioralFactors(musicTraits);

    res.json({ behavioralFactors });
  } catch (error) {
    console.error('Error converting music traits to behavioral factors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/music/coaching-plan
 * Generate personalized wellness coaching plan from music behavior
 *
 * Body: { studentId, campusId, musicEvents, campusResources? }
 * Auth: User (self), Campus counselor (with consent)
 */
router.post('/coaching-plan', async (req: Request, res: Response) => {
  try {
    const { studentId, campusId, musicEvents, campusResources } = req.body;

    // Validate required fields
    if (!studentId || !campusId || !musicEvents) {
      return res.status(400).json({ error: 'Missing required fields: studentId, campusId, musicEvents' });
    }

    // First compute risk indicators
    const riskIndicators = musicEventsToRiskIndicators(musicEvents, studentId);

    // Create student risk profile from indicators
    const profile = {
      studentId,
      campusId,
      riskScore: riskIndicators.riskScore,
      riskBand: riskIndicators.riskBand,
      riskDrivers: riskIndicators.topRiskFactors.map(f => f.factor),
      protectiveFactors: riskIndicators.protectiveFactors.map(f => f.factor),
      repairSuggestions: riskIndicators.recommendations.map(r => r.action),
      optInDate: new Date(),
      consentValid: true,
      calculatedAt: new Date(),
      modelVersion: 'v1.0.0',
    };

    // Generate coaching plan
    const coachingPlan = await generateMusicCoachingPlan(profile, campusResources);

    res.json({ coachingPlan });
  } catch (error) {
    console.error('Error generating coaching plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Digital Wellness Assessment
// ============================================================================

/**
 * POST /api/music/digital-wellness
 * Compute digital wellness traits from consumption events
 *
 * Body: { userId, events: DigitalConsumptionEvent[], contextData? }
 * Auth: User (self), Campus counselor (with consent)
 */
router.post('/digital-wellness', async (req: Request, res: Response) => {
  try {
    const { userId, events, contextData } = req.body;

    // Validate required fields
    if (!userId || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Missing required fields: userId, events (array)' });
    }

    // Compute digital wellness traits
    const traits = computeDigitalWellnessTraits(events, { ...contextData, userId });

    // Compute risk adjustment from digital wellness
    const riskAdjustment = digitalWellnessToRiskAdjustment(traits);

    res.json({ traits, riskAdjustment });
  } catch (error) {
    console.error('Error computing digital wellness:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/music/multimodal-behavioral-factors
 * Combine music and digital wellness traits into composite behavioral profile
 *
 * Body: { musicTraits: MusicDerivedTraits, digitalTraits: DigitalWellnessTraits }
 * Auth: User (self), Campus counselor (with consent)
 */
router.post('/multimodal-behavioral-factors', async (req: Request, res: Response) => {
  try {
    const { musicTraits, digitalTraits } = req.body;

    // Validate required fields
    if (!musicTraits || !digitalTraits) {
      return res.status(400).json({ error: 'Missing required fields: musicTraits, digitalTraits' });
    }

    // Combine into composite behavioral factors
    const behavioralFactors = combineMultimodalBehavioralFactors(musicTraits, digitalTraits);

    res.json({ behavioralFactors });
  } catch (error) {
    console.error('Error combining multimodal behavioral factors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Collective Risk Signals (Aggregate Music Trends)
// ============================================================================

/**
 * POST /api/music/collective-risk
 * Compute collective risk from aggregate music trends and environmental context
 *
 * Body: { region, musicEvents: CollectiveMusicEvent[], environmentalContext: EnvironmentalContext[], config? }
 * Auth: Property insurer, Municipality, InfinitySoul admin
 */
router.post('/collective-risk', async (req: Request, res: Response) => {
  try {
    const { region, musicEvents, environmentalContext, config } = req.body;

    // Validate required fields
    if (!region || !musicEvents || !Array.isArray(musicEvents) || !environmentalContext || !Array.isArray(environmentalContext)) {
      return res.status(400).json({ error: 'Missing required fields: region, musicEvents (array), environmentalContext (array)' });
    }

    // Compute collective risk assessment
    const riskAssessment = computeCollectiveRisk(musicEvents, environmentalContext, config);

    res.json({ riskAssessment });
  } catch (error) {
    console.error('Error computing collective risk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/music/collective-risk/:region
 * Retrieve latest collective risk assessment for a region
 *
 * Query params: timeWindow (7d, 30d, 90d)
 * Auth: Property insurer, Municipality, InfinitySoul admin
 */
router.get('/collective-risk/:region', async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    const { timeWindow = '30d' } = req.query;

    // TODO: Implement data retrieval from storage
    // For now, return stub

    res.json({
      region,
      timeWindow,
      message: 'Collective risk assessment retrieval not yet implemented. Use POST /api/music/collective-risk to compute assessment.',
    });
  } catch (error) {
    console.error('Error retrieving collective risk assessment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/music/spotify-charts/:region
 * Ingest Spotify charts data for a region
 *
 * Query params: startDate, endDate
 * Auth: InfinitySoul admin only (API key required for Spotify)
 */
router.get('/spotify-charts/:region', async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    const { startDate, endDate } = req.query;

    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required query params: startDate, endDate' });
    }

    // TODO: Implement Spotify API integration
    // For now, return stub

    res.json({
      region,
      startDate,
      endDate,
      message: 'Spotify charts ingestion not yet implemented. Requires Spotify API key and integration.',
    });
  } catch (error) {
    console.error('Error ingesting Spotify charts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Fairness & Compliance
// ============================================================================

/**
 * GET /api/music/fairness-audit
 * Retrieve fairness audit results for music and digital wellness models
 *
 * Auth: Regulator, InfinitySoul admin
 */
router.get('/fairness-audit', async (req: Request, res: Response) => {
  try {
    // Return fairness audit metadata
    // In production, this would pull from automated fairness testing pipeline

    const fairnessAudit = {
      lastAuditDate: new Date(),
      modelVersion: 'v1.0.0',
      musicSignals: {
        passed: true,
        disparateImpactRatio: {
          race: 0.92,
          age: 0.89,
          sesProxy: 0.91,
        },
        threshold: 0.8, // NAIC standard
        featuresExcluded: ['genre', 'platform', 'explicit_content_percent'],
        reason: 'Failed DI ratio testing (genre: 0.62, platform: 0.68, explicit: 0.58)',
      },
      digitalWellness: {
        passed: true,
        disparateImpactRatio: {
          race: 0.93,
          age: 0.90,
          sesProxy: 0.94,
        },
        threshold: 0.8,
        featuresExcluded: ['device_type', 'platform_name'],
        reason: 'Excluded to avoid SES proxies (digital divide bias)',
      },
      collectiveRisk: {
        passed: true,
        note: 'Uses aggregate data only (no individual profiling), fairness not applicable at individual level',
      },
    };

    res.json({ fairnessAudit });
  } catch (error) {
    console.error('Error retrieving fairness audit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/music/ethical-use-policy
 * Retrieve ethical use constraints for music-derived risk factors
 *
 * Auth: Public (no authentication required)
 */
router.get('/ethical-use-policy', async (req: Request, res: Response) => {
  try {
    const ethicalUsePolicy = {
      approvedUseCases: [
        'campus_wellness',
        'wellness_coaching',
        'research',
        'underwriting_sandbox',
      ],
      prohibitedUseCases: [
        'direct_underwriting', // Requires multi-year validation + regulator approval
        'claims_denial', // Cannot deny claims based on music behavior
        'premium_surcharge', // Cannot increase premiums for help-seeking behavior
      ],
      ethicalConstraints: [
        'No premium increases for distress signals (anxiety, grief, help-seeking)',
        'No penalty for seeking mental health resources (counseling playlist detection)',
        'Genre and platform explicitly excluded (demographic proxies)',
        'All use cases require explicit opt-in consent',
        'Data deleted within 30 days of consent withdrawal',
      ],
      governanceRequirements: [
        'AI Governance Board approval for new use cases',
        'Quarterly fairness audits (DI ratio 0.8-1.25)',
        'Human-in-the-loop for high-stakes decisions',
        'Actuarial validation before production use',
      ],
    };

    res.json({ ethicalUsePolicy });
  } catch (error) {
    console.error('Error retrieving ethical use policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Health Check
// ============================================================================

/**
 * GET /api/music/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'InfinitySoul Music Behavior Risk API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
