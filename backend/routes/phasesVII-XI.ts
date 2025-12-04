/**
 * Phases VII-XI: Comprehensive API Routes
 * Case Management, Legal Reasoning, Litigation Strategy, Compliance Transformation, Enterprise Ecosystem
 */

import express, { Request, Response } from 'express';
import caseService from '../services/caseManagement/caseService';
import reasoningEngine from '../services/legalReasoning/reasoningEngine';
import strategyEngine from '../services/litigation/strategyPrediction';
import complianceEngine from '../services/compliance/transformationEngine';
import ecosystemService from '../services/enterprise/platformEcosystem';

const router = express.Router();

// ============================================================================
// PHASE VII: CASE MANAGEMENT ROUTES
// ============================================================================

// POST /cases - Create new litigation case
router.post('/cases', async (req: Request, res: Response) => {
  try {
    const result = await caseService.createCase(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /cases - List all cases with filtering
router.get('/cases', async (req: Request, res: Response) => {
  try {
    const result = await caseService.listCases({
      status: req.query.status as string,
      defendant: req.query.defendant as string,
      jurisdiction: req.query.jurisdiction as string,
      priority: req.query.priority as string,
      skip: parseInt(req.query.skip as string) || 0,
      take: parseInt(req.query.take as string) || 50,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /cases/:caseId - Get case dashboard with analysis
router.get('/cases/:caseId', async (req: Request, res: Response) => {
  try {
    const dashboard = await caseService.getCaseDashboard(req.params.caseId);
    res.status(200).json(dashboard);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

// POST /cases/:caseId/analyze - Analyze case strength
router.post('/cases/:caseId/analyze', async (req: Request, res: Response) => {
  try {
    const strength = await caseService.analyzeCaseStrength(req.params.caseId);
    const financial = await caseService.analyzeFinancialExposure(req.params.caseId);
    res.status(200).json({ strength, financial });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /cases/:caseId/status - Update case status
router.put('/cases/:caseId/status', async (req: Request, res: Response) => {
  try {
    const result = await caseService.updateCaseStatus(
      req.params.caseId,
      req.body.newStatus,
      req.body.reason,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /cases/:caseId/deadline - Add deadline to timeline
router.post('/cases/:caseId/deadline', async (req: Request, res: Response) => {
  try {
    const timeline = await caseService.addDeadline(
      req.params.caseId,
      req.body.title,
      new Date(req.body.date),
      req.body.description,
    );
    res.status(201).json(timeline);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /cases/:caseId/summary - Generate case summary
router.get('/cases/:caseId/summary', async (req: Request, res: Response) => {
  try {
    const summary = await caseService.generateCaseSummary(req.params.caseId);
    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================================
// PHASE VIII: LEGAL REASONING ROUTES
// ============================================================================

// POST /legal-opinions - Generate legal memorandum
router.post('/legal-opinions', async (req: Request, res: Response) => {
  try {
    const result = await reasoningEngine.generateLegalMemorandum(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /argumentative-chains - Build argumentation chain
router.post('/argumentative-chains', async (req: Request, res: Response) => {
  try {
    const chain = await reasoningEngine.buildArgumentativeChain(req.body);
    res.status(201).json(chain);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /legal-briefs/outline - Generate brief outline
router.post('/legal-briefs/outline', async (req: Request, res: Response) => {
  try {
    const brief = await reasoningEngine.generateBriefOutline(req.body);
    res.status(201).json(brief);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /precedent-research - Analyze precedent
router.post('/precedent-research', async (req: Request, res: Response) => {
  try {
    const precedent = await reasoningEngine.analyzePrecedent(
      req.body.caseTitle,
      req.body.criteria,
    );
    res.status(201).json(precedent);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /demand-letters - Generate demand letter
router.post('/demand-letters', async (req: Request, res: Response) => {
  try {
    const letter = await reasoningEngine.generateDemandLetter(req.body);
    res.status(201).json(letter);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /settlement-negotiations/:caseId - Conduct negotiation round
router.post('/settlement-negotiations/:caseId', async (req: Request, res: Response) => {
  try {
    const result = await reasoningEngine.conductNegotiationRound(
      req.params.caseId,
      req.body.round,
      req.body.theirOffer,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================================
// PHASE IX: LITIGATION STRATEGY ROUTES
// ============================================================================

// POST /opposing-counsel - Profile opposing counsel
router.post('/opposing-counsel', async (req: Request, res: Response) => {
  try {
    const profile = await strategyEngine.profileOpposingCounsel(
      req.body.name,
      req.body.recentCases,
    );
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /judges - Profile judge
router.post('/judges', async (req: Request, res: Response) => {
  try {
    const profile = await strategyEngine.profileJudge(
      req.body.name,
      req.body.court,
      req.body.state,
    );
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /strategy-recommendations - Get strategy recommendation
router.post('/strategy-recommendations', async (req: Request, res: Response) => {
  try {
    const recommendation = await strategyEngine.recommendStrategy(req.body);
    res.status(200).json(recommendation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /outcome-predictions - Predict litigation outcome
router.post('/outcome-predictions', async (req: Request, res: Response) => {
  try {
    const prediction = await strategyEngine.predictOutcome(
      req.body.caseNumber,
      req.body.context,
    );
    res.status(201).json(prediction);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /comparable-cases - Find comparable cases
router.get('/comparable-cases', async (req: Request, res: Response) => {
  try {
    const comparables = await strategyEngine.findComparableCases(req.body);
    res.status(200).json(comparables);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================================
// PHASE X: COMPLIANCE TRANSFORMATION ROUTES
// ============================================================================

// POST /compliance-projects - Create remediation project
router.post('/compliance-projects', async (req: Request, res: Response) => {
  try {
    const plan = await complianceEngine.createRemediationProject(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /compliance-projects/:projectId/execute - Execute automated remediation
router.post('/compliance-projects/:projectId/execute', async (req: Request, res: Response) => {
  try {
    const result = await complianceEngine.executeAutomatedRemediation(req.params.projectId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /property-sync - Sync remediation across properties
router.post('/property-sync', async (req: Request, res: Response) => {
  try {
    const result = await complianceEngine.syncRemediationAcrossProperties(
      req.body.projectId,
      req.body.sourceProperty,
      req.body.targetProperties,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /drift-detection - Detect compliance drift
router.post('/drift-detection', async (req: Request, res: Response) => {
  try {
    const drift = await complianceEngine.detectComplianceDrift(
      req.body.domain,
      req.body.url,
    );
    res.status(200).json(drift);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /compliance-reports/:domain - Generate compliance report
router.get('/compliance-reports/:domain', async (req: Request, res: Response) => {
  try {
    const report = await complianceEngine.generateComplianceReport(
      req.params.domain,
      req.query.projectId as string,
    );
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================================
// PHASE XI: ENTERPRISE ECOSYSTEM ROUTES
// ============================================================================

// POST /enterprise-accounts - Create enterprise account
router.post('/enterprise-accounts', async (req: Request, res: Response) => {
  try {
    const result = await ecosystemService.createEnterpriseAccount(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /enterprise-accounts/:accountId/white-label - Configure white-label
router.post('/enterprise-accounts/:accountId/white-label', async (req: Request, res: Response) => {
  try {
    const config = await ecosystemService.configureWhiteLabel(
      req.params.accountId,
      req.body,
    );
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /enterprise-accounts/:accountId/integrations - Add API integration
router.post('/enterprise-accounts/:accountId/integrations', async (req: Request, res: Response) => {
  try {
    const integration = await ecosystemService.addAPIIntegration(
      req.params.accountId,
      req.body,
    );
    res.status(201).json(integration);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /enterprise-accounts/:accountId/integrations/:integrationId/test - Test integration
router.post(
  '/enterprise-accounts/:accountId/integrations/:integrationId/test',
  async (req: Request, res: Response) => {
    try {
      const result = await ecosystemService.testIntegration(req.params.integrationId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

// POST /enterprise-accounts/:accountId/features - Grant feature access
router.post('/enterprise-accounts/:accountId/features', async (req: Request, res: Response) => {
  try {
    const featureAccess = await ecosystemService.grantFeatureAccess(
      req.params.accountId,
      req.body,
    );
    res.status(201).json(featureAccess);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /partnerships - Create partnership
router.post('/partnerships', async (req: Request, res: Response) => {
  try {
    const agreement = await ecosystemService.createPartnership(req.body);
    res.status(201).json(agreement);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /enterprise-accounts/:accountId/usage - Track usage
router.post('/enterprise-accounts/:accountId/usage', async (req: Request, res: Response) => {
  try {
    const metrics = await ecosystemService.trackUsage(req.params.accountId, req.body);
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /enterprise-accounts/:accountId/analytics - Get usage analytics
router.get('/enterprise-accounts/:accountId/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await ecosystemService.getUsageAnalytics(
      req.params.accountId,
      parseInt(req.query.months as string) || 3,
    );
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /enterprise-accounts/:accountId/subscription - Update subscription
router.put('/enterprise-accounts/:accountId/subscription', async (req: Request, res: Response) => {
  try {
    const result = await ecosystemService.updateSubscription(
      req.params.accountId,
      req.body.newTier,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /enterprise-accounts/:accountId/dashboard - Get account dashboard
router.get('/enterprise-accounts/:accountId/dashboard', async (req: Request, res: Response) => {
  try {
    const dashboard = await ecosystemService.getAccountDashboard(req.params.accountId);
    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    phases: ['VII', 'VIII', 'IX', 'X', 'XI'],
  });
});

export default router;
