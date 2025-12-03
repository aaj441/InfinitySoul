/**
 * Phase III — Risk Underwriting API Routes
 * Insurance-grade endpoints for compliance scoring and risk pricing
 */

import express, { Request, Response } from 'express';
import { computeRiskPricing, calculatePoolStatistics } from '../services/risk/riskPricingEngine';
import { computeComplianceScore } from '../services/risk/complianceScore';
import { runConsensusScan } from '../services/risk/consensusEngine';
import type { RiskPricingInput, RiskPricingOutput } from '../services/risk/riskPricingEngine';
import type { ComplianceScoringInput } from '../services/risk/complianceScore';

const router = express.Router();

// ============================================================================
// Risk Pricing Endpoints
// ============================================================================

/**
 * POST /api/v1/risk/pricing
 * Calculate insurance-grade risk pricing for a domain
 */
router.post('/pricing', (req: Request, res: Response) => {
  try {
    const input: RiskPricingInput = {
      criticalViolations: req.body.criticalViolations || 0,
      seriousViolations: req.body.seriousViolations || 0,
      moderateViolations: req.body.moderateViolations || 0,
      minorViolations: req.body.minorViolations || 0,
      jurisdiction: req.body.jurisdiction || 'CA',
      industry: req.body.industry || 'technology',
      publicLawsuits: req.body.publicLawsuits,
      serialPlaintiffThreat: req.body.serialPlaintiffThreat || false,
      platformRisk: req.body.platformRisk,
      previousScore: req.body.previousScore,
      daysSincePreviousScan: req.body.daysSincePreviousScan,
      monthlyVisitors: req.body.monthlyVisitors,
      annualRevenue: req.body.annualRevenue,
      mediaExposureRisk: req.body.mediaExposureRisk,
      companySize: req.body.companySize,
      estimatedRevenue: req.body.estimatedRevenue,
    };

    const result = computeRiskPricing(input);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Risk pricing calculation failed',
    });
  }
});

/**
 * POST /api/v1/risk/batch-pricing
 * Calculate risk pricing for multiple domains (insurance pool analysis)
 */
router.post('/batch-pricing', (req: Request, res: Response) => {
  try {
    const inputs: RiskPricingInput[] = req.body.sites || [];

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request must contain array of sites',
      });
    }

    const results: RiskPricingOutput[] = inputs.map((input) =>
      computeRiskPricing(input)
    );

    const poolStats = calculatePoolStatistics(results);

    res.status(200).json({
      success: true,
      data: {
        results,
        poolStatistics: poolStats,
        siteCount: results.length,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Batch risk pricing calculation failed',
    });
  }
});

// ============================================================================
// Compliance Credit Score Endpoints
// ============================================================================

/**
 * POST /api/v1/risk/compliance-score
 * Calculate CCS v2.0 (0-850) compliance credit score
 */
router.post('/compliance-score', (req: Request, res: Response) => {
  try {
    const input: ComplianceScoringInput = {
      criticalViolations: req.body.criticalViolations || 0,
      seriousViolations: req.body.seriousViolations || 0,
      moderateViolations: req.body.moderateViolations || 0,
      minorViolations: req.body.minorViolations || 0,
      jurisdiction: req.body.jurisdiction || 'CA',
      industry: req.body.industry || 'technology',
      publicLawsuits: req.body.publicLawsuits,
      serialPlaintiffThreat: req.body.serialPlaintiffThreat,
      platformRisk: req.body.platformRisk,
      previousScore: req.body.previousScore,
      daysSincePreviousScan: req.body.daysSincePreviousScan,
      monthlyVisitors: req.body.monthlyVisitors,
      annualRevenue: req.body.annualRevenue,
      mediaExposureRisk: req.body.mediaExposureRisk,
    };

    const result = computeComplianceScore(input);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Compliance score calculation failed',
    });
  }
});

// ============================================================================
// Multi-Engine Consensus Scanning Endpoints
// ============================================================================

/**
 * POST /api/v1/risk/consensus-scan
 * Run consensus scan with multiple accessibility engines
 * Returns violations agreed upon by 2+ engines
 */
router.post('/consensus-scan', async (req: Request, res: Response) => {
  try {
    const url = req.body.url;
    const engines = req.body.engines || ['axe', 'pa11y', 'wave', 'lighthouse'];

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    // In production, this would orchestrate real scanning
    const result = await runConsensusScan(url, engines);

    res.status(202).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Consensus scan failed',
    });
  }
});

/**
 * GET /api/v1/risk/consensus-scan/:jobId/status
 * Poll consensus scan job status
 */
router.get('/consensus-scan/:jobId/status', (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;

    // In production, query job status from queue
    // For now, return mock response
    res.status(200).json({
      success: true,
      data: {
        jobId,
        status: 'completed',
        url: 'https://example.com',
        progress: 100,
        consensusViolations: [],
        statistics: {
          criticalCount: 0,
          seriousCount: 0,
          moderateCount: 0,
          minorCount: 0,
          totalCount: 0,
          avgConfidence: 0.95,
          allEnginesSuccessful: true,
          executionTimeMs: 5000,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get scan status',
    });
  }
});

// ============================================================================
// Risk Assessment Report Endpoints
// ============================================================================

/**
 * GET /api/v1/risk/report/:domain
 * Generate executive risk assessment PDF
 */
router.get('/report/:domain', (req: Request, res: Response) => {
  try {
    const domain = req.params.domain;

    // In production, fetch risk assessment from database
    // Generate PDF with charts, recommendations, etc.

    res.status(200).json({
      success: true,
      data: {
        domain,
        reportId: `RPT-${Date.now()}`,
        reportUrl: `/reports/risk-${domain}-${Date.now()}.pdf`,
        generatedAt: new Date(),
        format: 'pdf',
        pages: 5,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Report generation failed',
    });
  }
});

/**
 * GET /api/v1/risk/heatmap
 * Get jurisdiction risk heat map data
 */
router.get('/heatmap', (req: Request, res: Response) => {
  try {
    // Return heatmap data for visualization
    res.status(200).json({
      success: true,
      data: {
        type: 'us-state-heatmap',
        title: 'ADA Litigation Risk by Jurisdiction',
        states: {
          CA: 0.95,
          NY: 0.92,
          FL: 0.88,
          IL: 0.85,
          TX: 0.82,
          // ... more states
        },
        scale: {
          min: 0,
          max: 1.0,
          colors: {
            high: '#FF4444',
            medium: '#FFAA00',
            low: '#44DD44',
          },
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Heatmap generation failed',
    });
  }
});

// ============================================================================
// Health & Status Endpoints
// ============================================================================

/**
 * GET /api/v1/risk/health
 * Health check for risk underwriting engine
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: 'Risk Underwriting Engine (Phase III)',
    status: 'operational',
    version: '3.0.0',
    engines: {
      scoring: 'v2.0-CCS',
      pricing: 'v1.0-insurance-grade',
      consensus: 'multi-engine',
    },
    timestamp: new Date(),
  });
});

export default router;
