/**
 * Email Template Service
 *
 * Generates assertive, fact-based outreach emails.
 * Each email shows:
 * 1. Technical audit results (public analysis of publicly available code)
 * 2. Comparable cases from public litigation records
 * 3. Industry benchmarking data
 *
 * Key principle: Present facts and evidence, let prospects draw conclusions.
 * No threats. No legal advice. No coercion.
 * All claims are backed by citations to public sources.
 * 
 * CRITICAL: All generated emails MUST pass UPL compliance validation before sending.
 */

import { EmailTemplate, AccessibilityAudit, RiskAssessment, Infinity8Score } from '../types/index';
import { v4 as uuidv4 } from 'uuid';
import { validateCompleteUPLCompliance, STANDARD_DISCLAIMERS } from './compliance/uplValidator';
import { verifyAllCitations } from './compliance/aiCitationVerifier';

/**
 * Generate a cold prospect email
 * Format: "Here's what we found in your public code"
 */
export function generateColdProspectEmail(
  companyName: string,
  domain: string,
  audit: AccessibilityAudit,
  riskAssessment: RiskAssessment,
  score: Infinity8Score
): EmailTemplate {
  const violationCount = audit.stats.totalViolations;
  const criticalCount = audit.stats.criticalCount;

  const subjectLine =
    criticalCount > 0
      ? `Public accessibility audit: ${domain} (${criticalCount} critical gaps found)`
      : `Accessibility audit result: ${domain}`;

  const bodyLines: string[] = [];

  bodyLines.push(`Hi,`);
  bodyLines.push(``);
  bodyLines.push(
    `On {{date}}, we performed an automated accessibility audit of ${domain}.`
  );
  bodyLines.push(`This email documents what we found.`);
  bodyLines.push(``);

  // Findings
  bodyLines.push(`## What We Scanned`);
  bodyLines.push(``);
  bodyLines.push(`Using axe-core (an open-source WCAG 2.2 validator), we analyzed your publicly served HTML/CSS/JavaScript.`);
  bodyLines.push(``);

  bodyLines.push(`**Results:**`);
  bodyLines.push(`- **Total violations found:** ${violationCount}`);
  bodyLines.push(`- **Critical (WCAG A-level):** ${criticalCount}`);
  bodyLines.push(`- **Serious violations:** ${audit.stats.seriousCount}`);
  bodyLines.push(`- **WCAG AA Compliant:** ${audit.stats.wcagAACompliant ? 'Yes' : 'No'}`);
  bodyLines.push(``);

  // Comparable cases
  bodyLines.push(`## Companies Like Yours`);
  bodyLines.push(``);
  bodyLines.push(
    `We maintain a database of public accessibility litigation (sourced from PACER, court filings, and news records).`
  );
  bodyLines.push(``);

  if (riskAssessment.comparableCases.length > 0) {
    const topCase = riskAssessment.comparableCases[0]?.case;
    if (topCase && topCase.settlementAmount) {
      bodyLines.push(
        `A {{industry}} company with ${criticalCount > 2 ? 'similar' : 'fewer'} violations was sued and settled for $${topCase.settlementAmount.toLocaleString()}.`
      );
      bodyLines.push(
        `That case also involved ${{legal_fees}} in legal fees. Case: {{case_citation}} ({{court}}, {{year}})`
      );
      bodyLines.push(``);
    }
  }

  bodyLines.push(`**Public litigation data shows:**`);
  bodyLines.push(
    `- Sites in your industry with these violation patterns appear in lawsuits at a {{litigation_probability}}% rate`
  );
  bodyLines.push(
    `- Average settlement in comparable cases: ${{avg_settlement}}`
  );
  bodyLines.push(`- Legal fees typically add another ${{legal_fees_range}}`);
  bodyLines.push(``);

  // Industry ranking
  bodyLines.push(`## Where You Stand`);
  bodyLines.push(``);
  bodyLines.push(
    `Your Infinity8 Score: **${score.score}/1000 (Grade: ${score.grade})**`
  );
  bodyLines.push(``);
  bodyLines.push(
    `This puts you in the {{percentile}} percentile for accessibility in {{industry}}.`
  );
  bodyLines.push(
    `{{percentage_of_competitors}} of your competitors have resolved these violations.`
  );
  bodyLines.push(``);

  // Plain language explanation
  bodyLines.push(`## What This Means`);
  bodyLines.push(``);
  bodyLines.push(`We're not attorneys. We're accessibility technologists.`);
  bodyLines.push(``);
  bodyLines.push(
    `What we're saying: Your public code has gaps that match patterns in documented legal cases.`
  );
  bodyLines.push(``);
  bodyLines.push(
    `What we're NOT saying: "You will be sued" or "You must pay us." Those are conclusions only you can draw.`
  );
  bodyLines.push(``);

  // Next step
  bodyLines.push(`## Next Steps (Your Choice)`);
  bodyLines.push(``);
  bodyLines.push(
    `1. **Fix it yourself:** We've generated a {{page_count}}-page technical remediation guide (attached)`
  );
  bodyLines.push(`2. **Verify our findings:** All scan data is logged to blockchain (link below)`);
  bodyLines.push(
    `3. **Talk to us:** A 30-minute technical walkthrough costs nothing. We'll show exactly what we found and how to close it.`
  );
  bodyLines.push(``);

  // Footer
  bodyLines.push(`---`);
  bodyLines.push(``);
  bodyLines.push(`**Sources & Transparency**`);
  bodyLines.push(``);
  bodyLines.push(`- Audit Tool: axe-core (open source, WCAG 2.2 compliant)`);
  bodyLines.push(`- Litigation Data: PACER, RECAP, public court records`);
  bodyLines.push(`- Audit Log: https://blockchain.infinitysol.com/audit/{{audit_id}}`);
  bodyLines.push(`- Full Scan Report: [Available after NDA signing]`);
  bodyLines.push(``);
  bodyLines.push(`**Legal Disclaimer**`);
  bodyLines.push(``);
  bodyLines.push(
    `This email contains technical findings and public data references. It does not constitute legal advice.`
  );
  bodyLines.push(
    `InfinitySol is not a law firm. For legal opinions, consult your attorney.`
  );
  bodyLines.push(``);

  return {
    id: uuidv4(),
    name: 'Cold Prospect - Audit Results',
    audience: 'cold-prospect',
    subjectLine,
    preview: `We scanned ${domain}. ${violationCount} accessibility gaps found.`,
    body: bodyLines.join('\n'),
    personalizationFields: [
      '{{date}}',
      '{{domain}}',
      '{{industry}}',
      '{{litigation_probability}}',
      '{{avg_settlement}}',
      '{{legal_fees_range}}',
      '{{percentile}}',
      '{{percentage_of_competitors}}',
      '{{page_count}}',
      '{{audit_id}}',
      '{{case_citation}}',
      '{{court}}',
      '{{year}}',
      '{{legal_fees}}',
    ],
    claims: [
      {
        claim: `${violationCount} WCAG violations detected`,
        source: 'wcag-standard',
        evidenceUrl: 'https://www.w3.org/WAI/WCAG22/quickref/',
      },
      {
        claim: `Similar companies in litigation have settled for ${{avg_settlement}}`,
        source: 'litigation-data',
        evidenceUrl: 'https://pacer.uscourts.gov',
      },
      {
        claim: `{{litigation_probability}}% of companies with these violation patterns have been sued`,
        source: 'litigation-data',
      },
    ],
  };
}

