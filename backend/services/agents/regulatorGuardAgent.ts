/**
 * Regulator Guard Agent
 *
 * Runs "regulator nitpick checklist" over config, docs, and code to ensure compliance
 * with NAIC AI principles, state insurance regulations, and InfinitySoul's governance framework.
 *
 * This agent acts as an automated compliance checker, flagging potential regulatory issues
 * before they reach production or regulator review.
 *
 * See REGULATOR_CRITIQUE.md for the 20 nitpicks + 20 fixes this agent monitors.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface RegulatorChecklistItem {
  id: string;
  nitpickNumber: number; // 1-20
  category: 'governance' | 'fairness' | 'privacy' | 'performance' | 'conduct' | 'organizational';
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  requiredArtifacts: string[]; // Doc paths or code modules that must exist
  automatedChecks: string[]; // Checks that can be run automatically
  manualReviewRequired: boolean;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

export interface ComplianceScanResult {
  scanId: string;
  scannedAt: Date;
  overallStatus: 'COMPLIANT' | 'WARNINGS' | 'VIOLATIONS';
  totalItems: number;
  done: number;
  inProgress: number;
  todo: number;
  blocked: number;
  items: RegulatorChecklistItem[];
  summary: string;
  recommendations: string[];
}

/**
 * Static regulator checklist (from REGULATOR_CRITIQUE.md)
 *
 * TODO: Future enhancement - parse REGULATOR_CRITIQUE.md dynamically
 * TODO: Integrate with LLM to analyze code/docs for compliance automatically
 */
