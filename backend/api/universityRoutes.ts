/**
 * University Vertical API Routes
 *
 * REST API endpoints for university pilot management, student risk profiles,
 * campus risk events, and tri-stakeholder reporting.
 *
 * Authentication: Requires valid API key with role-based access control
 * Rate limiting: 100 req/min for campus admins, 1000 req/min for insurers
 *
 * See docs/UNIVERSITY_VERTICAL.md for complete API specification.
 */

import { Router, Request, Response } from 'express';
import {
  Campus,
  CampusUnit,
  CampusRiskEvent,
  StudentRiskProfile,
  AIPilotConfig,
  CampusRiskSummary,
  InsurerReport,
  RegulatorBriefing,
} from '../intel/university';
import {
  getCampus,
  createCampus,
  updateCampusPilotConfig,
  getCampusRiskEvents,
  createCampusRiskEvent,
  getStudentRiskProfile,
  createStudentRiskProfile,
  updateStudentConsent,
  getCampusRiskSummary,
  generateInsurerReport,
  generateRegulatorBriefing,
} from '../services/universityPilotService';
import { summarizeCampusRisk } from '../services/agents/universityRiskAgent';
import { generateMusicCoachingPlan } from '../services/agents/musicCoachAgent';

const router = Router();

// ============================================================================
// Campus Management
// ============================================================================

/**
 * GET /api/university/campuses/:campusId
 * Retrieve campus details
 *
 * Auth: Campus admin, Insurer, Regulator
 */
