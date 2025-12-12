/**
 * Lead Funnel - Sales Pipeline & Email Nurture Management
 *
 * Manages the conversion funnel:
 * Website visitor → Risk assessment → Lead magnet → Email sequence → Quote → Close → Renewal
 *
 * Key Features:
 * - Multi-touch attribution tracking
 * - Automated email nurture sequences
 * - Lead scoring based on engagement
 * - Conversion optimization metrics
 * - Revenue and commission projections
 *
 * The funnel is designed to provide value at every stage:
 * - Visitors get free compliance audits (even if they don't buy)
 * - Leads get educational content (they learn, we build trust)
 * - Customers get ongoing compliance monitoring (retention)
 */

import { v4 as uuidv4 } from 'uuid';
import {
  InsuranceLead,
  InsuranceLine,
  LeadSource,
  LeadStatus,
  NurtureTouchpoint,
  NurtureSequence,
  NurtureEmail,
} from './types';
import { INSURANCE_LINE_CONFIGS } from './InsuranceComplianceHub';

/**
 * Lead scoring weights
 */
const LEAD_SCORING = {
  engagement: {
    assessment_started: 10,
    assessment_completed: 30,
    audit_run: 20,
    lead_magnet_download: 15,
    email_opened: 5,
    email_clicked: 10,
    page_visit: 2,
    consultation_scheduled: 50,
    quote_requested: 40,
  },
  firmographic: {
    employee_count: {
      '1-10': 5,
      '11-50': 10,
      '51-200': 20,
      '201-500': 30,
      '500+': 40,
    },
    revenue: {
      '<500K': 5,
      '500K-2M': 10,
      '2M-10M': 20,
      '10M-50M': 30,
      '50M+': 40,
    },
  },
  intent: {
    viewed_pricing: 20,
    viewed_quote_page: 25,
    returned_visitor: 15,
    multiple_downloads: 20,
  },
};

/**
 * Pre-built email nurture sequences
 */
