/**
 * Phase III — Multi-Engine Consensus Accessibility Scanner
 * Combines results from axe-core, Pa11y, WAVE, and Lighthouse
 * Consensus-based violations = near-zero false positives
 */

export interface AccessibilityViolation {
  id: string;
  ruleId: string;
  description: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  elements: string[];
  wcagCriteria?: string;
}

export interface EngineResults {
  engine: 'axe' | 'pa11y' | 'wave' | 'lighthouse';
  status: 'success' | 'failed';
  violations: AccessibilityViolation[];
  executionTime: number; // milliseconds
  confidence: number; // 0-1.0
  error?: string;
}

export interface ConsensusViolation {
  id: string;
  ruleId: string;
  description: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  engines: string[]; // Which engines detected this
  engineCount: number; // Number of engines that agreed
  consensus: 'strong' | 'moderate' | 'weak'; // Agreement level
  confidence: number; // 0-1.0
  affectedElements: string[];
  wcagCriteria?: string;
}

export interface ConsensusResult {
  url: string;
  scanDate: Date;
  engines: EngineResults[];
  consensusViolations: ConsensusViolation[];
  statistics: {
    criticalCount: number;
    seriousCount: number;
    moderateCount: number;
    minorCount: number;
    totalCount: number;
    avgConfidence: number;
    allEnginesSuccessful: boolean;
    executionTimeMs: number;
  };
}

/**
 * WCAG rule mapping for consensus
 * Maps different engine rule IDs to a standard ID
 */
const WCAG_RULE_MAPPING: Record<string, { standard: string; wcag: string }> =
  {
    // Images
    'image-alt': { standard: 'alt-text', wcag: '1.1.1' },
    'alt-text': { standard: 'alt-text', wcag: '1.1.1' },
    'images-with-no-alt-text': {
      standard: 'alt-text',
      wcag: '1.1.1',
    },

    // Headings
    'page-has-heading-one': {
      standard: 'heading-structure',
      wcag: '1.3.1',
    },
    'heading-order': { standard: 'heading-structure', wcag: '1.3.1' },
    'headings-not-in-order': {
      standard: 'heading-structure',
      wcag: '1.3.1',
    },

    // Form labels
    'label': { standard: 'form-labels', wcag: '1.3.1' },
    'form-field-multiple-labels': {
      standard: 'form-labels',
      wcag: '1.3.1',
    },
    'label-title-only': { standard: 'form-labels', wcag: '1.3.1' },

    // Button names
    'button-name': { standard: 'button-name', wcag: '4.1.2' },
    'missing-button-name': { standard: 'button-name', wcag: '4.1.2' },

    // Color contrast
    'color-contrast': { standard: 'color-contrast', wcag: '1.4.3' },
    'insufficient-color-contrast': {
      standard: 'color-contrast',
      wcag: '1.4.3',
    },

    // Links
    'link-name': { standard: 'link-purpose', wcag: '4.1.2' },
    'anchor-has-content': { standard: 'link-purpose', wcag: '4.1.2' },

    // Keyboard navigation
    'keyboard-trap': { standard: 'keyboard-trap', wcag: '2.1.2' },
    'no-keyboard-trap': { standard: 'keyboard-trap', wcag: '2.1.2' },
  };

/**
 * Normalize violation severity across engines
 */
function normalizeSeverity(
  severity: string
): 'critical' | 'serious' | 'moderate' | 'minor' {
  const normalized = severity.toLowerCase();

  if (
    normalized === 'critical' ||
    normalized === 'error' ||
    normalized === 'fail'
  ) {
    return 'critical';
  }
  if (normalized === 'serious' || normalized === 'warn' || normalized === 'warning') {
    return 'serious';
  }
  if (normalized === 'moderate' || normalized === 'notice') {
    return 'moderate';
  }

  return 'minor';
}

/**
 * Normalize rule IDs to standard format
 */
function normalizeRuleId(
  ruleId: string,
  engine: string
): { standard: string; wcag: string } {
  // Try direct mapping
  if (WCAG_RULE_MAPPING[ruleId]) {
    return WCAG_RULE_MAPPING[ruleId];
  }

  // Try lowercase
  const lowerRule = ruleId.toLowerCase();
  if (WCAG_RULE_MAPPING[lowerRule]) {
    return WCAG_RULE_MAPPING[lowerRule];
  }

  // Default unknown rules
  return {
    standard: ruleId,
    wcag: 'unknown',
  };
}

/**
 * Build consensus from multiple engine results
 */
