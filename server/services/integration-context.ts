/**
 * Integration Context Service
 * Manages context enrichment for all integrations
 * Provides unified data enrichment across HubSpot, OpenAI, scanning services
 */

import { storage } from "../db-storage";
import type { Prospect, ScanJob } from "@shared/schema";

export interface IntegrationContext {
  prospect?: Prospect;
  scanJob?: ScanJob;
  enrichedData?: Record<string, any>;
  hubspotContext?: any;
  scanContext?: any;
}

export class IntegrationContextService {
  /**
   * Build comprehensive context for HubSpot sync
   */
  async buildHubSpotContext(prospectId: string): Promise<IntegrationContext> {
    const prospect = await storage.getProspect(prospectId);
    if (!prospect) throw new Error(`Prospect not found: ${prospectId}`);

    // Get associated scan if any
    const allJobs = await storage.getScanJobs();
    const scanJob = allJobs.find((j) => j.prospectId === prospectId && j.status === "completed");

    // Get violations for risk assessment
    const violations = scanJob ? await storage.getScanResultsByScanJob(scanJob.id) : [];

    return {
      prospect,
      scanJob,
      hubspotContext: {
        companyName: prospect.company,
        website: prospect.website,
        industry: prospect.industry,
        icpScore: prospect.icpScore,
        riskLevel: prospect.riskLevel,
        wcagScore: scanJob?.wcagScore,
        violationCount: violations.length,
        criticalCount: scanJob?.criticalCount || 0,
        lastScanned: scanJob?.completedAt,
      },
    };
  }

  /**
   * Build context for scan operations
   */
  async buildScanContext(prospectId: string): Promise<IntegrationContext> {
    const prospect = await storage.getProspect(prospectId);
    if (!prospect) throw new Error(`Prospect not found: ${prospectId}`);

    // Get previous scans
    const allJobs = await storage.getScanJobs();
    const previousScans = allJobs.filter((j) => j.prospectId === prospectId).sort((a, b) => {
      const aDate = a.completedAt?.getTime() || 0;
      const bDate = b.completedAt?.getTime() || 0;
      return bDate - aDate;
    });

    return {
      prospect,
      scanContext: {
        website: prospect.website,
        company: prospect.company,
        industry: prospect.industry,
        previousScans: previousScans.length,
        lastScan: previousScans[0]?.completedAt,
        trendingRisk: this.calculateRiskTrend(previousScans),
      },
    };
  }

  /**
   * Build context for outreach/email operations
   */
  async buildOutreachContext(prospectId: string): Promise<IntegrationContext> {
    const prospect = await storage.getProspect(prospectId);
    if (!prospect) throw new Error(`Prospect not found: ${prospectId}`);

    const allJobs = await storage.getScanJobs();
    const latestScan = allJobs
      .filter((j) => j.prospectId === prospectId && j.status === "completed")
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0];

    const violations = latestScan ? await storage.getScanResultsByScanJob(latestScan.id) : [];

    return {
      prospect,
      scanJob: latestScan,
      enrichedData: {
        company: prospect.company,
        website: prospect.website,
        industry: prospect.industry,
        wcagScore: latestScan?.wcagScore,
        criticalIssues: violations.filter((v) => v.severity === "critical").length,
        estimatedFixCost: this.estimateRemediationCost(violations),
        estimatedFixTime: this.estimateRemediationTime(violations),
        legalRiskStatement: this.getLegalRiskStatement(latestScan?.criticalCount || 0),
      },
    };
  }

  /**
   * Calculate risk trend from previous scans
   */
  private calculateRiskTrend(scans: ScanJob[]): "improving" | "stable" | "worsening" {
    if (scans.length < 2) return "stable";

    const latest = scans[0];
    const previous = scans[1];

    const latestRisk = latest.criticalCount || 0;
    const previousRisk = previous.criticalCount || 0;

    if (latestRisk < previousRisk) return "improving";
    if (latestRisk > previousRisk) return "worsening";
    return "stable";
  }

  /**
   * Estimate remediation cost based on violations
   */
  private estimateRemediationCost(violations: any[]): string {
    const criticalCount = violations.filter((v) => v.severity === "critical").length;
    const seriousCount = violations.filter((v) => v.severity === "serious").length;

    let costMin = 5000;
    let costMax = 15000;

    costMin += criticalCount * 2000 + seriousCount * 500;
    costMax += criticalCount * 5000 + seriousCount * 2000;

    return `$${costMin.toLocaleString()}-$${costMax.toLocaleString()}`;
  }

  /**
   * Estimate remediation time
   */
  private estimateRemediationTime(violations: any[]): string {
    const totalViolations = violations.length;

    if (totalViolations < 10) return "1-2 weeks";
    if (totalViolations < 25) return "2-4 weeks";
    if (totalViolations < 50) return "4-8 weeks";
    return "8+ weeks";
  }

  /**
   * Generate legal risk statement for outreach
   */
  private getLegalRiskStatement(criticalCount: number): string {
    if (criticalCount > 10)
      return "High: Critical accessibility violations could result in ADA lawsuits. Recent settlements in similar cases range from $50K-$450K.";
    if (criticalCount > 5)
      return "Medium: Accessibility gaps increase legal liability. Proactive remediation recommended to avoid potential litigation.";
    return "Low: Website shows good accessibility practices. Minor improvements would enhance compliance and user experience.";
  }

  /**
   * Get formatted violation summary for communications
   */
  getViolationSummary(violations: any[]): string {
    const critical = violations.filter((v) => v.severity === "critical").length;
    const serious = violations.filter((v) => v.severity === "serious").length;
    const moderate = violations.filter((v) => v.severity === "moderate").length;

    return `${critical} critical, ${serious} serious, ${moderate} moderate accessibility violations found`;
  }
}

export const integrationContextService = new IntegrationContextService();
