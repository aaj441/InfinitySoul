/**
 * AI Citation Verification
 * 
 * Critical safeguard to prevent AI hallucination of legal citations.
 * 
 * Risk: AI models (GPT, Claude) can hallucinate:
 * - Non-existent case numbers
 * - Fabricated settlement amounts
 * - Fictional legal precedents
 * - Misattributed quotes
 * 
 * Publishing false citations is fraud and destroys credibility.
 */

export interface CitationVerificationResult {
  verified: boolean;
  citation: VerifiedCitation | null;
  issues: CitationIssue[];
  severity: 'critical' | 'high' | 'medium' | 'pass';
  recommendation: string;
}

export interface VerifiedCitation {
  caseNumber: string;
  caseName: string;
  court: string;
  year: number;
  verifiedSource: string; // PACER URL, CourtListener URL, etc.
  settlementAmount?: number;
  settlementVerified: boolean;
  verifiedDate: Date;
  verifiedBy: 'human' | 'automated' | 'manual-lookup';
  confidence: 'high' | 'medium' | 'low';
}

export interface CitationIssue {
  type: 'hallucination-risk' | 'unverified' | 'incorrect-format' | 'missing-source' | 'conflicting-data';
  severity: 'critical' | 'high' | 'medium';
  description: string;
  evidence?: string;
}

/**
 * Detect if a citation might be AI-generated (hallucinated)
 * AI-generated citations often have telltale patterns
 */
export function detectAIHallucinationRisk(citation: string): {
  risk: 'high' | 'medium' | 'low';
  indicators: string[];
} {
  const indicators: string[] = [];
  
  // Red flags for AI hallucination
  const hallucinationPatterns = [
    { pattern: /\(generated\)/i, indicator: 'Contains word "generated"' },
    { pattern: /GPT|Claude|AI\s*(said|told|mentioned)/i, indicator: 'References AI system' },
    { pattern: /circa|approximately|around\s+\$[\d,]+/i, indicator: 'Vague settlement amounts (AI hedge)' },
    { pattern: /[A-Z]\.\s*[A-Z]\.\s*Doe\s+v\.\s+XYZ\s+Corp/i, indicator: 'Generic placeholder names' },
    { pattern: /case\s+number:\s*12-cv-\d{4,5}-[A-Z]{3}/i, indicator: 'Case number format too generic' },
  ];
  
  for (const { pattern, indicator } of hallucinationPatterns) {
    if (pattern.test(citation)) {
      indicators.push(indicator);
    }
  }
  
  // Check for unrealistic case characteristics
  const currentYear = new Date().getFullYear();
  const yearMatch = citation.match(/\((\d{4})\)/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year > currentYear) {
      indicators.push(`Future year (${year}) - likely hallucinated`);
    }
    if (year < 1990 && (citation.includes('website') || citation.includes('ADA Title III'))) {
      indicators.push('Pre-1990 website accessibility case - anachronistic');
    }
  }
  
  // Extremely round settlement numbers are suspicious
  const settlementMatch = citation.match(/\$(\d[\d,]*)/);
  if (settlementMatch) {
    const amount = parseInt(settlementMatch[1].replace(/,/g, ''));
    if (amount % 1000000 === 0 && amount > 1000000) {
      indicators.push(`Suspiciously round settlement ($${amount.toLocaleString()}) - may be fabricated`);
    }
  }
  
  // Determine risk level
  let risk: 'high' | 'medium' | 'low' = 'low';
  if (indicators.length >= 3) {
    risk = 'high';
  } else if (indicators.length >= 1) {
    risk = 'medium';
  }
  
  return { risk, indicators };
}

/**
 * Extract case information from citation string
 */
