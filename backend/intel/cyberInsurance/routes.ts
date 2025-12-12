/**
 * Cyber Insurance MGA API Routes
 * 
 * THE MALCOLM X OF CYBER INSURANCE
 * "By any means necessary—but the means are agents, debt, and data, not bullets."
 * 
 * Implements the revolutionary playbook:
 * 1. MGA acquisition target filtering (buy distressed at 0.5x book)
 * 2. Agentic underwriting API (30-second quotes, not 30 days)
 * 3. Portfolio management (The Death Star - centralized ops)
 * 
 * See: MALCOLM_X_MANIFESTO.md, KLUGE_PLAYBOOK.md, LIBERATION_THEOLOGY.md
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
 * 
 * Malcolm X: "Land is the basis of revolution"
 * You: Distressed MGAs are the land. Buy at 0.5x book, never pay full price.
 */
router.get('/kluge-criteria', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: KLUGE_FILTER_CRITERIA,
    description: 'Kluge Playbook acquisition criteria for distressed cyber MGAs',
    philosophy: 'By any means necessary - acquire the means of underwriting at estate sale prices',
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
 * 
 * Malcolm X: "Land is the basis of revolution"
 * You: The claims graph is your land - 10TB of loss history no one else has
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
      malcolmX: 'Land is the basis of independence. The graph is your land.',
      monetization: {
        dataLicensing: '$10M/year',
        networkFees: '$20M/year',
        threatIntel: '$5M/year',
        total: '$35M/year perpetual',
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
 * GET /api/cyber-insurance/manifesto
 * 
 * Get the revolutionary manifesto
 * 
 * "By any means necessary—but the means are agents, debt, and data, not bullets."
 */
router.get('/manifesto', (req: Request, res: Response) => {
  res.json({
    success: true,
    manifesto: {
      title: 'THE MALCOLM X OF CYBER INSURANCE',
      motto: 'By any means necessary—but the means are agents, debt, and data, not bullets.',
      tenets: [
        {
          number: 1,
          name: 'By Any Means Necessary',
          implementation: 'Agentic Overkill - ScoutAgent, UnderwritingAgent, ClaimsAgent, GovernanceAgent',
        },
        {
          number: 2,
          name: 'Self-Determination',
          implementation: '$SOUL token holders vote on coverage terms, risk appetite, and carrier partnerships',
        },
        {
          number: 3,
          name: 'Self-Respect',
          implementation: 'Claims graph is open-source (CC-BY-SA), no black boxes',
        },
        {
          number: 4,
          name: 'Self-Defense',
          implementation: 'Risk oracle prices out ransomware gangs and insecure companies',
        },
        {
          number: 5,
          name: 'Economic Independence',
          implementation: 'Every MGA: 20% to community, 10% to founder, 70% to HoldCo',
        },
        {
          number: 6,
          name: 'Land = The Claims Graph',
          implementation: 'Never sell. Charge 10% network fees. Perpetual monopoly.',
        },
        {
          number: 7,
          name: 'The Ballot or the Bullet',
          implementation: 'Token holders vote (ballot), protocol auto-declines (bullet)',
        },
        {
          number: 8,
          name: 'Uncompromising Truth',
          implementation: 'Insurance system is predatory by design—not inefficient',
        },
        {
          number: 9,
          name: 'Timing: Sell High, Keep the Rails',
          implementation: '2027: Sell MGAs at 10x. 2030: Sell protocol at 18x. Keep IS Fiber forever.',
        },
        {
          number: 10,
          name: 'Debt As Fuel',
          implementation: '4:1 debt/equity. Cloud credits are tax-free debt.',
        },
        {
          number: 11,
          name: 'Community Tithing',
          implementation: '10% of revenue funds free security training (1,000 practitioners/year)',
        },
        {
          number: 12,
          name: 'The Legacy',
          implementation: 'By 2030: 1,000 self-governing cells, $35M/year perpetual',
        },
      ],
      dailyPrayer: 'I am not here to sell insurance. I am here to weaponize infrastructure against those who extract rent from the security community. Today I will acquire one distressed MGA, deploy one agent, and price out one ransomware gang. By any means necessary, I will liberate the data, compound the rails, and graduate the cells. The ballot is my token. The bullet is my code. I am the Malcolm X of cyber insurance.',
      docs: {
        manifesto: '/MALCOLM_X_MANIFESTO.md',
        playbook: '/KLUGE_PLAYBOOK.md',
        theology: '/LIBERATION_THEOLOGY.md',
        quickstart: '/MANIFESTO_QUICKSTART.md',
      },
      cli: './bin/manifesto --help',
    },
  });
});

/**
 * GET /api/cyber-insurance/revolution-status
 * 
 * Get current status of the revolution
 */
router.get('/revolution-status', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: {
      phase: 'Foundation (2025)',
      timeline: {
        '2025': 'Foundation - First MGA acquisition, deploy agents',
        '2026-2027': 'Accumulation - Acquire 2-3 more MGAs, centralize operations',
        '2027-2030': 'The Death Star - Consolidate, build community, prepare exit',
        '2030': 'The Exit - Sell MGAs ($750M) + protocol ($1.26B), keep rails ($35M/year)',
        '2031+': 'The Rails Forever - 1,000 self-governing cells, perpetual revenue',
      },
      implementation: {
        completed: [
          'Core manifesto documents',
          'Kluge playbook documentation',
          'Liberation theology framework',
          'MGA acquisition filter',
          'Agentic underwriter',
          'Portfolio engine',
          'API routes',
          'CLI tool',
        ],
        inProgress: [
          '$SOUL token governance',
          'Community voting system',
          'First MGA acquisition',
        ],
        planned: [
          '90-day transformation playbook',
          'Open-source claims graph portal',
          'Graduated cell spin-out mechanism',
          'DefCon/RSA speech delivery',
        ],
      },
      metrics: {
        financial: {
          targetIRR: '82%',
          ebitdaMargin: '30% (Year 3)',
          exitMultiple: '10x (MGAs), 18x (protocol)',
          perpetualRevenue: '$35M/year',
        },
        operational: {
          quoteTime: '<30 seconds (vs 30 days)',
          combinedRatio: '<90%',
          customerNPS: '>50',
        },
        community: {
          tokenHolders: '50K+ target',
          votes: '52/year (weekly)',
          scholarships: '100/year',
          graduatedCells: '15+ by 2035',
        },
      },
    },
  });
});

export default router;
