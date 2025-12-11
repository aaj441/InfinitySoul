/**
 * Cyber Insurance MGA API Routes
 * 
 * Implements Kluge Playbook endpoints:
 * 1. MGA acquisition target filtering
 * 2. Agentic underwriting API
 * 3. Portfolio management
 */

import express, { Request, Response } from 'express';
import { MGATarget } from './mga/mgaTypes';
import { calculateMGAAcquisitionScore, filterMGATargets, KLUGE_FILTER_CRITERIA } from './mga/mgaAcquisitionFilter';
import { underwriter, RiskAssessmentRequest } from './underwriting/agenticUnderwriter';
import { portfolioEngine } from './portfolio/mgaPortfolioEngine';

const router = express.Router();

/**
 * GET /api/cyber-insurance/kluge-criteria
 * 
 * Get Kluge acquisition filter criteria
 */
router.get('/kluge-criteria', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: KLUGE_FILTER_CRITERIA,
    description: 'Kluge Playbook acquisition criteria for distressed cyber MGAs',
  });
});

/**
 * POST /api/cyber-insurance/evaluate-mga
 * 
 * Evaluate single MGA target
 */
router.post('/evaluate-mga', (req: Request, res: Response) => {
  try {
    const target: MGATarget = req.body;
    
    if (!target.id || !target.name) {
      return res.status(400).json({
        success: false,
        error: 'Invalid MGA target: missing required fields (id, name)',
      });
    }
    
    const score = calculateMGAAcquisitionScore(target);
    
    res.json({
      success: true,
      data: {
        target: {
          id: target.id,
          name: target.name,
          annualPremium: target.annualPremium,
          combinedRatio: target.combinedRatio,
        },
        score,
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
 * POST /api/cyber-insurance/filter-mgas
 * 
 * Filter multiple MGA targets
 */
router.post('/filter-mgas', (req: Request, res: Response) => {
  try {
    const targets: MGATarget[] = req.body.targets;
    
    if (!Array.isArray(targets)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: targets must be an array',
      });
    }
    
    const result = filterMGATargets(targets);
    
    res.json({
      success: true,
      data: result,
      summary: {
        evaluated: result.summary.totalEvaluated,
        qualified: result.summary.qualified,
        recommended: result.summary.recommended,
        avgScore: result.summary.avgScore,
        avgIRR: result.summary.avgIRR,
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
 * POST /api/cyber-insurance/underwrite
 * 
 * Agentic underwriting API - price risk in real-time
 */
router.post('/underwrite', async (req: Request, res: Response) => {
  try {
    const request: RiskAssessmentRequest = {
      ...req.body,
      requestedAt: new Date(),
    };
    
    // Validate required fields
    if (!request.applicantName || !request.industry || !request.coverageAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: applicantName, industry, coverageAmount',
      });
    }
    
    const assessment = await underwriter.assessRisk(request);
    
    res.json({
      success: true,
      data: assessment,
      processing: {
        timeMs: assessment.processingTimeMs,
        klugePrinciple: '30 seconds vs 30 days - agent replaces underwriter',
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
 * GET /api/cyber-insurance/loss-ratio-stats
 * 
 * Get loss ratio statistics from claims graph
 */
router.get('/loss-ratio-stats', (req: Request, res: Response) => {
  try {
    const stats = underwriter.getLossRatioStats();
    
    res.json({
      success: true,
      data: stats,
      description: 'Centralized claims graph statistics - the Kluge monopoly',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/cyber-insurance/portfolio/init
 * 
 * Initialize MGA portfolio
 */
router.post('/portfolio/init', (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Portfolio name required',
      });
    }
    
    const portfolio = portfolioEngine.initializePortfolio(name);
    
    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/cyber-insurance/portfolio/add-mga
 * 
 * Add MGA to portfolio
 */
router.post('/portfolio/add-mga', (req: Request, res: Response) => {
  try {
    const mga: MGATarget = req.body;
    
    portfolioEngine.addMGA(mga);
    
    res.json({
      success: true,
      message: `MGA ${mga.name} added to portfolio`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/cyber-insurance/portfolio/performance
 * 
 * Calculate portfolio performance
 */
router.post('/portfolio/performance', (req: Request, res: Response) => {
  try {
    const mgas: MGATarget[] = req.body.mgas;
    
    if (!Array.isArray(mgas)) {
      return res.status(400).json({
        success: false,
        error: 'MGAs array required',
      });
    }
    
    const performance = portfolioEngine.calculatePerformance(mgas);
    const revenue = portfolioEngine.calculateNetworkRevenue(performance);
    const exitScenarios = portfolioEngine.projectExitScenarios(performance, req.body.totalInvested || 25000000);
    
    res.json({
      success: true,
      data: {
        performance,
        revenue,
        exitScenarios,
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
 * POST /api/cyber-insurance/portfolio/kluge-memo
 * 
 * Generate "Kluge's Memo" executive report
 */
router.post('/portfolio/kluge-memo', (req: Request, res: Response) => {
  try {
    const mgas: MGATarget[] = req.body.mgas;
    const totalInvested = req.body.totalInvested || 25000000;
    
    if (!Array.isArray(mgas)) {
      return res.status(400).json({
        success: false,
        error: 'MGAs array required',
      });
    }
    
    const performance = portfolioEngine.calculatePerformance(mgas);
    const revenue = portfolioEngine.calculateNetworkRevenue(performance);
    const exitScenarios = portfolioEngine.projectExitScenarios(performance, totalInvested);
    
    const memo = portfolioEngine.generateKlugeMemo(performance, revenue, exitScenarios);
    
    res.json({
      success: true,
      data: {
        memo,
        performance,
        revenue,
        exitScenarios,
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
 * GET /api/cyber-insurance/portfolio/claims-graph
 * 
 * Get claims graph statistics
 */
router.get('/portfolio/claims-graph', (req: Request, res: Response) => {
  try {
    const stats = portfolioEngine.getClaimsGraphStats();
    
    res.json({
      success: true,
      data: {
        totalClaims: stats.totalClaims,
        uniqueMGAs: Array.from(stats.uniqueMGAs),
        coverageByIndustry: Object.fromEntries(stats.coverageByIndustry),
      },
      klugePrinciple: 'The claims graph is the monopoly - never sell',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
