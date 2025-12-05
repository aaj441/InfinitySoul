/**
 * Compliance Validators Test Suite
 * 
 * Tests for UPL, CFAA, and AI Citation validators
 */

import {
  validateUPLCompliance,
  hasRequiredDisclaimers,
  validateCompleteUPLCompliance,
  STANDARD_DISCLAIMERS,
} from '../services/compliance/uplValidator';

import {
  verifyCitation,
  verifyAllCitations,
  detectAIHallucinationRisk,
  validateCitationFormat,
  parseCitation,
} from '../services/compliance/aiCitationVerifier';

describe('UPL Compliance Validator', () => {
  describe('validateUPLCompliance', () => {
    it('should detect critical UPL violation: "you will be sued"', () => {
      const text = 'Based on our analysis, you will be sued if you don\'t fix this.';
      const result = validateUPLCompliance(text, 'test-email');
      
      expect(result.compliant).toBe(false);
      expect(result.severity).toBe('critical');
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0].phrase).toMatch(/you will be sued/i);
    });

    it('should detect critical UPL violation: "you are liable"', () => {
      const text = 'Your company is liable under the ADA for these violations.';
      const result = validateUPLCompliance(text, 'test-email');
      
      expect(result.compliant).toBe(false);
      expect(result.severity).toBe('critical');
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should detect critical UPL violation: "must comply with law"', () => {
      const text = 'You must comply with the law and fix these issues immediately.';
      const result = validateUPLCompliance(text, 'test-email');
      
      expect(result.compliant).toBe(false);
      expect(result.severity).toBe('critical');
    });

    it('should detect critical UPL violation: "violates the ADA"', () => {
      const text = 'Your website violates the ADA Title III requirements.';
      const result = validateUPLCompliance(text, 'test-email');
      
      expect(result.compliant).toBe(false);
      expect(result.severity).toBe('critical');
    });

    it('should allow compliant technical language', () => {
      const text = 'Your site has 47 WCAG 2.2 AA violations. Companies with similar profiles appear in litigation at a 78% rate. Average settlement: $65,000.';
      const result = validateUPLCompliance(text, 'test-email');
      
      expect(result.compliant).toBe(true);
      expect(result.severity).toBe('pass');
      expect(result.violations.length).toBe(0);
    });

    it('should allow citation of public data', () => {
      const text = 'According to Gil v. Winn-Dixie (11th Cir., 2020), the court found that website accessibility is required. Here is the public record.';
      const result = validateUPLCompliance(text, 'test-email');
      
      expect(result.compliant).toBe(true);
      expect(result.severity).toBe('pass');
    });

    it('should allow WCAG technical requirements', () => {
      const text = 'WCAG 2.2 AA requires form inputs to have associated labels. Your site has 14 inputs without labels.';
      const result = validateUPLCompliance(text, 'test-email');
      
      expect(result.compliant).toBe(true);
      expect(result.severity).toBe('pass');
    });
  });

  describe('hasRequiredDisclaimers', () => {
    it('should detect missing disclaimers', () => {
      const text = 'Your site has violations.';
      const result = hasRequiredDisclaimers(text);
      
      expect(result.hasDisclaimer).toBe(false);
      expect(result.missingDisclaimers.length).toBeGreaterThan(0);
    });

    it('should pass with proper disclaimers', () => {
      const text = `
        Your site has violations.
        
        This is NOT legal advice. This is technical analysis only.
        For legal guidance, consult your attorney.
      `;
      const result = hasRequiredDisclaimers(text);
      
      expect(result.hasDisclaimer).toBe(true);
      expect(result.missingDisclaimers.length).toBe(0);
    });

    it('should recognize standard disclaimer template', () => {
      const text = 'Your site has violations.' + STANDARD_DISCLAIMERS.email;
      const result = hasRequiredDisclaimers(text);
      
      expect(result.hasDisclaimer).toBe(true);
    });
  });

  describe('validateCompleteUPLCompliance', () => {
    it('should block sending with critical UPL violations', () => {
      const text = 'You will be sued if you don\'t comply with the law.';
      const result = validateCompleteUPLCompliance(text, 'test-email');
      
      expect(result.canSend).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.validation.severity).toBe('critical');
    });

    it('should block sending without disclaimers', () => {
      const text = 'Your site has 47 WCAG violations.';
      const result = validateCompleteUPLCompliance(text, 'test-email');
      
      expect(result.canSend).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Missing required disclaimers'));
    });

    it('should allow sending compliant content with disclaimers', () => {
      const text = `
        Your site has 47 WCAG 2.2 AA violations.
        Companies with similar profiles appear in litigation at 78% rate.
        
        ${STANDARD_DISCLAIMERS.email}
      `;
      const result = validateCompleteUPLCompliance(text, 'test-email');
      
      expect(result.canSend).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });
});

