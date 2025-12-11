/**
 * Risk Feature Extractor
 *
 * Extracts and processes features for lawsuit risk prediction.
 * Transforms company data into a feature vector for ML models.
 */

import { logger } from '../../../utils/logger';
import { PACERFiling } from '../lawsuitMonitor/pacerFeed';

export interface CompanyProfile {
  domain: string;
  industry: string;
  state: string;
  jurisdiction?: string;
  violations: Array<{
    type: string;
    severity: 'critical' | 'serious' | 'moderate' | 'minor';
    count: number;
  }>;
  violationHistory?: Array<{
    date: Date;
    violationCount: number;
  }>;
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  revenue?: number;
  employeeCount?: number;
  cms?: string; // Content Management System
  lastRedesign?: Date;
  hasAccessibilityStatement: boolean;
  hasCompliantFooter: boolean;
  wcagLevel?: '2.0-A' | '2.0-AA' | '2.1-A' | '2.1-AA' | '2.2-A' | '2.2-AA';
}

export interface RiskFeatures {
  // Violation features (20 features)
  violationTrend: number; // -1 to 1 (improving to worsening)
  criticalViolationCount: number;
  seriousViolationCount: number;
  moderateViolationCount: number;
  minorViolationCount: number;
  totalViolationCount: number;
  violationDiversity: number; // 0-1 (how many different types)
  violationSeverityScore: number; // 0-100

  // Industry features (10 features)
  industryDensity: number; // lawsuits per company in industry
  industryRiskScore: number; // 0-100
  industryFilingVelocity: number; // filings per month

  // Jurisdiction features (8 features)
  jurisdictionRisk: number; // 0-100
  jurisdictionFilingRate: number; // filings per month
  jurisdictionPlaintiffFriendly: number; // 0 or 1

  // Plaintiff proximity (7 features)
  plaintiffProximityScore: number; // 0-100
  nearbyPlaintiffCount: number; // plaintiffs in same jurisdiction/industry
  serialPlaintiffActivityLevel: number; // 0-100

  // Company characteristics (7 features)
  cmsRisk: number; // 0-1 (some CMS are higher risk)
  companySizeRisk: number; // 0-1
  revenueRisk: number; // 0-1
  employeeCountRisk: number; // 0-1

  // Temporal features (5 features)
  daysSinceRedesign: number;
  seasonalityFactor: number; // 0-1 (some months see more filings)
  economicSensitivity: number; // 0-1 (recession correlation)

  // Compliance indicators (5 features)
  hasAccessibilityStatement: number; // 0 or 1
  hasCompliantFooter: number; // 0 or 1
  wcagLevelNumeric: number; // 0-6 (none to 2.2 AA)
  remediationVelocity: number; // violations fixed per month
  complianceImprovement: number; // -1 to 1

  // Metadata
  extractedAt: Date;
  featureVersion: string;
}

export class RiskFeatureExtractor {
  private featureVersion: string = 'v3.0';

  /**
   * Extract full feature set from company profile
   */
  extractFeatures(
    company: CompanyProfile,
    industryData?: { filings: PACERFiling[]; totalCompanies: number },
    jurisdictionData?: { filings: PACERFiling[]; characteristics: any }
  ): RiskFeatures {
    logger.debug(`Extracting features for ${company.domain}`);

    return {
      // Violation features
      ...this.extractViolationFeatures(company),

      // Industry features
      ...this.extractIndustryFeatures(company, industryData),

      // Jurisdiction features
      ...this.extractJurisdictionFeatures(company, jurisdictionData),

      // Plaintiff proximity
      ...this.extractPlaintiffProximityFeatures(company),

      // Company characteristics
      ...this.extractCompanyFeatures(company),

      // Temporal features
      ...this.extractTemporalFeatures(company),

      // Compliance indicators
      ...this.extractComplianceFeatures(company),

      // Metadata
      extractedAt: new Date(),
      featureVersion: this.featureVersion
    };
  }

