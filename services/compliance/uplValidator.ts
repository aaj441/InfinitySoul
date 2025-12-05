/**
 * UPL (Unauthorized Practice of Law) Compliance Validator
 * 
 * Critical safeguard to prevent crossing from technical analysis to legal advice.
 * This validator must be run on ALL client-facing communications.
 * 
 * Legal Risk: UPL is a criminal offense in many states with potential for:
 * - Criminal charges (up to 5 years imprisonment)
 * - Civil liability
 * - Business shutdown
 * - Personal liability for officers
 */

export interface UPLValidationResult {
  compliant: boolean;
  violations: UPLViolation[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'pass';
  recommendation: string;
}

export interface UPLViolation {
  phrase: string;
  pattern: string;
  location: string;
  replacement?: string;
}

/**
 * Prohibited phrases that constitute Unauthorized Practice of Law
 * These patterns detect when we cross from technical facts to legal advice
 */
const UPL_PROHIBITED_PHRASES: Array<{ pattern: RegExp; replacement?: string; severity: 'critical' | 'high' | 'medium' }> = [
  // Direct legal predictions (CRITICAL)
  { pattern: /you will be sued/i, replacement: 'companies with similar profiles appear in litigation at X% rate', severity: 'critical' },
  { pattern: /you are liable/i, replacement: 'your site has violations comparable to those in litigation', severity: 'critical' },
  { pattern: /must comply with (the )?law/i, replacement: 'WCAG 2.2 standard specifies', severity: 'critical' },
  { pattern: /violate(s)? (the )?ADA/i, replacement: 'has violations comparable to those in ADA Title III cases', severity: 'critical' },
  { pattern: /federal law requires/i, replacement: 'WCAG 2.2 standard requires', severity: 'critical' },
  { pattern: /you should settle/i, replacement: 'consult your attorney about settlement strategy', severity: 'critical' },
  { pattern: /legal requirement/i, replacement: 'technical requirement under WCAG', severity: 'critical' },
  { pattern: /legal obligation/i, replacement: 'technical standard', severity: 'critical' },
  
  // Legal advice (HIGH)
  { pattern: /we recommend settling for/i, replacement: 'comparable settlements have averaged', severity: 'high' },
  { pattern: /you need to hire (a|an) (attorney|lawyer)/i, replacement: 'consult with your legal counsel', severity: 'high' },
  { pattern: /this (will|would) (protect|shield) you (from|against) (liability|lawsuits)/i, replacement: 'remediation addresses the technical violations', severity: 'high' },
  { pattern: /you are (not )?in compliance with/i, replacement: 'your site has X violations of WCAG standard', severity: 'high' },
  { pattern: /you (must|need to|should) take legal action/i, replacement: 'consult your attorney', severity: 'high' },
  
  // Legal characterizations (MEDIUM)
  { pattern: /this is a legal violation/i, replacement: 'this is a WCAG technical violation', severity: 'medium' },
  { pattern: /you have (no|little) legal defense/i, replacement: 'consult your attorney about defenses', severity: 'medium' },
  { pattern: /the court will rule/i, replacement: 'in comparable cases, courts have ruled', severity: 'medium' },
  { pattern: /you are required by law to/i, replacement: 'WCAG standard specifies', severity: 'medium' },
];

/**
 * Validate text for UPL compliance
 * 
 * @param text - The text to validate (email, report, communication)
 * @param context - Where this text appears (for better error messages)
 * @returns Validation result with violations and recommendations
 */
export function validateUPLCompliance(text: string, context: string = 'unknown'): UPLValidationResult {
  const violations: UPLViolation[] = [];
  let highestSeverity: 'critical' | 'high' | 'medium' | 'low' | 'pass' = 'pass';

  // Check each prohibited phrase pattern
  for (const { pattern, replacement, severity } of UPL_PROHIBITED_PHRASES) {
    const matches = text.match(new RegExp(pattern, 'gi'));
    
    if (matches) {
      for (const match of matches) {
        violations.push({
          phrase: match,
          pattern: pattern.source,
          location: context,
          replacement: replacement,
        });
      }
      
      // Track highest severity
      if (severity === 'critical' || highestSeverity === 'pass') {
        highestSeverity = severity;
      } else if (severity === 'high' && highestSeverity !== 'critical') {
        highestSeverity = severity;
      } else if (severity === 'medium' && highestSeverity === 'low') {
        highestSeverity = severity;
      }
    }
  }

  // Generate recommendation
  let recommendation = '';
  if (highestSeverity === 'critical') {
    recommendation = 'CRITICAL: This content contains prohibited legal advice. DO NOT SEND. Revise immediately. Consult legal counsel if unsure.';
  } else if (highestSeverity === 'high') {
    recommendation = 'HIGH: This content may constitute legal advice. Revise before sending. Use technical/factual alternatives suggested.';
  } else if (highestSeverity === 'medium') {
    recommendation = 'MEDIUM: This content approaches legal advice boundaries. Consider revising for clarity that this is technical analysis only.';
  } else {
    recommendation = 'PASS: No UPL violations detected. Remember to include standard legal disclaimer.';
  }

  return {
    compliant: violations.length === 0,
    violations,
    severity: highestSeverity,
    recommendation,
  };
}

/**
 * Check if text contains required legal disclaimers
 * All client communications should include appropriate disclaimers
 */
export function hasRequiredDisclaimers(text: string): {
  hasDisclaimer: boolean;
  missingDisclaimers: string[];
} {
  const requiredDisclaimers = [
    {
      name: 'Not legal advice',
      patterns: [
        /this is (not|NOT) legal advice/i,
        /not a legal opinion/i,
        /for legal (advice|guidance|questions), consult (your|an) attorney/i,
      ],
    },
    {
      name: 'Technical analysis only',
      patterns: [
        /technical (analysis|audit|findings) only/i,
        /this (is|represents) (a )?technical (assessment|analysis|audit)/i,
      ],
    },
  ];

  const missingDisclaimers: string[] = [];

  for (const disclaimer of requiredDisclaimers) {
    const hasAnyPattern = disclaimer.patterns.some(pattern => pattern.test(text));
    if (!hasAnyPattern) {
      missingDisclaimers.push(disclaimer.name);
    }
  }

  return {
    hasDisclaimer: missingDisclaimers.length === 0,
    missingDisclaimers,
  };
}

/**
 * Comprehensive UPL validation with disclaimer check
 * Use this for all client-facing communications before sending
 */
export function validateCompleteUPLCompliance(text: string, context: string = 'unknown'): {
  canSend: boolean;
  validation: UPLValidationResult;
  disclaimerCheck: ReturnType<typeof hasRequiredDisclaimers>;
  errors: string[];
} {
  const validation = validateUPLCompliance(text, context);
  const disclaimerCheck = hasRequiredDisclaimers(text);
  const errors: string[] = [];

  // Critical violations = cannot send
  if (validation.severity === 'critical') {
    errors.push('CRITICAL UPL violations detected. Content MUST be revised before sending.');
  }

  // High violations = should not send without review
  if (validation.severity === 'high') {
    errors.push('HIGH severity UPL issues detected. Legal counsel review recommended before sending.');
  }

  // Missing disclaimers
  if (!disclaimerCheck.hasDisclaimer) {
    errors.push(`Missing required disclaimers: ${disclaimerCheck.missingDisclaimers.join(', ')}`);
  }

  const canSend = validation.severity !== 'critical' && errors.length === 0;

  return {
    canSend,
    validation,
    disclaimerCheck,
    errors,
  };
}

/**
 * Standard legal disclaimer templates
 * Include one of these in all client communications
 */
export const STANDARD_DISCLAIMERS = {
  email: `
---
LEGAL DISCLAIMER: This is technical analysis only, not legal advice. InfinitySol is not a law firm. For legal guidance about compliance, liability, or litigation risk, consult your attorney. We provide technical findings based on WCAG standards and public litigation data.
`,
  
  report: `
## Legal Disclaimer

**InfinitySol is NOT a law firm. This audit is a technical analysis of your website against WCAG 2.2 standards.**

This report is NOT:
- A legal opinion or legal advice
- A guarantee of compliance or non-liability  
- A substitute for legal counsel
- A prediction of litigation outcomes

For legal questions about the ADA, state accessibility laws, or litigation risk, consult your attorney. For technical remediation that addresses the identified violations, engage InfinitySol.
`,

  riskAssessment: `
## Risk Assessment Disclaimer

This risk assessment is based on statistical analysis of public litigation data. It is NOT:
- A legal prediction of whether YOU will be sued
- A guarantee that remediation prevents lawsuits
- Legal advice about your obligations or liabilities
- A substitute for legal counsel

Litigation risk depends on many factors beyond technical violations. Consult your attorney for legal guidance.
`,
};

export default {
  validateUPLCompliance,
  hasRequiredDisclaimers,
  validateCompleteUPLCompliance,
  STANDARD_DISCLAIMERS,
};
