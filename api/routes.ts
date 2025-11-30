/**
 * InfinitySol API Routes
 *
 * Core endpoints for:
 * - Domain scanning
 * - Risk assessment
 * - News aggregation
 * - Threat intelligence
 *
 * All responses include legal disclaimers and source citations.
 */

import { Router, Request, Response } from 'express';
import * as wcagScanner from '../services/wcagScanner';
import * as riskAssessment from '../services/riskAssessment';
import * as infinity8 from '../services/infinity8Score';
import * as emailTemplates from '../services/emailTemplates';
import * as newsAggregator from '../services/newsAggregator';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/v1/scan
 * Scan a domain for accessibility violations
 */
router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { domain, email } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // Run audit
    const audit = await wcagScanner.scanURL(domain);

    if (audit.status === 'failed') {
      return res.status(400).json({
        error: 'Scan failed',
        details: audit,
      });
    }

    // In production: Log to blockchain
    // const blockchainTx = await blockchainLogger.publishAudit(audit);

    res.json({
      success: true,
      auditId: audit.id,
      domain: audit.domain,
      violations: {
        critical: audit.violations.critical.length,
        serious: audit.violations.serious.length,
        moderate: audit.violations.moderate.length,
        minor: audit.violations.minor.length,
      },
      wcagAACompliant: audit.stats.wcagAACompliant,
      totalViolations: audit.stats.totalViolations,
      timestamp: audit.timestamp,
      reportUrl: `/api/v1/reports/${audit.id}`,
      disclaimer:
        'This is a technical audit based on WCAG 2.2 standards. It is not legal advice. See /legal/UPL_COMPLIANCE.md for details.',
      dataSources: [
        'WCAG 2.2 (https://www.w3.org/WAI/WCAG22/)',
        'axe-core (https://github.com/dequelabs/axe-core)',
      ],
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/v1/reports/:auditId
 * Retrieve detailed audit report
 */
router.get('/reports/:auditId', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;

    // In production: Fetch from database or IPFS
    // For now, return placeholder
    res.json({
      auditId,
      status: 'not_found',
      message: 'Report storage not yet implemented. See deployment guide.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

/**
 * POST /api/v1/risk-assessment
 * Calculate litigation risk based on audit + industry
 */
router.post('/risk-assessment', async (req: Request, res: Response) => {
  try {
    const { auditId, domain, industry } = req.body;

    // This would typically fetch audit from DB
    // For demo, create minimal audit object
    const audit = {
      id: auditId,
      domain,
      timestamp: new Date(),
      status: 'completed' as const,
      violations: {
        critical: [],
        serious: [],
        moderate: [],
        minor: [],
      },
      validation: {
        automated: {
          tool: 'axe-core' as const,
          version: '4.7.2',
          status: 'fail' as const,
        },
      },
      stats: {
        totalViolations: 23,
        criticalCount: 3,
        seriousCount: 8,
        pagesScanned: 1,
        wcagAACompliant: false,
        wcagAAACompliant: false,
      },
      url: `https://${domain}`,
    };

    const assessment = riskAssessment.assessRisk(audit, industry);
    const explanation = riskAssessment.explainRisk(assessment, industry);

    res.json({
      riskAssessment: assessment,
      explanation,
      disclaimer:
        'This is statistical analysis based on public litigation data. It is not a legal opinion or guarantee of outcomes.',
      dataSources: [
        'PACER (Public Access to Court Electronic Records)',
        'CourtListener/RECAP',
        'Public federal court decisions',
      ],
    });
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({ error: 'Failed to calculate risk assessment' });
  }
});

/**
 * POST /api/v1/infinity8-score
 * Calculate Infinity8 compliance score (0-1000)
 */
router.post('/infinity8-score', async (req: Request, res: Response) => {
  try {
    const { auditId, domain, industry } = req.body;

    // Fetch audit and risk assessment (simplified for demo)
    // In production: fetch from database
    const mockAudit = {
      id: auditId,
      domain,
      timestamp: new Date(),
      status: 'completed' as const,
      violations: {
        critical: [],
        serious: [],
        moderate: [],
        minor: [],
      },
      validation: {
        automated: {
          tool: 'axe-core' as const,
          version: '4.7.2',
          status: 'fail' as const,
        },
      },
      stats: {
        totalViolations: 23,
        criticalCount: 3,
        seriousCount: 8,
        pagesScanned: 1,
        wcagAACompliant: false,
        wcagAAACompliant: false,
      },
      url: `https://${domain}`,
    };

    const mockRiskAssessment = riskAssessment.assessRisk(mockAudit, industry);
    const score = infinity8.calculateInfinity8Score(mockAudit, mockRiskAssessment, industry);
    const report = infinity8.generateScoreReport(score);

    res.json({
      score,
      report,
      disclaimer:
        'This score is a technical measurement, not a legal judgment. See /legal/UPL_COMPLIANCE.md for disclaimer.',
    });
  } catch (error) {
    console.error('Score calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate Infinity8 score' });
  }
});

/**
 * GET /api/v1/news/live
 * Real-time litigation news feed
 */
router.get('/news/live', async (req: Request, res: Response) => {
  try {
    const latestNews = newsAggregator.getLatestNews({ limit: 20 });

    res.json({
      news: latestNews,
      count: latestNews.length,
      lastUpdated: new Date(),
      disclaimer: 'All data sourced from public records. See /legal/UPL_COMPLIANCE.md',
      dataSources: ['CourtListener', 'PACER', 'Public news archives'],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

/**
 * GET /api/v1/news/litigation
 * Litigation-specific news
 */
router.get('/news/litigation', async (req: Request, res: Response) => {
  try {
    const industry = req.query.industry as string | undefined;
    const news = newsAggregator.getLitigationNews(industry);

    res.json({
      news,
      count: news.length,
      industry: industry || 'all',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch litigation news' });
  }
});

/**
 * GET /api/v1/threats/live
 * Live threat ticker (for news aggregator UI)
 */
router.get('/threats/live', async (req: Request, res: Response) => {
  try {
    const litigation = newsAggregator.getLitigationNews();
    const regulatory = newsAggregator.getRegulatoryNews();
    const plaintiffs = newsAggregator.getPlaintiffActivityFeed();

    const totalSettled = litigation
      .filter((n) => n.litigationData?.settlement)
      .reduce((sum, n) => sum + (n.litigationData?.settlement || 0), 0);

    res.json({
      casesFiledToday: 12, // Would be real data in production
      casesThisWeek: 47,
      casesThisMonth: 128,
      recentSettlements: litigation.slice(0, 5),
      regulatoryUpdates: regulatory.slice(0, 5),
      activePlaintiffs: plaintiffs.mostActivePlaintiffs,
      totalSettledThisMonth: totalSettled,
      trend: 'increasing',
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threat data' });
  }
});

/**
 * GET /api/v1/threats/:industry
 * Threat profile for specific industry
 */
router.get('/threats/:industry', async (req: Request, res: Response) => {
  try {
    const { industry } = req.params;

    const threat = newsAggregator.generateIndustryThreatReport(industry);

    res.json({
      industry,
      threatReport: threat,
      timestamp: new Date(),
      disclaimer: 'Based on public litigation data. Not a legal opinion.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threat profile' });
  }
});

/**
 * POST /api/v1/email-template
 * Generate email template for outreach
 */
router.post('/email-template', async (req: Request, res: Response) => {
  try {
    const { type, companyName, domain, industry } = req.body;

    let template;

    if (type === 'cold-prospect') {
      // Simplified - would need actual audit data in production
      template = emailTemplates.generateColdProspectEmail(
        companyName,
        domain,
        {
          id: uuidv4(),
          domain,
          url: `https://${domain}`,
          timestamp: new Date(),
          status: 'completed',
          violations: { critical: [], serious: [], moderate: [], minor: [] },
          validation: {
            automated: { tool: 'axe-core', version: '4.7.2', status: 'fail' },
          },
          stats: {
            totalViolations: 23,
            criticalCount: 3,
            seriousCount: 8,
            pagesScanned: 1,
            wcagAACompliant: false,
            wcagAAACompliant: false,
          },
        },
        riskAssessment.assessRisk(
          {
            id: uuidv4(),
            domain,
            url: `https://${domain}`,
            timestamp: new Date(),
            status: 'completed',
            violations: { critical: [], serious: [], moderate: [], minor: [] },
            validation: {
              automated: { tool: 'axe-core', version: '4.7.2', status: 'fail' },
            },
            stats: {
              totalViolations: 23,
              criticalCount: 3,
              seriousCount: 8,
              pagesScanned: 1,
              wcagAACompliant: false,
              wcagAAACompliant: false,
            },
          },
          industry
        ),
        {
          id: uuidv4(),
          domain,
          score: 520,
          grade: 'D',
          factors: {
            wcagCompliance: 45,
            litigationHistory: 65,
            remediationVelocity: 50,
            industryBenchmark: 40,
            thirdPartyValidation: 0,
          },
          marketImpact: {
            insurancePremiumDelta: 47,
            rfpWinRateDelta: -35,
            enterprisePartnershipScore: 420,
            creditScore: 'poor',
          },
          history: [],
          lastUpdated: new Date(),
        }
      );
    } else {
      return res.status(400).json({ error: 'Unknown template type' });
    }

    res.json({
      template,
      disclaimer: 'Ensure all claims are factual before sending. Review /legal/UPL_COMPLIANCE.md',
    });
  } catch (error) {
    console.error('Email template error:', error);
    res.status(500).json({ error: 'Failed to generate email template' });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

export default router;