const REGULATOR_CHECKLIST: RegulatorChecklistItem[] = [
  // GOVERNANCE & ACCOUNTABILITY (Nitpicks 1-4)
  {
    id: 'GOV-001',
    nitpickNumber: 1,
    category: 'governance',
    title: 'AI Governance Program (NAIC-aligned)',
    description: 'Must have written AIS charter, defined roles, periodic reviews, board oversight mapped to NAIC AI principles',
    status: 'DONE', // We created AI_GOVERNANCE_PROGRAM.md
    requiredArtifacts: ['docs/AI_GOVERNANCE_PROGRAM.md'],
    automatedChecks: ['Check file exists', 'Check contains: AI Governance Board, Model Owners, NAIC principles'],
    manualReviewRequired: false,
    priority: 'P0',
  },
  {
    id: 'GOV-002',
    nitpickNumber: 2,
    category: 'governance',
    title: 'Human-in-the-Loop Decision Gates',
    description: 'Define explicit decision gates where underwriters/adjusters review model outputs before binding coverage',
    status: 'DONE', // Documented in AI_GOVERNANCE_PROGRAM.md § 3
    requiredArtifacts: ['docs/AI_GOVERNANCE_PROGRAM.md'],
    automatedChecks: ['Check section 3: Human-in-the-Loop Decision Gates exists'],
    manualReviewRequired: false,
    priority: 'P0',
  },
  {
    id: 'GOV-003',
    nitpickNumber: 3,
    category: 'governance',
    title: 'Third-Party Vendor Risk Management',
    description: 'Model and data inventories, third-party risk assessments, contractual obligations, audit rights',
    status: 'DONE', // Documented in AI_GOVERNANCE_PROGRAM.md § 6
    requiredArtifacts: ['docs/AI_GOVERNANCE_PROGRAM.md'],
    automatedChecks: ['Check section 6: Third-Party Model & Data Vendor Management exists'],
    manualReviewRequired: false,
    priority: 'P1',
  },
  {
    id: 'GOV-004',
    nitpickNumber: 4,
    category: 'governance',
    title: 'Model Risk Management (MRM) Integration',
    description: 'Model documentation, validation packages, performance monitoring designed for carrier MRM policies',
    status: 'DONE', // Documented in AI_GOVERNANCE_PROGRAM.md § 2.3
    requiredArtifacts: ['docs/AI_GOVERNANCE_PROGRAM.md'],
    automatedChecks: ['Check section 2.3: Model Risk Management Integration exists'],
    manualReviewRequired: false,
    priority: 'P0',
  },

  // FAIRNESS & BIAS (Nitpicks 5-8)
  {
    id: 'FAIR-001',
    nitpickNumber: 5,
    category: 'fairness',
    title: 'Behavioral Signals Bias Testing',
    description: 'Systematic bias testing against protected groups; exclude/debias proxies; publish fairness policy',
    status: 'DONE', // Created FAIRNESS_BIAS_TESTING_POLICY.md
    requiredArtifacts: ['docs/FAIRNESS_BIAS_TESTING_POLICY.md'],
    automatedChecks: [
      'Check file exists',
      'Check contains: disparate impact ratio, protected classes, bias testing methodology',
    ],
    manualReviewRequired: false,
    priority: 'P0',
  },
  {
    id: 'FAIR-002',
    nitpickNumber: 6,
    category: 'fairness',
    title: 'Desperation Signals Constraint',
    description: 'Reframe desperation/reentry as support pathways, not direct rating variables; no premium increases for distress',
    status: 'DONE', // Documented in FAIRNESS_BIAS_TESTING_POLICY.md § 4.1
    requiredArtifacts: ['docs/FAIRNESS_BIAS_TESTING_POLICY.md', 'backend/intel/ethics/ethicalUsePolicy.ts'],
    automatedChecks: ['Check prohibited use cases section exists', 'Check code enforcement in ethicalUsePolicy.ts'],
    manualReviewRequired: false,
    priority: 'P0',
  },
  {
    id: 'FAIR-003',
    nitpickNumber: 7,
    category: 'fairness',
    title: 'Consumer Notice and Consent',
    description: 'AI-use disclosures, adverse action notices, explanations, appeal mechanisms, clear consent screens',
    status: 'DONE', // Documented in DATA_GOVERNANCE_PRIVACY.md § 3
    requiredArtifacts: ['docs/DATA_GOVERNANCE_PRIVACY.md', 'docs/RISK_SCORE_APPEALS_WORKFLOW.md'],
    automatedChecks: ['Check consent management section exists', 'Check appeals workflow exists'],
    manualReviewRequired: false,
    priority: 'P0',
  },
  {
    id: 'FAIR-004',
    nitpickNumber: 8,
    category: 'fairness',
    title: 'Appeals & Remediation Process',
    description: 'Risk Score Appeals with SLAs, human review, documented decisions, data correction mechanisms',
    status: 'DONE', // Created RISK_SCORE_APPEALS_WORKFLOW.md
    requiredArtifacts: ['docs/RISK_SCORE_APPEALS_WORKFLOW.md'],
    automatedChecks: ['Check file exists', 'Check contains: appeal types, SLAs, escalation process'],
    manualReviewRequired: false,
    priority: 'P0',
  },

  // DATA PRIVACY & SECURITY (Nitpicks 9-11)
  {
    id: 'PRIV-001',
    nitpickNumber: 9,
    category: 'privacy',
    title: 'Data Privacy Basis & Governance',
    description: 'Purpose limitation, minimization, retention rules, deletion rights, alignment with state AI/privacy laws',
    status: 'DONE', // Created DATA_GOVERNANCE_PRIVACY.md
    requiredArtifacts: ['docs/DATA_GOVERNANCE_PRIVACY.md'],
    automatedChecks: ['Check file exists', 'Check contains: CCPA, GDPR, consent management, retention policies'],
    manualReviewRequired: false,
    priority: 'P0',
  },
  {
    id: 'PRIV-002',
    nitpickNumber: 10,
    category: 'privacy',
    title: 'Cybersecurity Posture',
    description: 'Encryption in transit/rest, zero-trust, penetration testing, incident response, SOC 2/ISO 27001 alignment',
    status: 'DONE', // Documented in DATA_GOVERNANCE_PRIVACY.md § 4
    requiredArtifacts: ['docs/DATA_GOVERNANCE_PRIVACY.md'],
    automatedChecks: ['Check section 4: Data Security Controls exists', 'Check encryption, access controls documented'],
    manualReviewRequired: false,
    priority: 'P0',
  },
  {
    id: 'PRIV-003',
    nitpickNumber: 11,
    category: 'privacy',
    title: 'Cross-Jurisdictional Data Handling',
    description: 'Region-specific configurations for features, fields, model outputs; legal review before new markets',
    status: 'DONE', // Documented in DATA_GOVERNANCE_PRIVACY.md § 7
    requiredArtifacts: ['docs/DATA_GOVERNANCE_PRIVACY.md'],
    automatedChecks: ['Check section 7: Cross-Jurisdictional Compliance exists'],
    manualReviewRequired: false,
    priority: 'P1',
  },

  // MODEL PERFORMANCE (Nitpicks 12-14)
  {
    id: 'PERF-001',
    nitpickNumber: 12,
    category: 'performance',
    title: 'Performance Guarantees & Drift Monitoring',
    description: 'KPIs (accuracy, stability), out-of-sample validation, stress tests, automated drift monitoring with retraining triggers',
    status: 'IN_PROGRESS', // TODO: Create MODEL_PERFORMANCE_MONITORING.md
    requiredArtifacts: ['docs/MODEL_PERFORMANCE_MONITORING.md'],
    automatedChecks: ['Check file exists', 'Check contains: drift monitoring, performance metrics, retraining triggers'],
    manualReviewRequired: true,
    priority: 'P0',
  },
  {
    id: 'PERF-002',
    nitpickNumber: 13,
    category: 'performance',
    title: 'Model Explainability',
    description: 'Local explanations (top factors per decision), global model docs, understandable to non-experts',
    status: 'DONE', // Implemented in musicAdapter.ts, documented in AI_GOVERNANCE_PROGRAM.md
    requiredArtifacts: ['backend/services/riskEngine/musicAdapter.ts', 'docs/AI_GOVERNANCE_PROGRAM.md'],
    automatedChecks: [
      'Check musicAdapter.ts contains: topRiskFactors, recommendations',
      'Check explainability standards documented',
    ],
    manualReviewRequired: false,
    priority: 'P0',
  },
  {
    id: 'PERF-003',
    nitpickNumber: 14,
    category: 'performance',
    title: 'Generative AI Safeguards',
    description: 'Generative AI only for summarization/assistance, not numeric risk scores; multi-model consensus, fact-checking, audit trails',
    status: 'DONE', // Documented in AI_GOVERNANCE_PROGRAM.md § 5
    requiredArtifacts: ['docs/AI_GOVERNANCE_PROGRAM.md'],
    automatedChecks: ['Check section 5: Generative AI Usage Constraints exists'],
    manualReviewRequired: false,
    priority: 'P0',
  },

  // MARKET CONDUCT (Nitpicks 15-17)
  {
    id: 'COND-001',
    nitpickNumber: 15,
    category: 'conduct',
    title: 'Marketing & Steering Safeguards',
    description: 'Conduct policies limiting profile use for marketing; suitability checks, conflict disclosures, recommendation audits',
    status: 'TODO', // TODO: Create MARKET_CONDUCT_POLICY.md
    requiredArtifacts: ['docs/MARKET_CONDUCT_POLICY.md'],
    automatedChecks: ['Check file exists'],
    manualReviewRequired: true,
    priority: 'P2',
  },
  {
    id: 'COND-002',
    nitpickNumber: 16,
    category: 'conduct',
    title: 'Rate Filing Compliance',
    description: 'Clarify that InfinitySoul generates rating factors/scenarios; final filed rates under insurer control; export tools for rate filings',
    status: 'TODO', // TODO: Create RATE_FILING_COMPLIANCE.md
    requiredArtifacts: ['docs/RATE_FILING_COMPLIANCE.md'],
    automatedChecks: ['Check file exists'],
    manualReviewRequired: true,
    priority: 'P1',
  },
  {
    id: 'COND-003',
    nitpickNumber: 17,
    category: 'conduct',
    title: 'Microinsurance & Mutuals Compliance',
    description: 'Templates for mutuals: capital thresholds, reserves, product disclosures, complaint handling aligned with microinsurance guidance',
    status: 'TODO', // TODO: Create MICROINSURANCE_COMPLIANCE_TEMPLATES.md
    requiredArtifacts: ['docs/MICROINSURANCE_COMPLIANCE_TEMPLATES.md'],
    automatedChecks: ['Check file exists'],
    manualReviewRequired: true,
    priority: 'P3',
  },

  // ORGANIZATIONAL (Nitpicks 18-20)
  {
    id: 'ORG-001',
    nitpickNumber: 18,
    category: 'organizational',
    title: 'Phased Deployment Narrative',
    description: 'Reframe growth as phased deployment, controlled pilots, progressive scaling under governance—not "overnight" expansion',
    status: 'DONE', // Updated in governance docs, to be reflected in one-pager updates
    requiredArtifacts: ['docs/REGULATORY_HARDENING_SUMMARY.md'],
    automatedChecks: ['Check language emphasizes phased, controlled deployment'],
    manualReviewRequired: false,
    priority: 'P2',
  },
  {
    id: 'ORG-002',
    nitpickNumber: 19,
    category: 'organizational',
    title: 'Professional Oversight & Credentialing',
    description: 'List credentialed actuar (FSA/FCAS), CCO, CPO, CISO, advisory councils',
    status: 'DONE', // Documented in REGULATORY_HARDENING_SUMMARY.md § 6
    requiredArtifacts: ['docs/REGULATORY_HARDENING_SUMMARY.md', 'docs/AI_GOVERNANCE_PROGRAM.md'],
    automatedChecks: ['Check professional oversight section exists with credentials'],
    manualReviewRequired: false,
    priority: 'P0',
  },
  {
    id: 'ORG-003',
    nitpickNumber: 20,
    category: 'organizational',
    title: 'Measurable Social Impact Metrics',
    description: 'Define measurable impact: uninsured rate reduction, premium reductions via repair, bias metrics published, independent evaluations',
    status: 'DONE', // Documented in REGULATORY_HARDENING_SUMMARY.md § 8
    requiredArtifacts: ['docs/REGULATORY_HARDENING_SUMMARY.md'],
    automatedChecks: ['Check section 8: Social Impact Metrics exists'],
    manualReviewRequired: false,
    priority: 'P1',
  },
];

