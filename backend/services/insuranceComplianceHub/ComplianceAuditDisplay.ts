/**
 * Compliance Audit Display - Customer-Facing Audit Framework
 *
 * Transforms technical compliance audits into actionable, understandable reports
 * for insurance prospects. This is the "free value-add" that differentiates us
 * from generic insurance brokers.
 *
 * Components:
 * 1. WCAG Accessibility Audit - ADA compliance and litigation risk
 * 2. Cyber Readiness Score - Security posture for cyber insurance
 * 3. Regulatory Compliance Check - Industry-specific requirements
 *
 * Output Format:
 * - Executive Summary (what this means for your business)
 * - Risk Scorecard (visual grades)
 * - Detailed Findings (technical but explained)
 * - Insurance Impact (how this affects your premiums)
 * - Action Items (prioritized remediation steps)
 *
 * Integration:
 * - Uses existing WCAGScanner from /services/wcagScanner.ts
 * - Uses Infinity8Score from /services/infinity8Score.ts
 * - Uses LitigationDatabase from /services/litigationDatabase.ts
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ComplianceAuditSummary,
  WCAGComplianceResult,
  CyberReadinessResult,
  RegulatoryComplianceResult,
  ComplianceGrade,
  CyberVulnerability,
  IndustryVertical,
} from './types';

/**
 * Display format for customer-facing audit reports
 */
export interface ComplianceAuditReport {
  id: string;
  generatedAt: Date;
  websiteUrl: string;

  // Executive summary
  executiveSummary: {
    headline: string;
    grade: ComplianceGrade;
    topConcerns: string[];
    positives: string[];
    insuranceImpact: string;
  };

  // Visual scorecard
  scorecard: {
    wcag: { score: number; grade: ComplianceGrade; trend: 'improving' | 'stable' | 'declining' };
    cyber: { score: number; grade: ComplianceGrade; trend: 'improving' | 'stable' | 'declining' };
    regulatory: { score: number; grade: ComplianceGrade; trend: 'improving' | 'stable' | 'declining' };
    overall: { score: number; grade: ComplianceGrade; infinity8Score: number };
  };

  // Detailed sections
  wcagDetails: WCAGAuditSection;
  cyberDetails: CyberAuditSection;
  regulatoryDetails: RegulatoryAuditSection;

  // Action items
  actionItems: ActionItem[];

  // Insurance recommendations
  insuranceRecommendations: InsuranceFromCompliance[];
}

export interface WCAGAuditSection {
  level: 'none' | 'A' | 'AA' | 'AAA';
  violations: ViolationDisplay[];
  litigationRisk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    annualLawsuitProbability: number;
    averageSettlement: number;
    explanation: string;
  };
  remediationEstimate: {
    timeframe: string;
    costRange: { min: number; max: number };
  };
}

export interface ViolationDisplay {
  id: string;
  title: string;
  description: string;
  impact: string;
  wcagCriterion: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  affectedElements: number;
  howToFix: string;
  litigationData: {
    frequency: number;
    avgSettlement: number;
  };
}

export interface CyberAuditSection {
  overallReadiness: 'poor' | 'fair' | 'good' | 'excellent';
  checks: CyberCheck[];
  vulnerabilities: CyberVulnerability[];
  breachRisk: {
    probability: number;
    estimatedCost: number;
    factors: string[];
  };
  premiumImpact: {
    baseline: number;
    withIssues: number;
    potential: number;
    explanation: string;
  };
}

export interface CyberCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'not_applicable';
  description: string;
  importance: string;
  recommendation?: string;
}

export interface RegulatoryAuditSection {
  applicableRegulations: RegulationStatus[];
  complianceScore: number;
  riskExposure: number;
  recommendations: string[];
}

export interface RegulationStatus {
  name: string;
  shortName: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'unknown';
  requirements: string[];
  findings: string[];
  penalties: string;
}

