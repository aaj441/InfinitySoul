/**
 * Agentic Underwriting System
 * 
 * Replaces human underwriters with AI agents that:
 * 1. Ingest claims data and build loss-ratio graphs
 * 2. Analyze threat intel feeds (CISA, CVE databases, dark web)
 * 3. Price risk in real-time via API (30 seconds vs 30 days)
 * 
 * Based on Kluge Playbook: Fire underwriters, deploy agents, improve loss ratio
 */

import { ClaimRecord } from '../mga/mgaTypes';

/**
 * Risk Assessment Request
 */
export interface RiskAssessmentRequest {
  // Policy Information
  policyId?: string;
  applicantName: string;
  industry: string;
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  annualRevenue: number;
  
  // Security Profile
  securityControls: string[];     // e.g., ['MFA', 'EDR', 'SOC2']
  vulnerabilities?: string[];     // Known CVEs or issues
  lastSecurityAudit?: Date;
  
  // Coverage Request
  coverageAmount: number;
  deductible: number;
  coveragePeriod: number;         // months
  
  // Additional Context
  jurisdiction: string;
  previousClaims?: number;
  
  // Timestamp
  requestedAt: Date;
}

/**
 * Risk Assessment Response
 */
export interface RiskAssessmentResponse {
  requestId: string;
  
  // Pricing
  recommendedPremium: number;     // Monthly premium
  annualPremium: number;
  pricePerDollarCoverage: number; // Premium / coverage
  
  // Risk Analysis
  riskScore: number;              // 0-100 (higher = riskier)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedLossRatio: number;     // Expected claims / premium
  
  // Breakdown
  breakdown: {
    baseRate: number;
    industryAdjustment: number;
    sizeAdjustment: number;
    securityAdjustment: number;
    vulnerabilityPenalty: number;
    claimsHistoryAdjustment: number;
  };
  
  // Decision
  decision: 'approve' | 'approve_with_conditions' | 'decline';
  conditions?: string[];          // Required improvements
  
  // Intelligence
  threatIntelligence: {
    recentCVEs: string[];         // Relevant CVEs for this industry
    attackTrends: string[];       // Current threat landscape
    recommendedControls: string[]; // Missing controls
  };
  
  // Reasoning
  reasoning: string;
  confidenceLevel: number;        // 0-100
  
  // Metadata
  processingTimeMs: number;
  agentVersion: string;
  assessedAt: Date;
}

/**
 * Loss Ratio Graph Node
 * 
 * Represents historical loss data for a specific risk factor
 */
interface LossRatioNode {
  factorType: string;             // e.g., 'industry', 'CVE', 'control'
  factorValue: string;            // e.g., 'healthcare', 'CVE-2021-44228', 'MFA'
  
  // Historical Data
  totalPremium: number;
  totalClaims: number;
  lossRatio: number;              // claims / premium
  claimCount: number;
  
  // Time-based Analysis
  trend: 'improving' | 'stable' | 'worsening';
  recentLossRatio: number;        // Last 90 days
  
  // Confidence
  dataPoints: number;             // Number of historical claims
  confidenceLevel: number;        // 0-100
  
  lastUpdated: Date;
}

/**
 * Threat Intelligence Feed
 */
interface ThreatIntelFeed {
  source: string;                 // 'CISA', 'CVE', 'dark_web', etc.
  alerts: Array<{
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    affectedIndustries: string[];
    affectedAssets: string[];
    description: string;
    publishedAt: Date;
    exploitAvailable: boolean;
  }>;
  lastUpdated: Date;
}

/**
 * Agentic Underwriter Class
 * 
 * Replaces human underwriters with ML-powered agent
 */
export class AgenticUnderwriter {
  private lossRatioGraph: Map<string, LossRatioNode> = new Map();
  private threatIntelFeeds: ThreatIntelFeed[] = [];
  private version = '1.0.0';
  
  constructor() {
    // Initialize with baseline data
    this.initializeLossRatioGraph();
  }
  
  /**
   * Initialize Loss Ratio Graph
   * 
   * Build graph from historical claims data
   */
  private initializeLossRatioGraph() {
    // Baseline industry loss ratios (from market data)
    const industryBaselines = [
      { industry: 'tech', lossRatio: 0.55 },
      { industry: 'healthcare', lossRatio: 0.75 },
      { industry: 'finance', lossRatio: 0.65 },
      { industry: 'retail', lossRatio: 0.80 },
      { industry: 'manufacturing', lossRatio: 0.70 },
      { industry: 'education', lossRatio: 0.60 },
    ];
    
    industryBaselines.forEach(baseline => {
      const key = `industry:${baseline.industry}`;
      this.lossRatioGraph.set(key, {
        factorType: 'industry',
        factorValue: baseline.industry,
        totalPremium: 1000000, // Bootstrap data
        totalClaims: baseline.lossRatio * 1000000,
        lossRatio: baseline.lossRatio,
        claimCount: 100,
        trend: 'stable',
        recentLossRatio: baseline.lossRatio,
        dataPoints: 100,
        confidenceLevel: 70,
        lastUpdated: new Date(),
      });
    });
  }
  
