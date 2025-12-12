/**
 * Cell Governance API Routes
 *
 * "The goal is to graduate the cell to self-governance."
 */

import { Router, Request, Response } from 'express';
import CellGovernance, {
  Cell,
  Proposal,
  ProposalType,
  Member,
} from '../services/governance/CellGovernance';

const router = Router();
const governance = new CellGovernance();

// =============================================================================
// CELL ROUTES
// =============================================================================

/**
 * GET /api/governance/cells
 * List all cells
 */
router.get('/cells', (req: Request, res: Response) => {
  try {
    const cells = governance.getAllCells();

    return res.json({
      success: true,
      data: {
        cells,
        summary: {
          total: cells.length,
          incubating: cells.filter(c => c.status === 'incubating').length,
          operating: cells.filter(c => c.status === 'operating').length,
          independent: cells.filter(c => c.status === 'independent').length,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch cells',
    });
  }
});

/**
 * GET /api/governance/cells/:id
 * Get a specific cell
 */
router.get('/cells/:id', (req: Request, res: Response) => {
  try {
    const cell = governance.getCell(req.params.id);

    if (!cell) {
      return res.status(404).json({
        success: false,
        error: 'Cell not found',
      });
    }

    return res.json({
      success: true,
      data: cell,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch cell',
    });
  }
});

/**
 * POST /api/governance/cells
 * Create a new cell
 */
router.post('/cells', (req: Request, res: Response) => {
  try {
    const { name, description, type, founders } = req.body;

    if (!name || !description || !type || !founders || founders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, description, type, founders',
      });
    }

    const cell = governance.createCell({
      name,
      description,
      type,
      founders: founders.map((f: any) => ({
        address: f.address || f.email,
        displayName: f.displayName || f.name,
        contributionScore: f.contributionScore || 50,
        tokenBalance: f.tokenBalance || 100,
        profitSharePercent: 100 / founders.length, // Equal split initially
        roles: ['founder', 'voter'],
        isFounder: true,
      })),
    });

    return res.status(201).json({
      success: true,
      data: cell,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create cell',
    });
  }
});

/**
 * GET /api/governance/cells/:id/graduation
 * Check graduation eligibility
 */
router.get('/cells/:id/graduation', (req: Request, res: Response) => {
  try {
    const eligibility = governance.checkGraduationEligibility(req.params.id);

    return res.json({
      success: true,
      data: eligibility,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check eligibility',
    });
  }
});

// =============================================================================
// PROPOSAL ROUTES
// =============================================================================

/**
 * GET /api/governance/cells/:id/proposals
 * List proposals for a cell
 */
router.get('/cells/:id/proposals', (req: Request, res: Response) => {
  try {
    const proposals = governance.getCellProposals(req.params.id);

    return res.json({
      success: true,
      data: {
        proposals,
        summary: {
          total: proposals.length,
          voting: proposals.filter(p => p.status === 'voting').length,
          passed: proposals.filter(p => p.status === 'passed').length,
          failed: proposals.filter(p => p.status === 'failed').length,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch proposals',
    });
  }
});

/**
 * POST /api/governance/cells/:id/proposals
 * Create a new proposal
 */
router.post('/cells/:id/proposals', (req: Request, res: Response) => {
  try {
    const { type, title, description, authorId, payload } = req.body;

    if (!type || !title || !description || !authorId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, title, description, authorId',
      });
    }

    const validTypes: ProposalType[] = [
      'policy_change', 'budget_allocation', 'member_admission', 'member_removal',
      'committee_election', 'revenue_split_change', 'graduation_vote', 'fork_vote', 'emergency'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid proposal type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    const proposal = governance.createProposal({
      cellId: req.params.id,
      type,
      title,
      description,
      authorId,
      payload,
    });

    return res.status(201).json({
      success: true,
      data: proposal,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create proposal',
    });
  }
});

/**
 * POST /api/governance/proposals/:id/approve
 * Committee approves proposal for voting
 */
router.post('/proposals/:id/approve', (req: Request, res: Response) => {
  try {
    const { approverId } = req.body;

    if (!approverId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: approverId',
      });
    }

    const proposal = governance.approveForVoting(req.params.id, approverId);

    return res.json({
      success: true,
      data: proposal,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve proposal',
    });
  }
});

/**
 * POST /api/governance/proposals/:id/vote
 * Cast a vote on a proposal
 */
router.post('/proposals/:id/vote', (req: Request, res: Response) => {
  try {
    const { voterId, choice, reason } = req.body;

    if (!voterId || !choice) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: voterId, choice',
      });
    }

    if (!['yes', 'no', 'abstain'].includes(choice)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid choice. Must be: yes, no, or abstain',
      });
    }

    const vote = governance.castVote({
      proposalId: req.params.id,
      voterId,
      choice,
      reason,
    });

    return res.status(201).json({
      success: true,
      data: vote,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cast vote',
    });
  }
});

/**
 * POST /api/governance/proposals/:id/finalize
 * Finalize a proposal after voting ends
 */
router.post('/proposals/:id/finalize', (req: Request, res: Response) => {
  try {
    const proposal = governance.finalizeProposal(req.params.id);

    return res.json({
      success: true,
      data: proposal,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to finalize proposal',
    });
  }
});

// =============================================================================
// TREASURY ROUTES
// =============================================================================

/**
 * GET /api/governance/cells/:id/treasury
 * Get cell treasury state
 */
router.get('/cells/:id/treasury', (req: Request, res: Response) => {
  try {
    const cell = governance.getCell(req.params.id);

    if (!cell) {
      return res.status(404).json({
        success: false,
        error: 'Cell not found',
      });
    }

    return res.json({
      success: true,
      data: {
        treasury: cell.treasury,
        revenueSplit: cell.governance.revenueSplit,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch treasury',
    });
  }
});

/**
 * POST /api/governance/cells/:id/revenue
 * Record revenue for a cell
 */
router.post('/cells/:id/revenue', (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Must be a positive number.',
      });
    }

    governance.recordRevenue(req.params.id, amount);
    const cell = governance.getCell(req.params.id);

    return res.json({
      success: true,
      data: {
        treasury: cell?.treasury,
        recorded: amount,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record revenue',
    });
  }
});

/**
 * POST /api/governance/cells/:id/distribute
 * Distribute profits to members
 */
router.post('/cells/:id/distribute', (req: Request, res: Response) => {
  try {
    const result = governance.distributeProfit(req.params.id);

    return res.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to distribute profits',
    });
  }
});

export default router;
