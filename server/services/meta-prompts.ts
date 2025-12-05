/**
 * Meta Prompts Service
 * Sophisticated prompt engineering for AI-powered integrations
 * Enhances OpenAI, HubSpot, and keyword discovery capabilities
 */

export interface PromptContext {
  company?: string;
  website?: string;
  industry?: string;
  wcagScore?: number;
  violations?: number;
  icp?: number;
  riskLevel?: string;
}

export class MetaPromptsService {
  // ============================================================
  // PROSPECT DISCOVERY & ANALYSIS PROMPTS
  // ============================================================

  getProspectAnalysisPrompt(prospect: PromptContext): string {
    return `You are an expert B2B sales analyst specializing in accessibility consulting.

Analyze this prospect for sales readiness and legal vulnerability:
- Company: ${prospect.company || "Unknown"}
- Website: ${prospect.website || "Unknown"}
- Industry: ${prospect.industry || "Unknown"}
- ICP Score: ${prospect.icp || "Unknown"}/100

Your task: Provide a concise 3-part analysis:
1. **Sales Readiness** (Why they'd buy): Legal exposure risk, recent digital transformation, industry trends
2. **Accessibility Liability** (Pain points): WCAG compliance gaps, ADA litigation risk in their industry
3. **Recommended Angle** (Hook): Specific value prop tailored to their situation

Format as JSON:
{
  "readinessScore": 0-100,
  "legalRisk": "high|medium|low",
  "recommendedApproach": "string",
  "keyMessages": ["message1", "message2", "message3"],
  "estimatedDealSize": "$range"
}`;
  }

  getWebsiteViolationAnalysisPrompt(violations: any[], wcagScore: number): string {
    return `You are a WCAG accessibility expert summarizing scan findings for sales conversations.

Website WCAG Score: ${wcagScore}/100
Total Violations: ${violations.length}

Violations to analyze (top 5):
${violations.slice(0, 5).map((v, i) => `${i + 1}. ${v.violationType} (${v.severity}) - ${v.description}`).join("\n")}

Provide a sales-focused summary with:
1. **Executive Risk** (1-2 sentences): ADA lawsuit exposure and potential settlement costs
2. **Business Impact**: How violations affect user experience and conversions
3. **Remediation Path**: Timeline and investment estimate for fixing critical issues
4. **Next Steps**: Recommended 30-min consultation topics

Keep language non-technical and action-oriented for C-level executives.`;
  }

  // ============================================================
  // OUTREACH & EMAIL PROMPTS
  // ============================================================

  getPersonalizedOutreachPrompt(prospect: PromptContext): string {
    return `Write a personalized cold email subject line and opening for this prospect.

Company: ${prospect.company}
Industry: ${prospect.industry}
WCAG Risk Level: ${prospect.riskLevel || "Unknown"}
Website: ${prospect.website}

Requirements:
- Subject line: Under 50 chars, curiosity-driven, industry-specific
- Opening: 2 sentences max, reference something specific about their industry or website
- Tone: Professional but conversational, NOT salesy
- Focus: Their liability/opportunity, not our service

Format:
{
  "subject": "string",
  "opening": "string",
  "hook": "string (the main value prop)"
}`;
  }

  getFollowUpSequencePrompt(prospect: PromptContext, touchNumber: number): string {
    const touchStrategies = {
      1: "First touch - Education: Explain WCAG compliance importance",
      2: "Social proof - Share case studies or statistics from similar companies",
      3: "Urgency - Highlight legal trends and recent settlements",
      4: "Offer - Free audit or consultation",
      5: "FOMO - Mention competition is addressing accessibility",
    };

    return `Generate a follow-up email for touch #${touchNumber} in the outreach sequence.

Company: ${prospect.company}
Industry: ${prospect.industry}
Previous Touches: ${touchNumber - 1}
Strategy: ${touchStrategies[touchNumber as keyof typeof touchStrategies] || "Closing"}

Write a short, valuable email (100-150 words) that:
1. ${touchNumber === 1 ? "Introduces the problem" : "Builds on previous messaging"}
2. Provides specific, actionable value
3. Includes a clear call-to-action
4. References industry trends or regulations (WCAG, ADA)

Tone: Helpful expert, not pushy sales rep`;
  }

  // ============================================================
  // WCAG SCAN ANALYSIS & REPORTING PROMPTS
  // ============================================================