  /**
   * Ingest Claims Data
   * 
   * Update loss ratio graph with new claims
   */
  async ingestClaimsData(claims: ClaimRecord[]): Promise<void> {
    for (const claim of claims) {
      // Update industry node
      this.updateLossRatioNode('industry', claim.industryType, claim);
      
      // Update vulnerability nodes (if available)
      if (claim.vulnerabilities) {
        claim.vulnerabilities.forEach(vuln => {
          this.updateLossRatioNode('vulnerability', vuln, claim);
        });
      }
      
      // Update control nodes (if available)
      if (claim.controls) {
        claim.controls.forEach(control => {
          this.updateLossRatioNode('control', control, claim);
        });
      }
      
      // Update maturity level node
      if (claim.maturityLevel) {
        this.updateLossRatioNode('maturity', claim.maturityLevel, claim);
      }
    }
  }
  
  /**
   * Update Loss Ratio Node
   */
  private updateLossRatioNode(factorType: string, factorValue: string, claim: ClaimRecord) {
    const key = `${factorType}:${factorValue}`;
    const existing = this.lossRatioGraph.get(key);
    
    if (existing) {
      // Update existing node
      existing.totalClaims += claim.lossAmount;
      existing.claimCount += 1;
      existing.lossRatio = existing.totalClaims / existing.totalPremium;
      existing.dataPoints += 1;
      existing.lastUpdated = new Date();
    } else {
      // Create new node
      this.lossRatioGraph.set(key, {
        factorType,
        factorValue,
        totalPremium: 100000, // Bootstrap
        totalClaims: claim.lossAmount,
        lossRatio: claim.lossAmount / 100000,
        claimCount: 1,
        trend: 'stable',
        recentLossRatio: claim.lossAmount / 100000,
        dataPoints: 1,
        confidenceLevel: 30, // Low confidence initially
        lastUpdated: new Date(),
      });
    }
  }
  
  /**
   * Ingest Threat Intelligence
   * 
   * Update threat intel feeds (CISA, CVE, etc.)
   */
  async ingestThreatIntel(feed: ThreatIntelFeed): Promise<void> {
    // Update or add feed
    const existingIndex = this.threatIntelFeeds.findIndex(f => f.source === feed.source);
    if (existingIndex >= 0) {
      this.threatIntelFeeds[existingIndex] = feed;
    } else {
      this.threatIntelFeeds.push(feed);
    }
    
    // Update loss ratio graph with new threat data
    feed.alerts.forEach(alert => {
      alert.affectedIndustries.forEach(industry => {
        const key = `industry:${industry}`;
        const node = this.lossRatioGraph.get(key);
        if (node && alert.severity === 'critical') {
          // Increase risk score for affected industries
          node.recentLossRatio = node.lossRatio * 1.1; // 10% increase
          node.trend = 'worsening';
        }
      });
    });
  }
  
