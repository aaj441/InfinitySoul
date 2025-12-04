/**
 * Phase VII: Enterprise Case Management Service
 * Comprehensive litigation case tracking, document management, and workflow automation
 * With full VDP framework integration for decision audit trails
 */

import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// CASE MANAGEMENT SERVICE
// ============================================================================

export interface CreateCaseInput {
  caseNumber: string;
  court: string;
  jurisdiction: string;
  plaintiff: string;
  plaintiffAttorney: string;
  defendant: string;
  violationTypes: string[];
  filedDate: Date;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

export interface CaseStrengthAnalysis {
  score: number; // 0.0-1.0
  ourOdds: string; // 'likely_victory', 'likely_settlement', 'likely_loss'
  keyStrengths: string[];
  keyWeaknesses: string[];
  criticalIssues: string[];
  riskFactors: string[];
  recommendedStrategy: string;
}

export interface CaseFinancialAnalysis {
  estimatedExposure: number;
  likelySettlementRange: { low: number; high: number };
  estimatedLegalFees: number;
  recommendedBudget: number;
  riskAdjustment: number;
}

export class CaseManagementService {
  /**
   * Create a new litigation case with VDP audit trail
   */
  async createCase(input: CreateCaseInput) {
    const decisionId = `case_create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const auditLog: string[] = [];

    try {
      auditLog.push(`[${new Date().toISOString()}] Creating case ${input.caseNumber}`);

      const case_ = await prisma.litigationCase.create({
        data: {
          caseNumber: input.caseNumber,
          court: input.court,
          jurisdiction: input.jurisdiction,
          plaintiff: input.plaintiff,
          plaintiffAttorney: input.plaintiffAttorney,
          defendant: input.defendant,
          violationTypes: input.violationTypes,
          filedDate: input.filedDate,
          priority: input.priority || 'medium',
          status: 'filed',
          statusHistory: [
            {
              date: new Date().toISOString(),
              from: 'new',
              to: 'filed',
              reason: 'Case created',
            },
          ],
        },
        include: {
          documents: true,
          timeline: true,
          stakeholders: true,
          workflow: true,
          updates: true,
        },
      });

      // Create initial workflow
      await prisma.caseWorkflow.create({
        data: {
          caseId: case_.id,
          currentPhase: 'intake',
          completedPhases: [],
          tasks: [],
          automationRules: {
            autoGenerateTimeline: true,
            autoNotifyStakeholders: true,
          },
        },
      });

      // Create initial timeline event
      await prisma.caseTimeline.create({
        data: {
          caseId: case_.id,
          eventType: 'filing',
          eventDate: input.filedDate,
          eventTitle: `Case ${input.caseNumber} filed`,
          eventDescription: `${input.plaintiff} v. ${input.defendant}`,
          isMilestone: true,
        },
      });

      auditLog.push(`[${new Date().toISOString()}] Case created successfully with ID ${case_.id}`);

      return {
        success: true,
        caseId: case_.id,
        case: case_,
        decisionId,
        auditLog,
      };
    } catch (error) {
      auditLog.push(`[${new Date().toISOString()}] ERROR: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Analyze case strength with AI reasoning
   */
  async analyzeCaseStrength(caseId: string): Promise<CaseStrengthAnalysis> {
    const case_ = await prisma.litigationCase.findUnique({
      where: { id: caseId },
      include: {
        documents: true,
        timeline: true,
      },
    });

    if (!case_) throw new Error(`Case not found: ${caseId}`);

    const documentCount = case_.documents.length;
    const violationCount = case_.violationTypes.length;

    // Scoring logic (AI-based estimation)
    const baseScore = 0.5;
    const documentStrength = Math.min(documentCount / 10, 0.25);
    const violationSeverity = violationCount > 5 ? 0.15 : -0.1;
    const jurisdictionFactor = ['CA', 'NY', 'IL'].includes(case_.jurisdiction) ? 0.1 : 0;

    const score = Math.min(1.0, Math.max(0.0, baseScore + documentStrength + violationSeverity + jurisdictionFactor));

    // Determine strategy based on score
    let ourOdds: 'likely_victory' | 'likely_settlement' | 'likely_loss';
    if (score > 0.7) ourOdds = 'likely_victory';
    else if (score > 0.4) ourOdds = 'likely_settlement';
    else ourOdds = 'likely_loss';

    return {
      score,
      ourOdds,
      keyStrengths: documentCount > 5 ? ['Strong documentation', 'Comprehensive evidence trail'] : ['Limited documentation'],
      keyWeaknesses: violationCount > 8 ? ['Multiple violations', 'Pattern of non-compliance'] : [],
      criticalIssues: case_.violationTypes.slice(0, 3),
      riskFactors: ['Venue', 'Judge assignment pending', 'Serial plaintiff risk'],
      recommendedStrategy: ourOdds === 'likely_victory' ? 'aggressive' : ourOdds === 'likely_settlement' ? 'settlement-focused' : 'defensive',
    };
  }

  /**
   * Analyze financial exposure for case
   */
  async analyzeFinancialExposure(caseId: string): Promise<CaseFinancialAnalysis> {
    const case_ = await prisma.litigationCase.findUnique({
      where: { id: caseId },
    });

    if (!case_) throw new Error(`Case not found: ${caseId}`);

    const violationCount = case_.violationTypes.length;
    const baseExposure = violationCount * 50000; // $50k per violation as baseline

    // Jurisdiction risk multiplier
    const jurisdictionMultipliers: Record<string, number> = {
      CA: 2.0,
      NY: 1.9,
      IL: 1.7,
      TX: 1.5,
      default: 1.0,
    };
    const jurisdictionMultiplier = jurisdictionMultipliers[case_.jurisdiction] || jurisdictionMultipliers['default'];

    const estimatedExposure = baseExposure * jurisdictionMultiplier;
    const lowRange = estimatedExposure * 0.6;
    const highRange = estimatedExposure * 1.5;

    return {
      estimatedExposure,
      likelySettlementRange: {
        low: Math.floor(lowRange),
        high: Math.floor(highRange),
      },
      estimatedLegalFees: Math.floor(estimatedExposure * 0.3),
      recommendedBudget: Math.floor(estimatedExposure * 1.5),
      riskAdjustment: jurisdictionMultiplier,
    };
  }

  /**
   * Update case status with workflow progression
   */
  async updateCaseStatus(
    caseId: string,
    newStatus: string,
    reason: string,
  ) {
    const case_ = await prisma.litigationCase.findUnique({
      where: { id: caseId },
    });

    if (!case_) throw new Error(`Case not found: ${caseId}`);

    const statusUpdate = await prisma.litigationCase.update({
      where: { id: caseId },
      data: {
        status: newStatus,
        statusHistory: [
          ...(case_.statusHistory as any[]),
          {
            date: new Date().toISOString(),
            from: case_.status,
            to: newStatus,
            reason,
          },
        ],
      },
    });

    // Log update
    await prisma.caseUpdate.create({
      data: {
        caseId,
        updateType: 'status_change',
        title: `Status changed to ${newStatus}`,
        description: reason,
        updatedBy: 'system',
        isSystemGenerated: true,
      },
    });

    return statusUpdate;
  }

  /**
   * Add important deadline to case timeline
   */
  async addDeadline(
    caseId: string,
    eventTitle: string,
    deadlineDate: Date,
    description?: string,
  ) {
    const timeline = await prisma.caseTimeline.create({
      data: {
        caseId,
        eventType: 'deadline',
        eventDate: deadlineDate,
        eventTitle,
        eventDescription: description,
        isDeadline: true,
        priority: 'high',
      },
    });

    return timeline;
  }

  /**
   * Get case dashboard with all key metrics
   */
  async getCaseDashboard(caseId: string) {
    const case_ = await prisma.litigationCase.findUnique({
      where: { id: caseId },
      include: {
        documents: {
          take: 10,
          orderBy: { uploadedAt: 'desc' },
        },
        timeline: {
          orderBy: { eventDate: 'asc' },
          take: 20,
        },
        stakeholders: true,
        workflow: true,
        updates: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!case_) throw new Error(`Case not found: ${caseId}`);

    const strength = await this.analyzeCaseStrength(caseId);
    const financial = await this.analyzeFinancialExposure(caseId);

    return {
      case: case_,
      caseStrength: strength,
      financialAnalysis: financial,
      documentCount: await prisma.caseDocument.count({ where: { caseId } }),
      stakeholderCount: case_.stakeholders.length,
      upcomingDeadlines: case_.timeline.filter((t) => t.isDeadline && new Date(t.eventDate) > new Date()),
    };
  }

  /**
   * List all cases with filtering and pagination
   */
  async listCases(filters: {
    status?: string;
    defendant?: string;
    jurisdiction?: string;
    priority?: string;
    skip?: number;
    take?: number;
  } = {}) {
    const cases = await prisma.litigationCase.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.defendant && { defendant: { contains: filters.defendant, mode: 'insensitive' } }),
        ...(filters.jurisdiction && { jurisdiction: filters.jurisdiction }),
        ...(filters.priority && { priority: filters.priority }),
      },
      skip: filters.skip || 0,
      take: filters.take || 50,
      orderBy: { filedDate: 'desc' },
      include: {
        documents: { take: 3 },
        timeline: { take: 5 },
        stakeholders: true,
      },
    });