export function buildConsensus(engineResults: EngineResults[]): ConsensusResult {
  const startTime = Date.now();

  // Group violations by normalized rule ID
  const violationMap: Record<string, ConsensusViolation> = {};

  for (const result of engineResults) {
    if (result.status !== 'success') {
      continue; // Skip failed engines
    }

    for (const violation of result.violations) {
      const normalized = normalizeRuleId(violation.ruleId, result.engine);
      const key = normalized.standard;

      if (!violationMap[key]) {
        violationMap[key] = {
          id: violation.id || key,
          ruleId: violation.ruleId,
          description: violation.description,
          severity: normalizeSeverity(violation.severity),
          engines: [result.engine],
          engineCount: 1,
          consensus: 'weak',
          confidence: result.confidence || 0.7,
          affectedElements: violation.elements || [],
          wcagCriteria: normalized.wcag,
        };
      } else {
        // Violation already seen, update consensus
        violationMap[key].engines.push(result.engine);
        violationMap[key].engineCount += 1;
        violationMap[key].affectedElements = [
          ...new Set([
            ...violationMap[key].affectedElements,
            ...(violation.elements || []),
          ]),
        ];
        // Average confidence across engines
        violationMap[key].confidence = (violationMap[key].confidence + (result.confidence || 0.7)) / 2;
      }
    }
  }

  // Determine consensus strength
  const consensusViolations = Object.values(violationMap).map((v) => {
    if (v.engineCount >= 3) {
      v.consensus = 'strong';
    } else if (v.engineCount >= 2) {
      v.consensus = 'moderate';
    }
    return v;
  });

  // Calculate statistics
  const statistics = {
    criticalCount: consensusViolations.filter(
      (v) => v.consensus !== 'weak' && v.severity === 'critical'
    ).length,
    seriousCount: consensusViolations.filter(
      (v) => v.consensus !== 'weak' && v.severity === 'serious'
    ).length,
    moderateCount: consensusViolations.filter(
      (v) => v.consensus !== 'weak' && v.severity === 'moderate'
    ).length,
    minorCount: consensusViolations.filter(
      (v) => v.consensus === 'weak' || v.severity === 'minor'
    ).length,
    totalCount: consensusViolations.filter((v) => v.consensus !== 'weak').length,
    avgConfidence:
      consensusViolations.length > 0
        ? consensusViolations.reduce((sum, v) => sum + v.confidence, 0) /
          consensusViolations.length
        : 0,
    allEnginesSuccessful: engineResults.every((r) => r.status === 'success'),
    executionTimeMs: Date.now() - startTime,
  };

  return {
    url: engineResults[0]?.violations?.[0]?.id || 'unknown',
    scanDate: new Date(),
    engines: engineResults,
    consensusViolations,
    statistics,
  };
}

/**
 * Classify violations by consensus confidence
 * Only violations with 2+ engines are considered "critical" findings
 */
export function classifyViolations(
  consensus: ConsensusResult
): {
  critical: ConsensusViolation[];
  major: ConsensusViolation[];
  minor: ConsensusViolation[];
} {
  return {
    // Critical = multiple engines agree + severe impact
    critical: consensus.consensusViolations.filter(
      (v) => v.engineCount >= 2 && v.severity === 'critical'
    ),

    // Major = moderate or strong consensus, serious or worse
    major: consensus.consensusViolations.filter(
      (v) =>
        v.consensus !== 'weak' &&
        (v.severity === 'serious' || v.severity === 'moderate')
    ),

    // Minor = weak consensus or low severity
    minor: consensus.consensusViolations.filter(
      (v) => v.consensus === 'weak' || v.severity === 'minor'
    ),
  };
}

/**
 * Simulate multi-engine scan (for development/testing)
 * In production, this would orchestrate real scanning engines
 */
export async function runConsensusScan(
  url: string,
  engines: ('axe' | 'pa11y' | 'wave' | 'lighthouse')[] = [
    'axe',
    'pa11y',
    'wave',
    'lighthouse',
  ]
): Promise<ConsensusResult> {
  // In production, this would:
  // 1. Spin up Playwright browser
  // 2. Load each engine (axe-core, pa11y, WAVE API, Lighthouse)
  // 3. Run all engines in parallel
  // 4. Collect results
  // 5. Build consensus

  // For now, return mock data structure
  const mockResults: EngineResults[] = engines.map((engine) => ({
    engine: engine,
    status: 'success',
    violations: [
      {
        id: `${engine}-1`,
        ruleId: 'color-contrast',
        description: 'Insufficient color contrast',
        severity: 'serious',
        elements: ['button.primary', '.form-label'],
      },
      {
        id: `${engine}-2`,
        ruleId: 'alt-text',
        description: 'Missing alt text',
        severity: 'critical',
        elements: ['img.logo'],
      },
    ],
    executionTime: Math.random() * 2000 + 1000,
    confidence: 0.85 + Math.random() * 0.15,
  }));

  return buildConsensus(mockResults);
}

export default {
  buildConsensus,
  classifyViolations,
  runConsensusScan,
};