const NURTURE_SEQUENCES: Record<string, NurtureSequence> = {
  // General insurance fundamentals sequence
  general_fundamentals: {
    id: 'general_fundamentals',
    name: 'Insurance Fundamentals',
    insuranceLine: 'general',
    triggerConditions: [
      { type: 'lead_magnet_download', value: 'any' },
      { type: 'assessment_complete', value: 'any' },
    ],
    emails: [
      {
        step: 1,
        subject: 'Your risk assessment results are in',
        previewText: 'Here\'s what we found (and what it means for your business)',
        body: `Hi {{firstName}},

Thanks for taking our risk assessment. Here's what we found:

**Your Infinity8 Score: {{infinity8Score}}/1000**
{{gradeExplanation}}

**Top 3 Areas to Address:**
{{topRecommendations}}

Most businesses we assess are overinsured in some areas and underinsured in others. Your results show {{gapSummary}}.

Want to talk through your options? Reply to this email or [schedule a call]({{calendarLink}}).

Talk soon,
{{advisorName}}

P.S. This assessment is completely free, whether you work with us or not. Our goal is to help you understand your actual risk.`,
        delayDays: 0,
        callToAction: {
          text: 'Schedule a Consultation',
          url: '{{calendarLink}}',
        },
      },
      {
        step: 2,
        subject: 'The #1 insurance mistake I see (and how to avoid it)',
        previewText: 'It\'s not what you think',
        body: `Hi {{firstName}},

In my years of helping businesses with insurance, I've seen one mistake more than any other:

**Over-insuring in comfortable areas while leaving real risks exposed.**

Here's what I mean:

A construction company might have $2M in general liability (standard) but zero cyber coverage—even though ransomware attacks on contractors are up 300% in the past two years.

A tech startup might have bulletproof cyber insurance but minimal E&O coverage—even though a client dispute could bankrupt them.

When I looked at your assessment, I noticed {{personalizedInsight}}.

This isn't about buying more insurance. It's about buying the RIGHT insurance.

Here's a quick checklist to see if your coverage is aligned:
- [ ] Your highest-risk areas have the highest coverage
- [ ] You're not paying for overlapping coverage
- [ ] Your limits match your actual exposure
- [ ] You've reviewed coverage in the past 12 months

If any of these are unchecked, we should talk. No pressure—just a conversation.

[Reply to this email or schedule a call]({{calendarLink}})

{{advisorName}}`,
        delayDays: 3,
        callToAction: {
          text: 'Check Your Coverage Alignment',
          url: '{{calendarLink}}',
        },
      },
      {
        step: 3,
        subject: 'A real case study from your industry',
        previewText: 'What happened when {{industry}} company got sued',
        body: `Hi {{firstName}},

I want to share a real example from the {{industry}} industry (anonymized, of course).

**The Situation:**
{{industryCaseStudy}}

**The Lesson:**
Insurance should be designed around YOUR specific risks, not generic industry templates.

Looking at your assessment results, here's what stood out:
{{personalizedRiskAnalysis}}

**Quick question:** Have you ever had an insurance advisor actually look at your business operations before recommending coverage?

If not, that's what we do differently. We run compliance audits, analyze your actual risk profile, and only then recommend coverage.

Want to see how it works? [Let's talk]({{calendarLink}}).

{{advisorName}}`,
        delayDays: 7,
        callToAction: {
          text: 'See Our Process',
          url: '{{calendarLink}}',
        },
      },
      {
        step: 4,
        subject: 'Your compliance audit is ready to review',
        previewText: 'We found some things worth discussing',
        body: `Hi {{firstName}},

Remember that compliance audit we ran on {{websiteUrl}}? Here's a quick summary:

**Overall Grade: {{complianceGrade}}**

**Key Findings:**
{{complianceFindings}}

**Insurance Impact:**
{{insuranceImpact}}

Here's the thing: carriers look at this stuff. Good compliance = better rates. Bad compliance = higher premiums (or worse, claim denials).

The fixes aren't usually complicated. I'd be happy to walk through the findings and show you:
1. Which items are quick wins
2. Which items affect your premiums
3. What to prioritize

[Grab 15 minutes on my calendar]({{calendarLink}}) and I'll show you the full report.

{{advisorName}}`,
        delayDays: 10,
        callToAction: {
          text: 'Review Your Audit',
          url: '{{calendarLink}}',
        },
      },
      {
        step: 5,
        subject: 'Last chance to use your assessment (it expires soon)',
        previewText: 'Don\'t let this work go to waste',
        body: `Hi {{firstName}},

Your risk assessment from {{assessmentDate}} is still valid, but I wanted to reach out one more time before it gets stale.

Insurance markets change. So do your risks. An assessment from a few months ago might not reflect your current exposure.

Here's what I can offer:

1. **A quick review call** to walk through your results (15 min)
2. **Updated quotes** if your situation has changed
3. **A compliance re-scan** to see if anything's improved

No pressure to buy anything. I'd rather you understand your risks and handle them yourself than ignore them entirely.

[Last call—let's schedule something]({{calendarLink}})

{{advisorName}}

P.S. If now isn't the right time, just reply and let me know. I'll check back in {{followUpPeriod}}.`,
        delayDays: 21,
        callToAction: {
          text: 'Schedule Final Review',
          url: '{{calendarLink}}',
        },
      },
    ],
  },

  // Cyber insurance specific sequence
  cyber_insurance: {
    id: 'cyber_insurance',
    name: 'Cyber Insurance Deep Dive',
    insuranceLine: 'cyber',
    triggerConditions: [
      { type: 'lead_magnet_download', value: 'cyber-risk-scorecard' },
      { type: 'lead_magnet_download', value: 'free-wcag-audit' },
      { type: 'page_visit', value: '/cyber-insurance' },
    ],
    emails: [
      {
        step: 1,
        subject: 'Your cyber risk scorecard (+ what it means)',
        previewText: 'You scored {{cyberScore}}/100. Here\'s the breakdown.',
        body: `Hi {{firstName}},

Thanks for running our cyber risk assessment. Here's your scorecard:

**Overall Cyber Readiness: {{cyberScore}}/100**
**Risk Level: {{cyberRiskLevel}}**

**What we checked:**
✓ SSL/HTTPS encryption
✓ Security headers
✓ Breach history indicators
✓ Third-party risk signals

**Your vulnerabilities:**
{{cyberVulnerabilities}}

**What this means for insurance:**
{{cyberInsuranceImpact}}

The good news: most of these issues are fixable. The bad news: without cyber insurance, a single breach could cost you {{breachCostEstimate}}.

Want me to walk you through your options? [Schedule a call]({{calendarLink}})

{{advisorName}}`,
        delayDays: 0,
        callToAction: {
          text: 'Discuss Cyber Coverage',
          url: '{{calendarLink}}',
        },
      },
      {
        step: 2,
        subject: 'The real cost of a data breach (it\'s more than you think)',
        previewText: 'Spoiler: it\'s not just the ransom',
        body: `Hi {{firstName}},

When people think about cyber attacks, they think about ransomware demands. "Pay $50K and get your data back."

But the ransom is usually the smallest part of the cost. Here's what actually happens:

**Immediate Costs:**
- Forensic investigation: $50-150K
- Legal counsel: $75-200K
- Customer notification: $1-5 per record
- Credit monitoring: $10-30 per affected person

**Business Impact:**
- Average downtime: 21 days
- Revenue loss: varies wildly
- Reputation damage: hard to quantify

**Regulatory Fines:**
- HIPAA: up to $1.5M per violation
- GDPR: 4% of global revenue
- CCPA: $7,500 per intentional violation

**The math:**
Average total breach cost: $4.45 million (IBM 2023)
Average cyber insurance premium: $3-10K/year

The coverage-to-risk ratio is insane. This is one of the few insurance lines where the premium is a tiny fraction of the potential loss.

Based on your assessment, I'd estimate your breach risk at {{breachProbability}}% annually. At {{breachCostEstimate}} average cost, the expected value of a breach is {{expectedBreachCost}}/year.

Worth a conversation? [Let's talk]({{calendarLink}})

{{advisorName}}`,
        delayDays: 4,
        callToAction: {
          text: 'Get a Cyber Quote',
          url: '{{calendarLink}}',
        },
      },
      {
        step: 3,
        subject: 'What cyber insurance actually covers (and doesn\'t)',
        previewText: 'The fine print, explained in plain English',
        body: `Hi {{firstName}},

Cyber insurance policies vary wildly. Here's what to look for:

**DOES Cover (in most policies):**
✓ Data breach response costs
✓ Ransomware payments (controversial, but usually covered)
✓ Business interruption
✓ Customer notification
✓ Legal defense
✓ Regulatory fines (where insurable by law)
✓ PR/Crisis management

**DOES NOT Cover (usually):**
✗ Prior/known breaches
✗ Intentional acts
✗ Unpatched vulnerabilities you knew about
✗ War/nation-state attacks (gray area)
✗ Physical damage from cyber events
✗ Future lost profits
✗ Reputational damage (directly)

**What YOUR business needs:**
Based on your industry ({{industry}}) and risk profile, here's what I'd prioritize:
{{cyberCoveragePriorities}}

The key is matching coverage to your actual operations. A tech company needs different coverage than a construction firm.

Want me to spec out what YOUR policy should look like? [Let's design it together]({{calendarLink}})

{{advisorName}}`,
        delayDays: 7,
        callToAction: {
          text: 'Design My Cyber Policy',
          url: '{{calendarLink}}',
        },
      },
    ],
  },

  // Workers comp sequence
  workers_comp: {
    id: 'workers_comp',
    name: 'Workers Comp Optimization',
    insuranceLine: 'workers_comp',
    triggerConditions: [
      { type: 'lead_magnet_download', value: 'payroll-compliance-calculator' },
      { type: 'page_visit', value: '/workers-comp' },
    ],
    emails: [
      {
        step: 1,
        subject: 'Your workers comp estimate (is it accurate?)',
        previewText: 'Most businesses are overpaying. Let\'s check yours.',
        body: `Hi {{firstName}},

Thanks for using our payroll compliance calculator. Based on what you entered:

**Estimated Annual Premium: {{wcPremiumEstimate}}**
**Your Experience Mod: {{experienceMod}}**
**Primary Class Code: {{classCode}}**

But here's the thing: these estimates are only as good as the inputs.

The #1 reason businesses overpay for workers comp:
**Incorrect class codes.**

If your employees are coded as higher-risk than their actual work, you're overpaying. It's that simple.

I'd be happy to review your current policy and see if there's room to optimize. No charge for the review.

[Schedule a policy review]({{calendarLink}})

{{advisorName}}`,
        delayDays: 0,
        callToAction: {
          text: 'Review My Policy',
          url: '{{calendarLink}}',
        },
      },
      {
        step: 2,
        subject: 'How to lower your experience mod (legally)',
        previewText: 'It\'s not as hard as you think',
        body: `Hi {{firstName}},

Your experience modification rate (mod) is like a credit score for workplace safety. Here's how to improve it:

**1. Implement a Safety Program**
Insurance companies love documented safety programs. It shows you're proactive.

**2. Return-to-Work Programs**
Getting injured workers back (in limited capacity) reduces claim costs dramatically.

**3. Manage Open Claims Aggressively**
Don't let claims sit open with inflated reserves. Review them quarterly.

**4. Challenge Incorrect Classifications**
If a claim was coded wrong, get it fixed. This affects your mod for years.

**5. Use Your Deductible Strategically**
Higher deductibles mean lower premiums AND better mods (you're self-insuring small claims).

Your current mod of {{experienceMod}} costs you approximately {{modCost}} per year in extra premiums.

If we got it to 0.90 (very achievable for most businesses), you'd save {{potentialSavings}}/year.

Worth a conversation? [Let's talk strategy]({{calendarLink}})

{{advisorName}}`,
        delayDays: 5,
        callToAction: {
          text: 'Lower My Mod',
          url: '{{calendarLink}}',
        },
      },
    ],
  },
};