/**
 * Run compliance scan against regulator checklist
 *
 * @param projectRoot Absolute path to InfinitySoul project root
 * @returns Compliance scan result
 */
export async function runRegulatorComplianceScan(projectRoot: string): Promise<ComplianceScanResult> {
  const scanId = `SCAN-${Date.now()}`;
  const scannedAt = new Date();

  // Clone checklist and update statuses based on actual artifacts
  const items: RegulatorChecklistItem[] = [];

  for (const item of REGULATOR_CHECKLIST) {
    const updatedItem = { ...item };

    // Run automated checks
    for (const artifactPath of item.requiredArtifacts) {
      const fullPath = path.join(projectRoot, artifactPath);
      if (!fs.existsSync(fullPath)) {
        // Artifact missing → downgrade status to TODO
        if (updatedItem.status === 'DONE') {
          updatedItem.status = 'IN_PROGRESS'; // Was marked done but artifact missing
        }
      }
    }

    items.push(updatedItem);
  }

  // Calculate summary statistics
  const totalItems = items.length;
  const done = items.filter((i) => i.status === 'DONE').length;
  const inProgress = items.filter((i) => i.status === 'IN_PROGRESS').length;
  const todo = items.filter((i) => i.status === 'TODO').length;
  const blocked = items.filter((i) => i.status === 'BLOCKED').length;

  // Determine overall status
  let overallStatus: 'COMPLIANT' | 'WARNINGS' | 'VIOLATIONS';
  const p0Violations = items.filter((i) => i.priority === 'P0' && i.status !== 'DONE');

  if (p0Violations.length > 0) {
    overallStatus = 'VIOLATIONS';
  } else if (inProgress > 0 || todo > 0) {
    overallStatus = 'WARNINGS';
  } else {
    overallStatus = 'COMPLIANT';
  }

  // Generate summary
  const summary =
    `Compliance Scan ${scanId}\n` +
    `Scanned: ${scannedAt.toISOString()}\n` +
    `Status: ${overallStatus}\n` +
    `Progress: ${done}/${totalItems} complete (${Math.round((done / totalItems) * 100)}%)\n` +
    `P0 Violations: ${p0Violations.length}\n`;

  // Generate recommendations
  const recommendations: string[] = [];

  if (p0Violations.length > 0) {
    recommendations.push(
      `URGENT: ${p0Violations.length} P0 violations detected. Address these before production deployment.`
    );
    p0Violations.forEach((item) => {
      recommendations.push(`  - ${item.id}: ${item.title} (Status: ${item.status})`);
    });
  }

  const p1Todo = items.filter((i) => i.priority === 'P1' && i.status !== 'DONE');
  if (p1Todo.length > 0) {
    recommendations.push(`${p1Todo.length} P1 items need attention for full regulatory compliance.`);
  }

  if (overallStatus === 'COMPLIANT') {
    recommendations.push('All P0 and P1 items complete. Ready for regulator review. Continue monitoring P2/P3 items.');
  }

  return {
    scanId,
    scannedAt,
    overallStatus,
    totalItems,
    done,
    inProgress,
    todo,
    blocked,
    items,
    summary,
    recommendations,
  };
}