export function parseCitation(citation: string): {
  caseNumber?: string;
  caseName?: string;
  court?: string;
  year?: number;
  settlementAmount?: number;
} {
  const result: ReturnType<typeof parseCitation> = {};
  
  // Extract case number (e.g., "1:20-cv-01234")
  const caseNumberMatch = citation.match(/(\d+:\d+-cv-\d+)|(\d+-cv-\d+)/i);
  if (caseNumberMatch) {
    result.caseNumber = caseNumberMatch[0];
  }
  
  // Extract case name (e.g., "Smith v. Company")
  const caseNameMatch = citation.match(/([A-Z][a-z]+)\s+v\.\s+([A-Za-z\s&,.']+)/);
  if (caseNameMatch) {
    result.caseName = caseNameMatch[0];
  }
  
  // Extract court (e.g., "E.D.N.Y.", "9th Cir.")
  const courtMatch = citation.match(/([EWSCDN]\.[DS]\.[A-Z]{2,4}\.)|(\d+(st|nd|rd|th)\s+Cir\.)/);
  if (courtMatch) {
    result.court = courtMatch[0];
  }
  
  // Extract year
  const yearMatch = citation.match(/\((\d{4})\)/);
  if (yearMatch) {
    result.year = parseInt(yearMatch[1]);
  }
  
  // Extract settlement amount
  const settlementMatch = citation.match(/settled for|settlement of\s+\$(\d[\d,]*)/i);
  if (settlementMatch) {
    result.settlementAmount = parseInt(settlementMatch[1].replace(/,/g, ''));
  }
  
  return result;
}

/**
 * Validate citation format and completeness
 */
export function validateCitationFormat(citation: string): {
  valid: boolean;
  issues: CitationIssue[];
} {
  const issues: CitationIssue[] = [];
  const parsed = parseCitation(citation);
  
  // Check for minimum required elements
  if (!parsed.caseName && !parsed.caseNumber) {
    issues.push({
      type: 'incorrect-format',
      severity: 'critical',
      description: 'Citation missing case name or case number. Cannot verify.',
    });
  }
  
  if (!parsed.court) {
    issues.push({
      type: 'incorrect-format',
      severity: 'high',
      description: 'Citation missing court information. Court designation required for verification.',
    });
  }
  
  if (!parsed.year) {
    issues.push({
      type: 'incorrect-format',
      severity: 'high',
      description: 'Citation missing year. Year required for verification.',
    });
  }
  
  // Check for source citation
  const hasSourceUrl = /https?:\/\//i.test(citation) || /PACER|CourtListener|RECAP/i.test(citation);
  if (!hasSourceUrl) {
    issues.push({
      type: 'missing-source',
      severity: 'critical',
      description: 'Citation missing source URL. All citations must link to public records (PACER, CourtListener, etc.)',
    });
  }
  
  return {
    valid: issues.filter(i => i.severity === 'critical').length === 0,
    issues,
  };
}

/**
 * Main citation verification function
 * This should be called before publishing any citation
 */
export function verifyCitation(citation: string, sourceUrl?: string): CitationVerificationResult {
  const issues: CitationIssue[] = [];
  let severity: 'critical' | 'high' | 'medium' | 'pass' = 'pass';
  
  // Step 1: Check for AI hallucination risk
  const hallucinationCheck = detectAIHallucinationRisk(citation);
  if (hallucinationCheck.risk === 'high') {
    issues.push({
      type: 'hallucination-risk',
      severity: 'critical',
      description: `HIGH risk of AI hallucination. Indicators: ${hallucinationCheck.indicators.join('; ')}`,
      evidence: citation,
    });
    severity = 'critical';
  } else if (hallucinationCheck.risk === 'medium') {
    issues.push({
      type: 'hallucination-risk',
      severity: 'high',
      description: `MEDIUM risk of AI hallucination. Indicators: ${hallucinationCheck.indicators.join('; ')}`,
      evidence: citation,
    });
    if (severity === 'pass') severity = 'high';
  }
  
  // Step 2: Validate format
  const formatCheck = validateCitationFormat(citation);
  issues.push(...formatCheck.issues);
  
  if (!formatCheck.valid) {
    severity = 'critical';
  }
  
  // Step 3: Check if source URL provided
  if (!sourceUrl) {
    issues.push({
      type: 'missing-source',
      severity: 'critical',
      description: 'No source URL provided. Citations must be verifiable against public records.',
    });
    severity = 'critical';
  }
  
  // Generate recommendation
  let recommendation = '';
  if (severity === 'critical') {
    recommendation = 'CRITICAL: Do NOT publish this citation. It must be manually verified against PACER or CourtListener before use. AI-generated citations cannot be trusted without verification.';
  } else if (severity === 'high') {
    recommendation = 'HIGH: This citation requires manual verification before publication. Check against public court records.';
  } else if (severity === 'medium') {
    recommendation = 'MEDIUM: This citation appears valid but should be spot-checked against public records.';
  } else {
    recommendation = 'PASS: Citation format valid. Still recommend periodic verification of all published citations.';
  }
  
  // Parse citation for return
  const parsed = parseCitation(citation);
  const verifiedCitation: VerifiedCitation | null = formatCheck.valid ? {
    caseNumber: parsed.caseNumber || 'unknown',
    caseName: parsed.caseName || 'unknown',
    court: parsed.court || 'unknown',
    year: parsed.year || 0,
    verifiedSource: sourceUrl || 'UNVERIFIED',
    settlementAmount: parsed.settlementAmount,
    settlementVerified: false, // Must be manually verified
    verifiedDate: new Date(),
    verifiedBy: 'automated', // Automated check only, not full verification
    confidence: severity === 'pass' ? 'medium' : 'low',
  } : null;
  
  return {
    verified: severity === 'pass',
    citation: verifiedCitation,
    issues,
    severity,
    recommendation,
  };
}

/**
 * Batch verify multiple citations
 * Use this to validate entire reports or emails
 */
export function verifyAllCitations(text: string): {
  citationsFound: number;
  verified: number;
  unverified: number;
  critical: number;
  results: Array<{ citation: string; result: CitationVerificationResult }>;
} {
  // Extract potential citations (case name patterns)
  const citationPattern = /[A-Z][a-z]+\s+v\.\s+[A-Za-z\s&,.']+(?:\([^\)]+\))?/g;
  const matches = text.match(citationPattern) || [];
  
  const results = matches.map(citation => ({
    citation,
    result: verifyCitation(citation),
  }));
  
  const verified = results.filter(r => r.result.verified).length;
  const critical = results.filter(r => r.result.severity === 'critical').length;
  
  return {
    citationsFound: matches.length,
    verified,
    unverified: matches.length - verified,
    critical,
    results,
  };
}

/**
 * AI System Prompt to prevent hallucination
 * Include this in all AI system prompts
 */
export const AI_ANTI_HALLUCINATION_PROMPT = `
CRITICAL RULE - LEGAL CITATIONS:

You must NEVER generate case citations, settlement amounts, or legal precedents.

If asked for legal information:
1. Respond: "I cannot generate legal citations. All case information must be verified against PACER or CourtListener by a human."
2. Do NOT invent case numbers, case names, or settlement amounts
3. Do NOT say "circa", "approximately", or hedge on specific amounts
4. Do NOT create placeholder examples like "Smith v. Company"

If you need to reference a case:
1. Use only pre-verified citations from the verified citation database
2. Include the source URL (PACER/CourtListener) in your response
3. Mark any unverified information as [REQUIRES VERIFICATION]

REMEMBER: Citing a non-existent case is fraud. When in doubt, say "I cannot provide this information - it requires human verification."
`;

/**
 * Example verified citations database structure
 * In production, this would be a proper database
 */
export interface VerifiedCitationDatabase {
  citations: VerifiedCitation[];
  lastUpdated: Date;
  source: 'PACER' | 'CourtListener' | 'Manual-Entry';
}

export default {
  verifyCitation,
  verifyAllCitations,
  detectAIHallucinationRisk,
  validateCitationFormat,
  parseCitation,
  AI_ANTI_HALLUCINATION_PROMPT,
};