/**
 * Funnel stage definitions
 */
const FUNNEL_STAGES: {
  stage: LeadStatus;
  displayName: string;
  conversionTarget: number;
  typicalDuration: string;
}[] = [
  { stage: 'new', displayName: 'New Lead', conversionTarget: 0.6, typicalDuration: '0-1 days' },
  { stage: 'assessment_started', displayName: 'Assessment Started', conversionTarget: 0.7, typicalDuration: '1-3 days' },
  { stage: 'assessment_completed', displayName: 'Assessment Completed', conversionTarget: 0.5, typicalDuration: '3-7 days' },
  { stage: 'nurture_sequence', displayName: 'Nurture Sequence', conversionTarget: 0.3, typicalDuration: '7-21 days' },
  { stage: 'quote_requested', displayName: 'Quote Requested', conversionTarget: 0.6, typicalDuration: '1-3 days' },
  { stage: 'consultation_scheduled', displayName: 'Consultation Scheduled', conversionTarget: 0.7, typicalDuration: '1-5 days' },
  { stage: 'proposal_sent', displayName: 'Proposal Sent', conversionTarget: 0.5, typicalDuration: '3-10 days' },
  { stage: 'negotiation', displayName: 'Negotiation', conversionTarget: 0.7, typicalDuration: '1-7 days' },
  { stage: 'closed_won', displayName: 'Closed Won', conversionTarget: 1.0, typicalDuration: 'N/A' },
  { stage: 'closed_lost', displayName: 'Closed Lost', conversionTarget: 0, typicalDuration: 'N/A' },
  { stage: 'renewal_pending', displayName: 'Renewal Pending', conversionTarget: 0.85, typicalDuration: '30-60 days' },
];

