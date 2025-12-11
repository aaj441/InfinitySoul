/**
 * Email Draft Generator - AIDA Framework
 * Generates cold email outreach using 20+ years of sales best practices
 * Optimized for Free tier - no API calls, lightweight generation
 */

export interface EmailDraftRequest {
  prospectCompany: string;
  prospectWebsite: string;
  prospectIndustry?: string;
  wcagScore: number;
  criticalIssues: number;
  estimatedLegalRisk: "high" | "medium" | "low";
  estimatedFixCost?: string;
  senderName: string;
  senderTitle?: string;
  senderCompany?: string;
  recipientName?: string;
  personalNote?: string; // Custom note to personalize
}

export interface EmailDraft {
  subject: string;
  body: string;
  preheader: string; // For email clients that show preview text
  callToAction: string;
  followUpDays: number;
}

export class EmailGenerator {
  /**
   * Generate cold email using AIDA framework
   * A - Attention (hook with problem)
   * I - Interest (build interest with proof)
   * D - Desire (create urgency/desire)
   * A - Action (clear CTA)
   */
  generateColdEmail(request: EmailDraftRequest): EmailDraft {
    const { prospectCompany, wcagScore, criticalIssues, estimatedLegalRisk, senderName, senderTitle, senderCompany, recipientName, personalNote, prospectIndustry } =
      request;

    // SUBJECT LINE: A - Get Attention (10+ variants with vertical-specific hooks)
    const baseSubjectLines = [
      // Risk-focused
      `${prospectCompany}: ${criticalIssues} Critical Accessibility Issues Found (Legal Risk)`,
      `[Urgent] ${prospectCompany} WCAG Audit: ${criticalIssues} Issues Detected`,
      
      // Score-focused
      `Your Accessibility Score: ${wcagScore}/100 - Improvement Path Inside`,
      `WCAG Audit Results for ${prospectCompany}: ${wcagScore}/100 + Action Plan`,
      
      // SEO/Growth-focused  
      `Quick Win: Fix ${criticalIssues} Critical Issues & Boost SEO at ${prospectCompany}`,
      `${prospectCompany}: ${criticalIssues} Issues Blocking Better Rankings`,
      
      // Compliance-focused
      `ADA Compliance Update: ${prospectCompany} has ${criticalIssues} Exposure Points`,
      `${prospectCompany} - Accessibility Compliance Check (5 min read)`,
      
      // Personalization-focused
      `${recipientName ? recipientName + ', ' : ''}${criticalIssues} Accessibility Issues Found on ${prospectCompany}`,
      `We Audited ${prospectCompany} - ${criticalIssues} Gaps Detected`,
      
      // Vertical-specific
      ...this.getVerticalSubjectLines(prospectCompany, prospectIndustry, wcagScore, criticalIssues, estimatedLegalRisk),
    ];

    const subject = this.selectBest(baseSubjectLines);
    // Dynamic preheader based on risk level
    const preheader = estimatedLegalRisk === "high" 
      ? `⚠️ High legal risk detected - ${wcagScore}/100 score, ${criticalIssues} critical issues`
      : `${wcagScore}/100 WCAG Score - ${criticalIssues} issues found`;

    // Build email body using AIDA
    const body = this.buildEmailBody(request);
    const callToAction = this.generateCTA(request);

    return {
      subject,
      preheader,
      body,
      callToAction,
      followUpDays: 3, // Recommend follow-up in 3 days
    };
  }

  /**
   * A - ATTENTION: Hook with specific problem + social proof
   */
  private buildEmailBody(request: EmailDraftRequest): string {
    const { prospectCompany, prospectWebsite, wcagScore, criticalIssues, estimatedLegalRisk, senderName, senderTitle, recipientName, personalNote } =
      request;

    const lines: string[] = [];

    // Personalized greeting
    if (recipientName) {
      lines.push(`Hi ${recipientName},`);
    } else {
      lines.push(`Hi,`);
    }

    lines.push(""); // Blank line

    // A - ATTENTION: Hook with specific problem (not generic)
    lines.push(
      `I just completed a WCAG accessibility audit of ${prospectCompany}'s website and found something important.`
    );
    lines.push("");

    // Add specific finding (data = attention)
    if (criticalIssues > 0) {
      const riskText = this.getRiskSummary(estimatedLegalRisk, criticalIssues);
      lines.push(`${riskText}`);
    } else {
      lines.push(
        `While your site scores ${wcagScore}/100, there are specific accessibility gaps that could impact compliance.`
      );
    }

    lines.push("");

    // I - INTEREST: Build interest with evidence + social proof
    lines.push("**Why This Matters:**");
    lines.push("");
    lines.push("✓ Accessibility isn't optional—it's legally required (ADA, WCAG 2.1)");
    if (estimatedLegalRisk === "high") {
      lines.push(
        "✓ Recent settlements in similar cases: $50K-$450K (your site has similar exposure)"
      );
    } else {
      lines.push("✓ Recent court rulings favor stricter enforcement");
    }
    lines.push(
      "✓ Better accessibility = better SEO ranking & 20% more traffic (on average)"
    );
    lines.push(
      "✓ Fix-to-launch timeline: 2-8 weeks (not months like most think)"
    );

    lines.push("");

    // D - DESIRE: Create urgency + paint picture of fixed state
    lines.push("**The Good News:**");
    lines.push("");
    lines.push(
      "We've helped companies like yours fix similar issues in 4-6 weeks."
    );
    lines.push(
      "Most improvements show immediate ROI through better search rankings and user retention."
    );

    lines.push("");

    // Personal note (if provided - high personalization)
    if (personalNote) {
      lines.push(`**Why I'm reaching out:**`);
      lines.push(`${personalNote}`);
      lines.push("");
    }

    // A - ACTION: Clear, easy next step (low friction)
    lines.push("**Next Step:**");
    lines.push(
      "I'd love to discuss a quick remediation plan—no obligations, just insights."
    );
    lines.push(
      "Are you free for a brief 15-minute call this week? (I'll bring the detailed audit report)"
    );

    lines.push("");
    lines.push("Best regards,");
    lines.push(senderName);
    if (senderTitle) {
      lines.push(senderTitle);
    }

    return lines.join("\n");
  }