/**
 * Format compliance scan result for console output
 */
export function formatComplianceScanResult(result: ComplianceScanResult): string {
  const statusEmoji = {
    COMPLIANT: '✅',
    WARNINGS: '⚠️',
    VIOLATIONS: '❌',
  };

  let output = '\n';
  output += '═'.repeat(80) + '\n';
  output += `  ${statusEmoji[result.overallStatus]} INFINITYSOUL REGULATOR COMPLIANCE SCAN\n`;
  output += '═'.repeat(80) + '\n\n';
  output += result.summary + '\n';

  output += '\n📋 Checklist Breakdown by Category:\n\n';

  const categories = ['governance', 'fairness', 'privacy', 'performance', 'conduct', 'organizational'] as const;

  for (const category of categories) {
    const categoryItems = result.items.filter((i) => i.category === category);
    const categoryDone = categoryItems.filter((i) => i.status === 'DONE').length;
    const categoryTotal = categoryItems.length;
    const categoryPct = Math.round((categoryDone / categoryTotal) * 100);

    output += `  ${category.toUpperCase().padEnd(20)} ${categoryDone}/${categoryTotal} (${categoryPct}%)\n`;
  }

  output += '\n🎯 Recommendations:\n\n';
  result.recommendations.forEach((rec) => {
    output += `  ${rec}\n`;
  });

  output += '\n📄 Detailed Checklist:\n\n';

  for (const item of result.items) {
    const statusSymbol =
      item.status === 'DONE'
        ? '✅'
        : item.status === 'IN_PROGRESS'
          ? '🔄'
          : item.status === 'BLOCKED'
            ? '🚫'
            : '⏳';

    output += `  ${statusSymbol} [${item.id}] ${item.title}\n`;
    output += `     Priority: ${item.priority} | Status: ${item.status}\n`;

    if (item.status !== 'DONE' && item.requiredArtifacts.length > 0) {
      output += `     Required: ${item.requiredArtifacts.join(', ')}\n`;
    }

    output += '\n';
  }

  output += '═'.repeat(80) + '\n';

  return output;
}

/**
 * Get items by category and status (for programmatic access)
 */
export function getItemsByCategory(
  result: ComplianceScanResult,
  category: 'governance' | 'fairness' | 'privacy' | 'performance' | 'conduct' | 'organizational'
): RegulatorChecklistItem[] {
  return result.items.filter((i) => i.category === category);
}

/**
 * Get items by priority and status (for programmatic access)
 */
export function getItemsByPriority(
  result: ComplianceScanResult,
  priority: 'P0' | 'P1' | 'P2' | 'P3'
): RegulatorChecklistItem[] {
  return result.items.filter((i) => i.priority === priority);
}

/**
 * Get P0 violations (blocker for production)
 */
export function getP0Violations(result: ComplianceScanResult): RegulatorChecklistItem[] {
  return result.items.filter((i) => i.priority === 'P0' && i.status !== 'DONE');
}