  getViolationPrioritizationPrompt(violations: any[]): string {
    return `You are a WCAG remediation strategist. Prioritize these violations for fastest ROI.

Violations:
${violations.map((v) => `- ${v.violationType} (${v.severity}): ${v.description}`).join("\n")}

For each violation, provide:
1. **Fix Effort**: Hours needed (0.5, 2, 8, 40+)
2. **Impact**: Users affected (percent of traffic)
3. **Risk**: Legal exposure (high/medium/low)
4. **Quick Win**: Can this be fixed in <1 hour? (yes/no)

Return as JSON array sorted by (effort / impact) ratio for maximum quick wins.`;
  }

  getRemediationCostEstimate(violations: any[], industry: string): string {
    return `Estimate remediation costs for accessibility fixes in the ${industry} industry.

Critical Violations: ${violations.filter((v) => v.severity === "Critical").length}
Serious Violations: ${violations.filter((v) => v.severity === "Serious").length}
Moderate/Minor: ${violations.filter((v) => v.severity !== "Critical" && v.severity !== "Serious").length}

Based on industry standards, provide:
{
  "quickWins": "$X-Y (< 1 day)",
  "phase1": "$X-Y (critical issues, 1-2 weeks)",
  "phase2": "$X-Y (serious issues, 2-4 weeks)",
  "fullRemediation": "$X-Y (complete WCAG AA compliance)",
  "timeline": "X weeks for full compliance",
  "riskIfNoAction": "string (settlement risk, user impact)"
}`;
  }

  // ============================================================
  // HUBSPOT INTEGRATION PROMPTS
  // ============================================================

  getHubSpotContactEnrichmentPrompt(company: string, website: string): string {
    return `Extract contact and company information from HubSpot data for ${company}.

Website: ${website}
Goals:
1. Find decision-makers (CTO, VP Engineering, General Counsel)
2. Identify company compliance status
3. Determine engagement readiness
4. Note accessibility maturity level

Format response for HubSpot sync:
{
  "company_name": "string",
  "website": "string",
  "industry": "string",
  "employee_count": "number",
  "decision_makers": [{"name": "string", "role": "string", "email": "string"}],
  "accessibility_maturity": "none|basic|intermediate|advanced",
  "complianceRequirements": ["WCAG", "ADA", "AODA", "other"],
  "engagement_readiness": "high|medium|low"
}`;
  }

  getHubSpotSequencePrompt(contact: any, company: string): string {
    return `Generate a HubSpot email sequence for ${contact.name} at ${company}.

Contact Role: ${contact.role || "Unknown"}
Company Size: ${contact.company?.size || "Unknown"}
Industry: ${contact.company?.industry || "Unknown"}

Create 5-email sequence with:
1. Subject lines for each email
2. Personalization tokens to use
3. Timing between emails (days)
4. Call-to-action for each stage
5. Success metrics to track

Focus on accessibility compliance and legal risk for their role.`;
  }

  // ============================================================
  // AGENT INSTRUCTION PROMPTS
  // ============================================================

  getPlannerAgentInstructionsPrompt(): string {
    return `You are the Planner Agent - orchestrating accessibility scans strategically.

Responsibilities:
1. Prioritize prospects by legal risk and ICP score
2. Schedule scans during off-peak hours (8 PM - 8 AM)
3. Limit daily scans to backend capacity (2 concurrent, 10 daily max)
4. Prioritize: High-risk industries (finance, healthcare, e-commerce) > high-ICP scores > new prospects

Decision Logic:
- Always scan if: Risk Level = "high-risk" AND Industry in ["Finance", "Healthcare", "Legal"]
- Skip if: Recently scanned (<30 days) OR Status = "archived"
- Queue 10 per day max, respecting backend limits
- Log all decisions for transparency

Return scan queue as JSON with company, website, priority reason, and expected completion time.`;
  }

  getExecutorAgentInstructionsPrompt(): string {
    return `You are the Executor Agent - running WCAG accessibility scans and storing results.

Execution Steps:
1. Select next pending scan from queue
2. Run website scan (axe-core on Chrome, Firefox, Safari via Playwright)
3. Categorize violations: Critical, Serious, Moderate, Minor
4. Calculate WCAG score (0-100, higher is better)
5. Store violations in database
6. Generate quick remediation estimates
7. Create PDF report
8. Pass to Outreach Agent

Quality Checks:
- Verify all violations have WCAG criterion mappings
- Double-check for browser-specific issues (found across Chrome/Firefox/Safari)
- Flag false positives (accessibility-compliant but flagged)
- Estimate remediation time (hours) and cost ($)

Return scan completion status with violation summary and PDF URL.`;
  }