  /**
   * Extract violation-related features
   */
  private extractViolationFeatures(company: CompanyProfile) {
    const violations = company.violations || [];

    const criticalCount = violations
      .filter(v => v.severity === 'critical')
      .reduce((sum, v) => sum + v.count, 0);

    const seriousCount = violations
      .filter(v => v.severity === 'serious')
      .reduce((sum, v) => sum + v.count, 0);

    const moderateCount = violations
      .filter(v => v.severity === 'moderate')
      .reduce((sum, v) => sum + v.count, 0);

    const minorCount = violations
      .filter(v => v.severity === 'minor')
      .reduce((sum, v) => sum + v.count, 0);

    const totalCount = criticalCount + seriousCount + moderateCount + minorCount;

    // Calculate violation severity score (weighted)
    const severityScore = (
      criticalCount * 10 +
      seriousCount * 5 +
      moderateCount * 2 +
      minorCount * 1
    );

    // Calculate violation diversity
    const uniqueTypes = new Set(violations.map(v => v.type)).size;
    const violationDiversity = totalCount > 0 ? uniqueTypes / violations.length : 0;

    // Calculate violation trend
    const violationTrend = this.calculateViolationTrend(company.violationHistory || []);

    // Calculate remediation velocity
    const remediationVelocity = this.calculateRemediationVelocity(company.violationHistory || []);

    // Calculate compliance improvement
    const complianceImprovement = violationTrend > 0 ? -1 : Math.abs(violationTrend);

    return {
      violationTrend,
      criticalViolationCount: criticalCount,
      seriousViolationCount: seriousCount,
      moderateViolationCount: moderateCount,
      minorViolationCount: minorCount,
      totalViolationCount: totalCount,
      violationDiversity,
      violationSeverityScore: Math.min(severityScore, 100),
      remediationVelocity,
      complianceImprovement
    };
  }

  /**
   * Extract industry-related features
   */
  private extractIndustryFeatures(
    company: CompanyProfile,
    industryData?: { filings: PACERFiling[]; totalCompanies: number }
  ) {
    if (!industryData) {
      return {
        industryDensity: 0,
        industryRiskScore: 50,
        industryFilingVelocity: 0
      };
    }

    const filings = industryData.filings;
    const totalCompanies = industryData.totalCompanies;

    // Calculate industry density (filings per 1000 companies)
    const industryDensity = totalCompanies > 0
      ? (filings.length / totalCompanies) * 1000
      : 0;

    // Calculate filing velocity (last 30 days)
    const now = new Date();
    const recentFilings = filings.filter(f =>
      (now.getTime() - f.filingDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
    );
    const industryFilingVelocity = recentFilings.length;

    // Calculate risk score
    let industryRiskScore = 0;
    if (industryDensity > 10) industryRiskScore = 90;
    else if (industryDensity > 5) industryRiskScore = 70;
    else if (industryDensity > 2) industryRiskScore = 50;
    else if (industryDensity > 0.5) industryRiskScore = 30;
    else industryRiskScore = 10;

    return {
      industryDensity,
      industryRiskScore,
      industryFilingVelocity
    };
  }

  /**
   * Extract jurisdiction-related features
   */
  private extractJurisdictionFeatures(
    company: CompanyProfile,
    jurisdictionData?: { filings: PACERFiling[]; characteristics: any }
  ) {
    if (!jurisdictionData) {
      return {
        jurisdictionRisk: 50,
        jurisdictionFilingRate: 0,
        jurisdictionPlaintiffFriendly: 0
      };
    }

    const filings = jurisdictionData.filings;
    const characteristics = jurisdictionData.characteristics;

    // Calculate filing rate (per month)
    const monthsSpan = 12; // Last year
    const jurisdictionFilingRate = filings.length / monthsSpan;

    // Determine plaintiff friendly (settlement rate > 70%)
    const settledCases = filings.filter(f => f.status === 'settled').length;
    const resolvedCases = filings.filter(f => f.status !== 'ongoing').length;
    const jurisdictionPlaintiffFriendly = resolvedCases > 10 && (settledCases / resolvedCases) > 0.7 ? 1 : 0;

    // Calculate risk score
    let jurisdictionRisk = 0;
    if (jurisdictionFilingRate > 20) jurisdictionRisk = 90;
    else if (jurisdictionFilingRate > 10) jurisdictionRisk = 70;
    else if (jurisdictionFilingRate > 5) jurisdictionRisk = 50;
    else if (jurisdictionFilingRate > 1) jurisdictionRisk = 30;
    else jurisdictionRisk = 10;

    if (jurisdictionPlaintiffFriendly) jurisdictionRisk += 10;

    return {
      jurisdictionRisk: Math.min(jurisdictionRisk, 100),
      jurisdictionFilingRate,
      jurisdictionPlaintiffFriendly
    };
  }

  /**
   * Extract plaintiff proximity features
   */
  private extractPlaintiffProximityFeatures(company: CompanyProfile) {
    // This would use data from plaintiffTracker
    // For now, return default values
    return {
      plaintiffProximityScore: 0,
      nearbyPlaintiffCount: 0,
      serialPlaintiffActivityLevel: 0
    };
  }

  /**
   * Extract company characteristic features
   */
  private extractCompanyFeatures(company: CompanyProfile) {
    // CMS risk mapping
    const cmsRiskMap: Record<string, number> = {
      'wordpress': 0.7,
      'wix': 0.6,
      'squarespace': 0.5,
      'shopify': 0.4,
      'custom': 0.3,
      'unknown': 0.5
    };

    const cmsRisk = cmsRiskMap[company.cms?.toLowerCase() || 'unknown'] || 0.5;

    // Company size risk (larger = higher risk)
    const sizeRiskMap = {
      'small': 0.2,
      'medium': 0.5,
      'large': 0.8,
      'enterprise': 0.9
    };

    const companySizeRisk = sizeRiskMap[company.companySize];

    // Revenue risk (normalize)
    const revenueRisk = company.revenue
      ? Math.min(company.revenue / 100000000, 1) // Normalize to $100M
      : 0.5;

    // Employee count risk (normalize)
    const employeeCountRisk = company.employeeCount
      ? Math.min(company.employeeCount / 10000, 1) // Normalize to 10K employees
      : 0.5;

    return {
      cmsRisk,
      companySizeRisk,
      revenueRisk,
      employeeCountRisk
    };
  }

  /**
   * Extract temporal features
   */
  private extractTemporalFeatures(company: CompanyProfile) {
    // Days since redesign
    const daysSinceRedesign = company.lastRedesign
      ? (Date.now() - company.lastRedesign.getTime()) / (1000 * 60 * 60 * 24)
      : 365; // Default to 1 year if unknown

    // Seasonality factor (some months see more filings)
    const month = new Date().getMonth();
    const seasonalityMap = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.8, 0.9, 0.6];
    const seasonalityFactor = seasonalityMap[month];

    // Economic sensitivity (placeholder - would use actual economic indicators)
    const economicSensitivity = 0.5;

    return {
      daysSinceRedesign,
      seasonalityFactor,
      economicSensitivity
    };
  }