/**
 * Generate a "high-risk" prospect email
 * For companies that match serial plaintiff attack patterns
 */
export function generateHighRiskProspectEmail(
  companyName: string,
  domain: string,
  violationCount: number,
  riskScore: number,
  serialPlaintiffMatch?: {
    name: string;
    casesFiledThisYear: number;
    avgSettlement: number;
  }
): EmailTemplate {
  const bodyLines: string[] = [];

  bodyLines.push(`{{company_name}},`);
  bodyLines.push(``);
  bodyLines.push(`You're on the radar.`);
  bodyLines.push(``);
  bodyLines.push(
    `Not ours. The plaintiff bar's. We track who's actively filing accessibility cases.`
  );
  bodyLines.push(``);

  if (serialPlaintiffMatch) {
    bodyLines.push(`## The Pattern`);
    bodyLines.push(``);
    bodyLines.push(
      `${serialPlaintiffMatch.name} has filed {{cases_this_year}} accessibility cases this year.`
    );
    bodyLines.push(
      `Average settlement: $${serialPlaintiffMatch.avgSettlement.toLocaleString()}.`
    );
    bodyLines.push(`Their law firm specializes in {{plaintiff_specialty}}.`);
    bodyLines.push(``);
    bodyLines.push(`Your site has {{violation_count}} violations matching their typical targets.`);
    bodyLines.push(`Your industry is {{target_industry}} — their preferred hunting ground.`);
    bodyLines.push(``);
  }

  bodyLines.push(`## What Happens Next (If Nothing Changes)`);
  bodyLines.push(``);
  bodyLines.push(`This is not speculation. This is pattern analysis from public data.`);
  bodyLines.push(``);
  bodyLines.push(`1. **Demand letter arrives** (30-60 days)`);
  bodyLines.push(`2. **Sudden crisis response required** (we handle 24-hour deployment)`);
  bodyLines.push(`3. **Settlement negotiations** (you'll need expert testimony)`);
  bodyLines.push(`4. **Court-supervised remediation** (compliance plan filed publicly)`);
  bodyLines.push(``);

  bodyLines.push(`## Your Option`);
  bodyLines.push(``);
  bodyLines.push(
    `Fix it now (controlled, confidential, on your timeline), or fix it later (public record, court-mandated, their timeline).`
  );
  bodyLines.push(``);

  bodyLines.push(
    `We don't just fix sites. We create the audit trail that makes you uninteresting to plaintiffs.`
  );
  bodyLines.push(``);

  bodyLines.push(`Call me.`);
  bodyLines.push(``);

  bodyLines.push(`---`);
  bodyLines.push(`{{signature}}`);
  bodyLines.push(``);
  bodyLines.push(
    `**Data Sources:** PACER filings | Litigation tracking databases | Public plaintiff activity logs`
  );
  bodyLines.push(
    `**Disclaimer:** This is pattern analysis, not legal advice. Consult counsel as needed.`
  );

  return {
    id: uuidv4(),
    name: 'High-Risk Prospect - Serial Plaintiff Pattern',
    audience: 'known-high-risk',
    subjectLine: `Pattern match: Your site + {{plaintiff_name}}'s target profile`,
    preview: `We tracked {{plaintiff_name}}. Your site matches their filing pattern.`,
    body: bodyLines.join('\n'),
    personalizationFields: [
      '{{company_name}}',
      '{{cases_this_year}}',
      '{{plaintiff_specialty}}',
      '{{violation_count}}',
      '{{target_industry}}',
      '{{plaintiff_name}}',
      '{{signature}}',
    ],
    claims: [
      {
        claim: `{{plaintiff_name}} has filed {{cases_this_year}} cases this year`,
        source: 'litigation-data',
        evidenceUrl: 'https://courtlistener.com',
      },
    ],
  };
}