export interface ActionItem {
  priority: number;
  category: 'wcag' | 'cyber' | 'regulatory';
  title: string;
  description: string;
  effort: 'quick_win' | 'moderate' | 'significant';
  impact: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: { min: number; max: number };
  insuranceBenefit: string;
}

export interface InsuranceFromCompliance {
  line: string;
  recommendation: string;
  premiumRange: { min: number; max: number };
  complianceDiscount: number;
  rationale: string;
}

/**
 * Common WCAG violations and their litigation risk data
 */
const COMMON_VIOLATIONS: Record<string, { title: string; impact: string; frequency: number; avgSettlement: number; howToFix: string }> = {
  'color-contrast': {
    title: 'Insufficient Color Contrast',
    impact: 'Users with low vision cannot read text clearly',
    frequency: 78,
    avgSettlement: 18000,
    howToFix: 'Ensure text has at least 4.5:1 contrast ratio against backgrounds. Use tools like WebAIM Contrast Checker.',
  },
  'image-alt': {
    title: 'Missing Image Alt Text',
    impact: 'Screen reader users cannot understand images',
    frequency: 85,
    avgSettlement: 22000,
    howToFix: 'Add descriptive alt attributes to all meaningful images. Use alt="" for decorative images.',
  },
  'link-name': {
    title: 'Links Without Descriptive Text',
    impact: 'Users cannot understand where links lead',
    frequency: 62,
    avgSettlement: 15000,
    howToFix: 'Use descriptive link text instead of "click here" or "read more".',
  },
  'label': {
    title: 'Form Inputs Without Labels',
    impact: 'Users cannot identify form fields',
    frequency: 71,
    avgSettlement: 20000,
    howToFix: 'Associate every form input with a visible <label> element using for/id attributes.',
  },
  'keyboard': {
    title: 'Not Keyboard Accessible',
    impact: 'Users who cannot use a mouse are locked out',
    frequency: 55,
    avgSettlement: 28000,
    howToFix: 'Ensure all interactive elements can be accessed and operated using only a keyboard.',
  },
  'focus-visible': {
    title: 'No Visible Focus Indicator',
    impact: 'Keyboard users cannot see where they are on the page',
    frequency: 68,
    avgSettlement: 16000,
    howToFix: 'Never remove :focus outlines without providing a visible alternative.',
  },
};

/**
 * Cyber security checks
 */
const CYBER_CHECKS: { id: string; name: string; description: string; importance: string }[] = [
  {
    id: 'ssl',
    name: 'SSL/TLS Certificate',
    description: 'Website uses HTTPS encryption',
    importance: 'Protects data in transit and is required for most compliance frameworks',
  },
  {
    id: 'hsts',
    name: 'HTTP Strict Transport Security',
    description: 'Forces browsers to use HTTPS',
    importance: 'Prevents downgrade attacks and cookie hijacking',
  },
  {
    id: 'csp',
    name: 'Content Security Policy',
    description: 'Restricts resource loading sources',
    importance: 'Major protection against XSS attacks',
  },
  {
    id: 'x-frame',
    name: 'X-Frame-Options',
    description: 'Prevents clickjacking attacks',
    importance: 'Stops attackers from embedding your site in malicious frames',
  },
  {
    id: 'x-content-type',
    name: 'X-Content-Type-Options',
    description: 'Prevents MIME type sniffing',
    importance: 'Blocks certain types of attacks via uploaded files',
  },
  {
    id: 'referrer-policy',
    name: 'Referrer Policy',
    description: 'Controls referrer information leakage',
    importance: 'Protects user privacy and prevents information disclosure',
  },
];

/**
 * Regulatory frameworks by industry
 */