describe('AI Citation Verifier', () => {
  describe('detectAIHallucinationRisk', () => {
    it('should detect high risk: contains "generated"', () => {
      const citation = 'Smith v. Company (generated case, 2023)';
      const result = detectAIHallucinationRisk(citation);
      
      expect(result.risk).toBe('high');
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    it('should detect high risk: references AI', () => {
      const citation = 'As GPT told me, Smith v. Company settled for $100,000';
      const result = detectAIHallucinationRisk(citation);
      
      expect(result.risk).toBe('high');
      expect(result.indicators).toContain(expect.stringContaining('References AI system'));
    });

    it('should detect medium risk: vague amounts', () => {
      const citation = 'Smith v. Company settled for approximately $100,000';
      const result = detectAIHallucinationRisk(citation);
      
      expect(result.risk).toBe('medium');
    });

    it('should detect high risk: suspiciously round settlement', () => {
      const citation = 'Smith v. Company (E.D.N.Y., 2020) settled for $10,000,000';
      const result = detectAIHallucinationRisk(citation);
      
      expect(result.indicators).toContain(expect.stringContaining('Suspiciously round'));
    });

    it('should detect low risk for realistic citation', () => {
      const citation = 'Gil v. Winn-Dixie, 11th Cir., 2020, settled for $250,000';
      const result = detectAIHallucinationRisk(citation);
      
      expect(result.risk).toBe('low');
      expect(result.indicators.length).toBe(0);
    });
  });

  describe('parseCitation', () => {
    it('should parse case name', () => {
      const citation = 'Smith v. ABC Company (E.D.N.Y., 2020)';
      const result = parseCitation(citation);
      
      expect(result.caseName).toBe('Smith v. ABC Company');
    });

    it('should parse court', () => {
      const citation = 'Smith v. Company (E.D.N.Y., 2020)';
      const result = parseCitation(citation);
      
      expect(result.court).toBe('E.D.N.Y.');
    });

    it('should parse year', () => {
      const citation = 'Smith v. Company (E.D.N.Y., 2020)';
      const result = parseCitation(citation);
      
      expect(result.year).toBe(2020);
    });

    it('should parse settlement amount', () => {
      const citation = 'Smith v. Company settled for $250,000';
      const result = parseCitation(citation);
      
      expect(result.settlementAmount).toBe(250000);
    });

    it('should parse case number', () => {
      const citation = 'Smith v. Company, 1:20-cv-01234 (E.D.N.Y., 2020)';
      const result = parseCitation(citation);
      
      expect(result.caseNumber).toMatch(/\d+:\d+-cv-\d+/);
    });
  });

  describe('validateCitationFormat', () => {
    it('should require case name or number', () => {
      const citation = 'Some legal case from 2020';
      const result = validateCitationFormat(citation);
      
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'incorrect-format',
          severity: 'critical',
        })
      );
    });

    it('should require source URL', () => {
      const citation = 'Smith v. Company (E.D.N.Y., 2020)';
      const result = validateCitationFormat(citation);
      
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'missing-source',
          severity: 'critical',
        })
      );
    });

    it('should pass with complete citation', () => {
      const citation = 'Smith v. Company (E.D.N.Y., 2020) https://www.courtlistener.com/case/123';
      const result = validateCitationFormat(citation);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('verifyCitation', () => {
    it('should fail without source URL', () => {
      const citation = 'Smith v. Company (E.D.N.Y., 2020)';
      const result = verifyCitation(citation);
      
      expect(result.verified).toBe(false);
      expect(result.severity).toBe('critical');
      expect(result.recommendation).toContain('Do NOT publish');
    });

    it('should flag AI hallucination risk', () => {
      const citation = 'GPT said Smith v. Company (E.D.N.Y., 2020) settled for approximately $100,000';
      const result = verifyCitation(citation);
      
      expect(result.verified).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'hallucination-risk',
        })
      );
    });

    it('should pass with verified citation', () => {
      const citation = 'Gil v. Winn-Dixie (11th Cir., 2020) https://www.courtlistener.com/case/gil-v-winn-dixie';
      const result = verifyCitation(citation, 'https://www.courtlistener.com/case/gil-v-winn-dixie');
      
      expect(result.citation).not.toBeNull();
      expect(result.citation?.caseName).toContain('Gil');
    });
  });

  describe('verifyAllCitations', () => {
    it('should find and verify multiple citations', () => {
      const text = `
        According to Smith v. Company (E.D.N.Y., 2020), accessibility matters.
        Also see Doe v. Corporation (S.D.N.Y., 2019).
        Your site has violations similar to those in Gil v. Winn-Dixie (11th Cir., 2020).
      `;
      const result = verifyAllCitations(text);
      
      expect(result.citationsFound).toBe(3);
      expect(result.results.length).toBe(3);
    });

    it('should detect unverified citations', () => {
      const text = 'Smith v. Company (2020) settled for $100,000.';
      const result = verifyAllCitations(text);
      
      expect(result.citationsFound).toBeGreaterThan(0);
      expect(result.unverified).toBeGreaterThan(0);
    });
  });
});

