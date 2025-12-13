/**
 * Wellness API Routes
 * ====================
 *
 * Public health meets music data.
 * "Teach humans how to be better humans."
 *
 * Monetization paths:
 * - B2C: Premium behavior playlists
 * - B2B: Health insurers, employers, pharma adherence
 * - Research: Anonymized datasets
 */

import { Router, Request, Response } from 'express';
import { createModuleLogger } from '../../utils/logger';
import { formatErrorResponse, ValidationError } from '../errors';
import { wellnessGenome, WellnessBehavior } from '../services/wellness/WellnessGenome';
import { lastFmClient } from '../services/wellness/LastFmIntegration';
import { interventionTracker } from '../services/wellness/InterventionTracker';

const logger = createModuleLogger('WellnessRoutes');
const router = Router();

// =============================================================================
// USER ENDPOINTS
// =============================================================================

/**
 * GET /wellness/dashboard/:userId
 * Get user's wellness dashboard
 */
router.get('/dashboard/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const dashboard = wellnessGenome.getDashboard(userId);
    const stats = interventionTracker.getUserStats(userId);

    res.json({
      success: true,
      data: {
        ...dashboard,
        interventionStats: stats,
      },
    });
  } catch (error) {
    logger.error('Failed to get dashboard', { error });
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * POST /wellness/goals
 * Set user's wellness goals
 */
router.post('/goals', async (req: Request, res: Response) => {
  try {
    const { userId, goals } = req.body;

    if (!userId || !Array.isArray(goals)) {
      throw new ValidationError('userId and goals array are required');
    }

    wellnessGenome.setUserGoals(userId, goals as WellnessBehavior[]);

    res.json({
      success: true,
      message: 'Goals updated',
      goals,
    });
  } catch (error) {
    logger.error('Failed to set goals', { error });
    res.status(400).json(formatErrorResponse(error));
  }
});

/**
 * GET /wellness/recommendations/:userId
 * Get personalized intervention recommendations
 */
router.get('/recommendations/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { behavior, timeOfDay } = req.query;

    const recommendations = wellnessGenome.getRecommendations(
      userId,
      behavior as WellnessBehavior | undefined,
      timeOfDay ? { timeOfDay: timeOfDay as any } : undefined
    );

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('Failed to get recommendations', { error });
    res.status(500).json(formatErrorResponse(error));
  }
});

// =============================================================================
// INTERVENTION ENDPOINTS
// =============================================================================

/**
 * POST /wellness/intervention/start
 * Start tracking a wellness intervention (user starts a playlist)
 */
router.post('/intervention/start', async (req: Request, res: Response) => {
  try {
    const { userId, playlistId, context } = req.body;

    if (!userId || !playlistId) {
      throw new ValidationError('userId and playlistId are required');
    }

    // Get playlist from genome (mock for now)
    const playlist = {
      id: playlistId,
      name: 'Wellness Playlist',
      targetBehavior: (req.body.targetBehavior || 'exercise') as WellnessBehavior,
      description: '',
      optimalContext: {},
      expectedEffectSize: 0.3,
      tracks: [],
      totalDuration: 0,
      createdAt: new Date(),
      successRate: 0,
    };

    const interventionId = interventionTracker.startIntervention(userId, playlist, context);

    res.json({
      success: true,
      interventionId,
      message: 'Intervention tracking started',
    });
  } catch (error) {
    logger.error('Failed to start intervention', { error });
    res.status(400).json(formatErrorResponse(error));
  }
});

/**
 * POST /wellness/intervention/progress
 * Update intervention progress
 */
router.post('/intervention/progress', async (req: Request, res: Response) => {
  try {
    const { interventionId, completionRate } = req.body;

    if (!interventionId || completionRate === undefined) {
      throw new ValidationError('interventionId and completionRate are required');
    }

    interventionTracker.updateProgress(interventionId, completionRate);

    res.json({
      success: true,
      message: 'Progress updated',
    });
  } catch (error) {
    logger.error('Failed to update progress', { error });
    res.status(400).json(formatErrorResponse(error));
  }
});

/**
 * POST /wellness/intervention/outcome
 * Record intervention outcome (did the behavior occur?)
 */
router.post('/intervention/outcome', async (req: Request, res: Response) => {
  try {
    const { interventionId, didIt, wasHelpful } = req.body;

    if (!interventionId || didIt === undefined) {
      throw new ValidationError('interventionId and didIt are required');
    }

    interventionTracker.quickReport(interventionId, didIt, wasHelpful);

    res.json({
      success: true,
      message: 'Outcome recorded',
    });
  } catch (error) {
    logger.error('Failed to record outcome', { error });
    res.status(400).json(formatErrorResponse(error));
  }
});

// =============================================================================
// BEHAVIOR TRACKING ENDPOINTS
// =============================================================================

/**
 * POST /wellness/behavior
 * Record a behavior (with or without intervention)
 */
router.post('/behavior', async (req: Request, res: Response) => {
  try {
    const { userId, behavior, occurred, source, intensity } = req.body;

    if (!userId || !behavior) {
      throw new ValidationError('userId and behavior are required');
    }

    wellnessGenome.recordBehavior(userId, {
      type: behavior as WellnessBehavior,
      occurred: occurred !== false,
      source: source || 'self_report',
      intensity,
    });

    res.json({
      success: true,
      message: 'Behavior recorded',
    });
  } catch (error) {
    logger.error('Failed to record behavior', { error });
    res.status(400).json(formatErrorResponse(error));
  }
});