  /**
   * Assess Risk (Main API)
   * 
   * Price risk in real-time (30 seconds vs 30 days)
   */
  async assessRisk(request: RiskAssessmentRequest): Promise<RiskAssessmentResponse> {
    const startTime = Date.now();
    const requestId = `UW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 1. Calculate base rate (from loss ratio graph)
    const baseRate = this.calculateBaseRate(request);
    
    // 2. Industry adjustment
    const industryAdjustment = this.calculateIndustryAdjustment(request.industry);
    
    // 3. Size adjustment
    const sizeAdjustment = this.calculateSizeAdjustment(request.companySize);
    
    // 4. Security controls adjustment
    const securityAdjustment = this.calculateSecurityAdjustment(request.securityControls);
    
    // 5. Vulnerability penalty
    const vulnerabilityPenalty = this.calculateVulnerabilityPenalty(request.vulnerabilities || []);
    
    // 6. Claims history adjustment
    const claimsHistoryAdjustment = this.calculateClaimsHistoryAdjustment(request.previousClaims || 0);
    
    // 7. Calculate total rate
    const totalRate = baseRate + industryAdjustment + sizeAdjustment + 
                      securityAdjustment + vulnerabilityPenalty + claimsHistoryAdjustment;
    
    // 8. Calculate premium
    const annualPremium = Math.max(5000, request.coverageAmount * totalRate); // Min $5K premium
    const monthlyPremium = annualPremium / 12;
    
    // 9. Calculate risk score and predicted loss ratio
    const riskScore = this.calculateRiskScore(request, totalRate);
    const predictedLossRatio = this.predictLossRatio(request);
    
    // 10. Make decision
    const { decision, conditions } = this.makeUnderwritingDecision(riskScore, predictedLossRatio, request);
    
    // 11. Get threat intelligence
    const threatIntelligence = this.getThreatIntelligence(request);
    
    // 12. Generate reasoning
    const reasoning = this.generateReasoning(request, decision, riskScore, predictedLossRatio);
    
    const processingTime = Date.now() - startTime;
    
    return {
      requestId,
      recommendedPremium: Math.round(monthlyPremium),
      annualPremium: Math.round(annualPremium),
      pricePerDollarCoverage: totalRate,
      riskScore: Math.round(riskScore),
      riskLevel: this.getRiskLevel(riskScore),
      predictedLossRatio: Math.round(predictedLossRatio * 100) / 100,
      breakdown: {
        baseRate,
        industryAdjustment,
        sizeAdjustment,
        securityAdjustment,
        vulnerabilityPenalty,
        claimsHistoryAdjustment,
      },
      decision,
      conditions,
      threatIntelligence,
      reasoning,
      confidenceLevel: this.calculateConfidenceLevel(request),
      processingTimeMs: processingTime,
      agentVersion: this.version,
      assessedAt: new Date(),
    };
  }
  
  /**
   * Calculate Base Rate
   */
  private calculateBaseRate(request: RiskAssessmentRequest): number {
    // Base rate: 3% of coverage (industry standard)
    return 0.03;
  }
  
  /**
   * Calculate Industry Adjustment
   */
  private calculateIndustryAdjustment(industry: string): number {
    const key = `industry:${industry}`;
    const node = this.lossRatioGraph.get(key);
    
    if (node) {
      // Adjust based on actual loss ratio vs. base (70%)
      const targetLossRatio = 0.70;
      return (node.lossRatio - targetLossRatio) * 0.05; // ±5% per 100% loss ratio difference
    }
    
    return 0.01; // Unknown industry = slight increase
  }
  
  /**
   * Calculate Size Adjustment
   */
  private calculateSizeAdjustment(size: string): number {
    const sizeMap = {
      small: -0.005,      // Smaller = slightly cheaper
      medium: 0,
      large: 0.005,
      enterprise: 0.010,  // Larger = more expensive (bigger target)
    };
    
    return sizeMap[size as keyof typeof sizeMap] || 0;
  }
  
  /**
   * Calculate Security Adjustment
   */
  private calculateSecurityAdjustment(controls: string[]): number {
    // Each strong control reduces rate by 0.5%
    const strongControls = ['MFA', 'EDR', 'SOC2', 'ISO27001', 'encryption', 'backup'];
    const matchingControls = controls.filter(c => strongControls.includes(c)).length;
    
    return -0.005 * matchingControls; // Max -3% with 6 controls
  }
  
  /**
   * Calculate Vulnerability Penalty
   */
  private calculateVulnerabilityPenalty(vulnerabilities: string[]): number {
    // Each known vulnerability increases rate
    let penalty = 0;
    
    vulnerabilities.forEach(vuln => {
      const key = `vulnerability:${vuln}`;
      const node = this.lossRatioGraph.get(key);
      
      if (node && node.lossRatio > 0.8) {
        // High-risk vulnerability
        penalty += 0.01;
      } else {
        // Unknown/moderate vulnerability
        penalty += 0.005;
      }
    });
    
    return Math.min(0.05, penalty); // Cap at +5%
  }
  
  /**
   * Calculate Claims History Adjustment
   */
  private calculateClaimsHistoryAdjustment(previousClaims: number): number {
    if (previousClaims === 0) return -0.005; // Clean record discount
    if (previousClaims === 1) return 0.005;
    if (previousClaims === 2) return 0.015;
    return 0.03; // 3+ claims = major penalty
  }
  
  /**
   * Calculate Risk Score
   */
  private calculateRiskScore(request: RiskAssessmentRequest, rate: number): number {
    // Convert rate to risk score (0-100)
    const baseScore = (rate / 0.10) * 100; // 10% rate = 100 risk score
    
    // Adjust for controls
    const controlScore = (request.securityControls.length / 6) * 20; // Max 20 points
    
    // Adjust for vulnerabilities
    const vulnPenalty = (request.vulnerabilities?.length || 0) * 10;
    
    return Math.max(0, Math.min(100, baseScore - controlScore + vulnPenalty));
  }
  
  /**
   * Predict Loss Ratio
   */
  private predictLossRatio(request: RiskAssessmentRequest): number {
    const key = `industry:${request.industry}`;
    const node = this.lossRatioGraph.get(key);
    
    if (node) {
      // Use recent trend
      return node.recentLossRatio;
    }
    
    return 0.70; // Default 70% loss ratio
  }
  
  /**
   * Make Underwriting Decision
   */
  private makeUnderwritingDecision(
    riskScore: number,
    lossRatio: number,
    request: RiskAssessmentRequest
  ): { decision: RiskAssessmentResponse['decision']; conditions?: string[] } {
    const conditions: string[] = [];
    
    // High risk
    if (riskScore > 80 || lossRatio > 0.90) {
      return { decision: 'decline' };
    }
    
    // Medium-high risk
    if (riskScore > 60 || lossRatio > 0.80) {
      // Approve with conditions
      if (request.securityControls.length < 3) {
        conditions.push('Implement MFA and EDR within 30 days');
      }
      if (request.vulnerabilities && request.vulnerabilities.length > 0) {
        conditions.push('Remediate all critical vulnerabilities within 60 days');
      }
      return { decision: 'approve_with_conditions', conditions };
    }
    
    // Low-medium risk
    return { decision: 'approve' };
  }
  
  /**
   * Get Threat Intelligence
   */
  private getThreatIntelligence(request: RiskAssessmentRequest): RiskAssessmentResponse['threatIntelligence'] {
    const recentCVEs: string[] = [];
    const attackTrends: string[] = [];
    const recommendedControls: string[] = [];
    
    // Extract relevant threat intel
    this.threatIntelFeeds.forEach(feed => {
      feed.alerts.forEach(alert => {
        if (alert.affectedIndustries.includes(request.industry)) {
          if (alert.id.startsWith('CVE')) {
            recentCVEs.push(alert.id);
          }
          attackTrends.push(alert.description);
        }
      });
    });
    
    // Recommend missing controls
    const essentialControls = ['MFA', 'EDR', 'backup', 'encryption', 'SOC2'];
    essentialControls.forEach(control => {
      if (!request.securityControls.includes(control)) {
        recommendedControls.push(control);
      }
    });
    
    return {
      recentCVEs: recentCVEs.slice(0, 5), // Top 5
      attackTrends: attackTrends.slice(0, 3), // Top 3
      recommendedControls: recommendedControls.slice(0, 3), // Top 3
    };
  }
  
  /**
   * Generate Reasoning
   */
  private generateReasoning(
    request: RiskAssessmentRequest,
    decision: string,
    riskScore: number,
    lossRatio: number
  ): string {
    const industry = request.industry;
    const controls = request.securityControls.length;
    const vulns = request.vulnerabilities?.length || 0;
    
    if (decision === 'decline') {
      return `Risk score ${riskScore} exceeds acceptable threshold. ` +
             `Predicted loss ratio ${(lossRatio * 100).toFixed(0)}% too high for underwriting. ` +
             `Recommend improving security posture before reapplying.`;
    }
    
    if (decision === 'approve_with_conditions') {
      return `Moderate risk (score: ${riskScore}). ${industry} industry shows ${(lossRatio * 100).toFixed(0)}% loss ratio. ` +
             `${controls} security controls in place. ${vulns} vulnerabilities detected. ` +
             `Approval conditional on security improvements.`;
    }
    
    return `Low risk (score: ${riskScore}). ${industry} industry well-controlled with ${controls} security controls. ` +
           `Predicted loss ratio ${(lossRatio * 100).toFixed(0)}%. Approved for coverage.`;
  }
  
  /**
   * Get Risk Level
   */
  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
  
  /**
   * Calculate Confidence Level
   */
  private calculateConfidenceLevel(request: RiskAssessmentRequest): number {
    const key = `industry:${request.industry}`;
    const node = this.lossRatioGraph.get(key);
    
    if (node) {
      return node.confidenceLevel;
    }
    
    return 50; // Default moderate confidence
  }
  
  /**
   * Get Loss Ratio Statistics
   */
  getLossRatioStats(): {
    totalNodes: number;
    avgLossRatio: number;
    topRiskFactors: Array<{ factor: string; lossRatio: number }>;
  } {
    const nodes = Array.from(this.lossRatioGraph.values());
    
    const avgLossRatio = nodes.reduce((sum, n) => sum + n.lossRatio, 0) / nodes.length;
    
    const topRiskFactors = nodes
      .sort((a, b) => b.lossRatio - a.lossRatio)
      .slice(0, 10)
      .map(n => ({
        factor: `${n.factorType}:${n.factorValue}`,
        lossRatio: Math.round(n.lossRatio * 100) / 100,
      }));
    
    return {
      totalNodes: nodes.length,
      avgLossRatio: Math.round(avgLossRatio * 100) / 100,
      topRiskFactors,
    };
  }
}

/**
 * Singleton instance
 */
export const underwriter = new AgenticUnderwriter();