/**
 * Lead Funnel service
 */
export class LeadFunnel {
  private leads: Map<string, InsuranceLead> = new Map();
  private activeSequences: Map<string, { sequenceId: string; currentStep: number; startedAt: Date }> = new Map();

  /**
   * Create a new lead from website visitor
   */
  createLead(
    email: string,
    source: LeadSource,
    metadata?: Partial<InsuranceLead>
  ): InsuranceLead {
    const lead: InsuranceLead = {
      id: uuidv4(),
      email,
      source,
      status: 'new',
      interestedLines: [],
      nurtureTouchpoints: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      industry: metadata?.industry || 'other',
      ...metadata,
    };

    this.leads.set(lead.id, lead);
    return lead;
  }

  /**
   * Update lead status
   */
  updateLeadStatus(leadId: string, status: LeadStatus): InsuranceLead | null {
    const lead = this.leads.get(leadId);
    if (!lead) return null;

    lead.status = status;
    lead.updatedAt = new Date();

    // Trigger appropriate sequences based on status
    if (status === 'assessment_completed') {
      this.enrollInSequence(leadId, 'general_fundamentals');
    }

    this.leads.set(leadId, lead);
    return lead;
  }

  /**
   * Record a touchpoint
   */
  recordTouchpoint(leadId: string, touchpoint: Omit<NurtureTouchpoint, 'timestamp'>): void {
    const lead = this.leads.get(leadId);
    if (!lead) return;

    lead.nurtureTouchpoints.push({
      ...touchpoint,
      timestamp: new Date(),
    });
    lead.updatedAt = new Date();
    this.leads.set(leadId, lead);
  }

