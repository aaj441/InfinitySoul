/**
 * Legal Claim Extractor
 *
 * Uses AI (Claude Sonnet 3.5) to extract structured claims from legal complaints.
 * Identifies WCAG violations, severity, and plaintiff theories.
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../../utils/logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export interface LegalClaim {
  number: number;
  allegation: string;
  wcagReference: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  plaintiffTheory: string;
  specificElements?: string[];
}

export interface ExtractedClaims {
  claims: LegalClaim[];
  parties: {
    plaintiff: string;
    defendant: string;
    court: string;
    caseNumber?: string;
  };
  demandAmount?: string;
  filingDate?: string;
  attorneys?: {
    plaintiffFirm: string;
    plaintiffAttorneys: string[];
  };
  summary: string;
}

/**
 * Extract structured claims from legal document text
 */
export async function extractClaims(legalText: string): Promise<ExtractedClaims> {
  try {
    logger.info('Extracting claims from legal document using Claude...');

    const prompt = buildExtractionPrompt(legalText);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: 0.3, // Low temperature for factual extraction
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON from Claude's response
    const extracted = parseClaudeResponse(responseText);

    logger.info(`Successfully extracted ${extracted.claims.length} claims`);

    return extracted;

  } catch (error) {
    logger.error('Claim extraction failed:', error);
    throw new Error(`Claim extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build extraction prompt for Claude
 */
function buildExtractionPrompt(legalText: string): string {
  return `You are a legal document analyst specializing in ADA accessibility litigation. Extract all claims and allegations from this legal complaint.

**Legal Document:**
${legalText}

**Instructions:**
1. Extract ALL specific accessibility violations alleged
2. Map each violation to its WCAG reference (if mentioned or implied)
3. Classify severity based on impact (critical/serious/moderate/minor)
4. Identify the plaintiff's legal theory for each claim
5. Extract party information (plaintiff, defendant, court)
6. Extract case details (case number, filing date, demand amount)
7. Provide a brief executive summary

**Output Format (JSON):**
\`\`\`json
{
  "claims": [
    {
      "number": 1,
      "allegation": "Specific allegation text from complaint",
      "wcagReference": "WCAG 2.1 Level AA 1.4.3" or "Not specified",
      "severity": "critical",
      "plaintiffTheory": "How plaintiff argues this violates ADA",
      "specificElements": ["image tags", "buttons", "forms"]
    }
  ],
  "parties": {
    "plaintiff": "Full plaintiff name",
    "defendant": "Full defendant name",
    "court": "Full court name",
    "caseNumber": "Case number if available"
  },
  "demandAmount": "$amount or 'Not specified'",
  "filingDate": "Date if available",
  "attorneys": {
    "plaintiffFirm": "Law firm name",
    "plaintiffAttorneys": ["Attorney names"]
  },
  "summary": "2-3 sentence executive summary of the complaint"
}
\`\`\`

**WCAG Reference Guidelines:**
- 1.1.1 = Missing alt text for images
- 1.4.3 = Color contrast violations
- 2.1.1 = Keyboard accessibility
- 4.1.2 = Form labels and ARIA attributes
- If not explicitly mentioned, infer from violation description

**Severity Guidelines:**
- Critical: Blocks core functionality (e.g., can't checkout, can't navigate)
- Serious: Significantly impairs access (e.g., no form labels, broken keyboard nav)
- Moderate: Accessibility barriers but workarounds exist
- Minor: Technical violations with minimal impact

Return ONLY the JSON object, no additional text.`;
}

/**
 * Parse Claude's JSON response
 */
function parseClaudeResponse(responseText: string): ExtractedClaims {
  try {
    // Extract JSON from response (Claude sometimes wraps in markdown)
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                      responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonText);

    // Validate structure
    if (!parsed.claims || !Array.isArray(parsed.claims)) {
      throw new Error('Invalid claims structure in response');
    }

    if (!parsed.parties) {
      throw new Error('Missing parties information in response');
    }

    return parsed as ExtractedClaims;

  } catch (error) {
    logger.error('Failed to parse Claude response:', error);

    // Return minimal structure on parse failure
    return {
      claims: [{
        number: 1,
        allegation: 'Failed to parse claims from document',
        wcagReference: 'Unknown',
        severity: 'moderate',
        plaintiffTheory: 'Parse error occurred'
      }],
      parties: {
        plaintiff: 'Unknown',
        defendant: 'Unknown',
        court: 'Unknown'
      },
      summary: 'Document parsing failed - manual review required'
    };
  }
}

/**
 * Classify claim severity from description
 */
export function classifySeverity(allegation: string, wcagReference: string): LegalClaim['severity'] {
  const allegationLower = allegation.toLowerCase();

  // Critical indicators
  if (allegationLower.match(/cannot|impossible|prevented|blocked|denied/)) {
    return 'critical';
  }

  // WCAG-based severity
  const criticalWCAG = ['2.1.1', '4.1.2', '1.3.1', '2.4.3'];
  const seriousWCAG = ['1.1.1', '1.4.3', '2.4.4', '3.3.2'];

  const wcagCode = wcagReference.match(/\d+\.\d+\.\d+/)?.[0];

  if (wcagCode && criticalWCAG.includes(wcagCode)) {
    return 'critical';
  }

  if (wcagCode && seriousWCAG.includes(wcagCode)) {
    return 'serious';
  }

  // Serious indicators
  if (allegationLower.match(/significantly|substantially|major|severe/)) {
    return 'serious';
  }

  // Moderate indicators
  if (allegationLower.match(/difficult|challenging|impairs|hinders/)) {
    return 'moderate';
  }

  return 'moderate'; // Default
}

/**
 * Extract plaintiff strategy analysis
 */
export function analyzeStrategy(claims: ExtractedClaims): {
  primaryFocus: string;
  claimCount: number;
  wcagLevels: string[];
  likelySettlementRange: string;
  recommendations: string[];
} {
  const wcagReferences = claims.claims
    .map(c => c.wcagReference)
    .filter(ref => ref !== 'Unknown' && ref !== 'Not specified');

  const criticalCount = claims.claims.filter(c => c.severity === 'critical').length;
  const seriousCount = claims.claims.filter(c => c.severity === 'serious').length;

  // Determine primary focus
  let primaryFocus = 'General accessibility barriers';
  const allegations = claims.claims.map(c => c.allegation.toLowerCase()).join(' ');

  if (allegations.includes('blind') || allegations.includes('screen reader')) {
    primaryFocus = 'Screen reader accessibility';
  } else if (allegations.includes('keyboard') || allegations.includes('navigate')) {
    primaryFocus = 'Keyboard navigation';
  } else if (allegations.includes('color') || allegations.includes('contrast')) {
    primaryFocus = 'Visual accessibility';
  }

  // Settlement range estimation
  let settlementRange = '$15,000 - $30,000';
  if (criticalCount >= 3) {
    settlementRange = '$40,000 - $75,000';
  } else if (claims.claims.length >= 10) {
    settlementRange = '$25,000 - $50,000';
  }

  // Recommendations
  const recommendations: string[] = [];

  if (criticalCount > 0) {
    recommendations.push('Prioritize critical violations for immediate remediation');
  }

  if (wcagReferences.length < claims.claims.length) {
    recommendations.push('Some claims lack specific WCAG references - request clarification');
  }

  if (claims.claims.length > 15) {
    recommendations.push('High claim count suggests thorough audit - consider comprehensive remediation');
  }

  recommendations.push('Engage accessibility attorney for response strategy');
  recommendations.push('Document all remediation efforts with timestamps');

  return {
    primaryFocus,
    claimCount: claims.claims.length,
    wcagLevels: [...new Set(wcagReferences)],
    likelySettlementRange: settlementRange,
    recommendations
  };
}

/**
 * Match claims to existing scan violations
 */
export async function matchClaimsToScans(
  claims: LegalClaim[],
  scanId?: string
): Promise<Array<{
  claim: LegalClaim;
  matchedViolations: any[];
  matchConfidence: number;
}>> {
  // This would integrate with the scanner database
  // For now, return mock data structure

  return claims.map(claim => ({
    claim,
    matchedViolations: [],
    matchConfidence: 0
  }));
}
