/**
 * MGA Acquisition Filter API Routes
 *
 * "Morning routine: Scan PitchBook for MGAs with >115% combined ratio"
 */

import { Router, Request, Response } from 'express';
import MGAAcquisitionFilter, {
  generateMockMGAs,
  MGAProfile,
  AcquisitionScore,
  StewardshipOffer,
} from '../services/acquisition/MGAAcquisitionFilter';

const router = Router();
const filter = new MGAAcquisitionFilter();

// In-memory storage for demo (use database in production)
const mgaDatabase: Map<string, MGAProfile> = new Map();
const offerDatabase: Map<string, StewardshipOffer> = new Map();

// Initialize with mock data
const mockMGAs = generateMockMGAs(15);
mockMGAs.forEach(mga => mgaDatabase.set(mga.id, mga));

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /api/acquisition/targets
 * List all MGA acquisition targets, scored and ranked
 */
router.get('/targets', (req: Request, res: Response) => {
  try {
    const allMGAs = Array.from(mgaDatabase.values());
    const scoredTargets = filter.filterTargets(allMGAs);

    return res.json({
      success: true,
      data: {
        totalMGAs: allMGAs.length,
        qualifiedTargets: scoredTargets.length,
        targets: scoredTargets,
        summary: {
          strongBuy: scoredTargets.filter(t => t.recommendation === 'STRONG_BUY').length,
          buy: scoredTargets.filter(t => t.recommendation === 'BUY').length,
          watch: scoredTargets.filter(t => t.recommendation === 'WATCH').length,
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
      error: error instanceof Error ? error.message : 'Failed to fetch targets',
    });
  }
});

/**
 * GET /api/acquisition/targets/:id
 * Get detailed scoring for a specific MGA
 */
router.get('/targets/:id', (req: Request, res: Response) => {
  try {
    const mga = mgaDatabase.get(req.params.id);

    if (!mga) {
      return res.status(404).json({
        success: false,
        error: 'MGA not found',
      });
    }

    const score = filter.scoreTarget(mga);

    return res.json({
      success: true,
      data: {
        mga,
        score,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to score MGA',
    });
  }
});

/**
 * POST /api/acquisition/targets
 * Add a new MGA to the database
 */
router.post('/targets', (req: Request, res: Response) => {
  try {
    const mgaData = req.body as Partial<MGAProfile>;

    // Validate required fields
    const requiredFields = [
      'name', 'annualPremium', 'combinedRatio', 'lossRatio',
      'expenseRatio', 'bookValue', 'hasReinsuranceTreaty'
    ];

    for (const field of requiredFields) {
      if (mgaData[field as keyof MGAProfile] === undefined) {
        return res.status(400).json({
          success: false,
          error: `Missing required field: ${field}`,
        });
      }
    }

    const mga: MGAProfile = {
      id: crypto.randomUUID(),
      name: mgaData.name!,
      founded: mgaData.founded || new Date().getFullYear(),
      headquarters: mgaData.headquarters || 'Unknown',
      annualPremium: mgaData.annualPremium!,
      combinedRatio: mgaData.combinedRatio!,
      lossRatio: mgaData.lossRatio!,
      expenseRatio: mgaData.expenseRatio!,
      bookValue: mgaData.bookValue!,
      underwriterCount: mgaData.underwriterCount || 5,
      avgQuoteTime: mgaData.avgQuoteTime || 14,
      policiesInForce: mgaData.policiesInForce || 100,
      claimsDataYears: mgaData.claimsDataYears || 3,
      hasReinsuranceTreaty: mgaData.hasReinsuranceTreaty!,
      reinsurancePartner: mgaData.reinsurancePartner,
      specializations: mgaData.specializations || ['general'],
      ownerAge: mgaData.ownerAge,
      recentLayoffs: mgaData.recentLayoffs || false,
      seekingInvestment: mgaData.seekingInvestment || false,
      hadRecentLoss: mgaData.hadRecentLoss || false,
      dataSource: 'manual_entry',
      lastUpdated: new Date(),
    };

    mgaDatabase.set(mga.id, mga);
    const score = filter.scoreTarget(mga);

    return res.status(201).json({
      success: true,
      data: {
        mga,
        score,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add MGA',
    });
  }
});

/**
 * POST /api/acquisition/targets/:id/offer
 * Generate a stewardship offer for an MGA
 */
router.post('/targets/:id/offer', (req: Request, res: Response) => {
  try {
    const mga = mgaDatabase.get(req.params.id);

    if (!mga) {
      return res.status(404).json({
        success: false,
        error: 'MGA not found',
      });
    }

    const score = filter.scoreTarget(mga);

    if (score.recommendation === 'PASS') {
      return res.status(400).json({
        success: false,
        error: 'MGA does not meet acquisition criteria',
        reason: score.risks,
      });
    }

    const offer = filter.generateStewardshipOffer(mga, score);
    offerDatabase.set(offer.id, offer);

    return res.status(201).json({
      success: true,
      data: {
        offer,
        mga,
        score,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate offer',
    });
  }
});

/**
 * GET /api/acquisition/offers
 * List all generated offers
 */
router.get('/offers', (req: Request, res: Response) => {
  try {
    const offers = Array.from(offerDatabase.values());

    return res.json({
      success: true,
      data: {
        totalOffers: offers.length,
        offers: offers.sort((a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime()
        ),
        summary: {
          draft: offers.filter(o => o.status === 'draft').length,
          sent: offers.filter(o => o.status === 'sent').length,
          negotiating: offers.filter(o => o.status === 'negotiating').length,
          accepted: offers.filter(o => o.status === 'accepted').length,
          rejected: offers.filter(o => o.status === 'rejected').length,
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
      error: error instanceof Error ? error.message : 'Failed to fetch offers',
    });
  }
});

/**
 * PATCH /api/acquisition/offers/:id/status
 * Update offer status
 */
router.patch('/offers/:id/status', (req: Request, res: Response) => {
  try {
    const offer = offerDatabase.get(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found',
      });
    }

    const { status } = req.body;
    const validStatuses = ['draft', 'sent', 'negotiating', 'accepted', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    offer.status = status;
    offerDatabase.set(offer.id, offer);

    return res.json({
      success: true,
      data: offer,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update offer',
    });
  }
});

/**
 * GET /api/acquisition/dashboard
 * Get acquisition pipeline dashboard data
 */
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const allMGAs = Array.from(mgaDatabase.values());
    const scoredTargets = filter.filterTargets(allMGAs);
    const offers = Array.from(offerDatabase.values());

    // Calculate pipeline metrics
    const strongBuyTargets = scoredTargets.filter(t => t.recommendation === 'STRONG_BUY');
    const totalTargetValue = strongBuyTargets.reduce((sum, t) => sum + t.targetPrice, 0);
    const totalProjectedEBITDA = strongBuyTargets.reduce((sum, t) => sum + t.estimatedEBITDAAfter, 0);

    return res.json({
      success: true,
      data: {
        pipeline: {
          totalTargets: scoredTargets.length,
          strongBuyTargets: strongBuyTargets.length,
          totalTargetValue,
          totalProjectedEBITDA,
          avgTargetScore: Math.round(
            scoredTargets.reduce((sum, t) => sum + t.overallScore, 0) / scoredTargets.length
          ),
        },
        offers: {
          total: offers.length,
          inProgress: offers.filter(o => ['sent', 'negotiating'].includes(o.status)).length,
          won: offers.filter(o => o.status === 'accepted').length,
          totalCashDeployed: offers
            .filter(o => o.status === 'accepted')
            .reduce((sum, o) => sum + o.cashComponent, 0),
        },
        topTargets: strongBuyTargets.slice(0, 5).map(t => ({
          id: t.mgaId,
          name: t.mgaName,
          score: t.overallScore,
          targetPrice: t.targetPrice,
          ebidtaFlip: t.estimatedEBITDAAfter - t.estimatedEBITDABefore,
        })),
        recentOffers: offers.slice(0, 5).map(o => ({
          id: o.id,
          mgaName: o.mgaName,
          status: o.status,
          cashComponent: o.cashComponent,
          createdAt: o.createdAt,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate dashboard',
    });
  }
});

export default router;