describe('Integration Tests', () => {
  describe('Email Template Validation', () => {
    it('should validate a compliant cold prospect email', () => {
      const email = `
Hi John,

On November 1, 2025, we scanned example.com. Here's what we found in your public code:

FINDINGS (Technical)
- 47 WCAG 2.2 AA violations detected
- 12 critical (WCAG Level A failures)

COMPARABLE CASES (Public Data)
We reviewed federal litigation from PACER. Companies in your industry with similar profiles:
- Target (N.D. IL., 2018): Settled for $3.75M [Link to CourtListener]
- Winn-Dixie (11th Cir., 2020): Settled for $250K [Link to PACER]

WHAT THIS MEANS (No Prediction)
Your site has technical gaps that match patterns in public litigation. We're not predicting 
what happens next. But here's the public record of what's happened to others.

${STANDARD_DISCLAIMERS.email}
      `;
      
      const uplResult = validateCompleteUPLCompliance(email, 'cold-prospect-email');
      expect(uplResult.canSend).toBe(true);
    });

    it('should reject non-compliant email', () => {
      const email = `
Hi John,

Your website violates the ADA. You will be sued if you don't fix these issues immediately.
You must comply with federal law. You are liable for $50,000 in damages.

Call us to avoid legal action.
      `;
      
      const uplResult = validateCompleteUPLCompliance(email, 'aggressive-email');
      expect(uplResult.canSend).toBe(false);
      expect(uplResult.validation.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Report Validation', () => {
    it('should validate citation-heavy report', () => {
      const report = `
# Accessibility Compliance Report

## Comparable Cases

1. Gil v. Winn-Dixie (11th Cir., 2020) - https://www.courtlistener.com/case/gil
2. Target (N.D. IL., 2018) - https://pacer.gov/case/target

${STANDARD_DISCLAIMERS.report}
      `;
      
      const citationResult = verifyAllCitations(report);
      const uplResult = validateCompleteUPLCompliance(report, 'compliance-report');
      
      expect(citationResult.citationsFound).toBeGreaterThan(0);
      expect(uplResult.canSend).toBe(true);
    });
  });
});