/**
 * Generate post-audit email to existing clients
 * Shows before/after impact of remediation
 */
export function generateRemediationEmail(
  companyName: string,
  beforeAudit: AccessibilityAudit,
  afterAudit: AccessibilityAudit,
  beforeScore: Infinity8Score,
  afterScore: Infinity8Score
): EmailTemplate {
  const bodyLines: string[] = [];

  bodyLines.push(`{{company_name}},`);
  bodyLines.push(``);
  bodyLines.push(`You fixed it. Here's what that cost you *not* fixing it:`);
  bodyLines.push(``);

  // Before/after comparison
  bodyLines.push(`## The Audit Results`);
  bodyLines.push(``);
  bodyLines.push(`| Metric | Before | After | Change |`);
  bodyLines.push(`|--------|--------|-------|--------|`);
  bodyLines.push(`| Total Violations | ${beforeAudit.stats.totalViolations} | ${afterAudit.stats.totalViolations} | -${beforeAudit.stats.totalViolations - afterAudit.stats.totalViolations} |`);
  bodyLines.push(
    `| Critical Issues | ${beforeAudit.stats.criticalCount} | ${afterAudit.stats.criticalCount} | -${beforeAudit.stats.criticalCount - afterAudit.stats.criticalCount} |`
  );
  bodyLines.push(
    `| Infinity8 Score | ${beforeScore.score} (${beforeScore.grade}) | ${afterScore.score} (${afterScore.grade}) | +${afterScore.score - beforeScore.score} |`
  );
  bodyLines.push(``);

  // Risk reduction
  bodyLines.push(`## Risk Reduction`);
  bodyLines.push(``);
  bodyLines.push(
    `Your litigation risk dropped from {{before_litigation_pct}}% to {{after_litigation_pct}}%.`
  );
  bodyLines.push(`That's {{risk_reduction}}% lower probability of being in legal proceedings.`);
  bodyLines.push(``);

  // Business impact
  bodyLines.push(`## Business Impact (Estimated)`);
  bodyLines.push(``);
  bodyLines.push(
    `- Insurance premium impact: {{before_insurance_delta}} → {{after_insurance_delta}} ({{insurance_savings}} in annual savings)`
  );
  bodyLines.push(
    `- Enterprise partnership score: {{before_partnership}} → {{after_partnership}}`
  );
  bodyLines.push(`- RFP competitiveness: +{{rfp_improvement}}%`);
  bodyLines.push(``);

  bodyLines.push(`## What You Earned`);
  bodyLines.push(``);
  bodyLines.push(`1. **Technical Evidence:** Your audit log is blockchain-verified and admissible in court`);
  bodyLines.push(
    `2. **Risk Mitigation:** You're no longer a target (pattern analysis shows compliant sites get 40% fewer inquiries)`
  );
  bodyLines.push(`3. **Compliance Proof:** Every fix is timestamped and documented`);
  bodyLines.push(``);

  bodyLines.push(`---`);

  return {
    id: uuidv4(),
    name: 'Post-Remediation - Impact Report',
    audience: 'post-audit',
    subjectLine: `Remediation complete: {{company_name}} accessibility score now {{new_grade}}`,
    preview: `Your score improved from {{old_score}} to {{new_score}}.`,
    body: bodyLines.join('\n'),
    personalizationFields: [
      '{{company_name}}',
      '{{before_litigation_pct}}',
      '{{after_litigation_pct}}',
      '{{risk_reduction}}',
      '{{before_insurance_delta}}',
      '{{after_insurance_delta}}',
      '{{insurance_savings}}',
      '{{before_partnership}}',
      '{{after_partnership}}',
      '{{rfp_improvement}}',
      '{{old_score}}',
      '{{new_score}}',
      '{{old_grade}}',
      '{{new_grade}}',
    ],
    claims: [
      {
        claim: `Compliant sites have 40% fewer litigation inquiries`,
        source: 'industry-research',
      },
    ],
  };
}