  /**
   * Generate compelling CTA based on risk level
   */
  private generateCTA(request: EmailDraftRequest): string {
    const { estimatedLegalRisk, criticalIssues } = request;

    if (estimatedLegalRisk === "high") {
      return "Schedule 15-Min Accessibility Audit Review (This Week)";
    } else if (criticalIssues > 5) {
      return "View Audit Report & Discuss Fix Priority";
    } else {
      return "Chat About Accessibility Improvements";
    }
  }

  /**
   * Get vertical-specific subject lines for better relevance
   */
  private getVerticalSubjectLines(company: string, industry?: string, score?: number, issues?: number, risk?: string): string[] {
    const lines: string[] = [];
    
    if (!industry) return lines;
    
    const industryLower = industry.toLowerCase();
    
    if (industryLower.includes('finance') || industryLower.includes('fintech') || industryLower.includes('payment')) {
      lines.push(
        `${company}: ${issues} Financial Compliance Issues Found (CFPB & ADA Risk)`,
        `Accessibility Audit: ${company} Transaction Friction Assessment`,
        `${company} - ${issues} Payment Flow Accessibility Gaps`
      );
    } else if (industryLower.includes('healthcare') || industryLower.includes('medical')) {
      lines.push(
        `${company} HIPAA Compliance Check: ${issues} Accessibility Issues`,
        `Healthcare Website Audit: ${company} Patient Access Review`,
        `${company} - ${issues} Portal Accessibility Violations`
      );
    } else if (industryLower.includes('ecommerce') || industryLower.includes('retail')) {
      lines.push(
        `${company}: Recover Lost Sales from ${issues} Accessibility Issues`,
        `Ecommerce Audit: ${company} Checkout Flow Accessibility`,
        `${company} - ${issues} Issues Blocking Conversions`
      );
    } else if (industryLower.includes('government') || industryLower.includes('education')) {
      lines.push(
        `${company}: Section 508 Compliance Review (${issues} Issues Found)`,
        `${company} - Digital Accessibility: Section 508 & ADA Assessment`,
        `Government Website Audit: ${company} Public Access Standards`
      );
    }
    
    return lines;
  }

  /**
   * Create risk summary based on legal liability
   */
  private getRiskSummary(risk: "high" | "medium" | "low", criticalIssues: number): string {
    if (risk === "high") {
      return `⚠️ **URGENT:** Your site has ${criticalIssues} critical accessibility violations. This creates significant legal exposure—similar cases have resulted in $50K-$450K settlements.`;
    } else if (risk === "medium") {
      return `${criticalIssues} accessibility issues detected. While not critical, these increase legal liability and impact 15-20% of your users (screen readers, keyboard navigation, etc.).`;
    } else {
      return `Good news—accessibility is mostly solid. But ${criticalIssues} small issues could be fixed quickly to achieve full WCAG AA compliance.`;
    }
  }

  /**
   * Select the most impactful line for the context
   */
  private selectBest(options: string[]): string {
    return options[0]; // In production, could score by relevance
  }

  /**
   * Generate follow-up email (if no response to first)
   */
  generateFollowUpEmail(request: EmailDraftRequest, daysSinceFirst: number): EmailDraft {
    const { prospectCompany, wcagScore } = request;

    const subject =
      daysSinceFirst === 3
        ? `Quick Thought: ${prospectCompany} Accessibility Audit`
        : `Last Chance: ${prospectCompany} Compliance Review`;

    const body = `Hi,

Following up on my previous message about the accessibility audit for ${prospectCompany}.

Just wanted to check if you had a chance to review the report. The findings showed several opportunities to improve both compliance and user experience.

Would a quick 15-minute call work better this week? I can share the audit results and a simple 30/60/90 day plan.

Looking forward to connecting.

Best regards,`;

    return {
      subject,
      preheader: `Follow up: ${prospectCompany} audit results`,
      body,
      callToAction: "Reply or Schedule 15-Minute Call",
      followUpDays: 3,
    };
  }

  /**
   * Generate email summary (perfect for preview in UI)
   */
  generateEmailSummary(request: EmailDraftRequest): string {
    const { prospectCompany, wcagScore, criticalIssues } = request;
    const { subject, callToAction } = this.generateColdEmail(request);

    return `Email Draft for ${prospectCompany}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: ${subject}

WCAG Score: ${wcagScore}/100
Critical Issues: ${criticalIssues}

CTA: ${callToAction}

This email uses the AIDA framework:
• Attention - Specific problem with data
• Interest - Evidence + social proof
• Desire - Urgency + benefits
• Action - Clear next step
`;
  }
}

export const emailGenerator = new EmailGenerator();