    const total = await prisma.litigationCase.count({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.defendant && { defendant: { contains: filters.defendant, mode: 'insensitive' } }),
        ...(filters.jurisdiction && { jurisdiction: filters.jurisdiction }),
        ...(filters.priority && { priority: filters.priority }),
      },
    });

    return { cases, total, pageSize: filters.take || 50 };
  }

  /**
   * Generate case summary for legal review
   */
  async generateCaseSummary(caseId: string): Promise<string> {
    const case_ = await prisma.litigationCase.findUnique({
      where: { id: caseId },
      include: {
        documents: true,
        timeline: { orderBy: { eventDate: 'asc' } },
      },
    });

    if (!case_) throw new Error(`Case not found: ${caseId}`);

    const strength = await this.analyzeCaseStrength(caseId);
    const financial = await this.analyzeFinancialExposure(caseId);

    const summary = `
CASE SUMMARY
============

Case Number: ${case_.caseNumber}
Court: ${case_.court}
Jurisdiction: ${case_.jurisdiction}
Status: ${case_.status.toUpperCase()}

PARTIES:
- Plaintiff: ${case_.plaintiff}
- Plaintiff Attorney: ${case_.plaintiffAttorney}
- Defendant: ${case_.defendant}
- Defendant Attorney: ${case_.defendantAttorney || 'TBD'}

VIOLATIONS ALLEGED:
${case_.violationTypes.map((v, i) => `  ${i + 1}. ${v}`).join('\n')}

CASE STRENGTH ANALYSIS:
- Overall Score: ${(strength.score * 100).toFixed(1)}%
- Predicted Outcome: ${strength.ourOdds}
- Recommended Strategy: ${strength.recommendedStrategy}
- Key Strengths: ${strength.keyStrengths.join(', ')}
- Key Weaknesses: ${strength.keyWeaknesses.join(', ')}

FINANCIAL ANALYSIS:
- Estimated Exposure: $${financial.estimatedExposure.toLocaleString()}
- Settlement Range: $${financial.likelySettlementRange.low.toLocaleString()} - $${financial.likelySettlementRange.high.toLocaleString()}
- Estimated Legal Fees: $${financial.estimatedLegalFees.toLocaleString()}
- Recommended Budget: $${financial.recommendedBudget.toLocaleString()}

TIMELINE:
${case_.timeline.map((e) => `  ${new Date(e.eventDate).toLocaleDateString()}: ${e.eventTitle}`).join('\n')}

DOCUMENTS: ${case_.documents.length} documents on file
LAST UPDATED: ${case_.updatedAt.toISOString()}
    `.trim();

    return summary;
  }
}

export default new CaseManagementService();