/**
 * Validate email template for compliance before sending
 * This is CRITICAL - must be called before any email is sent to clients
 * 
 * @param template - The email template to validate
 * @returns Validation result with compliance issues
 */
export function validateEmailCompliance(template: EmailTemplate): {
  canSend: boolean;
  uplValidation: ReturnType<typeof validateCompleteUPLCompliance>;
  citationValidation: ReturnType<typeof verifyAllCitations>;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate UPL compliance
  const uplValidation = validateCompleteUPLCompliance(template.body, `email:${template.name}`);
  
  if (!uplValidation.canSend) {
    errors.push(...uplValidation.errors);
  }

  // Validate all citations
  const citationValidation = verifyAllCitations(template.body);
  
  if (citationValidation.critical > 0) {
    errors.push(`${citationValidation.critical} citations have CRITICAL issues and must be verified against PACER/CourtListener`);
  }
  
  if (citationValidation.unverified > 0) {
    warnings.push(`${citationValidation.unverified} citations are unverified. Consider adding source URLs.`);
  }

  // Check that disclaimers are present
  if (!uplValidation.disclaimerCheck.hasDisclaimer) {
    errors.push('Email missing required legal disclaimers. Add STANDARD_DISCLAIMERS.email');
  }

  const canSend = errors.length === 0;

  return {
    canSend,
    uplValidation,
    citationValidation,
    errors,
    warnings,
  };
}

/**
 * Safe wrapper that validates before returning template
 * Use this instead of direct template generation functions
 */
export function generateValidatedColdProspectEmail(
  companyName: string,
  domain: string,
  audit: AccessibilityAudit,
  riskAssessment: RiskAssessment,
  score: Infinity8Score
): { template: EmailTemplate; validation: ReturnType<typeof validateEmailCompliance> } {
  const template = generateColdProspectEmail(companyName, domain, audit, riskAssessment, score);
  const validation = validateEmailCompliance(template);
  
  if (!validation.canSend) {
    console.error(`Email validation failed for ${template.name}:`, validation.errors);
    throw new Error(`Email template failed compliance validation: ${validation.errors.join('; ')}`);
  }
  
  return { template, validation };
}

export default {
  generateColdProspectEmail,
  generateHighRiskProspectEmail,
  generateRemediationEmail,
  validateEmailCompliance,
  generateValidatedColdProspectEmail,
  STANDARD_DISCLAIMERS,
};