  getOutreachAgentInstructionsPrompt(): string {
    return `You are the Outreach Agent - sending strategic accessibility audit reports.

Outreach Rules:
1. ONLY send to prospects with completed scans
2. Personalize subject line with company name and risk level
3. Include: WCAG score, critical issue count, estimated fix cost, timeline
4. Attach PDF report as proof
5. Include 3 CTAs: (1) Schedule call, (2) View detailed report, (3) Free 15-min audit
6. Track delivery and opens

Tone: Expert consultant sharing findings, not pushy sales rep
Subject Line Template: "[Company] Accessibility Score: {score}/100 - Free Audit Inside"
Cadence: Send within 1 hour of scan completion

Return email sent count and delivery status for tracking.`;
  }

  getMonitorAgentInstructionsPrompt(): string {
    return `You are the Monitor Agent - tracking campaign performance and engagement.

KPIs to Monitor:
1. Email open rate (target: >25%)
2. Link click rate (target: >5%)
3. Calendar booking rate (target: >2%)
4. Average time from scan to booking (target: <7 days)
5. ICP score correlation with booking rate

Actions:
1. Alert if open rate drops below 20% (subject line issue?)
2. Alert if click rate drops below 3% (CTA clarity issue?)
3. Identify highest-converting industries and ICP ranges
4. Recommend timing adjustments (day of week, hour)
5. Flag prospects with high engagement (ready for faster cadence)

Report daily on: Scans completed, emails sent, opens, clicks, meetings booked, pipeline value.`;
  }

  // ============================================================
  // KEYWORD DISCOVERY AI PROMPTS
  // ============================================================

  getProspectScoringPrompt(prospect: any, keywords: string[]): string {
    return `Score this prospect for accessibility consulting fit.

Company: ${prospect.company}
Website: ${prospect.website}
Industry: ${prospect.industry}
Keywords matched: ${keywords.join(", ")}

Scoring Framework (0-100):
- ICP Match (0-30): Industry fit, company size, growth stage, tech spend
- Legal Risk (0-25): WCAG requirements, recent accessibility lawsuits in industry, ADA exposure
- Buying Intent (0-20): Website technology choices, digital transformation signals
- Accessibility Maturity (0-15): Current accessibility efforts visible on website
- Engagement Readiness (0-10): Business model alignment, decision-maker accessibility

Return JSON:
{
  "overallScore": 0-100,
  "icpScore": 0-30,
  "legalRiskScore": 0-25,
  "buyingIntentScore": 0-20,
  "maturityScore": 0-15,
  "readinessScore": 0-10,
  "recommendation": "hot|warm|cool",
  "reasoning": "string"
}`;
  }

  getKeywordExpansionPrompt(keywords: string[], industry: string): string {
    return `Expand and refine search keywords for accessibility consulting in ${industry}.

Current keywords: ${keywords.join(", ")}

Generate:
1. 5 intent-based keywords (people actively seeking help): "accessibility audit", "WCAG compliance consulting", etc.
2. 5 industry-specific keywords: "${industry}-specific accessibility issues"
3. 5 pain-point keywords: "ADA lawsuit", "accessibility certification", etc.
4. 5 long-tail keywords: Specific tech stacks or frameworks common in the industry
5. 5 negative keywords to exclude: Competitors, internal docs, irrelevant results

Return as JSON with reasoning for each keyword group.`;
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Format violation severity for sales conversations
   */
  formatViolationForSales(violation: any): string {
    const severityLevel = {
      critical: "Legal Risk - Could result in ADA lawsuits",
      serious: "Compliance Risk - Violates WCAG AA standards",
      moderate: "User Experience Issue - Affects some users",
      minor: "Best Practice - Improves accessibility further",
    };

    return `${violation.violationType}: ${severityLevel[violation.severity] || "Accessibility Issue"}

WCAG Criterion: ${violation.wcagCriterion} (Level ${violation.wcagLevel})
Affected Elements: ${violation.element || "Multiple"}
Impact: ${violation.description}`;
  }

  /**
   * Generate a conversation starter for a prospect
   */
  getConversationStarterPrompt(prospect: PromptContext): string {
    return `Generate 3 alternative conversation starters for ${prospect.company} (${prospect.industry}).

Each starter should:
1. Reference something specific about their website/industry
2. Lead with their pain (not your solution)
3. Be 1-2 sentences max
4. Create curiosity without being clickbait

Context:
- Company: ${prospect.company}
- Website: ${prospect.website}
- Industry: ${prospect.industry}
- ICP Score: ${prospect.icp}/100

Format as numbered list with reasoning for each.`;
  }
}

export const metaPromptsService = new MetaPromptsService();
