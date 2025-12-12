/**
 * Insurance Compliance Hub - API Routes
 *
 * RESTful API endpoints for the Insurance Hub functionality:
 * - Risk Assessment
 * - Lucy Chat
 * - Compliance Audits
 * - Lead Management
 * - Quote Requests
 */

import { Router, Request, Response } from 'express';
import {
  insuranceHub,
  INDUSTRY_RISK_PROFILES,
} from '../services/insuranceComplianceHub';
import type {
  StartAssessmentRequest,
  SubmitAssessmentRequest,
  LucyChatRequest,
  RequestQuoteRequest,
  InsuranceLine,
  IndustryVertical,
} from '../services/insuranceComplianceHub/types';
// Nitpick #8: Import safe parsing utilities
import { safeParseInt, validateUrl, formatErrorResponse, parseRangeValue } from '../utils/errors';

const router = Router();

// =============================================================================
// CONFIGURATION ENDPOINTS
// =============================================================================

/**
 * GET /api/insurance-hub/config/lines
 * Get all insurance line configurations
 */
router.get('/config/lines', (_req: Request, res: Response) => {
  try {
    const lines = insuranceHub.getAllLineConfigs();
    res.json({
      success: true,
      data: lines,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/config/lines/:line
 * Get configuration for a specific insurance line
 */
router.get('/config/lines/:line', (req: Request, res: Response) => {
  try {
    const line = req.params.line as InsuranceLine;
    const config = insuranceHub.getLineConfig(line);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: `Insurance line '${line}' not found`,
      });
    }

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/config/industries
 * Get all industry risk profiles
 */
router.get('/config/industries', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: INDUSTRY_RISK_PROFILES,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/config/industries/:industry
 * Get risk profile for a specific industry
 */
router.get('/config/industries/:industry', (req: Request, res: Response) => {
  try {
    const industry = req.params.industry as IndustryVertical;
    const profile = insuranceHub.getIndustryProfile(industry);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Industry '${industry}' not found`,
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/config/industries/:industry/recommended
 * Get recommended coverage for an industry
 */
router.get('/config/industries/:industry/recommended', (req: Request, res: Response) => {
  try {
    const industry = req.params.industry as IndustryVertical;
    const recommended = insuranceHub.getRecommendedCoverage(industry);

    res.json({
      success: true,
      data: recommended,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/lead-magnets
 * Get all available lead magnets
 */
router.get('/lead-magnets', (req: Request, res: Response) => {
  try {
    const line = req.query.line as InsuranceLine | undefined;

    if (line && !INSURANCE_LINE_CONFIGS[line]) {
      return res.status(400).json({
        success: false,
        error: `Insurance line '${line}' not found`,
      });
    }


    res.json({
      success: true,
      data: leadMagnets,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

// =============================================================================
// RISK ASSESSMENT ENDPOINTS
// =============================================================================

/**
 * POST /api/insurance-hub/assessment/start
 * Start a new risk assessment
 */
router.post('/assessment/start', async (req: Request, res: Response) => {
  try {
    const request: StartAssessmentRequest = req.body;

    if (!request.email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const result = await insuranceHub.startAssessment(request);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * POST /api/insurance-hub/assessment/:id/submit
 * Submit assessment data
 */
router.post('/assessment/:id/submit', async (req: Request, res: Response) => {
  try {
    const assessmentId = req.params.id;
    const request: SubmitAssessmentRequest = {
      assessmentId,
      data: req.body,
    };

    const result = await insuranceHub.submitAssessment(request);

    res.status(202).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if ((error as Error).message === 'Assessment not found') {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found',
      });
    }
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/assessment/:id/status
 * Get assessment results/status
 */
router.get('/assessment/:id/status', async (req: Request, res: Response) => {
  try {
    const assessmentId = req.params.id;
    const result = await insuranceHub.getAssessmentResults(assessmentId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if ((error as Error).message === 'Assessment not found') {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found',
      });
    }
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * POST /api/insurance-hub/assessment/commission-stack
 * Calculate potential commission stack for a prospect
 */
router.post('/assessment/commission-stack', (req: Request, res: Response) => {
  try {
    const { industry, employeeCount, annualRevenue } = req.body;

    if (!industry) {
      return res.status(400).json({
        success: false,
        error: 'industry is required',
      });
    }

    // Nitpick #8: Use parseRangeValue to handle ranges like "1-10" or "500K-2M"
    const employeeResult = parseRangeValue(employeeCount);
    if (!employeeResult.success) {
      return res.status(400).json({
        success: false,
        error: `Invalid employeeCount: ${employeeResult.error.message}`,
      });
    }

    const revenueResult = parseRangeValue(annualRevenue);
    if (!revenueResult.success) {
      return res.status(400).json({
        success: false,
        error: `Invalid annualRevenue: ${revenueResult.error.message}`,
      });
    }

    const typedIndustry = industry as IndustryVertical;

    if (!INDUSTRY_RISK_PROFILES[typedIndustry]) {
      return res.status(400).json({
        success: false,
        error: `Industry '${industry}' not found`,
      });
    }

    const stack = insuranceHub.calculateCommissionStack(
      typedIndustry,
      employeeResult.value,
      revenueResult.value
    );

    const totalPremium = stack.reduce((sum, s) => sum + s.premium, 0);
    const totalCommission = stack.reduce((sum, s) => sum + s.commission, 0);

    res.json({
      success: true,
      data: {
        stack,
        totalPremium,
        totalCommission,
        lifetimeValue: totalCommission * 5, // Assuming 5-year average customer life
      },
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

// =============================================================================
// LUCY CHAT ENDPOINTS
// =============================================================================

/**
 * POST /api/insurance-hub/lucy/chat
 * Send a message to Lucy and get a response
 */
router.post('/lucy/chat', async (req: Request, res: Response) => {
  try {
    const request: LucyChatRequest = req.body;

    if (!request.message) {
      return res.status(400).json({
        success: false,
        error: 'message is required',
      });
    }

    if (!insuranceHub) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error: insuranceHub is not initialized',
      });
    }
    const lucy = insuranceHub.getLucy();
    const result = await lucy.chat(request);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/lucy/greeting
 * Get Lucy's welcome greeting
 */
router.get('/lucy/greeting', async (req: Request, res: Response) => {
  try {
    const industry = req.query.industry as IndustryVertical | undefined;
    const companyName = req.query.company as string | undefined;

    const lucy = insuranceHub.getLucy();
    const greeting = await lucy.getWelcomeGreeting(
      industry || companyName ? { industry, companyName } : undefined
    );

    res.json({
      success: true,
      data: { greeting },
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/lucy/topic/:topic
 * Get Lucy's intro for a specific topic
 */
router.get('/lucy/topic/:topic', (req: Request, res: Response) => {
  try {
    const topic = req.params.topic as InsuranceLine | 'compliance';
    const lucy = insuranceHub.getLucy();
    const intro = lucy.getTopicIntro(topic);

    res.json({
      success: true,
      data: { intro },
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/lucy/knowledge
 * Look up answer from Lucy's knowledge base
 */
router.get('/lucy/knowledge', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter q is required',
      });
    }

    const lucy = insuranceHub.getLucy();
    const result = lucy.lookupKnowledge(query);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'No knowledge found for this query',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

// =============================================================================
// COMPLIANCE AUDIT ENDPOINTS
// =============================================================================

/**
 * POST /api/insurance-hub/audit
 * Run a compliance audit on a website
 */
router.post('/audit', async (req: Request, res: Response) => {
  try {
    const { websiteUrl, industry } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({
        success: false,
        error: 'websiteUrl is required',
      });
    }

    // Validate URL to prevent SSRF
    const urlValidation = validateUrl(websiteUrl);
    if (!urlValidation.success) {
      return res.status(400).json({
        success: false,
        error: urlValidation.error.message,
      });
    }

    const complianceDisplay = insuranceHub.getComplianceDisplay();
    const summary = await complianceDisplay.runAudit(websiteUrl, industry);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * POST /api/insurance-hub/audit/report
 * Generate a full compliance audit report
 */
router.post('/audit/report', async (req: Request, res: Response) => {
  try {
    const { websiteUrl, industry } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({
        success: false,
        error: 'websiteUrl is required',
      });
    }

    // Validate URL to prevent SSRF
    const urlValidation = validateUrl(websiteUrl);
    if (!urlValidation.success) {
      return res.status(400).json({
        success: false,
        error: urlValidation.error.message,
      });
    }

    const complianceDisplay = insuranceHub.getComplianceDisplay();
    const summary = await complianceDisplay.runAudit(websiteUrl, industry || 'other');
    const report = await complianceDisplay.generateReport(websiteUrl, summary, industry || 'other');

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

// =============================================================================
// QUOTE REQUEST ENDPOINTS
// =============================================================================

/**
 * POST /api/insurance-hub/quote
 * Request quotes for specific insurance lines
 */
router.post('/quote', async (req: Request, res: Response) => {
  try {
    const request: RequestQuoteRequest = req.body;

    if (!request.leadId || !request.lines || request.lines.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'leadId and at least one insurance line are required',
      });
    }

    const result = await insuranceHub.requestQuote(request);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if ((error as Error).message === 'Lead not found') {
      return res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
    }
    res.status(500).json(formatErrorResponse(error));
  }
});

// =============================================================================
// LEAD FUNNEL ENDPOINTS
// =============================================================================

/**
 * GET /api/insurance-hub/funnel/metrics
 * Get funnel metrics (admin only)
 */
router.get('/funnel/metrics', (_req: Request, res: Response) => {
  try {
    const leadFunnel = insuranceHub.getLeadFunnel();
    const metrics = leadFunnel.getFunnelMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/funnel/sequences
 * Get available nurture sequences
 */
router.get('/funnel/sequences', (_req: Request, res: Response) => {
  try {
    const leadFunnel = insuranceHub.getLeadFunnel();
    const sequences = leadFunnel.getAvailableSequences();

    res.json({
      success: true,
      data: sequences,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

/**
 * GET /api/insurance-hub/funnel/priority-leads
 * Get high-priority leads for follow-up
 */
router.get('/funnel/priority-leads', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leadFunnel = insuranceHub.getLeadFunnel();
    const leads = leadFunnel.getHighPriorityLeads(limit);

    res.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

// =============================================================================
// COMMISSION TRACKING ENDPOINTS
// =============================================================================

/**
 * GET /api/insurance-hub/commissions
 * Get commission summary (admin only)
 */
router.get('/commissions', async (_req: Request, res: Response) => {
  try {
    const summary = await insuranceHub.getCommissionSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json(formatErrorResponse(error));
  }
});

// =============================================================================
// HEALTH CHECK
// =============================================================================

/**
 * GET /api/insurance-hub/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'Insurance Compliance Hub',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