// =============================================================================
// LAST.FM INTEGRATION
// =============================================================================

/**
 * GET /wellness/lastfm/stats/:username
 * Get Last.fm listening statistics
 */
router.get('/lastfm/stats/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!lastFmClient.isAvailable()) {
      throw new ValidationError('Last.fm integration not configured');
    }

    const stats = await lastFmClient.getListeningStats(username);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get Last.fm stats', { error });
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /wellness/lastfm/recent/:username
 * Get recent listening history
 */
router.get('/lastfm/recent/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { limit } = req.query;

    if (!lastFmClient.isAvailable()) {
      throw new ValidationError('Last.fm integration not configured');
    }

    const tracks = await lastFmClient.getRecentTracks(username, {
      limit: limit ? parseInt(limit as string) : 50,
    });

    res.json({
      success: true,
      data: tracks,
    });
  } catch (error) {
    logger.error('Failed to get recent tracks', { error });
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * POST /wellness/lastfm/analyze/:username
 * Analyze listening patterns for a user
 */
router.post('/lastfm/analyze/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { fromDate, toDate } = req.body;

    if (!lastFmClient.isAvailable()) {
      throw new ValidationError('Last.fm integration not configured');
    }

    const from = fromDate ? new Date(fromDate) : undefined;
    const to = toDate ? new Date(toDate) : undefined;

    // Get scrobbles (this could take a while for 20+ years)
    const scrobbles = await lastFmClient.getAllScrobbles(username, {
      from,
      to,
      onProgress: (loaded, total) => {
        logger.info('Loading scrobbles', { loaded, total, username });
      },
    });

    // Analyze patterns
    const patterns = lastFmClient.analyzeListeningPatterns(scrobbles);

    res.json({
      success: true,
      data: {
        totalScrobbles: scrobbles.length,
        patterns,
        dateRange: {
          from: from || scrobbles[scrobbles.length - 1]?.timestamp,
          to: to || scrobbles[0]?.timestamp,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to analyze listening patterns', { error });
    res.status(500).json(formatErrorResponse(error));
  }
});

// =============================================================================
// B2B REPORTING ENDPOINTS
// =============================================================================

/**
 * GET /wellness/insights/aggregate
 * Get aggregate insights (for B2B partners)
 */
router.get('/insights/aggregate', async (req: Request, res: Response) => {
  try {
    const genomeInsights = wellnessGenome.getAggregateInsights();
    const interventionReport = interventionTracker.getAggregateReport();

    res.json({
      success: true,
      data: {
        genome: genomeInsights,
        interventions: interventionReport,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to get aggregate insights', { error });
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /wellness/insights/correlations
 * Get discovered music-behavior correlations
 */
router.get('/insights/correlations', async (req: Request, res: Response) => {
  try {
    const { minSampleSize } = req.query;

    const correlations = interventionTracker.discoverCorrelations(
      minSampleSize ? parseInt(minSampleSize as string) : 10
    );

    res.json({
      success: true,
      data: correlations,
    });
  } catch (error) {
    logger.error('Failed to get correlations', { error });
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /wellness/insights/playlist/:playlistId
 * Get effectiveness metrics for a specific playlist
 */
router.get('/insights/playlist/:playlistId', async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;

    const effectiveness = interventionTracker.getPlaylistEffectiveness(playlistId);

    if (!effectiveness) {
      res.status(404).json({
        success: false,
        error: 'Playlist not found or insufficient data',
      });
      return;
    }

    res.json({
      success: true,
      data: effectiveness,
    });
  } catch (error) {
    logger.error('Failed to get playlist effectiveness', { error });
    res.status(500).json(formatErrorResponse(error));
  }
});

// =============================================================================
// AVAILABLE BEHAVIORS
// =============================================================================

/**
 * GET /wellness/behaviors
 * List all trackable wellness behaviors
 */
router.get('/behaviors', (req: Request, res: Response) => {
  const behaviors: { id: WellnessBehavior; name: string; category: string }[] = [
    { id: 'hydration', name: 'Drink Water', category: 'Physical' },
    { id: 'healthy_meal', name: 'Eat Healthy', category: 'Nutrition' },
    { id: 'exercise', name: 'Exercise', category: 'Physical' },
    { id: 'meditation', name: 'Meditation', category: 'Mental' },
    { id: 'yoga', name: 'Yoga/Stretching', category: 'Physical' },
    { id: 'sleep_quality', name: 'Good Sleep', category: 'Physical' },
    { id: 'social_connection', name: 'Connect with Others', category: 'Social' },
    { id: 'medication_adherence', name: 'Take Medications', category: 'Health' },
    { id: 'screen_break', name: 'Screen Break', category: 'Mental' },
    { id: 'outdoor_time', name: 'Go Outside', category: 'Physical' },
    { id: 'creative_activity', name: 'Creative Activity', category: 'Mental' },
    { id: 'learning', name: 'Learn Something', category: 'Mental' },
    { id: 'meal_prep', name: 'Meal Prep', category: 'Nutrition' },
    { id: 'journaling', name: 'Journaling', category: 'Mental' },
  ];

  res.json({
    success: true,
    data: behaviors,
  });
});

export default router;