  /**
   * Extract compliance indicator features
   */
  private extractComplianceFeatures(company: CompanyProfile) {
    // WCAG level to numeric
    const wcagLevelMap: Record<string, number> = {
      '2.0-A': 1,
      '2.0-AA': 2,
      '2.1-A': 3,
      '2.1-AA': 4,
      '2.2-A': 5,
      '2.2-AA': 6
    };

    const wcagLevelNumeric = company.wcagLevel
      ? wcagLevelMap[company.wcagLevel]
      : 0;

    return {
      hasAccessibilityStatement: company.hasAccessibilityStatement ? 1 : 0,
      hasCompliantFooter: company.hasCompliantFooter ? 1 : 0,
      wcagLevelNumeric
    };
  }

  /**
   * Calculate violation trend from history
   */
  private calculateViolationTrend(history: Array<{ date: Date; violationCount: number }>): number {
    if (history.length < 2) return 0;

    // Sort by date
    const sorted = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Compare first half to second half
    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, h) => sum + h.violationCount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, h) => sum + h.violationCount, 0) / secondHalf.length;

    if (firstAvg === 0) return 0;

    // Return normalized trend (-1 to 1)
    return Math.max(-1, Math.min(1, (secondAvg - firstAvg) / firstAvg));
  }

  /**
   * Calculate remediation velocity
   */
  private calculateRemediationVelocity(history: Array<{ date: Date; violationCount: number }>): number {
    if (history.length < 2) return 0;

    // Sort by date
    const sorted = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate violations fixed per month
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const violationsFixed = first.violationCount - last.violationCount;
    const monthsSpan = Math.max(
      (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24 * 30),
      1
    );

    return Math.max(0, violationsFixed / monthsSpan);
  }
}

/**
 * Singleton instance
 */
export const featureExtractor = new RiskFeatureExtractor();