  /**
   * Calculate lead score
   */
  calculateLeadScore(leadId: string): number {
    const lead = this.leads.get(leadId);
    if (!lead) return 0;

    let score = 0;

    // Engagement score based on status
    const statusScores: Record<LeadStatus, number> = {
      new: 5,
      assessment_started: 15,
      assessment_completed: 35,
      nurture_sequence: 25,
      quote_requested: 55,
      consultation_scheduled: 70,
      proposal_sent: 80,
      negotiation: 85,
      closed_won: 100,
      closed_lost: 0,
      renewal_pending: 90,
    };
    score += statusScores[lead.status];

    // Touchpoint score
    for (const touchpoint of lead.nurtureTouchpoints) {
      const touchpointScores: Record<string, number> = {
        email: 2,
        call: 10,
        meeting: 20,
        webinar: 5,
        content_download: 5,
      };
      score += touchpointScores[touchpoint.type] || 0;
    }

    // Firmographic score
    if (lead.employeeCount) {
      if (lead.employeeCount > 500) score += 40;
      else if (lead.employeeCount > 200) score += 30;
      else if (lead.employeeCount > 50) score += 20;
      else if (lead.employeeCount > 10) score += 10;
      else score += 5;
    }

    if (lead.annualRevenue) {
      if (lead.annualRevenue > 50000000) score += 40;
      else if (lead.annualRevenue > 10000000) score += 30;
      else if (lead.annualRevenue > 2000000) score += 20;
      else if (lead.annualRevenue > 500000) score += 10;
      else score += 5;
    }

    // Interest score
    score += lead.interestedLines.length * 5;

    return Math.min(100, score);
  }