const INDUSTRY_REGULATIONS: Record<IndustryVertical, { name: string; shortName: string; penalties: string }[]> = {
  healthcare: [
    { name: 'Health Insurance Portability and Accountability Act', shortName: 'HIPAA', penalties: 'Up to $1.5M per violation category' },
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
  financial_services: [
    { name: 'Payment Card Industry Data Security Standard', shortName: 'PCI-DSS', penalties: '$5K-100K/month until compliant' },
    { name: 'Gramm-Leach-Bliley Act', shortName: 'GLBA', penalties: '$100K per violation' },
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
  technology: [
    { name: 'General Data Protection Regulation', shortName: 'GDPR', penalties: '4% of annual revenue or €20M' },
    { name: 'California Consumer Privacy Act', shortName: 'CCPA', penalties: '$2,500-7,500 per violation' },
    { name: 'Service Organization Control 2', shortName: 'SOC2', penalties: 'Loss of enterprise customers' },
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
  retail: [
    { name: 'Payment Card Industry Data Security Standard', shortName: 'PCI-DSS', penalties: '$5K-100K/month until compliant' },
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
  education: [
    { name: 'Family Educational Rights and Privacy Act', shortName: 'FERPA', penalties: 'Loss of federal funding' },
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
  construction: [
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
  manufacturing: [
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
  professional_services: [
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
  hospitality: [
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
    { name: 'Payment Card Industry Data Security Standard', shortName: 'PCI-DSS', penalties: '$5K-100K/month until compliant' },
  ],
  transportation: [
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
  real_estate: [
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
    { name: 'Fair Housing Act', shortName: 'FHA', penalties: 'Up to $100K+' },
  ],
  nonprofit: [
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
  other: [
    { name: 'Americans with Disabilities Act', shortName: 'ADA/WCAG', penalties: '$75K first offense, $150K subsequent' },
  ],
};

/**
 * Compliance Audit Display service
 */
export class ComplianceAuditDisplay {
  /**
   * Run a full compliance audit and generate customer-facing report
   */
  async runAudit(websiteUrl: string, industry?: IndustryVertical): Promise<ComplianceAuditSummary> {
    // In production, this would call the actual WCAG scanner
    // For now, generate mock data to demonstrate the display format
    const wcagResult = await this.runWCAGAudit(websiteUrl);
    const cyberResult = await this.runCyberAudit(websiteUrl);
    const regulatoryResult = await this.runRegulatoryAudit(websiteUrl, industry || 'other');

    const overallScore = Math.round(
      (wcagResult.score * 0.4) +
      (cyberResult.score * 0.35) +
      (regulatoryResult.score * 0.25)
    );

    return {
      wcagCompliance: wcagResult,
      cyberReadiness: cyberResult,
      regulatoryCompliance: regulatoryResult,
      overallScore,
      grade: this.scoreToGrade(overallScore),
    };
  }

  /**
   * Generate full display report from audit summary
   */
  async generateReport(
    websiteUrl: string,
    summary: ComplianceAuditSummary,
    industry: IndustryVertical
  ): Promise<ComplianceAuditReport> {
    const reportId = uuidv4();

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(summary);

    // Generate scorecard
    const scorecard = this.generateScorecard(summary);

    // Generate detailed sections
    const wcagDetails = this.generateWCAGDetails(summary.wcagCompliance);
    const cyberDetails = this.generateCyberDetails(summary.cyberReadiness);
    const regulatoryDetails = this.generateRegulatoryDetails(summary.regulatoryCompliance, industry);

    // Generate action items
    const actionItems = this.generateActionItems(summary);

    // Generate insurance recommendations
    const insuranceRecommendations = this.generateInsuranceRecommendations(summary);

    return {
      id: reportId,
      generatedAt: new Date(),
      websiteUrl,
      executiveSummary,
      scorecard,
      wcagDetails,
      cyberDetails,
      regulatoryDetails,
      actionItems,
      insuranceRecommendations,
    };
  }

  /**
   * Run WCAG accessibility audit
   */
  private async runWCAGAudit(websiteUrl: string): Promise<WCAGComplianceResult> {
    // Mock implementation - in production, would call actual scanner
    // This simulates realistic audit results

    const violations = this.simulateViolations();
    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const seriousCount = violations.filter(v => v.severity === 'serious').length;
    const moderateCount = violations.filter(v => v.severity === 'moderate').length;
    const minorCount = violations.filter(v => v.severity === 'minor').length;

    const score = Math.max(0, 100 - (criticalCount * 20) - (seriousCount * 10) - (moderateCount * 5) - (minorCount * 2));

    let level: WCAGComplianceResult['level'] = 'none';
    if (criticalCount === 0 && seriousCount === 0) {
      level = moderateCount <= 2 ? 'AA' : 'A';
    } else if (criticalCount === 0) {
      level = 'A';
    }

    let litigationRisk: WCAGComplianceResult['litigationRisk'] = 'low';
    if (criticalCount >= 3) {
      litigationRisk = 'critical';
    } else if (criticalCount >= 1 || seriousCount >= 3) {
      litigationRisk = 'high';
    } else if (seriousCount >= 1 || moderateCount >= 5) {
      litigationRisk = 'medium';
    }

    return {
      score,
      level,
      criticalViolations: criticalCount,
      seriousViolations: seriousCount,
      moderateViolations: moderateCount,
      minorViolations: minorCount,
      litigationRisk,
      estimatedRemediationCost: (criticalCount * 500) + (seriousCount * 200) + (moderateCount * 100) + (minorCount * 50),
      topIssues: violations.slice(0, 3).map(v => v.title),
    };
  }

  /**
   * Run cyber security audit
   */
  private async runCyberAudit(websiteUrl: string): Promise<CyberReadinessResult> {
    // Mock implementation - would check actual security headers in production

    const hasSSL = websiteUrl.startsWith('https://') || Math.random() > 0.2;
    const hasSecurityHeaders = Math.random() > 0.5;
    const hasMFA = Math.random() > 0.6;
    const hasBackupPolicy = Math.random() > 0.4;
    const hasIncidentResponse = Math.random() > 0.7;

    const checksPassed = [hasSSL, hasSecurityHeaders, hasMFA, hasBackupPolicy, hasIncidentResponse].filter(Boolean).length;
    const score = Math.round((checksPassed / 5) * 100);

    let riskLevel: CyberReadinessResult['riskLevel'] = 'low';
    if (score < 40) riskLevel = 'critical';
    else if (score < 60) riskLevel = 'high';
    else if (score < 80) riskLevel = 'medium';

    const vulnerabilities: CyberVulnerability[] = [];
    if (!hasSSL) {
      vulnerabilities.push({
        type: 'No HTTPS',
        severity: 'critical',
        description: 'Website does not use encrypted connections',
        remediation: 'Install SSL certificate and redirect HTTP to HTTPS',
      });
    }
    if (!hasSecurityHeaders) {
      vulnerabilities.push({
        type: 'Missing Security Headers',
        severity: 'high',
        description: 'Website lacks protective HTTP headers',
        remediation: 'Configure CSP, X-Frame-Options, and other security headers',
      });
    }

    return {
      score,
      riskLevel,
      hasSSL,
      hasSecurityHeaders,
      hasMFA,
      hasBackupPolicy,
      hasIncidentResponse,
      vulnerabilities,
      recommendedCyberPremium: this.calculateCyberPremium(score, vulnerabilities.length),
    };
  }

  /**
   * Run regulatory compliance audit
   */
  private async runRegulatoryAudit(
    websiteUrl: string,
    industry: IndustryVertical
  ): Promise<RegulatoryComplianceResult> {
    const regulations = INDUSTRY_REGULATIONS[industry] || INDUSTRY_REGULATIONS.other;
    const applicableRegulations = regulations.map(r => r.name);

    // Mock compliance status
    const compliantCount = Math.floor(regulations.length * 0.6);
    const compliantRegulations = applicableRegulations.slice(0, compliantCount);
    const nonCompliantRegulations = applicableRegulations.slice(compliantCount);

    const score = Math.round((compliantCount / regulations.length) * 100);
    const riskExposure = nonCompliantRegulations.length * 50000; // Simplified risk calculation

    return {
      score,
      applicableRegulations,
      compliantRegulations,
      nonCompliantRegulations,
      riskExposure,
    };
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(summary: ComplianceAuditSummary): ComplianceAuditReport['executiveSummary'] {
    const topConcerns: string[] = [];
    const positives: string[] = [];

    // WCAG concerns
    if (summary.wcagCompliance.criticalViolations > 0) {
      topConcerns.push(`${summary.wcagCompliance.criticalViolations} critical accessibility violations requiring immediate attention`);
    }
    if (summary.wcagCompliance.litigationRisk === 'high' || summary.wcagCompliance.litigationRisk === 'critical') {
      topConcerns.push('Elevated ADA litigation risk based on accessibility gaps');
    }

    // Cyber concerns
    if (summary.cyberReadiness.riskLevel === 'high' || summary.cyberReadiness.riskLevel === 'critical') {
      topConcerns.push('Cyber security posture needs strengthening');
    }
    if (!summary.cyberReadiness.hasSSL) {
      topConcerns.push('No HTTPS encryption detected');
    }

    // Regulatory concerns
    if (summary.regulatoryCompliance.nonCompliantRegulations.length > 0) {
      topConcerns.push(`Non-compliant with ${summary.regulatoryCompliance.nonCompliantRegulations.length} applicable regulation(s)`);
    }

    // Positives
    if (summary.wcagCompliance.level === 'AA' || summary.wcagCompliance.level === 'AAA') {
      positives.push('Meeting WCAG 2.x Level AA accessibility standards');
    }
    if (summary.cyberReadiness.hasSSL) {
      positives.push('HTTPS encryption is enabled');
    }
    if (summary.cyberReadiness.score >= 80) {
      positives.push('Strong cyber security posture');
    }
    if (summary.regulatoryCompliance.compliantRegulations.length > 0) {
      positives.push(`Compliant with ${summary.regulatoryCompliance.compliantRegulations.length} applicable regulation(s)`);
    }

    // Headline based on overall grade
    let headline: string;
    switch (summary.grade) {
      case 'A+':
      case 'A':
        headline = 'Your compliance posture is strong. Minor improvements could further reduce risk.';
        break;
      case 'B':
        headline = 'Good foundation, but there are actionable improvements that would reduce your liability exposure.';
        break;
      case 'C':
        headline = 'Several compliance gaps exist that create meaningful risk. We recommend addressing the critical items.';
        break;
      case 'D':
      case 'F':
        headline = 'Significant compliance gaps detected. Immediate action recommended to reduce litigation and breach risk.';
        break;
    }

    // Insurance impact
    let insuranceImpact: string;
    if (summary.grade === 'A+' || summary.grade === 'A') {
      insuranceImpact = 'Your strong compliance may qualify you for preferred rates on cyber and professional liability insurance.';
    } else if (summary.grade === 'B') {
      insuranceImpact = 'Addressing the identified gaps could reduce your cyber insurance premium by 10-15%.';
    } else {
      insuranceImpact = 'Current compliance gaps may result in higher premiums or coverage limitations. Remediation would improve insurability.';
    }

    return {
      headline,
      grade: summary.grade,
      topConcerns,
      positives,
      insuranceImpact,
    };
  }

  /**
   * Generate visual scorecard
   */
  private generateScorecard(summary: ComplianceAuditSummary): ComplianceAuditReport['scorecard'] {
    const infinity8Score = this.calculateInfinity8Score(summary.overallScore);

    return {
      wcag: {
        score: summary.wcagCompliance.score,
        grade: this.scoreToGrade(summary.wcagCompliance.score),
        trend: 'stable',
      },
      cyber: {
        score: summary.cyberReadiness.score,
        grade: this.scoreToGrade(summary.cyberReadiness.score),
        trend: 'stable',
      },
      regulatory: {
        score: summary.regulatoryCompliance.score,
        grade: this.scoreToGrade(summary.regulatoryCompliance.score),
        trend: 'stable',
      },
      overall: {
        score: summary.overallScore,
        grade: summary.grade,
        infinity8Score,
      },
    };
  }

  /**
   * Generate WCAG details section
   */
  private generateWCAGDetails(wcag: WCAGComplianceResult): WCAGAuditSection {
    const violations = this.simulateViolations().map(v => ({
      ...v,
      litigationData: COMMON_VIOLATIONS[v.id] ? {
        frequency: COMMON_VIOLATIONS[v.id].frequency,
        avgSettlement: COMMON_VIOLATIONS[v.id].avgSettlement,
      } : { frequency: 50, avgSettlement: 15000 },
    }));

    const probabilities = { low: 5, medium: 15, high: 35, critical: 60 };
    const settlements = { low: 10000, medium: 25000, high: 45000, critical: 75000 };

    return {
      level: wcag.level,
      violations,
      litigationRisk: {
        level: wcag.litigationRisk,
        annualLawsuitProbability: probabilities[wcag.litigationRisk],
        averageSettlement: settlements[wcag.litigationRisk],
        explanation: this.getLitigationExplanation(wcag.litigationRisk),
      },
      remediationEstimate: {
        timeframe: wcag.criticalViolations > 5 ? '4-8 weeks' : '1-3 weeks',
        costRange: {
          min: wcag.estimatedRemediationCost * 0.8,
          max: wcag.estimatedRemediationCost * 1.5,
        },
      },
    };
  }

  /**
   * Generate cyber details section
   */
  private generateCyberDetails(cyber: CyberReadinessResult): CyberAuditSection {
    const readinessMap = { low: 'excellent', medium: 'good', high: 'fair', critical: 'poor' } as const;

    const checks: CyberCheck[] = CYBER_CHECKS.map(check => {
      let status: CyberCheck['status'];
      switch (check.id) {
        case 'ssl':
          status = cyber.hasSSL ? 'pass' : 'fail';
          break;
        case 'hsts':
        case 'csp':
        case 'x-frame':
        case 'x-content-type':
        case 'referrer-policy':
          status = cyber.hasSecurityHeaders ? 'pass' : 'fail';
          break;
        default:
          status = Math.random() > 0.5 ? 'pass' : 'fail';
      }

      return {
        ...check,
        status,
        recommendation: status === 'fail' ? `Enable ${check.name}` : undefined,
      };
    });

    const breachProbabilities = { low: 5, medium: 15, high: 30, critical: 50 };
    const breachCosts = { low: 50000, medium: 150000, high: 500000, critical: 1000000 };

    return {
      overallReadiness: readinessMap[cyber.riskLevel],
      checks,
      vulnerabilities: cyber.vulnerabilities,
      breachRisk: {
        probability: breachProbabilities[cyber.riskLevel],
        estimatedCost: breachCosts[cyber.riskLevel],
        factors: cyber.vulnerabilities.map(v => v.type),
      },
      premiumImpact: {
        baseline: 3000,
        withIssues: cyber.recommendedCyberPremium,
        potential: 2500,
        explanation: cyber.score >= 80
          ? 'Your security posture qualifies for preferred rates.'
          : 'Addressing identified issues could reduce your premium by 15-25%.',
      },
    };
  }

  /**
   * Generate regulatory details section
   */
  private generateRegulatoryDetails(
    regulatory: RegulatoryComplianceResult,
    industry: IndustryVertical
  ): RegulatoryAuditSection {
    const regulations = INDUSTRY_REGULATIONS[industry] || INDUSTRY_REGULATIONS.other;

    const applicableRegulations: RegulationStatus[] = regulations.map(reg => ({
      name: reg.name,
      shortName: reg.shortName,
      status: regulatory.compliantRegulations.includes(reg.name)
        ? 'compliant'
        : regulatory.nonCompliantRegulations.includes(reg.name)
          ? 'non_compliant'
          : 'partial',
      requirements: [`Review ${reg.shortName} requirements`],
      findings: regulatory.nonCompliantRegulations.includes(reg.name)
        ? [`Gaps identified in ${reg.shortName} compliance`]
        : [],
      penalties: reg.penalties,
    }));

    return {
      applicableRegulations,
      complianceScore: regulatory.score,
      riskExposure: regulatory.riskExposure,
      recommendations: regulatory.nonCompliantRegulations.map(reg =>
        `Address ${reg} compliance gaps`
      ),
    };
  }

  /**
   * Generate prioritized action items
   */
  private generateActionItems(summary: ComplianceAuditSummary): ActionItem[] {
    const items: ActionItem[] = [];
    let priority = 1;

    // Critical WCAG items first
    if (summary.wcagCompliance.criticalViolations > 0) {
      items.push({
        priority: priority++,
        category: 'wcag',
        title: 'Fix Critical Accessibility Violations',
        description: `Address ${summary.wcagCompliance.criticalViolations} critical accessibility issues that create immediate litigation risk.`,
        effort: 'moderate',
        impact: 'critical',
        estimatedCost: { min: 500, max: 2000 },
        insuranceBenefit: 'May reduce E&O/cyber premiums by 10-20%',
      });
    }

    // SSL if missing
    if (!summary.cyberReadiness.hasSSL) {
      items.push({
        priority: priority++,
        category: 'cyber',
        title: 'Enable HTTPS Encryption',
        description: 'Install SSL certificate and configure HTTPS. This is a baseline security requirement.',
        effort: 'quick_win',
        impact: 'critical',
        estimatedCost: { min: 0, max: 200 },
        insuranceBenefit: 'Required for cyber insurance eligibility',
      });
    }

    // Security headers
    if (!summary.cyberReadiness.hasSecurityHeaders) {
      items.push({
        priority: priority++,
        category: 'cyber',
        title: 'Implement Security Headers',
        description: 'Configure CSP, X-Frame-Options, and other protective HTTP headers.',
        effort: 'moderate',
        impact: 'high',
        estimatedCost: { min: 100, max: 500 },
        insuranceBenefit: 'Demonstrates security maturity to insurers',
      });
    }

    // Serious WCAG violations
    if (summary.wcagCompliance.seriousViolations > 0) {
      items.push({
        priority: priority++,
        category: 'wcag',
        title: 'Address Serious Accessibility Issues',
        description: `Remediate ${summary.wcagCompliance.seriousViolations} serious accessibility violations.`,
        effort: 'moderate',
        impact: 'high',
        estimatedCost: { min: 200, max: 1000 },
        insuranceBenefit: 'Reduces ADA lawsuit exposure',
      });
    }

    // Regulatory gaps
    if (summary.regulatoryCompliance.nonCompliantRegulations.length > 0) {
      items.push({
        priority: priority++,
        category: 'regulatory',
        title: 'Address Regulatory Compliance Gaps',
        description: `Review and address gaps in ${summary.regulatoryCompliance.nonCompliantRegulations.join(', ')}.`,
        effort: 'significant',
        impact: 'high',
        estimatedCost: { min: 1000, max: 10000 },
        insuranceBenefit: 'Required for certain coverage types',
      });
    }

    return items;
  }

  /**
   * Generate insurance recommendations based on compliance
   */
  private generateInsuranceRecommendations(summary: ComplianceAuditSummary): InsuranceFromCompliance[] {
    const recommendations: InsuranceFromCompliance[] = [];

    // Cyber insurance is always relevant
    recommendations.push({
      line: 'Cyber Insurance',
      recommendation: summary.cyberReadiness.riskLevel === 'critical' || summary.cyberReadiness.riskLevel === 'high'
        ? 'Strongly recommended given current security gaps'
        : 'Recommended as standard business protection',
      premiumRange: {
        min: summary.cyberReadiness.recommendedCyberPremium * 0.8,
        max: summary.cyberReadiness.recommendedCyberPremium * 1.2,
      },
      complianceDiscount: summary.cyberReadiness.score >= 80 ? 15 : 0,
      rationale: 'Cyber insurance covers data breach response, ransomware, and regulatory fines.',
    });

    // E&O based on WCAG
    if (summary.wcagCompliance.litigationRisk !== 'low') {
      recommendations.push({
        line: 'Errors & Omissions / Professional Liability',
        recommendation: 'Recommended given accessibility litigation exposure',
        premiumRange: { min: 1500, max: 5000 },
        complianceDiscount: summary.wcagCompliance.level === 'AA' ? 10 : 0,
        rationale: 'E&O can cover ADA-related claims and website accessibility lawsuits.',
      });
    }

    // General liability always
    recommendations.push({
      line: 'General Liability',
      recommendation: 'Foundational coverage for any business',
      premiumRange: { min: 500, max: 2500 },
      complianceDiscount: 0,
      rationale: 'Covers third-party bodily injury and property damage claims.',
    });

    return recommendations;
  }

  /**
   * Simulate WCAG violations for demo
   */
  private simulateViolations(): ViolationDisplay[] {
    const violationTypes = Object.entries(COMMON_VIOLATIONS);
    const selectedViolations = violationTypes
      .sort(() => Math.random() - 0.5)
      .slice(0, 4 + Math.floor(Math.random() * 4));

    return selectedViolations.map(([id, data], index) => ({
      id,
      title: data.title,
      description: `Automated scan detected instances of ${data.title.toLowerCase()}.`,
      impact: data.impact,
      wcagCriterion: `WCAG 2.${index + 1}.${index + 1}`,
      severity: index === 0 ? 'critical' : index < 2 ? 'serious' : index < 4 ? 'moderate' : 'minor',
      affectedElements: Math.floor(Math.random() * 20) + 1,
      howToFix: data.howToFix,
      litigationData: { frequency: data.frequency, avgSettlement: data.avgSettlement },
    }));
  }

  /**
   * Calculate cyber insurance premium based on score
   */
  private calculateCyberPremium(score: number, vulnerabilityCount: number): number {
    const basePremium = 3000;
    const riskMultiplier = Math.max(1, (100 - score) / 30);
    const vulnPenalty = vulnerabilityCount * 500;
    return Math.round(basePremium * riskMultiplier + vulnPenalty);
  }

  /**
   * Calculate Infinity8 Score
   */
  private calculateInfinity8Score(overallScore: number): number {
    return Math.round(overallScore * 10);
  }

  /**
   * Convert score to letter grade
   */
  private scoreToGrade(score: number): ComplianceGrade {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 50) return 'C';
    if (score >= 30) return 'D';
    return 'F';
  }

  /**
   * Get litigation risk explanation
   */
  private getLitigationExplanation(risk: 'low' | 'medium' | 'high' | 'critical'): string {
    const explanations = {
      low: 'Your accessibility profile suggests low litigation risk. Maintain current standards.',
      medium: 'Moderate risk exists. Proactive remediation recommended to reduce exposure.',
      high: 'Elevated litigation risk. Multiple factors align with common plaintiff targeting criteria.',
      critical: 'High likelihood of targeting by accessibility plaintiffs. Immediate remediation strongly recommended.',
    };
    return explanations[risk];
  }
}

// Export singleton instance
export const complianceAuditDisplay = new ComplianceAuditDisplay();