router.get('/campuses/:campusId', async (req: Request, res: Response) => {
  try {
    const { campusId } = req.params;
    const campus = await getCampus(campusId);

    if (!campus) {
      return res.status(404).json({ error: 'Campus not found' });
    }

    res.json({ campus });
  } catch (error) {
    console.error('Error retrieving campus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/university/campuses
 * Create new campus partnership
 *
 * Auth: InfinitySoul admin only
 */
router.post('/campuses', async (req: Request, res: Response) => {
  try {
    const { name, region, riskContactEmail, enrollmentSize } = req.body;

    // Validate required fields
    if (!name || !region || !riskContactEmail) {
      return res.status(400).json({ error: 'Missing required fields: name, region, riskContactEmail' });
    }

    const campus = await createCampus({
      name,
      region,
      riskContactEmail,
      enrollmentSize,
      status: 'pilot',
    });

    res.status(201).json({ campus });
  } catch (error) {
    console.error('Error creating campus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/university/campuses/:campusId/pilot-config
 * Update AI pilot configuration
 *
 * Auth: Campus admin, InfinitySoul admin
 */
router.put('/campuses/:campusId/pilot-config', async (req: Request, res: Response) => {
  try {
    const { campusId } = req.params;
    const { enabledFeatures, status, notesForInsurer, notesForRegulator } = req.body;

    const config = await updateCampusPilotConfig(campusId, {
      enabledFeatures,
      status,
      notesForInsurer,
      notesForRegulator,
    });

    res.json({ config });
  } catch (error) {
    console.error('Error updating pilot config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Campus Risk Events
// ============================================================================

/**
 * GET /api/university/campuses/:campusId/risk-events
 * Retrieve campus risk events with filtering
 *
 * Query params: category, severity, status, startDate, endDate
 * Auth: Campus admin, Insurer
 */
router.get('/campuses/:campusId/risk-events', async (req: Request, res: Response) => {
  try {
    const { campusId } = req.params;
    const { category, severity, status, startDate, endDate } = req.query;

    const events = await getCampusRiskEvents(campusId, {
      category: category as string,
      severity: severity as string,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({ events, total: events.length });
  } catch (error) {
    console.error('Error retrieving risk events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/university/campuses/:campusId/risk-events
 * Create new campus risk event
 *
 * Auth: Campus admin only
 */
router.post('/campuses/:campusId/risk-events', async (req: Request, res: Response) => {
  try {
    const { campusId } = req.params;
    const { category, severity, title, description, unitId, occurredAt } = req.body;

    // Validate required fields
    if (!category || !severity || !title || !description) {
      return res.status(400).json({ error: 'Missing required fields: category, severity, title, description' });
    }

    const event = await createCampusRiskEvent({
      campusId,
      category,
      severity,
      title,
      description,
      unitId,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      status: 'open',
    });

    res.status(201).json({ event });
  } catch (error) {
    console.error('Error creating risk event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Student Risk Profiles
// ============================================================================

/**
 * GET /api/university/students/:studentId/risk-profile
 * Retrieve student risk profile
 *
 * Auth: Student (self), Campus counselor (with consent), Insurer (aggregate only)
 */
router.get('/students/:studentId/risk-profile', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const profile = await getStudentRiskProfile(studentId);

    if (!profile) {
      return res.status(404).json({ error: 'Student risk profile not found' });
    }

    // Check consent
    if (!profile.consentValid) {
      return res.status(403).json({ error: 'Student has withdrawn consent for risk profile access' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error retrieving student risk profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/university/students/:studentId/risk-profile
 * Create or update student risk profile
 *
 * Auth: Student (self-enrollment), Campus admin (with consent)
 */
router.post('/students/:studentId/risk-profile', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { campusId, riskScore, riskBand, riskDrivers, protectiveFactors, repairSuggestions, musicTraits, engagementScore } = req.body;

    // Validate required fields
    if (!campusId || riskScore === undefined || !riskBand) {
      return res.status(400).json({ error: 'Missing required fields: campusId, riskScore, riskBand' });
    }

    const profile = await createStudentRiskProfile({
      studentId,
      campusId,
      riskScore,
      riskBand,
      riskDrivers: riskDrivers || [],
      protectiveFactors: protectiveFactors || [],
      repairSuggestions: repairSuggestions || [],
      musicTraits,
      engagementScore,
      optInDate: new Date(),
      consentValid: true,
      calculatedAt: new Date(),
      modelVersion: 'v1.0.0',
    });

    res.status(201).json({ profile });
  } catch (error) {
    console.error('Error creating student risk profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/university/students/:studentId/consent
 * Update student consent status
 *
 * Auth: Student (self) only
 */
router.put('/students/:studentId/consent', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { consentValid } = req.body;

    if (consentValid === undefined) {
      return res.status(400).json({ error: 'Missing required field: consentValid' });
    }

    const profile = await updateStudentConsent(studentId, consentValid);

    res.json({ profile, message: consentValid ? 'Consent granted' : 'Consent withdrawn (data will be deleted in 30 days)' });
  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/university/students/:studentId/coaching-plan
 * Generate personalized wellness coaching plan
 *
 * Auth: Student (self), Campus counselor (with consent)
 */
router.get('/students/:studentId/coaching-plan', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const profile = await getStudentRiskProfile(studentId);

    if (!profile) {
      return res.status(404).json({ error: 'Student risk profile not found' });
    }

    if (!profile.consentValid) {
      return res.status(403).json({ error: 'Student has withdrawn consent' });
    }

    // Generate coaching plan using music coach agent
    const coachingPlan = await generateMusicCoachingPlan(profile);

    res.json({ coachingPlan });
  } catch (error) {
    console.error('Error generating coaching plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Tri-Stakeholder Reporting
// ============================================================================

/**
 * GET /api/university/campuses/:campusId/risk-summary
 * Generate campus risk summary (for Campus Risk Officer)
 *
 * Query params: timeWindow (7d, 30d, 90d, 1y)
 * Auth: Campus admin
 */
router.get('/campuses/:campusId/risk-summary', async (req: Request, res: Response) => {
  try {
    const { campusId } = req.params;
    const { timeWindow = '30d' } = req.query;

    const summary = await getCampusRiskSummary(campusId, timeWindow as '7d' | '30d' | '90d' | '1y');

    res.json({ summary });
  } catch (error) {
    console.error('Error generating campus risk summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/university/campuses/:campusId/insurer-report
 * Generate insurer report (for carrier partners)
 *
 * Query params: startDate, endDate
 * Auth: Insurer only (verified via API key)
 */
router.get('/campuses/:campusId/insurer-report', async (req: Request, res: Response) => {
  try {
    const { campusId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required query params: startDate, endDate' });
    }

    const report = await generateInsurerReport(campusId, {
      start: new Date(startDate as string),
      end: new Date(endDate as string),
    });

    res.json({ report });
  } catch (error) {
    console.error('Error generating insurer report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/university/campuses/:campusId/regulator-briefing
 * Generate regulator briefing (for state DOIs, NAIC)
 *
 * Auth: Regulator only (verified via API key), InfinitySoul admin
 */
router.get('/campuses/:campusId/regulator-briefing', async (req: Request, res: Response) => {
  try {
    const { campusId } = req.params;

    const briefing = await generateRegulatorBriefing(campusId);

    res.json({ briefing });
  } catch (error) {
    console.error('Error generating regulator briefing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/university/campuses/:campusId/tri-stakeholder-summary
 * Generate all three stakeholder reports (Campus + Insurer + Regulator)
 *
 * Auth: InfinitySoul admin only
 */
router.get('/campuses/:campusId/tri-stakeholder-summary', async (req: Request, res: Response) => {
  try {
    const { campusId } = req.params;
    const { startDate, endDate } = req.query;

    // Fetch events and student profiles
    const events = await getCampusRiskEvents(campusId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    // Get all student profiles for this campus (for aggregate metrics only)
    const students: StudentRiskProfile[] = []; // TODO: Implement getStudentsByCampus()

    // Generate tri-stakeholder summaries using university risk agent
    const { campusSummary, insurerSummary, regulatorSummary } = await summarizeCampusRisk(campusId, events, students);

    res.json({
      campusSummary,
      insurerSummary,
      regulatorSummary,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating tri-stakeholder summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Pilot Status & Health Check
// ============================================================================

/**
 * GET /api/university/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'InfinitySoul University Vertical',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