  /**
   * Enroll lead in a nurture sequence
   */
  enrollInSequence(leadId: string, sequenceId: string): boolean {
    const sequence = NURTURE_SEQUENCES[sequenceId];
    if (!sequence) return false;

    const lead = this.leads.get(leadId);
    if (!lead) return false;

    this.activeSequences.set(leadId, {
      sequenceId,
      currentStep: 1,
      startedAt: new Date(),
    });

    // Update lead status
    if (lead.status === 'assessment_completed' || lead.status === 'new') {
      lead.status = 'nurture_sequence';
      lead.updatedAt = new Date();
      this.leads.set(leadId, lead);
    }

    return true;
  }

  /**
   * Get next email in sequence for a lead
   */
  getNextSequenceEmail(leadId: string): { email: NurtureEmail; sequence: NurtureSequence } | null {
    const activeSequence = this.activeSequences.get(leadId);
    if (!activeSequence) return null;

    const sequence = NURTURE_SEQUENCES[activeSequence.sequenceId];
    if (!sequence) return null;

    const email = sequence.emails.find(e => e.step === activeSequence.currentStep);
    if (!email) return null;

    return { email, sequence };
  }

  /**
   * Advance sequence to next step
   */
  advanceSequence(leadId: string): void {
    const activeSequence = this.activeSequences.get(leadId);
    if (!activeSequence) return;

    const sequence = NURTURE_SEQUENCES[activeSequence.sequenceId];
    if (!sequence) return;

    if (activeSequence.currentStep < sequence.emails.length) {
      activeSequence.currentStep++;
      this.activeSequences.set(leadId, activeSequence);
    } else {
      // Sequence complete
      this.activeSequences.delete(leadId);
    }
  }

  /**
   * Get all available sequences
   */
  getAvailableSequences(): NurtureSequence[] {
    return Object.values(NURTURE_SEQUENCES);
  }

  /**
   * Get sequence by ID
   */
  getSequence(sequenceId: string): NurtureSequence | null {
    return NURTURE_SEQUENCES[sequenceId] || null;
  }

  /**
   * Get funnel metrics
   */
  getFunnelMetrics(): {
    byStage: Record<LeadStatus, number>;
    conversionRates: { stage: LeadStatus; rate: number }[];
    averageTimeToClose: number;
    totalLeads: number;
    activeLeads: number;
    closedWon: number;
    closedLost: number;
    totalValue: number;
    projectedValue: number;
  } {
    const leads = Array.from(this.leads.values());

    const byStage: Record<LeadStatus, number> = {
      new: 0,
      assessment_started: 0,
      assessment_completed: 0,
      nurture_sequence: 0,
      quote_requested: 0,
      consultation_scheduled: 0,
      proposal_sent: 0,
      negotiation: 0,
      closed_won: 0,
      closed_lost: 0,
      renewal_pending: 0,
    };

    let totalValue = 0;
    let closedCount = 0;
    let totalTimeToClose = 0;

    for (const lead of leads) {
      // Validate status exists in byStage before incrementing
      if (lead.status in byStage) {
        byStage[lead.status]++;
      }

      if (lead.status === 'closed_won' && lead.actualValue) {
        totalValue += lead.actualValue;
        if (lead.closedAt) {
          totalTimeToClose += lead.closedAt.getTime() - lead.createdAt.getTime();
          closedCount++;
        }
      }
    }

    // Calculate conversion rates between stages
    const stageOrder: LeadStatus[] = [
      'new', 'assessment_started', 'assessment_completed',
      'nurture_sequence', 'quote_requested', 'consultation_scheduled',
      'proposal_sent', 'negotiation', 'closed_won',
    ];

    const conversionRates = stageOrder.slice(0, -1).map((stage, index) => {
      const nextStage = stageOrder[index + 1];
      const currentCount = byStage[stage];
      const nextCount = byStage[nextStage];
      return {
        stage: nextStage,
        rate: currentCount > 0 ? nextCount / currentCount : 0,
      };
    });

    // Calculate projected value (leads not yet closed)
    let projectedValue = 0;
    for (const lead of leads) {
      if (lead.status !== 'closed_won' && lead.status !== 'closed_lost' && lead.estimatedValue) {
        const stageIndex = stageOrder.indexOf(lead.status);
        // Guard against missing status (indexOf returns -1)
        if (stageIndex === -1) {
          continue;
        }
        const conversionProbability = stageOrder
          .slice(stageIndex)
          .reduce((prob, _stage, idx) => {
            const target = FUNNEL_STAGES.find(fs => fs.stage === stageOrder[stageIndex + idx])?.conversionTarget || 0.5;
            return prob * target;
          }, 1);
        projectedValue += lead.estimatedValue * conversionProbability;
      }
    }

    return {
      byStage,
      conversionRates,
      averageTimeToClose: closedCount > 0 ? totalTimeToClose / closedCount / (1000 * 60 * 60 * 24) : 0, // days
      totalLeads: leads.length,
      activeLeads: leads.filter(l => !['closed_won', 'closed_lost'].includes(l.status)).length,
      closedWon: byStage.closed_won,
      closedLost: byStage.closed_lost,
      totalValue,
      projectedValue,
    };
  }

  /**
   * Get leads by status
   */
  getLeadsByStatus(status: LeadStatus): InsuranceLead[] {
    return Array.from(this.leads.values()).filter(l => l.status === status);
  }

  /**
   * Get high-priority leads (high score, active status)
   */
  getHighPriorityLeads(limit: number = 10): InsuranceLead[] {
    const activeStatuses: LeadStatus[] = [
      'quote_requested', 'consultation_scheduled', 'proposal_sent', 'negotiation',
    ];

    return Array.from(this.leads.values())
      .filter(l => activeStatuses.includes(l.status))
      .map(l => ({ lead: l, score: this.calculateLeadScore(l.id) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.lead);
  }

  /**
   * Estimate potential commission for a lead
   */
  estimateLeadCommission(leadId: string): {
    total: number;
    breakdown: { line: InsuranceLine; commission: number }[];
    confidence: 'low' | 'medium' | 'high';
  } {
    const lead = this.leads.get(leadId);
    if (!lead) {
      return { total: 0, breakdown: [], confidence: 'low' };
    }

    const breakdown: { line: InsuranceLine; commission: number }[] = [];
    let total = 0;

    for (const line of lead.interestedLines) {
      const config = INSURANCE_LINE_CONFIGS[line];
      if (!config) continue;

      const avgPremium = (config.typicalPremiumRange.min + config.typicalPremiumRange.max) / 2;
      const avgCommissionRate = (config.commissionRange.min + config.commissionRange.max) / 2;
      const commission = avgPremium * avgCommissionRate;

      breakdown.push({ line, commission: Math.round(commission) });
      total += commission;
    }

    // Confidence based on data completeness
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (lead.employeeCount && lead.annualRevenue && lead.interestedLines.length > 0) {
      confidence = 'high';
    } else if (lead.interestedLines.length > 0) {
      confidence = 'medium';
    }

    return { total: Math.round(total), breakdown, confidence };
  }

  /**
   * Get email template with personalization
   */
  personalizeEmail(
    email: NurtureEmail,
    lead: InsuranceLead,
    data: Record<string, string>
  ): { subject: string; body: string } {
    let subject = email.subject;
    let body = email.body;

    // Standard replacements
    const replacements: Record<string, string> = {
      firstName: lead.contactName?.split(' ')[0] || 'there',
      companyName: lead.companyName || 'your company',
      industry: lead.industry || 'your industry',
      advisorName: 'Your Insurance Advisor',
      calendarLink: 'https://calendly.com/insurance-hub/consultation',
      assessmentDate: lead.createdAt.toLocaleDateString(),
      ...data,
    };

    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      // Use function replacer to avoid $& and other special replacement patterns
      subject = subject.replace(regex, () => value);
      body = body.replace(regex, () => value);
    }

    return { subject, body };
  }
}

// Export singleton instance
export const leadFunnel = new LeadFunnel();
